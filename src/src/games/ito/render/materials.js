// ITO materials: printed-comic shading done cheaply in each material (cel bands + screen-space Ben-Day dots),
// while the post pass adds ink lines, plate misregistration, paper grain and hatching.
// Every material writes an object/face ID into alpha (k/255): the post pass inks a line wherever the ID changes.
import * as THREE from 'three';

export const hex = (h) => { const n = parseInt(h.replace('#', ''), 16); return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255); };

// palette (display-referred: no colour management, these go straight to the screen)
export const PAL = {
  ink: '#140a2a', paper: '#f4ecd8', night: '#1a1038', fog: '#3a1d5c', fogFar: '#5a2470',
  magenta: '#ff2bd6', cyan: '#18e7ff', yellow: '#ffe14a', orange: '#ff7a3d', red: '#ff3355',
  sun: new THREE.Vector3(-0.45, 0.72, 0.53).normalize(), // the moon: upper left, behind the camera at the start
};

export const ID_SKY = 0;
export const ID_HERO0 = 232; // hero parts use 232..250: the post pass draws them with a thicker line

export const shared = {
  uTime: { value: 0 },
  uDot: { value: 6 }, // halftone cell, in device pixels
  uRes: { value: new THREE.Vector2(1, 1) },
  uFogC: { value: hex(PAL.fog) },
  uFogD: { value: 0.0024 },
  uSun: { value: PAL.sun.clone() },
  uFlicker: { value: 1 }, // 0 when reduced motion
  uCamPos: { value: new THREE.Vector3() },
};

export const GLSL_COMMON = /* glsl */ `
uniform float uTime; uniform float uDot; uniform vec2 uRes; uniform vec3 uFogC; uniform float uFogD; uniform vec3 uSun; uniform float uFlicker; uniform vec3 uCamPos;
float hash11(float p) { p = fract(p * .1031); p *= p + 33.33; p *= p + p; return fract(p); }
float hash21(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
// Ben-Day dots: screen-space grid at 45 degrees; coverage 0..1
float halftone(vec2 fc, float cov, float cell) {
  vec2 p = mat2(0.7071, -0.7071, 0.7071, 0.7071) * fc / cell;
  vec2 f = fract(p) - 0.5;
  float d = length(f);
  float r = sqrt(clamp(cov, 0.0, 1.0)) * 0.66;
  float aa = 0.75 / cell;
  return 1.0 - smoothstep(r - aa, r + aa, d);
}
// three cel bands for a light term
float cel(float ndl) { return ndl > 0.42 ? 1.0 : ndl > -0.08 ? 0.66 : 0.42; }
vec3 fogIt(vec3 c, float dist) { float f = 1.0 - exp(-dist * uFogD); return mix(c, uFogC, clamp(f, 0.0, 0.92)); }
`;

// ---------- buildings: cel bands, dots in shadow, procedural windows, neon uplight from the street ----------
export function buildingMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { ...shared },
    vertexShader: /* glsl */ `
      attribute float aId; attribute float aTone; attribute float aSeed; attribute float aLit;
      varying vec3 vW; varying vec3 vN; varying float vId; varying float vTone; varying float vSeed; varying float vLit;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); vId = aId; vTone = aTone; vSeed = aSeed; vLit = aLit;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      ${GLSL_COMMON}
      varying vec3 vW; varying vec3 vN; varying float vId; varying float vTone; varying float vSeed; varying float vLit;
      vec3 tone(float t) {
        if (t < 0.5) return vec3(0.27, 0.20, 0.50);
        if (t < 1.5) return vec3(0.18, 0.25, 0.48);
        if (t < 2.5) return vec3(0.33, 0.20, 0.42);
        if (t < 3.5) return vec3(0.20, 0.31, 0.42);
        if (t < 4.5) return vec3(0.38, 0.25, 0.52);
        if (t < 5.5) return vec3(0.24, 0.21, 0.38);
        if (t < 6.5) return vec3(0.42, 0.40, 0.48); // concrete (viaduct, walkway)
        if (t < 7.5) return vec3(0.62, 0.10, 0.16); // shrine vermilion
        return vec3(0.10, 0.09, 0.14);              // dark steel
      }
      void main() {
        vec3 n = normalize(vN);
        vec3 base = tone(vTone);
        float ndl = dot(n, uSun);
        float band = cel(ndl);
        vec3 col = base * (0.5 + 0.8 * band);
        // moonlight tint on lit faces, cold in shadow
        col *= band > 0.9 ? vec3(1.08, 1.0, 1.04) : vec3(0.82, 0.88, 1.14);
        float dist = length(vW - uCamPos);
        bool vertical = abs(n.y) < 0.5;
        float side = hash11(vSeed * 7.0 + n.x * 3.0 + n.z * 5.0);
        if (vertical) {
          // neon spill from the street on the lower floors
          vec3 neon = side < 0.5 ? vec3(1.0, 0.17, 0.84) : vec3(0.1, 0.9, 1.0);
          col += neon * 0.38 * exp(-vW.y / 16.0) * (0.6 + 0.4 * band);
        } else if (n.y > 0.5) {
          // roofs: flat, with a faint slab grid so scale reads when you land
          col = base * 0.6 + vec3(0.04, 0.03, 0.08);
          vec2 g = abs(fract(vW.xz / 3.0) - 0.5);
          col *= 1.0 - 0.12 * step(0.46, max(g.x, g.y)) * (1.0 - smoothstep(30.0, 80.0, dist));
        }
        // Ben-Day dots in the shadow bands (wall only; lit glass is light, it doesn't take ink)
        float cov = band > 0.9 ? 0.0 : band > 0.6 ? 0.2 : 0.48;
        if (cov > 0.0) col = mix(col, col * 0.42, halftone(gl_FragCoord.xy, cov, uDot));
        // windows, composited over the printed wall
        if (vertical && vLit > 0.0) {
          float u = abs(n.x) > 0.5 ? vW.z : vW.x;
          vec2 cell = vec2(u / 3.0, vW.y / 3.8);
          vec2 id = floor(cell), f = fract(cell);
          float row = hash21(vec2(id.y, vSeed));
          float rate = vLit * (0.3 + 0.7 * row * row);
          float h = hash21(id + vSeed * 13.1);
          float lit = step(h, rate);
          float pick = hash21(id.yx + vSeed);
          vec3 wc = pick < 0.72 ? vec3(1.0, 0.84, 0.56) : pick < 0.97 ? vec3(0.78, 0.92, 1.0) : vec3(1.0, 0.55, 0.85);
          vec3 glass = col * 0.55 + vec3(0.03, 0.04, 0.1);
          float win = step(0.18, f.x) * step(f.x, 0.82) * step(0.3, f.y) * step(f.y, 0.82);
          // close up: frames, a spandrel band per floor, blinds and a ceiling glow inside lit rooms
          float px = max(fwidth(cell.x), fwidth(cell.y));
          float closeK = 1.0 - smoothstep(0.012, 0.05, px);
          float frame = win * (1.0 - step(0.2, f.x) * step(f.x, 0.8) * step(0.32, f.y) * step(f.y, 0.8));
          float band = step(0.9, f.y) + step(f.y, 0.06);
          float blinds = step(0.55, fract(f.y * 14.0)) * step(0.5, hash21(id * 1.7 + vSeed));
          vec3 room = wc * (0.82 + 0.3 * smoothstep(0.3, 0.82, f.y)) * (1.0 - 0.18 * blinds * closeK);
          vec3 wall = col * (1.0 - 0.18 * band * closeK);
          vec3 near = mix(wall, mix(glass, room, lit), win);
          near = mix(near, col * 0.35, frame * closeK);
          // far away: average the pattern instead of letting it shimmer
          float far = smoothstep(0.1, 0.28, px);
          vec3 avg = mix(col, mix(glass, wc, rate * 0.75), 0.4);
          col = mix(near, avg, far);
        }
        col = fogIt(col, dist);
        gl_FragColor = vec4(col, vId);
      }`,
  });
}

// ---------- flat emissive (signs, screens): texture or colour, flicker, writes an ID ----------
export function signMaterial(map) {
  return new THREE.ShaderMaterial({
    uniforms: { ...shared, uMap: { value: map } },
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      attribute float aId; attribute vec4 aUv; attribute float aSeed;
      varying vec2 vUv; varying vec4 vCell; varying float vId; varying float vSeed; varying vec3 vW;
      void main() {
        vUv = uv; vCell = aUv; vId = aId; vSeed = aSeed;
        vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      ${GLSL_COMMON}
      uniform sampler2D uMap;
      varying vec2 vUv; varying vec4 vCell; varying float vId; varying float vSeed; varying vec3 vW;
      void main() {
        // both faces of a blade sign read the right way round
        vec2 u = vec2(gl_FrontFacing ? vUv.x : 1.0 - vUv.x, vUv.y);
        vec4 t = texture2D(uMap, vCell.xy + u * vCell.zw);
        // the odd tube buzzes (steps, not strobes: never a flash)
        float fl = 1.0 - uFlicker * 0.35 * step(0.985, hash11(floor(uTime * 9.0) + vSeed * 31.0)) * step(0.7, hash11(vSeed));
        vec3 c = t.rgb * fl;
        c = fogIt(c, length(vW - uCamPos) * 0.6);
        gl_FragColor = vec4(c, vId);
      }`,
  });
}

// animated billboard screens: an atlas of panels that cut between each other, with a scan wipe
export function screenMaterial(map) {
  return new THREE.ShaderMaterial({
    uniforms: { ...shared, uMap: { value: map } },
    vertexShader: /* glsl */ `
      attribute float aId; attribute float aSeed;
      varying vec2 vUv; varying float vId; varying float vSeed; varying vec3 vW;
      void main() { vUv = uv; vId = aId; vSeed = aSeed; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      ${GLSL_COMMON}
      uniform sampler2D uMap;
      varying vec2 vUv; varying float vId; varying float vSeed; varying vec3 vW;
      void main() {
        float t = uTime * 0.25 + vSeed * 7.0;
        float k = floor(t), f = fract(t);
        float a = mod(k + floor(vSeed * 8.0), 8.0), b = mod(a + 1.0, 8.0);
        vec2 cellA = vec2(mod(a, 4.0), floor(a / 4.0)) * vec2(0.25, 0.5);
        vec2 cellB = vec2(mod(b, 4.0), floor(b / 4.0)) * vec2(0.25, 0.5);
        float wipe = smoothstep(0.86, 1.0, f);
        float useB = step(vUv.x, wipe);
        vec2 uv = vUv * vec2(0.25, 0.5);
        vec3 c = mix(texture2D(uMap, cellA + uv).rgb, texture2D(uMap, cellB + uv).rgb, useB);
        c *= 0.86 + 0.14 * step(0.5, fract(vUv.y * 60.0)); // scanlines
        c = fogIt(c * 1.05, length(vW - uCamPos) * 0.6);
        gl_FragColor = vec4(c, vId);
      }`,
  });
}

// ---------- the ground: asphalt, lane lines, zebra crossings, sidewalks; streets passed as uniforms ----------
export function groundMaterial(city) {
  const sx = city.sx.slice(), sz = city.sz.slice(), wx = city.wx.slice(), wz = city.wz.slice();
  return new THREE.ShaderMaterial({
    uniforms: { ...shared, uSX: { value: sx }, uSZ: { value: sz }, uWX: { value: wx }, uWZ: { value: wz }, uPark: { value: new THREE.Vector4(city.park.x0, city.park.z0, city.park.x1, city.park.z1) } },
    vertexShader: /* glsl */ `varying vec3 vW; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      ${GLSL_COMMON}
      uniform float uSX[7]; uniform float uSZ[7]; uniform float uWX[7]; uniform float uWZ[7]; uniform vec4 uPark;
      varying vec3 vW;
      void main() {
        vec2 p = vW.xz;
        float dist = length(vW - uCamPos);
        vec3 side = vec3(0.16, 0.13, 0.24); // sidewalk / plaza
        vec3 asphalt = vec3(0.08, 0.07, 0.13);
        vec3 col = side;
        float onRoad = 0.0;
        vec3 mark = vec3(0.0);
        float kerb = 0.0;
        for (int i = 0; i < 7; i++) {
          float dx = abs(p.x - uSX[i]), dz = abs(p.y - uSZ[i]);
          float hx = uWX[i] * 0.5 - 3.0, hz = uWZ[i] * 0.5 - 3.0;
          kerb = max(kerb, (1.0 - step(0.35, abs(dx - hx))) + (1.0 - step(0.35, abs(dz - hz))));
          if (dx < hx) {
            onRoad = 1.0;
            // centre double line + lane dashes
            float cl = step(abs(dx - 0.35), 0.12);
            float lane = step(abs(dx - hx * 0.5), 0.1) * step(0.5, fract(p.y / 9.0));
            mark = max(mark, vec3(1.0, 0.82, 0.3) * cl + vec3(0.8) * lane);
          }
          if (dz < hz) {
            onRoad = 1.0;
            float cl = step(abs(dz - 0.35), 0.12);
            float lane = step(abs(dz - hz * 0.5), 0.1) * step(0.5, fract(p.x / 9.0));
            mark = max(mark, vec3(1.0, 0.82, 0.3) * cl + vec3(0.8) * lane);
          }
        }
        // zebra crossings at the edges of the nearest intersection
        int bi = 0, bj = 0; float bx = 1e9, bz = 1e9;
        for (int i = 0; i < 7; i++) { float dx = abs(p.x - uSX[i]); if (dx < bx) { bx = dx; bi = i; } float dz = abs(p.y - uSZ[i]); if (dz < bz) { bz = dz; bj = i; } }
        float hx = 0.0, hz = 0.0;
        for (int i = 0; i < 7; i++) { if (i == bi) hx = uWX[i] * 0.5 - 3.0; if (i == bj) hz = uWZ[i] * 0.5 - 3.0; }
        if (bx < hx && bz > hz && bz < hz + 4.0) mark = max(mark, vec3(0.85) * step(0.5, fract(p.x / 1.6)));
        if (bz < hz && bx > hx && bx < hx + 4.0) mark = max(mark, vec3(0.85) * step(0.5, fract(p.y / 1.6)));
        if (bx < hx && bz < hz) mark = vec3(0.0); // the box itself stays clear
        // close up the street has a surface: asphalt grain, paving joints on the pavement, a kerb line
        float nearK = 1.0 - smoothstep(25.0, 90.0, dist);
        float grain = hash21(floor(p * 3.0)) * 0.5 + hash21(floor(p * 0.7)) * 0.5;
        vec3 asph = asphalt * (0.8 + 0.45 * grain * nearK) + vec3(0.02, 0.015, 0.04) * step(0.93, hash21(floor(p * 0.5))) * nearK;
        vec2 tile = abs(fract(p / 1.5) - 0.5);
        vec3 pave = side * (1.0 - 0.22 * step(0.45, max(tile.x, tile.y)) * nearK) * (0.92 + 0.16 * grain * nearK);
        col = mix(pave, asph, onRoad);
        // park
        if (p.x > uPark.x && p.x < uPark.z && p.y > uPark.y && p.y < uPark.w) {
          col = vec3(0.07, 0.17, 0.15);
          float path = step(abs(p.x - (uPark.x + uPark.z) * 0.5), 3.0);
          col = mix(col, vec3(0.32, 0.27, 0.22), path);
        }
        // street-lamp pools along the kerbs
        float pool = 0.0;
        for (int i = 0; i < 7; i++) {
          float dx = abs(abs(p.x - uSX[i]) - (uWX[i] * 0.5 - 2.0));
          float dz = abs(abs(p.y - uSZ[i]) - (uWZ[i] * 0.5 - 2.0));
          pool = max(pool, (1.0 - smoothstep(0.0, 6.0, length(vec2(dx, mod(p.y, 24.0) - 12.0)))));
          pool = max(pool, (1.0 - smoothstep(0.0, 6.0, length(vec2(dz, mod(p.x, 24.0) - 12.0)))));
        }
        col += vec3(1.0, 0.55, 0.3) * pool * 0.22;
        col = mix(col, vec3(0.42, 0.36, 0.52), clamp(kerb, 0.0, 1.0) * 0.6 * (1.0 - smoothstep(40.0, 160.0, dist)));
        float far = smoothstep(80.0, 220.0, dist);
        col = mix(col + mark * 0.85, col + mark * 0.2, far);
        col = mix(col, col * 0.5, halftone(gl_FragCoord.xy, 0.3 * (1.0 - pool), uDot));
        col = fogIt(col, dist);
        gl_FragColor = vec4(col, 1.0 / 255.0);
      }`,
  });
}

// ---------- sky: bold gradient printed in dots, a halftone moon with an ink rim ----------
export function skyMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { ...shared, uMoon: { value: new THREE.Vector3(-0.5, 0.42, -0.76).normalize() } },
    side: THREE.BackSide, depthWrite: false,
    vertexShader: /* glsl */ `varying vec3 vD; void main() { vD = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }`,
    fragmentShader: /* glsl */ `
      ${GLSL_COMMON}
      uniform vec3 uMoon;
      varying vec3 vD;
      void main() {
        vec3 d = normalize(vD);
        float h = d.y;
        vec3 zen = vec3(0.07, 0.04, 0.17), mid = vec3(0.2, 0.08, 0.38), hor = vec3(0.74, 0.17, 0.5), glow = vec3(1.0, 0.45, 0.45);
        vec3 c = mix(hor, mid, smoothstep(0.02, 0.28, h));
        c = mix(c, zen, smoothstep(0.25, 0.75, h));
        c = mix(glow, c, smoothstep(-0.04, 0.06, h));
        // dots: a magenta plate over the upper sky, denser toward the top
        float cov = smoothstep(0.05, 0.6, h) * 0.45;
        c = mix(c, c * 0.55 + vec3(0.12, 0.0, 0.12), halftone(gl_FragCoord.xy, cov, uDot * 1.3));
        // stars
        vec2 sp = vec2(atan(d.z, d.x) * 120.0, h * 120.0);
        float st = step(0.996, hash21(floor(sp))) * smoothstep(0.15, 0.4, h);
        c += vec3(0.9, 0.85, 1.0) * st * 0.7;
        // moon
        float m = dot(d, uMoon);
        float r = 0.9975;
        if (m > r - 0.0006) {
          vec3 mc = vec3(1.0, 0.94, 0.78);
          // shaded side in dots
          vec3 t = normalize(cross(uMoon, vec3(0.0, 1.0, 0.0)));
          float side = dot(d - uMoon * m, t) * 400.0;
          mc = mix(mc, mc * 0.7, halftone(gl_FragCoord.xy, smoothstep(-0.2, 1.2, side) * 0.6, uDot * 0.8));
          c = m > r ? mc : vec3(0.08, 0.04, 0.16);
        }
        // a halo around the moon
        c += vec3(0.5, 0.3, 0.5) * smoothstep(0.97, 0.997, m) * 0.25;
        gl_FragColor = vec4(c, 0.0);
      }`,
  });
}

// ---------- the hero: flat colour, three bands from a camera-relative key light, dots in shadow ----------
export function heroMaterial(color, id, emissive = 0) {
  return new THREE.ShaderMaterial({
    uniforms: { ...shared, uColor: { value: hex(color) }, uId: { value: id / 255 }, uEm: { value: emissive }, uGhost: { value: 0 } },
    vertexShader: /* glsl */ `varying vec3 vN; varying vec3 vV; void main() { vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */ `
      ${GLSL_COMMON}
      uniform vec3 uColor; uniform float uId; uniform float uEm;
      varying vec3 vN; varying vec3 vV;
      void main() {
        vec3 n = normalize(vN);
        vec3 L = normalize(vec3(-0.55, 0.65, 0.5)); // view space: from upper left of the camera
        float band = cel(dot(n, L));
        vec3 c = uColor * (0.5 + 0.6 * band);
        // rim: a hard magenta kicker from the city behind
        float rim = 1.0 - max(dot(n, normalize(vV)), 0.0);
        c = mix(c, vec3(1.0, 0.35, 0.85), step(0.66, rim) * 0.45 * (1.0 - uEm));
        // a thin cream rim on the silhouette keeps the courier readable against dark walls
        c = mix(c, vec3(1.0, 0.96, 0.86), step(0.86, rim) * 0.8 * (1.0 - uEm));
        float cov = band > 0.9 ? 0.0 : band > 0.6 ? 0.2 : 0.45;
        c = mix(c, c * 0.45, halftone(gl_FragCoord.xy, cov, uDot * 0.8) * (1.0 - uEm));
        c = mix(c, uColor * 1.15, uEm);
        gl_FragColor = vec4(c, uId);
      }`,
  });
}

// ghost of the best run: flat translucent cyan, no ID (never inked)
export function ghostMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { ...shared },
    transparent: true, depthWrite: false,
    blending: THREE.CustomBlending, blendSrc: THREE.SrcAlphaFactor, blendDst: THREE.OneMinusSrcAlphaFactor, blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor,
    vertexShader: /* glsl */ `varying vec3 vN; void main() { vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      ${GLSL_COMMON}
      varying vec3 vN;
      void main() {
        float f = 0.25 + 0.35 * pow(1.0 - abs(normalize(vN).z), 2.0);
        float dots = halftone(gl_FragCoord.xy, 0.6, uDot * 0.7);
        gl_FragColor = vec4(vec3(0.5, 0.95, 1.0), f * (0.35 + 0.65 * dots));
      }`,
  });
}

// additive glow (traffic lights, beacons, sparkles) that leaves the ID channel alone
export function additive(extra = {}) {
  return {
    transparent: true, depthWrite: false,
    blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.SrcAlphaFactor, blendDst: THREE.OneFactor,
    blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor,
    ...extra,
  };
}
// alpha-blended overlay that leaves the ID channel alone
export function overlay(extra = {}) {
  return {
    transparent: true, depthWrite: false,
    blending: THREE.CustomBlending, blendSrc: THREE.SrcAlphaFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor,
    ...extra,
  };
}

// ink-coloured flat ID material (rings, cranes, props): flat colour with bands from the moon
export function flatMaterial(color, id, opts = {}) {
  return new THREE.ShaderMaterial({
    uniforms: { ...shared, uColor: { value: hex(color) }, uId: { value: id / 255 }, uGlow: { value: opts.glow || 0 } },
    side: opts.side || THREE.FrontSide,
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vW; varying float vInst;
      void main() {
        vInst = 0.0;
        #ifdef USE_INSTANCING
        vInst = float(gl_InstanceID);
        #endif
        vec3 p = position;
        #ifdef USE_INSTANCING
        vec4 w = modelMatrix * instanceMatrix * vec4(p, 1.0);
        vN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
        #else
        vec4 w = modelMatrix * vec4(p, 1.0);
        vN = normalize(mat3(modelMatrix) * normal);
        #endif
        vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      ${GLSL_COMMON}
      uniform vec3 uColor; uniform float uId; uniform float uGlow;
      varying vec3 vN; varying vec3 vW; varying float vInst;
      void main() {
        float band = cel(dot(normalize(vN), uSun));
        vec3 c = uColor * (0.55 + 0.6 * band);
        float cov = band > 0.9 ? 0.0 : band > 0.6 ? 0.2 : 0.45;
        c = mix(c, c * 0.45, halftone(gl_FragCoord.xy, cov, uDot) * (1.0 - uGlow));
        c = mix(c, uColor * 1.2, uGlow);
        c = fogIt(c, length(vW - uCamPos) * (1.0 - uGlow * 0.7));
        // instances get their own ID so neighbours are inked apart
        gl_FragColor = vec4(c, uId + mod(floor(vInst + 0.5), 13.0) / 255.0);
      }`,
  });
}
