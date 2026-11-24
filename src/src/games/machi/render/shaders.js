// GLSL for MACHI. Voxel surfaces get their texture from procedural patterns keyed by block type,
// lighting from baked flood-fill light (sky + coloured block light) and vertex AO.
export const COMMON = /* glsl */`
float hash3(vec3 p){ p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419)); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float hash2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash2(i), hash2(i + vec2(1.0, 0.0)), f.x), mix(hash2(i + vec2(0.0, 1.0)), hash2(i + vec2(1.0, 1.0)), f.x), f.y); }
vec3 aces(vec3 x){ return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
`;

export const VOXEL_VERT = /* glsl */`
attribute vec4 aDat;
attribute vec4 aLit;
varying vec3 vPos;
varying vec4 vLit;
varying float vAo;
varying float vId;
varying float vFace;
varying float vFlags;
varying float vDist;
varying vec3 vW;
#ifdef ENTITY
uniform vec4 uEntLit;
#endif
void main(){
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vPos = position;
  vW = wp.xyz;
  vId = aDat.x; vFace = aDat.y; vAo = aDat.z; vFlags = aDat.w;
#ifdef ENTITY
  vLit = uEntLit;
#else
  vLit = aLit;
#endif
  vec4 mv = viewMatrix * wp;
  vDist = length(mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;

export const VOXEL_FRAG = /* glsl */`
uniform vec4 uPal[96];
uniform float uEm[96];
uniform float uTime;
uniform float uNight;
uniform float uBlockGain;
uniform float uEmGain;
uniform float uWet;
uniform float uFogDensity;
uniform float uExposure;
uniform float uFlicker;
uniform vec3 uSkyAmb;
uniform vec3 uSunDir;
uniform vec3 uSunCol;
uniform vec3 uFogCol;
uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform vec3 uTrainA;
uniform vec3 uTrainB;
uniform vec3 uTrainCol;
uniform vec2 uWorldC;
uniform vec2 uFade;
varying vec3 vPos;
varying vec4 vLit;
varying float vAo;
varying float vId;
varying float vFace;
varying float vFlags;
varying float vDist;
varying vec3 vW;
${COMMON}
vec3 faceN(int f){
  if (f == 0) return vec3(1.0, 0.0, 0.0); if (f == 1) return vec3(-1.0, 0.0, 0.0);
  if (f == 2) return vec3(0.0, 1.0, 0.0); if (f == 3) return vec3(0.0, -1.0, 0.0);
  if (f == 4) return vec3(0.0, 0.0, 1.0); return vec3(0.0, 0.0, -1.0);
}
vec3 skyColor(vec3 d){ float e = clamp(d.y, 0.0, 1.0); return mix(uHorizon, uZenith, pow(e, 0.55)); }
void main(){
  int id = int(vId + 0.5);
  vec4 pal = uPal[id];
  int pat = int(pal.w + 0.5);
  int f = int(vFace + 0.5);
  vec3 n = faceN(f);
  vec3 cell = floor(vPos - n * 0.002);
  vec3 lp = vPos - cell;
  vec2 uv = (f < 2) ? lp.zy : (f < 4) ? lp.xz : lp.xy;
  vec2 wuv = (f < 2) ? vPos.zy : (f < 4) ? vPos.xz : vPos.xy;
  bool side = f != 2 && f != 3;
  float h = hash3(cell);
  vec3 col = pal.rgb * (0.9 + 0.2 * h);
  float em = uEm[id];
  float bevel = 0.1;
  float alpha = 1.0;
  float gloss = 0.0;
  // ---- procedural surface patterns ----
  if (pat == 1) { // facade tiles
    vec2 t = wuv * 4.0; vec2 ft = fract(t);
    float line = step(ft.x, 0.09) + step(ft.y, 0.09);
    col *= (0.94 + 0.12 * hash2(floor(t))) * mix(1.0, 0.72, min(line, 1.0));
    gloss = 0.15;
  } else if (pat == 2) { // brick
    vec2 t = vec2(wuv.x * 2.0, wuv.y * 4.0); if (!side) t = wuv * vec2(2.0, 4.0);
    t.x += 0.5 * mod(floor(t.y), 2.0); vec2 ft = fract(t);
    float mortar = max(step(ft.x, 0.06), step(ft.y, 0.1));
    col *= (0.85 + 0.3 * hash2(floor(t)));
    col = mix(col, vec3(0.32, 0.3, 0.28), mortar * 0.8);
    bevel = 0.04;
  } else if (pat == 3) { // wood planks
    float along = side ? wuv.y : wuv.x;
    float across = side ? wuv.x : wuv.y;
    float plank = floor(across * 3.0);
    float grain = 0.9 + 0.1 * sin(along * 30.0 + vnoise(vec2(along * 3.0, plank * 7.0)) * 6.0 + plank);
    col *= grain * (0.9 + 0.2 * hash2(vec2(plank, cell.y + cell.x)));
    col *= mix(1.0, 0.65, step(fract(across * 3.0), 0.06));
  } else if (pat == 4) { // kawara roof tiles: rounded channels + overlapping rows
    float u2 = (f == 2 || f == 3) ? vPos.x : (f < 2 ? vPos.z : vPos.x);
    float v2 = (f == 2 || f == 3) ? vPos.z : vPos.y;
    float ch = abs(sin(u2 * 3.14159 * 3.0));
    float row = fract(v2 * 2.0);
    col *= (0.62 + 0.45 * ch) * (0.82 + 0.18 * smoothstep(0.0, 0.25, row));
    gloss = 0.25;
  } else if (pat == 5) { // corrugated metal
    float u2 = side ? (f < 2 ? vPos.z : vPos.x) : vPos.x;
    col *= 0.8 + 0.2 * sin(u2 * 6.2831 * 4.0);
    col = mix(col, vec3(0.35, 0.2, 0.12), smoothstep(0.65, 0.9, vnoise(wuv * 3.0)) * 0.5);
  } else if (pat == 6) { // paving slabs
    vec2 t = wuv * 2.0 + vec2(0.0, 0.5 * mod(floor(wuv.x * 2.0), 2.0)); vec2 ft = fract(t);
    float line = step(ft.x, 0.05) + step(ft.y, 0.05);
    col *= (0.88 + 0.2 * hash2(floor(t))) * mix(1.0, 0.7, min(line, 1.0));
    bevel = 0.0;
  } else if (pat == 7) { // grass / moss
    col *= 0.75 + 0.45 * vnoise(wuv * 9.0) ;
    col = mix(col, col * vec3(1.1, 1.15, 0.8), vnoise(wuv * 2.0));
    if (side && lp.y < 0.7) col = mix(col, vec3(0.26, 0.2, 0.15), 0.6);
    bevel = 0.0;
  } else if (pat == 8) { // leaves: alpha cutout clusters
    vec3 q = floor(vPos * 4.0 + n * 0.01);
    float k = hash3(q);
    if (k < 0.3 && vFlags < 0.5) discard;
    col *= 0.72 + 0.5 * k;
    em *= uNight;
    if (vFlags > 0.5) { // cross plants: blossom dots
      vec2 c2 = fract(vec2(length(lp.xz - 0.5) * 3.0, lp.y * 3.0));
      if (lp.y > 0.85 || k < 0.15) discard;
    }
    bevel = 0.0;
  } else if (pat == 10) { // neon tube
    col = pal.rgb;
    em *= 0.92 + 0.08 * sin(uTime * 3.0 + h * 40.0) * uFlicker;
    bevel = 0.0;
  } else if (pat == 11) { // vending screen: rows of lit bottles
    vec2 t = vec2(wuv.x * 4.0 + wuv.y * 0.0, lp.y);
    if (f < 2) t.x = vPos.z * 4.0;
    float slot = hash2(vec2(floor(t.x), cell.y));
    vec3 bottle = 0.5 + 0.5 * cos(6.2831 * (slot + vec3(0.0, 0.33, 0.67)));
    float inBottle = step(0.2, fract(t.x)) * step(fract(t.x), 0.8) * step(0.2, lp.y) * step(lp.y, 0.75);
    col = mix(pal.rgb, bottle * 1.2, inBottle * 0.85);
    bevel = 0.0;
  } else if (pat == 12) { // cloth noren: slit panels with soft folds
    float u2 = (f < 2) ? vPos.z : vPos.x;
    if (abs(fract(u2 * 2.0) - 0.5) > 0.47 && lp.y < 0.85) discard;
    col *= 0.85 + 0.15 * sin(u2 * 25.0);
    if (lp.y > 0.86) col *= 0.6;
    bevel = 0.0;
  } else if (pat == 13) { // gravel / soil speckle
    float s = hash2(floor(wuv * 12.0));
    col *= 0.75 + 0.45 * s;
    bevel = 0.0;
  } else if (pat == 14) { // asphalt
    col *= 0.85 + 0.25 * hash2(floor(wuv * 10.0)) * vnoise(wuv * 1.3) + 0.1 * vnoise(wuv * 0.4);
    bevel = 0.0; gloss = 0.1;
  } else if (pat == 15) { // lantern: ribbed paper, dark caps
    float rib = 0.82 + 0.18 * sin(lp.y * 3.14159 * 9.0);
    float cap = step(lp.y, 0.18) + step(0.82, lp.y);
    if (f == 2 || f == 3) cap = 1.0;
    col = pal.rgb * rib;
    em *= (1.0 - cap) * (0.9 + 0.1 * sin(uTime * 7.0 + h * 50.0) * uFlicker) * (0.75 + 0.5 * (1.0 - abs(lp.y - 0.5) * 2.0));
    col = mix(col, vec3(0.05), cap);
    bevel = 0.0;
  } else if (pat == 16) { // window with frame and curtains
    float fr = max(step(uv.x, 0.07) + step(0.93, uv.x), step(uv.y, 0.07) + step(0.93, uv.y));
    if (em > 0.0) {
      float curtain = step(0.6, h) * smoothstep(0.2, 0.0, abs(uv.x - 0.5) - 0.25);
      col = pal.rgb * (0.6 + 0.6 * hash3(cell + 17.0)) * (1.0 - 0.45 * curtain);
      em *= mix(0.18, 1.0, uNight);
    } else {
      vec3 r = reflect(normalize(vW - cameraPosition), n);
      col = mix(pal.rgb, skyColor(r) * 0.6, 0.45);
      gloss = 0.4;
    }
    col = mix(col, vec3(0.08, 0.08, 0.09), fr); em *= 1.0 - fr;
    bevel = 0.0;
  } else if (pat == 17) { // placeholder
    col = mod(floor(wuv.x * 4.0) + floor(wuv.y * 4.0), 2.0) < 1.0 ? vec3(1.0, 0.0, 1.0) : vec3(0.02);
  } else if (pat == 19) { // stone
    vec2 t = wuv * vec2(1.5, 2.0); t.x += 0.5 * mod(floor(t.y), 2.0);
    vec2 ft = fract(t);
    col *= (0.82 + 0.3 * hash2(floor(t))) * (0.9 + 0.2 * vnoise(wuv * 6.0));
    col *= mix(1.0, 0.72, max(step(ft.x, 0.04), step(ft.y, 0.05)));
    bevel = 0.05;
  } else if (pat == 20) { // plaster: subtle noise and a little grime near the bottom of walls
    col *= 0.94 + 0.1 * vnoise(wuv * 5.0);
    bevel = 0.05;
  } else if (pat == 21) { // shoji: lattice over lit paper
    float u2 = side ? uv.x : uv.x;
    float lat = max(step(abs(fract(u2 * 3.0) - 0.5), 0.07), step(abs(fract(uv.y * 4.0) - 0.5), 0.06));
    if (!side) lat = 1.0;
    col = mix(pal.rgb, vec3(0.16, 0.1, 0.07), lat);
    em *= (1.0 - lat) * mix(0.15, 1.0, uNight);
    bevel = 0.0;
  } else if (pat == 22) { // rail bed: ballast, sleepers, rails
    col *= 0.75 + 0.4 * hash2(floor(wuv * 10.0));
    if (f == 2) {
      if (fract(vPos.z * 2.0) < 0.3) col = vec3(0.16, 0.12, 0.1);
      float rx = fract(vPos.x / 3.0);
      if (abs(vPos.x - (uTrainA.x - 1.05)) < 0.12 || abs(vPos.x - (uTrainA.x + 1.05)) < 0.12) { col = vec3(0.55, 0.55, 0.58); gloss = 0.8; }
    }
    bevel = 0.0;
  } else if (pat == 23) { // panel: smooth, seams at edges
    col *= 0.96 + 0.08 * vnoise(wuv * 3.0);
    bevel = 0.18;
  } else if (pat == 24) { // books on shelves
    vec2 t = vec2((f < 2 ? vPos.z : vPos.x) * 7.0, wuv.y * 2.0);
    float b = hash2(floor(t));
    vec3 spine = 0.5 + 0.45 * cos(6.2831 * (b + vec3(0.0, 0.3, 0.6)));
    float shelf = step(fract(t.y), 0.12);
    col = mix(spine * 0.55, vec3(0.2, 0.12, 0.08), shelf);
    if (!side) col = pal.rgb;
    bevel = 0.0;
  }
  // bevel: darken voxel edges slightly so blocks read as blocks
  if (bevel > 0.0 && vFlags < 0.5) {
    float e = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
    col *= 1.0 - bevel * (1.0 - smoothstep(0.0, 0.08, e));
  }
  // ---- wet ground ----
  vec3 V = normalize(vW - cameraPosition);
  if (uWet > 0.0 && f == 2) {
    float puddle = smoothstep(0.55, 0.75, vnoise(vW.xz * 0.35));
    col *= mix(1.0, 0.55, uWet);
    gloss = max(gloss, uWet * mix(0.35, 1.0, puddle));
  }
  // ---- lighting ----
  float aoF = vAo < 0.5 ? 0.38 : vAo < 1.5 ? 0.6 : vAo < 2.5 ? 0.8 : 1.0;
  float sky = vLit.x;
  vec3 bl = vLit.yzw;
  vec3 blk = pow(bl, vec3(2.0)) * uBlockGain;
  float hemi = 0.6 + 0.4 * n.y + (n.y < -0.5 ? -0.25 : 0.0);
  vec3 amb = uSkyAmb * pow(sky, 1.7) * hemi;
  float sunVis = smoothstep(0.82, 1.0, sky);
  vec3 sun = uSunCol * max(dot(n, uSunDir), 0.0) * sunVis;
  // moving light from the train windows
  vec3 tr = vec3(0.0);
  if (uTrainCol.r > 0.0) {
    vec3 ab = uTrainB - uTrainA; float t = clamp(dot(vW - uTrainA, ab) / dot(ab, ab), 0.0, 1.0);
    vec3 dv = uTrainA + ab * t - vW; float d2 = dot(dv, dv);
    tr = uTrainCol * max(dot(n, normalize(dv)) * 0.7 + 0.3, 0.0) / (1.0 + d2 * 0.09);
  }
  vec3 light = (amb + blk + tr) * aoF + sun * mix(aoF, 1.0, 0.6);
  vec3 c = col * light;
  if (gloss > 0.0) {
    vec3 r = reflect(V, n);
    float fres = pow(1.0 - max(dot(-V, n), 0.0), 4.0);
    vec3 refl = skyColor(r) * (0.25 + 0.75 * sky) + blk * 0.6;
    c = mix(c, refl, clamp(gloss * (0.15 + fres), 0.0, 0.9));
  }
  if (em > 0.0) c += col * em * uEmGain;
  // ---- fog + distance fade into the surrounding city ----
  float fd = vDist * uFogDensity;
  float fog = 1.0 - exp(-fd * fd);
  float rw = length(vW.xz - uWorldC);
  fog = max(fog, smoothstep(uFade.x, uFade.y, rw));
  c = mix(c, uFogCol, fog);
  c = aces(c * uExposure);
  gl_FragColor = vec4(pow(c, vec3(1.0 / 2.2)), alpha);
#ifdef GHOST
  gl_FragColor.a = 0.55;
#endif
}
`;

// transparent pass: glass and water
export const TRANS_FRAG = /* glsl */`
uniform vec4 uPal[96];
uniform float uTime;
uniform float uNight;
uniform float uBlockGain;
uniform float uFogDensity;
uniform float uExposure;
uniform vec3 uSkyAmb;
uniform vec3 uSunDir;
uniform vec3 uSunCol;
uniform vec3 uFogCol;
uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform vec3 uMoonDir;
uniform float uWet;
uniform vec2 uWorldC;
uniform vec2 uFade;
uniform sampler2D tRefl;
uniform float uReflOn;
uniform vec2 uScreen;
varying vec3 vPos;
varying vec4 vLit;
varying float vAo;
varying float vId;
varying float vFace;
varying float vFlags;
varying float vDist;
varying vec3 vW;
${COMMON}
vec3 skyColor(vec3 d){ float e = clamp(d.y, 0.0, 1.0); return mix(uHorizon, uZenith, pow(e, 0.55)); }
void main(){
  int id = int(vId + 0.5);
  vec4 pal = uPal[id];
  int pat = int(pal.w + 0.5);
  int f = int(vFace + 0.5);
  vec3 n = f == 0 ? vec3(1,0,0) : f == 1 ? vec3(-1,0,0) : f == 2 ? vec3(0,1,0) : f == 3 ? vec3(0,-1,0) : f == 4 ? vec3(0,0,1) : vec3(0,0,-1);
  vec3 V = normalize(vPos - cameraPosition);
  float sky = vLit.x;
  vec3 blk = pow(vLit.yzw, vec3(2.0)) * uBlockGain;
  vec3 c; float a; float mirror = 0.0; vec2 distort = vec2(0.0);
  if (pat == 18) { // water: animated normal, fresnel sky, rippled reflections of nearby lights
    vec2 p = vPos.xz;
    float t = uTime;
    vec2 g = vec2(sin(p.x * 1.7 + t * 1.1) + sin(p.x * 0.6 - p.y * 1.3 + t * 0.7) * 0.6, cos(p.y * 1.9 + t * 0.9) + sin(p.y * 0.8 + p.x * 0.5 - t * 0.6) * 0.6);
    g += vec2(vnoise(p * 3.0 + t * 0.5), vnoise(p * 3.0 - t * 0.4)) - 0.5;
    if (uWet > 0.0) g += (vec2(vnoise(p * 9.0 + t * 4.0), vnoise(p * 9.0 - t * 4.0)) - 0.5) * 2.0 * uWet;
    vec3 wn = f == 2 ? normalize(vec3(g.x * 0.09, 1.0, g.y * 0.09)) : n;
    vec3 r = reflect(V, wn);
    float fres = 0.04 + 0.96 * pow(1.0 - max(dot(-V, wn), 0.0), 5.0);
    vec3 refl = skyColor(r);
    // streaky reflections of the lights that reach the water
    float streak = 0.55 + 0.45 * sin(p.y * 0.0 + (p.x * 0.3 + g.x * 2.0) * 3.0 + t * 0.8);
    vec3 lightRefl = blk * (1.4 + 1.2 * streak);
    vec3 body = pal.rgb * (uSkyAmb * (0.3 + 0.7 * sky) + blk * 0.5);
    float spec = pow(max(dot(r, uMoonDir), 0.0), 220.0) * (0.6 + uNight);
    c = mix(body, refl, fres * 0.9) + lightRefl * (0.35 + fres) + uSunCol * spec;
    a = mix(0.78, 0.95, fres);
    if (f == 2 && uReflOn > 0.5) { mirror = mix(0.45, 0.85, fres); distort = wn.xz * 0.35; c = mix(c, body + lightRefl * 0.25, mirror * 0.8); a = mix(a, 0.97, mirror); }
  } else { // glass: tinted, fresnel reflection, picks up light
    float fres = 0.08 + 0.92 * pow(1.0 - max(dot(-V, n), 0.0), 4.0);
    vec3 r = reflect(V, n);
    c = pal.rgb * (uSkyAmb * 0.6 + blk * 0.6) + skyColor(r) * fres * 0.8;
    a = 0.22 + 0.5 * fres;
  }
  float fd = vDist * uFogDensity;
  float fog = 1.0 - exp(-fd * fd);
  fog = max(fog, smoothstep(uFade.x, uFade.y, length(vPos.xz - uWorldC)));
  c = mix(c, uFogCol, fog);
  c = aces(c * uExposure);
  vec3 outc = pow(c, vec3(1.0 / 2.2));
  if (mirror > 0.0) {
    vec2 suv = gl_FragCoord.xy / uScreen + distort * 0.06;
    vec3 rc = texture2D(tRefl, vec2(1.0 - suv.x, suv.y)).rgb; // lookAt frame of the mirrored camera flips x
    outc = mix(outc, rc * vec3(0.78, 0.84, 0.92) + outc * 0.15, mirror * (1.0 - fog));
  }
  gl_FragColor = vec4(outc, a);
}
`;

export const SKY_VERT = /* glsl */`
varying vec3 vDir;
void main(){ vDir = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }
`;
export const SKY_FRAG = /* glsl */`
uniform vec3 uZenith; uniform vec3 uHorizon; uniform vec3 uGlow; uniform vec3 uSunDir; uniform vec3 uMoonDir; uniform vec3 uSunCol;
uniform float uStars; uniform float uNight; uniform float uExposure; uniform float uTime; uniform vec3 uFogCol; uniform float uSunVis;
varying vec3 vDir;
${COMMON}
void main(){
  vec3 d = normalize(vDir);
  float e = d.y;
  vec3 c = mix(uHorizon, uZenith, pow(clamp(e, 0.0, 1.0), 0.55));
  // warm city glow near the horizon at night
  c += uGlow * exp(-max(e, 0.0) * 9.0);
  // sun disc and halo
  float sd = max(dot(d, uSunDir), 0.0);
  c += uSunCol * (pow(sd, 900.0) * 6.0 + pow(sd, 12.0) * 0.25) * uSunVis;
  // moon with a soft halo
  float md = max(dot(d, uMoonDir), 0.0);
  float disc = smoothstep(0.99955, 0.9997, md);
  vec3 moonC = vec3(1.0, 0.96, 0.86) * disc * (0.9 + 0.2 * vnoise(d.xy * 400.0)) * uNight * 1.6;
  c += moonC + vec3(0.55, 0.6, 0.8) * pow(md, 60.0) * 0.25 * uNight;
  // stars, fading toward the light-polluted horizon
  vec3 sp = d * 220.0; vec3 cell = floor(sp);
  float st = hash3(cell);
  if (st > 0.985 && e > 0.05) {
    vec3 cp = cell + 0.5 + (vec3(hash3(cell + 1.0), hash3(cell + 2.0), hash3(cell + 3.0)) - 0.5) * 0.6;
    float dd = length(sp - cp);
    float tw = 0.7 + 0.3 * sin(uTime * 2.0 + st * 100.0);
    c += vec3(0.9, 0.92, 1.0) * smoothstep(0.35, 0.0, dd) * uStars * tw * smoothstep(0.05, 0.4, e) * (st - 0.985) * 66.0;
  }
  // distant skyline silhouette with a few lit windows
  float az = atan(d.z, d.x);
  float bx = floor(az * 60.0);
  float bh = 0.015 + 0.06 * pow(hash2(vec2(bx, 3.0)), 2.0) + 0.03 * vnoise(vec2(az * 8.0, 1.0));
  if (e < bh && e > -0.2) {
    vec3 sil = uFogCol * 0.75;
    vec2 wc = vec2(az * 900.0, e * 900.0);
    float win = step(0.86, hash2(floor(wc))) * step(0.3, fract(wc.x)) * step(0.3, fract(wc.y)) * uNight;
    sil += vec3(1.0, 0.75, 0.45) * win * 0.5;
    c = mix(c, sil, 0.9);
  }
  if (e < 0.0) c = mix(c, uFogCol, smoothstep(0.0, -0.05, e));
  c = aces(c * uExposure);
  gl_FragColor = vec4(pow(c, vec3(1.0 / 2.2)), 1.0);
}
`;

// ---- post: bright pass, blur chain, composite (bloom-lite, tilt-shift, vignette) ----
export const POST_VERT = /* glsl */`
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;
export const BRIGHT_FRAG = /* glsl */`
uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uThreshold;
varying vec2 vUv;
void main(){
  vec3 c = vec3(0.0);
  c += texture2D(tSrc, vUv + uTexel * vec2(-1.0, -1.0)).rgb; c += texture2D(tSrc, vUv + uTexel * vec2(1.0, -1.0)).rgb;
  c += texture2D(tSrc, vUv + uTexel * vec2(-1.0, 1.0)).rgb; c += texture2D(tSrc, vUv + uTexel * vec2(1.0, 1.0)).rgb;
  c *= 0.25;
  float l = max(c.r, max(c.g, c.b));
  float k = smoothstep(uThreshold, uThreshold + 0.25, l);
  gl_FragColor = vec4(c * k, 1.0);
}
`;
export const DOWN_FRAG = /* glsl */`
uniform sampler2D tSrc; uniform vec2 uTexel;
varying vec2 vUv;
void main(){
  vec3 c = texture2D(tSrc, vUv).rgb * 4.0;
  c += texture2D(tSrc, vUv + uTexel * vec2(-1.0, -1.0)).rgb; c += texture2D(tSrc, vUv + uTexel * vec2(1.0, -1.0)).rgb;
  c += texture2D(tSrc, vUv + uTexel * vec2(-1.0, 1.0)).rgb; c += texture2D(tSrc, vUv + uTexel * vec2(1.0, 1.0)).rgb;
  gl_FragColor = vec4(c / 8.0, 1.0);
}
`;
export const UP_FRAG = /* glsl */`
uniform sampler2D tSrc; uniform sampler2D tAdd; uniform vec2 uTexel;
varying vec2 vUv;
void main(){
  vec3 c = vec3(0.0);
  c += texture2D(tSrc, vUv + uTexel * vec2(-1.0, 0.0)).rgb * 2.0; c += texture2D(tSrc, vUv + uTexel * vec2(1.0, 0.0)).rgb * 2.0;
  c += texture2D(tSrc, vUv + uTexel * vec2(0.0, -1.0)).rgb * 2.0; c += texture2D(tSrc, vUv + uTexel * vec2(0.0, 1.0)).rgb * 2.0;
  c += texture2D(tSrc, vUv + uTexel * vec2(-1.0, -1.0)).rgb; c += texture2D(tSrc, vUv + uTexel * vec2(1.0, -1.0)).rgb;
  c += texture2D(tSrc, vUv + uTexel * vec2(-1.0, 1.0)).rgb; c += texture2D(tSrc, vUv + uTexel * vec2(1.0, 1.0)).rgb;
  gl_FragColor = vec4(c / 12.0 + texture2D(tAdd, vUv).rgb, 1.0);
}
`;
export const COMP_FRAG = /* glsl */`
uniform sampler2D tScene; uniform sampler2D tBloom; uniform sampler2D tBlur;
uniform float uBloom; uniform float uTilt; uniform float uFocus; uniform float uVignette; uniform vec2 uTexel;
varying vec2 vUv;
void main(){
  vec3 c = texture2D(tScene, vUv).rgb;
  if (uTilt > 0.0) {
    float k = clamp(abs(vUv.y - uFocus) * 2.6 - 0.25, 0.0, 1.0) * uTilt;
    if (k > 0.0) {
      vec3 b = vec3(0.0);
      for (int i = 0; i < 8; i++) { float a = float(i) * 0.785398; b += texture2D(tBlur, vUv + vec2(cos(a), sin(a)) * uTexel * 3.0 * k).rgb; }
      c = mix(c, b / 8.0, smoothstep(0.0, 0.6, k));
    }
  }
  vec3 bl = texture2D(tBloom, vUv).rgb * 0.25;
  c = 1.0 - (1.0 - c) * (1.0 - bl * uBloom);
  vec2 q = vUv - 0.5;
  c *= 1.0 - uVignette * dot(q, q) * 1.6;
  gl_FragColor = vec4(c, 1.0);
}
`;
