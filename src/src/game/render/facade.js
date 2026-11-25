// Building facades for REDLINE's Tokyo (City engineer's file; used by tokyo.js and megacity.js).
// A night photograph of the blocks beside the Shuto: every floor carries a band of windows, most of them dark glass that
// picks up the sky glow, some lit in runs along a floor (offices) or room by room (flats), with mullions, spandrels, piers,
// blinds, balconies, AC units, shopfronts and shutters at street level. All of it is drawn in the shader, per building, from
// a seed; nothing is a texture, and every pattern fades to its own average before it gets smaller than a pixel (no shimmer).
import * as THREE from 'three';
import { U, CITY, BEND_GLSL } from './materials.js';

const FOG = /* glsl */ `
uniform vec3 uFogColor; uniform float uFogDensity;
float fogF(float depth) { float k = uFogDensity * depth; return 1.0 - exp(-k * k); }
float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
`;

// shared light on the facades (tokyo.js applyTime sets these from the mood table)
export const FACADE = {
  uFAmb: { value: new THREE.Color('#0c0f16') },        // night sky + city bounce on every wall
  uFStreet: { value: new THREE.Color('#5a4630') },     // the street's glow climbing the lower floors
  uFSky: { value: new THREE.Color('#1a1c24') },        // what dark glass mirrors
  uFCool: { value: new THREE.Color('#e9ecea') },       // fluorescent / LED office light
  uFWarm: { value: new THREE.Color('#ffc98a') },       // warm white
  uFLit: { value: 1 },                                  // overall gain of lit windows
};

// ---------- near buildings: three stacked tiers (podium, shaft, crown) in one instanced box; see tokyo.js ----------
// aKind.x = facade: 0 glass curtain wall · 1 ribbon-window office · 2 pencil building · 3 tiled mid-rise · 4 government stone ·
// 5 residential · 6 brick. aKind.y = share of lit windows · aKind.z = warmth (0 cool … 1 warm) · aKind.w = shopfront glow.
// aTier = (top of podium, top of shaft, shaft inset, crown inset) as fractions of the height.
export function facadeMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { ...U, ...FACADE, uLampCol: CITY.uLampCol, uDetail: CITY.uDetail, uWin: { value: [new THREE.Color(), new THREE.Color(), new THREE.Color(), new THREE.Color()] } },
    vertexShader: /* glsl */ `
      ${BEND_GLSL}
      attribute float aSeed; attribute float aTid; attribute vec4 aTier; attribute vec4 aKind;
      varying vec3 vLocal; varying vec3 vN; varying float vSeed; varying vec4 vKind; varying float vH; varying float vDepth; varying vec3 vView; varying vec2 vHalf; varying vec2 vWXY;
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
        vWXY = wp.xy;
        vView = wp.xyz - cameraPosition;
        wp = bendW(wp);
        vec4 mv = viewMatrix * wp;
        vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      ${FOG}
      uniform vec3 uWin[4]; uniform float uTime, uDetail, uFLit; uniform vec3 uFAmb, uFStreet, uFSky, uFCool, uFWarm, uLampCol;
      varying vec3 vLocal; varying vec3 vN; varying float vSeed; varying vec4 vKind; varying float vH; varying float vDepth; varying vec3 vView; varying vec2 vHalf; varying vec2 vWXY;
      // a box room behind the glass: f = position in the window cell (0..1), d = view ray in facade space (x along, y up, z in)
      float room(vec2 f, vec3 d, vec2 cell) {
        d.z = max(d.z, 0.05);
        vec3 o = vec3(f * cell, 0.0);
        float D = 5.0;
        float tx = (d.x > 0.0 ? cell.x - o.x : -o.x) / (abs(d.x) < 1e-4 ? 1e-4 : d.x);
        float ty = (d.y > 0.0 ? cell.y - o.y : -o.y) / (abs(d.y) < 1e-4 ? 1e-4 : d.y);
        float tz = D / d.z;
        float t = min(min(abs(tx), abs(ty)), tz);
        vec3 hp = o + d * t;
        float sh = t == tz ? 0.95 : (t == abs(ty) ? (d.y > 0.0 ? 1.0 : 0.5) : 0.75);
        // rows of ceiling luminaires, a darker band of desks and cabinets along the back wall
        if (t == abs(ty) && d.y > 0.0) sh += 1.1 * smoothstep(0.32, 0.12, abs(fract(hp.z / 2.4) - 0.5)) * step(0.15, fract(hp.x / cell.x));
        if (t == tz) sh *= 1.0 - 0.45 * smoothstep(0.36, 0.3, hp.y / cell.y);
        return sh * (1.0 - 0.3 * hp.z / D);
      }
      // 1 inside [a, b] of a 0..1 cell coordinate; blends to the covered fraction as the cell shrinks below ~2 px
      float band(float f, float a, float b, float fw, float aa) {
        float s = smoothstep(a - fw, a + fw, f) * smoothstep(b + fw, b - fw, f);
        return mix(s, b - a, aa);
      }
      void main() {
        float seed = floor(vSeed * 997.0 + 0.5) / 997.0;
        float kind = floor(vKind.x + 0.5);
        vec3 n = normalize(vN);
        vec3 V = normalize(vView);
        float y = vLocal.y;
        // light on the walls: sky and city bounce everywhere, the street's glow on the lower floors, and the expressway's own
        // lamps (9 m above the deck) washing the frontage beside the road
        float lampK = exp(-max(0.0, abs(vWXY.x) - 9.0) / 22.0) * exp(-abs(vWXY.y - 8.0) / 13.0);
        vec3 light = uFAmb + uFStreet * (0.04 + 0.5 * exp(-max(y, 0.0) / 8.0)) + uLampCol * 0.1 * lampK;
        vec3 col;
        if (n.y > 0.5) {
          // roof: membrane, a paler parapet coping, a helipad on some tall towers
          vec2 r = vLocal.xz;
          float edge = 1.0 - smoothstep(0.0, 0.6, min(vHalf.x - abs(r.x), vHalf.y - abs(r.y)));
          col = vec3(0.16, 0.16, 0.17) * light * (0.8 + 0.4 * h21(floor(r / 3.0) + seed)) + edge * vec3(0.3) * light;
          if (vH > 110.0 && fract(seed * 13.7) > 0.45 && kind < 1.5) {
            float rr = length(r);
            float ring = smoothstep(0.35, 0.1, abs(rr - 9.0));
            vec2 a = abs(r);
            float hh = step(a.x, 3.0) * step(a.y, 4.2) * (step(2.0, a.x) + step(a.y, 0.5));
            col += vec3(1.0, 0.75, 0.35) * (ring * 0.25 + hh * 0.18) + vec3(1.0, 0.6, 0.2) * step(0.8, fract(atan(r.y, r.x) * 1.9)) * smoothstep(0.4, 0.0, abs(rr - 10.5)) * 1.2;
          }
        } else if (n.y < -0.5) {
          col = vec3(0.004);
        } else {
          vec3 T = abs(n.x) > 0.5 ? vec3(0.0, 0.0, n.x) : vec3(-n.z, 0.0, 0.0);
          float halfW = abs(n.x) > 0.5 ? vHalf.y : vHalf.x;
          float uu = dot(vLocal, T);
          float u = uu + halfW;                     // 0 at one corner of the face
          // ---- the recipe: floor height, bay width, window box, wall colour, piers, how offices or homes light up
          float FH = 3.7, BW = 1.7, GF = 4.6;       // GF = height of the street-level storey
          vec4 wb = vec4(0.06, 0.94, 0.32, 0.86);   // window x0, x1, y0, y1 inside a bay
          vec3 wall = vec3(0.3); float pierN = 4.0, pierW = 0.2, runLen = 5.0, office = 1.0, mullN = 1.0;
          float tone = fract(seed * 5.1), tone2 = fract(seed * 9.7);
          if (kind < 0.5) {            // glass curtain wall: vision glass over a dark spandrel, fine aluminium mullions
            FH = 4.0; BW = 1.5; wb = vec4(0.035, 0.965, 0.27, 0.985); wall = mix(vec3(0.05, 0.06, 0.075), vec3(0.09, 0.1, 0.11), tone); pierN = 0.0; runLen = 8.0 + 14.0 * tone2;
          } else if (kind < 1.5) {     // office: ribbon windows between precast or tiled spandrels, a pier every few bays
            FH = 3.7; BW = 1.6 + 0.4 * tone2; wb = vec4(0.05, 0.95, 0.34, 0.84); wall = mix(mix(vec3(0.42, 0.4, 0.36), vec3(0.24, 0.25, 0.27), tone), vec3(0.5, 0.47, 0.4), step(0.75, tone2)); pierN = 3.0 + floor(tone * 3.0); runLen = 3.0 + 7.0 * tone2;
          } else if (kind < 2.5) {     // pencil building: one tenant a floor behind big panes, tiled side walls
            FH = 3.2; BW = 2.1; wb = vec4(0.07, 0.93, 0.2, 0.86); wall = mix(vec3(0.5, 0.48, 0.44), mix(vec3(0.3, 0.2, 0.15), vec3(0.16, 0.17, 0.19), step(0.5, tone2)), step(0.45, tone)); pierN = 0.0; runLen = 40.0; mullN = 2.0;
          } else if (kind < 3.5) {     // older tiled mid-rise: punched windows with a centre mullion, AC units under some
            FH = 3.1; BW = 2.5; wb = vec4(0.16, 0.84, 0.36, 0.8); wall = mix(vec3(0.4, 0.3, 0.22), vec3(0.46, 0.43, 0.36), tone); pierN = 0.0; runLen = 2.0 + 3.0 * tone2; mullN = 2.0;
          } else if (kind < 4.5) {     // government block: deep punched windows between stone piers, many floors still lit
            FH = 3.9; BW = 1.8; wb = vec4(0.22, 0.78, 0.26, 0.84); wall = mix(vec3(0.38, 0.36, 0.31), vec3(0.3, 0.3, 0.29), tone); pierN = 0.0; runLen = 5.0 + 10.0 * tone2;
          } else if (kind < 5.5) {     // residential: balcony slab and rail, a sliding door and window per room
            FH = 2.95; BW = 3.3; wb = vec4(0.07, 0.93, 0.4, 0.9); wall = mix(vec3(0.44, 0.43, 0.4), vec3(0.36, 0.3, 0.25), step(0.6, tone)); pierN = 2.0; pierW = 0.07; office = 0.0; mullN = 2.0; GF = 3.6;
          } else {                     // brick warehouse or old office
            FH = 4.2; BW = 2.6; wb = vec4(0.24, 0.76, 0.28, 0.8); wall = vec3(0.36, 0.15, 0.1); pierN = 0.0; runLen = 3.0 + 3.0 * tone2; mullN = 2.0;
          }
          vec2 cell = vec2(BW, FH);
          float yy = y - GF;                                            // floors start above the street-level storey
          vec2 g = vec2(u, yy) / cell;
          vec2 id = floor(g);
          vec2 f = fract(g);
          vec2 fw = fwidth(g);
          float aaX = clamp(fw.x * 2.2 - 0.3, 0.0, 1.0), aaY = clamp(fw.y * 2.2 - 0.3, 0.0, 1.0), aa = max(aaX, aaY);
          float near = 1.0 - smoothstep(0.02, 0.12, max(fw.x, fw.y));   // fine detail only where it is several pixels wide
          // the opening
          float winX = band(f.x, wb.x, wb.y, fw.x, aaX), winY = band(f.y, wb.z, wb.w, fw.y, aaY);
          float pier = 0.0;
          if (pierN > 0.5) { float pf = fract(g.x / pierN) * pierN; pier = mix(step(pf, pierW * 2.0), pierW * 2.0 / pierN, clamp(fw.x * 2.2 / pierN - 0.3, 0.0, 1.0)); }
          float win = winX * winY * (1.0 - pier);
          // frames and mullions inside the opening
          float fx = (f.x - wb.x) / (wb.y - wb.x), fy = (f.y - wb.z) / (wb.w - wb.z);
          float pxm = max(fw.x * BW, fw.y * FH);                         // metres per pixel on this wall
          float fwid = 0.04 + pxm;
          float frame = 1.0 - smoothstep(fwid, fwid * 2.0, min(min(fx, 1.0 - fx) * (wb.y - wb.x) * BW, min(fy, 1.0 - fy) * (wb.w - wb.z) * FH));
          if (mullN > 1.5) frame = max(frame, 1.0 - smoothstep(fwid * 0.5, fwid, abs(fx - 0.5) * (wb.y - wb.x) * BW));
          frame *= near;
          // ---- who is still up at 3 a.m.
          float floorR = h21(vec2(id.y * 1.37, seed * 31.0));
          float cellR = h21(id + seed * 17.0);
          float runId = floor((id.x + floorR * 23.0) / runLen);
          float runR = h21(vec2(runId * 1.13 + seed * 7.0, id.y));
          float share = vKind.y;
          float p, lit, bright;
          if (kind > 1.5 && kind < 2.5) {              // pencil: whole floors, a different tenant each
            p = min(0.9, share * 1.5); lit = step(1.0 - p, floorR); bright = 0.45 + 0.55 * fract(floorR * 7.3);
          } else if (office > 0.5) {                   // offices: runs of bays along a floor, some floors busier than others
            p = min(0.95, share * (0.3 + 1.7 * floorR * floorR));
            float run = step(1.0 - p, runR);
            lit = run * mix(step(0.14, cellR), 0.86, aaX);                      // the odd dark bay inside a lit run
            lit = mix(lit, p * 0.86, clamp(fw.x * runLen * 1.2 - 0.3, 0.0, 1.0));
            bright = (0.5 + 0.5 * fract(runR * 5.7)) * mix(0.75 + 0.25 * fract(cellR * 3.1), 0.87, aaX);
          } else {                                     // homes: room by room, behind curtains of every weight
            float roomR = h21(vec2(id.x, id.y) * 1.31 + seed * 3.0);
            p = share; lit = mix(step(1.0 - p, roomR), p, aaX);
            bright = mix(0.22 + 0.78 * pow(fract(roomR * 9.1), 1.6), 0.5, aaX);
          }
          lit = mix(lit, p * 0.8, aaY);
          if (yy < 0.0) { lit = 0.0; }
          // the stair core: one column of landings lit all night (dim, greenish) on many blocks
          float bays = max(2.0, floor(2.0 * halfW / BW));
          float stair = step(0.68, fract(seed * 23.1)) * step(abs(id.x - floor(fract(seed * 4.7) * bays)), 0.5) * step(0.0, yy) * step(0.5, kind) * step(kind, 5.5);
          // flats seen from the access-corridor side: dark doors, one ceiling lamp per bay along every floor
          float corridor = step(4.5, kind) * step(kind, 5.5) * step(0.5, fract(seed * 27.0)) * step(0.0, yy);
          if (corridor > 0.5) { lit = 0.0; stair = 0.0; }
          // colour of the light: one temperature per building, the odd floor different; pencil buildings mix in sign colours
          float wsel = h21(vec2(seed * 7.0, id.y * 0.31));
          vec3 cool = mix(uFCool, uWin[0], 0.25), warm = mix(uFWarm, uWin[1], 0.25);
          float warmth = clamp(vKind.z + (fract(seed * 3.9) - 0.5) * 0.5, 0.0, 1.0);
          vec3 lc = mix(cool, warm, step(1.0 - warmth, mix(fract(seed * 2.3), wsel, 0.35)));
          lc *= vec3(1.0, 0.98 + 0.04 * fract(seed * 6.1), 0.94 + 0.1 * fract(seed * 8.3));                  // tubes age differently
          if (kind > 1.5 && kind < 2.5 && fract(floorR * 13.0) > 0.72) lc = mix(lc, mix(vec3(1.0, 0.35, 0.5), vec3(0.45, 0.7, 1.0), step(0.5, fract(floorR * 29.0))), 0.55);
          if (office < 0.5 && fract(cellR * 23.0) > 0.9) { lc = vec3(0.4, 0.55, 1.0) * (0.75 + 0.25 * sin(uTime * 6.0 + cellR * 50.0)); bright *= 0.45; }   // a television
          // ---- dark glass: a mirror of the sky glow, stronger at grazing angles, a little different pane to pane; pale blinds in some
          float fres = pow(1.0 - abs(dot(V, n)), 3.0);
          float pane = mix(h21(id * 0.73 + seed), 0.5, aa);
          vec3 glass = vec3(0.006, 0.007, 0.009) + uFSky * (0.1 + 1.1 * fres) * (0.55 + 0.9 * pane) + uFStreet * 0.05 * exp(-max(y, 0.0) / 16.0);
          glass += wall * light * 0.35 * mix(step(0.78, cellR), 0.22, aa) * (office > 0.5 ? 1.0 : 0.6);       // blinds or curtains drawn in a dark room
          // ---- a lit room
          vec3 inside = lc * bright * 1.05;
          if (uDetail > 0.5 && vDepth < 150.0 && lit > 0.5 && aa < 0.35) {
            vec3 d = vec3(dot(V, T), V.y, -dot(V, n));
            float rm = office > 0.5 ? room(f, d, cell) : 0.55 + 0.5 * room(f, d, cell);
            inside = lc * bright * rm * 0.9;
          }
          // blinds part-way down in offices, curtains to one side in homes
          float blindY = 0.35 + 0.65 * fract(cellR * 11.0);
          float slats = mix(0.82 + 0.18 * step(0.5, fract(fy * (wb.w - wb.z) * FH / 0.07)), 0.91, clamp(fwidth(fy * (wb.w - wb.z) * FH / 0.07) * 2.0, 0.0, 1.0));   // venetian blinds
          inside *= mix(mix(1.0, 0.5 * slats, step(blindY, fy) * step(0.4, fract(cellR * 5.0))), 0.8, aa);
          if (stair > 0.5) { lit = max(lit, mix(1.0, 0.5, aa)); inside = vec3(0.6, 0.72, 0.62) * 0.26 * (0.7 + 0.6 * fract(cellR * 3.0)); }
          vec3 wcol = mix(glass, inside * uFLit, lit);
          wcol = mix(wcol, vec3(0.1, 0.105, 0.11) * light * 2.0 + wcol * 0.15, frame);
          // ---- the wall: panel joints, a slab line at every floor, weathering streaks below the sills, darker end walls
          float faceK = (abs(n.x) > 0.5 ? 1.0 : 0.7) * (0.9 + 0.2 * fract(seed * 41.0));
          vec3 wc = wall * light * faceK;
          wc *= 1.0 - 0.3 * near * (1.0 - smoothstep(0.0, 0.02, f.y)) - 0.15 * near * (1.0 - smoothstep(0.0, 0.012, f.x));
          wc *= mix(0.86 + 0.28 * h21(vec2(floor(u / 0.55), seed)), 1.0, clamp(fwidth(u / 0.55) * 2.0, 0.0, 1.0));
          wc *= 1.0 - 0.18 * (1.0 - aaY) * smoothstep(wb.z, wb.z - 0.3, f.y) * step(0.3, fract(cellR * 7.0));
          if (kind > 2.5 && kind < 3.5 || kind > 5.5) {   // small tiles or brick courses, only up close
            vec2 tg = vec2(u / 0.24, y / 0.09); float tk = 1.0 - smoothstep(0.03, 0.2, max(fwidth(tg.x), fwidth(tg.y)));
            wc *= 1.0 - 0.22 * tk * step(min(fract(tg.x + 0.5 * floor(tg.y)), fract(tg.y)), 0.08);
          }
          if (kind < 0.5) wc += uFSky * (0.06 + 0.5 * fres) * 0.6;       // spandrel glass and mullions carry a duller reflection
          col = wc;
          if (kind > 4.5 && kind < 5.5) {   // balconies: slab edge, frosted rail panels lit faintly from the room behind
            float slab = band(f.y, 0.0, 0.07, fw.y, aaY), rail = band(f.y, 0.07, 0.38, fw.y, aaY) * (1.0 - pier);
            col = mix(col, wall * light * 1.25, slab);
            col = mix(col, glass * 0.5 + wall * light * 0.45 + lc * lit * 0.05, rail * 0.9);
          }
          if (kind > 2.5 && kind < 3.5) {   // AC condenser under the sill
            float ac = step(0.55, f.x) * step(f.x, 0.8) * step(0.08, f.y) * step(f.y, 0.27) * step(0.45, fract(cellR * 17.0)) * near;
            col = mix(col, vec3(0.5, 0.5, 0.48) * light * (0.8 + 0.2 * step(0.5, fract(f.x * 40.0))), ac);
          }
          col = mix(col, wcol, win);
          if (corridor > 0.5) {
            float lampD = (1.0 - smoothstep(0.03, 0.05 + fw.x, abs(f.x - 0.5))) * (1.0 - smoothstep(0.015, 0.03 + fw.y, abs(f.y - 0.86)));
            col += uFCool * vec3(0.86, 1.0, 0.9) * (mix(lampD, 0.012, aa) * 1.7 + 0.035 * band(f.y, 0.4, 0.92, fw.y, aaY)) * uFLit;
          }
          // ---- street level: glazed shopfronts and lobbies, shutters down on the closed ones, a fascia band above
          if (yy < 0.0) {
            float sw = kind < 1.5 ? 6.0 : 3.6;                          // a unit's width
            vec2 sg = vec2(u / sw, y / GF);
            float sid = floor(sg.x); vec2 sf = vec2(fract(sg.x), sg.y);
            float sfw = fwidth(sg.x), saa = clamp(sfw * 2.2 - 0.3, 0.0, 1.0);
            float sr = h21(vec2(sid, seed * 77.0));
            float open = step(1.0 - clamp(vKind.w * 0.55, 0.0, 0.85), sr);
            float glz = band(sf.x, 0.05, 0.95, sfw, saa) * step(0.04, sf.y) * step(sf.y, 0.72);
            vec3 shopC = mix(vec3(1.0, 0.86, 0.66), vec3(0.86, 0.94, 1.0), step(0.5, fract(sr * 9.0)));
            float rib = mix(0.8 + 0.2 * step(0.5, fract(y / 0.12)), 0.9, clamp(fwidth(y / 0.12) * 2.0, 0.0, 1.0));
            vec3 closed = office > 0.5 && kind < 1.5 ? glass + uFStreet * 0.03 : vec3(0.3, 0.31, 0.32) * light * rib;   // dark lobby glass or a roller shutter
            vec3 lit0 = shopC * (0.55 + 0.4 * fract(sr * 5.0)) * (0.6 + 0.4 * sf.y) * uFLit;
            lit0 *= 1.0 - 0.5 * near * step(abs(fract(sf.x * 3.0) - 0.5), 0.03);                                  // door and window frames
            col = wall * light * faceK * 0.9;
            col = mix(col, mix(closed, lit0, open), glz);
            col = mix(col, vec3(0.07, 0.07, 0.08) * light * 3.0, step(0.78, sf.y) * step(sf.y, 0.97) * 0.8);       // fascia / canopy
          }
          // coping at the top of the wall, and a single thin crown line on a few towers (not neon: a maintenance light band)
          col = mix(col, wall * light * 1.3, smoothstep(vH - 0.5, vH - 0.3, y) * 0.8);
          float crownB = step(0.86, fract(seed * 11.0)) * step(60.0, vH) * smoothstep(vH - 1.5, vH - 1.2, y) * smoothstep(vH - 0.6, vH - 0.9, y);
          col += mix(uFCool, uWin[3], 0.3) * crownB * 0.35;
        }
        gl_FragColor = vec4(mix(col, uFogColor, fogF(vDepth)), 1.0);
      }`,
  });
}

// ---------- the far skyline and the named towers: plain instanced boxes 0.5–2 km away (megacity.js) ----------
// Floors are a pixel or two tall out there, so the picture is made of floor bands: runs of lit bays along some floors, the
// rest dark glass and wall, the whole thing sinking into the haze with distance.
export function skylineMaterial({ gain = 1 } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: { ...U, ...FACADE, uGain: { value: gain }, uWin: { value: [new THREE.Color(), new THREE.Color(), new THREE.Color(), new THREE.Color()] } },
    vertexShader: /* glsl */ `
      attribute float aSeed;
      varying vec3 vLocal; varying vec3 vN; varying float vSeed; varying float vH; varying float vDepth; varying vec3 vView; varying vec2 vHalf;
      void main() {
        vec3 sc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
        vLocal = position * sc; vHalf = sc.xz * 0.5;
        vN = normal; vSeed = aSeed; vH = sc.y;
        vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
        vView = wp.xyz - cameraPosition;
        vec4 mv = viewMatrix * wp;
        vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      ${FOG}
      uniform vec3 uWin[4]; uniform float uGain, uFLit; uniform vec3 uFAmb, uFStreet, uFSky, uFCool, uFWarm;
      varying vec3 vLocal; varying vec3 vN; varying float vSeed; varying float vH; varying float vDepth; varying vec3 vView; varying vec2 vHalf;
      void main() {
        float seed = floor(vSeed * 997.0 + 0.5) / 997.0;
        vec3 n = normalize(vN), V = normalize(vView);
        float y = vLocal.y;
        vec3 light = uFAmb * 1.3 + uFStreet * (0.04 + 0.35 * exp(-y / 30.0));
        float tone = fract(seed * 5.1), glassy = step(0.45, fract(seed * 3.3));
        vec3 wall = mix(mix(vec3(0.34, 0.33, 0.3), vec3(0.2, 0.21, 0.23), tone), vec3(0.06, 0.07, 0.085), glassy);
        vec3 col = vec3(0.1) * light;
        if (n.y < 0.5) {
          vec3 T = abs(n.x) > 0.5 ? vec3(0.0, 0.0, n.x) : vec3(-n.z, 0.0, 0.0);
          float halfW = abs(n.x) > 0.5 ? vHalf.y : vHalf.x;
          float u = dot(vLocal, T) + halfW;
          float FH = 3.9, BW = mix(2.4, 1.6, glassy);
          vec2 g = vec2(u / BW, y / FH), id = floor(g), f = fract(g), fw = fwidth(g);
          float aaX = clamp(fw.x * 2.2 - 0.3, 0.0, 1.0), aaY = clamp(fw.y * 2.2 - 0.3, 0.0, 1.0);
          float y0 = mix(0.34, 0.24, glassy), y1 = mix(0.84, 0.98, glassy);
          float winX = mix(smoothstep(0.06 - fw.x, 0.06 + fw.x, f.x) * smoothstep(0.94 + fw.x, 0.94 - fw.x, f.x), 0.88, aaX);
          float winY = mix(smoothstep(y0 - fw.y, y0 + fw.y, f.y) * smoothstep(y1 + fw.y, y1 - fw.y, f.y), y1 - y0, aaY);
          float win = winX * winY;
          float share = 0.07 + 0.3 * pow(fract(seed * 19.7), 1.8);
          float floorR = h21(vec2(id.y * 1.37, seed * 31.0));
          float runLen = 4.0 + 12.0 * fract(seed * 7.7);
          float runR = h21(vec2(floor((id.x + floorR * 23.0) / runLen) * 1.13 + seed * 7.0, id.y));
          float p = min(0.9, share * (0.2 + 1.6 * floorR * floorR));
          float lit = step(1.0 - p, runR) * mix(step(0.15, h21(id + seed * 17.0)), 0.85, aaX);
          lit = mix(lit, p * 0.85, clamp(fw.x * runLen * 1.2 - 0.3, 0.0, 1.0));
          // floors thinner than a pixel: keep a slow rhythm of brighter and darker storeys instead of noise
          float slow = h21(vec2(floor(id.y / max(1.0, floor(fw.y * 3.0))), seed * 13.0));
          lit = mix(lit, share * (0.35 + 1.1 * slow * slow), aaY);
          vec3 lc = mix(mix(uFCool, uWin[0], 0.25), mix(uFWarm, uWin[1], 0.25), step(0.62, fract(seed * 2.3 + floorR * 0.25)));
          float fres = pow(1.0 - abs(dot(V, n)), 3.0);
          vec3 glass = vec3(0.005, 0.006, 0.008) + uFSky * (0.12 + 1.0 * fres) * (0.6 + 0.8 * mix(h21(id * 0.73 + seed), 0.5, max(aaX, aaY)));
          float faceK = (abs(n.x) > 0.5 ? 1.0 : 0.72) * (0.85 + 0.3 * fract(seed * 41.0));
          col = mix(wall * light * faceK, mix(glass, lc * (0.5 + 0.4 * fract(runR * 5.7)) * 0.95 * uFLit, lit), win);
          col = mix(col, wall * light * 1.3, smoothstep(vH - 1.5, vH - 0.8, y) * 0.7);
        }
        col *= uGain;
        // the air between here and there: towers sink into the city's haze
        float haze = clamp(1.0 - exp(-vDepth * 0.00075), 0.0, 0.9);
        gl_FragColor = vec4(mix(col, uFogColor * 1.15, haze), 1.0);
      }`,
  });
}
