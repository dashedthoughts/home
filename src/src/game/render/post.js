// Post-processing for REDLINE. One photometric chain, all in linear HDR until the very end:
//
//   scene (HDR, + depth texture)
//   → exposure meter (64×32 log-luminance, GPU-only eye adaptation, no read-back)
//   → wet-road reflections (half-res screen-space march along the mirrored ray, then a vertical-heavy blur)
//   → bloom (soft-knee threshold in linear HDR, anti-firefly prefilter) + a faint anamorphic streak on the hottest lights
//   → finish: reflection composite (Fresnel, roughness, puddles, fog) · height haze in the district's colour ·
//             lens (speed blur, CA, glitch, flash) · exposure · tone map · sRGB · vignette · grain
//   → anti-aliasing on the display-referred image (SMAA, or FXAA on the cheapest tier)
//
// Quality knobs (from config.js QUALITY): samples (MSAA), aa ('smaa' | 'fxaa'), reflect (0 off | 1 on), streak (bool).
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { U } from './materials.js';

// tone-mapping operators compared on REDLINE frames (see the v3 lighting report): Neutral keeps neon hue and saturation
// up to the shoulder and only then rolls toward white; ACES shifts magenta to pink and burns hot reds to orange-white;
// AgX desaturates every bright emitter toward pastel. 1 = ACES, 2 = AgX, 3 = Neutral.
export const TONEMAPS = { aces: 1, agx: 2, neutral: 3 };

const VERT = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const HDR_RT = { type: THREE.HalfFloatType, depthBuffer: false, stencilBuffer: false };

const HASH = /* glsl */ `
float h12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h12(i), h12(i + vec2(1, 0)), f.x), mix(h12(i + vec2(0, 1)), h12(i + vec2(1, 1)), f.x), f.y); }
`;

// ---------------------------------------------------------------- scene pass that also records its own cost
class ScenePass extends RenderPass {
  constructor(scene, camera, stats) { super(scene, camera); this.stats = stats; }
  render(renderer, writeBuffer, readBuffer, dt, mask) {
    const info = renderer.info.render, c0 = info.calls, t0 = info.triangles;
    super.render(renderer, writeBuffer, readBuffer, dt, mask);
    this.stats.sceneCalls = info.calls - c0;
    this.stats.sceneTriangles = info.triangles - t0;
  }
}

// ---------------------------------------------------------------- exposure meter + eye adaptation (GPU only)
class AdaptPass extends Pass {
  constructor() {
    super();
    this.needsSwap = false;
    this.lum = new THREE.WebGLRenderTarget(64, 32, { ...HDR_RT, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter });
    this.lum.texture.generateMipmaps = true;
    this.ping = [0, 1].map(() => new THREE.WebGLRenderTarget(1, 1, { ...HDR_RT, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter }));
    this.cur = 0;
    // 16 taps per meter texel (a 4×4 grid), so a small bright light crossing the frame cannot make the meter flicker
    this.meter = new THREE.ShaderMaterial({
      uniforms: { tDiffuse: { value: null } },
      vertexShader: VERT,
      fragmentShader: /* glsl */ `
        uniform sampler2D tDiffuse; varying vec2 vUv;
        void main(){
          vec2 cell = vec2(1.0 / 64.0, 1.0 / 32.0);
          float s = 0.0;
          for (int y = 0; y < 4; y++) for (int x = 0; x < 4; x++) {
            vec3 c = texture2D(tDiffuse, vUv + (vec2(x, y) - 1.5) * 0.25 * cell).rgb;
            s += log2(dot(c, vec3(0.2126, 0.7152, 0.0722)) + 1e-3);
          }
          gl_FragColor = vec4(s / 16.0, 0.0, 0.0, 1.0);
        }`,
      depthTest: false, depthWrite: false,
    });
    // centre-weighted average of the 8×4 mip, then move toward the target exposure: ~1 s to settle,
    // within ±½ stop of the authored base (key 0.02 = the metered log-average of a typical open-road night frame)
    // a little faster when the scene gets brighter (as eyes do)
    this.adapt = new THREE.ShaderMaterial({
      uniforms: { tLum: { value: this.lum.texture }, tPrev: { value: null }, uDt: { value: 0 }, uKey: { value: 0.02 }, uMin: { value: 0.7 }, uMax: { value: 1.4 }, uReset: { value: 1 }, uOn: { value: 1 } },
      vertexShader: VERT,
      fragmentShader: /* glsl */ `
        uniform sampler2D tLum, tPrev; uniform float uDt, uKey, uMin, uMax, uReset, uOn; varying vec2 vUv;
        void main(){
          float s = 0.0, wsum = 0.0;
          for (int y = 0; y < 4; y++) for (int x = 0; x < 8; x++) {
            vec2 uv = (vec2(x, y) + 0.5) / vec2(8.0, 4.0);
            vec2 c = (uv - vec2(0.5, 0.45)) * vec2(1.0, 1.6);
            float w = exp(-dot(c, c) * 4.0) + 0.15;           // centre-weighted: the road ahead matters most
            s += textureLod(tLum, uv, 3.0).r * w; wsum += w;
          }
          float avg = exp2(s / wsum);
          float target = clamp(uKey / avg, uMin, uMax);
          target = mix(1.0, target, uOn);
          float prev = texture2D(tPrev, vec2(0.5)).r;
          // big changes (a tunnel mouth) settle in ~1 s; small scenery-driven swings drift slowly, so nothing pumps
          float gap = abs(log2(max(target, 1e-3) / max(prev, 1e-3)));
          float rate = mix(0.5, target < prev ? 3.2 : 2.2, smoothstep(0.12, 0.6, gap));
          float e = uReset > 0.5 || prev <= 0.0 ? target : mix(prev, target, 1.0 - exp(-uDt * rate));
          gl_FragColor = vec4(e, 0.0, 0.0, 1.0);
        }`,
      depthTest: false, depthWrite: false,
    });
    this.quad = new FullScreenQuad(this.meter);
    this.dt = 0;
  }
  get texture() { return this.ping[this.cur].texture; }
  render(renderer, writeBuffer, readBuffer) {
    this.meter.uniforms.tDiffuse.value = readBuffer.texture;
    this.quad.material = this.meter;
    renderer.setRenderTarget(this.lum);
    this.quad.render(renderer);
    const prev = this.ping[this.cur], next = this.ping[1 - this.cur];
    const u = this.adapt.uniforms;
    u.tPrev.value = prev.texture;
    u.uDt.value = this.dt;
    this.quad.material = this.adapt;
    renderer.setRenderTarget(next);
    this.quad.render(renderer);
    u.uReset.value = 0;
    this.cur = 1 - this.cur;
  }
  dispose() { this.lum.dispose(); this.ping.forEach((r) => r.dispose()); this.meter.dispose(); this.adapt.dispose(); this.quad.dispose(); }
}

// ---------------------------------------------------------------- wet-road reflections
// For every half-res pixel that lies on the ground plane (found from the depth buffer, bent world included), march the
// mirrored view ray through the depth buffer in view space (quadratic steps + a binary refine). A hit returns the scene
// colour there (soft-clamped, so a lamp can never mirror into a white blob); a ray that stays on screen without a hit
// returns whatever is at its far end (sky, skyline); a ray that leaves the screen returns nothing and the finish pass
// falls back to the sky colour. The result is then blurred, much more along the vertical than across: that is how a
// rough wet road stretches lights. Cost: one half-res pass of ~20 depth taps + three tiny quarter-res blurs.
const STEPS = 14;
class ReflectPass extends Pass {
  constructor(camera) {
    super();
    this.needsSwap = false;
    this.half = new THREE.WebGLRenderTarget(1, 1, HDR_RT);
    this.qa = new THREE.WebGLRenderTarget(1, 1, HDR_RT);
    this.qb = new THREE.WebGLRenderTarget(1, 1, HDR_RT);
    this.resolve = new THREE.ShaderMaterial({
      uniforms: {
        tColor: { value: null }, tDepth: { value: null },
        uProj: { value: camera.projectionMatrix }, uProjInv: { value: camera.projectionMatrixInverse },
        uView: { value: camera.matrixWorldInverse }, uViewInv: { value: camera.matrixWorld },
        uNF: { value: new THREE.Vector2(0.1, 3000) },
        uCurve: U.uCurve, uHill: U.uHill, uRoadZ: { value: 0 }, uRipple: { value: 0.025 }, uClampL: { value: 3.5 },
      },
      vertexShader: VERT,
      fragmentShader: /* glsl */ `
        precision highp float;
        uniform sampler2D tColor, tDepth;
        uniform mat4 uProj, uProjInv, uView, uViewInv;
        uniform vec2 uNF; uniform float uCurve, uHill, uRoadZ, uRipple, uClampL;
        varying vec2 vUv;
        ${HASH}
        float linZ(float d){ return uNF.x * uNF.y / (uNF.y - d * (uNF.y - uNF.x)); }
        vec2 toUv(vec3 q){ vec4 c = uProj * vec4(q, 1.0); return c.xy / c.w * 0.5 + 0.5; }
        void main(){
          gl_FragColor = vec4(0.0);
          float d = texture2D(tDepth, vUv).x;
          if (d >= 1.0) return;
          vec4 vp4 = uProjInv * vec4(vUv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0);
          vec3 vp = vp4.xyz / vp4.w;
          vec3 wp = (uViewInv * vec4(vp, 1.0)).xyz;
          float dd = clamp(-wp.z, 0.0, 1200.0);
          if (abs(wp.y - uHill * dd * dd) > 0.08) return;        // only the ground plane is a mirror
          // a faint, road-anchored ripple in the normal: breaks the mirror up the way water on asphalt does
          vec2 rp = vec2(wp.x - uCurve * dd * dd, wp.z - uRoadZ);
          vec2 nn = vec2(vnoise(rp * vec2(1.3, 0.35)), vnoise(rp * vec2(1.3, 0.35) + 17.3)) - 0.5;
          vec3 nV = normalize(mat3(uView) * normalize(vec3(nn.x * uRipple, 1.0, nn.y * uRipple)));
          vec3 r = reflect(normalize(vp), nV);
          if (r.y < 0.0) return;
          // interleaved-gradient jitter (fixed per pixel, so nothing swims frame to frame): its error is high-frequency
          // and disappears in the blur below, where white noise left speckles at the edges of reflected lights
          float jit = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
          float maxT = 420.0, prevT = 0.0, hitT = -1.0;
          vec2 uv = vUv; bool off = false;
          for (int i = 1; i <= ${STEPS}; i++) {
            float k = (float(i) - 0.5 + jit) / float(${STEPS});
            float t = k * k * maxT;
            vec3 q = vp + r * t;
            uv = toUv(q);
            if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) { off = true; break; }
            float sz = linZ(texture2D(tDepth, uv).x), qz = -q.z;
            float step = t - prevT;
            if (qz > sz + 0.05 && qz - sz < step * 1.6 + 1.5) {
              // binary refine between the last miss and this hit
              float a = prevT, b = t;
              for (int j = 0; j < 4; j++) {
                float m = 0.5 * (a + b); vec3 qm = vp + r * m; vec2 um = toUv(qm);
                if (-qm.z > linZ(texture2D(tDepth, um).x) + 0.05) b = m; else a = m;
              }
              hitT = b; uv = toUv(vp + r * b);
              break;
            }
            prevT = t;
          }
          if (off) return;                                            // left the screen: no information
          vec3 c = texture2D(tColor, uv).rgb;
          float L = dot(c, vec3(0.2126, 0.7152, 0.0722));
          c *= uClampL / (uClampL + L);                               // soft clamp: hot lights stay coloured, never white
          // fade toward the screen border so the reflection never ends on a hard line
          float edge = smoothstep(0.0, 0.06, uv.x) * smoothstep(1.0, 0.94, uv.x) * smoothstep(1.0, 0.9, uv.y);
          gl_FragColor = vec4(c * edge, edge);
        }`,
      depthTest: false, depthWrite: false,
    });
    // separable blur (premultiplied rgb + coverage in alpha). Horizontal is short, vertical is long.
    this.blur = new THREE.ShaderMaterial({
      uniforms: { tDiffuse: { value: null }, uStep: { value: new THREE.Vector2() } },
      vertexShader: VERT,
      fragmentShader: /* glsl */ `
        uniform sampler2D tDiffuse; uniform vec2 uStep; varying vec2 vUv;
        void main(){
          vec4 s = texture2D(tDiffuse, vUv) * 0.2270;
          s += (texture2D(tDiffuse, vUv + uStep * 1.3846) + texture2D(tDiffuse, vUv - uStep * 1.3846)) * 0.3162;
          s += (texture2D(tDiffuse, vUv + uStep * 3.2308) + texture2D(tDiffuse, vUv - uStep * 3.2308)) * 0.0703;
          gl_FragColor = s;
        }`,
      depthTest: false, depthWrite: false,
    });
    this.quad = new FullScreenQuad(this.resolve);
    this.w = this.h = 1;
    this.wet = 0;
  }
  setSize(w, h) {
    this.w = w; this.h = h;
    this.half.setSize(Math.max(1, Math.round(w / 2)), Math.max(1, Math.round(h / 2)));
    this.qa.setSize(Math.max(1, Math.round(w / 4)), Math.max(1, Math.round(h / 4)));
    this.qb.setSize(Math.max(1, Math.round(w / 4)), Math.max(1, Math.round(h / 4)));
  }
  pass(renderer, mat, target) { this.quad.material = mat; renderer.setRenderTarget(target); this.quad.render(renderer); }
  render(renderer, writeBuffer, readBuffer) {
    const u = this.resolve.uniforms;
    u.tColor.value = readBuffer.texture;
    u.tDepth.value = readBuffer.depthTexture;
    this.pass(renderer, this.resolve, this.half);
    const b = this.blur.uniforms, qw = this.qa.width, qh = this.qa.height;
    // rain roughens the water film: lights spread sideways a little too
    b.tDiffuse.value = this.half.texture; b.uStep.value.set((1 + this.wet) / qw, 0);
    this.pass(renderer, this.blur, this.qa);
    b.tDiffuse.value = this.qa.texture; b.uStep.value.set(0, 1.5 / qh);
    this.pass(renderer, this.blur, this.qb);
    b.tDiffuse.value = this.qb.texture; b.uStep.value.set(0, 4 / qh);
    this.pass(renderer, this.blur, this.qa);
    // a last, long vertical pass: lights smear toward the viewer the way they do on a wet road (~±100 px at 1080p)
    b.tDiffuse.value = this.qa.texture; b.uStep.value.set(0, 9 / qh);
    this.pass(renderer, this.blur, this.qb);
  }
  dispose() { [this.half, this.qa, this.qb, this.resolve, this.blur, this.quad].forEach((o) => o.dispose()); }
}

// ---------------------------------------------------------------- anamorphic streak (only the hottest lights)
class StreakPass extends Pass {
  constructor(bloom) {
    super();
    this.needsSwap = false;
    this.bloom = bloom;
    this.a = new THREE.WebGLRenderTarget(1, 1, HDR_RT);
    this.b = new THREE.WebGLRenderTarget(1, 1, HDR_RT);
    this.mat = new THREE.ShaderMaterial({
      uniforms: { tDiffuse: { value: null }, uStep: { value: 0 }, uCut: { value: 0 } },
      vertexShader: VERT,
      fragmentShader: /* glsl */ `
        uniform sampler2D tDiffuse; uniform float uStep, uCut; varying vec2 vUv;
        void main(){
          vec3 s = vec3(0.0); float wsum = 0.0;
          for (int i = -4; i <= 4; i++) {
            float w = exp(-float(i * i) * 0.18);
            vec3 c = texture2D(tDiffuse, vUv + vec2(float(i) * uStep, 0.0)).rgb;
            s += max(c - uCut, 0.0) * w; wsum += w;
          }
          gl_FragColor = vec4(s / wsum, 1.0);
        }`,
      depthTest: false, depthWrite: false,
    });
    this.quad = new FullScreenQuad(this.mat);
  }
  get texture() { return this.a.texture; }
  setSize(w, h) {
    this.a.setSize(Math.max(1, Math.round(w / 4)), Math.max(1, Math.round(h / 8)));
    this.b.setSize(Math.max(1, Math.round(w / 4)), Math.max(1, Math.round(h / 8)));
  }
  render(renderer) {
    const u = this.mat.uniforms, tw = 1 / this.a.width;
    // the bloom's bright pass already holds (light − threshold): cut again, so only the brightest few streak
    u.tDiffuse.value = this.bloom.renderTargetBright.texture; u.uStep.value = tw * 1.5; u.uCut.value = 1.2;
    renderer.setRenderTarget(this.b); this.quad.render(renderer);
    u.tDiffuse.value = this.b.texture; u.uStep.value = tw * 6; u.uCut.value = 0;
    renderer.setRenderTarget(this.a); this.quad.render(renderer);
  }
  dispose() { this.a.dispose(); this.b.dispose(); this.mat.dispose(); this.quad.dispose(); }
}

// ---------------------------------------------------------------- finish: reflections + lens + exposure + tone map
function finishShader({ reflect, streak, tonemap }) {
  return {
    defines: { REFLECT: reflect ? 1 : 0, STREAK: streak ? 1 : 0, TONEMAP: tonemap },
    uniforms: {
      tDiffuse: { value: null }, tDepth: { value: null }, tRefl: { value: null }, tReflBlur: { value: null }, tExp: { value: null },
      tRough: { value: null }, tStreak: { value: null },
      uTime: { value: 0 }, uSpeed: { value: 0 }, uGlitch: { value: 0 }, uFlash: { value: 0 }, uBoost: { value: 0 },
      uGrain: { value: 0.012 }, uAspect: { value: 1.7 }, uLines: { value: 0 },
      uExposure: { value: 0.88 }, uStreakGain: { value: 0.35 },
      uProjInv: { value: null }, uViewInv: { value: null }, uNF: { value: new THREE.Vector2(0.1, 3000) },
      uCurve: U.uCurve, uHill: U.uHill, uFogColor: U.uFogColor, uFogDensity: U.uFogDensity,
      uWet: { value: 0.5 }, uRoadZ: { value: 0 }, uReflGain: { value: 1 }, uFallback: { value: new THREE.Color('#10142a') },
      // height haze: light-polluted air that pools low and thickens with distance (linear HDR colour; engine.js eases it
      // toward the current district's tint). uHazeDens per metre at street level, uHazeH = scale height (m), uHazeSky = band at the horizon
      uHaze: { value: new THREE.Color(0.01, 0.01, 0.02) }, uHazeDens: { value: 0.0012 }, uHazeH: { value: 22 }, uHazeSky: { value: 0.5 },
    },
    vertexShader: VERT,
    fragmentShader: /* glsl */ `
      precision highp float;
      #include <common>
      #include <tonemapping_pars_fragment>
      uniform sampler2D tDiffuse, tDepth, tRefl, tReflBlur, tExp, tRough, tStreak;
      uniform float uTime, uSpeed, uGlitch, uFlash, uBoost, uGrain, uAspect, uLines, uExposure, uStreakGain;
      uniform mat4 uProjInv, uViewInv; uniform vec2 uNF;
      uniform float uCurve, uHill, uFogDensity, uWet, uRoadZ, uReflGain, uHazeDens, uHazeH, uHazeSky;
      uniform vec3 uFogColor, uFallback, uHaze;
      varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      vec3 tm(vec3 c){
        #if TONEMAP == 1
          return ACESFilmicToneMapping(c);
        #elif TONEMAP == 2
          return AgXToneMapping(c);
        #else
          return NeutralToneMapping(c);
        #endif
      }
      void main() {
        vec2 uv = vUv;
        // glitch: horizontal block displacement
        if (uGlitch > 0.0) {
          float row = floor(uv.y * 26.0), t = floor(uTime * 18.0);
          float on = step(1.0 - 0.35 * uGlitch, h(vec2(row, t)));
          uv.x += (h(vec2(t, row)) - 0.5) * 0.12 * on * uGlitch;
        }
        vec2 c = uv - vec2(0.5, 0.56);
        float r = length(c * vec2(uAspect, 1.0));
        // speed: radial blur toward the vanishing point, only at the edges; chromatic aberration only when moving
        float sp = max(0.0, uSpeed - 0.55);
        float blur = sp * sp * 0.05 * smoothstep(0.35, 1.0, r);
        float ca = uSpeed * 0.0022 + uGlitch * 0.008;
        vec3 col;
        vec2 dir = normalize(c + 1e-5) * ca * r;
        if (blur < 0.0005) {
          col = ca < 1e-4 ? texture2D(tDiffuse, uv).rgb : vec3(texture2D(tDiffuse, uv + dir).r, texture2D(tDiffuse, uv).g, texture2D(tDiffuse, uv - dir).b);
        } else {
          col = vec3(0.0);
          for (int i = 0; i < 5; i++) {
            vec2 o = c * (1.0 - blur * float(i) / 4.0);
            col.r += texture2D(tDiffuse, vec2(0.5, 0.56) + o + dir).r;
            col.g += texture2D(tDiffuse, vec2(0.5, 0.56) + o).g;
            col.b += texture2D(tDiffuse, vec2(0.5, 0.56) + o - dir).b;
          }
          col /= 5.0;
        }
        // this pixel's position, from the depth buffer (one tap, shared by the reflections and the haze)
        float d = texture2D(tDepth, vUv).x;
        vec4 vp4 = uProjInv * vec4(vUv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0);
        vec3 vp = vp4.xyz / vp4.w;
        vec3 wp = (uViewInv * vec4(vp, 1.0)).xyz;
        #if REFLECT
        {
          if (d < 1.0) {
            float dd = clamp(-wp.z, 0.0, 1200.0);
            float ground = 1.0 - smoothstep(0.04, 0.08, abs(wp.y - uHill * dd * dd));
            if (ground > 0.0) {
              float xr = wp.x - uCurve * dd * dd;
              float onRoad = 1.0 - smoothstep(5.3, 5.6, abs(xr));
              // the road's own roughness texture (same tile, same scroll as the material): puddles mirror, paint does not
              float tv = (14.0 - wp.z + uRoadZ) / 24.0;
              float rough = texture2D(tRough, vec2(clamp(xr / 10.8 + 0.5, 0.0, 1.0), tv)).g;
              float puddle = 1.0 - smoothstep(0.12, 0.5, rough);
              // wetness: rain soaks everything; a damp night leaves only the puddles; off the road it is matte
              float wet = clamp(uWet * (0.55 + 0.45 * puddle) + puddle * 0.35 * min(uWet * 2.0, 1.0), 0.0, 1.0) * mix(0.2, 1.0, onRoad);
              float ndv = clamp(normalize(uViewInv[3].xyz - wp).y, 0.0, 1.0);
              float F = 0.02 + 0.98 * pow(1.0 - ndv, 5.0);            // Schlick, water F0
              vec4 sharp = texture2D(tRefl, vUv), soft = texture2D(tReflBlur, vUv);
              // standing water is a calmer mirror than soaked asphalt; rain (high uWet) roughens even the puddles
              float rsharp = puddle * (1.0 - 0.45 * uWet) * onRoad;   // off the asphalt: soft only (no half-res blocks)
              vec4 rf = mix(soft, sharp, clamp(rsharp * 0.6, 0.0, 0.6));
              vec3 refl = rf.rgb + uFallback * (1.0 - clamp(rf.a, 0.0, 1.0));
              float fz = uFogDensity * -vp.z, fogT = 1.0 - exp(-fz * fz);   // the same exp² fog the materials use
              col += refl * F * wet * ground * (1.0 - fogT) * uReflGain;
              // the blurred reflection also blooms a little: wet asphalt glows under neon
              col += soft.rgb * F * wet * ground * (1.0 - fogT) * 0.25 * uReflGain;
            }
          }
        }
        #endif
        // height haze (every tier): street-level air glows with the city's light and thins with height, so tower tops
        // stand clear while their feet and the far end of the road melt into the district's colour. On the sky, a band
        // of the same haze sits on the horizon. (Additive glows that write no depth take the haze of what is behind them;
        // the haze starts 40 m out, so near glows are untouched.)
        {
          vec3 camP = uViewInv[3].xyz;
          vec3 ray = wp - camP; float dist = length(ray);
          float amt;
          if (d >= 1.0) amt = uHazeSky * exp(-max(ray.y / max(dist, 1e-3), 0.0) * 16.0);
          else {
            float dd = clamp(-wp.z, 0.0, 1200.0);
            float hAvg = max(0.0, 0.5 * (camP.y + wp.y) - uHill * dd * dd);
            amt = 1.0 - exp(-uHazeDens * max(dist - 40.0, 0.0) * exp(-hAvg / uHazeH));
          }
          // on the sky the haze only ever adds light (a bright dusk horizon must not be dimmed toward the fog colour)
          col = mix(col, d >= 1.0 ? max(col, uHaze) : uHaze, clamp(amt, 0.0, 0.8));
        }
        #if STREAK
          col += texture2D(tStreak, vUv).rgb * vec3(0.55, 0.75, 1.0) * uStreakGain;
        #endif
        // exposure: authored base × eye adaptation
        col *= uExposure * texture2D(tExp, vec2(0.5)).r;
        // cel-anime speed lines: thin radial streaks that flicker at the frame edges
        if (uLines > 0.0) {
          float ang = atan(c.y, c.x * uAspect);
          float id = floor(ang * 90.0), t = floor(uTime * 24.0);
          float on = step(0.86, h(vec2(id, t)));
          float w = smoothstep(0.5, 0.0, abs(fract(ang * 90.0) - 0.5) - 0.38);
          col += vec3(1.0, 0.96, 0.9) * on * w * smoothstep(0.42, 1.0, r) * uLines * 0.28;
        }
        // impact flash & boost rim
        col += vec3(1.0, 0.05, 0.15) * uFlash * smoothstep(0.2, 1.0, r) * 1.5;
        col += vec3(0.0, 0.9, 1.0) * uBoost * smoothstep(0.55, 1.1, r) * 0.6;
        // optical vignette (in light, before the curve)
        col *= 1.0 - smoothstep(0.6, 1.35, r) * 0.5;
        col = tm(max(col, 0.0));
        // display-referred: sRGB, then a very low film grain that lives mostly in the shadows
        vec3 o = sRGBTransferOETF(vec4(col, 1.0)).rgb;
        float lum = dot(o, vec3(0.299, 0.587, 0.114));
        o += (h(gl_FragCoord.xy * 0.731 + fract(uTime * 7.3) * 113.0) - 0.5) * uGrain * (1.0 - lum * 0.8);
        gl_FragColor = vec4(clamp(o, 0.0, 1.0), 1.0);
      }`,
  };
}

// soft-knee bloom prefilter: only the energy above the threshold blooms (no glow fog over every lit window), and a
// Karis-weighted 4-tap average keeps single bright pixels from flickering as they cross pixel boundaries
const KNEE_FRAG = /* glsl */ `
  uniform sampler2D tDiffuse; uniform float luminosityThreshold; uniform float smoothWidth; uniform vec2 uTexel;
  varying vec2 vUv;
  void main(){
    vec3 s = vec3(0.0); float ws = 0.0;
    for (int i = 0; i < 4; i++) {
      vec2 o = vec2(i == 0 || i == 2 ? -1.0 : 1.0, i < 2 ? -1.0 : 1.0);
      vec3 c = texture2D(tDiffuse, vUv + o * uTexel).rgb;
      float w = 1.0 / (1.0 + max(c.r, max(c.g, c.b)));
      s += c * w; ws += w;
    }
    vec3 c = s / ws;
    float br = max(c.r, max(c.g, c.b));
    float k = smoothWidth;
    float soft = clamp(br - luminosityThreshold + k, 0.0, 2.0 * k); soft = soft * soft / (4.0 * k + 1e-4);
    float w = max(soft, br - luminosityThreshold) / max(br, 1e-4);
    gl_FragColor = vec4(c * w, 1.0);
  }`;

export function createPost(renderer, scene, camera, { samples = 0, bloom = 0.5, aa = 'smaa', reflect = 0, streak = false, tonemap = TONEMAPS.neutral } = {}) {
  renderer.toneMapping = THREE.NoToneMapping; // the finish pass tone maps (scene targets are linear HDR)
  renderer.toneMappingExposure = 1;
  const size = renderer.getSize(new THREE.Vector2());
  const pr = renderer.getPixelRatio();
  const stats = { sceneCalls: 0, sceneTriangles: 0 };
  const rt = new THREE.WebGLRenderTarget(size.x * pr, size.y * pr, { type: THREE.HalfFloatType, samples });
  rt.depthTexture = new THREE.DepthTexture(size.x * pr, size.y * pr);
  rt.depthTexture.type = THREE.UnsignedIntType;
  const composer = new EffectComposer(renderer, rt);
  // the composer clones rt for its second buffer, and a cloned DepthTexture shares its GPU texture (same Source):
  // give it its own, or reading this frame's depth while writing the other buffer is a feedback loop
  composer.renderTarget2.depthTexture = new THREE.DepthTexture(size.x * pr, size.y * pr);
  composer.renderTarget2.depthTexture.type = THREE.UnsignedIntType;
  composer.addPass(new ScenePass(scene, camera, stats));
  const adapt = new AdaptPass();
  composer.addPass(adapt);
  const refl = reflect ? new ReflectPass(camera) : null;
  if (refl) composer.addPass(refl);
  // strength scales with the tier's bloom setting; radius is modest so glow hugs the emitter
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(size.x, size.y), 0.55 + bloom * 0.3, 0.32, 1.45);
  bloomPass.highPassUniforms.smoothWidth.value = 0.7;
  bloomPass.highPassUniforms.uTexel = { value: new THREE.Vector2(1 / Math.max(1, size.x * pr), 1 / Math.max(1, size.y * pr)) };
  bloomPass.materialHighPassFilter.dispose();
  bloomPass.materialHighPassFilter = new THREE.ShaderMaterial({ uniforms: bloomPass.highPassUniforms, vertexShader: VERT, fragmentShader: KNEE_FRAG });
  composer.addPass(bloomPass);
  const streakPass = streak ? new StreakPass(bloomPass) : null;
  if (streakPass) composer.addPass(streakPass);
  const fin = new ShaderPass(finishShader({ reflect: !!refl, streak: !!streakPass, tonemap }));
  fin.material.toneMapped = false;
  const fu = fin.uniforms;
  fu.uProjInv.value = camera.projectionMatrixInverse;
  fu.uViewInv.value = camera.matrixWorld;
  fu.tExp.value = null;
  composer.addPass(fin);
  const aaPass = aa === 'smaa' ? new SMAAPass(1, 1) : new ShaderPass(FXAAShader);
  composer.addPass(aaPass);

  // the finish pass needs this frame's depth and reflection textures (composer buffers swap, so wire them per frame)
  const origRender = fin.render.bind(fin);
  fin.render = (r, w, rb, dt, m) => {
    fu.tDepth.value = rb.depthTexture;
    fu.tExp.value = adapt.texture;
    if (refl) { fu.tRefl.value = refl.half.texture; fu.tReflBlur.value = refl.qb.texture; }
    if (streakPass) fu.tStreak.value = streakPass.texture;
    origRender(r, w, rb, dt, m);
  };
  const near = () => { fu.uNF.value.set(camera.near, camera.far); if (refl) refl.resolve.uniforms.uNF.value.set(camera.near, camera.far); };

  return {
    composer,
    lens: fu, // uTime, uSpeed, uGlitch, uFlash, uBoost, uLines (+ the rest of the finish uniforms)
    bloom: bloomPass,
    stats,
    // per-frame road state from the world: wetness 0..1, distance travelled (anchors puddles and ripples), roughness tex
    road(wet, z, roughTex, fallback) {
      fu.uWet.value = wet;
      fu.uRoadZ.value = z % 2400;
      if (roughTex) fu.tRough.value = roughTex;
      if (fallback) fu.uFallback.value.copy(fallback);
      if (refl) { refl.resolve.uniforms.uRoadZ.value = z % 2400; refl.wet = wet; }
    },
    // height haze: linear colour, density per metre at street level, strength of the horizon band on the sky
    haze(color, dens, sky) { fu.uHaze.value.copy(color); fu.uHazeDens.value = dens; fu.uHazeSky.value = sky; },
    // eye adaptation: exposure range around the authored base, and a snap (no fade) after a cut
    adapt(on, snap) { adapt.adapt.uniforms.uOn.value = on; if (snap) adapt.adapt.uniforms.uReset.value = 1; },
    meter: adapt.adapt.uniforms, // uKey, uMin, uMax (tuning)
    setExposure(e) { fu.uExposure.value = e; },
    // test hook: the adapted exposure multiplier the GPU settled on (reads 1 texel back; never called per frame)
    readExposure() {
      const buf = new Uint16Array(4);
      renderer.readRenderTargetPixels(adapt.ping[adapt.cur], 0, 0, 1, 1, buf);
      return THREE.DataUtils.fromHalfFloat(buf[0]);
    },
    setSize(w, h) {
      composer.setPixelRatio(renderer.getPixelRatio());
      composer.setSize(w, h);
      const p = renderer.getPixelRatio(), W = Math.max(1, Math.round(w * p)), H = Math.max(1, Math.round(h * p));
      bloomPass.highPassUniforms.uTexel.value.set(1 / W, 1 / H);
      if (aa !== 'smaa') aaPass.uniforms.resolution.value.set(1 / W, 1 / H);
      fu.uAspect.value = w / h;
    },
    render(dt) {
      near();
      adapt.dt = dt;
      composer.render(dt);
    },
    dispose() {
      composer.dispose();
      for (const p of composer.passes) p.dispose?.();
      rt.depthTexture.dispose();
      composer.renderTarget2.depthTexture?.dispose();
      rt.dispose();
    },
  };
}
