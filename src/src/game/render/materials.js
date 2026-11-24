// Shaders & material factories for REDLINE.
// The road never actually curves: every world-space vertex ahead of the player is bent sideways
// and up/down by uCurve·d² and uHill·d² ("curved world"). Track curvature lives in the sim;
// the renderer just feeds these two uniforms, so geometry stays dead simple and endless.
import * as THREE from 'three';

export const U = {
  uCurve: { value: 0 },
  uHill: { value: 0 },
  uTime: { value: 0 },
  uFogColor: { value: new THREE.Color('#5a1650') },
  uFogDensity: { value: 0.004 },
};

export const BEND_GLSL = /* glsl */ `
uniform float uCurve;
uniform float uHill;
vec4 bendW(vec4 wp) {
  float d = clamp(-wp.z, 0.0, 1200.0);
  wp.x += uCurve * d * d;
  wp.y += uHill * d * d;
  return wp;
}
`;

const FOG_GLSL = /* glsl */ `
uniform vec3 uFogColor;
uniform float uFogDensity;
float fogF(float depth) { float k = uFogDensity * depth; return 1.0 - exp(-k * k); }
`;

const HASH_GLSL = /* glsl */ `
float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
`;

// Patch any built-in material (Standard/Basic/Physical) so it bends with the world.
export function bend(mat) {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uCurve = U.uCurve;
    shader.uniforms.uHill = U.uHill;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\n' + BEND_GLSL)
      .replace(
        '#include <project_vertex>',
        `vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
  mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
  mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = viewMatrix * bendW( modelMatrix * mvPosition );
gl_Position = projectionMatrix * mvPosition;`,
      );
  };
  mat.customProgramCacheKey = () => 'bend';
  return mat;
}

export const std = (o) => bend(new THREE.MeshStandardMaterial(o));
export const basic = (o) => bend(new THREE.MeshBasicMaterial(o));

// ---------- procedural buildings: windows, floors, neon bands · no textures ----------
export function buildingMaterial({ far = false } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      ...U,
      uWin: { value: [new THREE.Color(), new THREE.Color(), new THREE.Color(), new THREE.Color()] },
      uBase: { value: new THREE.Color('#0b0912') },
      uGain: { value: far ? 0.42 : 1.1 },
      uFar: { value: far ? 1 : 0 },
    },
    vertexShader: /* glsl */ `
      ${BEND_GLSL}
      attribute float aSeed;
      uniform float uFar;
      varying vec3 vLocal; varying vec3 vN; varying float vSeed; varying float vH; varying float vDepth;
      void main() {
        vec3 sc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
        vLocal = position * sc;
        vN = normal; vSeed = aSeed; vH = sc.y;
        vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
        if (uFar < 0.5) wp = bendW(wp);
        vec4 mv = viewMatrix * wp;
        vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      ${FOG_GLSL}
      ${HASH_GLSL}
      uniform vec3 uWin[4]; uniform vec3 uBase; uniform float uGain; uniform float uTime; uniform float uFar;
      varying vec3 vLocal; varying vec3 vN; varying float vSeed; varying float vH; varying float vDepth;
      vec3 pick(float r) { int i = int(floor(r * 3.999)); return i == 0 ? uWin[0] : i == 1 ? uWin[1] : i == 2 ? uWin[2] : uWin[3]; }
      void main() {
        // snap the per-building seed: interpolated varyings carry tiny per-pixel error that the hash would amplify into static
        float seed = floor(vSeed * 997.0 + 0.5) / 997.0;
        vec3 n = normalize(vN);
        float hgt = clamp(vLocal.y / max(vH, 1.0), 0.0, 1.0);
        vec3 col = uBase * (0.75 + 0.5 * hgt);
        if (n.y < 0.5) {
          vec2 uv = abs(n.x) > 0.5 ? vec2(vLocal.z, vLocal.y) : vec2(vLocal.x, vLocal.y);
          vec2 cell = uFar > 0.5 ? vec2(3.0, 4.2) : vec2(2.1, 3.3);
          vec2 id = floor(uv / cell);
          vec2 f = fract(uv / cell);
          float win = smoothstep(0.14, 0.2, f.x) * smoothstep(0.86, 0.8, f.x) * smoothstep(0.2, 0.27, f.y) * smoothstep(0.82, 0.75, f.y);
          float r = h21(id + seed * 17.0);
          float floorOn = step(0.5, h21(vec2(id.y * 1.7, seed * 31.0)));
          float lit = max(step(uFar > 0.5 ? 0.78 : 0.6, r) * floorOn, step(0.95, r));
          // anti-alias: when a window is smaller than ~2px, fade to the facade's average glow
          vec2 fw = fwidth(uv / cell);
          float aa = clamp(max(fw.x, fw.y) * 2.5 - 0.4, 0.0, 1.0);
          win = mix(win, 0.42, aa);
          lit = mix(lit, 0.26, aa);
          r = mix(r, 0.5, aa);
          float flick = 0.9 + 0.1 * sin(uTime * (2.0 + r * 5.0) + r * 40.0);
          vec3 wc = pick(h21(vec2(seed * 9.1, floor(id.y / 3.0))));
          col += wc * win * lit * uGain * (0.45 + 0.9 * r) * flick;
          col += vec3(0.012, 0.012, 0.02) * win;
          // horizontal neon band on some towers
          float bandY = vH * (0.25 + 0.6 * fract(seed * 7.31));
          float band = step(0.7, seed) * (1.0 - smoothstep(0.0, 0.45, abs(vLocal.y - bandY)));
          col += pick(fract(seed * 3.7)) * band * 2.6;
          // crown light
          col += pick(fract(seed * 5.3)) * step(0.55, fract(seed * 11.0)) * smoothstep(vH - 0.8, vH - 0.2, vLocal.y) * 1.8;
        }
        float fog = uFar > 0.5 ? 0.0 : fogF(vDepth);
        gl_FragColor = vec4(mix(col, uFogColor, fog), 1.0);
      }`,
  });
}

// ---------- camera-facing glow billboards (instanced) ----------
export function glowMaterial({ gain = 1, fog = true, bent = true, size = 1 } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: { ...U, uGain: { value: gain }, uFogOn: { value: fog ? 1 : 0 }, uBent: { value: bent ? 1 : 0 }, uSize: { value: size } },
    vertexShader: /* glsl */ `
      ${BEND_GLSL}
      uniform float uBent; uniform float uSize;
      varying vec2 vUv; varying vec3 vCol; varying float vDepth;
      void main() {
        vec4 c = modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        if (uBent > 0.5) c = bendW(c);
        float s = length(instanceMatrix[0].xyz) * uSize;
        vec4 mv = viewMatrix * c;
        mv.xy += position.xy * s;
        vUv = uv;
        #ifdef USE_INSTANCING_COLOR
          vCol = instanceColor;
        #else
          vCol = vec3(1.0);
        #endif
        vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      ${FOG_GLSL}
      uniform float uGain; uniform float uFogOn;
      varying vec2 vUv; varying vec3 vCol; varying float vDepth;
      void main() {
        float d = length(vUv - 0.5) * 2.0;
        float a = pow(max(0.0, 1.0 - d), 2.2) + 0.6 * pow(max(0.0, 1.0 - d), 12.0);
        if (uFogOn > 0.5) a *= 1.0 - fogF(vDepth);
        gl_FragColor = vec4(vCol * a * uGain, 1.0);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

// ---------- flat additive decals on the road: light pools & wet reflection streaks ----------
export function decalMaterial({ shape = 'pool', gain = 1 } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: { ...U, uGain: { value: gain }, uShape: { value: shape === 'pool' ? 0 : 1 } },
    vertexShader: /* glsl */ `
      ${BEND_GLSL}
      varying vec2 vUv; varying vec3 vCol; varying float vDepth;
      void main() {
        vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
        wp = bendW(wp);
        vec4 mv = viewMatrix * wp;
        vUv = uv;
        #ifdef USE_INSTANCING_COLOR
          vCol = instanceColor;
        #else
          vCol = vec3(1.0);
        #endif
        vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      ${FOG_GLSL}
      ${HASH_GLSL}
      uniform float uGain; uniform float uShape; uniform float uTime;
      varying vec2 vUv; varying vec3 vCol; varying float vDepth;
      void main() {
        float a;
        if (uShape < 0.5) {
          float d = length(vUv - 0.5) * 2.0;
          a = pow(max(0.0, 1.0 - d), 1.8);
        } else {
          // streak: tight across, long along; shimmer like broken water
          float x = (vUv.x - 0.5) * 2.0;
          float across = exp(-x * x * 9.0);
          float along = smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.55, vUv.y);
          float ripple = 0.65 + 0.35 * h21(vec2(floor(vUv.y * 40.0), floor(uTime * 12.0)));
          a = across * along * ripple;
        }
        a *= 1.0 - fogF(vDepth);
        gl_FragColor = vec4(vCol * a * uGain, 1.0);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    polygonOffset: true,
    polygonOffsetFactor: -2,
  });
}

// ---------- sky dome ----------
// A night sky over a lit city: a light-pollution dome (horizon colour rising into a dark zenith, a broad warm glow low
// down), a low cloud deck lit from below by the city, and stars only where the clouds and the glow allow.
// Drawn after the opaque pass (world.js sets renderOrder), so only uncovered pixels pay for the clouds.
export function skyMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uZenith: { value: new THREE.Color() },
      uHorizon: { value: new THREE.Color() },
      uGlow: { value: new THREE.Color() },
      uFogC: { value: new THREE.Color() },
      uCityGlow: { value: new THREE.Color() },
      uStars: { value: 0 },
      uCloud: { value: 0.7 },
      uTime: U.uTime,
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      ${HASH_GLSL}
      uniform vec3 uZenith, uHorizon, uGlow, uFogC, uCityGlow; uniform float uStars, uTime, uCloud;
      varying vec3 vDir;
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
      float fbm(vec2 p, float oct){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { if (float(i) >= oct) break; s += a * vn(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p + 3.1; a *= 0.5; } return s; }
      void main() {
        vec3 d = normalize(vDir);
        float y = d.y;
        // light-pollution dome
        vec3 col = mix(uHorizon, uZenith, pow(clamp(y, 0.0, 1.0), 0.42));
        col += uGlow * (exp(-max(y, 0.0) * 14.0) * 0.5 + exp(-max(y, 0.0) * 4.0) * 0.1);
        // low cloud deck, lit from below: bright bellies near the horizon over the city, dark gaps between
        float cov = 0.0;
        if (y > 0.0 && uCloud > 0.0) {
          vec2 cp = d.xz / (y + 0.14) * 0.9 + vec2(uTime * 0.006, uTime * 0.002);
          float oct = mix(3.0, 5.0, smoothstep(0.04, 0.3, y));            // fewer octaves where it is tiny: no shimmer
          float n = fbm(cp, oct);
          cov = smoothstep(0.4, 0.75, n) * smoothstep(0.0, 0.07, y) * uCloud;
          float under = exp(-y * 4.5);
          vec3 cc = uCityGlow * (0.08 + 0.5 * under) * (0.55 + 0.9 * smoothstep(0.45, 0.85, n)) + uZenith * 0.5;
          col = mix(col, cc, cov);
        }
        col = mix(col, uFogC, smoothstep(0.03, -0.02, y));       // below horizon → fog
        // stars: few, faint, hidden by cloud and by the glow near the horizon
        vec2 g = vec2(atan(d.z, d.x) * 180.0, y * 180.0);
        vec2 id = floor(g);
        float s = h21(id);
        float tw = 0.6 + 0.4 * sin(uTime * (1.0 + s * 3.0) + s * 50.0);
        float star = step(0.985, s) * smoothstep(0.5, 0.0, length(fract(g) - 0.5)) * tw;
        col += vec3(star) * uStars * smoothstep(0.12, 0.4, y) * (1.0 - cov) * 1.2;
        gl_FragColor = vec4(col, 1.0);
      }`,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
  });
}

// ---------- moon / sun ----------
export function celestialMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color() }, uSun: { value: 0 }, uGlowC: { value: new THREE.Color() } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      ${HASH_GLSL}
      uniform vec3 uColor, uGlowC; uniform float uSun;
      varying vec2 vUv;
      float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
        return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
      void main() {
        vec2 p = (vUv - 0.5) * 2.0;     // quad is 3× the disc
        float r = length(p) * 3.0;
        float disc = smoothstep(1.0, 0.985, r);
        vec3 col;
        if (uSun > 0.5) {
          // striped sunset disc: gradient top→bottom, slats cut through the lower half
          float t = clamp(p.y * 3.0 * 0.5 + 0.5, 0.0, 1.0);
          col = mix(vec3(1.0, 0.25, 0.55), uColor, t) * 2.2;
          float yy = p.y * 3.0;
          float slat = yy < 0.15 ? step(0.5, fract((yy + 1.0) * (6.0 + (1.0 - yy) * 4.0))) : 1.0;
          disc *= slat;
        } else {
          float n = noise(p * 9.0) * 0.6 + noise(p * 23.0) * 0.4;
          col = uColor * (1.25 - 0.35 * smoothstep(0.45, 0.75, n)) * (0.9 + 0.1 * (1.0 - r));
        }
        float halo = exp(-max(r - 1.0, 0.0) * 2.4) * 0.35 + exp(-max(r - 1.0, 0.0) * 9.0) * 0.4;
        vec3 outc = col * disc + uGlowC * halo * (1.0 - disc);
        gl_FragColor = vec4(outc, 1.0);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  });
}

// ---------- additive particles ----------
export function particleMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uScale: { value: 300 } },
    vertexShader: /* glsl */ `
      attribute vec3 aColor; attribute float aSize;
      uniform float uScale;
      varying vec3 vCol;
      void main() {
        vCol = aColor;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * uScale / max(0.1, -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vCol;
      void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        float a = pow(max(0.0, 1.0 - d), 2.0);
        gl_FragColor = vec4(vCol * a, 1.0);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

// ---------- underglow pool beneath the player car ----------
export function underglowMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color('#00f0ff') }, uGain: { value: 1.6 } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uGain; varying vec2 vUv;
      void main() {
        vec2 p = (vUv - 0.5) * 2.0;
        float d = length(p * vec2(1.0, 0.62));
        float a = pow(max(0.0, 1.0 - d), 1.6);
        gl_FragColor = vec4(uColor * a * uGain, 1.0);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

// =====================================================================================================================
// Tokyo city layer (render/tokyo.js). All fogged like the rest of the scene and bent with the world unless noted.
// =====================================================================================================================

// The road profile: a 256×2 texture that scrolls with the car and says, for every 4 m of road ahead (z = +14 … −1010),
// how high the deck stands over the street, whether it is in a tunnel, how tall the sound barrier is, and what lies below.
//   row 0: r = (deck + 24) / 64 · g = tunnel 0/1 · b = barrier height / 8 · a = river under the road (0..1)
//   row 1: r = palace side on the left (moat, stone wall, trees) · g = park on the right · b = rail line beside · a = water on the bay side
export const PROF = { N: 256, STEP: 4, NEAR: 14 };
export const PROF_GLSL = /* glsl */ `
uniform sampler2D uProf;
vec4 prof0(float z) { return texture2D(uProf, vec2((14.0 - z) / 1024.0, 0.25)); }
vec4 prof1(float z) { return texture2D(uProf, vec2((14.0 - z) / 1024.0, 0.75)); }
float deckOf(vec4 p) { return p.r * 64.0 - 24.0; }
`;
export const CITY = { uProf: { value: null }, uS: { value: 0 }, uAmb: { value: new THREE.Color('#202638') }, uUp: { value: new THREE.Color('#ffb070') },
  uLampCol: { value: new THREE.Color('#ffb35a') }, uLampPhase: { value: 0 }, uTunCol: { value: new THREE.Color('#ffc78e') }, uSky: { value: new THREE.Color('#141c40') },
  uDetail: { value: 1 } };

// ---------- buildings: three stacked tiers (podium, shaft, crown) in one instanced box mesh; facade drawn in the shader ----------
// aKind.x = facade: 0 glass curtain wall · 1 punched office · 2 pencil building · 3 tiled mid-rise · 4 government stone · 5 residential · 6 brick
// aKind.y = share of lit windows · aKind.z = warmth (0 cool fluorescent … 1 warm) · aKind.w = street-level shop glow
// aTier = (top of podium, top of shaft, shaft inset, crown inset) as fractions. Near lit windows get interior mapping:
// a ray into a box room behind the glass, so rooms have depth and parallax as you pass.
export function cityMaterial({ far = false } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: { ...U, ...CITY, uWin: { value: [new THREE.Color(), new THREE.Color(), new THREE.Color(), new THREE.Color()] }, uFar: { value: far ? 1 : 0 }, uGain: { value: far ? 0.7 : 1 } },
    vertexShader: /* glsl */ `
      ${BEND_GLSL}
      attribute float aSeed; attribute float aTid; attribute vec4 aTier; attribute vec4 aKind;
      uniform float uFar;
      varying vec3 vLocal; varying vec3 vN; varying float vSeed; varying vec4 vKind; varying float vH; varying float vDepth; varying vec3 vView; varying vec2 vHalf;
      void main() {
        vec3 sc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
        float y0 = 0.0, y1 = aTier.x, ins = 0.0;
        if (aTid > 1.5) { y0 = aTier.y; y1 = 1.0; ins = aTier.w; }
        else if (aTid > 0.5) { y0 = aTier.x; y1 = aTier.y; ins = aTier.z; }
        if (y1 - y0 < 0.002) { y0 = 0.1; y1 = 0.12; ins = 0.7; }          // unused tier: tucked inside the podium
        vec3 p = vec3(position.x * (1.0 - ins), mix(y0, y1, position.y), position.z * (1.0 - ins));
        vLocal = p * sc;
        vHalf = sc.xz * (1.0 - ins) * 0.5;
        vN = normal; vSeed = aSeed; vKind = aKind; vH = sc.y;
        vec4 wp = modelMatrix * instanceMatrix * vec4(p, 1.0);
        vView = wp.xyz - cameraPosition;
        if (uFar < 0.5) wp = bendW(wp);
        vec4 mv = viewMatrix * wp;
        vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      ${FOG_GLSL}
      ${HASH_GLSL}
      uniform vec3 uWin[4]; uniform float uTime, uFar, uGain, uDetail; uniform vec3 uAmb, uUp, uSky;
      varying vec3 vLocal; varying vec3 vN; varying float vSeed; varying vec4 vKind; varying float vH; varying float vDepth; varying vec3 vView; varying vec2 vHalf;
      // a box room behind the window: f = position inside the cell (0..1), d = view ray in facade space (x along, y up, z into)
      float room(vec2 f, vec3 d, vec2 cell) {
        d.z = max(d.z, 0.04);
        vec3 o = vec3(f * cell, 0.0);
        float D = cell.x * 1.2 + 1.5;
        float tx = (d.x > 0.0 ? cell.x - o.x : -o.x) / (abs(d.x) < 1e-4 ? 1e-4 : d.x);
        float ty = (d.y > 0.0 ? cell.y - o.y : -o.y) / (abs(d.y) < 1e-4 ? 1e-4 : d.y);
        float tz = D / d.z;
        float t = min(min(abs(tx), abs(ty)), tz);
        vec3 hp = o + d * t;
        float sh = t == tz ? 0.8 : (t == abs(ty) ? (d.y > 0.0 ? 1.35 : 0.42) : 0.62);
        // a light panel on the ceiling, a dark desk band on the back wall
        if (t == abs(ty) && d.y > 0.0) sh += 0.9 * smoothstep(0.3, 0.0, abs(hp.z / D - 0.5)) * step(0.2, fract(hp.x / cell.x));
        if (t == tz) sh *= 1.0 - 0.5 * smoothstep(0.32, 0.28, hp.y / cell.y);
        return sh * (1.0 - 0.5 * hp.z / D);
      }
      void main() {
        float seed = floor(vSeed * 997.0 + 0.5) / 997.0;
        float kind = floor(vKind.x + 0.5);
        vec3 n = normalize(vN);
        vec3 V = normalize(vView);
        float y = vLocal.y;
        vec3 col;
        // light falling on the walls: the sky dome, plus the street's glow climbing the lower floors
        vec3 light = uAmb + uUp * (0.05 + 0.42 * exp(-y / 12.0));
        if (n.y > 0.5) {
          // roof: dark membrane, a lighter parapet edge, a helipad on some tall towers
          vec2 r = vLocal.xz;
          float edge = 1.0 - smoothstep(0.0, 0.6, min(vHalf.x - abs(r.x), vHalf.y - abs(r.y)));
          col = vec3(0.05, 0.05, 0.06) * light * 3.0 + edge * vec3(0.12) * light;
          if (vH > 110.0 && fract(seed * 13.7) > 0.45 && kind < 1.5) {
            float rr = length(r);
            float ring = smoothstep(0.35, 0.1, abs(rr - 9.0));
            vec2 a = abs(r);
            float hh = step(a.x, 3.0) * step(a.y, 4.2) * (step(2.0, a.x) + step(a.y, 0.5));
            col += vec3(1.0, 0.75, 0.35) * (ring * 0.35 + hh * 0.25) + vec3(1.0, 0.6, 0.2) * step(0.8, fract(atan(r.y, r.x) * 1.9)) * smoothstep(0.4, 0.0, abs(rr - 10.5)) * 2.0;
          }
        } else if (n.y < -0.5) {
          col = vec3(0.01);
        } else {
          vec3 T = abs(n.x) > 0.5 ? vec3(0.0, 0.0, n.x) : vec3(-n.z, 0.0, 0.0);
          float halfW = abs(n.x) > 0.5 ? vHalf.y : vHalf.x;
          float uu = dot(vLocal, T);
          float u = uu + 512.0;
          // facade recipe per kind: floor height, bay width, window box (x0, x1, y0, y1), wall albedo
          float FH = 3.8, BW = 3.0; vec4 wb = vec4(0.12, 0.88, 0.3, 0.88); vec3 wall = vec3(0.3, 0.3, 0.3);
          if (kind < 0.5) { FH = 4.0; BW = 1.6; wb = vec4(0.04, 0.96, 0.2, 1.0); wall = vec3(0.05, 0.06, 0.07); }
          else if (kind < 1.5) { FH = 3.8; BW = 3.0; wb = vec4(0.14, 0.86, 0.3, 0.88); wall = mix(vec3(0.36, 0.34, 0.31), vec3(0.2, 0.21, 0.23), fract(seed * 5.1)); }
          else if (kind < 2.5) { FH = 3.3; BW = 2.3; wb = vec4(0.1, 0.9, 0.24, 0.84); wall = mix(vec3(0.55, 0.52, 0.47), vec3(0.32, 0.2, 0.15), step(0.5, fract(seed * 3.3))); }
          else if (kind < 3.5) { FH = 3.0; BW = 2.8; wb = vec4(0.02, 0.98, 0.36, 0.8); wall = vec3(0.33, 0.24, 0.18); }
          else if (kind < 4.5) { FH = 3.6; BW = 1.9; wb = vec4(0.22, 0.78, 0.3, 0.84); wall = vec3(0.46, 0.43, 0.37); }
          else if (kind < 5.5) { FH = 3.0; BW = 3.4; wb = vec4(0.03, 0.97, 0.42, 0.95); wall = vec3(0.42, 0.42, 0.4); }
          else { FH = 4.4; BW = 3.0; wb = vec4(0.28, 0.72, 0.3, 0.78); wall = vec3(0.42, 0.15, 0.09); }
          vec2 cell = vec2(BW, FH);
          vec2 g = vec2(u, y) / cell;
          vec2 id = floor(g);
          vec2 f = fract(g);
          vec2 fw = fwidth(g);
          float aa = clamp(max(fw.x, fw.y) * 2.5 - 0.35, 0.0, 1.0);    // windows smaller than ~2 px fade to the facade average
          float win = smoothstep(wb.x - fw.x, wb.x + fw.x, f.x) * smoothstep(wb.y + fw.x, wb.y - fw.x, f.x)
                    * smoothstep(wb.z - fw.y, wb.z + fw.y, f.y) * smoothstep(wb.w + fw.y, wb.w - fw.y, f.y);
          if (kind > 2.5 && kind < 3.5) win *= smoothstep(0.02, 0.06, abs(fract(g.x * 2.0) - 0.5) * 2.0);  // strip windows: mullions
          // who is still up at 3 a.m.: offices light whole floors, homes and bars light single windows
          float floorR = h21(vec2(id.y * 1.37, seed * 31.0));
          float cellR = h21(id + seed * 17.0);
          float litShare = vKind.y;
          float lit;
          if (kind < 1.5 || kind > 3.5 && kind < 4.5) lit = step(1.0 - litShare, floorR) * step(0.18, cellR) + step(0.985, cellR);
          else lit = step(1.0 - litShare, cellR);
          if (y < 4.5) lit = 0.0;                                            // the ground floor is the shop glow below
          vec3 cool = mix(vec3(0.86, 0.93, 1.0), uWin[0], 0.3);
          vec3 warm = mix(vec3(1.0, 0.74, 0.42), uWin[1], 0.3);
          float wsel = h21(vec2(seed * 7.0, id.y * 0.31 + id.x * 0.07));
          vec3 lc = mix(cool, warm, step(1.0 - vKind.z, wsel));
          if (kind > 1.5 && kind < 2.5) lc = mix(lc, mix(uWin[2], uWin[3], fract(cellR * 7.0)) * vec3(1.0, 0.8, 0.9), step(0.6, fract(cellR * 13.0)));
          if (kind > 4.5 && kind < 5.5 && fract(cellR * 23.0) > 0.86) lc = vec3(0.45, 0.6, 1.0) * (0.7 + 0.3 * sin(uTime * 7.0 + cellR * 50.0)); // a TV
          // the glass itself: a dark mirror of the sky, a little different per pane
          float fres = pow(1.0 - abs(dot(V, n)), 3.0);
          vec3 glass = uSky * (0.18 + 0.7 * fres) * (0.6 + 0.6 * h21(id * 0.73 + seed)) + uUp * 0.05 * exp(-y / 20.0) + vec3(0.004, 0.005, 0.008);
          vec3 inside = lc * 0.6 * (0.75 + 0.5 * fract(cellR * 3.7));
          if (uDetail > 0.5 && uFar < 0.5 && vDepth < 170.0 && lit > 0.5 && aa < 0.5) {
            vec3 d = vec3(dot(V, T), V.y, -dot(V, n));
            inside = lc * room(f, d, cell) * 0.58 * (0.75 + 0.5 * fract(cellR * 3.7));
            if (kind > 4.5 && kind < 5.5) inside = mix(inside, lc * 0.7, step(0.62, f.y) * step(0.5, fract(cellR * 5.0)));   // half-drawn curtains
          }
          vec3 wcol = mix(glass, inside, lit) ;
          // faces along the road catch the street light; end faces and the upper floors fall darker (no flat boxes)
          float faceK = (abs(n.x) > 0.5 ? 1.0 : 0.62) * (0.7 + 0.3 * exp(-y / 40.0)) * (0.85 + 0.3 * fract(seed * 41.0));
          col = wall * light * faceK;
          if (kind < 0.5) {
            // curtain wall: thin bright mullions, dark spandrels
            float mull = 1.0 - smoothstep(0.0, 0.05 + fw.x, min(f.x, 1.0 - f.x));
            col = mix(glass * 0.8, vec3(0.08, 0.09, 0.1) * light * 2.0, mull);
          }
          if (kind > 4.5 && kind < 5.5) {   // balconies: a slab edge and a frosted rail lit from the room behind
            float slab = step(f.y, 0.1); float rail = step(0.1, f.y) * step(f.y, 0.4);
            col = mix(col, wall * light * 1.3, slab);
            col = mix(col, glass * 0.6 + lc * lit * 0.12, rail);
          }
          col = mix(col, wcol, win * (1.0 - aa));
          col = mix(col, mix(wall * light, lc * litShare * 0.9 + glass * 0.4, 0.55), aa);
          // street level: shopfronts, brighter where the district says so
          float shop = smoothstep(4.6, 3.6, y) * smoothstep(0.0, 0.6, y);
          col += mix(vec3(1.0, 0.82, 0.58), uWin[2], 0.25) * shop * vKind.w * (0.5 + 0.5 * h21(vec2(floor(u / 4.0), seed)));
          // cyberpunk trim on some towers: an LED crown band and lit corner lines
          float crownB = step(0.55, fract(seed * 11.0)) * step(40.0, vH) * smoothstep(vH - 1.6, vH - 1.0, y) * smoothstep(vH - 0.1, vH - 0.5, y);
          col += mix(uWin[3], uWin[2], step(0.5, fract(seed * 5.3))) * crownB * 1.6;
          float corner = step(0.9, fract(seed * 17.3)) * step(30.0, vH) * (1.0 - smoothstep(0.08, 0.25 + fwidth(uu) * 1.5, halfW - abs(uu)));
          col += mix(uWin[3], uWin[0], fract(seed * 2.9)) * corner * 0.45;
        }
        col *= uGain;
        float fog = uFar > 0.5 ? clamp(1.0 - exp(-vDepth * 0.00042), 0.0, 0.82) : fogF(vDepth);
        gl_FragColor = vec4(mix(col, uFogColor, fog), 1.0);
      }`,
  });
}

// ---------- glow sprites that blink (aviation lights, aircraft): aBlink = (rate Hz, phase, duty, steady floor) ----------
export function blinkGlowMaterial({ gain = 2, fog = false, bent = false, farFog = true } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: { ...U, uGain: { value: gain }, uFogOn: { value: fog ? 1 : 0 }, uBent: { value: bent ? 1 : 0 }, uFarFog: { value: farFog ? 1 : 0 } },
    vertexShader: /* glsl */ `
      ${BEND_GLSL}
      attribute vec4 aBlink;
      uniform float uBent, uTime;
      varying vec2 vUv; varying vec3 vCol; varying float vDepth; varying float vOn;
      void main() {
        vec4 c = modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        if (uBent > 0.5) c = bendW(c);
        float s = length(instanceMatrix[0].xyz);
        vec4 mv = viewMatrix * c;
        // never smaller than ~1.5 px: a distant beacon stays a point of light instead of shimmering away
        float minS = -mv.z * 0.0045;
        mv.xy += position.xy * max(s, minS);
        vUv = uv;
        vCol = instanceColor;
        vOn = aBlink.x > 0.0 ? mix(aBlink.w, 1.0, step(1.0 - aBlink.z, fract(uTime * aBlink.x + aBlink.y))) : 1.0;
        vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      ${FOG_GLSL}
      uniform float uGain, uFogOn, uFarFog;
      varying vec2 vUv; varying vec3 vCol; varying float vDepth; varying float vOn;
      void main() {
        float d = length(vUv - 0.5) * 2.0;
        float a = pow(max(0.0, 1.0 - d), 2.4) + 0.8 * pow(max(0.0, 1.0 - d), 14.0);
        if (uFogOn > 0.5) a *= 1.0 - fogF(vDepth);
        if (uFarFog > 0.5) a *= 1.0 - 0.75 * clamp(1.0 - exp(-vDepth * 0.0003), 0.0, 1.0);
        gl_FragColor = vec4(vCol * a * uGain * vOn, 1.0);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
}

// ---------- signs from one atlas: aRect = uv rect, aAnim = (mode, speed, phase, gain) ----------
// modes: 0 steady · 1 neon tube (buzz, the odd dropout) · 2 blink · 3 LED ticker (scrolls) · 4 chaser bulbs round the edge · 5 hologram
export function atlasMaterial(map, { holo = false, bent = true } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: { ...U, uMap: { value: map }, uHolo: { value: holo ? 1 : 0 }, uBent: { value: bent ? 1 : 0 } },
    vertexShader: /* glsl */ `
      ${BEND_GLSL}
      attribute vec4 aRect; attribute vec4 aAnim;
      uniform float uBent;
      varying vec2 vQ; varying vec4 vRect; varying vec4 vAnim; varying float vDepth;
      void main() {
        vQ = uv; vRect = aRect; vAnim = aAnim;
        vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
        if (uBent > 0.5) wp = bendW(wp);
        vec4 mv = viewMatrix * wp;
        vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      ${FOG_GLSL}
      ${HASH_GLSL}
      uniform sampler2D uMap; uniform float uTime, uHolo;
      varying vec2 vQ; varying vec4 vRect; varying vec4 vAnim; varying float vDepth;
      void main() {
        vec2 q = vQ;
        float mode = floor(vAnim.x + 0.5);
        if (mode > 2.5 && mode < 3.5) q.x = fract(q.x + uTime * vAnim.y + vAnim.z);
        vec4 tx = texture2D(uMap, vRect.xy + clamp(q, 0.002, 0.998) * vRect.zw);
        if (uHolo < 0.5 && tx.a < 0.5) discard;
        float g = vAnim.w;
        if (mode > 0.5 && mode < 1.5) g *= (0.9 + 0.1 * sin(uTime * 53.0 + vAnim.z * 20.0)) * mix(1.0, 0.25, step(0.985, h21(vec2(floor(uTime * 9.0), vAnim.z * 31.0))));
        if (mode > 1.5 && mode < 2.5) g *= mix(0.15, 1.0, step(0.45, fract(uTime * vAnim.y + vAnim.z)));
        vec3 col = tx.rgb * g;
        if (mode > 3.5 && mode < 4.5) {
          vec2 e = min(q, 1.0 - q) * vec2(vRect.z / vRect.w, 1.0);
          float rim = step(min(e.x, e.y), 0.06);
          float bulb = step(0.5, fract((q.x * 3.0 + q.y) * 6.0 - uTime * vAnim.y));
          col = mix(col, vec3(1.0, 0.86, 0.55) * 2.2 * bulb, rim);
        }
        float fog = fogF(vDepth);
        if (uHolo > 0.5) {
          float scan = 0.65 + 0.35 * sin(vQ.y * 420.0 - uTime * 6.0);
          float flick = 0.85 + 0.15 * sin(uTime * 31.0 + vAnim.z * 9.0);
          float a = tx.a * dot(tx.rgb, vec3(0.33)) * scan * flick * (1.0 - fog);
          gl_FragColor = vec4(vec3(0.35, 0.95, 1.0) * a * g, 1.0);
          return;
        }
        gl_FragColor = vec4(mix(col, uFogColor, fog), 1.0);
      }`,
    side: THREE.DoubleSide,
    ...(holo ? { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending } : {}),
  });
}

// ---------- street level below the deck (or above it, in the cuts and tunnels): avenue, cross streets, crossings, river, moat ----------
export function groundMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { ...U, ...CITY },
    vertexShader: /* glsl */ `
      ${BEND_GLSL}
      ${PROF_GLSL}
      varying vec3 vW; varying float vDepth;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vec4 p0 = prof0(wp.z), p1 = prof1(wp.z);
        float deck = deckOf(p0), x = wp.x;
        float yy = -deck - 0.06;
        // the palace side: the moat lies 2.5 m below the street, the castle bank rises 8 m above it behind the stone wall
        yy += p1.r * (step(x, -34.5) * 8.0 - step(-34.5, x) * step(x, -14.0) * 2.5);
        // the river between its walls, the bay beyond the quay
        yy -= p0.a * step(abs(x), 24.4) * 2.5 + p1.a * step(60.2, x) * 2.0;
        wp.y = yy;
        vW = wp.xyz;
        vec4 mv = viewMatrix * bendW(wp);
        vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      ${FOG_GLSL}
      ${HASH_GLSL}
      ${PROF_GLSL}
      uniform float uS, uTime; uniform vec3 uUp;
      varying vec3 vW; varying float vDepth;
      float dot2(vec2 p, float r) { return smoothstep(r, r * 0.3, length(p)); }
      void main() {
        vec4 p0 = prof0(vW.z), p1 = prof1(vW.z);
        float x = vW.x, ax = abs(x), s = uS - vW.z;
        float dk = deckOf(p0);
        // the road covers the street at grade; in the cut, the cut itself is open
        if (ax < (dk < -0.3 ? 7.2 : 6.5) && dk < 1.5) discard;
        vec3 sodium = vec3(1.0, 0.62, 0.3);
        // blocks: dark pavement and the backs of buildings
        vec3 col = vec3(0.014, 0.013, 0.016) * (0.7 + 0.6 * h21(floor(vec2(x / 13.0, s / 17.0))));
        // the avenue under the expressway, sodium-lit, with traffic both ways
        float bl = floor(s / 72.0), bf = fract(s / 72.0);
        float cross = step(bf, 0.12) * step(16.0, ax);
        if (ax < 15.0) {
          col = vec3(0.03, 0.026, 0.024) + sodium * 0.05 * (0.6 + 0.4 * sin(s * 0.18));
          col += vec3(0.5) * step(abs(ax - 7.5), 0.08) * step(0.5, fract(s / 6.0)) * 0.3;
          float lane = x > 0.0 ? 1.0 : -1.0;
          float lx = x - lane * (ax < 7.5 ? 3.75 : 11.0) * 0.5 - lane * 2.0;
          float k = (s + lane * uTime * 13.0) / 11.0;
          float car = step(0.72, h21(vec2(floor(k), lane * 3.0 + floor(ax / 7.5))));
          vec2 q = vec2(abs(lx) - 0.7, (fract(k) - 0.5) * 11.0);
          col += (lane > 0.0 ? vec3(1.0, 0.95, 0.85) * 2.2 : vec3(1.0, 0.08, 0.1) * 1.6) * car * dot2(q, 0.35);
        } else if (ax < 18.0) {
          // pavement lit by shop windows
          col = vec3(0.05, 0.045, 0.04) + mix(vec3(1.0, 0.8, 0.55), vec3(0.8, 0.9, 1.0), h21(vec2(floor(s / 6.0), x))) * 0.12 * (0.4 + 0.6 * h21(vec2(floor(s / 9.0), lane_dummy(0.0))));
        }
        if (cross > 0.5) {
          float cy = (bf / 0.12 - 0.5) * 8.6;           // across the cross street
          col = vec3(0.028, 0.025, 0.024) + sodium * 0.04;
          float zebra = step(ax, 21.0) * step(0.5, fract(cy * 0.9)) * step(abs(cy), 3.6);
          col += vec3(0.35) * zebra;
          float k = (ax * sign(cy) + uTime * 11.0) / 10.0;
          float car = step(0.75, h21(vec2(floor(k), bl + sign(cy))));
          col += (cy > 0.0 ? vec3(1.0, 0.95, 0.85) * 2.0 : vec3(1.0, 0.1, 0.1) * 1.5) * car * dot2(vec2((fract(k) - 0.5) * 10.0, abs(cy) - 2.0), 0.35);
        }
        // traffic signals at every crossing: red, then green, then amber
        {
          float ph = fract(uTime / 24.0 + h21(vec2(bl, 1.0)));
          vec3 sig = ph < 0.45 ? vec3(1.0, 0.06, 0.04) : ph < 0.92 ? vec3(0.1, 1.0, 0.55) : vec3(1.0, 0.6, 0.05);
          vec2 q = vec2(ax - 16.4, (bf - 0.135) * 72.0);
          col += sig * 3.0 * dot2(q, 0.45);
        }
        // water: the river under the road, the palace moat on the left, the bay on the right
        float river = p0.a * step(ax, 24.0);
        float moat = p1.r * step(x, -14.0) * step(-34.0, x);
        float bay = p1.a * step(60.2, x);
        float water = max(river, max(moat, bay));
        if (water > 0.5) {
          vec3 wc = vec3(0.004, 0.009, 0.016);
          float sp = step(0.94, h21(floor(vec2(x / 1.4, s / 0.5 + uTime * 1.5))));
          wc += mix(vec3(1.0, 0.7, 0.4), vec3(0.6, 0.85, 1.0), h21(floor(vec2(x / 9.0, s / 30.0)))) * sp * 0.35 * smoothstep(400.0, 40.0, vDepth);
          col = wc;
        }
        // palace grounds and parks: near black, a path lamp here and there
        float park = max(p1.r * step(x, -34.0), p1.g * step(18.0, x));
        if (park > 0.5) {
          col = vec3(0.006, 0.009, 0.006);
          vec2 cl = vec2(fract(x / 40.0) - 0.5, fract(s / 55.0) - 0.5) * vec2(40.0, 55.0);
          col += vec3(1.0, 0.85, 0.6) * 0.6 * dot2(cl, 0.5) * step(0.6, h21(floor(vec2(x / 40.0, s / 55.0))));
        }
        gl_FragColor = vec4(mix(col, uFogColor, fogF(vDepth)), 1.0);
      }`.replace('lane_dummy(0.0)', 'x'),
  });
}

// ---------- the road as a structure: shoulder, parapet, handrail, sound barrier, trench walls, tunnel tube, palace stone wall ----------
// One mesh. aPart picks the surface; aMode says how its height follows the profile (0 fixed, 1 barrier top, 2 trench top,
// 3 street-relative). Surfaces that are not there (no tunnel here, no barrier) are discarded per pixel, so a tunnel
// starts exactly at its real portal and runs its real length.
export function structureMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { ...U, ...CITY, uHeadX: { value: 0 }, uLed: { value: new THREE.Color('#7fe8ff') } },
    vertexShader: /* glsl */ `
      ${BEND_GLSL}
      ${PROF_GLSL}
      attribute float aPart; attribute float aMode;
      varying vec3 vW; varying float vPart; varying vec3 vN; varying float vDepth;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vec4 p0 = prof0(wp.z);
        float deck = deckOf(p0);
        if (aMode > 0.5 && aMode < 1.5) wp.y += p0.b * 8.0;
        else if (aMode > 1.5 && aMode < 2.5) wp.y += max(0.0, -deck);
        else if (aMode > 2.5) wp.y -= deck;
        vW = wp.xyz; vPart = aPart; vN = normal;
        vec4 mv = viewMatrix * bendW(wp);
        vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      ${FOG_GLSL}
      ${HASH_GLSL}
      ${PROF_GLSL}
      uniform float uS, uTime, uLampPhase, uHeadX; uniform vec3 uAmb, uUp, uLampCol, uTunCol, uSky, uLed;
      varying vec3 vW; varying float vPart; varying vec3 vN; varying float vDepth;
      float box(vec2 p, vec2 a, vec2 b) { return step(a.x, p.x) * step(p.x, b.x) * step(a.y, p.y) * step(p.y, b.y); }
      void main() {
        float part = floor(vPart + 0.5);
        vec4 p0 = prof0(vW.z), p1 = prof1(vW.z);
        float deck = deckOf(p0), tun = p0.g;
        float z = vW.z, y = vW.y, s = uS - z, side = sign(vW.x);
        // street lamps on the parapets (same layout as world.js: 34 m apart, the right side offset by 17 m)
        float dl = mod(z - (14.0 + uLampPhase) + (side > 0.0 ? 17.0 : 0.0), 34.0); dl = min(dl, 34.0 - dl);
        float lampI = exp(-dl * dl / 70.0) / (1.0 + (8.6 - y) * (8.6 - y) / 30.0) * (1.0 - tun);
        vec3 light = uAmb * 1.6 + uLampCol * lampI * 1.3 + uLampCol * 0.06 * (1.0 - tun);
        // the player's headlights on the walls just ahead
        float head = exp(-(z + 20.0) * (z + 20.0) / 260.0) * smoothstep(1.5, 0.0, y - 1.5) * smoothstep(9.0, 4.0, abs(vW.x - uHeadX));
        vec3 col = vec3(0.0); vec3 emit = vec3(0.0);
        vec3 conc = vec3(0.42, 0.41, 0.38) * (0.9 + 0.2 * h21(vec2(floor(s / 30.0), side)));
        if (part < 0.5) {                         // shoulder / gutter
          col = vec3(0.09, 0.09, 0.1) * (0.85 + 0.3 * step(0.5, fract(s * 2.0)) * step(abs(abs(vW.x) - 5.95), 0.25)) * light;
        } else if (part < 1.5) {                  // parapet, road face
          col = conc * light * (0.55 + 0.45 * smoothstep(0.0, 0.35, y)) + conc * vec3(1.0, 0.92, 0.8) * head * 0.7;
          col *= 1.0 - 0.6 * step(fract(s / 30.0), 0.004);                // expansion joints
          col *= 0.94 + 0.06 * step(0.5, fract(s / 2.0));                  // formwork
          float dlin = box(vec2(fract(s / 10.0) * 10.0, y), vec2(0.0, 0.62), vec2(0.28, 0.76));
          emit += (side < 0.0 ? vec3(1.0) : vec3(1.0, 0.55, 0.1)) * dlin * (0.22 + 0.5 * exp(-max(0.0, -z - 4.0) / 50.0));   // delineators: kept dim (no glare on the wet road)
          emit += uLed * 0.45 * smoothstep(0.035, 0.0, abs(y - 0.9)) * (1.0 - tun * 0.5);
        } else if (part < 2.5) { col = conc * light * 1.1;
        } else if (part < 3.5) { col = conc * 0.5 * light;
        } else if (part < 4.5) { col = vec3(0.5, 0.52, 0.55) * light * 1.3;     // handrail
        } else if (part < 5.5) {                  // sound barrier: dark acrylic panels in aluminium frames
          if (p0.b * 8.0 < 0.25) discard;
          float post = step(abs(fract(s / 2.0) - 0.5), 0.035);
          float top = step(1.1 + p0.b * 8.0 - 0.18, y);
          col = vec3(0.025, 0.03, 0.04) + uSky * 0.35 * (0.5 + 0.5 * smoothstep(1.0, 5.0, y)) + uLampCol * lampI * 0.18;
          col = mix(col, vec3(0.32, 0.33, 0.35) * light, max(post, top));
        } else if (part < 6.5) {                  // retaining wall of the open cut
          if (tun > 0.5 || -deck < 0.3) discard;
          col = vec3(0.2, 0.2, 0.19) * (0.75 + 0.4 * h21(vec2(floor(s / 6.0), side))) * (light + uUp * 0.18 * smoothstep(0.0, 6.0, y));
          col *= 1.0 - 0.35 * step(length(vec2(fract(s / 1.5) - 0.5, fract(y / 1.5) - 0.5)), 0.05);
          col *= 1.0 - 0.5 * step(fract(s / 6.0), 0.01);
          col *= 0.93 + 0.07 * step(0.5, fract(y / 1.5));
          col *= 1.0 - 0.25 * smoothstep(0.6, 1.0, h21(vec2(floor(s * 1.5), side))) * smoothstep(0.0, 5.0, y);  // rain stains
          col += vec3(1.0, 0.92, 0.8) * head * 0.25;
        } else if (part < 7.5) {
          if (tun > 0.5 || -deck < 0.3) discard;
          col = conc * (light + uUp * 0.3);
        } else if (part < 8.5) {                  // tunnel wall
          if (tun < 0.5) discard;
          vec3 tl = uTunCol * (0.55 + 0.25 * smoothstep(1.0, 5.0, y)) + vec3(1.0, 0.92, 0.8) * head * 0.6;
          if (y < 3.4) {
            vec2 pn = vec2(s / 1.2, y / 0.7);
            float joint = step(min(fract(pn.x), fract(pn.y)), 0.03);
            col = vec3(0.46, 0.46, 0.44) * (0.9 + 0.1 * h21(floor(pn))) * (1.0 - 0.5 * joint) * tl;
          } else col = vec3(0.26, 0.26, 0.27) * tl;
          float m50 = mod(s, 50.0), m200 = mod(s, 200.0), m400 = mod(s, 400.0), m25 = mod(s, 25.0);
          float ext = box(vec2(m50, y), vec2(0.0, 0.9), vec2(0.7, 1.7));
          emit += mix(vec3(0.9, 0.04, 0.03), vec3(1.0), box(vec2(m50, y), vec2(0.12, 1.15), vec2(0.58, 1.35))) * ext * 0.9;
          float door = box(vec2(m400, y), vec2(200.0, 0.0), vec2(201.2, 2.2));
          col = mix(col, vec3(0.1, 0.16, 0.13) * tl, door);
          emit += vec3(0.1, 1.0, 0.45) * 1.4 * box(vec2(m400, y), vec2(200.1, 2.4), vec2(201.1, 2.85));
          float phone = box(vec2(m200, y), vec2(100.0, 0.9), vec2(100.9, 2.0));
          emit += vec3(1.0, 0.5, 0.08) * 0.5 * phone + vec3(1.0, 0.05, 0.05) * 2.5 * box(vec2(m200, y), vec2(100.3, 2.15), vec2(100.6, 2.35));
          emit += vec3(0.55, 1.0, 0.7) * 0.6 * box(vec2(m25, y), vec2(0.0, 0.5), vec2(0.5, 0.72));
        } else if (part < 9.5) {                  // the lamp row at the wall-ceiling corner
          if (tun < 0.5) discard;
          // a continuous row of luminaires (1.5 m units, short gaps) with a diffuser that is brightest in its middle
          float on = smoothstep(0.0, 0.04, fract(s / 1.8)) * smoothstep(0.86, 0.8, fract(s / 1.8));
          float v = clamp((y - 5.7) / 0.4, 0.0, 1.0);
          col = vec3(0.12) * uTunCol;
          emit += uTunCol * 2.2 * on * smoothstep(0.0, 0.35, v) * smoothstep(1.0, 0.65, v);
        } else if (part < 10.5) {                 // ceiling: dark, cable trays, a pair of jet fans every 120 m
          if (tun < 0.5) discard;
          col = vec3(0.14, 0.14, 0.15) * uTunCol * 0.55;
          col *= 1.0 - 0.4 * step(abs(abs(vW.x) - 4.6), 0.12);
          float m = mod(s, 120.0);
          vec2 fp = vec2(abs(vW.x) - 2.2, m - 1.6);
          float fan = step(length(fp * vec2(1.0, 0.55)), 0.8);
          col = mix(col, vec3(0.02), fan) + uTunCol * 0.12 * fan * step(0.6, length(fp * vec2(1.0, 0.55)));
        } else if (part < 11.5) {                 // Edo castle stone wall (ishigaki) above the moat
          if (p1.r < 0.5) discard;
          float row = floor(y / 0.55);
          float u = s / 1.1 + h21(vec2(row, 7.0)) * 3.0;
          vec2 st = vec2(fract(u), fract(y / 0.55));
          float mortar = step(min(min(st.x, 1.0 - st.x) * 1.1, min(st.y, 1.0 - st.y) * 0.55), 0.04);
          col = vec3(0.3, 0.28, 0.24) * (0.7 + 0.5 * h21(vec2(floor(u), row))) * (uAmb * 2.0 + vec3(1.0, 0.75, 0.45) * 0.12 * smoothstep(8.0, 0.0, y + deck + 4.0));
          col *= 1.0 - 0.7 * mortar;
        } else {                                  // portal face
          col = conc * 0.8 * (light + uTunCol * 0.2);
          col *= 1.0 - 0.3 * step(fract(y / 1.2), 0.02);
        }
        col += emit;
        gl_FragColor = vec4(mix(col, uFogColor, fogF(vDepth)), 1.0);
      }`,
  });
}

// ---------- landmark lattice (Tokyo Tower, Skytree): additive light on an envelope, so the lattice never aliases ----------
// The truss is drawn procedurally on the tapered envelope: legs, rings, cross-bracing. Where the lines get thinner than a
// pixel they fade to their average coverage, so the tower reads as a solid lit silhouette from far away.
export function latticeMaterial({ color = '#ff7a2a', color2 = '#ffd9b0', gain = 1, rings = 12, panels = 3, bands = 0 } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: { ...U, uC1: { value: new THREE.Color(color) }, uC2: { value: new THREE.Color(color2) }, uGain: { value: gain }, uRings: { value: rings }, uPanels: { value: panels }, uBands: { value: bands } },
    vertexShader: /* glsl */ `
      varying vec2 vF; varying float vDepth; varying float vY;
      void main() {
        vF = uv; vY = position.y;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uC1, uC2; uniform float uGain, uRings, uPanels, uBands;
      varying vec2 vF; varying float vDepth; varying float vY;
      float line(float d, float w, float fw) { return 1.0 - smoothstep(w, w + fw * 1.5, d); }
      void main() {
        // vF.x: 0..1 across a face (legs at the edges), vF.y: height in metres
        float u = vF.x, y = vF.y;
        float fwu = fwidth(u), fwy = fwidth(y / uRings);
        float leg = line(min(u, 1.0 - u), 0.035, fwu);
        float ring = line(abs(fract(y / uRings + 0.5) - 0.5), 0.025, fwy);
        float pu = u * uPanels;
        float a1 = abs(fract(pu - y / uRings + 0.5) - 0.5), a2 = abs(fract(pu + y / uRings + 0.5) - 0.5);
        float fwd = fwidth(pu - y / uRings);
        float brace = max(line(a1, 0.02, fwd), line(a2, 0.02, fwd));
        float cov = max(leg, max(ring * 0.9, brace * 0.7));
        // sub-pixel: average coverage instead of shimmer
        float far = clamp(max(fwu, fwd) * 3.0 - 0.3, 0.0, 1.0);
        cov = mix(cov, 0.28, far);
        vec3 c = uC1;
        if (uBands > 0.0) c = mix(uC1, uC2, step(0.5, fract(y / uBands)));
        // lit from the base: brighter low down, a warm haze at distance
        float lift = 0.75 + 0.6 * exp(-y / 90.0);
        float haze = exp(-vDepth * 0.00018);
        gl_FragColor = vec4(c * cov * uGain * lift * (0.35 + 0.65 * haze), 1.0);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  });
}
