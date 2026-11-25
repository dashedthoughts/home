import{c as Aa,d as La,e as Ia,f as Ca}from"./chunk-Z4MTP2AL.js";import{a as Ta,b as Le,c as za,d as Qt,e as ka,f as _,g as Ha,h as Yt,i as _e,j as Lt,l as Sa}from"./chunk-TYEYZQAY.js";import{$ as Et,A as da,B as ha,Ca as ht,Da as At,G as Ft,I as ma,J as pa,K as ut,L as q,Ma as ba,N as gt,S as ft,T as me,U as Ue,V as X,W as Oe,Y as xe,Z as va,a as ia,aa as xa,b as ca,c as $e,ca as ya,da as at,ea as wa,f as xt,g as la,ga as Nt,h as yt,ha as Kt,i as lt,ia as Zt,j as wt,ja as Mt,k as St,ka as dt,na as Ot,oa as Xt,ra as ga,sa as Ea,ta as Rt,u as jt,ua as Ma,x as ua,y as fa,ya as Ra}from"./chunk-75VSPVXA.js";import"./chunk-EK7ODJWE.js";var It=1/60,Pa=2.4,ao=.2,_t=[],Me={mx:0,my:1,swing:!1,dash:!1,zip:!1,dive:!1,yaw:0,pitch:0};function Gt(){return{t:0,plan:null,replanT:0,yaw:null,swing:!1,lastMode:-1,modeT:0,pressCool:0,zipCool:0,target:null,ring:-1,lastD:1e9,stuckT:0,magnet:null}}var oo=e=>{for(;e>Math.PI;)e-=2*Math.PI;for(;e<-Math.PI;)e+=2*Math.PI;return e};function no(e,o,i,E,n,c,h){let m=E-e,z=n-o,x=c-i,l=m*m+z*z+x*x,r=l>1e-9?((h.x-e)*m+(h.y-o)*z+(h.z-i)*x)/l:0;return r=r<0?0:r>1?1:r,Math.hypot(e+m*r-h.x,o+z*r-h.y,i+x*r-h.z)}function Fa(e,o,i,E){let n=o.x-e.x,c=o.z-e.z,h=o.y-e.y,m=Math.hypot(n,c);E.yaw=i,E.pitch=Math.atan2(h+2,Math.max(m,1))*.9;let z=e.vx*Math.cos(i)-e.vz*Math.sin(i);E.my=1,E.mx=Math.max(-1,Math.min(1,-z*.15))}function so(e,o,i,E){let n=Object.assign({},e.S.pl),c=e.city,h=Math.atan2(-(i.x-n.x),-(i.z-n.z));Me.swing=n.prevSwing,Me.dash=!1,Me.zip=!1,Me.dive=!1,Me.guide=e.input.guide;let m=e.S.run?e.runs[e.S.run.idx].assist.magnet:44,z=0,x=o.hold,l=n.mode===_.SWING,r=1e9,A=0,D=0,M=!1,I=Math.ceil(Pa/It);for(let k=0;k<I;k++){Fa(n,i,h,Me),Me.dash=o.dash&&!M,M=!0,Me.dive=z<(o.dive||0),n.mode===_.SWING?x!==null?(x-=It,Me.swing=x>0,Me.swing||(x=null)):(D-=It,Me.swing=D>0):n.mode===_.AIR?x!==null&&o.attach?Me.swing=!0:(Me.swing=n.vy<0&&n.airT>.3&&n.aim>=0,Me.swing&&(D=1.3)):n.mode===_.WALL?Me.swing=n.wallT>.3&&!Me.swing:n.mode===_.GROUND?Me.swing=!Me.swing:Me.swing=!1,x!==null&&!o.attach&&n.mode!==_.SWING&&(x=null),_t.length=0;let T=n.x,F=n.y,$=n.z;Ha(c,n,Me,It,_t,0),z+=It;for(let d=0;d<_t.length;d++){let p=_t[d].type;p==="bounce"?A+=40:p==="wall"?A+=4:p==="land"&&(A+=3)}n.y<12&&(A+=(12-n.y)*It*2);let j=no(T,F,$,n.x,n.y,n.z,i);if(j<r&&(r=j),j<8)return A+z}let R=Math.hypot(i.x-n.x,i.y-n.y,i.z-n.z),S=A+Pa+6+Math.min(r,R)*.25+R*.35;return n.y<14&&(S+=(14-n.y)*1.5),S-=Math.hypot(n.vx,n.vz)*.12,S}var ro=[{attach:!1,hold:null},{attach:!0,hold:.5},{attach:!0,hold:.85},{attach:!0,hold:1.2},{attach:!0,hold:1.6},{attach:!0,hold:2.1},{attach:!1,hold:null,dive:.5},{attach:!1,hold:null,dash:!0}],io=[{hold:0},{hold:.2},{hold:.45},{hold:.8},{hold:1.2}];function Ga(e,o,i,E,n){let c=o.S,h=c.pl,m=e.target;if(c.run&&!c.run.done&&(m=o.runs[c.run.idx].rings[c.run.next]),i.dash=!1,i.zip=!1,i.dive=!1,!m){i.mx=0,i.my=0,i.swing=!1;return}let z=n||e.magnet||(()=>{}),x=Math.hypot(m.x-h.x,m.y-h.y,m.z-h.z);if(x<e.lastD-1?(e.lastD=x,e.stuckT=0):e.stuckT+=E,e.stuckT>6&&!e.escape){let I=m.x-h.x,R=m.z-h.z,S=Math.hypot(I,R)||1;e.escSide=-(e.escSide||1),e.escape={x:h.x-I/S*40+-R/S*40*e.escSide,y:h.y+25,z:h.z-R/S*40+I/S*40*e.escSide,until:e.t+2.2},e.stuckT=0,e.lastD=1e9,e.plan=null}e.escape&&(e.t>e.escape.until?(e.escape=null,e.plan=null):m=e.escape),e.t+=E,e.modeT+=E,e.replanT-=E,e.pressCool-=E,e.zipCool-=E,h.mode!==e.lastMode&&(e.lastMode=h.mode,e.modeT=0,e.replanT=0);let l=c.run?c.run.next:e.target;e.ring!==l&&(e.ring=l,e.replanT=0,e.plan=null,e.lastD=1e9,e.stuckT=0,e.escape=null);let r=Math.atan2(-(m.x-h.x),-(m.z-h.z));e.yaw===null&&(e.yaw=r),e.yaw+=oo(r-e.yaw)*Math.min(1,E*6),Fa(h,m,e.yaw,i);let A=m.y-h.y,D=Math.hypot(m.x-h.x,m.z-h.z),M=e.swing;switch(h.mode){case _.GROUND:M=e.modeT>.1&&!e.swing;break;case _.WALL:M=e.modeT>(h.wallUp?.55:.3)&&!e.swing;break;case _.ZIP:M=!1;break;case _.AIR:case _.SWING:{if(e.replanT<=0||!e.plan){e.replanT=ao;let R=h.mode===_.SWING?io:ro,S=null,k=1e9;for(let T of R){if(T.attach&&h.aim<0||T.dash&&h.dash<1)continue;let F=h.mode===_.SWING?{attach:!1,hold:T.hold}:T,$=so(o,F,m,z);$<k&&(k=$,S=T)}e.plan=S?{...S,start:e.t}:null}let I=e.plan;h.mode===_.SWING?M=(I&&I.hold!==void 0&&I.hold!==null?I.hold-(e.t-I.start):1)>0&&h.lineT<2.6:(M=!!(I&&I.attach)&&h.aim>=0,I&&I.dash&&e.t-I.start<E*1.5&&(i.dash=!0),I&&I.dive&&(i.dive=e.t-I.start<I.dive),M&&!e.swing&&e.pressCool>0&&(M=!1),M&&(e.plan={attach:!1,hold:I.hold,start:e.t,fromAttach:!0})),!M&&e.swing&&(e.pressCool=.1),h.mode===_.AIR&&A>25&&D<120&&h.zipAim>=0&&e.zipCool<=0&&o.city.perches[h.zipAim*4+1]<m.y+12&&(i.zip=!0,e.zipCool=1.5);break}default:}e.swing=M,i.swing=M}var Ba=e=>{for(;e>Math.PI;)e-=2*Math.PI;for(;e<-Math.PI;)e+=2*Math.PI;return e};function Da(e,o,i,E){let n=Math.hypot(o.vx,o.vz);if(o.mode===_.WALL)return;let c=null,h=0;if(n>6&&(c=Math.atan2(-o.vx,-o.vz),h=.5+n*.035),E){let z=E.x-o.x,x=E.z-o.z,l=Math.hypot(z,x),r=Math.atan2(-z,-x);if(c===null)c=r,h=1.2;else if(l>8){let A=Ba(r-c);c+=Math.abs(A)<2?A*.65:Math.sign(A)*1}}c!==null&&(e.yaw+=Ba(c-e.yaw)*Math.min(1,i*h));let m=-.14-Math.max(-.3,Math.min(.3,o.vy*.006));if(E){let z=Math.hypot(E.x-o.x,E.z-o.z);z<90&&(m=m*.5+.5*Math.max(-.5,Math.min(.25,Math.atan2(E.y-o.y-1,Math.max(z,1)))))}(n>6||E)&&(e.pitch+=(m-e.pitch)*Math.min(1,i*1.2))}var qt=e=>{let o=parseInt(e.replace("#",""),16);return new q((o>>16&255)/255,(o>>8&255)/255,(o&255)/255)},Va={ink:"#140a2a",paper:"#f4ecd8",night:"#1a1038",fog:"#3a1d5c",fogFar:"#5a2470",magenta:"#ff2bd6",cyan:"#18e7ff",yellow:"#ffe14a",orange:"#ff7a3d",red:"#ff3355",sun:new q(-.45,.72,.53).normalize()};var Wa=232,we={uTime:{value:0},uDot:{value:6},uRes:{value:new Ft(1,1)},uFogC:{value:qt(Va.fog)},uFogD:{value:.0024},uSun:{value:Va.sun.clone()},uFlicker:{value:1},uCamPos:{value:new q}},ot=`
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
`;function Ua(){return new xe({uniforms:{...we},vertexShader:`
      attribute float aId; attribute float aTone; attribute float aSeed; attribute float aLit;
      varying vec3 vW; varying vec3 vN; varying float vId; varying float vTone; varying float vSeed; varying float vLit;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); vId = aId; vTone = aTone; vSeed = aSeed; vLit = aLit;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,fragmentShader:`
      ${ot}
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
      }`})}function Na(e){return new xe({uniforms:{...we,uMap:{value:e}},side:$e,vertexShader:`
      attribute float aId; attribute vec4 aUv; attribute float aSeed;
      varying vec2 vUv; varying vec4 vCell; varying float vId; varying float vSeed; varying vec3 vW;
      void main() {
        vUv = uv; vCell = aUv; vId = aId; vSeed = aSeed;
        vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,fragmentShader:`
      ${ot}
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
      }`})}function Oa(e){return new xe({uniforms:{...we,uMap:{value:e}},vertexShader:`
      attribute float aId; attribute float aSeed;
      varying vec2 vUv; varying float vId; varying float vSeed; varying vec3 vW;
      void main() { vUv = uv; vId = aId; vSeed = aSeed; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,fragmentShader:`
      ${ot}
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
      }`})}function _a(e){let o=e.sx.slice(),i=e.sz.slice(),E=e.wx.slice(),n=e.wz.slice();return new xe({uniforms:{...we,uSX:{value:o},uSZ:{value:i},uWX:{value:E},uWZ:{value:n},uPark:{value:new ma(e.park.x0,e.park.z0,e.park.x1,e.park.z1)}},vertexShader:"varying vec3 vW; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }",fragmentShader:`
      ${ot}
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
      }`})}function qa(){return new xe({uniforms:{...we,uMoon:{value:new q(-.5,.42,-.76).normalize()}},side:ca,depthWrite:!1,vertexShader:"varying vec3 vD; void main() { vD = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }",fragmentShader:`
      ${ot}
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
      }`})}function $t(e,o,i=0){return new xe({uniforms:{...we,uColor:{value:qt(e)},uId:{value:o/255},uEm:{value:i},uGhost:{value:0}},vertexShader:"varying vec3 vN; varying vec3 vV; void main() { vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = -mv.xyz; gl_Position = projectionMatrix * mv; }",fragmentShader:`
      ${ot}
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
      }`})}function ja(){return new xe({uniforms:{...we},transparent:!0,depthWrite:!1,blending:xt,blendSrc:wt,blendDst:St,blendSrcAlpha:yt,blendDstAlpha:lt,vertexShader:"varying vec3 vN; void main() { vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`
      ${ot}
      varying vec3 vN;
      void main() {
        float f = 0.25 + 0.35 * pow(1.0 - abs(normalize(vN).z), 2.0);
        float dots = halftone(gl_FragCoord.xy, 0.6, uDot * 0.7);
        gl_FragColor = vec4(vec3(0.5, 0.95, 1.0), f * (0.35 + 0.65 * dots));
      }`})}function Ct(e={}){return{transparent:!0,depthWrite:!1,blending:xt,blendEquation:la,blendSrc:wt,blendDst:lt,blendSrcAlpha:yt,blendDstAlpha:lt,...e}}function Jt(e={}){return{transparent:!0,depthWrite:!1,blending:xt,blendSrc:wt,blendDst:St,blendSrcAlpha:yt,blendDstAlpha:lt,...e}}function qe(e,o,i={}){return new xe({uniforms:{...we,uColor:{value:qt(e)},uId:{value:o/255},uGlow:{value:i.glow||0}},side:i.side||ia,vertexShader:`
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
      ${ot}
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
      }`})}function co(){let e=[],o=[],i=[],E=[],n=[],c=[],h=[],m=0;function z(r,A,D,M,I,R,S,k,T){for(let F of[r,A,D,M])e.push(F[0],F[1],F[2]),o.push(I[0],I[1],I[2]),i.push(R),E.push(S),n.push(k),c.push(T);h.push(m,m+1,m+2,m,m+2,m+3),m+=4}function x(r,A,D,M,I,R,S,k,T,F,$=!1){let j=d=>(1+(F*7+d*3)%229)/255;z([r,A,R],[r,I,R],[r,I,D],[r,A,D],[-1,0,0],j(0),S,k,T),z([M,A,D],[M,I,D],[M,I,R],[M,A,R],[1,0,0],j(1),S,k,T),z([r,A,D],[r,I,D],[M,I,D],[M,A,D],[0,0,-1],j(2),S,k,T),z([M,A,R],[M,I,R],[r,I,R],[r,A,R],[0,0,1],j(3),S,k,T),z([r,I,D],[r,I,R],[M,I,R],[M,I,D],[0,1,0],j(4),S,k,T),$&&z([r,A,D],[M,A,D],[M,A,R],[r,A,R],[0,-1,0],j(5),S,k,T)}function l(){let r=new Ue;return r.setAttribute("position",new me(e,3)),r.setAttribute("normal",new me(o,3)),r.setAttribute("aId",new me(i,1)),r.setAttribute("aTone",new me(E,1)),r.setAttribute("aSeed",new me(n,1)),r.setAttribute("aLit",new me(c,1)),r.setIndex(h),r.computeBoundingSphere(),r}return{box:x,quad:z,build:l,count:()=>m}}function Ka(e,o,i={}){let E=[],n=d=>(E.push(d),d),c=Ta(e.seed*3+1),h=new at;o.add(h);let m=co(),z=d=>d.kind===Le.TOWER?.35+.45*(d.bid*.618%1):d.kind===Le.PODIUM?.55:0;for(let d of e.boxes){let p=d.tone;d.kind===Le.VIADUCT||d.kind===Le.PILLAR||d.kind===Le.WALKWAY?p=6:d.kind===Le.TORII?p=7:d.kind===Le.SHRINE||d.kind===Le.BOARD?p=8:d.kind===Le.CROWN&&(p=(d.tone+2)%6),m.box(d.x0,d.y0,d.z0,d.x1,d.y1,d.z1,p,(d.bid+1)*.137,z(d),d.i,d.kind===Le.VIADUCT||d.kind===Le.WALKWAY||d.kind===Le.BOARD)}for(let d of e.towers){let p=e.boxes.filter(w=>w.bid===d.bid&&Math.abs(w.y1-d.top)<.01&&w.kind===Le.TOWER)[0];if(!p)continue;let W=p.x1-p.x0,L=p.z1-p.z0,H=1+Math.floor(c()*3);for(let w=0;w<H;w++){let a=2+c()*5,V=2+c()*5,s=1.5+c()*2.5,K=p.x0+2+c()*Math.max(.1,W-4-a),P=p.z0+2+c()*Math.max(.1,L-4-V);m.box(K,p.y1,P,K+a,p.y1+s,P+V,8,.5,0,900+w+d.bid*3)}let g=1.1,y=.5;m.box(p.x0,p.y1,p.z0,p.x1,p.y1+g,p.z0+y,p.tone,.2,0,1e3+d.bid),m.box(p.x0,p.y1,p.z1-y,p.x1,p.y1+g,p.z1,p.tone,.2,0,1001+d.bid),m.box(p.x0,p.y1,p.z0,p.x0+y,p.y1+g,p.z1,p.tone,.2,0,1002+d.bid),m.box(p.x1-y,p.y1,p.z0,p.x1,p.y1+g,p.z1,p.tone,.2,0,1003+d.bid)}for(let d of e.masts){m.box(d.x-.35,d.y0,d.z-.35,d.x+.35,d.y1,d.z+.35,8,.3,0,1200+Math.floor(d.x));for(let p=d.y0+4;p<d.y1-2;p+=5)m.box(d.x-1.6,p,d.z-.12,d.x+1.6,p+.25,d.z+.12,8,.3,0,1300+Math.floor(p))}let x=e.viaduct;m.box(x.x-x.half,x.y1,x.z0,x.x-x.half+.6,x.y1+1.2,x.z1,6,.4,0,1400),m.box(x.x+x.half-.6,x.y1,x.z0,x.x+x.half,x.y1+1.2,x.z1,6,.4,0,1401);for(let d of[-4.2,-2.6,2.6,4.2])m.box(x.x+d-.12,x.y1,x.z0,x.x+d+.12,x.y1+.25,x.z1,8,.4,0,1402);let l=e.walk;m.box(l.x0,l.y1,l.z-l.half,l.x1,l.y1+1.1,l.z-l.half+.25,6,.4,0,1410),m.box(l.x0,l.y1,l.z+l.half-.25,l.x1,l.y1+1.1,l.z+l.half,6,.4,0,1411);let r=e.park;{let d=r.hall.x,p=r.hall.z;m.box(d-10.5,7,p-7.5,d+10.5,8.2,p+7.5,8,.6,0,1420),m.box(d-8,8.2,p-5,d+8,10.4,p+5,8,.6,0,1421);let W=r.torii;m.box(W.x-6.2,7.6,W.z-.35,W.x+6.2,8.2,W.z+.35,7,.7,0,1422),m.box(W.x-8.2,10.2,W.z-.8,W.x+8.2,10.8,W.z+.8,8,.7,0,1423)}for(let d=0;d<260;d++){let p=c()*Math.PI*2,W=430+c()*600,L=Math.cos(p)*W,H=Math.sin(p)*W;if(Math.abs(L)<390&&Math.abs(H)<390)continue;let g=20+c()*40,y=20+c()*40,w=30+c()*c()*200;m.box(L-g/2,0,H-y/2,L+g/2,w,H+y/2,Math.floor(c()*6),c(),.4,2e3+d)}let A=n(Ua()),D=n(m.build()),M=new X(D,A);M.matrixAutoUpdate=!1,h.add(M);let I=n(new Et(2600,2600,1,1));I.rotateX(-Math.PI/2);let R=n(_a(e)),S=new X(I,R);S.matrixAutoUpdate=!1,h.add(S);let k=n(Aa());{let d=[],p=[],W=[],L=[],H=[],g=[],y=0;e.signs.forEach((V,s)=>{let P=V.nx,N=V.nz,oe=V.x+P*.3,ae=V.z+N*.3,ne=V.x+P*2.6,J=V.z+N*2.6,ee=V.y0,je=V.y0+V.h;d.push(oe,ee,ae,ne,ee,J,ne,je,J,oe,je,ae),p.push(0,0,1,0,1,1,0,1);let Ne=V.kind%16,O=Ne%8/8,ze=1-(Math.floor(Ne/8)+1)/2;for(let Ie=0;Ie<4;Ie++)W.push(O+.004,ze+.004,1/8-.008,1/2-.008),L.push((233+s%3*0)/255*0+(1+s*11%229)/255),H.push(s*.377%1);g.push(y,y+1,y+2,y,y+2,y+3),y+=4});let w=n(new Ue);w.setAttribute("position",new me(d,3)),w.setAttribute("uv",new me(p,2)),w.setAttribute("aUv",new me(W,4)),w.setAttribute("aId",new me(L,1)),w.setAttribute("aSeed",new me(H,1)),w.setIndex(g),w.computeBoundingSphere();let a=new X(w,n(Na(k)));a.matrixAutoUpdate=!1,h.add(a)}let T=n(La());{let d=[],p=[],W=[],L=[],H=[],g=0,y=(s,K,P)=>{d.push(...s.flat()),p.push(0,0,1,0,1,1,0,1);for(let N=0;N<4;N++)W.push((1+(P*13+5)%229)/255),L.push(K);H.push(g,g+1,g+2,g,g+2,g+3),g+=4};e.screens.forEach((s,K)=>{let P=s.t,N=.35,oe=s.y0,ae=s.y0+s.h;if(s.face===0){let ne=P.cx,J=P.z0-N;y([[ne+s.w/2,oe,J],[ne-s.w/2,oe,J],[ne-s.w/2,ae,J],[ne+s.w/2,ae,J]],s.seed%1e3/1e3,K)}else if(s.face===1){let ne=P.cx,J=P.z1+N;y([[ne-s.w/2,oe,J],[ne+s.w/2,oe,J],[ne+s.w/2,ae,J],[ne-s.w/2,ae,J]],s.seed%1e3/1e3,K)}else if(s.face===2){let ne=P.cz,J=P.x0-N;y([[J,oe,ne-s.w/2],[J,oe,ne+s.w/2],[J,ae,ne+s.w/2],[J,ae,ne-s.w/2]],s.seed%1e3/1e3,K)}else{let ne=P.cz,J=P.x1+N;y([[J,oe,ne+s.w/2],[J,oe,ne-s.w/2],[J,ae,ne-s.w/2],[J,ae,ne+s.w/2]],s.seed%1e3/1e3,K)}});let w=100;for(let s of e.boxes){if(s.kind!==Le.BOARD)continue;let K=s.i*.61%1,P=s.x1-s.x0>s.z1-s.z0,N=.05;P?(y([[s.x1,s.y0,s.z0-N],[s.x0,s.y0,s.z0-N],[s.x0,s.y1,s.z0-N],[s.x1,s.y1,s.z0-N]],K,w++),y([[s.x0,s.y0,s.z1+N],[s.x1,s.y0,s.z1+N],[s.x1,s.y1,s.z1+N],[s.x0,s.y1,s.z1+N]],(K+.3)%1,w++)):(y([[s.x0-N,s.y0,s.z0],[s.x0-N,s.y0,s.z1],[s.x0-N,s.y1,s.z1],[s.x0-N,s.y1,s.z0]],K,w++),y([[s.x1+N,s.y0,s.z1],[s.x1+N,s.y0,s.z0],[s.x1+N,s.y1,s.z0],[s.x1+N,s.y1,s.z1]],(K+.3)%1,w++))}let a=n(new Ue);a.setAttribute("position",new me(d,3)),a.setAttribute("uv",new me(p,2)),a.setAttribute("aId",new me(W,1)),a.setAttribute("aSeed",new me(L,1)),a.setIndex(H),a.computeBoundingSphere();let V=new X(a,n(Oa(T)));V.matrixAutoUpdate=!1,h.add(V)}let F=lo(e,c,n,i.trafficScale??1);h.add(F);{let d=n(new Ra(1,1)),p=n(qe("#1d7a5e",180)),W=n(new Rt(.25,.35,1,6));W.translate(0,.5,0);let L=n(qe("#3a2433",179)),H=r.trees.length,g=new dt(d,p,H*2),y=new dt(W,L,H),w=new gt,a=new ut,V=new q,s=new q,K=new q(0,1,0);r.trees.forEach((P,N)=>{a.setFromAxisAngle(K,N),s.set(P.x,P.h*.66,P.z),V.set(P.r,P.h*.3,P.r),w.compose(s,a,V),g.setMatrixAt(N*2,w),s.set(P.x+P.r*.45,P.h*.86,P.z-P.r*.3),V.set(P.r*.62,P.h*.2,P.r*.62),w.compose(s,a,V),g.setMatrixAt(N*2+1,w),s.set(P.x,0,P.z),V.set(1,P.h*.5,1),w.compose(s,a,V),y.setMatrixAt(N,w)}),g.instanceMatrix.needsUpdate=!0,y.instanceMatrix.needsUpdate=!0,g.computeBoundingSphere(),y.computeBoundingSphere(),h.add(g,y)}let $=uo(e,n);h.add($);let j=fo(e,n);return h.add(j.group),{group:h,update(d,p){j.update(d)},dispose(){for(let d of E)d.dispose?.();o.remove(h)},buildings:M}}function lo(e,o,i,E){let n=[],c=[],h=[],m=[],z=[],x=[],l=k=>k>=28?[3,7.5]:[2.6,6.2],r=(k,T,F,$,j,d)=>{for(let p of l(d))for(let W of[1,-1]){let L=Math.floor(j/26*E),H=9+o()*6;for(let g=0;g<L;g++){let y=o()*j;for(let w of[-.8,.8]){let a=-$*(p*W+w),V=F*(p*W+w);n.push(W>0?k+a:k+a+F*j,.9,W>0?T+V:T+V+$*j),c.push(F*W,0,$*W),h.push(j),m.push(H*(.9+o()*.2)),z.push(y),x.push(W>0?1:0)}}}},A=2*350;for(let k=0;k<e.sx.length;k++)k!==5&&r(e.sx[k],-350,0,1,A,e.wx[k]);for(let k=0;k<e.sz.length;k++)r(-350,e.sz[k],1,0,A,e.wz[k]);let D=h.length,M=i(new Et(1,1)),I=i(new ba);I.index=M.index,I.setAttribute("position",M.getAttribute("position")),I.setAttribute("uv",M.getAttribute("uv")),I.setAttribute("aStart",new Mt(new Float32Array(n),3)),I.setAttribute("aDir",new Mt(new Float32Array(c),3)),I.setAttribute("aLen",new Mt(new Float32Array(h),1)),I.setAttribute("aSpeed",new Mt(new Float32Array(m),1)),I.setAttribute("aPhase",new Mt(new Float32Array(z),1)),I.setAttribute("aCol",new Mt(new Float32Array(x),1)),I.instanceCount=D;let R=i(new xe({uniforms:{...we},...Ct(),vertexShader:`
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
      }`})),S=new X(I,R);return S.frustumCulled=!1,S}function uo(e,o){let i=[],E=[],n=[],c=[],h=e.park;for(let r=-3;r<=3;r++)r!==0&&(i.push(h.hall.x+r*2.6,6.2,h.hall.z+6.6),E.push(1,.55,.25),n.push(1.8),c.push(0));for(let r=0;r<8;r++)i.push(h.torii.x+(r%2?7:-7),1.6,h.torii.z+6+Math.floor(r/2)*9),E.push(1,.6,.3),n.push(1.6),c.push(0);for(let r of e.masts)i.push(r.x,r.y1+.4,r.z),E.push(1,.1,.15),n.push(3.2),c.push(1);for(let r of e.towers)r.H>150&&(i.push(r.x0,r.top+.5,r.z0,r.x1,r.top+.5,r.z1),E.push(1,.1,.15,1,.1,.15),n.push(2.6,2.6),c.push(1,1));let m=e.walk;for(let r=m.x0+6;r<m.x1;r+=12)i.push(r,m.y1+3,m.z),E.push(.75,.95,1),n.push(1.4),c.push(0);let z=o(new Ue);z.setAttribute("position",new me(i,3)),z.setAttribute("aCol",new me(E,3)),z.setAttribute("aSize",new me(n,1)),z.setAttribute("aBlink",new me(c,1));let x=o(new xe({uniforms:{...we},...Ct(),vertexShader:`
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
      void main() { float r = length(gl_PointCoord - 0.5) * 2.0; float a = 1.0 - smoothstep(0.1, 1.0, r); gl_FragColor = vec4(vCol * 1.3, a * a); }`})),l=new Ot(z,x);return l.frustumCulled=!1,l}function fo(e,o){let i=e.viaduct,E=new at,n=8,c=19,h=.8,m=o(new Oe(3,3.4,c)),z=o(new Oe(3.06,.9,c-2)),x=o(qe("#c9c6d8",214)),l=o(qe("#ffe3a0",215,{glow:1})),r=o(new Oe(3.08,.35,c-.4)),A=o(qe("#18e7ff",216,{glow:.6})),D=[new dt(m,x,n),new dt(z,l,n),new dt(r,A,n)];for(let R of D)R.frustumCulled=!1,E.add(R);let M=new gt,I=[0,.5,-.65];return{group:E,update(R){let S=i.z1-i.z0+400,k=R*22%S,T=Math.floor(R*22/S)%2===0?1:-1,F=T>0?i.z0-200+k:i.z1+200-k;for(let $=0;$<n;$++){let j=F-T*$*(c+h);for(let d=0;d<3;d++)M.makeTranslation(i.x+2.6*T*-1*0+(T>0?-2.6:2.6),i.y1+2+I[d],j),D[d].setMatrixAt($,M)}for(let $ of D)$.instanceMatrix.needsUpdate=!0}}}var ye={jacket:"#ffd21f",lining:"#ff2bd6",visor:"#18e7ff",mask:"#231541",pants:"#4b37b0",pad:"#18e7ff",shoe:"#f6f1e6",sole:"#ff2bd6",glove:"#1b1030",pack:"#ff2bd6",stripe:"#fff6e0",launcher:"#18e7ff"},ea=["spine","chest","neck","shL","elL","shR","elR","hipL","knL","hipR","knR"],He={idle:{spine:[.08,0,0],chest:[.05,0,0],neck:[-.05,0,0],shL:[.1,0,.18],elL:[-.3,0,0],shR:[.1,0,-.18],elR:[-.3,0,0],hipL:[-.15,0,.06],knL:[.25,0,0],hipR:[-.05,0,-.06],knR:[.15,0,0]},runA:{spine:[.3,0,0],chest:[.1,.15,0],neck:[-.25,0,0],shL:[.9,0,.15],elL:[-1.2,0,0],shR:[-1,0,-.15],elR:[-1.4,0,0],hipL:[-1.1,0,.05],knL:[.6,0,0],hipR:[.5,0,-.05],knR:[1.4,0,0]},runB:{spine:[.3,0,0],chest:[.1,-.15,0],neck:[-.25,0,0],shL:[-1,0,.15],elL:[-1.4,0,0],shR:[.9,0,-.15],elR:[-1.2,0,0],hipL:[.5,0,.05],knL:[1.4,0,0],hipR:[-1.1,0,-.05],knR:[.6,0,0]},swing:{spine:[-.15,0,0],chest:[-.1,0,.1],neck:[-.35,0,0],shR:[-2.95,0,-.12],elR:[-.12,0,0],shL:[.7,0,1.1],elL:[-.9,0,0],hipL:[-1,0,.12],knL:[1.5,0,0],hipR:[-.35,0,-.08],knR:[.5,0,0]},swingLow:{spine:[-.3,0,0],chest:[-.15,0,.12],neck:[-.45,0,0],shR:[-3,0,-.1],elR:[-.05,0,0],shL:[1.1,0,.6],elL:[-.6,0,0],hipL:[-1.55,0,.1],knL:[.6,0,0],hipR:[-1.3,0,-.1],knR:[.4,0,0]},tuck:{spine:[.75,0,0],chest:[.4,0,0],neck:[.2,0,0],shL:[-.9,0,.35],elL:[-2,0,0],shR:[-.9,0,-.35],elR:[-2,0,0],hipL:[-2.1,0,.2],knL:[2.4,0,0],hipR:[-2,0,-.2],knR:[2.4,0,0]},soar:{spine:[-.25,0,0],chest:[-.15,0,0],neck:[-.4,0,0],shL:[-2.6,0,.5],elL:[-.2,0,0],shR:[.4,0,-.9],elR:[-.5,0,0],hipL:[-.9,0,.1],knL:[1.6,0,0],hipR:[.45,0,-.1],knR:[.4,0,0]},fall:{spine:[.05,0,0],chest:[0,0,0],neck:[-.3,0,0],shL:[-.4,0,2],elL:[-.5,0,0],shR:[-.4,0,-2],elR:[-.5,0,0],hipL:[-.6,0,.25],knL:[1,0,0],hipR:[-.2,0,-.25],knR:[.5,0,0]},dive:{spine:[-.1,0,0],chest:[-.1,0,0],neck:[-.7,0,0],shL:[.5,0,.35],elL:[-.15,0,0],shR:[.5,0,-.35],elR:[-.15,0,0],hipL:[.1,0,.08],knL:[.25,0,0],hipR:[.15,0,-.08],knR:[.15,0,0]},wallA:{spine:[.2,0,0],chest:[.05,.2,0],neck:[-.3,0,0],shL:[1.1,0,.3],elL:[-1.3,0,0],shR:[-1.2,0,-.3],elR:[-1.4,0,0],hipL:[-1.4,0,.1],knL:[.9,0,0],hipR:[.4,0,-.1],knR:[1.6,0,0]},wallB:{spine:[.2,0,0],chest:[.05,-.2,0],neck:[-.3,0,0],shL:[-1.2,0,.3],elL:[-1.4,0,0],shR:[1.1,0,-.3],elR:[-1.3,0,0],hipL:[.4,0,.1],knL:[1.6,0,0],hipR:[-1.4,0,-.1],knR:[.9,0,0]},dash:{spine:[.55,0,0],chest:[.2,0,0],neck:[-.6,0,0],shL:[1.3,0,.5],elL:[-.3,0,0],shR:[1.3,0,-.5],elR:[-.3,0,0],hipL:[-1.3,0,.1],knL:[1.2,0,0],hipR:[.6,0,-.1],knR:[.5,0,0]},zip:{spine:[.1,0,0],chest:[0,0,.1],neck:[-.3,0,0],shR:[-2.9,0,-.1],elR:[0,0,0],shL:[-2.6,0,.4],elL:[-.4,0,0],hipL:[.2,0,.1],knL:[.6,0,0],hipR:[.35,0,-.1],knR:[.3,0,0]},land:{spine:[.7,0,0],chest:[.3,0,0],neck:[-.4,0,0],shL:[-.4,0,.9],elL:[-.6,0,0],shR:[.5,0,-.5],elR:[-.4,0,0],hipL:[-1.6,0,.3],knL:[2.2,0,0],hipR:[-.6,0,-.3],knR:[2.3,0,0]}};function Za(e){let o={};for(let i of ea){let E=i;i.endsWith("L")?E=i.slice(0,-1)+"R":i.endsWith("R")&&(E=i.slice(0,-1)+"L");let n=e[E]||[0,0,0];o[i]=[n[0],-n[1],-n[2]]}return o}function Vt(e,o,i){let E=new ga(e,o,3,10);return E.translate(0,-o/2-e*.4,0),new X(E,i)}function ta(e,o={}){let i=!!o.ghost,E=[],n=Wa,c=(u,U=0)=>{let te=i?h:$t(u,n++,U);return i||E.push(te),te},h=i?ja():null;h&&E.push(h);let m=new at,z=new at;m.add(z);let x={},l=(u,U,te,ie,ge)=>{let Se=new at;return Se.position.set(te,ie,ge),u.add(Se),x[U]=Se,Se},r=(u,U,te=0,ie=0,ge=0)=>(U.position.set(te,ie,ge),u.add(U),E.push(U.geometry),U),A=l(z,"hips",0,0,0);r(A,new X(new ht(.15,12,8),c(ye.pants)),0,-.02,0).scale.set(1.15,.8,.85);let D=r(A,new X(new Rt(.19,.23,.2,14,1,!0),c(ye.jacket)),0,.02,-.01);D.scale.set(1.05,1,.85),i||(D.material.side=$e);let M=l(A,"spine",0,.06,0);r(M,Vt(.165,.22,c(ye.jacket)),0,.42,0).scale.set(1.12,1,.82);let R=l(M,"chest",0,.3,0);r(R,new X(new Oe(.04,.32,.02),c(ye.glove)),0,-.08,.145);let S=r(R,new X(new Oe(.34,.38,.2),c(ye.pack)),0,-.02,-.24);if(r(R,new X(new Oe(.35,.06,.205),c(ye.stripe,.6)),0,.02,-.24),!i){let u=Ca(),U=new xe({uniforms:{uMap:{value:u},uId:{value:n++/255}},vertexShader:"varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",fragmentShader:"uniform sampler2D uMap; uniform float uId; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(uMap, vUv).rgb, uId); }"});E.push(U,u);let te=r(R,new X(new Et(.28,.28),U),0,-.01,-.342);te.rotation.y=Math.PI}let k=l(R,"neck",0,.2,0);r(k,new X(new ht(.115,14,10),c(ye.mask)),0,.14,.01);let T=r(k,new X(new At(.105,.03,6,16,Math.PI*1.1),c(ye.visor,1)),0,.16,.012);T.rotation.set(Math.PI/2,0,Math.PI*.45-Math.PI*.55+Math.PI),T.scale.set(1,1,.75);let F=r(k,new X(new ht(.17,16,10,0,Math.PI*2,0,Math.PI*.64),c(ye.jacket)),0,.15,-.045);F.rotation.x=-.6,F.scale.set(1,1.08,1.12);let $=r(k,new X(new Ma(.07,.2,8),c(ye.jacket)),0,.24,-.19);$.rotation.x=-2.2;let j=new At(.13,.022,6,18),d=r(k,new X(j,c(ye.lining)),0,.17,.035);d.rotation.x=-.35,d.scale.set(1,1.15,1);for(let u of[1,-1]){let U=u>0?"L":"R",te=l(R,"sh"+U,.215*u,.13,0);r(te,Vt(.058,.2,c(ye.jacket)));let ie=l(te,"el"+U,0,-.29,0);r(ie,Vt(.052,.17,c(ye.jacket))),r(ie,new X(new Rt(.06,.06,.1,10),c(ye.launcher,1)),0,-.22,0);let ge=l(ie,"hand"+U,0,-.31,0);r(ge,new X(new ht(.055,10,8),c(ye.glove)))}for(let u of[1,-1]){let U=u>0?"L":"R",te=l(A,"hip"+U,.1*u,-.06,0);r(te,Vt(.078,.3,c(ye.pants))),r(te,new X(new Oe(.02,.3,.05),c(ye.jacket)),.075*u,-.2,0);let ie=l(te,"kn"+U,0,-.42,0);r(ie,Vt(.066,.3,c(ye.pants))),r(ie,new X(new ht(.075,10,8),c(ye.pad)),0,-.02,.03).scale.set(1,1.1,.8);let ge=l(ie,"ft"+U,0,-.42,0);r(ge,new X(new Oe(.11,.09,.25),c(ye.shoe)),0,-.03,.06),r(ge,new X(new Oe(.115,.035,.255),c(ye.sole)),0,-.085,.06)}let p=7,W=new Float32Array(p*2*3),L=new Ue;L.setAttribute("position",new ft(W,3));let H=[];for(let u=0;u<p-1;u++){let U=u*2;H.push(U,U+1,U+2,U+1,U+3,U+2)}L.setIndex(H);let g=new Float32Array(p*2*3);for(let u=0;u<p*2;u++)g[u*3+2]=1;L.setAttribute("normal",new ft(g,3));let y=i?h:$t(ye.lining,n++,.2);i||(y.side=$e,E.push(y)),E.push(L);let w=new X(L,y);w.frustumCulled=!1;let a=Array.from({length:p},()=>new q),V=!1;e.add(m),i||e.add(w);let s={};for(let u of ea)s[u]=[0,0,0];let K=new ut,P=new ut,N=new gt,oe=new q,ae=new q,ne=new q,J=0,ee=0,je="idle",Ne=0;function O(u){let U=Math.hypot(u.vx,u.vy,u.vz);switch(u.mode){case _.SWING:{let ie=(u.y-u.ay)/Math.max(u.L,1)<-.85?He.swingLow:He.swing;return u.hand>0?ie:Za(ie)}case _.WALL:return ee%2?He.wallA:He.wallB;case _.ZIP:return He.zip;case _.GROUND:return u.rollT>0?He.tuck:u.landT<.2?He.land:Math.hypot(u.vx,u.vz)>2?ee%2?He.runA:He.runB:He.idle;default:return u.dashT<.25?He.dash:u.dive?He.dive:u.releaseT<.3||u.kickT<.25?He.tuck:u.vy>2?u.side>0?He.soar:Za(He.soar):He.fall}}function ze(u,U){let te=Math.hypot(u.vx,u.vy,u.vz)||1;ae.set(u.vx/te,u.vy/te,u.vz/te);let ie=Math.hypot(u.vx,u.vz);switch(u.mode){case _.SWING:oe.set(u.ax-u.x,u.ay-u.y,u.az-u.z).normalize();break;case _.ZIP:oe.set(u.zx-u.x,u.zy-u.y+3,u.zz-u.z).normalize();break;case _.WALL:oe.set(u.wnx*.35,1,u.wnz*.35).normalize(),u.wallUp&&(oe.set(-u.wnx,.25,-u.wnz).normalize(),ae.set(0,1,0));break;case _.GROUND:oe.set(0,1,0);break;default:u.dive?(oe.copy(ae),ae.set(0,-1,0),Math.abs(oe.y)>.98&&ae.set(Math.sin(u.yaw),0,Math.cos(u.yaw))):oe.set(u.vx*.012,1,u.vz*.012).normalize()}return ie<.5&&u.mode!==_.WALL&&!u.dive&&ae.set(Math.sin(u.yaw),0,Math.cos(u.yaw)),ae.addScaledVector(oe,-ae.dot(oe)),ae.lengthSq()<1e-4&&ae.set(Math.sin(u.yaw),0,Math.cos(u.yaw)).addScaledVector(oe,-Math.sin(u.yaw)*oe.x-Math.cos(u.yaw)*oe.z),ae.normalize(),ne.crossVectors(oe,ae).normalize(),N.makeBasis(ne,oe,ae),U.setFromRotationMatrix(N),u.mode===_.GROUND&&u.rollT>0&&(P.setFromAxisAngle(ne.set(1,0,0),(1-u.rollT/.45)*Math.PI*2),U.multiply(P)),U}let Ie=new ut;return{root:m,joints:x,scarf:w,update(u,U,te,ie,ge,Se){let fe=u.mode===_.GROUND?u.rollT>0?.05:u.landT<.2?.12:.38:0;Ne+=(fe-Ne)*.35,m.position.set(U,te+Ne,ie);let nt=Math.floor(ge*12);if(nt!==J||Se==="force"){J=nt,ee++;let Ke=O(u),ke=.7;for(let Y of ea){let re=s[Y],Be=Ke[Y]||[0,0,0];re[0]+=(Be[0]-re[0])*ke,re[1]+=(Be[1]-re[1])*ke,re[2]+=(Be[2]-re[2])*ke,x[Y].rotation.set(re[0],re[1],re[2])}ze(u,Ie),K.slerp(Ie,.75),z.quaternion.copy(K),je=u.mode,m.updateMatrixWorld(!0);let Ee=x.neck.getWorldPosition(new q),Ge=Math.hypot(u.vx,u.vy,u.vz),st=new q(-u.vx,-u.vy,-u.vz).multiplyScalar(1/Math.max(Ge,1));if(Ge<3&&st.set(-Math.sin(u.yaw)*.35,-1,-Math.cos(u.yaw)*.35).normalize(),!V){for(let Y of a)Y.copy(Ee);V=!0}a[0].copy(Ee);let Ze=.09+Math.min(Ge,40)*.0035;for(let Y=1;Y<p;Y++){let re=a[Y-1],Be=Math.sin(ee*1.7+Y*1.3)*.06*Math.min(1,Ge/20),mt=new q().copy(re).addScaledVector(st,Ze).add(new q(0,-.03*(1-Math.min(1,Ge/15))+Be,Be));a[Y].lerp(mt,.8);let rt=a[Y].clone().sub(re);rt.length()>Ze&&a[Y].copy(re).addScaledVector(rt.normalize(),Ze)}let Ce=new q().crossVectors(st,new q(0,1,0));Ce.lengthSq()<1e-4&&Ce.set(1,0,0),Ce.normalize().multiplyScalar(.07);for(let Y=0;Y<p;Y++){let re=1-Y/p*.5;W[Y*6]=a[Y].x-Ce.x*re,W[Y*6+1]=a[Y].y-Ce.y*re,W[Y*6+2]=a[Y].z-Ce.z*re,W[Y*6+3]=a[Y].x+Ce.x*re,W[Y*6+4]=a[Y].y+Ce.y*re,W[Y*6+5]=a[Y].z+Ce.z*re}L.attributes.position.needsUpdate=!0,L.computeBoundingSphere()}},handWorld(u,U){return x[u>0?"handR":"handL"].getWorldPosition(U)},setVisible(u){m.visible=u,w.visible=u&&!i},pose:()=>je,dispose(){e.remove(m),e.remove(w);for(let u of E)u.dispose?.()}}}function Xa(e,o,i={}){let E=[],n=G=>(E.push(G),G),c=new at;e.add(c);let h=!!i.reduced,m=24,z=new Float32Array(m*2*3),x=new Float32Array(m*2*2),l=[];for(let G=0;G<m-1;G++){let Q=G*2;l.push(Q,Q+1,Q+2,Q+1,Q+3,Q+2)}for(let G=0;G<m;G++)x[G*4]=G/(m-1),x[G*4+1]=0,x[G*4+2]=G/(m-1),x[G*4+3]=1;let r=n(new Ue);r.setAttribute("position",new ft(z,3)),r.setAttribute("uv",new ft(x,2)),r.setIndex(l);let A=n(new xe({uniforms:{...we,uA:{value:1},uCue:{value:0}},side:$e,vertexShader:"varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0); }",fragmentShader:`
      uniform float uA; uniform float uCue; varying vec2 vUv;
      void main() {
        float core = 1.0 - smoothstep(0.18, 0.42, abs(vUv.y - 0.5));
        // in the perfect-release window the line burns yellow: let go now
        vec3 edge = mix(vec3(0.05, 0.85, 1.0), vec3(1.0, 0.88, 0.15), uCue);
        vec3 c = mix(edge, vec3(1.0), core);
        gl_FragColor = vec4(c, 251.0 / 255.0);
      }`})),D=new X(r,A);D.frustumCulled=!1,D.visible=!1,c.add(D);let M={t:0,on:!1,ax:0,ay:0,az:0,fade:0,hx:0,hy:0,hz:0,zip:!1},I=new q,R=new q,S=new q,k=new q,T=new q,F=new q;function $(G,Q,de){let le=M.on;if(!le&&M.fade<=0){D.visible=!1;return}D.visible=!0,M.t+=de,le||(M.fade-=de*7);let be=M.ax,pe=M.ay,Tt=M.az;S.copy(Q),k.set(be-S.x,pe-S.y,Tt-S.z);let Ve=k.length();k.multiplyScalar(1/Math.max(Ve,1e-4));let De=Math.min(1,M.t/.12),Xe=Ve*(le?1-Math.pow(1-De,3):Math.max(0,M.fade)),pt=(le?Math.max(0,1-M.t/.35):.6)*Math.min(2.2,Ve*.05);F.copy(G.position).sub(S).normalize(),T.crossVectors(k,F).normalize();let Pt=.03+Ve*5e-4;for(let Pe=0;Pe<m;Pe++){let Ae=Pe/(m-1),Qe=Ae*Xe,t=Math.sin(Ae*9-M.t*40)*pt*Math.sin(Ae*Math.PI),f=(1-De)*Math.sin(Ae*Math.PI)*Ve*.08;R.copy(S).addScaledVector(k,Qe).addScaledVector(T,t),R.y-=f;let B=R.distanceTo(G.position),b=Math.max(Pt,B*.0019)*(1-.3*Ae);z[Pe*6]=R.x-T.x*b,z[Pe*6+1]=R.y-T.y*b,z[Pe*6+2]=R.z-T.z*b,z[Pe*6+3]=R.x+T.x*b,z[Pe*6+4]=R.y+T.y*b,z[Pe*6+5]=R.z+T.z*b}r.attributes.position.needsUpdate=!0}let j=n(ho()),d=(G,Q,de)=>{let le=n(new Kt({map:G,color:Q,sizeAttenuation:!1,depthTest:!1,depthWrite:!1,transparent:!0}));le.blending=xt,le.blendSrc=wt,le.blendDst=St,le.blendSrcAlpha=yt,le.blendDstAlpha=lt;let be=new Zt(le);return be.scale.set(de,de,1),be.renderOrder=10,be.visible=!1,c.add(be),be},p=d(j.ring,16777215,.045),W=d(j.diamond,16777215,.05),L=n(new At(Lt,.75,8,48)),H=n(qe("#ffe14a",228,{glow:.35})),g=n(qe("#18e7ff",229,{glow:.2})),y=new X(L,H),w=new X(L,g);y.visible=w.visible=!1,c.add(y,w);let a=n(new At(Lt-1.6,.25,6,48)),V=new X(a,n(qe("#ff2bd6",227,{glow:.5})));y.add(V);let s=n(new Rt(1.6,1.6,1,16,1,!0));s.translate(0,.5,0);let K=n(new xe({uniforms:{...we},...Ct({side:$e}),vertexShader:"varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`
      uniform float uTime; varying vec2 vUv;
      void main() {
        float a = (1.0 - vUv.y) * 0.55 + 0.1;
        float bands = 0.75 + 0.25 * step(0.5, fract(vUv.y * 40.0 - uTime * 1.5));
        gl_FragColor = vec4(vec3(1.0, 0.88, 0.3) * bands, a * 0.6);
      }`})),P=new X(s,K);P.visible=!1,c.add(P);let N=n(mo()),oe=n(qe("#fff6e0",160,{side:$e,glow:.15})),ae=new dt(N,oe,o.cranes.length);ae.frustumCulled=!1,c.add(ae);let ne=n(new Ue);ne.setAttribute("position",new me(o.cranes.flatMap(G=>[G.x,G.y,G.z]),3));let J=new Ot(ne,n(new xe({uniforms:{...we,uHide:{value:new Float32Array(32)}},...Ct(),vertexShader:"uniform vec2 uRes; uniform float uTime; varying float vA; void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; vA = 0.6 + 0.4 * sin(uTime * 3.0 + position.x); gl_PointSize = clamp(9.0 * uRes.y * 0.5 / -mv.z, 3.0, 90.0); }",fragmentShader:"varying float vA; void main() { float r = length(gl_PointCoord - 0.5) * 2.0; float a = 1.0 - smoothstep(0.0, 1.0, r); gl_FragColor = vec4(vec3(1.0, 0.85, 0.4), a * a * vA * 0.5); }"})));J.frustumCulled=!1,c.add(J);let ee=new gt,je=new ut,Ne=new q,O=new q,ze=new q(0,1,0),Ie={shu:["\u30B7\u30E5\u30C3","#ffe14a","#ff2bd6"],don:["\u30C9\u30F3!","#fff6e0","#ff3355"],byun:["\u30D3\u30E5\u30F3","#18e7ff","#ff2bd6"],zaza:["\u30BA\u30B6\u30C3","#ffe14a","#18e7ff"],suta:["\u30B9\u30BF\u30C3","#fff6e0","#18e7ff"],hyu:["\u30D2\u30E5\u30AA\u30C3","#18e7ff","#3b1d78"],perfect:["PERFECT","#ffe14a","#ff2bd6",!0],crane:["\u6298\u308A\u9DB4","#fff6e0","#ff2bd6"]},u={},U=G=>u[G]||(u[G]=n(Ia(...Ie[G].slice(0,3),!!Ie[G][3]))),te=[];for(let G=0;G<6;G++){let Q=n(new Kt({transparent:!0,depthTest:!1,depthWrite:!1}));Q.blending=xt,Q.blendSrc=wt,Q.blendDst=St,Q.blendSrcAlpha=yt,Q.blendDstAlpha=lt;let de=new Zt(Q);de.visible=!1,de.renderOrder=20,c.add(de),te.push({s:de,t:0,life:0,base:1,rot:0})}let ie=0,ge=1;function Se(G,Q,de,le,be=1){let pe=te[ie++%te.length];pe.s.material.map=U(G),pe.s.material.needsUpdate=!0,ge=-ge,pe.x=Q,pe.y=de,pe.z=le,pe.side=ge,pe.t=0,pe.life=.7,pe.base=be,pe.s.visible=!0,pe.rot=ge*(.08+Math.random()*.12),pe.s.material.rotation=pe.rot}let fe=new q,nt=new q,Ke=36,ke=n(new Ue),Ee=new Float32Array(Ke*4*3),Ge=new Float32Array(Ke*4),st=[];for(let G=0;G<Ke;G++){let Q=G*4;st.push(Q,Q+1,Q+2,Q,Q+2,Q+3)}ke.setAttribute("position",new ft(Ee,3)),ke.setAttribute("aA",new ft(Ge,1)),ke.setIndex(st);let Ze=n(new xe({...Jt({side:$e}),vertexShader:"attribute float aA; varying float vA; void main() { vA = aA; gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0); }",fragmentShader:"varying float vA; void main() { gl_FragColor = vec4(1.0, 0.98, 0.92, vA); }"})),Ce=new X(ke,Ze);Ce.frustumCulled=!1,c.add(Ce);let Y=Array.from({length:Ke},()=>({x:0,y:0,z:0,life:0,len:0})),re=0,Be=0,mt=n(new Ea(.8,20));mt.rotateX(-Math.PI/2);let rt=n(new xe({...Jt(),uniforms:{uA:{value:.5}},vertexShader:"varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",fragmentShader:"uniform float uA; varying vec2 vUv; void main(){ float r = length(vUv - 0.5) * 2.0; gl_FragColor = vec4(0.05, 0.02, 0.1, (1.0 - smoothstep(0.5, 1.0, r)) * uA); }"})),bt=new X(mt,rt);return c.add(bt),{group:c,line:D,attach(G,Q,de){M.on=!0,M.t=0,M.ax=G,M.ay=Q,M.az=de,M.fade=1},detach(){M.on&&(M.on=!1,M.fade=1)},sticker:Se,update(G){let{camera:Q,dt:de,t:le,pl:be,handPos:pe,aimPos:Tt,zipPos:Ve,rings:De,cranesHidden:Xe,roofY:pt,speed:Pt}=G;if(M.on&&G.lineAnchor&&(M.ax=G.lineAnchor.x,M.ay=G.lineAnchor.y,M.az=G.lineAnchor.z),A.uniforms.uCue.value=G.cue?.75+.25*Math.sin(le*40):G.cueStatic?1:0,$(Q,pe,de),Tt?(p.visible=!0,p.position.copy(Tt),p.material.rotation=le*.8):p.visible=!1,Ve){W.visible=!0,W.position.copy(Ve);let v=.05+Math.sin(le*6)*.004;W.scale.set(v,v,1)}else W.visible=!1;if(De&&De.next){let v=De.next;y.visible=!0,y.position.set(v.x,v.y,v.z),y.lookAt(v.x+v.fx,v.y,v.z+v.fz);let C=h?1:1+Math.sin(le*5)*.03;y.scale.setScalar(C),P.visible=!0,P.position.set(v.x,0,v.z),P.scale.set(1,Math.max(1,v.y-Lt),1)}else y.visible=!1,P.visible=!1;if(De&&De.after){let v=De.after;w.visible=!0,w.position.set(v.x,v.y,v.z),w.lookAt(v.x+v.fx,v.y,v.z+v.fz),w.scale.setScalar(.7)}else w.visible=!1;for(let v=0;v<o.cranes.length;v++){let C=o.cranes[v],Z=Xe===!0||Xe&&Xe[v];je.setFromAxisAngle(ze,le*1.3+v),O.set(C.x,C.y+Math.sin(le*2+v)*.3,C.z),Ne.setScalar(Z?0:1.4),ee.compose(O,je,Ne),ae.setMatrixAt(v,ee)}ae.instanceMatrix.needsUpdate=!0,J.visible=Xe!==!0,fe.setFromMatrixColumn(Q.matrixWorld,0),nt.setFromMatrixColumn(Q.matrixWorld,1);for(let v of te){if(!v.s.visible)continue;v.t+=de;let C=v.t/v.life;if(C>=1){v.s.visible=!1;continue}let Z=h?1:C<.12?.4+C/.12*.8:C<.2?1.2-(C-.12)/.08*.2:1;R.set(v.x,v.y,v.z);let ve=Math.max(3,R.distanceTo(Q.position)),Re=ve*.085*v.base*Z;v.s.position.copy(R).addScaledVector(fe,v.side*(Re*1.25+ve*.04)).addScaledVector(nt,Re*.55+(h?0:C*ve*.02)),v.s.scale.set(Re*2,Re,1),v.s.material.opacity=C>.7?1-(C-.7)/.3:1}let Pe=Pt||0;Be+=de*Math.max(0,Pe-26)*1.6;let Ae=be.vx,Qe=be.vy,t=be.vz,f=Math.hypot(Ae,Qe,t)||1;for(;Be>1&&!h;){Be-=1;let v=Y[re++%Ke],C=Math.random()*Math.PI*2,Z=1.4+Math.random()*3.5;T.set(-t,0,Ae).normalize(),T.lengthSq()<.5&&T.set(1,0,0),F.crossVectors(T,R.set(Ae/f,Qe/f,t/f)).normalize(),v.x=G.hx+(T.x*Math.cos(C)+F.x*Math.sin(C))*Z+Ae/f*6,v.y=G.hy+(T.y*Math.cos(C)+F.y*Math.sin(C))*Z+Qe/f*6,v.z=G.hz+(T.z*Math.cos(C)+F.z*Math.sin(C))*Z+t/f*6,v.life=.28,v.len=2+Pe*.06}F.copy(Q.position);for(let v=0;v<Ke;v++){let C=Y[v];C.life-=de;let Z=C.life>0?Math.min(1,C.life/.12)*.55:0,ve=C.x-Ae/f*C.len,Re=C.y-Qe/f*C.len,he=C.z-t/f*C.len;R.set(C.x-F.x,C.y-F.y,C.z-F.z),T.set(Ae/f,Qe/f,t/f).cross(R).normalize().multiplyScalar(.025+R.length()*.0012);let se=v*12;Ee[se]=C.x-T.x,Ee[se+1]=C.y-T.y,Ee[se+2]=C.z-T.z,Ee[se+3]=C.x+T.x,Ee[se+4]=C.y+T.y,Ee[se+5]=C.z+T.z,Ee[se+6]=ve+T.x,Ee[se+7]=Re+T.y,Ee[se+8]=he+T.z,Ee[se+9]=ve-T.x,Ee[se+10]=Re-T.y,Ee[se+11]=he-T.z,Ge[v*4]=Ge[v*4+1]=Z,Ge[v*4+2]=Ge[v*4+3]=0}ke.attributes.position.needsUpdate=!0,ke.attributes.aA.needsUpdate=!0;let B=Math.max(0,G.hy-pt);bt.position.set(G.hx,pt+.06,G.hz);let b=1+B*.03;bt.scale.set(b,1,b),rt.uniforms.uA.value=Math.max(0,.55-B*.012)},dispose(){e.remove(c);for(let G of E)G.dispose?.()}}}function ho(){let e=document.createElement("canvas");e.width=e.height=128;let o=e.getContext("2d");o.lineWidth=12,o.strokeStyle="#140a2a",o.beginPath(),o.arc(64,64,44,0,7),o.stroke(),o.lineWidth=6,o.strokeStyle="#18e7ff";for(let c=0;c<4;c++)o.beginPath(),o.arc(64,64,44,c*Math.PI/2+.25,c*Math.PI/2+Math.PI/2-.25),o.stroke();o.fillStyle="#140a2a",o.beginPath(),o.arc(64,64,11,0,7),o.fill(),o.fillStyle="#ffffff",o.beginPath(),o.arc(64,64,6,0,7),o.fill();let i=document.createElement("canvas");i.width=i.height=128,o=i.getContext("2d"),o.translate(64,64),o.rotate(Math.PI/4),o.lineWidth=14,o.strokeStyle="#140a2a",o.strokeRect(-34,-34,68,68),o.lineWidth=7,o.strokeStyle="#ffe14a",o.strokeRect(-34,-34,68,68),o.fillStyle="#ffe14a",o.fillRect(-10,-10,20,20);let E=new Xt(e),n=new Xt(i);return E.colorSpace=n.colorSpace=ha,{ring:E,diamond:n,dispose(){E.dispose(),n.dispose()}}}function mo(){let e=[[0,0,.8,.25,.2,0,0,0,-.8],[0,0,.8,-.25,.2,0,0,0,-.8],[.15,.15,.35,1.5,.8,-.1,.15,.15,-.35],[-.15,.15,.35,-1.5,.8,-.1,-.15,.15,-.35],[0,0,.6,.08,.1,.65,0,.9,1.2],[0,.9,1.2,0,.75,1.5,.05,.85,1.25],[0,0,-.6,.08,.1,-.65,0,.95,-1.2]],o=[];for(let E of e)o.push(...E);let i=new Ue;return i.setAttribute("position",new me(o,3)),i.computeVertexNormals(),i.scale(1.3,1.3,1.3),i}function Qa(e){let o=new pa(4,4,{type:ua,format:da,depthBuffer:!0,stencilBuffer:!1,samples:0});o.texture.minFilter=jt,o.texture.magFilter=jt,o.texture.generateMipmaps=!1,o.depthTexture=new ya(4,4),o.depthTexture.type=fa;let i={tColor:{value:o.texture},tDepth:{value:o.depthTexture},uPx:{value:new Ft(1/4,1/4)},uRes:{value:new Ft(4,4)},uNear:{value:.3},uFar:{value:3e3},uLine:{value:1.4},uMis:{value:1},uGrain:{value:1},uHatch:{value:1},uSpeed:{value:0},uPanel:{value:0},uTime:{value:0},uFrame:{value:0},uBoil:{value:1},uInk:{value:new q(.078,.039,.165)},uFlash:{value:0},uVig:{value:.35}},E=new xe({uniforms:i,depthTest:!1,depthWrite:!1,vertexShader:"varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",fragmentShader:`
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
      }`}),n=new X(new Et(2,2),E);n.frustumCulled=!1;let c=new Nt;c.add(n);let h=new xa(-1,1,1,-1,0,1);return{rt:o,uniforms:i,setSize(m,z){o.setSize(m,z),i.uPx.value.set(1/m,1/z),i.uRes.value.set(m,z),i.uLine.value=Math.max(1,z/620)},render(m,z){i.uNear.value=z.near,i.uFar.value=z.far,e.setRenderTarget(o),e.render(m,z),e.setRenderTarget(null),e.render(c,h)},dispose(){o.dispose(),o.depthTexture?.dispose(),E.dispose(),n.geometry.dispose()}}}function Ya(){let e=null,o=null,i=null,E=null,n=null,c=null,h=null,m=null,z=null,x=!0,l=!0,r=!1,A=0,D=0,M=0;function I(){if(e)return!0;let L=typeof window<"u"&&(window.AudioContext||window.webkitAudioContext);if(!L)return!1;try{e=new L}catch{return!1}o=e.createGain(),o.gain.value=x?.8:0,o.connect(e.destination);let H=e.createDynamicsCompressor();H.threshold.value=-14,H.ratio.value=4,H.connect(o),i=e.createGain(),i.gain.value=.9,i.connect(H),E=e.createGain(),E.gain.value=l?.32:0,E.connect(H),z=e.createBuffer(1,e.sampleRate*2,e.sampleRate);let g=z.getChannelData(0);for(let a=0;a<g.length;a++)g[a]=Math.random()*2-1;let y=e.createBufferSource();y.buffer=z,y.loop=!0,c=e.createBiquadFilter(),c.type="bandpass",c.frequency.value=400,c.Q.value=.7,n=e.createGain(),n.gain.value=0,y.connect(c),c.connect(n),n.connect(i),y.start(),m=e.createOscillator(),m.type="triangle",m.frequency.value=70;let w=e.createBiquadFilter();return w.type="lowpass",w.frequency.value=500,h=e.createGain(),h.gain.value=0,m.connect(w),w.connect(h),h.connect(i),m.start(),!0}function R(L,H,g,y,w="bandpass",a=1,V=0){let s=e.currentTime+V,K=e.createBufferSource();K.buffer=z;let P=e.createBiquadFilter();P.type=w,P.Q.value=a,P.frequency.setValueAtTime(H,s),P.frequency.exponentialRampToValueAtTime(Math.max(20,g),s+L);let N=e.createGain();N.gain.setValueAtTime(0,s),N.gain.linearRampToValueAtTime(y,s+Math.min(.02,L*.2)),N.gain.exponentialRampToValueAtTime(8e-4,s+L),K.connect(P),P.connect(N),N.connect(i),K.start(s,Math.random()*1.5),K.stop(s+L+.05)}function S(L,H,g,y,w,a=i,V=0){let s=e.currentTime+V,K=e.createOscillator();K.type=L,K.frequency.setValueAtTime(H,s),K.frequency.exponentialRampToValueAtTime(Math.max(20,g),s+y);let P=e.createGain();P.gain.setValueAtTime(0,s),P.gain.linearRampToValueAtTime(w,s+.008),P.gain.exponentialRampToValueAtTime(8e-4,s+y),K.connect(P),P.connect(a),K.start(s),K.stop(s+y+.05)}let k=[[53,57,60,64],[52,55,59,62],[50,53,57,60],[55,60,62,65],[58,62,65,69],[57,60,64,67],[55,58,62,65],[48,52,55,58]],T=[41,40,38,43,46,45,43,36],F=L=>440*Math.pow(2,(L-69)/12),$=84,j=60/$;function d(L,H,g,y){for(let[w,a]of[[1,1],[2,.18]]){let V=e.createOscillator();V.type="sine",V.frequency.value=F(L)*w;let s=e.createGain();s.gain.setValueAtTime(0,H),s.gain.linearRampToValueAtTime(y*a,H+.02),s.gain.exponentialRampToValueAtTime(8e-4,H+g),V.connect(s),s.connect(E),V.start(H),V.stop(H+g+.05)}}function p(L,H){if(L==="k"){let g=e.createOscillator();g.frequency.setValueAtTime(120,H),g.frequency.exponentialRampToValueAtTime(45,H+.18);let y=e.createGain();y.gain.setValueAtTime(.5,H),y.gain.exponentialRampToValueAtTime(.001,H+.25),g.connect(y),y.connect(E),g.start(H),g.stop(H+.3)}else{let g=e.createBufferSource();g.buffer=z;let y=e.createBiquadFilter();y.type=L==="s"?"bandpass":"highpass",y.frequency.value=L==="s"?1800:7e3;let w=e.createGain(),a=L==="s"?.28:.07,V=L==="s"?.16:.04;w.gain.setValueAtTime(a,H),w.gain.exponentialRampToValueAtTime(.001,H+V),g.connect(y),y.connect(w),w.connect(E),g.start(H,Math.random()),g.stop(H+V+.02)}}function W(){if(!e||!l)return;let L=e.currentTime+.25;for(D<e.currentTime&&(D=e.currentTime+.05);D<L;){let H=Math.floor(M/4)%8,g=M%4,y=D;if(g===0){for(let w of k[H])d(w,y+Math.random()*.02,j*3.6,.05);d(T[H]-12,y,j*1.8,.16)}g===2&&d(T[H]-12+7,y,j*1.2,.1),g===0&&p("k",y),g===2&&p("k",y+j*.5),(g===1||g===3)&&p("s",y),p("h",y),p("h",y+j*.66),(H*7+g*3)%5===0&&d(k[H][(g+H)%4]+12,y+j*.5,j*1.4,.035),D+=j,M++}}return{start(){I()&&(e.state==="suspended"&&e.resume().catch(()=>{}),r=!0)},get started(){return r},setSound(L){x=L,o&&o.gain.setTargetAtTime(L?.8:0,e.currentTime,.05)},setMusic(L){l=L,E&&E.gain.setTargetAtTime(L?.32:0,e.currentTime,.2)},suspend(){e&&e.state==="running"&&e.suspend().catch(()=>{})},resume(){e&&r&&e.state==="suspended"&&e.resume().catch(()=>{})},update(L,H,g,y){if(!e||!r)return;let w=e.currentTime,a=g?Math.min(1,Math.max(0,(L-6)/50)):0;n.gain.setTargetAtTime(a*a*.5,w,.08),c.frequency.setTargetAtTime(300+a*1700,w,.1),h.gain.setTargetAtTime(g?Math.min(.06,H*.06):0,w,.05),m.frequency.setTargetAtTime(60+H*40,w,.1),A-=y,A<=0&&(A=.1,W())},sfx(L,H=1){if(!(!e||!r||!x))switch(L){case"fire":R(.12,5200,1400,.22,"bandpass",3),S("square",1500,600,.05,.03);break;case"catch":S("sine",180,90,.12,.18),R(.06,900,400,.08);break;case"release":R(.32,700,2600,.22*H,"bandpass",.8);break;case"perfect":R(.35,900,3200,.25,"bandpass",.8),S("triangle",880,1760,.18,.06),S("triangle",1320,2640,.2,.04,i,.06);break;case"dash":R(.3,3e3,300,.3,"bandpass",1.2),S("sawtooth",220,80,.2,.04);break;case"zip":R(.5,400,3e3,.18,"bandpass",2);break;case"land":S("sine",140,50,.18,.35*H),R(.1,1200,300,.15*H,"lowpass");break;case"bounce":S("sine",110,40,.35,.5),R(.25,600,120,.3,"lowpass"),S("square",220,180,.08,.04);break;case"wall":R(.18,2500,900,.12,"bandpass",2);break;case"kick":S("sine",200,80,.12,.2),R(.15,1500,3e3,.1);break;case"ring":S("triangle",988,988,.12,.08),S("triangle",1319,1319,.2,.07,i,.07);break;case"finish":[659,784,988,1319].forEach((g,y)=>S("triangle",g,g,.35,.07,i,y*.09));break;case"crane":S("sine",1568,1568,.25,.07),S("sine",2093,2093,.35,.05,i,.08);break;case"close":R(.2,1800,600,.12,"bandpass",1.5);break;case"radio":R(.08,2600,1800,.05,"bandpass",3),S("square",1320,1320,.05,.025,i,.06),S("square",990,990,.06,.025,i,.13);break;case"ui":S("square",1200,1200,.03,.03);break;case"uiback":S("square",700,700,.04,.03);break;case"chain":S("triangle",660+Math.min(12,H)*40,660+Math.min(12,H)*40,.08,.04);break;default:}},dispose(){try{e&&e.close()}catch{}e=null}}}var Wt={low:{name:"LOW",pixels:42e4,dot:5,hatch:0,traffic:.5},balanced:{name:"BALANCED",pixels:85e4,dot:6,hatch:1,traffic:1},high:{name:"HIGH",pixels:13e5,dot:6.5,hatch:1,traffic:1}},eo=()=>typeof navigator<"u"&&navigator.maxTouchPoints>0&&Math.min(screen.width,screen.height)<820,$a=e=>Wt[e]?e:eo()?"low":"balanced",aa=e=>{for(;e>Math.PI;)e-=2*Math.PI;for(;e<-Math.PI;)e+=2*Math.PI;return e},Ja=new Int32Array(256);function Ko(){try{return!!document.createElement("canvas").getContext("webgl2")}catch{return!1}}function Zo(e,o={}){let i=o.onEvent||(()=>{}),E=o.onHud||(()=>{}),n=!!o.reduced,c={quality:"auto",sens:1,invertY:!1,assist:!0,sound:!0,music:!0,...o.settings||{}},h=new wa({canvas:e,antialias:!1,alpha:!1,stencil:!1,depth:!0,powerPreference:"high-performance"});h.setClearColor(0,0),h.info.autoReset=!1,h.autoClear=!0;let m=!1,z=t=>{t.preventDefault(),m=!0,i({type:"contextlost"})};e.addEventListener("webglcontextlost",z);let x=Sa(),l=x.S,r=new Nt,A=new va(66,1,.3,3e3),D=new X(new ht(1800,32,16),qa());D.frustumCulled=!1,D.renderOrder=-1,r.add(D);let M=$a(c.quality),I=Ka(x.city,r,{trafficScale:Wt[M].traffic}),R=ta(r),S=ta(r,{ghost:!0});S.setVisible(!1);let k=Xa(r,x,{reduced:n}),T=Qa(h);n&&(T.uniforms.uMis.value=0,T.uniforms.uBoil.value=0,we.uFlicker.value=0);let F=Ya();F.setSound(c.sound),F.setMusic(c.music);let $=1,j=0,d=0,p=16;function W(){let t=Math.max(1,e.clientWidth),f=Math.max(1,e.clientHeight),B=Math.sqrt(Wt[M].pixels/(t*f));return Math.max(.4,Math.min(window.devicePixelRatio||1,2,B))*$}function L(){let t=Math.max(1,e.clientWidth),f=Math.max(1,e.clientHeight),B=W();h.setPixelRatio(B),h.setSize(t,f,!1);let b=Math.floor(t*B),v=Math.floor(f*B);T.setSize(b,v),we.uRes.value.set(b,v),we.uDot.value=Math.max(3.5,Wt[M].dot*v/900),T.uniforms.uHatch.value=Wt[M].hatch,A.aspect=t/f,A.updateProjectionMatrix()}let H=new ResizeObserver(L);H.observe(e),L();let g=new Set,y={swing:!1,dash:!1,zip:!1},w={mouseL:!1,lockLook:!1,dragLook:!1,lastLook:-9,stickX:0,stickY:0,touch:{swing:!1,dash:!1,zip:!1,dive:!1}},a={yaw:0,pitch:-.12,roll:0,fov:66,tx:0,ty:0,tz:0,init:!1,shake:0},V=(t,f,B=.0024)=>{a.yaw-=t*B*c.sens,a.pitch-=f*B*c.sens*(c.invertY?-1:1),a.pitch=Math.max(-1.25,Math.min(.95,a.pitch)),w.lastLook=te},s={KeyW:1,KeyA:1,KeyS:1,KeyD:1,ArrowUp:1,ArrowDown:1,ArrowLeft:1,ArrowRight:1,Space:1,ShiftLeft:1,ShiftRight:1,KeyE:1,KeyC:1,ControlLeft:1,ControlRight:1,KeyQ:1};function K(t){if(t.repeat&&s[t.code]){t.preventDefault();return}t.type==="keydown"?(s[t.code]&&(g.add(t.code),t.preventDefault(),J(),t.code==="Space"&&(y.swing=!0),(t.code==="ShiftLeft"||t.code==="ShiftRight")&&(y.dash=!0),(t.code==="KeyE"||t.code==="KeyQ")&&(y.zip=!0)),t.code==="KeyR"&&(O==="run"||O==="free")&&(Ee(),t.preventDefault()),(t.code==="Escape"||t.code==="KeyP")&&i({type:"escape"})):g.delete(t.code)}function P(t){if(!(O==="title"||ze)&&(J(),t.button===0&&(w.mouseL=!0,y.swing=!0),t.button===2&&(w.dragLook=!0,t.preventDefault()),t.button===0&&!eo()&&document.pointerLockElement!==e&&e.requestPointerLock&&o.pointerLock!==!1))try{let f=e.requestPointerLock();f&&f.catch&&f.catch(()=>{})}catch{}}function N(t){t.button===0&&(w.mouseL=!1),t.button===2&&(w.dragLook=!1)}function oe(t){ze||O==="title"||(document.pointerLockElement===e?V(t.movementX,t.movementY):w.dragLook&&V(t.movementX,t.movementY,.004))}let ae=t=>t.preventDefault();function ne(){g.clear(),w.mouseL=!1,w.dragLook=!1}window.addEventListener("keydown",K),window.addEventListener("keyup",K),e.addEventListener("mousedown",P),window.addEventListener("mouseup",N),window.addEventListener("mousemove",oe),e.addEventListener("contextmenu",ae),window.addEventListener("blur",ne);function J(){F.started||F.start()}let ee={swing:!1,dash:!1,zip:!1,dive:!1,mx:0,my:0,start:!1,back:!1};function je(t){let f=navigator.getGamepads?navigator.getGamepads():null,B=null;if(f){for(let he=0;he<f.length;he++)if(f[he]&&f[he].connected){B=f[he];break}}if(!B){ee.swing=ee.dash=ee.zip=ee.dive=!1,ee.mx=ee.my=0;return}let b=he=>Math.abs(he)>.15?he:0;ee.mx=b(B.axes[0]||0),ee.my=-b(B.axes[1]||0);let v=b(B.axes[2]||0),C=b(B.axes[3]||0);(v||C)&&V(v*900*t,C*700*t);let Z=he=>!!(B.buttons[he]&&(B.buttons[he].pressed||B.buttons[he].value>.4));ee.swing=Z(0)||Z(7)||Z(5),ee.dash=Z(2)||Z(4),ee.zip=Z(3),ee.dive=Z(1)||Z(6);let ve=Z(9),Re=Z(8);ve&&!ee.start&&i({type:"escape"}),Re&&!ee.back&&(O==="run"||O==="free")&&Ee(),ee.start=ve,ee.back=Re,(ee.swing||ee.dash)&&J()}function Ne(){let t=x.input,f=0,B=0;(g.has("KeyA")||g.has("ArrowLeft"))&&(f-=1),(g.has("KeyD")||g.has("ArrowRight"))&&(f+=1),(g.has("KeyW")||g.has("ArrowUp"))&&(B+=1),(g.has("KeyS")||g.has("ArrowDown"))&&(B-=1),f+=ee.mx+w.stickX,B+=ee.my+w.stickY,t.mx=Math.max(-1,Math.min(1,f)),t.my=Math.max(-1,Math.min(1,B)),t.swing=g.has("Space")||w.mouseL||ee.swing||w.touch.swing||y.swing,t.dash=g.has("ShiftLeft")||g.has("ShiftRight")||ee.dash||w.touch.dash||y.dash,t.zip=g.has("KeyE")||g.has("KeyQ")||ee.zip||w.touch.zip||y.zip,y.swing=y.dash=y.zip=!1,t.dive=g.has("KeyC")||g.has("ControlLeft")||g.has("ControlRight")||ee.dive||w.touch.dive,t.yaw=a.yaw,t.pitch=a.pitch+.12,t.zipCone=O==="tutorial"&&fe.step===3?.72:.9}let O="title",ze=!1,Ie=!1,u=!1,U=0,te=0,ie=0,ge=Gt(),Se=null,fe={step:0,done:!1,t:0},nt=0;function Ke(){let t=l.pl;a.yaw=Math.atan2(-Math.sin(t.yaw),-Math.cos(t.yaw))+0,a.yaw=aa(t.yaw+Math.PI),a.pitch=-.12,a.init=!1,x.input.yaw=a.yaw}function ke(t,f){O=t,ze=!1,U=0,ie=0,g.clear(),w.mouseL=!1,k.detach(),t==="run"?(nt=f,x.startRun(f),Se=o.ghosts&&o.ghosts[f]||null):t==="free"?(x.startFree(),Se=null):t==="tutorial"?(x.startFree(),fe.step=0,fe.done=!1,fe.t=0,Se=null):t==="title"&&(x.startRun(0),Se=null);let B=l.pl;a.yaw=aa(B.yaw+Math.PI),a.pitch=t==="run"||t==="title"?x.runs[l.run.idx].start.pitch:-.12,a.init=!1,w.lastLook=te,x.input.yaw=a.yaw,Object.assign(ge,Gt()),u=t==="title",Ie=u,l.events.length=0}function Ee(){O==="run"?ke("run",nt):O==="free"?ke("free"):O==="tutorial"&&ke("tutorial"),i({type:"restart"})}let Ge=new q;function st(t){let f=l.pl;switch(t.type){case"attach":F.sfx("fire"),setTimeout(()=>F.sfx("catch"),90),k.attach(f.lx,f.ly,f.lz);break;case"release":k.detach(),t.rising&&k.sticker(t.perfect?"perfect":"shu",f.x,f.y+1.6,f.z,t.perfect?1.1:1),F.sfx(t.perfect?"perfect":"release",Math.min(1,t.speed/40)),t.perfect&&!n&&!Ie&&(U=.12),O==="tutorial"&&fe.step===1&&t.lineT>.35&&Ze();break;case"dash":k.detach(),k.sticker("byun",f.x,f.y+1.2,f.z,1),F.sfx("dash"),O==="tutorial"&&fe.step===2&&Ze();break;case"zip":k.attach(f.zx,f.zy,f.zz),F.sfx("zip");break;case"perch":k.detach(),k.sticker("suta",f.x,f.y+1.5,f.z,.92),O==="tutorial"&&fe.step===3&&Ze();break;case"land":t.hard&&(k.sticker("don",f.x,f.y+1.2,f.z,1.08),a.shake=n?0:.25),F.sfx("land",t.hard?1:.5),k.detach();break;case"bounce":k.detach(),k.sticker("don",f.x,f.y+2,f.z,1.33),F.sfx("bounce"),a.shake=n?0:.45;break;case"wall":k.detach(),k.sticker("zaza",f.x,f.y+1.2,f.z,.83),F.sfx("wall");break;case"kick":F.sfx("kick");break;case"vault":F.sfx("kick");break;case"close":F.sfx("close");break;case"ring":F.sfx(t.last?"finish":"ring");break;case"crane":F.sfx("crane"),k.sticker("crane",f.x,f.y+1.8,f.z,.92);break;case"style":t.chain>=3&&F.sfx("chain",t.chain);break;case"finish":O="results";break;default:}t.type==="attach"&&O==="tutorial"&&fe.step===0&&(fe.wait=!0),i(t)}function Ze(){fe.step++,i({type:"tut",step:fe.step}),fe.step>=4&&(fe.done=!0)}function Ce(t,f,B,b){let v=-t*b,C=-f*b+.9,Z=-B*b,ve=a.tx+v,Re=a.tz+Z,he=za(x.city,Math.min(a.tx,ve)-1,Math.min(a.tz,Re)-1,Math.max(a.tx,ve)+1,Math.max(a.tz,Re)+1,Ja),se=1;for(let Te=0;Te<he;Te++){let vt=x.city.boxes[Ja[Te]];if(!Qt(vt,a.tx,a.ty,a.tz,v,C,Z,.45,0,se))continue;let it=0,ct=se;for(let Ye=0;Ye<12;Ye++){let We=(it+ct)/2;Qt(vt,a.tx,a.ty,a.tz,v,C,Z,.45,0,We)?ct=We:it=We}se=Math.max(.05,it*.96)}return a.ty+C*se<1.2&&(se=Math.min(se,Math.max(.05,(a.ty-1.2)/Math.max(.001,-C)))),se}let Y=new q,re=new q,Be=new q;function mt(t,f,B,b){let v=l.pl,C=Math.hypot(v.vx,v.vy,v.vz);a.init||(a.tx=f,a.ty=B+1,a.tz=b,a.init=!0);let Z=1-Math.exp(-t*(O==="results"?2:16));a.tx+=(f-a.tx)*Z,a.ty+=(B+1-a.ty)*Z,a.tz+=(b-a.tz)*Z;let ve=te-w.lastLook<1.1,Re=Math.atan2(-v.vx,-v.vz),he=Math.hypot(v.vx,v.vz);if(Ie)a.yaw+=aa(x.input.yaw-a.yaw)*Math.min(1,t*5);else if(c.assist&&!ve&&O!=="results"){let ce=l.run&&!l.run.done&&O==="run"?x.runs[l.run.idx].rings[l.run.next]:null;(he>6||ce&&v.mode!==_.GROUND)&&Da(a,v,t,ce)}O==="results"&&(a.yaw+=t*.15);let se=4.9+Math.min(C,60)*.03+(v.mode===_.GROUND?-.4:0)+(A.aspect<1?2.2*(1-A.aspect):0),Te=null;for(let ce=0;ce<6;ce++){let tt=a.yaw+(ce===2?.55:ce===3?-.55:ce===4?1.1:0)-0,Ht=ce===0?a.pitch:ce===5?-1.3:Math.min(a.pitch,-.75),oa=Math.cos(Ht),to=Math.sin(Ht),na=-Math.sin(tt)*oa,sa=to,ra=-Math.cos(tt)*oa,Ut=Ce(na,sa,ra,se);if((!Te||Ut*se>Te.d+.3)&&(Te={d:Ut*se,t:Ut,fx:na,fy:sa,fz:ra,c:ce}),Ut*se>2.8)break}re.set(Te.fx,Te.fy,Te.fz);let vt=Te.t,it=-re.x*se,ct=-re.y*se+.9,Ye=-re.z*se,We=vt;a.t=a.t===void 0||We<a.t?We:a.t+(We-a.t)*Math.min(1,t*2.5);let Je=a.tx+it*a.t,ue=Math.max(1,a.ty+ct*a.t),zt=a.tz+Ye*a.t;if(Te.c!==a.lastC&&a.px!==void 0&&(a.blend=1),a.blend=Math.max(0,(a.blend||0)-t*3.5),a.blend>0){let ce=a.blend*a.blend;Je+=(a.px-Je)*ce,ue+=(a.py-ue)*ce,zt+=(a.pz-zt)*ce}if(a.lastC=Te.c,a.px=Je,a.py=ue,a.pz=zt,a.shake>0){a.shake-=t;let ce=a.shake*.6;Je+=(Math.random()-.5)*ce,ue+=(Math.random()-.5)*ce}A.position.set(Je,ue,zt);let Fe=A.aspect<1?-1.1*(1-A.aspect)-.2:.3;Be.set(a.tx+re.x*6,a.ty+re.y*6+Fe,a.tz+re.z*6),A.lookAt(Be);let et=0;if(!n&&v.mode===_.SWING){Y.set(v.ax-v.x,0,v.az-v.z);let ce=Math.cos(a.yaw),tt=-Math.sin(a.yaw),Ht=(Y.x*ce+Y.z*tt)/Math.max(v.L,1);et=Math.max(-.12,Math.min(.12,-Ht*.25*Math.min(1,C/30)))}a.roll+=(et-a.roll)*Math.min(1,t*3),A.rotateZ(a.roll);let kt=62+Math.max(0,Math.min(1,(C-14)/44))*(n?8:12);a.fov+=(kt-a.fov)*Math.min(1,t*2.5),Math.abs(A.fov-a.fov)>.05&&(A.fov=a.fov,A.updateProjectionMatrix())}function rt(){Ie?((!l.run||l.run.done)&&u&&(x.startRun((l.run?l.run.idx+1:0)%3),Object.assign(ge,Gt())),Ga(ge,x,x.input,_e)):Ne(),x.step();for(let t=0;t<l.events.length;t++)st(l.events[t]);l.events.length=0,O==="tutorial"&&(fe.t+=_e,fe.step===0&&l.pl.mode===_.SWING&&l.pl.lineT>.5&&Ze())}let bt=new q,G=new q,Q=new q,de=new q,le=0;function be(t,f,B=!1){let b=l.pl,v=b.px+(b.x-b.px)*f,C=b.py+(b.y-b.py)*f,Z=b.pz+(b.z-b.pz)*f,ve=l.t;if(we.uTime.value=ve,B||mt(t,v,C,Z),we.uCamPos.value.copy(A.position),R.update(b,v,C,Z,ve),R.root.updateMatrixWorld(!0),R.handWorld(b.mode===_.ZIP?1:b.hand,bt),Se&&O==="run"&&l.run&&l.run.started){let Ye=l.run.t*10,We=Math.floor(Ye),Je=Ye-We,ue=Se,zt=ue.length/5;if(We+1<zt){let Fe=We*5,et=Fe+5,kt=(ue[Fe]+(ue[et]-ue[Fe])*Je)/10,ce=(ue[Fe+1]+(ue[et+1]-ue[Fe+1])*Je)/10,tt=(ue[Fe+2]+(ue[et+2]-ue[Fe+2])*Je)/10,Ht={mode:ue[Fe+4],vx:ue[et]-ue[Fe],vy:ue[et+1]-ue[Fe+1],vz:ue[et+2]-ue[Fe+2],yaw:ue[Fe+3]/100,ax:kt,ay:ce+30,az:tt,L:30,x:kt,y:ce,z:tt,hand:1,side:1,rollT:0,landT:9,dashT:9,releaseT:9,kickT:9,dive:!1,wnx:0,wnz:1,zx:kt,zy:ce,zz:tt};S.setVisible(!0),S.update(Ht,kt,ce,tt,ve)}else S.setVisible(!1)}else S.setVisible(!1);let Re=O==="run"||O==="free"||O==="tutorial",he=x.city.anchors,se=Re&&b.aim>=0&&b.mode!==_.SWING&&b.mode!==_.ZIP;se&&G.set(he[b.aim*4],he[b.aim*4+1],he[b.aim*4+2]);let Te=x.city.perches,vt=Re&&b.zipAim>=0&&b.mode!==_.ZIP;vt&&Q.set(Te[b.zipAim*4],Te[b.zipAim*4+1]+1.2,Te[b.zipAim*4+2]),b.mode===_.SWING?de.set(b.lx,b.ly,b.lz):b.mode===_.ZIP&&de.set(b.zx,b.zy,b.zz);let it=null;if(l.run&&!l.run.done&&(O==="run"||O==="title")){let Ye=x.runs[l.run.idx].rings;it={next:Ye[l.run.next],after:Ye[l.run.next+1]}}let ct=Math.hypot(b.vx,b.vy,b.vz);k.update({cue:Re&&!n?Yt(b):!1,cueStatic:Re&&n&&Yt(b),camera:A,dt:t,t:ve,pl:b,handPos:bt,aimPos:se?G:null,zipPos:vt?Q:null,rings:it,cranesHidden:O==="free"?l.cranes:!0,roofY:ka(x.city,v,Z,C),speed:ct,hx:v,hy:C,hz:Z,lineAnchor:b.mode===_.SWING||b.mode===_.ZIP?de:null}),I.update(ve,t),T.uniforms.uTime.value=ve,T.uniforms.uFrame.value=Math.floor(ve*12),T.uniforms.uSpeed.value=n?0:Math.max(0,Math.min(1,(ct-34)/26)),T.uniforms.uPanel.value=U>0?1:0,h.info.reset(),T.render(r,A),le-=t,le<=0&&(le=1/30,E(Tt(ct)))}let pe=new q;function Tt(t){let f=l.pl,B={phase:O,speed:t,dash:f.dash,mode:f.mode,chain:l.style.chain,score:l.style.score,cranes:l.craneCount,totalCranes:x.cranes.length,tut:fe.step,canZip:f.zipAim>=0,canSwing:f.aim>=0||f.mode===_.SWING,noLine:(O==="run"||O==="free"||O==="tutorial")&&f.mode===_.AIR&&f.aim<0&&f.zipAim<0};if(l.run){B.t=l.run.t,B.ring=l.run.next,B.rings=x.runs[l.run.idx].rings.length,B.run=l.run.idx,B.started=l.run.started;let b=x.runs[l.run.idx].rings[l.run.next];if(b&&!l.run.done){B.dist=Math.hypot(b.x-f.x,b.y-f.y,b.z-f.z),pe.set(b.x,b.y,b.z).project(A);let v=pe.z>1,C=pe.x,Z=pe.y;v&&(C=-C,Z=-Z),B.on=!v&&Math.abs(C)<.92&&Math.abs(Z)<.88,B.sx=C,B.sy=Z,B.rr=Lt/Math.max(1,B.dist*Math.tan(A.fov*Math.PI/360)),B.ang=Math.atan2(Z,C)}}return B}let Ve=0,De=0,Xe=!1;function pt(t){if(Ve=requestAnimationFrame(pt),m)return;let f=Math.min(.1,Math.max(0,(t-De)/1e3||0));if(De=t,te+=f,p+=(f*1e3-p)*.05,c.quality==="auto"&&(p>22?(j+=f,d=0):p<14?(d+=f,j=0):(j=Math.max(0,j-f),d=Math.max(0,d-f)),j>2&&$>.55&&($=Math.max(.55,$*.85),j=0,L()),d>6&&$<1&&($=Math.min(1,$*1.1),d=0,L())),je(f),!ze&&O!=="results")if(U>0)U-=f;else{ie+=f;let B=0;for(;ie>=_e&&B<12;)rt(),ie-=_e,B++;B===12&&(ie=0)}F.update(Math.hypot(l.pl.vx,l.pl.vy,l.pl.vz),l.pl.mode===_.SWING?Math.min(1,Math.hypot(l.pl.vx,l.pl.vy,l.pl.vz)/45):0,!ze&&O!=="title",f),be(f,Math.min(1,ie/_e))}function Pt(){Xe||(Xe=!0,De=performance.now(),Ve=requestAnimationFrame(pt))}function Pe(){Xe=!1,cancelAnimationFrame(Ve)}function Ae(){document.hidden?(O!=="title"&&O!=="results"&&!ze&&i({type:"escape",hidden:!0}),F.suspend()):F.resume()}document.addEventListener("visibilitychange",Ae),ke("title"),Pt();let Qe={sim:x,S:l,camera:A,renderer:h,scene:r,get phase(){return O},get paused(){return ze},begin:ke,restart:Ee,pause(t){ze=t,g.clear(),w.mouseL=!1,t&&document.pointerLockElement===e&&document.exitPointerLock?.()},setSettings(t){let f=M;c={...c,...t},F.setSound(c.sound),F.setMusic(c.music),M=$a(c.quality),(f!==M||t.quality)&&($=1,L())},get settings(){return c},audioStart:J,sfx:t=>F.sfx(t),touch:{stick(t,f){w.stickX=t,w.stickY=f},look(t,f){V(t,f,.005)},button(t,f){w.touch[t]=f,f&&(J(),t in y&&(y[t]=!0))}},tutorial:fe,setGhosts(t){o.ghosts=t},advance(t){let f=Math.round(t/_e);for(let B=0;B<f;B++){U>0?U-=_e:O!=="results"&&!ze&&rt(),te+=_e;let b=l.pl;mt(_e,b.x,b.y,b.z)}return ie=0,be(Math.max(_e,t),1,!0),Qe.state()},freeze(t){U=t,be(0,1)},bot(t){Ie=!!t,Object.assign(ge,Gt())},look:(t,f)=>{a.yaw=t,f!==void 0&&(a.pitch=f),w.lastLook=te},state(){let t=l.pl;return{phase:O,paused:ze,t:l.t,mode:["air","swing","wall","ground","zip"][t.mode],pos:[t.x,t.y,t.z],vel:[t.vx,t.vy,t.vz],speed:Math.hypot(t.vx,t.vy,t.vz),aim:t.aim,zipAim:t.zipAim,dash:t.dash,run:l.run?{idx:l.run.idx,t:l.run.t,next:l.run.next,done:l.run.done,rings:x.runs[l.run.idx].rings.length}:null,chain:l.style.chain,cranes:l.craneCount,tut:fe.step,quality:M,scale:$,fps:Math.round(1e3/p)}},stats(){return{calls:h.info.render.calls,tris:h.info.render.triangles,geometries:h.info.memory.geometries,textures:h.info.memory.textures,pixels:Math.round(T.rt.width*T.rt.height)}},dispose(){Pe(),H.disconnect(),document.removeEventListener("visibilitychange",Ae),window.removeEventListener("keydown",K),window.removeEventListener("keyup",K),e.removeEventListener("mousedown",P),window.removeEventListener("mouseup",N),window.removeEventListener("mousemove",oe),e.removeEventListener("contextmenu",ae),window.removeEventListener("blur",ne),e.removeEventListener("webglcontextlost",z),document.pointerLockElement===e&&document.exitPointerLock?.(),k.dispose(),R.dispose(),S.dispose(),I.dispose(),T.dispose(),D.geometry.dispose(),D.material.dispose(),F.dispose(),h.dispose(),h.forceContextLoss?.()}};return Qe}export{Wt as QUALITY,Zo as createIto,eo as isPhone,$a as resolveQuality,Ko as webglOk};
