// ITO post: one full-screen pass over the scene render target.
//   ink lines where the object/face ID (alpha) or depth changes (thicker on the hero), slight CMYK plate
//   misregistration on bright edges, diagonal hatching on distant buildings, paper grain, anime speed lines,
//   and the panel frame for a perfect-release freeze.
import * as THREE from 'three';

export function createPost(renderer) {
  const rt = new THREE.WebGLRenderTarget(4, 4, { type: THREE.UnsignedByteType, format: THREE.RGBAFormat, depthBuffer: true, stencilBuffer: false, samples: 0 });
  rt.texture.minFilter = THREE.NearestFilter; rt.texture.magFilter = THREE.NearestFilter; rt.texture.generateMipmaps = false;
  rt.depthTexture = new THREE.DepthTexture(4, 4);
  rt.depthTexture.type = THREE.UnsignedIntType;
  const uniforms = {
    tColor: { value: rt.texture }, tDepth: { value: rt.depthTexture },
    uPx: { value: new THREE.Vector2(1 / 4, 1 / 4) }, uRes: { value: new THREE.Vector2(4, 4) },
    uNear: { value: 0.3 }, uFar: { value: 3000 },
    uLine: { value: 1.4 }, uMis: { value: 1 }, uGrain: { value: 1 }, uHatch: { value: 1 },
    uSpeed: { value: 0 }, uPanel: { value: 0 }, uTime: { value: 0 }, uFrame: { value: 0 }, uBoil: { value: 1 },
    uInk: { value: new THREE.Vector3(0.078, 0.039, 0.165) },
    uFlash: { value: 0 }, uVig: { value: 0.35 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms, depthTest: false, depthWrite: false,
    vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D tColor; uniform sampler2D tDepth; uniform vec2 uPx; uniform vec2 uRes;
      uniform float uNear; uniform float uFar; uniform float uLine; uniform float uMis; uniform float uGrain; uniform float uHatch;
      uniform float uSpeed; uniform float uPanel; uniform float uTime; uniform float uFrame; uniform float uBoil; uniform vec3 uInk; uniform float uFlash; uniform float uVig;
      varying vec2 vUv;
      float lin(float d) { float z = d * 2.0 - 1.0; return 2.0 * uNear * uFar / (uFar + uNear - z * (uFar - uNear)); }
      float hash(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
      float idAt(vec2 uv) { return floor(texture2D(tColor, uv).a * 255.0 + 0.5); }
      // edge strength between centre and a neighbour
      float edge(float idc, float zc, vec2 uv) {
        float id = idAt(uv);
        float z = lin(texture2D(tDepth, uv).x);
        float e = id != idc ? 1.0 : 0.0;
        float dz = abs(z - zc) / max(min(z, zc), 1.0);
        e = max(e, smoothstep(0.06, 0.14, dz) * step(id + idc, 509.0));
        return e;
      }
      void main() {
        vec2 uv = vUv;
        vec4 c0 = texture2D(tColor, uv);
        vec3 col = c0.rgb;
        float idc = floor(c0.a * 255.0 + 0.5);
        float zc = lin(texture2D(tDepth, uv).x);
        bool sky = idc < 0.5;
        // ---- plate misregistration: magenta/cyan plates slip a pixel on bright colour ----
        if (uMis > 0.0) {
          vec2 o = uPx * vec2(1.3, 0.7) * uMis;
          float m = smoothstep(0.55, 0.95, max(col.r, max(col.g, col.b)));
          col.r = mix(col.r, texture2D(tColor, uv + o).r, m);
          col.b = mix(col.b, texture2D(tColor, uv - o).b, m);
        }
        // ---- hatching on far buildings ----
        if (!sky && uHatch > 0.0) {
          float far = smoothstep(240.0, 520.0, zc) * (1.0 - smoothstep(900.0, 1400.0, zc));
          vec2 fc = gl_FragCoord.xy;
          float lum = dot(col, vec3(0.3, 0.55, 0.15));
          float h = step(0.72, fract((fc.x + fc.y) / max(4.0, uLine * 3.4)));
          col = mix(col, col * 0.55, h * far * smoothstep(0.5, 0.15, lum) * uHatch);
        }
        // ---- ink lines ----
        float w = uLine;
        // the hero gets a heavier line so they always read against the city
        vec2 d1 = uPx * w;
        float e = 0.0;
        e += edge(idc, zc, uv + vec2(d1.x, 0.0));
        e += edge(idc, zc, uv - vec2(d1.x, 0.0));
        e += edge(idc, zc, uv + vec2(0.0, d1.y));
        e += edge(idc, zc, uv - vec2(0.0, d1.y));
        float hero = 0.0;
        if (idc >= 232.0 && idc <= 250.0) hero = 1.0;
        vec2 d2 = uPx * w * 2.2;
        float e2 = 0.0;
        for (int k = 0; k < 4; k++) {
          vec2 o = k == 0 ? vec2(d2.x, 0.0) : k == 1 ? vec2(-d2.x, 0.0) : k == 2 ? vec2(0.0, d2.y) : vec2(0.0, -d2.y);
          float idn = idAt(uv + o);
          bool hn = idn >= 232.0 && idn <= 250.0;
          if ((hero > 0.5 || hn) && idn != idc) e2 += 1.0;
        }
        float ink = clamp(e * 0.5, 0.0, 1.0);
        ink = max(ink, clamp(e2 * 0.6, 0.0, 1.0));
        // lines thin out with distance so the skyline doesn't turn to mush
        float fade = mix(1.0, 0.45, smoothstep(150.0, 700.0, zc)) ;
        if (hero > 0.5) fade = 1.0;
        col = mix(col, uInk, ink * fade);
        // ---- speed lines: radial streaks from the centre at high speed (drawn on twos) ----
        if (uSpeed > 0.0) {
          vec2 p = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
          float r = length(p);
          float a = atan(p.y, p.x);
          float band = floor(a * 70.0);
          float n = hash(vec2(band, uFrame));
          float streak = step(0.86, n) * smoothstep(0.42, 0.8, r) * smoothstep(0.0, 0.4, fract(a * 70.0)) * (1.0 - smoothstep(0.6, 1.0, fract(a * 70.0)));
          col = mix(col, vec3(1.0, 0.97, 0.9), streak * uSpeed * 0.38);
        }
        // ---- paper grain + a little vignette ----
        vec2 g = floor(gl_FragCoord.xy / max(1.0, uLine * 0.8));
        float gr = hash(g + uBoil * floor(uFrame)) - 0.5;
        col *= 1.0 + gr * 0.07 * uGrain;
        vec2 q = uv - 0.5;
        col *= 1.0 - dot(q, q) * uVig;
        // ---- panel: perfect release freeze ----
        if (uPanel > 0.0) {
          vec2 px = uv * uRes;
          float m = min(min(px.x, uRes.x - px.x), min(px.y, uRes.y - px.y));
          float bw = uRes.y * 0.035;
          float paper = 1.0 - step(bw, m);
          float rule = step(bw, m) * (1.0 - step(bw + uRes.y * 0.008, m));
          col = mix(col, vec3(0.97, 0.94, 0.86), paper * uPanel);
          col = mix(col, uInk, rule * uPanel);
          // burst behind: halftone radial focus
          vec2 p = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
          float a = atan(p.y, p.x);
          float rays = step(0.5, fract(a * 9.0 / 3.14159));
          col = mix(col, col * 1.18 + vec3(0.06, 0.0, 0.06), rays * smoothstep(0.25, 0.8, length(p)) * uPanel * 0.6);
        }
        col += uFlash;
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  quad.frustumCulled = false;
  const pscene = new THREE.Scene();
  pscene.add(quad);
  const pcam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  return {
    rt, uniforms,
    setSize(w, h) {
      rt.setSize(w, h);
      uniforms.uPx.value.set(1 / w, 1 / h);
      uniforms.uRes.value.set(w, h);
      uniforms.uLine.value = Math.max(1, h / 620);
    },
    render(scene, camera) {
      uniforms.uNear.value = camera.near; uniforms.uFar.value = camera.far;
      renderer.setRenderTarget(rt);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      renderer.render(pscene, pcam);
    },
    dispose() { rt.dispose(); rt.depthTexture?.dispose(); mat.dispose(); quad.geometry.dispose(); },
  };
}
