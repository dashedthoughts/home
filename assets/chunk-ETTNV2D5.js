import{c as Sa,d as Aa,e as La,f as Ia}from"./chunk-Z4MTP2AL.js";import{a as Ra,b as Le,c as Ta,d as Qt,e as ba,f as O,g as za,h as _e,i as Lt,k as ka,l as Ha}from"./chunk-DNFLDSNM.js";import{$ as Et,A as fa,B as ua,Ca as ht,Da as At,G as Pt,I as da,J as ha,K as ft,L as N,Ma,N as wt,S as ut,T as he,U as Ue,V as X,W as Oe,Y as pe,Z as ma,a as sa,aa as pa,b as ra,c as $e,ca as va,da as ot,ea as xa,f as vt,g as ia,ga as Ut,h as xt,ha as Kt,i as lt,ia as Zt,j as yt,ja as gt,k as St,ka as dt,na as Nt,oa as Xt,ra as ya,sa as wa,ta as Mt,u as jt,ua as Ea,x as ca,y as la,ya as ga}from"./chunk-75VSPVXA.js";import"./chunk-EK7ODJWE.js";var Rt=1/60,Ca=2.4,Ja=.2,Ot=[],ge={mx:0,my:1,swing:!1,dash:!1,zip:!1,dive:!1,yaw:0,pitch:0};function Ft(){return{t:0,plan:null,replanT:0,yaw:null,swing:!1,lastMode:-1,modeT:0,pressCool:0,zipCool:0,target:null,ring:-1,lastD:1e9,stuckT:0,magnet:null}}var eo=e=>{for(;e>Math.PI;)e-=2*Math.PI;for(;e<-Math.PI;)e+=2*Math.PI;return e};function to(e,s,i,T,o,l,m){let h=T-e,k=o-s,g=l-i,u=h*h+k*k+g*g,r=u>1e-9?((m.x-e)*h+(m.y-s)*k+(m.z-i)*g)/u:0;return r=r<0?0:r>1?1:r,Math.hypot(e+h*r-m.x,s+k*r-m.y,i+g*r-m.z)}function Pa(e,s,i,T){let o=s.x-e.x,l=s.z-e.z,m=s.y-e.y,h=Math.hypot(o,l);T.yaw=i,T.pitch=Math.atan2(m+2,Math.max(h,1))*.9;let k=e.vx*Math.cos(i)-e.vz*Math.sin(i);T.my=1,T.mx=Math.max(-1,Math.min(1,-k*.15))}function ao(e,s,i,T){let o=Object.assign({},e.S.pl),l=e.city,m=Math.atan2(-(i.x-o.x),-(i.z-o.z));ge.swing=o.prevSwing,ge.dash=!1,ge.zip=!1,ge.dive=!1;let h=0,k=s.hold,g=o.mode===O.SWING,u=1e9,r=0,G=0,B=!1,M=Math.ceil(Ca/Rt);for(let L=0;L<M;L++){Pa(o,i,m,ge),ge.dash=s.dash&&!B,B=!0,ge.dive=h<(s.dive||0),o.mode===O.SWING?k!==null?(k-=Rt,ge.swing=k>0,ge.swing||(k=null)):(G-=Rt,ge.swing=G>0):o.mode===O.AIR?k!==null&&s.attach?ge.swing=!0:(ge.swing=o.vy<0&&o.airT>.3&&o.aim>=0,ge.swing&&(G=1.3)):o.mode===O.WALL?ge.swing=o.wallT>.3&&!ge.swing:o.mode===O.GROUND?ge.swing=!ge.swing:ge.swing=!1,k!==null&&!s.attach&&o.mode!==O.SWING&&(k=null),Ot.length=0;let z=o.x,b=o.y,P=o.z;za(l,o,ge,Rt,Ot,0),T(o,i,Rt),h+=Rt;for(let _=0;_<Ot.length;_++){let d=Ot[_].type;d==="bounce"?r+=40:d==="wall"?r+=4:d==="land"&&(r+=3)}o.y<12&&(r+=(12-o.y)*Rt*2);let Q=to(z,b,P,o.x,o.y,o.z,i);if(Q<u&&(u=Q),Q<8)return r+h}let S=Math.hypot(i.x-o.x,i.y-o.y,i.z-o.z),R=r+Ca+6+Math.min(u,S)*.25+S*.35;return o.y<14&&(R+=(14-o.y)*1.5),R-=Math.hypot(o.vx,o.vz)*.12,R}var oo=[{attach:!1,hold:null},{attach:!0,hold:.5},{attach:!0,hold:.85},{attach:!0,hold:1.2},{attach:!0,hold:1.6},{attach:!0,hold:2.1},{attach:!1,hold:null,dive:.5},{attach:!1,hold:null,dash:!0}],no=[{hold:0},{hold:.2},{hold:.45},{hold:.8},{hold:1.2}];function Fa(e,s,i,T,o){let l=s.S,m=l.pl,h=e.target;if(l.run&&!l.run.done&&(h=s.runs[l.run.idx].rings[l.run.next]),i.dash=!1,i.zip=!1,i.dive=!1,!h){i.mx=0,i.my=0,i.swing=!1;return}let k=o||e.magnet||(()=>{}),g=Math.hypot(h.x-m.x,h.y-m.y,h.z-m.z);if(g<e.lastD-1?(e.lastD=g,e.stuckT=0):e.stuckT+=T,e.stuckT>6&&!e.escape){let S=h.x-m.x,R=h.z-m.z,L=Math.hypot(S,R)||1;e.escSide=-(e.escSide||1),e.escape={x:m.x-S/L*40+-R/L*40*e.escSide,y:m.y+25,z:m.z-R/L*40+S/L*40*e.escSide,until:e.t+2.2},e.stuckT=0,e.lastD=1e9,e.plan=null}e.escape&&(e.t>e.escape.until?(e.escape=null,e.plan=null):h=e.escape),e.t+=T,e.modeT+=T,e.replanT-=T,e.pressCool-=T,e.zipCool-=T,m.mode!==e.lastMode&&(e.lastMode=m.mode,e.modeT=0,e.replanT=0);let u=l.run?l.run.next:e.target;e.ring!==u&&(e.ring=u,e.replanT=0,e.plan=null,e.lastD=1e9,e.stuckT=0,e.escape=null);let r=Math.atan2(-(h.x-m.x),-(h.z-m.z));e.yaw===null&&(e.yaw=r),e.yaw+=eo(r-e.yaw)*Math.min(1,T*6),Pa(m,h,e.yaw,i);let G=h.y-m.y,B=Math.hypot(h.x-m.x,h.z-m.z),M=e.swing;switch(m.mode){case O.GROUND:M=e.modeT>.1&&!e.swing;break;case O.WALL:M=e.modeT>(m.wallUp?.55:.3)&&!e.swing;break;case O.ZIP:M=!1;break;case O.AIR:case O.SWING:{if(e.replanT<=0||!e.plan){e.replanT=Ja;let R=m.mode===O.SWING?no:oo,L=null,z=1e9;for(let b of R){if(b.attach&&m.aim<0||b.dash&&m.dash<1)continue;let P=m.mode===O.SWING?{attach:!1,hold:b.hold}:b,Q=ao(s,P,h,k);Q<z&&(z=Q,L=b)}e.plan=L?{...L,start:e.t}:null}let S=e.plan;m.mode===O.SWING?M=(S&&S.hold!==void 0&&S.hold!==null?S.hold-(e.t-S.start):1)>0&&m.lineT<2.6:(M=!!(S&&S.attach)&&m.aim>=0,S&&S.dash&&e.t-S.start<T*1.5&&(i.dash=!0),S&&S.dive&&(i.dive=e.t-S.start<S.dive),M&&!e.swing&&e.pressCool>0&&(M=!1),M&&(e.plan={attach:!1,hold:S.hold,start:e.t,fromAttach:!0})),!M&&e.swing&&(e.pressCool=.1),m.mode===O.AIR&&G>25&&B<120&&m.zipAim>=0&&e.zipCool<=0&&s.city.perches[m.zipAim*4+1]<h.y+12&&(i.zip=!0,e.zipCool=1.5);break}default:}e.swing=M,i.swing=M}var _t=e=>{let s=parseInt(e.replace("#",""),16);return new N((s>>16&255)/255,(s>>8&255)/255,(s&255)/255)},Ga={ink:"#140a2a",paper:"#f4ecd8",night:"#1a1038",fog:"#3a1d5c",fogFar:"#5a2470",magenta:"#ff2bd6",cyan:"#18e7ff",yellow:"#ffe14a",orange:"#ff7a3d",red:"#ff3355",sun:new N(-.45,.72,.53).normalize()};var Ba=232,xe={uTime:{value:0},uDot:{value:6},uRes:{value:new Pt(1,1)},uFogC:{value:_t(Ga.fog)},uFogD:{value:.0024},uSun:{value:Ga.sun.clone()},uFlicker:{value:1},uCamPos:{value:new N}},nt=`
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
`;function Da(){return new pe({uniforms:{...xe},vertexShader:`
      attribute float aId; attribute float aTone; attribute float aSeed; attribute float aLit;
      varying vec3 vW; varying vec3 vN; varying float vId; varying float vTone; varying float vSeed; varying float vLit;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); vId = aId; vTone = aTone; vSeed = aSeed; vLit = aLit;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,fragmentShader:`
      ${nt}
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
      }`})}function Va(e){return new pe({uniforms:{...xe,uMap:{value:e}},side:$e,vertexShader:`
      attribute float aId; attribute vec4 aUv; attribute float aSeed;
      varying vec2 vUv; varying vec4 vCell; varying float vId; varying float vSeed; varying vec3 vW;
      void main() {
        vUv = uv; vCell = aUv; vId = aId; vSeed = aSeed;
        vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,fragmentShader:`
      ${nt}
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
      }`})}function Wa(e){return new pe({uniforms:{...xe,uMap:{value:e}},vertexShader:`
      attribute float aId; attribute float aSeed;
      varying vec2 vUv; varying float vId; varying float vSeed; varying vec3 vW;
      void main() { vUv = uv; vId = aId; vSeed = aSeed; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,fragmentShader:`
      ${nt}
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
      }`})}function Ua(e){let s=e.sx.slice(),i=e.sz.slice(),T=e.wx.slice(),o=e.wz.slice();return new pe({uniforms:{...xe,uSX:{value:s},uSZ:{value:i},uWX:{value:T},uWZ:{value:o},uPark:{value:new da(e.park.x0,e.park.z0,e.park.x1,e.park.z1)}},vertexShader:"varying vec3 vW; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }",fragmentShader:`
      ${nt}
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
        for (int i = 0; i < 7; i++) {
          float dx = abs(p.x - uSX[i]), dz = abs(p.y - uSZ[i]);
          float hx = uWX[i] * 0.5 - 3.0, hz = uWZ[i] * 0.5 - 3.0;
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
        col = mix(side, asphalt, onRoad);
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
        float far = smoothstep(80.0, 220.0, dist);
        col = mix(col + mark * 0.55, col + mark * 0.12, far);
        col = mix(col, col * 0.5, halftone(gl_FragCoord.xy, 0.3 * (1.0 - pool), uDot));
        col = fogIt(col, dist);
        gl_FragColor = vec4(col, 1.0 / 255.0);
      }`})}function Na(){return new pe({uniforms:{...xe,uMoon:{value:new N(-.5,.42,-.76).normalize()}},side:ra,depthWrite:!1,vertexShader:"varying vec3 vD; void main() { vD = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }",fragmentShader:`
      ${nt}
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
      }`})}function Yt(e,s,i=0){return new pe({uniforms:{...xe,uColor:{value:_t(e)},uId:{value:s/255},uEm:{value:i},uGhost:{value:0}},vertexShader:"varying vec3 vN; varying vec3 vV; void main() { vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = -mv.xyz; gl_Position = projectionMatrix * mv; }",fragmentShader:`
      ${nt}
      uniform vec3 uColor; uniform float uId; uniform float uEm;
      varying vec3 vN; varying vec3 vV;
      void main() {
        vec3 n = normalize(vN);
        vec3 L = normalize(vec3(-0.55, 0.65, 0.5)); // view space: from upper left of the camera
        float band = cel(dot(n, L));
        vec3 c = uColor * (0.5 + 0.6 * band);
        // rim: a hard magenta kicker from the city behind
        float rim = 1.0 - max(dot(n, normalize(vV)), 0.0);
        c = mix(c, vec3(1.0, 0.35, 0.85), step(0.72, rim) * 0.55 * (1.0 - uEm));
        float cov = band > 0.9 ? 0.0 : band > 0.6 ? 0.2 : 0.45;
        c = mix(c, c * 0.45, halftone(gl_FragCoord.xy, cov, uDot * 0.8) * (1.0 - uEm));
        c = mix(c, uColor * 1.15, uEm);
        gl_FragColor = vec4(c, uId);
      }`})}function Oa(){return new pe({uniforms:{...xe},transparent:!0,depthWrite:!1,blending:vt,blendSrc:yt,blendDst:St,blendSrcAlpha:xt,blendDstAlpha:lt,vertexShader:"varying vec3 vN; void main() { vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`
      ${nt}
      varying vec3 vN;
      void main() {
        float f = 0.25 + 0.35 * pow(1.0 - abs(normalize(vN).z), 2.0);
        float dots = halftone(gl_FragCoord.xy, 0.6, uDot * 0.7);
        gl_FragColor = vec4(vec3(0.5, 0.95, 1.0), f * (0.35 + 0.65 * dots));
      }`})}function It(e={}){return{transparent:!0,depthWrite:!1,blending:vt,blendEquation:ia,blendSrc:yt,blendDst:lt,blendSrcAlpha:xt,blendDstAlpha:lt,...e}}function $t(e={}){return{transparent:!0,depthWrite:!1,blending:vt,blendSrc:yt,blendDst:St,blendSrcAlpha:xt,blendDstAlpha:lt,...e}}function qe(e,s,i={}){return new pe({uniforms:{...xe,uColor:{value:_t(e)},uId:{value:s/255},uGlow:{value:i.glow||0}},side:i.side||sa,vertexShader:`
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
      }`,fragmentShader:`
      ${nt}
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
      }`})}function so(){let e=[],s=[],i=[],T=[],o=[],l=[],m=[],h=0;function k(r,G,B,M,S,R,L,z,b){for(let P of[r,G,B,M])e.push(P[0],P[1],P[2]),s.push(S[0],S[1],S[2]),i.push(R),T.push(L),o.push(z),l.push(b);m.push(h,h+1,h+2,h,h+2,h+3),h+=4}function g(r,G,B,M,S,R,L,z,b,P,Q=!1){let _=d=>(1+(P*7+d*3)%229)/255;k([r,G,R],[r,S,R],[r,S,B],[r,G,B],[-1,0,0],_(0),L,z,b),k([M,G,B],[M,S,B],[M,S,R],[M,G,R],[1,0,0],_(1),L,z,b),k([r,G,B],[r,S,B],[M,S,B],[M,G,B],[0,0,-1],_(2),L,z,b),k([M,G,R],[M,S,R],[r,S,R],[r,G,R],[0,0,1],_(3),L,z,b),k([r,S,B],[r,S,R],[M,S,R],[M,S,B],[0,1,0],_(4),L,z,b),Q&&k([r,G,B],[M,G,B],[M,G,R],[r,G,R],[0,-1,0],_(5),L,z,b)}function u(){let r=new Ue;return r.setAttribute("position",new he(e,3)),r.setAttribute("normal",new he(s,3)),r.setAttribute("aId",new he(i,1)),r.setAttribute("aTone",new he(T,1)),r.setAttribute("aSeed",new he(o,1)),r.setAttribute("aLit",new he(l,1)),r.setIndex(m),r.computeBoundingSphere(),r}return{box:g,quad:k,build:u,count:()=>h}}function _a(e,s,i={}){let T=[],o=d=>(T.push(d),d),l=Ra(e.seed*3+1),m=new ot;s.add(m);let h=so(),k=d=>d.kind===Le.TOWER?.35+.45*(d.bid*.618%1):d.kind===Le.PODIUM?.55:0;for(let d of e.boxes){let p=d.tone;d.kind===Le.VIADUCT||d.kind===Le.PILLAR||d.kind===Le.WALKWAY?p=6:d.kind===Le.TORII?p=7:d.kind===Le.SHRINE||d.kind===Le.BOARD?p=8:d.kind===Le.CROWN&&(p=(d.tone+2)%6),h.box(d.x0,d.y0,d.z0,d.x1,d.y1,d.z1,p,(d.bid+1)*.137,k(d),d.i,d.kind===Le.VIADUCT||d.kind===Le.WALKWAY||d.kind===Le.BOARD)}for(let d of e.towers){let p=e.boxes.filter(w=>w.bid===d.bid&&Math.abs(w.y1-d.top)<.01&&w.kind===Le.TOWER)[0];if(!p)continue;let V=p.x1-p.x0,A=p.z1-p.z0,H=1+Math.floor(l()*3);for(let w=0;w<H;w++){let a=2+l()*5,D=2+l()*5,n=1.5+l()*2.5,Z=p.x0+2+l()*Math.max(.1,V-4-a),C=p.z0+2+l()*Math.max(.1,A-4-D);h.box(Z,p.y1,C,Z+a,p.y1+n,C+D,8,.5,0,900+w+d.bid*3)}let E=1.1,x=.5;h.box(p.x0,p.y1,p.z0,p.x1,p.y1+E,p.z0+x,p.tone,.2,0,1e3+d.bid),h.box(p.x0,p.y1,p.z1-x,p.x1,p.y1+E,p.z1,p.tone,.2,0,1001+d.bid),h.box(p.x0,p.y1,p.z0,p.x0+x,p.y1+E,p.z1,p.tone,.2,0,1002+d.bid),h.box(p.x1-x,p.y1,p.z0,p.x1,p.y1+E,p.z1,p.tone,.2,0,1003+d.bid)}for(let d of e.masts){h.box(d.x-.35,d.y0,d.z-.35,d.x+.35,d.y1,d.z+.35,8,.3,0,1200+Math.floor(d.x));for(let p=d.y0+4;p<d.y1-2;p+=5)h.box(d.x-1.6,p,d.z-.12,d.x+1.6,p+.25,d.z+.12,8,.3,0,1300+Math.floor(p))}let g=e.viaduct;h.box(g.x-g.half,g.y1,g.z0,g.x-g.half+.6,g.y1+1.2,g.z1,6,.4,0,1400),h.box(g.x+g.half-.6,g.y1,g.z0,g.x+g.half,g.y1+1.2,g.z1,6,.4,0,1401);for(let d of[-4.2,-2.6,2.6,4.2])h.box(g.x+d-.12,g.y1,g.z0,g.x+d+.12,g.y1+.25,g.z1,8,.4,0,1402);let u=e.walk;h.box(u.x0,u.y1,u.z-u.half,u.x1,u.y1+1.1,u.z-u.half+.25,6,.4,0,1410),h.box(u.x0,u.y1,u.z+u.half-.25,u.x1,u.y1+1.1,u.z+u.half,6,.4,0,1411);let r=e.park;{let d=r.hall.x,p=r.hall.z;h.box(d-10.5,7,p-7.5,d+10.5,8.2,p+7.5,8,.6,0,1420),h.box(d-8,8.2,p-5,d+8,10.4,p+5,8,.6,0,1421);let V=r.torii;h.box(V.x-6.2,7.6,V.z-.35,V.x+6.2,8.2,V.z+.35,7,.7,0,1422),h.box(V.x-8.2,10.2,V.z-.8,V.x+8.2,10.8,V.z+.8,8,.7,0,1423)}for(let d=0;d<260;d++){let p=l()*Math.PI*2,V=430+l()*600,A=Math.cos(p)*V,H=Math.sin(p)*V;if(Math.abs(A)<390&&Math.abs(H)<390)continue;let E=20+l()*40,x=20+l()*40,w=30+l()*l()*200;h.box(A-E/2,0,H-x/2,A+E/2,w,H+x/2,Math.floor(l()*6),l(),.4,2e3+d)}let G=o(Da()),B=o(h.build()),M=new X(B,G);M.matrixAutoUpdate=!1,m.add(M);let S=o(new Et(2600,2600,1,1));S.rotateX(-Math.PI/2);let R=o(Ua(e)),L=new X(S,R);L.matrixAutoUpdate=!1,m.add(L);let z=o(Sa());{let d=[],p=[],V=[],A=[],H=[],E=[],x=0;e.signs.forEach((D,n)=>{let C=D.nx,U=D.nz,oe=D.x+C*.3,te=D.z+U*.3,ne=D.x+C*2.6,J=D.z+U*2.6,ee=D.y0,je=D.y0+D.h;d.push(oe,ee,te,ne,ee,J,ne,je,J,oe,je,te),p.push(0,0,1,0,1,1,0,1);let Ne=D.kind%16,q=Ne%8/8,be=1-(Math.floor(Ne/8)+1)/2;for(let Ie=0;Ie<4;Ie++)V.push(q+.004,be+.004,1/8-.008,1/2-.008),A.push((233+n%3*0)/255*0+(1+n*11%229)/255),H.push(n*.377%1);E.push(x,x+1,x+2,x,x+2,x+3),x+=4});let w=o(new Ue);w.setAttribute("position",new he(d,3)),w.setAttribute("uv",new he(p,2)),w.setAttribute("aUv",new he(V,4)),w.setAttribute("aId",new he(A,1)),w.setAttribute("aSeed",new he(H,1)),w.setIndex(E),w.computeBoundingSphere();let a=new X(w,o(Va(z)));a.matrixAutoUpdate=!1,m.add(a)}let b=o(Aa());{let d=[],p=[],V=[],A=[],H=[],E=0,x=(n,Z,C)=>{d.push(...n.flat()),p.push(0,0,1,0,1,1,0,1);for(let U=0;U<4;U++)V.push((1+(C*13+5)%229)/255),A.push(Z);H.push(E,E+1,E+2,E,E+2,E+3),E+=4};e.screens.forEach((n,Z)=>{let C=n.t,U=.35,oe=n.y0,te=n.y0+n.h;if(n.face===0){let ne=C.cx,J=C.z0-U;x([[ne+n.w/2,oe,J],[ne-n.w/2,oe,J],[ne-n.w/2,te,J],[ne+n.w/2,te,J]],n.seed%1e3/1e3,Z)}else if(n.face===1){let ne=C.cx,J=C.z1+U;x([[ne-n.w/2,oe,J],[ne+n.w/2,oe,J],[ne+n.w/2,te,J],[ne-n.w/2,te,J]],n.seed%1e3/1e3,Z)}else if(n.face===2){let ne=C.cz,J=C.x0-U;x([[J,oe,ne-n.w/2],[J,oe,ne+n.w/2],[J,te,ne+n.w/2],[J,te,ne-n.w/2]],n.seed%1e3/1e3,Z)}else{let ne=C.cz,J=C.x1+U;x([[J,oe,ne+n.w/2],[J,oe,ne-n.w/2],[J,te,ne-n.w/2],[J,te,ne+n.w/2]],n.seed%1e3/1e3,Z)}});let w=100;for(let n of e.boxes){if(n.kind!==Le.BOARD)continue;let Z=n.i*.61%1,C=n.x1-n.x0>n.z1-n.z0,U=.05;C?(x([[n.x1,n.y0,n.z0-U],[n.x0,n.y0,n.z0-U],[n.x0,n.y1,n.z0-U],[n.x1,n.y1,n.z0-U]],Z,w++),x([[n.x0,n.y0,n.z1+U],[n.x1,n.y0,n.z1+U],[n.x1,n.y1,n.z1+U],[n.x0,n.y1,n.z1+U]],(Z+.3)%1,w++)):(x([[n.x0-U,n.y0,n.z0],[n.x0-U,n.y0,n.z1],[n.x0-U,n.y1,n.z1],[n.x0-U,n.y1,n.z0]],Z,w++),x([[n.x1+U,n.y0,n.z1],[n.x1+U,n.y0,n.z0],[n.x1+U,n.y1,n.z0],[n.x1+U,n.y1,n.z1]],(Z+.3)%1,w++))}let a=o(new Ue);a.setAttribute("position",new he(d,3)),a.setAttribute("uv",new he(p,2)),a.setAttribute("aId",new he(V,1)),a.setAttribute("aSeed",new he(A,1)),a.setIndex(H),a.computeBoundingSphere();let D=new X(a,o(Wa(b)));D.matrixAutoUpdate=!1,m.add(D)}let P=ro(e,l,o,i.trafficScale??1);m.add(P);{let d=o(new ga(1,1)),p=o(qe("#1d7a5e",180)),V=o(new Mt(.25,.35,1,6));V.translate(0,.5,0);let A=o(qe("#3a2433",179)),H=r.trees.length,E=new dt(d,p,H*2),x=new dt(V,A,H),w=new wt,a=new ft,D=new N,n=new N,Z=new N(0,1,0);r.trees.forEach((C,U)=>{a.setFromAxisAngle(Z,U),n.set(C.x,C.h*.66,C.z),D.set(C.r,C.h*.3,C.r),w.compose(n,a,D),E.setMatrixAt(U*2,w),n.set(C.x+C.r*.45,C.h*.86,C.z-C.r*.3),D.set(C.r*.62,C.h*.2,C.r*.62),w.compose(n,a,D),E.setMatrixAt(U*2+1,w),n.set(C.x,0,C.z),D.set(1,C.h*.5,1),w.compose(n,a,D),x.setMatrixAt(U,w)}),E.instanceMatrix.needsUpdate=!0,x.instanceMatrix.needsUpdate=!0,E.computeBoundingSphere(),x.computeBoundingSphere(),m.add(E,x)}let Q=io(e,o);m.add(Q);let _=co(e,o);return m.add(_.group),{group:m,update(d,p){_.update(d)},dispose(){for(let d of T)d.dispose?.();s.remove(m)},buildings:M}}function ro(e,s,i,T){let o=[],l=[],m=[],h=[],k=[],g=[],u=z=>z>=28?[3,7.5]:[2.6,6.2],r=(z,b,P,Q,_,d)=>{for(let p of u(d))for(let V of[1,-1]){let A=Math.floor(_/26*T),H=9+s()*6;for(let E=0;E<A;E++){let x=s()*_;for(let w of[-.8,.8]){let a=-Q*(p*V+w),D=P*(p*V+w);o.push(V>0?z+a:z+a+P*_,.9,V>0?b+D:b+D+Q*_),l.push(P*V,0,Q*V),m.push(_),h.push(H*(.9+s()*.2)),k.push(x),g.push(V>0?1:0)}}}},G=2*350;for(let z=0;z<e.sx.length;z++)z!==5&&r(e.sx[z],-350,0,1,G,e.wx[z]);for(let z=0;z<e.sz.length;z++)r(-350,e.sz[z],1,0,G,e.wz[z]);let B=m.length,M=i(new Et(1,1)),S=i(new Ma);S.index=M.index,S.setAttribute("position",M.getAttribute("position")),S.setAttribute("uv",M.getAttribute("uv")),S.setAttribute("aStart",new gt(new Float32Array(o),3)),S.setAttribute("aDir",new gt(new Float32Array(l),3)),S.setAttribute("aLen",new gt(new Float32Array(m),1)),S.setAttribute("aSpeed",new gt(new Float32Array(h),1)),S.setAttribute("aPhase",new gt(new Float32Array(k),1)),S.setAttribute("aCol",new gt(new Float32Array(g),1)),S.instanceCount=B;let R=i(new pe({uniforms:{...xe},...It(),vertexShader:`
      uniform float uTime; uniform vec3 uCamPos;
      attribute vec3 aStart; attribute vec3 aDir; attribute float aLen; attribute float aSpeed; attribute float aPhase; attribute float aCol;
      varying vec2 vUv; varying float vCol; varying float vFade;
      void main() {
        float t = mod(aPhase + uTime * aSpeed, aLen);
        vec3 c = aStart + aDir * t;
        vec4 mv = viewMatrix * vec4(c, 1.0);
        float d = length(c - uCamPos);
        float s = 0.9 + d * 0.006; // keep far lights a pixel or two wide instead of vanishing (no shimmer)
        mv.xy += position.xy * s * vec2(1.0, 0.7);
        vUv = uv; vCol = aCol; vFade = smoothstep(900.0, 300.0, d) * smoothstep(8.0, 20.0, t) * smoothstep(8.0, 20.0, aLen - t);
        gl_Position = projectionMatrix * mv;
      }`,fragmentShader:`
      varying vec2 vUv; varying float vCol; varying float vFade;
      void main() {
        float r = length(vUv - 0.5) * 2.0;
        float a = (1.0 - smoothstep(0.0, 1.0, r));
        a = a * a;
        vec3 c = vCol > 0.5 ? vec3(1.0, 0.92, 0.7) : vec3(1.0, 0.12, 0.2);
        gl_FragColor = vec4(c * 1.4, a * vFade);
      }`})),L=new X(S,R);return L.frustumCulled=!1,L}function io(e,s){let i=[],T=[],o=[],l=[],m=e.park;for(let r=-3;r<=3;r++)r!==0&&(i.push(m.hall.x+r*2.6,6.2,m.hall.z+6.6),T.push(1,.55,.25),o.push(1.8),l.push(0));for(let r=0;r<8;r++)i.push(m.torii.x+(r%2?7:-7),1.6,m.torii.z+6+Math.floor(r/2)*9),T.push(1,.6,.3),o.push(1.6),l.push(0);for(let r of e.masts)i.push(r.x,r.y1+.4,r.z),T.push(1,.1,.15),o.push(3.2),l.push(1);for(let r of e.towers)r.H>150&&(i.push(r.x0,r.top+.5,r.z0,r.x1,r.top+.5,r.z1),T.push(1,.1,.15,1,.1,.15),o.push(2.6,2.6),l.push(1,1));let h=e.walk;for(let r=h.x0+6;r<h.x1;r+=12)i.push(r,h.y1+3,h.z),T.push(.75,.95,1),o.push(1.4),l.push(0);let k=s(new Ue);k.setAttribute("position",new he(i,3)),k.setAttribute("aCol",new he(T,3)),k.setAttribute("aSize",new he(o,1)),k.setAttribute("aBlink",new he(l,1));let g=s(new pe({uniforms:{...xe},...It(),vertexShader:`
      uniform float uTime; uniform vec2 uRes; uniform float uFlicker;
      attribute vec3 aCol; attribute float aSize; attribute float aBlink;
      varying vec3 vCol;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        float on = aBlink > 0.5 ? 0.35 + 0.65 * step(0.5, fract(uTime * 0.7 + position.x * 0.01)) : 1.0;
        vCol = aCol * on;
        gl_PointSize = clamp(aSize * uRes.y * 0.9 / -mv.z, 2.0, 48.0);
      }`,fragmentShader:`
      varying vec3 vCol;
      void main() { float r = length(gl_PointCoord - 0.5) * 2.0; float a = 1.0 - smoothstep(0.1, 1.0, r); gl_FragColor = vec4(vCol * 1.3, a * a); }`})),u=new Nt(k,g);return u.frustumCulled=!1,u}function co(e,s){let i=e.viaduct,T=new ot,o=8,l=19,m=.8,h=s(new Oe(3,3.4,l)),k=s(new Oe(3.06,.9,l-2)),g=s(qe("#c9c6d8",214)),u=s(qe("#ffe3a0",215,{glow:1})),r=s(new Oe(3.08,.35,l-.4)),G=s(qe("#18e7ff",216,{glow:.6})),B=[new dt(h,g,o),new dt(k,u,o),new dt(r,G,o)];for(let R of B)R.frustumCulled=!1,T.add(R);let M=new wt,S=[0,.5,-.65];return{group:T,update(R){let L=i.z1-i.z0+400,z=R*22%L,b=Math.floor(R*22/L)%2===0?1:-1,P=b>0?i.z0-200+z:i.z1+200-z;for(let Q=0;Q<o;Q++){let _=P-b*Q*(l+m);for(let d=0;d<3;d++)M.makeTranslation(i.x+2.6*b*-1*0+(b>0?-2.6:2.6),i.y1+2+S[d],_),B[d].setMatrixAt(Q,M)}for(let Q of B)Q.instanceMatrix.needsUpdate=!0}}}var ve={jacket:"#ffd21f",lining:"#ff2bd6",visor:"#18e7ff",mask:"#231541",pants:"#4b37b0",pad:"#18e7ff",shoe:"#f6f1e6",sole:"#ff2bd6",glove:"#1b1030",pack:"#ff2bd6",stripe:"#fff6e0",launcher:"#18e7ff"},Jt=["spine","chest","neck","shL","elL","shR","elR","hipL","knL","hipR","knR"],ke={idle:{spine:[.08,0,0],chest:[.05,0,0],neck:[-.05,0,0],shL:[.1,0,.18],elL:[-.3,0,0],shR:[.1,0,-.18],elR:[-.3,0,0],hipL:[-.15,0,.06],knL:[.25,0,0],hipR:[-.05,0,-.06],knR:[.15,0,0]},runA:{spine:[.3,0,0],chest:[.1,.15,0],neck:[-.25,0,0],shL:[.9,0,.15],elL:[-1.2,0,0],shR:[-1,0,-.15],elR:[-1.4,0,0],hipL:[-1.1,0,.05],knL:[.6,0,0],hipR:[.5,0,-.05],knR:[1.4,0,0]},runB:{spine:[.3,0,0],chest:[.1,-.15,0],neck:[-.25,0,0],shL:[-1,0,.15],elL:[-1.4,0,0],shR:[.9,0,-.15],elR:[-1.2,0,0],hipL:[.5,0,.05],knL:[1.4,0,0],hipR:[-1.1,0,-.05],knR:[.6,0,0]},swing:{spine:[-.15,0,0],chest:[-.1,0,.1],neck:[-.35,0,0],shR:[-2.95,0,-.12],elR:[-.12,0,0],shL:[.7,0,1.1],elL:[-.9,0,0],hipL:[-1,0,.12],knL:[1.5,0,0],hipR:[-.35,0,-.08],knR:[.5,0,0]},swingLow:{spine:[-.3,0,0],chest:[-.15,0,.12],neck:[-.45,0,0],shR:[-3,0,-.1],elR:[-.05,0,0],shL:[1.1,0,.6],elL:[-.6,0,0],hipL:[-1.55,0,.1],knL:[.6,0,0],hipR:[-1.3,0,-.1],knR:[.4,0,0]},tuck:{spine:[.75,0,0],chest:[.4,0,0],neck:[.2,0,0],shL:[-.9,0,.35],elL:[-2,0,0],shR:[-.9,0,-.35],elR:[-2,0,0],hipL:[-2.1,0,.2],knL:[2.4,0,0],hipR:[-2,0,-.2],knR:[2.4,0,0]},soar:{spine:[-.25,0,0],chest:[-.15,0,0],neck:[-.4,0,0],shL:[-2.6,0,.5],elL:[-.2,0,0],shR:[.4,0,-.9],elR:[-.5,0,0],hipL:[-.9,0,.1],knL:[1.6,0,0],hipR:[.45,0,-.1],knR:[.4,0,0]},fall:{spine:[.05,0,0],chest:[0,0,0],neck:[-.3,0,0],shL:[-.4,0,2],elL:[-.5,0,0],shR:[-.4,0,-2],elR:[-.5,0,0],hipL:[-.6,0,.25],knL:[1,0,0],hipR:[-.2,0,-.25],knR:[.5,0,0]},dive:{spine:[-.1,0,0],chest:[-.1,0,0],neck:[-.7,0,0],shL:[.5,0,.35],elL:[-.15,0,0],shR:[.5,0,-.35],elR:[-.15,0,0],hipL:[.1,0,.08],knL:[.25,0,0],hipR:[.15,0,-.08],knR:[.15,0,0]},wallA:{spine:[.2,0,0],chest:[.05,.2,0],neck:[-.3,0,0],shL:[1.1,0,.3],elL:[-1.3,0,0],shR:[-1.2,0,-.3],elR:[-1.4,0,0],hipL:[-1.4,0,.1],knL:[.9,0,0],hipR:[.4,0,-.1],knR:[1.6,0,0]},wallB:{spine:[.2,0,0],chest:[.05,-.2,0],neck:[-.3,0,0],shL:[-1.2,0,.3],elL:[-1.4,0,0],shR:[1.1,0,-.3],elR:[-1.3,0,0],hipL:[.4,0,.1],knL:[1.6,0,0],hipR:[-1.4,0,-.1],knR:[.9,0,0]},dash:{spine:[.55,0,0],chest:[.2,0,0],neck:[-.6,0,0],shL:[1.3,0,.5],elL:[-.3,0,0],shR:[1.3,0,-.5],elR:[-.3,0,0],hipL:[-1.3,0,.1],knL:[1.2,0,0],hipR:[.6,0,-.1],knR:[.5,0,0]},zip:{spine:[.1,0,0],chest:[0,0,.1],neck:[-.3,0,0],shR:[-2.9,0,-.1],elR:[0,0,0],shL:[-2.6,0,.4],elL:[-.4,0,0],hipL:[.2,0,.1],knL:[.6,0,0],hipR:[.35,0,-.1],knR:[.3,0,0]},land:{spine:[.7,0,0],chest:[.3,0,0],neck:[-.4,0,0],shL:[-.4,0,.9],elL:[-.6,0,0],shR:[.5,0,-.5],elR:[-.4,0,0],hipL:[-1.6,0,.3],knL:[2.2,0,0],hipR:[-.6,0,-.3],knR:[2.3,0,0]}};function qa(e){let s={};for(let i of Jt){let T=i;i.endsWith("L")?T=i.slice(0,-1)+"R":i.endsWith("R")&&(T=i.slice(0,-1)+"L");let o=e[T]||[0,0,0];s[i]=[o[0],-o[1],-o[2]]}return s}function Dt(e,s,i){let T=new ya(e,s,3,10);return T.translate(0,-s/2-e*.4,0),new X(T,i)}function ea(e,s={}){let i=!!s.ghost,T=[],o=Ba,l=(c,W=0)=>{let ae=i?m:Yt(c,o++,W);return i||T.push(ae),ae},m=i?Oa():null;m&&T.push(m);let h=new ot,k=new ot;h.add(k);let g={},u=(c,W,ae,ie,ye)=>{let He=new ot;return He.position.set(ae,ie,ye),c.add(He),g[W]=He,He},r=(c,W,ae=0,ie=0,ye=0)=>(W.position.set(ae,ie,ye),c.add(W),T.push(W.geometry),W),G=u(k,"hips",0,0,0);r(G,new X(new ht(.15,12,8),l(ve.pants)),0,-.02,0).scale.set(1.15,.8,.85);let B=r(G,new X(new Mt(.19,.23,.2,14,1,!0),l(ve.jacket)),0,.02,-.01);B.scale.set(1.05,1,.85),i||(B.material.side=$e);let M=u(G,"spine",0,.06,0);r(M,Dt(.165,.22,l(ve.jacket)),0,.42,0).scale.set(1.12,1,.82);let R=u(M,"chest",0,.3,0);r(R,new X(new Oe(.04,.32,.02),l(ve.glove)),0,-.08,.145);let L=r(R,new X(new Oe(.34,.38,.2),l(ve.pack)),0,-.02,-.24);if(r(R,new X(new Oe(.35,.06,.205),l(ve.stripe,.6)),0,.02,-.24),!i){let c=Ia(),W=new pe({uniforms:{uMap:{value:c},uId:{value:o++/255}},vertexShader:"varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",fragmentShader:"uniform sampler2D uMap; uniform float uId; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(uMap, vUv).rgb, uId); }"});T.push(W,c);let ae=r(R,new X(new Et(.28,.28),W),0,-.01,-.342);ae.rotation.y=Math.PI}let z=u(R,"neck",0,.2,0);r(z,new X(new ht(.115,14,10),l(ve.mask)),0,.14,.01);let b=r(z,new X(new At(.105,.03,6,16,Math.PI*1.1),l(ve.visor,1)),0,.16,.012);b.rotation.set(Math.PI/2,0,Math.PI*.45-Math.PI*.55+Math.PI),b.scale.set(1,1,.75);let P=r(z,new X(new ht(.17,16,10,0,Math.PI*2,0,Math.PI*.64),l(ve.jacket)),0,.15,-.045);P.rotation.x=-.6,P.scale.set(1,1.08,1.12);let Q=r(z,new X(new Ea(.07,.2,8),l(ve.jacket)),0,.24,-.19);Q.rotation.x=-2.2;let _=new At(.13,.022,6,18),d=r(z,new X(_,l(ve.lining)),0,.17,.035);d.rotation.x=-.35,d.scale.set(1,1.15,1);for(let c of[1,-1]){let W=c>0?"L":"R",ae=u(R,"sh"+W,.215*c,.13,0);r(ae,Dt(.058,.2,l(ve.jacket)));let ie=u(ae,"el"+W,0,-.29,0);r(ie,Dt(.052,.17,l(ve.jacket))),r(ie,new X(new Mt(.06,.06,.1,10),l(ve.launcher,1)),0,-.22,0);let ye=u(ie,"hand"+W,0,-.31,0);r(ye,new X(new ht(.055,10,8),l(ve.glove)))}for(let c of[1,-1]){let W=c>0?"L":"R",ae=u(G,"hip"+W,.1*c,-.06,0);r(ae,Dt(.078,.3,l(ve.pants))),r(ae,new X(new Oe(.02,.3,.05),l(ve.jacket)),.075*c,-.2,0);let ie=u(ae,"kn"+W,0,-.42,0);r(ie,Dt(.066,.3,l(ve.pants))),r(ie,new X(new ht(.075,10,8),l(ve.pad)),0,-.02,.03).scale.set(1,1.1,.8);let ye=u(ie,"ft"+W,0,-.42,0);r(ye,new X(new Oe(.11,.09,.25),l(ve.shoe)),0,-.03,.06),r(ye,new X(new Oe(.115,.035,.255),l(ve.sole)),0,-.085,.06)}let p=7,V=new Float32Array(p*2*3),A=new Ue;A.setAttribute("position",new ut(V,3));let H=[];for(let c=0;c<p-1;c++){let W=c*2;H.push(W,W+1,W+2,W+1,W+3,W+2)}A.setIndex(H);let E=new Float32Array(p*2*3);for(let c=0;c<p*2;c++)E[c*3+2]=1;A.setAttribute("normal",new ut(E,3));let x=i?m:Yt(ve.lining,o++,.2);i||(x.side=$e,T.push(x)),T.push(A);let w=new X(A,x);w.frustumCulled=!1;let a=Array.from({length:p},()=>new N),D=!1;e.add(h),i||e.add(w);let n={};for(let c of Jt)n[c]=[0,0,0];let Z=new ft,C=new ft,U=new wt,oe=new N,te=new N,ne=new N,J=0,ee=0,je="idle",Ne=0;function q(c){let W=Math.hypot(c.vx,c.vy,c.vz);switch(c.mode){case O.SWING:{let ie=(c.y-c.ay)/Math.max(c.L,1)<-.85?ke.swingLow:ke.swing;return c.hand>0?ie:qa(ie)}case O.WALL:return ee%2?ke.wallA:ke.wallB;case O.ZIP:return ke.zip;case O.GROUND:return c.rollT>0?ke.tuck:c.landT<.2?ke.land:Math.hypot(c.vx,c.vz)>2?ee%2?ke.runA:ke.runB:ke.idle;default:return c.dashT<.25?ke.dash:c.dive?ke.dive:c.releaseT<.3||c.kickT<.25?ke.tuck:c.vy>2?c.side>0?ke.soar:qa(ke.soar):ke.fall}}function be(c,W){let ae=Math.hypot(c.vx,c.vy,c.vz)||1;te.set(c.vx/ae,c.vy/ae,c.vz/ae);let ie=Math.hypot(c.vx,c.vz);switch(c.mode){case O.SWING:oe.set(c.ax-c.x,c.ay-c.y,c.az-c.z).normalize();break;case O.ZIP:oe.set(c.zx-c.x,c.zy-c.y+3,c.zz-c.z).normalize();break;case O.WALL:oe.set(c.wnx*.35,1,c.wnz*.35).normalize(),c.wallUp&&(oe.set(-c.wnx,.25,-c.wnz).normalize(),te.set(0,1,0));break;case O.GROUND:oe.set(0,1,0);break;default:c.dive?(oe.copy(te),te.set(0,-1,0),Math.abs(oe.y)>.98&&te.set(Math.sin(c.yaw),0,Math.cos(c.yaw))):oe.set(c.vx*.012,1,c.vz*.012).normalize()}return ie<.5&&c.mode!==O.WALL&&!c.dive&&te.set(Math.sin(c.yaw),0,Math.cos(c.yaw)),te.addScaledVector(oe,-te.dot(oe)),te.lengthSq()<1e-4&&te.set(Math.sin(c.yaw),0,Math.cos(c.yaw)).addScaledVector(oe,-Math.sin(c.yaw)*oe.x-Math.cos(c.yaw)*oe.z),te.normalize(),ne.crossVectors(oe,te).normalize(),U.makeBasis(ne,oe,te),W.setFromRotationMatrix(U),c.mode===O.GROUND&&c.rollT>0&&(C.setFromAxisAngle(ne.set(1,0,0),(1-c.rollT/.45)*Math.PI*2),W.multiply(C)),W}let Ie=new ft;return{root:h,joints:g,scarf:w,update(c,W,ae,ie,ye,He){let le=c.mode===O.GROUND?c.rollT>0?.05:c.landT<.2?.12:.38:0;Ne+=(le-Ne)*.35,h.position.set(W,ae+Ne,ie);let st=Math.floor(ye*12);if(st!==J||He==="force"){J=st,ee++;let Ke=q(c),ze=.7;for(let $ of Jt){let re=n[$],Be=Ke[$]||[0,0,0];re[0]+=(Be[0]-re[0])*ze,re[1]+=(Be[1]-re[1])*ze,re[2]+=(Be[2]-re[2])*ze,g[$].rotation.set(re[0],re[1],re[2])}be(c,Ie),Z.slerp(Ie,.75),k.quaternion.copy(Z),je=c.mode,h.updateMatrixWorld(!0);let we=g.neck.getWorldPosition(new N),Ge=Math.hypot(c.vx,c.vy,c.vz),rt=new N(-c.vx,-c.vy,-c.vz).multiplyScalar(1/Math.max(Ge,1));if(Ge<3&&rt.set(-Math.sin(c.yaw)*.35,-1,-Math.cos(c.yaw)*.35).normalize(),!D){for(let $ of a)$.copy(we);D=!0}a[0].copy(we);let Ze=.09+Math.min(Ge,40)*.0035;for(let $=1;$<p;$++){let re=a[$-1],Be=Math.sin(ee*1.7+$*1.3)*.06*Math.min(1,Ge/20),mt=new N().copy(re).addScaledVector(rt,Ze).add(new N(0,-.03*(1-Math.min(1,Ge/15))+Be,Be));a[$].lerp(mt,.8);let it=a[$].clone().sub(re);it.length()>Ze&&a[$].copy(re).addScaledVector(it.normalize(),Ze)}let Ce=new N().crossVectors(rt,new N(0,1,0));Ce.lengthSq()<1e-4&&Ce.set(1,0,0),Ce.normalize().multiplyScalar(.07);for(let $=0;$<p;$++){let re=1-$/p*.5;V[$*6]=a[$].x-Ce.x*re,V[$*6+1]=a[$].y-Ce.y*re,V[$*6+2]=a[$].z-Ce.z*re,V[$*6+3]=a[$].x+Ce.x*re,V[$*6+4]=a[$].y+Ce.y*re,V[$*6+5]=a[$].z+Ce.z*re}A.attributes.position.needsUpdate=!0,A.computeBoundingSphere()}},handWorld(c,W){return g[c>0?"handR":"handL"].getWorldPosition(W)},setVisible(c){h.visible=c,w.visible=c&&!i},pose:()=>je,dispose(){e.remove(h),e.remove(w);for(let c of T)c.dispose?.()}}}function ja(e,s,i={}){let T=[],o=F=>(T.push(F),F),l=new ot;e.add(l);let m=!!i.reduced,h=24,k=new Float32Array(h*2*3),g=new Float32Array(h*2*2),u=[];for(let F=0;F<h-1;F++){let Y=F*2;u.push(Y,Y+1,Y+2,Y+1,Y+3,Y+2)}for(let F=0;F<h;F++)g[F*4]=F/(h-1),g[F*4+1]=0,g[F*4+2]=F/(h-1),g[F*4+3]=1;let r=o(new Ue);r.setAttribute("position",new ut(k,3)),r.setAttribute("uv",new ut(g,2)),r.setIndex(u);let G=o(new pe({uniforms:{...xe,uA:{value:1}},side:$e,vertexShader:"varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0); }",fragmentShader:`
      uniform float uA; varying vec2 vUv;
      void main() {
        float core = 1.0 - smoothstep(0.18, 0.42, abs(vUv.y - 0.5));
        vec3 c = mix(vec3(0.05, 0.85, 1.0), vec3(1.0), core);
        gl_FragColor = vec4(c, 251.0 / 255.0);
      }`})),B=new X(r,G);B.frustumCulled=!1,B.visible=!1,l.add(B);let M={t:0,on:!1,ax:0,ay:0,az:0,fade:0,hx:0,hy:0,hz:0,zip:!1},S=new N,R=new N,L=new N,z=new N,b=new N,P=new N;function Q(F,Y,fe){let ue=M.on;if(!ue&&M.fade<=0){B.visible=!1;return}B.visible=!0,M.t+=fe,ue||(M.fade-=fe*7);let Re=M.ax,me=M.ay,bt=M.az;L.copy(Y),z.set(Re-L.x,me-L.y,bt-L.z);let We=z.length();z.multiplyScalar(1/Math.max(We,1e-4));let De=Math.min(1,M.t/.12),Xe=We*(ue?1-Math.pow(1-De,3):Math.max(0,M.fade)),pt=(ue?Math.max(0,1-M.t/.35):.6)*Math.min(2.2,We*.05);P.copy(F.position).sub(L).normalize(),b.crossVectors(z,P).normalize();let Ct=.03+We*5e-4;for(let Pe=0;Pe<h;Pe++){let Se=Pe/(h-1),Qe=Se*Xe,t=Math.sin(Se*9-M.t*40)*pt*Math.sin(Se*Math.PI),f=(1-De)*Math.sin(Se*Math.PI)*We*.08;R.copy(L).addScaledVector(z,Qe).addScaledVector(b,t),R.y-=f;let y=R.distanceTo(F.position),K=Math.max(Ct,y*.0019)*(1-.3*Se);k[Pe*6]=R.x-b.x*K,k[Pe*6+1]=R.y-b.y*K,k[Pe*6+2]=R.z-b.z*K,k[Pe*6+3]=R.x+b.x*K,k[Pe*6+4]=R.y+b.y*K,k[Pe*6+5]=R.z+b.z*K}r.attributes.position.needsUpdate=!0}let _=o(lo()),d=(F,Y,fe)=>{let ue=o(new Kt({map:F,color:Y,sizeAttenuation:!1,depthTest:!1,depthWrite:!1,transparent:!0}));ue.blending=vt,ue.blendSrc=yt,ue.blendDst=St,ue.blendSrcAlpha=xt,ue.blendDstAlpha=lt;let Re=new Zt(ue);return Re.scale.set(fe,fe,1),Re.renderOrder=10,Re.visible=!1,l.add(Re),Re},p=d(_.ring,16777215,.045),V=d(_.diamond,16777215,.05),A=o(new At(Lt,.75,8,48)),H=o(qe("#ffe14a",228,{glow:.35})),E=o(qe("#18e7ff",229,{glow:.2})),x=new X(A,H),w=new X(A,E);x.visible=w.visible=!1,l.add(x,w);let a=o(new At(Lt-1.6,.25,6,48)),D=new X(a,o(qe("#ff2bd6",227,{glow:.5})));x.add(D);let n=o(new Mt(1.6,1.6,1,16,1,!0));n.translate(0,.5,0);let Z=o(new pe({uniforms:{...xe},...It({side:$e}),vertexShader:"varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`
      uniform float uTime; varying vec2 vUv;
      void main() {
        float a = (1.0 - vUv.y) * 0.55 + 0.1;
        float bands = 0.75 + 0.25 * step(0.5, fract(vUv.y * 40.0 - uTime * 1.5));
        gl_FragColor = vec4(vec3(1.0, 0.88, 0.3) * bands, a * 0.6);
      }`})),C=new X(n,Z);C.visible=!1,l.add(C);let U=o(fo()),oe=o(qe("#fff6e0",160,{side:$e,glow:.15})),te=new dt(U,oe,s.cranes.length);te.frustumCulled=!1,l.add(te);let ne=o(new Ue);ne.setAttribute("position",new he(s.cranes.flatMap(F=>[F.x,F.y,F.z]),3));let J=new Nt(ne,o(new pe({uniforms:{...xe,uHide:{value:new Float32Array(32)}},...It(),vertexShader:"uniform vec2 uRes; uniform float uTime; varying float vA; void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; vA = 0.6 + 0.4 * sin(uTime * 3.0 + position.x); gl_PointSize = clamp(9.0 * uRes.y * 0.5 / -mv.z, 3.0, 90.0); }",fragmentShader:"varying float vA; void main() { float r = length(gl_PointCoord - 0.5) * 2.0; float a = 1.0 - smoothstep(0.0, 1.0, r); gl_FragColor = vec4(vec3(1.0, 0.85, 0.4), a * a * vA * 0.5); }"})));J.frustumCulled=!1,l.add(J);let ee=new wt,je=new ft,Ne=new N,q=new N,be=new N(0,1,0),Ie={shu:["\u30B7\u30E5\u30C3","#ffe14a","#ff2bd6"],don:["\u30C9\u30F3!","#fff6e0","#ff3355"],byun:["\u30D3\u30E5\u30F3","#18e7ff","#ff2bd6"],zaza:["\u30BA\u30B6\u30C3","#ffe14a","#18e7ff"],suta:["\u30B9\u30BF\u30C3","#fff6e0","#18e7ff"],hyu:["\u30D2\u30E5\u30AA\u30C3","#18e7ff","#3b1d78"],perfect:["PERFECT","#ffe14a","#ff2bd6",!0],crane:["\u6298\u308A\u9DB4","#fff6e0","#ff2bd6"]},c={},W=F=>c[F]||(c[F]=o(La(...Ie[F].slice(0,3),!!Ie[F][3]))),ae=[];for(let F=0;F<6;F++){let Y=o(new Kt({transparent:!0,depthTest:!1,depthWrite:!1}));Y.blending=vt,Y.blendSrc=yt,Y.blendDst=St,Y.blendSrcAlpha=xt,Y.blendDstAlpha=lt;let fe=new Zt(Y);fe.visible=!1,fe.renderOrder=20,l.add(fe),ae.push({s:fe,t:0,life:0,base:1,rot:0})}let ie=0,ye=1;function He(F,Y,fe,ue,Re=1){let me=ae[ie++%ae.length];me.s.material.map=W(F),me.s.material.needsUpdate=!0,ye=-ye,me.x=Y,me.y=fe,me.z=ue,me.side=ye,me.t=0,me.life=.7,me.base=Re,me.s.visible=!0,me.rot=ye*(.08+Math.random()*.12),me.s.material.rotation=me.rot}let le=new N,st=new N,Ke=36,ze=o(new Ue),we=new Float32Array(Ke*4*3),Ge=new Float32Array(Ke*4),rt=[];for(let F=0;F<Ke;F++){let Y=F*4;rt.push(Y,Y+1,Y+2,Y,Y+2,Y+3)}ze.setAttribute("position",new ut(we,3)),ze.setAttribute("aA",new ut(Ge,1)),ze.setIndex(rt);let Ze=o(new pe({...$t({side:$e}),vertexShader:"attribute float aA; varying float vA; void main() { vA = aA; gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0); }",fragmentShader:"varying float vA; void main() { gl_FragColor = vec4(1.0, 0.98, 0.92, vA); }"})),Ce=new X(ze,Ze);Ce.frustumCulled=!1,l.add(Ce);let $=Array.from({length:Ke},()=>({x:0,y:0,z:0,life:0,len:0})),re=0,Be=0,mt=o(new wa(.8,20));mt.rotateX(-Math.PI/2);let it=o(new pe({...$t(),uniforms:{uA:{value:.5}},vertexShader:"varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",fragmentShader:"uniform float uA; varying vec2 vUv; void main(){ float r = length(vUv - 0.5) * 2.0; gl_FragColor = vec4(0.05, 0.02, 0.1, (1.0 - smoothstep(0.5, 1.0, r)) * uA); }"})),Tt=new X(mt,it);return l.add(Tt),{group:l,line:B,attach(F,Y,fe){M.on=!0,M.t=0,M.ax=F,M.ay=Y,M.az=fe,M.fade=1},detach(){M.on&&(M.on=!1,M.fade=1)},sticker:He,update(F){let{camera:Y,dt:fe,t:ue,pl:Re,handPos:me,aimPos:bt,zipPos:We,rings:De,cranesHidden:Xe,roofY:pt,speed:Ct}=F;if(M.on&&F.lineAnchor&&(M.ax=F.lineAnchor.x,M.ay=F.lineAnchor.y,M.az=F.lineAnchor.z),Q(Y,me,fe),bt?(p.visible=!0,p.position.copy(bt),p.material.rotation=ue*.8):p.visible=!1,We){V.visible=!0,V.position.copy(We);let v=.05+Math.sin(ue*6)*.004;V.scale.set(v,v,1)}else V.visible=!1;if(De&&De.next){let v=De.next;x.visible=!0,x.position.set(v.x,v.y,v.z),x.lookAt(v.x+v.fx,v.y,v.z+v.fz);let I=m?1:1+Math.sin(ue*5)*.03;x.scale.setScalar(I),C.visible=!0,C.position.set(v.x,0,v.z),C.scale.set(1,Math.max(1,v.y-Lt),1)}else x.visible=!1,C.visible=!1;if(De&&De.after){let v=De.after;w.visible=!0,w.position.set(v.x,v.y,v.z),w.lookAt(v.x+v.fx,v.y,v.z+v.fz),w.scale.setScalar(.7)}else w.visible=!1;for(let v=0;v<s.cranes.length;v++){let I=s.cranes[v],j=Xe===!0||Xe&&Xe[v];je.setFromAxisAngle(be,ue*1.3+v),q.set(I.x,I.y+Math.sin(ue*2+v)*.3,I.z),Ne.setScalar(j?0:1.4),ee.compose(q,je,Ne),te.setMatrixAt(v,ee)}te.instanceMatrix.needsUpdate=!0,J.visible=Xe!==!0,le.setFromMatrixColumn(Y.matrixWorld,0),st.setFromMatrixColumn(Y.matrixWorld,1);for(let v of ae){if(!v.s.visible)continue;v.t+=fe;let I=v.t/v.life;if(I>=1){v.s.visible=!1;continue}let j=m?1:I<.12?.4+I/.12*.8:I<.2?1.2-(I-.12)/.08*.2:1;R.set(v.x,v.y,v.z);let Te=Math.max(3,R.distanceTo(Y.position)),Ee=Te*.085*v.base*j;v.s.position.copy(R).addScaledVector(le,v.side*(Ee*1.25+Te*.04)).addScaledVector(st,Ee*.55+(m?0:I*Te*.02)),v.s.scale.set(Ee*2,Ee,1),v.s.material.opacity=I>.7?1-(I-.7)/.3:1}let Pe=Ct||0;Be+=fe*Math.max(0,Pe-26)*1.6;let Se=Re.vx,Qe=Re.vy,t=Re.vz,f=Math.hypot(Se,Qe,t)||1;for(;Be>1&&!m;){Be-=1;let v=$[re++%Ke],I=Math.random()*Math.PI*2,j=1.4+Math.random()*3.5;b.set(-t,0,Se).normalize(),b.lengthSq()<.5&&b.set(1,0,0),P.crossVectors(b,R.set(Se/f,Qe/f,t/f)).normalize(),v.x=F.hx+(b.x*Math.cos(I)+P.x*Math.sin(I))*j+Se/f*6,v.y=F.hy+(b.y*Math.cos(I)+P.y*Math.sin(I))*j+Qe/f*6,v.z=F.hz+(b.z*Math.cos(I)+P.z*Math.sin(I))*j+t/f*6,v.life=.28,v.len=2+Pe*.06}P.copy(Y.position);for(let v=0;v<Ke;v++){let I=$[v];I.life-=fe;let j=I.life>0?Math.min(1,I.life/.12)*.55:0,Te=I.x-Se/f*I.len,Ee=I.y-Qe/f*I.len,de=I.z-t/f*I.len;R.set(I.x-P.x,I.y-P.y,I.z-P.z),b.set(Se/f,Qe/f,t/f).cross(R).normalize().multiplyScalar(.025+R.length()*.0012);let se=v*12;we[se]=I.x-b.x,we[se+1]=I.y-b.y,we[se+2]=I.z-b.z,we[se+3]=I.x+b.x,we[se+4]=I.y+b.y,we[se+5]=I.z+b.z,we[se+6]=Te+b.x,we[se+7]=Ee+b.y,we[se+8]=de+b.z,we[se+9]=Te-b.x,we[se+10]=Ee-b.y,we[se+11]=de-b.z,Ge[v*4]=Ge[v*4+1]=j,Ge[v*4+2]=Ge[v*4+3]=0}ze.attributes.position.needsUpdate=!0,ze.attributes.aA.needsUpdate=!0;let y=Math.max(0,F.hy-pt);Tt.position.set(F.hx,pt+.06,F.hz);let K=1+y*.03;Tt.scale.set(K,1,K),it.uniforms.uA.value=Math.max(0,.55-y*.012)},dispose(){e.remove(l);for(let F of T)F.dispose?.()}}}function lo(){let e=document.createElement("canvas");e.width=e.height=128;let s=e.getContext("2d");s.lineWidth=12,s.strokeStyle="#140a2a",s.beginPath(),s.arc(64,64,44,0,7),s.stroke(),s.lineWidth=6,s.strokeStyle="#18e7ff";for(let l=0;l<4;l++)s.beginPath(),s.arc(64,64,44,l*Math.PI/2+.25,l*Math.PI/2+Math.PI/2-.25),s.stroke();s.fillStyle="#140a2a",s.beginPath(),s.arc(64,64,11,0,7),s.fill(),s.fillStyle="#ffffff",s.beginPath(),s.arc(64,64,6,0,7),s.fill();let i=document.createElement("canvas");i.width=i.height=128,s=i.getContext("2d"),s.translate(64,64),s.rotate(Math.PI/4),s.lineWidth=14,s.strokeStyle="#140a2a",s.strokeRect(-34,-34,68,68),s.lineWidth=7,s.strokeStyle="#ffe14a",s.strokeRect(-34,-34,68,68),s.fillStyle="#ffe14a",s.fillRect(-10,-10,20,20);let T=new Xt(e),o=new Xt(i);return T.colorSpace=o.colorSpace=ua,{ring:T,diamond:o,dispose(){T.dispose(),o.dispose()}}}function fo(){let e=[[0,0,.8,.25,.2,0,0,0,-.8],[0,0,.8,-.25,.2,0,0,0,-.8],[.15,.15,.35,1.5,.8,-.1,.15,.15,-.35],[-.15,.15,.35,-1.5,.8,-.1,-.15,.15,-.35],[0,0,.6,.08,.1,.65,0,.9,1.2],[0,.9,1.2,0,.75,1.5,.05,.85,1.25],[0,0,-.6,.08,.1,-.65,0,.95,-1.2]],s=[];for(let T of e)s.push(...T);let i=new Ue;return i.setAttribute("position",new he(s,3)),i.computeVertexNormals(),i.scale(1.3,1.3,1.3),i}function Ka(e){let s=new ha(4,4,{type:ca,format:fa,depthBuffer:!0,stencilBuffer:!1,samples:0});s.texture.minFilter=jt,s.texture.magFilter=jt,s.texture.generateMipmaps=!1,s.depthTexture=new va(4,4),s.depthTexture.type=la;let i={tColor:{value:s.texture},tDepth:{value:s.depthTexture},uPx:{value:new Pt(1/4,1/4)},uRes:{value:new Pt(4,4)},uNear:{value:.3},uFar:{value:3e3},uLine:{value:1.4},uMis:{value:1},uGrain:{value:1},uHatch:{value:1},uSpeed:{value:0},uPanel:{value:0},uTime:{value:0},uFrame:{value:0},uBoil:{value:1},uInk:{value:new N(.078,.039,.165)},uFlash:{value:0},uVig:{value:.35}},T=new pe({uniforms:i,depthTest:!1,depthWrite:!1,vertexShader:"varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",fragmentShader:`
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
      }`}),o=new X(new Et(2,2),T);o.frustumCulled=!1;let l=new Ut;l.add(o);let m=new pa(-1,1,1,-1,0,1);return{rt:s,uniforms:i,setSize(h,k){s.setSize(h,k),i.uPx.value.set(1/h,1/k),i.uRes.value.set(h,k),i.uLine.value=Math.max(1,k/620)},render(h,k){i.uNear.value=k.near,i.uFar.value=k.far,e.setRenderTarget(s),e.render(h,k),e.setRenderTarget(null),e.render(l,m)},dispose(){s.dispose(),s.depthTexture?.dispose(),T.dispose(),o.geometry.dispose()}}}function Za(){let e=null,s=null,i=null,T=null,o=null,l=null,m=null,h=null,k=null,g=!0,u=!0,r=!1,G=0,B=0,M=0;function S(){if(e)return!0;let A=typeof window<"u"&&(window.AudioContext||window.webkitAudioContext);if(!A)return!1;try{e=new A}catch{return!1}s=e.createGain(),s.gain.value=g?.8:0,s.connect(e.destination);let H=e.createDynamicsCompressor();H.threshold.value=-14,H.ratio.value=4,H.connect(s),i=e.createGain(),i.gain.value=.9,i.connect(H),T=e.createGain(),T.gain.value=u?.32:0,T.connect(H),k=e.createBuffer(1,e.sampleRate*2,e.sampleRate);let E=k.getChannelData(0);for(let a=0;a<E.length;a++)E[a]=Math.random()*2-1;let x=e.createBufferSource();x.buffer=k,x.loop=!0,l=e.createBiquadFilter(),l.type="bandpass",l.frequency.value=400,l.Q.value=.7,o=e.createGain(),o.gain.value=0,x.connect(l),l.connect(o),o.connect(i),x.start(),h=e.createOscillator(),h.type="triangle",h.frequency.value=70;let w=e.createBiquadFilter();return w.type="lowpass",w.frequency.value=500,m=e.createGain(),m.gain.value=0,h.connect(w),w.connect(m),m.connect(i),h.start(),!0}function R(A,H,E,x,w="bandpass",a=1,D=0){let n=e.currentTime+D,Z=e.createBufferSource();Z.buffer=k;let C=e.createBiquadFilter();C.type=w,C.Q.value=a,C.frequency.setValueAtTime(H,n),C.frequency.exponentialRampToValueAtTime(Math.max(20,E),n+A);let U=e.createGain();U.gain.setValueAtTime(0,n),U.gain.linearRampToValueAtTime(x,n+Math.min(.02,A*.2)),U.gain.exponentialRampToValueAtTime(8e-4,n+A),Z.connect(C),C.connect(U),U.connect(i),Z.start(n,Math.random()*1.5),Z.stop(n+A+.05)}function L(A,H,E,x,w,a=i,D=0){let n=e.currentTime+D,Z=e.createOscillator();Z.type=A,Z.frequency.setValueAtTime(H,n),Z.frequency.exponentialRampToValueAtTime(Math.max(20,E),n+x);let C=e.createGain();C.gain.setValueAtTime(0,n),C.gain.linearRampToValueAtTime(w,n+.008),C.gain.exponentialRampToValueAtTime(8e-4,n+x),Z.connect(C),C.connect(a),Z.start(n),Z.stop(n+x+.05)}let z=[[53,57,60,64],[52,55,59,62],[50,53,57,60],[55,60,62,65],[58,62,65,69],[57,60,64,67],[55,58,62,65],[48,52,55,58]],b=[41,40,38,43,46,45,43,36],P=A=>440*Math.pow(2,(A-69)/12),Q=84,_=60/Q;function d(A,H,E,x){for(let[w,a]of[[1,1],[2,.18]]){let D=e.createOscillator();D.type="sine",D.frequency.value=P(A)*w;let n=e.createGain();n.gain.setValueAtTime(0,H),n.gain.linearRampToValueAtTime(x*a,H+.02),n.gain.exponentialRampToValueAtTime(8e-4,H+E),D.connect(n),n.connect(T),D.start(H),D.stop(H+E+.05)}}function p(A,H){if(A==="k"){let E=e.createOscillator();E.frequency.setValueAtTime(120,H),E.frequency.exponentialRampToValueAtTime(45,H+.18);let x=e.createGain();x.gain.setValueAtTime(.5,H),x.gain.exponentialRampToValueAtTime(.001,H+.25),E.connect(x),x.connect(T),E.start(H),E.stop(H+.3)}else{let E=e.createBufferSource();E.buffer=k;let x=e.createBiquadFilter();x.type=A==="s"?"bandpass":"highpass",x.frequency.value=A==="s"?1800:7e3;let w=e.createGain(),a=A==="s"?.28:.07,D=A==="s"?.16:.04;w.gain.setValueAtTime(a,H),w.gain.exponentialRampToValueAtTime(.001,H+D),E.connect(x),x.connect(w),w.connect(T),E.start(H,Math.random()),E.stop(H+D+.02)}}function V(){if(!e||!u)return;let A=e.currentTime+.25;for(B<e.currentTime&&(B=e.currentTime+.05);B<A;){let H=Math.floor(M/4)%8,E=M%4,x=B;if(E===0){for(let w of z[H])d(w,x+Math.random()*.02,_*3.6,.05);d(b[H]-12,x,_*1.8,.16)}E===2&&d(b[H]-12+7,x,_*1.2,.1),E===0&&p("k",x),E===2&&p("k",x+_*.5),(E===1||E===3)&&p("s",x),p("h",x),p("h",x+_*.66),(H*7+E*3)%5===0&&d(z[H][(E+H)%4]+12,x+_*.5,_*1.4,.035),B+=_,M++}}return{start(){S()&&(e.state==="suspended"&&e.resume().catch(()=>{}),r=!0)},get started(){return r},setSound(A){g=A,s&&s.gain.setTargetAtTime(A?.8:0,e.currentTime,.05)},setMusic(A){u=A,T&&T.gain.setTargetAtTime(A?.32:0,e.currentTime,.2)},suspend(){e&&e.state==="running"&&e.suspend().catch(()=>{})},resume(){e&&r&&e.state==="suspended"&&e.resume().catch(()=>{})},update(A,H,E,x){if(!e||!r)return;let w=e.currentTime,a=E?Math.min(1,Math.max(0,(A-6)/50)):0;o.gain.setTargetAtTime(a*a*.5,w,.08),l.frequency.setTargetAtTime(300+a*1700,w,.1),m.gain.setTargetAtTime(E?Math.min(.06,H*.06):0,w,.05),h.frequency.setTargetAtTime(60+H*40,w,.1),G-=x,G<=0&&(G=.1,V())},sfx(A,H=1){if(!(!e||!r||!g))switch(A){case"fire":R(.12,5200,1400,.22,"bandpass",3),L("square",1500,600,.05,.03);break;case"catch":L("sine",180,90,.12,.18),R(.06,900,400,.08);break;case"release":R(.32,700,2600,.22*H,"bandpass",.8);break;case"perfect":R(.35,900,3200,.25,"bandpass",.8),L("triangle",880,1760,.18,.06),L("triangle",1320,2640,.2,.04,i,.06);break;case"dash":R(.3,3e3,300,.3,"bandpass",1.2),L("sawtooth",220,80,.2,.04);break;case"zip":R(.5,400,3e3,.18,"bandpass",2);break;case"land":L("sine",140,50,.18,.35*H),R(.1,1200,300,.15*H,"lowpass");break;case"bounce":L("sine",110,40,.35,.5),R(.25,600,120,.3,"lowpass"),L("square",220,180,.08,.04);break;case"wall":R(.18,2500,900,.12,"bandpass",2);break;case"kick":L("sine",200,80,.12,.2),R(.15,1500,3e3,.1);break;case"ring":L("triangle",988,988,.12,.08),L("triangle",1319,1319,.2,.07,i,.07);break;case"finish":[659,784,988,1319].forEach((E,x)=>L("triangle",E,E,.35,.07,i,x*.09));break;case"crane":L("sine",1568,1568,.25,.07),L("sine",2093,2093,.35,.05,i,.08);break;case"close":R(.2,1800,600,.12,"bandpass",1.5);break;case"ui":L("square",1200,1200,.03,.03);break;case"uiback":L("square",700,700,.04,.03);break;case"chain":L("triangle",660+Math.min(12,H)*40,660+Math.min(12,H)*40,.08,.04);break;default:}},dispose(){try{e&&e.close()}catch{}e=null}}}var Vt={low:{name:"LOW",pixels:42e4,dot:5,hatch:0,traffic:.5},balanced:{name:"BALANCED",pixels:85e4,dot:6,hatch:1,traffic:1},high:{name:"HIGH",pixels:13e5,dot:6.5,hatch:1,traffic:1}},Ya=()=>typeof navigator<"u"&&navigator.maxTouchPoints>0&&Math.min(screen.width,screen.height)<820,Xa=e=>Vt[e]?e:Ya()?"low":"balanced",qt=e=>{for(;e>Math.PI;)e-=2*Math.PI;for(;e<-Math.PI;)e+=2*Math.PI;return e},Qa=new Int32Array(256);function Wo(){try{return!!document.createElement("canvas").getContext("webgl2")}catch{return!1}}function Uo(e,s={}){let i=s.onEvent||(()=>{}),T=s.onHud||(()=>{}),o=!!s.reduced,l={quality:"auto",sens:1,invertY:!1,assist:!0,sound:!0,music:!0,...s.settings||{}},m=new xa({canvas:e,antialias:!1,alpha:!1,stencil:!1,depth:!0,powerPreference:"high-performance"});m.setClearColor(0,0),m.info.autoReset=!1,m.autoClear=!0;let h=!1,k=t=>{t.preventDefault(),h=!0,i({type:"contextlost"})};e.addEventListener("webglcontextlost",k);let g=ka(),u=g.S,r=new Ut,G=new ma(66,1,.3,3e3),B=new X(new ht(1800,32,16),Na());B.frustumCulled=!1,B.renderOrder=-1,r.add(B);let M=Xa(l.quality),S=_a(g.city,r,{trafficScale:Vt[M].traffic}),R=ea(r),L=ea(r,{ghost:!0});L.setVisible(!1);let z=ja(r,g,{reduced:o}),b=Ka(m);o&&(b.uniforms.uMis.value=0,b.uniforms.uBoil.value=0,xe.uFlicker.value=0);let P=Za();P.setSound(l.sound),P.setMusic(l.music);let Q=1,_=0,d=0,p=16;function V(){let t=Math.max(1,e.clientWidth),f=Math.max(1,e.clientHeight),y=Math.sqrt(Vt[M].pixels/(t*f));return Math.max(.4,Math.min(window.devicePixelRatio||1,2,y))*Q}function A(){let t=Math.max(1,e.clientWidth),f=Math.max(1,e.clientHeight),y=V();m.setPixelRatio(y),m.setSize(t,f,!1);let K=Math.floor(t*y),v=Math.floor(f*y);b.setSize(K,v),xe.uRes.value.set(K,v),xe.uDot.value=Math.max(3.5,Vt[M].dot*v/900),b.uniforms.uHatch.value=Vt[M].hatch,G.aspect=t/f,G.updateProjectionMatrix()}let H=new ResizeObserver(A);H.observe(e),A();let E=new Set,x={swing:!1,dash:!1,zip:!1},w={mouseL:!1,lockLook:!1,dragLook:!1,lastLook:-9,stickX:0,stickY:0,touch:{swing:!1,dash:!1,zip:!1,dive:!1}},a={yaw:0,pitch:-.12,roll:0,fov:66,tx:0,ty:0,tz:0,init:!1,shake:0},D=(t,f,y=.0024)=>{a.yaw-=t*y*l.sens,a.pitch-=f*y*l.sens*(l.invertY?-1:1),a.pitch=Math.max(-1.25,Math.min(.95,a.pitch)),w.lastLook=ae},n={KeyW:1,KeyA:1,KeyS:1,KeyD:1,ArrowUp:1,ArrowDown:1,ArrowLeft:1,ArrowRight:1,Space:1,ShiftLeft:1,ShiftRight:1,KeyE:1,KeyC:1,ControlLeft:1,ControlRight:1,KeyQ:1};function Z(t){if(t.repeat&&n[t.code]){t.preventDefault();return}t.type==="keydown"?(n[t.code]&&(E.add(t.code),t.preventDefault(),J(),t.code==="Space"&&(x.swing=!0),(t.code==="ShiftLeft"||t.code==="ShiftRight")&&(x.dash=!0),(t.code==="KeyE"||t.code==="KeyQ")&&(x.zip=!0)),t.code==="KeyR"&&(q==="run"||q==="free")&&(we(),t.preventDefault()),(t.code==="Escape"||t.code==="KeyP")&&i({type:"escape"})):E.delete(t.code)}function C(t){if(!(q==="title"||be)&&(J(),t.button===0&&(w.mouseL=!0,x.swing=!0),t.button===2&&(w.dragLook=!0,t.preventDefault()),t.button===0&&!Ya()&&document.pointerLockElement!==e&&e.requestPointerLock&&s.pointerLock!==!1))try{let f=e.requestPointerLock();f&&f.catch&&f.catch(()=>{})}catch{}}function U(t){t.button===0&&(w.mouseL=!1),t.button===2&&(w.dragLook=!1)}function oe(t){be||q==="title"||(document.pointerLockElement===e?D(t.movementX,t.movementY):w.dragLook&&D(t.movementX,t.movementY,.004))}let te=t=>t.preventDefault();function ne(){E.clear(),w.mouseL=!1,w.dragLook=!1}window.addEventListener("keydown",Z),window.addEventListener("keyup",Z),e.addEventListener("mousedown",C),window.addEventListener("mouseup",U),window.addEventListener("mousemove",oe),e.addEventListener("contextmenu",te),window.addEventListener("blur",ne);function J(){P.started||P.start()}let ee={swing:!1,dash:!1,zip:!1,dive:!1,mx:0,my:0,start:!1,back:!1};function je(t){let f=navigator.getGamepads?navigator.getGamepads():null,y=null;if(f){for(let de=0;de<f.length;de++)if(f[de]&&f[de].connected){y=f[de];break}}if(!y){ee.swing=ee.dash=ee.zip=ee.dive=!1,ee.mx=ee.my=0;return}let K=de=>Math.abs(de)>.15?de:0;ee.mx=K(y.axes[0]||0),ee.my=-K(y.axes[1]||0);let v=K(y.axes[2]||0),I=K(y.axes[3]||0);(v||I)&&D(v*900*t,I*700*t);let j=de=>!!(y.buttons[de]&&(y.buttons[de].pressed||y.buttons[de].value>.4));ee.swing=j(0)||j(7)||j(5),ee.dash=j(2)||j(4),ee.zip=j(3),ee.dive=j(1)||j(6);let Te=j(9),Ee=j(8);Te&&!ee.start&&i({type:"escape"}),Ee&&!ee.back&&(q==="run"||q==="free")&&we(),ee.start=Te,ee.back=Ee,(ee.swing||ee.dash)&&J()}function Ne(){let t=g.input,f=0,y=0;(E.has("KeyA")||E.has("ArrowLeft"))&&(f-=1),(E.has("KeyD")||E.has("ArrowRight"))&&(f+=1),(E.has("KeyW")||E.has("ArrowUp"))&&(y+=1),(E.has("KeyS")||E.has("ArrowDown"))&&(y-=1),f+=ee.mx+w.stickX,y+=ee.my+w.stickY,t.mx=Math.max(-1,Math.min(1,f)),t.my=Math.max(-1,Math.min(1,y)),t.swing=E.has("Space")||w.mouseL||ee.swing||w.touch.swing||x.swing,t.dash=E.has("ShiftLeft")||E.has("ShiftRight")||ee.dash||w.touch.dash||x.dash,t.zip=E.has("KeyE")||E.has("KeyQ")||ee.zip||w.touch.zip||x.zip,x.swing=x.dash=x.zip=!1,t.dive=E.has("KeyC")||E.has("ControlLeft")||E.has("ControlRight")||ee.dive||w.touch.dive,t.yaw=a.yaw,t.pitch=a.pitch+.12,t.zipCone=q==="tutorial"&&le.step===3?.72:.9}let q="title",be=!1,Ie=!1,c=!1,W=0,ae=0,ie=0,ye=Ft(),He=null,le={step:0,done:!1,t:0},st=0;function Ke(){let t=u.pl;a.yaw=Math.atan2(-Math.sin(t.yaw),-Math.cos(t.yaw))+0,a.yaw=qt(t.yaw+Math.PI),a.pitch=-.12,a.init=!1,g.input.yaw=a.yaw}function ze(t,f){q=t,be=!1,W=0,ie=0,E.clear(),w.mouseL=!1,z.detach(),t==="run"?(st=f,g.startRun(f),He=s.ghosts&&s.ghosts[f]||null):t==="free"?(g.startFree(),He=null):t==="tutorial"?(g.startFree(),le.step=0,le.done=!1,le.t=0,He=null):t==="title"&&(g.startRun(0),He=null);let y=u.pl;a.yaw=qt(y.yaw+Math.PI),a.pitch=-.12,a.init=!1,g.input.yaw=a.yaw,Object.assign(ye,Ft()),c=t==="title",Ie=c,u.events.length=0}function we(){q==="run"?ze("run",st):q==="free"?ze("free"):q==="tutorial"&&ze("tutorial"),i({type:"restart"})}let Ge=new N;function rt(t){let f=u.pl;switch(t.type){case"attach":P.sfx("fire"),setTimeout(()=>P.sfx("catch"),90),z.attach(f.lx,f.ly,f.lz);break;case"release":z.detach(),t.rising&&z.sticker(t.perfect?"perfect":"shu",f.x,f.y+1.6,f.z,t.perfect?1.1:1),P.sfx(t.perfect?"perfect":"release",Math.min(1,t.speed/40)),t.perfect&&!o&&!Ie&&(W=.12),q==="tutorial"&&le.step===1&&t.rising&&Ze();break;case"dash":z.detach(),z.sticker("byun",f.x,f.y+1.2,f.z,1),P.sfx("dash"),q==="tutorial"&&le.step===2&&Ze();break;case"zip":z.attach(f.zx,f.zy,f.zz),P.sfx("zip");break;case"perch":z.detach(),z.sticker("suta",f.x,f.y+1.5,f.z,.92),q==="tutorial"&&le.step===3&&Ze();break;case"land":t.hard&&(z.sticker("don",f.x,f.y+1.2,f.z,1.08),a.shake=o?0:.25),P.sfx("land",t.hard?1:.5),z.detach();break;case"bounce":z.detach(),z.sticker("don",f.x,f.y+2,f.z,1.33),P.sfx("bounce"),a.shake=o?0:.45;break;case"wall":z.detach(),z.sticker("zaza",f.x,f.y+1.2,f.z,.83),P.sfx("wall");break;case"kick":P.sfx("kick");break;case"vault":P.sfx("kick");break;case"close":P.sfx("close");break;case"ring":P.sfx(t.last?"finish":"ring");break;case"crane":P.sfx("crane"),z.sticker("crane",f.x,f.y+1.8,f.z,.92);break;case"style":t.chain>=3&&P.sfx("chain",t.chain);break;case"finish":q="results";break;default:}t.type==="attach"&&q==="tutorial"&&le.step===0&&(le.wait=!0),i(t)}function Ze(){le.step++,i({type:"tut",step:le.step}),le.step>=4&&(le.done=!0)}function Ce(t,f,y,K){let v=-t*K,I=-f*K+.9,j=-y*K,Te=a.tx+v,Ee=a.tz+j,de=Ta(g.city,Math.min(a.tx,Te)-1,Math.min(a.tz,Ee)-1,Math.max(a.tx,Te)+1,Math.max(a.tz,Ee)+1,Qa),se=1;for(let Ae=0;Ae<de;Ae++){let Je=g.city.boxes[Qa[Ae]];if(!Qt(Je,a.tx,a.ty,a.tz,v,I,j,.45,0,se))continue;let et=0,Ye=se;for(let ct=0;ct<12;ct++){let Ve=(et+Ye)/2;Qt(Je,a.tx,a.ty,a.tz,v,I,j,.45,0,Ve)?Ye=Ve:et=Ve}se=Math.max(.05,et*.96)}return a.ty+I*se<1.2&&(se=Math.min(se,Math.max(.05,(a.ty-1.2)/Math.max(.001,-I)))),se}let $=new N,re=new N,Be=new N;function mt(t,f,y,K){let v=u.pl,I=Math.hypot(v.vx,v.vy,v.vz);a.init||(a.tx=f,a.ty=y+1,a.tz=K,a.init=!0);let j=1-Math.exp(-t*(q==="results"?2:16));a.tx+=(f-a.tx)*j,a.ty+=(y+1-a.ty)*j,a.tz+=(K-a.tz)*j;let Te=ae-w.lastLook<1.1,Ee=Math.atan2(-v.vx,-v.vz),de=Math.hypot(v.vx,v.vz);if(Ie)a.yaw+=qt(g.input.yaw-a.yaw)*Math.min(1,t*5);else if(l.assist&&!Te&&de>6&&v.mode!==O.WALL&&q!=="results"){a.yaw+=qt(Ee-a.yaw)*Math.min(1,t*(.5+de*.035));let Me=-.14-Math.max(-.3,Math.min(.3,v.vy*.006));a.pitch+=(Me-a.pitch)*Math.min(1,t*1.2)}q==="results"&&(a.yaw+=t*.15);let se=4.9+Math.min(I,60)*.03+(v.mode===O.GROUND?-.4:0),Ae=null;for(let Me=0;Me<4;Me++){let at=a.yaw+(Me===2?.55:Me===3?-.55:0),Ht=Me===0?a.pitch:Math.min(a.pitch,-.75),ta=Math.cos(Ht),$a=Math.sin(Ht),aa=-Math.sin(at)*ta,oa=$a,na=-Math.cos(at)*ta,Wt=Ce(aa,oa,na,se);if((!Ae||Wt*se>Ae.d+.3)&&(Ae={d:Wt*se,t:Wt,fx:aa,fy:oa,fz:na,c:Me}),Wt*se>2.6)break}re.set(Ae.fx,Ae.fy,Ae.fz);let Je=Ae.t,et=-re.x*se,Ye=-re.y*se+.9,ct=-re.z*se,Ve=a.tx+et*Je,ce=Math.max(1,a.ty+Ye*Je),zt=a.tz+ct*Je;if(a.px!==void 0&&Ae.c!==0&&(Ve=a.px+(Ve-a.px)*Math.min(1,t*12),ce=a.py+(ce-a.py)*Math.min(1,t*12),zt=a.pz+(zt-a.pz)*Math.min(1,t*12)),a.px=Ve,a.py=ce,a.pz=zt,a.shake>0){a.shake-=t;let Me=a.shake*.6;Ve+=(Math.random()-.5)*Me,ce+=(Math.random()-.5)*Me}G.position.set(Ve,ce,zt);let Fe=G.aspect<1?-1.1*(1-G.aspect)-.2:.3;Be.set(a.tx+re.x*6,a.ty+re.y*6+Fe,a.tz+re.z*6),G.lookAt(Be);let tt=0;if(!o&&v.mode===O.SWING){$.set(v.ax-v.x,0,v.az-v.z);let Me=Math.cos(a.yaw),at=-Math.sin(a.yaw),Ht=($.x*Me+$.z*at)/Math.max(v.L,1);tt=Math.max(-.12,Math.min(.12,-Ht*.25*Math.min(1,I/30)))}a.roll+=(tt-a.roll)*Math.min(1,t*3),G.rotateZ(a.roll);let kt=62+Math.max(0,Math.min(1,(I-14)/44))*(o?10:20);a.fov+=(kt-a.fov)*Math.min(1,t*2.5),Math.abs(G.fov-a.fov)>.05&&(G.fov=a.fov,G.updateProjectionMatrix())}function it(){Ie?((!u.run||u.run.done)&&c&&(g.startRun((u.run?u.run.idx+1:0)%3),Object.assign(ye,Ft())),Fa(ye,g,g.input,_e,Ha)):Ne(),g.step();for(let t=0;t<u.events.length;t++)rt(u.events[t]);u.events.length=0,q==="tutorial"&&(le.t+=_e,le.step===0&&u.pl.mode===O.SWING&&u.pl.lineT>.5&&Ze())}let Tt=new N,F=new N,Y=new N,fe=new N,ue=0;function Re(t,f){let y=u.pl,K=y.px+(y.x-y.px)*f,v=y.py+(y.y-y.py)*f,I=y.pz+(y.z-y.pz)*f,j=u.t;if(xe.uTime.value=j,mt(t,K,v,I),xe.uCamPos.value.copy(G.position),R.update(y,K,v,I,j),R.root.updateMatrixWorld(!0),R.handWorld(y.mode===O.ZIP?1:y.hand,Tt),He&&q==="run"&&u.run&&u.run.started){let Ye=u.run.t*10,ct=Math.floor(Ye),Ve=Ye-ct,ce=He,zt=ce.length/5;if(ct+1<zt){let Fe=ct*5,tt=Fe+5,kt=(ce[Fe]+(ce[tt]-ce[Fe])*Ve)/10,Me=(ce[Fe+1]+(ce[tt+1]-ce[Fe+1])*Ve)/10,at=(ce[Fe+2]+(ce[tt+2]-ce[Fe+2])*Ve)/10,Ht={mode:ce[Fe+4],vx:ce[tt]-ce[Fe],vy:ce[tt+1]-ce[Fe+1],vz:ce[tt+2]-ce[Fe+2],yaw:ce[Fe+3]/100,ax:kt,ay:Me+30,az:at,L:30,x:kt,y:Me,z:at,hand:1,side:1,rollT:0,landT:9,dashT:9,releaseT:9,kickT:9,dive:!1,wnx:0,wnz:1,zx:kt,zy:Me,zz:at};L.setVisible(!0),L.update(Ht,kt,Me,at,j)}else L.setVisible(!1)}else L.setVisible(!1);let Te=q==="run"||q==="free"||q==="tutorial",Ee=g.city.anchors,de=Te&&y.aim>=0&&y.mode!==O.SWING&&y.mode!==O.ZIP;de&&F.set(Ee[y.aim*4],Ee[y.aim*4+1],Ee[y.aim*4+2]);let se=g.city.perches,Ae=Te&&y.zipAim>=0&&y.mode!==O.ZIP;Ae&&Y.set(se[y.zipAim*4],se[y.zipAim*4+1]+1.2,se[y.zipAim*4+2]),y.mode===O.SWING?fe.set(y.lx,y.ly,y.lz):y.mode===O.ZIP&&fe.set(y.zx,y.zy,y.zz);let Je=null;if(u.run&&!u.run.done&&(q==="run"||q==="title")){let Ye=g.runs[u.run.idx].rings;Je={next:Ye[u.run.next],after:Ye[u.run.next+1]}}let et=Math.hypot(y.vx,y.vy,y.vz);z.update({camera:G,dt:t,t:j,pl:y,handPos:Tt,aimPos:de?F:null,zipPos:Ae?Y:null,rings:Je,cranesHidden:q==="free"?u.cranes:!0,roofY:ba(g.city,K,I,v),speed:et,hx:K,hy:v,hz:I,lineAnchor:y.mode===O.SWING||y.mode===O.ZIP?fe:null}),S.update(j,t),b.uniforms.uTime.value=j,b.uniforms.uFrame.value=Math.floor(j*12),b.uniforms.uSpeed.value=o?0:Math.max(0,Math.min(1,(et-34)/26)),b.uniforms.uPanel.value=W>0?1:0,m.info.reset(),b.render(r,G),ue-=t,ue<=0&&(ue=1/30,T(bt(et)))}let me=new N;function bt(t){let f=u.pl,y={phase:q,speed:t,dash:f.dash,mode:f.mode,chain:u.style.chain,score:u.style.score,cranes:u.craneCount,totalCranes:g.cranes.length,tut:le.step,canZip:f.zipAim>=0,canSwing:f.aim>=0||f.mode===O.SWING};if(u.run){y.t=u.run.t,y.ring=u.run.next,y.rings=g.runs[u.run.idx].rings.length,y.run=u.run.idx,y.started=u.run.started;let K=g.runs[u.run.idx].rings[u.run.next];if(K&&!u.run.done){y.dist=Math.hypot(K.x-f.x,K.y-f.y,K.z-f.z),me.set(K.x,K.y,K.z).project(G);let v=me.z>1,I=me.x,j=me.y;v&&(I=-I,j=-j),y.on=!v&&Math.abs(I)<.92&&Math.abs(j)<.88,y.sx=I,y.sy=j,y.rr=Lt/Math.max(1,y.dist*Math.tan(G.fov*Math.PI/360)),y.ang=Math.atan2(j,I)}}return y}let We=0,De=0,Xe=!1;function pt(t){if(We=requestAnimationFrame(pt),h)return;let f=Math.min(.1,Math.max(0,(t-De)/1e3||0));if(De=t,ae+=f,p+=(f*1e3-p)*.05,l.quality==="auto"&&(p>22?(_+=f,d=0):p<14?(d+=f,_=0):(_=Math.max(0,_-f),d=Math.max(0,d-f)),_>2&&Q>.55&&(Q=Math.max(.55,Q*.85),_=0,A()),d>6&&Q<1&&(Q=Math.min(1,Q*1.1),d=0,A())),je(f),!be&&q!=="results")if(W>0)W-=f;else{ie+=f;let y=0;for(;ie>=_e&&y<12;)it(),ie-=_e,y++;y===12&&(ie=0)}P.update(Math.hypot(u.pl.vx,u.pl.vy,u.pl.vz),u.pl.mode===O.SWING?Math.min(1,Math.hypot(u.pl.vx,u.pl.vy,u.pl.vz)/45):0,!be&&q!=="title",f),Re(f,Math.min(1,ie/_e))}function Ct(){Xe||(Xe=!0,De=performance.now(),We=requestAnimationFrame(pt))}function Pe(){Xe=!1,cancelAnimationFrame(We)}function Se(){document.hidden?(q!=="title"&&q!=="results"&&!be&&i({type:"escape",hidden:!0}),P.suspend()):P.resume()}document.addEventListener("visibilitychange",Se),ze("title"),Ct();let Qe={sim:g,S:u,camera:G,renderer:m,scene:r,get phase(){return q},get paused(){return be},begin:ze,restart:we,pause(t){be=t,E.clear(),w.mouseL=!1,t&&document.pointerLockElement===e&&document.exitPointerLock?.()},setSettings(t){let f=M;l={...l,...t},P.setSound(l.sound),P.setMusic(l.music),M=Xa(l.quality),(f!==M||t.quality)&&(Q=1,A())},get settings(){return l},audioStart:J,sfx:t=>P.sfx(t),touch:{stick(t,f){w.stickX=t,w.stickY=f},look(t,f){D(t,f,.005)},button(t,f){w.touch[t]=f,f&&(J(),t in x&&(x[t]=!0))}},tutorial:le,setGhosts(t){s.ghosts=t},advance(t){let f=Math.round(t/_e);for(let y=0;y<f;y++){W>0?W-=_e:q!=="results"&&!be&&it(),ae+=_e;let K=u.pl;mt(_e,K.x,K.y,K.z)}return ie=0,Re(_e,1),Qe.state()},freeze(t){W=t,Re(0,1)},bot(t){Ie=!!t,Object.assign(ye,Ft())},look:(t,f)=>{a.yaw=t,f!==void 0&&(a.pitch=f),w.lastLook=ae},state(){let t=u.pl;return{phase:q,paused:be,t:u.t,mode:["air","swing","wall","ground","zip"][t.mode],pos:[t.x,t.y,t.z],vel:[t.vx,t.vy,t.vz],speed:Math.hypot(t.vx,t.vy,t.vz),aim:t.aim,zipAim:t.zipAim,dash:t.dash,run:u.run?{idx:u.run.idx,t:u.run.t,next:u.run.next,done:u.run.done,rings:g.runs[u.run.idx].rings.length}:null,chain:u.style.chain,cranes:u.craneCount,tut:le.step,quality:M,scale:Q,fps:Math.round(1e3/p)}},stats(){return{calls:m.info.render.calls,tris:m.info.render.triangles,geometries:m.info.memory.geometries,textures:m.info.memory.textures,pixels:Math.round(b.rt.width*b.rt.height)}},dispose(){Pe(),H.disconnect(),document.removeEventListener("visibilitychange",Se),window.removeEventListener("keydown",Z),window.removeEventListener("keyup",Z),e.removeEventListener("mousedown",C),window.removeEventListener("mouseup",U),window.removeEventListener("mousemove",oe),e.removeEventListener("contextmenu",te),window.removeEventListener("blur",ne),e.removeEventListener("webglcontextlost",k),document.pointerLockElement===e&&document.exitPointerLock?.(),z.dispose(),R.dispose(),L.dispose(),S.dispose(),b.dispose(),B.geometry.dispose(),B.material.dispose(),P.dispose(),m.dispose(),m.forceContextLoss?.()}};return Qe}export{Vt as QUALITY,Uo as createIto,Ya as isPhone,Xa as resolveQuality,Wo as webglOk};
