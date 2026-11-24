import{$ as is,Ca as cs,D as ts,F as es,G as wt,I as Ct,J as At,L as X,N as ss,Oa as hs,R as He,S as kt,T as ce,U as Pt,V as xt,W as ze,Y as gt,Z as We,_ as os,aa as as,b as Ze,c as Qe,da as It,ea as ns,ga as Be,l as Je,la as he,ma as Ot,na as rs,v as Pe,va as ls}from"./chunk-75VSPVXA.js";import{a as Ys,b as Ye}from"./chunk-UUL7BFAR.js";import{b as De}from"./chunk-EK7ODJWE.js";var Z=De(Ys(),1);var Zs={plain:0,tiles:1,brick:2,wood:3,rooftile:4,metal:5,paving:6,grass:7,leaf:8,glass:9,neon:10,screen:11,cloth:12,gravel:13,asphalt:14,lantern:15,window:16,placeholder:17,water:18,stone:19,plaster:20,shoji:21,rail:22,panel:23,books:24},dt=[],E=(o,t,e,s,i={})=>{let a=dt.length;return dt.push({id:a,key:o,name:t,group:e,color:s,shape:i.shape||"cube",pass:i.pass||"opaque",pat:Zs[i.pat||"plain"],emit:i.emit||null,em:i.em||0,sound:i.sound||"stone",solid:i.solid!==void 0?i.solid:!0,hidden:!!i.hidden,base:i.base||null,jp:i.jp||""}),a};E("air","Air","none","#000000",{pass:"clear",solid:!1,hidden:!0});E("asphalt","Asphalt","Ground","#3a3c42",{pat:"asphalt"});E("paving","Paving","Ground","#8d8a86",{pat:"paving"});E("concrete","Concrete","Build","#9a9894",{pat:"plain"});E("stone","Stone","Ground","#7b7a74",{pat:"stone"});E("gravel","Gravel","Ground","#a49d90",{pat:"gravel",sound:"gravel"});E("grass","Moss grass","Nature","#56753b",{pat:"grass",sound:"grass"});E("soil","Soil","Ground","#4f3b2c",{pat:"gravel",sound:"grass"});E("plaster","White plaster","Build","#e6e0d2",{pat:"plaster"});E("cream","Cream render","Build","#d6c39a",{pat:"plaster"});E("tile","Facade tile","Build","#b9a58a",{pat:"tiles"});E("tileblue","Blue tile","Build","#5d7f95",{pat:"tiles"});E("brick","Brick","Build","#8e4a36",{pat:"brick"});E("darkwood","Dark wood","Build","#4a3326",{pat:"wood",sound:"wood"});E("wood","Cedar","Build","#a07850",{pat:"wood",sound:"wood"});E("rooftile","Roof tile","Build","#3b3f47",{pat:"rooftile"});E("copper","Copper roof","Build","#4f8f7a",{pat:"rooftile",sound:"metal"});E("metal","Corrugated","Build","#6d7a72",{pat:"metal",sound:"metal"});E("steel","Dark steel","Build","#2f3236",{pat:"panel",sound:"metal"});E("vermilion","Vermilion","Build","#c8381e",{pat:"wood",sound:"wood"});E("black","Black","Build","#1b1b1f",{pat:"plain"});E("shoji","Lit shoji","Light","#f0dfb8",{pat:"shoji",sound:"wood",emit:[9,7,4],em:.7});E("books","Bookshelf","Build","#7a4a32",{pat:"books",sound:"wood"});E("sakura","Sakura blossom","Nature","#f4b3cb",{pat:"leaf",pass:"leaf",sound:"grass",em:.05});E("leaves","Green leaves","Nature","#3f6a35",{pat:"leaf",pass:"leaf",sound:"grass"});E("bark","Bark","Nature","#4b3a33",{pat:"wood",sound:"wood"});E("water","Water","Nature","#1d4f63",{pat:"water",pass:"water",solid:!1,sound:"water"});E("glass","Glass","Light","#a8d8e6",{pat:"glass",pass:"glass",sound:"glass"});E("darkglass","Dark window","Light","#1d2a3a",{pat:"window"});E("window","Lit window","Light","#ffc985",{pat:"window",emit:[12,9,5],em:.85});E("shoplight","Shop light","Light","#ffe0b0",{pat:"panel",emit:[15,12,8],em:1});E("konbini","Light panel","Light","#f4fbff",{pat:"panel",emit:[13,14,15],em:1.1});E("screen","Screen","Light","#bfe6ff",{pat:"screen",emit:[9,12,15],em:1});E("lantern","Red lantern","Light","#ff4a2a",{pat:"lantern",shape:"lantern",pass:"clear",emit:[15,6,2],em:1,solid:!1});E("paperlamp","Paper lantern","Light","#ffe2b0",{pat:"lantern",shape:"lantern",pass:"clear",emit:[14,12,9],em:.9,solid:!1});E("neonpink","Neon pink","Neon","#ff1f9e",{pat:"neon",emit:[15,3,11],em:1});E("neoncyan","Neon cyan","Neon","#12e6ff",{pat:"neon",emit:[2,14,15],em:.9});E("neonred","Neon red","Neon","#ff1a1a",{pat:"neon",emit:[15,2,3],em:1.1});E("neonamber","Neon amber","Neon","#ffa514",{pat:"neon",emit:[15,11,2],em:.85});E("neongreen","Neon green","Neon","#7dff2a",{pat:"neon",emit:[6,15,4],em:.85});E("neonblue","Neon violet","Neon","#6a4dff",{pat:"neon",emit:[6,5,15],em:1.2});E("norenblue","Indigo noren","Build","#24345e",{pat:"cloth",sound:"cloth",solid:!1,pass:"clear",shape:"curtain"});E("norenred","Red noren","Build","#9e2a2a",{pat:"cloth",sound:"cloth",solid:!1,pass:"clear",shape:"curtain"});E("signboard","Sign board","Build","#16141c",{pat:"panel",sound:"metal"});E("vendred","Vending red","Build","#b8222c",{pat:"panel",sound:"metal"});E("vendwhite","Vending white","Build","#e4e6ea",{pat:"panel",sound:"metal"});E("kei","Truck white","Build","#e8ebe9",{pat:"panel",sound:"metal"});E("tank","Tank blue","Build","#7fa6b8",{pat:"panel",sound:"metal"});E("rail","Rail bed","Build","#4a4744",{pat:"rail",sound:"gravel"});E("pole","Concrete pole","Shapes","#8b8984",{shape:"post",pass:"clear",pat:"plain"});E("woodpost","Wood post","Shapes","#6b4c36",{shape:"post",pass:"clear",pat:"wood",sound:"wood"});E("slabstone","Stone slab","Shapes","#7b7a74",{shape:"slab",pass:"clear",pat:"stone"});E("slabwood","Wood slab","Shapes","#a07850",{shape:"slab",pass:"clear",pat:"wood",sound:"wood"});E("slabconc","Concrete slab","Shapes","#9a9894",{shape:"slab",pass:"clear",pat:"plain"});E("slabroof","Roof slab","Shapes","#3b3f47",{shape:"slab",pass:"clear",pat:"rooftile"});E("slabcopper","Copper slab","Shapes","#4f8f7a",{shape:"slab",pass:"clear",pat:"rooftile",sound:"metal"});for(let o of["N","E","S","W"])E("stairstone"+o,"Stone stairs","Shapes","#7b7a74",{shape:"stair"+o,pass:"clear",pat:"stone",hidden:o!=="N",base:"stairstone"});for(let o of["N","E","S","W"])E("stairwood"+o,"Wood stairs","Shapes","#a07850",{shape:"stair"+o,pass:"clear",pat:"wood",sound:"wood",hidden:o!=="N",base:"stairwood"});E("flowers","Flowers","Nature","#e86a8a",{shape:"cross",pass:"clear",pat:"leaf",solid:!1,sound:"grass"});E("fern","Fern","Nature","#4d7a3a",{shape:"cross",pass:"clear",pat:"leaf",solid:!1,sound:"grass"});E("placeholder","Unknown block","none","#ff00ff",{pat:"placeholder",hidden:!0});var q=dt,Qs=dt.length,M=Object.fromEntries(dt.map(o=>[o.key,o.id])),qt=o=>{let t=new Uint8Array(256);for(let e of dt)t[e.id]=o(e)?1:0;return t},mt=qt(o=>o.pass==="opaque"&&o.shape==="cube"),St=qt(o=>o.solid&&o.id!==0),ri=qt(o=>o.shape==="cube"),us=qt(o=>o.pass==="glass"||o.pass==="water"),ft=new Uint8Array(256),Js={cube:0,slab:1,stairN:2,stairE:3,stairS:4,stairW:5,post:6,lantern:7,cross:8,curtain:9};for(let o of dt)ft[o.id]=Js[o.shape];var Ht=new Uint8Array(256).fill(255);for(let o of dt)Ht[o.id]=o.pass==="opaque"?255:o.pass==="leaf"?1:o.pass==="water"?2:0;var Vt=qt(o=>o.pass==="clear"||o.pass==="glass"),Kt=new Uint16Array(256);for(let o of dt)o.emit&&(Kt[o.id]=o.emit[0]|o.emit[1]<<4|o.emit[2]<<8);var to={N:"E",E:"S",S:"W",W:"N"};function fs(o){let t=dt[o];if(!t||!t.base)return o;let e=t.key.slice(-1);return M[t.base+to[e]]}function jt(o,t){let e=dt[o];if(!e||!e.base)return o;let s=e.key.slice(-1),i=t==="x"?{E:"W",W:"E"}:{N:"S",S:"N"};return i[s]?M[e.base+i[s]]:o}function ps(o,t){return M[o+t]??M[o+"N"]}function ds(o){let t=parseInt(o.slice(1),16);return[t>>16&255,t>>8&255,t&255].map(e=>(e/=255,e<=.04045?e/12.92:((e+.055)/1.055)**2.4))}var ms=dt.filter(o=>!o.hidden).map(o=>o.id);var Q=16,it=class o{constructor(t=96,e=48,s=96){this.W=t,this.H=e,this.D=s,this.WD=t*s,this.N=t*e*s,this.blocks=new Uint8Array(this.N),this.light=new Uint16Array(this.N),this.cx=Math.ceil(t/Q),this.cy=Math.ceil(e/Q),this.cz=Math.ceil(s/Q),this.nChunks=this.cx*this.cy*this.cz,this.dirty=new Uint8Array(this.nChunks),this.version=0,this._q=new Int32Array(1<<20),this._ql=new Uint8Array(1<<20),this.lightOps=0}idx(t,e,s){return t+this.W*(s+this.D*e)}inside(t,e,s){return t>=0&&e>=0&&s>=0&&t<this.W&&e<this.H&&s<this.D}get(t,e,s){return this.inside(t,e,s)?this.blocks[t+this.W*(s+this.D*e)]:0}setRaw(t,e,s,i){this.inside(t,e,s)&&(this.blocks[t+this.W*(s+this.D*e)]=i)}fill(t,e,s,i,a,n,r){let l=Math.max(0,Math.min(t,i)),c=Math.min(this.W-1,Math.max(t,i)),u=Math.max(0,Math.min(e,a)),f=Math.min(this.H-1,Math.max(e,a)),p=Math.max(0,Math.min(s,n)),m=Math.min(this.D-1,Math.max(s,n));for(let v=u;v<=f;v++)for(let b=p;b<=m;b++){let x=this.W*(b+this.D*v);this.blocks.fill(r,x+l,x+c+1)}}clone(){let t=new o(this.W,this.H,this.D);return t.blocks.set(this.blocks),t.light.set(this.light),t}copyFrom(t){this.blocks.set(t.blocks),this.light.set(t.light),this.markAll()}markAll(){this.dirty.fill(1),this.version++}chunkIndex(t,e,s){return t+this.cx*(s+this.cz*e)}markVoxel(t,e,s){let i=Q,a=(t-1)/i|0,n=(t+1)/i|0,r=(e-1)/i|0,l=(e+1)/i|0,c=(s-1)/i|0,u=(s+1)/i|0;for(let f=Math.max(0,r);f<=Math.min(this.cy-1,l);f++)for(let p=Math.max(0,c);p<=Math.min(this.cz-1,u);p++)for(let m=Math.max(0,a);m<=Math.min(this.cx-1,n);m++)this.dirty[m+this.cx*(p+this.cz*f)]=1}topY(t,e){for(let s=this.H-1;s>=0;s--){let i=this.get(t,s,e);if(i&&i!==eo)return s}return-1}relight(){let{W:t,H:e,D:s,WD:i,blocks:a,light:n}=this;n.fill(0);let r=this._q,l=r.length-1,c=0,u=0;for(let f=0;f<s;f++)for(let p=0;p<t;p++){let m=p+t*(f+s*(e-1)),v=a[m];mt[v]||(n[m]=Vt[v]?15:Math.max(0,14-Ht[v]),r[u++&l]=m)}u=this._bfsAdd(0,c,u);for(let f=1;f<=3;f++){let p=f*4;c=0,u=0;for(let m=0;m<this.N;m++){let v=Kt[a[m]];if(v){let b=v>>p-4&15;b&&(n[m]=n[m]&~(15<<p)|b<<p,r[u++&l]=m)}}this._bfsAdd(f,c,u)}this.markAll()}_bfsAdd(t,e,s){let{W:i,H:a,D:n,WD:r,blocks:l,light:c}=this,u=this._q,f=u.length-1,p=t*4,m=t===0,v=0;for(;e!==s;){let b=u[e++&f],x=c[b]>>p&15;if(x<=1&&!(m&&x===15))continue;let y=b%i,k=(b/i|0)%n,g=b/r|0;for(let T=0;T<6;T++){let S;if(T===0){if(y===i-1)continue;S=b+1}else if(T===1){if(y===0)continue;S=b-1}else if(T===2){if(k===n-1)continue;S=b+i}else if(T===3){if(k===0)continue;S=b-i}else if(T===4){if(g===a-1)continue;S=b+r}else{if(g===0)continue;S=b-r}let R=l[S];if(mt[R])continue;let H=m&&T===5&&x===15&&Vt[R]?15:x-1-Ht[R];if(H<=0)continue;let A=c[S]>>p&15;H>A&&(c[S]=c[S]&~(15<<p)|H<<p,u[s++&f]=S,this._markIdx(S)),v++}}return this.lightOps+=v,s}_markIdx(t){if(!this._marking)return;let e=this.W,s=t%e,i=(t/e|0)%this.D,a=t/this.WD|0;this.markVoxel(s,a,i)}_bfsRemove(t,e,s){let{W:i,H:a,D:n,WD:r,blocks:l,light:c}=this,u=this._q,f=this._ql,p=u.length-1,m=t*4,v=t===0,b=0,x=0,y=c[e]>>m&15;if(c[e]&=~(15<<m),this._markIdx(e),y!==0)for(u[x&p]=e,f[x&p]=y,x++;b!==x;){let k=u[b&p],g=f[b&p];b++;let T=k%i,S=(k/i|0)%n,R=k/r|0;for(let H=0;H<6;H++){let A;if(H===0){if(T===i-1)continue;A=k+1}else if(H===1){if(T===0)continue;A=k-1}else if(H===2){if(S===n-1)continue;A=k+i}else if(H===3){if(S===0)continue;A=k-i}else if(H===4){if(R===a-1)continue;A=k+r}else{if(R===0)continue;A=k-r}let $=c[A]>>m&15;if($!==0)if($<g||v&&H===5&&g===15&&$===15)if(c[A]&=~(15<<m),this._markIdx(A),u[x&p]=A,f[x&p]=$,x++,v)A>=r*(a-1)&&s.push(A);else{let W=Kt[l[A]]>>m-4&15;W&&(c[A]|=W<<m,s.push(A))}else s.push(A)}}}set(t,e,s,i){if(!this.inside(t,e,s))return!1;let a=t+this.W*(s+this.D*e);if(this.blocks[a]===i)return!1;this._marking=!0;let r=[];for(let l=0;l<4;l++)this._bfsRemove(l,a,r[l]=[]);return this.blocks[a]=i,this.markVoxel(t,e,s),this._relightAround(a,t,e,s,r),this._marking=!1,this.version++,!0}_relightAround(t,e,s,i,a){let{W:n,H:r,D:l,WD:c,light:u,blocks:f}=this,p=this._q,m=p.length-1,v=f[t],b=[];e<n-1&&b.push(t+1),e>0&&b.push(t-1),i<l-1&&b.push(t+n),i>0&&b.push(t-n),s<r-1&&b.push(t+c),s>0&&b.push(t-c);for(let x=0;x<4;x++){let y=x*4,k=0;if(x===0){if(s===r-1&&!mt[v]){let g=Vt[v]?15:Math.max(0,14-Ht[v]);u[t]=u[t]&-16|g,p[k++&m]=t}}else{let g=Kt[v]>>y-4&15;g&&(u[t]=u[t]&~(15<<y)|g<<y,p[k++&m]=t)}for(let g of a[x]){if(x===0&&g>=c*(r-1)&&!(u[g]&15)){let T=f[g];mt[T]||(u[g]=u[g]&-16|(Vt[T]?15:Math.max(0,14-Ht[T])))}p[k++&m]=g}for(let g of b)p[k++&m]=g;this._bfsAdd(x,0,k)}}takeDirty(){let t=[];for(let e=0;e<this.nChunks;e++)this.dirty[e]&&t.push(e);return t}raycast(t,e,s,i,a,n,r=200,l=null){let c=Math.hypot(i,a,n)||1;i/=c,a/=c,n/=c;let u=Math.floor(t),f=Math.floor(e),p=Math.floor(s),m=i>0?1:-1,v=a>0?1:-1,b=n>0?1:-1,x=Math.abs(1/i),y=Math.abs(1/a),k=Math.abs(1/n),g=i===0?1/0:(i>0?u+1-t:t-u)*x,T=a===0?1/0:(a>0?f+1-e:e-f)*y,S=n===0?1/0:(n>0?p+1-s:s-p)*k,R=0,H=0,A=0,$=0;for(let W=0;W<1024&&$<=r;W++){if(this.inside(u,f,p)){let yt=this.blocks[u+this.W*(p+this.D*f)];if(yt&&(!l||l(yt)))return{x:u,y:f,z:p,nx:R,ny:H,nz:A,id:yt,dist:$}}else if(u<0&&m<0||f<0&&v<0||p<0&&b<0||u>=this.W&&m>0||f>=this.H&&v>0||p>=this.D&&b>0)break;g<T&&g<S?(u+=m,$=g,g+=x,R=-m,H=0,A=0):T<S?(f+=v,$=T,T+=y,R=0,H=-v,A=0):(p+=b,$=S,S+=k,R=0,H=0,A=-b)}if(a<0){let W=-e/a;if(W>0&&W<=r){let yt=Math.floor(t+i*W),w=Math.floor(s+n*W);if(yt>=0&&w>=0&&yt<this.W&&w<this.D)return{x:yt,y:-1,z:w,nx:0,ny:1,nz:0,id:0,dist:W,ground:!0}}}return null}sampleLight(t,e,s){return t=Math.floor(t),e=Math.floor(e),s=Math.floor(s),e>=this.H?15:this.inside(t,e,s)?this.light[t+this.W*(s+this.D*e)]:15*(e>=0?1:0)}},eo=M.water;var ue=[{n:[1,0,0],o:[1,0,0],u:[0,1,0],v:[0,0,1]},{n:[-1,0,0],o:[0,0,0],u:[0,0,1],v:[0,1,0]},{n:[0,1,0],o:[0,1,0],u:[0,0,1],v:[1,0,0]},{n:[0,-1,0],o:[0,0,0],u:[1,0,0],v:[0,0,1]},{n:[0,0,1],o:[0,0,1],u:[1,0,0],v:[0,1,0]},{n:[0,0,-1],o:[0,0,0],u:[0,1,0],v:[1,0,0]}],Fe=[[-1,-1],[1,-1],[1,1],[-1,1]],Ge=M.water,so=M.glass,oo=8,$t=9,fe=class{constructor(t){this.pos=new Float32Array(t*3),this.dat=new Uint8Array(t*4),this.lit=new Uint8Array(t*4),this.idx=new Uint32Array(t*1.5),this.nv=0,this.ni=0,this.max=t}reset(){this.nv=0,this.ni=0}grow(){let t=this.max*2,e=this,s=new Float32Array(t*3);s.set(e.pos);let i=new Uint8Array(t*4);i.set(e.dat);let a=new Uint8Array(t*4);a.set(e.lit);let n=new Uint32Array(t*1.5);n.set(e.idx),this.pos=s,this.dat=i,this.lit=a,this.idx=n,this.max=t}out(){return{pos:this.pos.slice(0,this.nv*3),dat:this.dat.slice(0,this.nv*4),lit:this.lit.slice(0,this.nv*4),idx:this.idx.slice(0,this.ni),nv:this.nv,ni:this.ni}}},rt=new fe(32768),Ue=new fe(8192);function vs(o,t){let e=t%o.cx,s=(t/o.cx|0)%o.cz,i=t/(o.cx*o.cz)|0;return bs(o,e*Q,i*Q,s*Q,Math.min(o.W,e*Q+Q),Math.min(o.H,i*Q+Q),Math.min(o.D,s*Q+Q))}function bs(o,t,e,s,i,a,n,r={}){let{W:l,H:c,D:u,blocks:f,light:p}=o,m=l*u,v=!!r.flat;rt.reset(),Ue.reset();let b=(w,C,O)=>w<0||O<0||w>=l||O>=u||C>=c?0:C<0?255:f[w+l*(O+u*C)],x=(w,C,O)=>v||C>=c||w<0||O<0||w>=l||O>=u?15:C<0?0:p[w+l*(O+u*C)],y=w=>w===255||mt[w]===1,k=new Int32Array(4),g=new Float32Array(16),T=(w,C,O,N,B,V,tt,F,lt,et,st)=>{w.nv+4>w.max&&w.grow();let G=ue[B],D=w.nv;for(let ot=0;ot<4;ot++){let[Lt,pt]=Fe[ot],ht=Lt>0?1:0,ut=pt>0?1:0,Tt=C+G.o[0]+G.u[0]*ht+G.v[0]*ut,vt=O+G.o[1]+G.u[1]*ht+G.v[1]*ut,bt=N+G.o[2]+G.u[2]*ht+G.v[2]*ut;st!==1&&vt>O+.5&&(vt=O+st);let I=D+ot;w.pos[I*3]=Tt,w.pos[I*3+1]=vt,w.pos[I*3+2]=bt,w.dat[I*4]=V,w.dat[I*4+1]=B,w.dat[I*4+2]=tt[ot],w.dat[I*4+3]=lt,w.lit[I*4]=F[ot*4],w.lit[I*4+1]=F[ot*4+1],w.lit[I*4+2]=F[ot*4+2],w.lit[I*4+3]=F[ot*4+3]}let U=w.ni,K=tt[0]*16+F[0],j=tt[1]*16+F[4],L=tt[2]*16+F[8],ct=tt[3]*16+F[12];K+L<j+ct?(w.idx[U]=D+1,w.idx[U+1]=D+2,w.idx[U+2]=D+3,w.idx[U+3]=D+1,w.idx[U+4]=D+3,w.idx[U+5]=D):(w.idx[U]=D,w.idx[U+1]=D+1,w.idx[U+2]=D+2,w.idx[U+3]=D,w.idx[U+4]=D+2,w.idx[U+5]=D+3),w.nv+=4,w.ni+=6},S=new Uint8Array(16),R=new Uint8Array(4),H=(w,C,O,N,B,V,tt)=>{let F=ue[B],lt=C+F.n[0],et=O+F.n[1],st=N+F.n[2];for(let G=0;G<4;G++){let[D,U]=Fe[G],K=lt+F.u[0]*D,j=et+F.u[1]*D,L=st+F.u[2]*D,ct=lt+F.v[0]*U,ot=et+F.v[1]*U,Lt=st+F.v[2]*U,pt=K+F.v[0]*U,ht=j+F.v[1]*U,ut=L+F.v[2]*U,Tt=y(b(K,j,L))?1:0,vt=y(b(ct,ot,Lt))?1:0,bt=y(b(pt,ht,ut))?1:0;R[G]=Tt&&vt?0:3-(Tt+vt+bt);let I=1,z=x(lt,et,st),Dt=z&15,ae=z>>4&15,ne=z>>8&15,re=z>>12;Tt||(z=x(K,j,L),Dt+=z&15,ae+=z>>4&15,ne+=z>>8&15,re+=z>>12,I++),vt||(z=x(ct,ot,Lt),Dt+=z&15,ae+=z>>4&15,ne+=z>>8&15,re+=z>>12,I++),!bt&&!(Tt&&vt)&&(z=x(pt,ht,ut),Dt+=z&15,ae+=z>>4&15,ne+=z>>8&15,re+=z>>12,I++);let le=17/I;S[G*4]=Math.round(Dt*le),S[G*4+1]=Math.round(ae*le),S[G*4+2]=Math.round(ne*le),S[G*4+3]=Math.round(re*le)}T(w,C,O,N,B,V,R,S,0,0,tt)},A=new Uint8Array(16),$=new Uint8Array([3,3,3,3]),W=(w,C,O,N,B,V,tt,F,lt,et,st,G)=>{let D=x(C,O,N);for(let j=0;j<4;j++)A[j*4]=(D&15)*17,A[j*4+1]=(D>>4&15)*17,A[j*4+2]=(D>>8&15)*17,A[j*4+3]=(D>>12)*17;let U=[V,tt,F],K=[lt,et,st];for(let j=0;j<6;j++){let L=ue[j],ct=L.n[0]!==0?0:L.n[1]!==0?1:2,ot=L.n[ct]>0;if((ot?K[ct]===1:U[ct]===0)&&y(b(C+L.n[0],O+L.n[1],N+L.n[2])))continue;w.nv+4>w.max&&w.grow();let pt=w.nv;for(let ut=0;ut<4;ut++){let[Tt,vt]=Fe[ut],bt=[0,0,0];for(let z=0;z<3;z++)if(z===ct)bt[z]=ot?K[z]:U[z];else{let Dt=L.u[z]!==0?Tt>0:vt>0;bt[z]=Dt?K[z]:U[z]}let I=pt+ut;w.pos[I*3]=C+bt[0],w.pos[I*3+1]=O+bt[1],w.pos[I*3+2]=N+bt[2],w.dat[I*4]=B,w.dat[I*4+1]=j,w.dat[I*4+2]=3,w.dat[I*4+3]=G,w.lit.set(A.subarray(ut*4,ut*4+4),I*4)}let ht=w.ni;w.idx[ht]=pt,w.idx[ht+1]=pt+1,w.idx[ht+2]=pt+2,w.idx[ht+3]=pt,w.idx[ht+4]=pt+2,w.idx[ht+5]=pt+3,w.nv+=4,w.ni+=6}},yt=(w,C,O,N,B)=>{let V=x(C,O,N),tt=[[.15,.15,.85,.85],[.85,.15,.15,.85]];for(let[F,lt,et,st]of tt)for(let G=0;G<2;G++){w.nv+4>w.max&&w.grow();let D=w.nv,U=[[F,0,lt],[et,0,st],[et,.9,st],[F,.9,lt]];for(let j=0;j<4;j++){let L=D+j,ct=U[j];w.pos[L*3]=C+ct[0],w.pos[L*3+1]=O+ct[1],w.pos[L*3+2]=N+ct[2],w.dat[L*4]=B,w.dat[L*4+1]=2,w.dat[L*4+2]=3,w.dat[L*4+3]=1,w.lit[L*4]=(V&15)*17,w.lit[L*4+1]=(V>>4&15)*17,w.lit[L*4+2]=(V>>8&15)*17,w.lit[L*4+3]=(V>>12)*17}let K=w.ni;G===0?(w.idx[K]=D,w.idx[K+1]=D+1,w.idx[K+2]=D+2,w.idx[K+3]=D,w.idx[K+4]=D+2,w.idx[K+5]=D+3):(w.idx[K]=D,w.idx[K+1]=D+2,w.idx[K+2]=D+1,w.idx[K+3]=D,w.idx[K+4]=D+3,w.idx[K+5]=D+2),w.nv+=4,w.ni+=6}};for(let w=e;w<a;w++)for(let C=s;C<n;C++){let O=t+l*(C+u*w);for(let N=t;N<i;N++,O++){let B=f[O];if(B===0)continue;let V=ft[B];if(V===0){let tt=us[B]===1,F=tt?Ue:rt,lt=1;B===Ge&&b(N,w+1,C)!==Ge&&(lt=.82);for(let et=0;et<6;et++){let st=ue[et],G=b(N+st.n[0],w+st.n[1],C+st.n[2]);y(G)||tt&&G===B||B===Ge&&et!==2&&G===so||H(F,N,w,C,et,B,lt)}}else V===1?W(rt,N,w,C,B,0,0,0,1,.5,1,0):V>=2&&V<=5?(W(rt,N,w,C,B,0,0,0,1,.5,1,0),V===2?W(rt,N,w,C,B,0,.5,0,1,1,.5,0):V===3?W(rt,N,w,C,B,.5,.5,0,1,1,1,0):V===4?W(rt,N,w,C,B,0,.5,.5,1,1,1,0):W(rt,N,w,C,B,0,.5,0,.5,1,1,0)):V===6?W(rt,N,w,C,B,.34,0,.34,.66,1,.66,0):V===7?W(rt,N,w,C,B,.18,.08,.18,.82,.92,.82,0):V===oo?yt(rt,N,w,C,B):V===$t&&(!(mt[b(N-1,w,C)]||mt[b(N+1,w,C)]||ft[b(N-1,w,C)]===$t||ft[b(N+1,w,C)]===$t)&&(mt[b(N,w,C-1)]||mt[b(N,w,C+1)]||ft[b(N,w,C-1)]===$t||ft[b(N,w,C+1)]===$t)?W(rt,N,w,C,B,.46,.3,0,.54,1,1,2):W(rt,N,w,C,B,0,.3,.46,1,1,.54,2))}}return{opaque:rt.out(),trans:Ue.out()}}function Le(o,t=!0){return bs(o,0,0,0,o.W,o.H,o.D,{flat:t})}function Xt(o,t,e,s,i,a,n,r){let l=Math.max(Math.abs(s-t),Math.abs(i-e))*2+1;for(let c=0;c<=l;c++){let u=c/l,f=Math.round(t+(s-t)*u),p=Math.round(e+(i-e)*u);for(let m=a;m<=n;m++)o.setRaw(m,f,p,r)}}function ws(){let o=new it(11,15,56);o.fill(1,0,6,9,1,12,M.black),o.fill(1,0,43,9,1,49,M.black),o.fill(1,2,0,9,2,55,M.steel),o.fill(0,3,0,10,12,55,M.vendwhite),o.fill(1,13,1,9,13,54,M.metal);for(let t of[8,30,48])o.fill(3,14,t,7,14,t+4,M.vendwhite);for(let t of[0,10]){o.fill(t,5,0,t,5,55,M.tileblue),o.fill(t,4,0,t,4,55,M.vermilion);for(let e=2;e<54;e++)if(e>=9&&e<=12||e>=26&&e<=29||e>=43&&e<=46){for(let i=3;i<=11;i++)o.setRaw(t,i,e,M.steel);for(let i=7;i<=9;i++)o.setRaw(t,i,e,M.konbini)}else if(e%6<4)for(let i=7;i<=10;i++)o.setRaw(t,i,e,M.konbini)}for(let t of[0,55])o.fill(2,7,t,8,10,t,M.darkglass),o.setRaw(2,5,t,M.konbini),o.setRaw(8,5,t,M.konbini),o.fill(3,11,t,7,11,t,M.neonamber);return{world:o,scale:.5}}function Ie(o=!1){let t=new it(5,9,11),e=M.plaster,s=M.wood,i=M.black,a=M.neonamber;if(o){t.fill(1,0,2,3,3,6,e),t.fill(1,1,2,3,3,3,s);for(let n of[1,3])for(let r=0;r<=2;r++)t.setRaw(n,r,7,e);t.fill(1,4,5,3,6,7,e),t.fill(1,6,5,2,6,6,s),t.setRaw(1,7,6,s),t.setRaw(3,7,6,i),t.setRaw(1,5,8,a),t.setRaw(3,5,8,a),t.setRaw(1,5,7,e),t.setRaw(3,5,7,e),t.setRaw(0,0,3,s),t.setRaw(0,0,4,s),t.setRaw(0,0,5,i),t.setRaw(0,0,6,i)}else{for(let[n,r]of[[1,2],[3,2],[1,7],[3,7]])t.setRaw(n,0,r,e),t.setRaw(n,1,r,e);t.fill(1,2,1,3,3,8,e),t.fill(1,3,2,3,3,4,s),t.fill(1,2,6,2,3,7,i),t.fill(1,3,8,3,5,10,e),t.fill(1,5,8,2,5,9,s),t.setRaw(3,5,9,i),t.setRaw(1,6,9,s),t.setRaw(3,6,9,i),t.setRaw(1,4,10,a),t.setRaw(3,4,10,a),t.setRaw(2,3,0,s),t.setRaw(2,4,0,s),t.setRaw(2,5,0,i),t.setRaw(2,6,1,i)}return{world:t,scale:.125}}function xs(o=M.tileblue){let t=new it(3,18,28),e=(s,i)=>{for(let a=0;a<18;a++)for(let n=0;n<28;n++){let r=Math.hypot(a-s,n-i);Math.abs(r-5)<.75&&t.setRaw(1,a,n,M.black)}t.setRaw(1,s,i,M.steel)};e(6,6),e(6,21),Xt(t,6,6,12,10,1,1,o),Xt(t,13,9,6,11,1,1,o),Xt(t,7,11,13,18,1,1,o),Xt(t,6,21,15,18,1,1,M.steel),Xt(t,6,6,8,11,1,1,o),t.fill(0,14,8,2,14,10,M.black),t.fill(0,16,17,2,16,18,M.steel);for(let s=12;s<=14;s++)for(let i=20;i<=24;i++)for(let a=0;a<=2;a++)(s===12||i===20||i===24||a!==1)&&t.setRaw(a,s,i,M.steel);return t.fill(0,12,3,2,12,7,M.steel),{world:t,scale:.125}}var Yt=`
float hash3(vec3 p){ p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419)); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float hash2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash2(i), hash2(i + vec2(1.0, 0.0)), f.x), mix(hash2(i + vec2(0.0, 1.0)), hash2(i + vec2(1.0, 1.0)), f.x), f.y); }
vec3 aces(vec3 x){ return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
`,Zt=`
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
`,pe=`
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
${Yt}
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
`,ys=`
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
${Yt}
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
`,ks=`
varying vec3 vDir;
void main(){ vDir = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }
`,gs=`
uniform vec3 uZenith; uniform vec3 uHorizon; uniform vec3 uGlow; uniform vec3 uSunDir; uniform vec3 uMoonDir; uniform vec3 uSunCol;
uniform float uStars; uniform float uNight; uniform float uExposure; uniform float uTime; uniform vec3 uFogCol; uniform float uSunVis;
varying vec3 vDir;
${Yt}
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
`,Ms=`
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`,Ts=`
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
`,Ss=`
uniform sampler2D tSrc; uniform vec2 uTexel;
varying vec2 vUv;
void main(){
  vec3 c = texture2D(tSrc, vUv).rgb * 4.0;
  c += texture2D(tSrc, vUv + uTexel * vec2(-1.0, -1.0)).rgb; c += texture2D(tSrc, vUv + uTexel * vec2(1.0, -1.0)).rgb;
  c += texture2D(tSrc, vUv + uTexel * vec2(-1.0, 1.0)).rgb; c += texture2D(tSrc, vUv + uTexel * vec2(1.0, 1.0)).rgb;
  gl_FragColor = vec4(c / 8.0, 1.0);
}
`,Es=`
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
`,_s=`
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
`;var Jt={low:{name:"Low",pixels:5e5,post:!1,petals:140,rain:700,bloom:0,msaa:0,fog:1.25},balanced:{name:"Balanced",pixels:85e4,post:!0,petals:320,rain:1400,bloom:.85,msaa:4,fog:1},high:{name:"High",pixels:13e5,post:!0,petals:600,rain:2200,bloom:1,msaa:4,fog:1}};function de(o){let t=new Pt;return t.setAttribute("position",new kt(o.pos,3)),t.setAttribute("aDat",new kt(o.dat,4)),t.setAttribute("aLit",new kt(o.lit,4,!0)),t.setIndex(new kt(o.idx,1)),t.computeBoundingSphere(),t}var Qt=class{constructor(){this.p=[],this.d=[],this.l=[],this.i=[]}quad(t,e,s,i=255){let a=this.p.length/3;for(let n of t)this.p.push(n[0],n[1],n[2]),this.d.push(e,s,3,0),this.l.push(i,0,0,0);this.i.push(a,a+1,a+2,a,a+2,a+3)}geom(){return this.i.length?de({pos:Float32Array.from(this.p),dat:Uint8Array.from(this.d),lit:Uint8Array.from(this.l),idx:Uint32Array.from(this.i)}):null}},me=class{constructor(t,{quality:e="balanced",reduced:s=!1}={}){this.canvas=t,this.gl=new ns({canvas:t,antialias:!0,powerPreference:"high-performance",alpha:!1,stencil:!1,preserveDrawingBuffer:!1}),this.gl.outputColorSpace=ts,this.gl.toneMapping=Je,this.gl.setClearColor(329228,1),this.scene=new Be,this.camera=new We(50,1,.08,2400),this.reduced=s,this.size=[1,1],this.lost=!1,this.stats={draws:0,tris:0,meshMs:0,chunks:0};let i=[],a=[];for(let n=0;n<96;n++){let r=q[n];if(r){let l=ds(r.color);i.push(new Ct(l[0],l[1],l[2],r.pat)),a.push(r.em||0)}else i.push(new Ct(1,0,1,17)),a.push(0)}this.U={uPal:{value:i},uEm:{value:a},uTime:{value:0},uNight:{value:1},uBlockGain:{value:1.5},uEmGain:{value:2.2},uWet:{value:0},uFogDensity:{value:.0035},uExposure:{value:1.1},uFlicker:{value:s?0:1},uSkyAmb:{value:new X},uSunDir:{value:new X(0,1,0)},uSunCol:{value:new X},uMoonDir:{value:new X(0,1,0)},uFogCol:{value:new X},uZenith:{value:new X},uHorizon:{value:new X},uTrainA:{value:new X(82.5,0,0)},uTrainB:{value:new X(82.5,0,1)},uTrainCol:{value:new X},uWorldC:{value:new wt(48,48)},uFade:{value:new wt(74,150)},tRefl:{value:null},uReflOn:{value:0},uScreen:{value:new wt(1,1)}},this.reflCam=new We,this.waterY=1.82,this.matOpaque=new gt({vertexShader:Zt,fragmentShader:pe,uniforms:this.U}),this.matTrans=new gt({vertexShader:Zt,fragmentShader:ys,uniforms:this.U,transparent:!0,depthWrite:!1}),this.entityMat=()=>new gt({vertexShader:Zt,fragmentShader:pe,defines:{ENTITY:1},uniforms:{...this.U,uEntLit:{value:new Ct(1,0,0,0)}}}),this.matGhost=new gt({vertexShader:Zt,fragmentShader:pe,defines:{ENTITY:1,GHOST:1},uniforms:{...this.U,uEntLit:{value:new Ct(1,.6,.6,.6)}},transparent:!0,depthWrite:!1}),this.worldGroup=new It,this.scene.add(this.worldGroup),this.chunks=[],this._buildSky(),this._buildOverlays(),this._buildParticles(),this.post=null,this.setQuality(e),this._onLost=n=>{n.preventDefault(),this.lost=!0},this._onRestored=()=>{this.lost=!1,this.rebuildAll(),this.setQuality(this.qualityName,!0)},t.addEventListener("webglcontextlost",this._onLost),t.addEventListener("webglcontextrestored",this._onRestored)}setWorld(t){this.world=t;for(let n of this.chunks)this._dropChunk(n);this.chunks=new Array(t.nChunks).fill(null).map(()=>({op:null,tr:null})),t.markAll(),this.U.uWorldC.value.set(t.W/2,t.D/2);let e=Math.hypot(t.W,t.D)/2;this.U.uFade.value.set(e+6,e+86),this._buildSkirt(),this._buildEntities(),this.wiresVersion=-1;let s=new Map;for(let n=0;n<t.N;n++)if(t.blocks[n]===M.water){let r=n/t.WD|0;t.blocks[n+t.WD]!==M.water&&s.set(r,(s.get(r)||0)+1)}let i=-1,a=0;for(let[n,r]of s)r>a&&(a=r,i=n);this.waterY=i>=0?i+.82:null}_dropChunk(t){if(t)for(let e of["op","tr"])t[e]&&(this.worldGroup.remove(t[e]),t[e].geometry.dispose(),t[e]=null)}remesh(t){let e=vs(this.world,t),s=this.chunks[t];for(let[i,a,n]of[["op",e.opaque,this.matOpaque],["tr",e.trans,this.matTrans]])if(s[i]&&(this.worldGroup.remove(s[i]),s[i].geometry.dispose(),s[i]=null),a.ni){let r=new xt(de(a),n);r.matrixAutoUpdate=!1,r.frustumCulled=!0,this.worldGroup.add(r),s[i]=r}this.world.dirty[t]=0}processDirty(t=4,e=null){let s=this.world;if(!s)return 0;let i=[];for(let r=0;r<s.nChunks;r++)s.dirty[r]&&i.push(r);if(!i.length)return 0;if(e){let r=l=>{let c=l%s.cx*Q+8,u=(l/s.cx|0)%s.cz*Q+8,f=(l/(s.cx*s.cz)|0)*Q+8;return(c-e[0])**2+(f-e[1])**2+(u-e[2])**2};i.sort((l,c)=>r(l)-r(c))}let a=performance.now(),n=0;for(let r of i)if(this.remesh(r),n++,performance.now()-a>t)break;return this.stats.meshMs=performance.now()-a,n===i.length&&(this.wiresDirty=!0),i.length-n}flush(){this.processDirty(1e9),this._buildWires()}rebuildAll(){this.world&&(this.world.markAll(),this._buildSkirt(),this._buildEntities())}_buildSkirt(){if(this.skirt)for(let b of this.skirt)this.scene.remove(b),b.geometry.dispose();this.skirt=[];let t=this.world,e=90,s=new Qt,i=new Qt,a=(b,x)=>{for(let y=Math.min(3,t.H-1);y>=0;y--){let k=t.get(b,y,x);if(k)return[y,k]}return[-1,M.asphalt]},n=(b,x,y)=>{let k=[];for(let g=0;g<b;g++)k.push(a(...x(g)));for(let g=0;g<b;g++){let[T,S]=k[g],R=S===M.water?T+.82:T+1;y(g,R,S,k[g+1]?k[g+1][1]===M.water?k[g+1][0]+.82:k[g+1][0]+1:null,k[g+1]?k[g+1][1]:null)}},r=b=>b===M.water?i:s;for(let b of[-1,1]){let x=b<0?0:t.W-1,y=b<0?-e:t.W,k=b<0?0:t.W+e;n(t.D,g=>[x,g],(g,T,S,R,H)=>{if(r(S).quad([[y,T,g],[y,T,g+1],[k,T,g+1],[k,T,g]],S,2),S===M.water&&s.quad([[y,T-.82,g],[y,T-.82,g+1],[k,T-.82,g+1],[k,T-.82,g]],M.soil,2),R!==null&&R!==T){let A=Math.min(T,R),$=Math.max(T,R),W=(R<T?S:H)===M.water?M.stone:M.stone;R<T?s.quad([[y,A-1,g+1],[y,$,g+1],[k,$,g+1],[k,A-1,g+1]].reverse(),W,4):s.quad([[y,A-1,g+1],[y,$,g+1],[k,$,g+1],[k,A-1,g+1]],W,5)}})}for(let b of[-1,1]){let x=b<0?0:t.D-1,y=b<0?-e:t.D,k=b<0?0:t.D+e;n(t.W,g=>[g,x],(g,T,S)=>{r(S).quad([[g,T,y],[g+1,T,y],[g+1,T,k],[g,T,k]].reverse(),S,2)})}for(let[b,x,y,k]of[[-e,0,-e,0],[t.W,t.W+e,-e,0],[-e,0,t.D,t.D+e],[t.W,t.W+e,t.D,t.D+e]])s.quad([[b,4,y],[b,4,k],[x,4,k],[x,4,y]],M.asphalt,2);let l=t.meta&&t.meta.train;if(l){let b=Math.max(0,Math.floor(l.x-6)),x=Math.min(t.W-1,Math.ceil(l.x+6));for(let y of[-1,1]){let k=y<0?0:t.D-1,g=y<0?-e*1.6:t.D,T=y<0?0:t.D+e*1.6;for(let S=b;S<=x;S++)for(let R=4;R<Math.min(t.H,24);R++){let H=t.get(S,R,k);H&&(t.get(S,R+1,k)||s.quad([[S,R+1,g],[S,R+1,T],[S+1,R+1,T],[S+1,R+1,g]],H,2),t.get(S-1,R,k)||s.quad([[S,R,g],[S,R,T],[S,R+1,T],[S,R+1,g]],H,1),t.get(S+1,R,k)||s.quad([[S+1,R,g],[S+1,R+1,g],[S+1,R+1,T],[S+1,R,T]],H,0),R>4&&!t.get(S,R-1,k)&&s.quad([[S,R,g],[S+1,R,g],[S+1,R,T],[S,R,T]],H,3))}}}let c=new Qt,u=1800,f=-e,p=t.W+e,m=-e,v=t.D+e;for(let[b,x,y,k]of[[-u,u,-u,m],[-u,u,v,u],[-u,f,m,v],[p,u,m,v]])c.quad([[b,3.9,y],[b,3.9,k],[x,3.9,k],[x,3.9,y]],M.asphalt,2);for(let[b,x]of[[s,this.matOpaque],[i,this.matTrans],[c,this.matOpaque]]){let y=b.geom();if(!y)continue;let k=new xt(y,x);b===c&&(k.position.y=-.2,k.renderOrder=-1),this.scene.add(k),this.skirt.push(k)}}_buildSky(){this.skyU={uZenith:this.U.uZenith,uHorizon:this.U.uHorizon,uGlow:{value:new X},uSunDir:{value:new X(0,1,0)},uMoonDir:this.U.uMoonDir,uSunCol:this.U.uSunCol,uStars:{value:1},uNight:this.U.uNight,uExposure:this.U.uExposure,uTime:this.U.uTime,uFogCol:this.U.uFogCol,uSunVis:{value:0}};let t=new xt(new cs(1e3,32,16),new gt({vertexShader:ks,fragmentShader:gs,uniforms:this.skyU,side:Ze,depthWrite:!1}));t.renderOrder=-10,t.frustumCulled=!1,this.sky=t,this.scene.add(t)}setEnv(t){let e=this.U;e.uZenith.value.set(...t.zenith),e.uHorizon.value.set(...t.horizon),e.uFogCol.value.set(...t.fog),e.uSkyAmb.value.set(...t.skyAmb),e.uSunCol.value.set(...t.dirCol),e.uSunDir.value.set(...t.lightDir),e.uMoonDir.value.set(...t.moonDir),e.uBlockGain.value=t.blockGain,e.uEmGain.value=t.emGain,e.uNight.value=t.night,e.uExposure.value=t.exposure,this.skyU.uGlow.value.set(...t.glow),this.skyU.uSunDir.value.set(...t.sunDir),this.skyU.uStars.value=t.stars,this.skyU.uSunVis.value=t.sunVis,this.env=t}_buildEntities(){if(this.ents)for(let i of this.ents)this.scene.remove(i),i.traverse(a=>{a.isMesh&&(a.geometry.dispose(),a.material.dispose())});this.ents=[];let t=(i,a)=>{let n=Le(i.world,!0),r=de(n.opaque),l=new xt(r,a);return l.scale.setScalar(i.scale),l},e=this.world.meta||{};if(this.train=null,e.train){let i=ws(),a=this.entityMat(),n=new It,r=t(i,a),l=i.world.D*i.scale;for(let c=0;c<3;c++){let u=c?new xt(r.geometry,a):r;u.scale.setScalar(i.scale),u.position.set(-i.world.W*i.scale/2,0,-c*(l+.6)-l),n.add(u)}n.visible=!1,this.scene.add(n),this.ents.push(n),this.train={grp:n,mat:a,len:3*(l+.6)}}if(this.cat=null,e.cat){let i=this.entityMat(),a=new It,n=Ie(!1),r=Ie(!0),l=t(n,i),c=t(r,i);for(let[u,f]of[[l,n],[c,r]])u.position.set(-f.world.W*f.scale/2,0,-f.world.D*f.scale/2),a.add(u);c.visible=!1,this.scene.add(a),this.ents.push(a),this.cat={grp:a,stand:l,sit:c,mat:i}}this.bikes=[];let s=[M.tileblue,M.vermilion,M.cream];(e.props||[]).forEach((i,a)=>{if(i.t!=="bike")return;let n=xs(s[a%3]),r=this.entityMat(),l=new It,c=t(n,r);c.position.set(-n.world.W*n.scale/2,0,-n.world.D*n.scale/2),l.add(c),l.position.set(i.x,i.y,i.z),l.rotation.y=i.r+Math.PI/2,this.scene.add(l),this.ents.push(l),this.bikes.push({grp:l,mat:r,p:i})}),this._refreshEntityLight()}litAt(t,e,s){let i=this.world.sampleLight(t,e,s);return[(i&15)/15,(i>>4&15)/15,(i>>8&15)/15,(i>>12)/15]}_refreshEntityLight(){for(let t of this.bikes){let{x:e,y:s,z:i}=t.p,a=this.world.get(Math.floor(e),Math.floor(s)-1,Math.floor(i))!==0&&this.world.get(Math.floor(e),Math.floor(s),Math.floor(i))===0;t.grp.visible=a,t.mat.uniforms.uEntLit.value.set(...this.litAt(e,s+.5,i))}}setTrain(t){let e=this.train;if(!e)return;if(e.grp.visible=!!t.on,!t.on){this.U.uTrainCol.value.set(0,0,0);return}e.grp.position.set(t.x,t.y,t.z),e.grp.rotation.y=t.dir>0?0:Math.PI;let s=t.z-t.dir*e.len;this.U.uTrainA.value.set(t.x,t.y+4,Math.min(t.z,s)),this.U.uTrainB.value.set(t.x,t.y+4,Math.max(t.z,s));let i=this.env?this.env.night:1;this.U.uTrainCol.value.set(1,.9,.72).multiplyScalar(.35+.9*i),e.mat.uniforms.uEntLit.value.set(...this.litAt(t.x,t.y+3,Math.max(1,Math.min(this.world.D-2,t.z))))}setCat(t){let e=this.cat;e&&(e.grp.position.set(t.x,t.y+(t.bob||0),t.z),e.grp.rotation.y=t.yaw,e.stand.visible=!t.sit,e.sit.visible=!!t.sit,e.mat.uniforms.uEntLit.value.set(...this.litAt(t.x,t.y+.5,t.z)))}_buildWires(){this.wires&&(this.scene.remove(this.wires),this.wires.geometry.dispose()),this.wires=null;let t=this.world.meta;if(!t||!t.wires||!t.wires.length)return;let e=(a,n,r)=>{for(let l=-1;l<=1;l++)for(let c=-1;c<=1;c++)for(let u=-1;u<=1;u++)if(this.world.get(Math.floor(a)+u,Math.floor(n)+l,Math.floor(r)+c))return!0;return!1},s=[];for(let[a,n,r,l,c,u,f]of t.wires){if(!e(a,n,r)||!e(l,c,u))continue;let p=14;for(let m=0;m<p;m++)for(let v of[m/p,(m+1)/p])s.push(a+(l-a)*v,n+(c-n)*v-f*4*v*(1-v),r+(u-r)*v)}let i=new Pt;i.setAttribute("position",new ce(s,3)),this.wires=new Ot(i,this.wireMat||(this.wireMat=new he({color:460554,transparent:!0,opacity:.9}))),this.scene.add(this.wires),this.wiresDirty=!1}_buildOverlays(){let t=new ls(new ze(1,1,1));this.hover=new Ot(t,new he({color:16777215,transparent:!0,opacity:.9,depthTest:!0})),this.hover.visible=!1,this.hover.renderOrder=5,this.scene.add(this.hover),this.face=new xt(new is(1,1),new He({color:16576010,transparent:!0,opacity:.22,depthWrite:!1,side:Qe})),this.face.visible=!1,this.face.renderOrder=6,this.scene.add(this.face),this.ghostBox=new xt(new ze(1,1,1),new He({color:61695,transparent:!0,opacity:.16,depthWrite:!1})),this.ghostEdges=new Ot(t,new he({color:61695})),this.ghostBox.visible=this.ghostEdges.visible=!1,this.scene.add(this.ghostBox),this.scene.add(this.ghostEdges),this.ghostStamp=null}setHover(t,e){if(!t){this.hover.visible=this.face.visible=!1;return}this.hover.visible=!0,this.face.visible=!0;let s=1.012;this.hover.position.set(t.x+.5,t.y+.5,t.z+.5),this.hover.scale.setScalar(s);let i=e==="remove"?16731501:e==="paint"?16722902:e==="pick"?61695:16576010;this.face.material.color.setHex(i),this.face.material.opacity=this.subtle?.07:.2,this.hover.material.opacity=this.subtle?.55:.9,this.hover.material.color.setHex(e==="remove"?16731501:16777215),this.face.position.set(t.x+.5+t.nx*.508,t.y+.5+t.ny*.508,t.z+.5+t.nz*.508),this.face.rotation.set(t.ny?-Math.PI/2*t.ny:0,t.nx?Math.PI/2*t.nx:t.nz<0?Math.PI:0,0)}setGhost(t,e){if(!t){this.ghostBox.visible=this.ghostEdges.visible=!1;return}let[s,i,a,n,r,l]=t,c=n-s+1,u=r-i+1,f=l-a+1;for(let m of[this.ghostBox,this.ghostEdges])m.visible=!0,m.position.set(s+c/2,i+u/2,a+f/2),m.scale.set(c+.03,u+.03,f+.03);let p=e==="clear"?16731501:e==="select"?16576010:61695;this.ghostBox.material.color.setHex(p),this.ghostEdges.material.color.setHex(p)}setStampGhost(t,e){if(this.ghostStampSrc!==t&&(this.ghostStamp&&(this.scene.remove(this.ghostStamp),this.ghostStamp.geometry.dispose(),this.ghostStamp=null),this.ghostStampSrc=t,t)){let s={W:t.w,H:t.h,D:t.d,blocks:t.data,light:new Uint16Array(t.data.length),get(a,n,r){return a<0||n<0||r<0||a>=this.W||n>=this.H||r>=this.D?0:this.blocks[a+this.W*(r+this.D*n)]}},i=Le(s,!0);i.opaque.ni&&(this.ghostStamp=new xt(de(i.opaque),this.matGhost),this.ghostStamp.renderOrder=7,this.scene.add(this.ghostStamp))}this.ghostStamp&&(this.ghostStamp.visible=!!e,e&&this.ghostStamp.position.set(e[0],e[1],e[2]))}_buildParticles(){this.petalPos=new Float32Array(600*3);let e=new Pt;e.setAttribute("position",new kt(this.petalPos,3).setUsage(es));let s=new Float32Array(600);for(let l=0;l<600;l++)s[l]=Math.random();e.setAttribute("aSeed",new kt(s,1)),e.setDrawRange(0,0),this.petals=new rs(e,new gt({uniforms:{uTime:this.U.uTime,uScale:{value:400},uSkyAmb:this.U.uSkyAmb,uFogCol:this.U.uFogCol,uFogDensity:this.U.uFogDensity,uExposure:this.U.uExposure,uNight:this.U.uNight},vertexShader:`attribute float aSeed; uniform float uTime; uniform float uScale; varying float vSeed; varying float vDist;
        void main(){ vSeed = aSeed; vec4 mv = modelViewMatrix * vec4(position, 1.0); vDist = -mv.z; gl_PointSize = clamp(uScale * 0.14 / max(vDist, 0.5), 1.5, 14.0); gl_Position = projectionMatrix * mv; }`,fragmentShader:`uniform float uTime; uniform vec3 uSkyAmb; uniform vec3 uFogCol; uniform float uFogDensity; uniform float uExposure; uniform float uNight; varying float vSeed; varying float vDist;
        ${Yt}
        void main(){ vec2 p = gl_PointCoord - 0.5; float a = uTime * (1.0 + vSeed * 2.0) + vSeed * 20.0; float c = cos(a), s = sin(a);
          p = mat2(c, -s, s, c) * p; p.y *= 1.0 / (0.35 + 0.65 * abs(sin(a * 0.7)));
          if (dot(p * vec2(1.0, 1.6), p) > 0.2) discard;
          vec3 col = vec3(1.0, 0.62, 0.75) * (uSkyAmb * 2.2 + vec3(0.35, 0.22, 0.25) * uNight);
          float fd = vDist * uFogDensity; col = mix(col, uFogCol, 1.0 - exp(-fd * fd));
          gl_FragColor = vec4(pow(aces(col * uExposure), vec3(1.0 / 2.2)), 1.0); }`})),this.petals.frustumCulled=!1,this.scene.add(this.petals);let i=2200,a=new Float32Array(i*2*3),n=new Float32Array(i*2);for(let l=0;l<i;l++){let c=Math.random()*80,u=Math.random()*50,f=Math.random()*80;for(let p=0;p<2;p++)a.set([c,u,f],(l*2+p)*3),n[l*2+p]=p}let r=new Pt;r.setAttribute("position",new kt(a,3)),r.setAttribute("aEnd",new kt(n,1)),this.rain=new Ot(r,new gt({uniforms:{uTime:this.U.uTime,uCam:{value:new X},uFogCol:this.U.uFogCol,uSkyAmb:this.U.uSkyAmb},vertexShader:`attribute float aEnd; uniform float uTime; uniform vec3 uCam; varying float vA;
        void main(){ vec3 box = vec3(80.0, 50.0, 80.0); vec3 p = position; p.y -= uTime * 46.0; p.x -= uTime * 4.0;
          p = mod(p - uCam + box * 0.5, box) - box * 0.5 + uCam; p.y += aEnd * 1.6; p.x += aEnd * 0.14; vA = 1.0 - aEnd * 0.7;
          gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0); }`,fragmentShader:"uniform vec3 uFogCol; uniform vec3 uSkyAmb; varying float vA; void main(){ gl_FragColor = vec4(mix(vec3(0.55, 0.6, 0.72), uFogCol, 0.3) + uSkyAmb, 0.32 * vA); }",transparent:!0,depthWrite:!1})),this.rain.frustumCulled=!1,this.rain.visible=!1,this.scene.add(this.rain)}setPetals(t,e){this.petalPos.set(t.subarray(0,e*3));let s=this.petals.geometry;s.attributes.position.needsUpdate=!0,s.setDrawRange(0,e)}setRain(t,e=1){this.rain.visible=t,this.rain.geometry.setDrawRange(0,Math.floor(this.Q.rain*e)*2)}setQuality(t,e=!1){Jt[t]||(t="balanced"),!(t===this.qualityName&&!e)&&(this.qualityName=t,this.Q=Jt[t],this._disposePost(),this.Q.post&&this._makePost(),this.resize(this.size[0],this.size[1],!0))}resize(t,e,s=!1){if(t=Math.max(1,Math.floor(t)),e=Math.max(1,Math.floor(e)),!s&&t===this.size[0]&&e===this.size[1]&&this._pr)return;this.size=[t,e];let i=typeof window<"u"?Math.min(2,window.devicePixelRatio||1):1,a=Math.min(i,Math.sqrt(this.Q.pixels*(this.pixelScale||1)/(t*e)));this._pr=a,this.gl.setPixelRatio(a),this.gl.setSize(t,e,!1),this.camera.aspect=t/e,this.camera.updateProjectionMatrix(),this.petals.material.uniforms.uScale.value=e*a,this.post&&this._sizePost(Math.floor(t*a),Math.floor(e*a))}_makePost(){let t=new Pt;t.setAttribute("position",new ce([-1,-1,0,3,-1,0,-1,3,0],3)),t.setAttribute("uv",new ce([0,0,2,0,0,2],2));let e=(i,a)=>new gt({vertexShader:Ms,fragmentShader:i,uniforms:a,depthTest:!1,depthWrite:!1}),s={cam:new as(-1,1,1,-1,0,1),quad:new xt(t),scene:new Be,bright:e(Ts,{tSrc:{value:null},uTexel:{value:new wt},uThreshold:{value:.72}}),down:e(Ss,{tSrc:{value:null},uTexel:{value:new wt}}),up:e(Es,{tSrc:{value:null},tAdd:{value:null},uTexel:{value:new wt}}),comp:e(_s,{tScene:{value:null},tBloom:{value:null},tBlur:{value:null},uBloom:{value:.8},uTilt:{value:0},uFocus:{value:.5},uVignette:{value:.35},uTexel:{value:new wt}}),rts:[]};s.quad.frustumCulled=!1,s.scene.add(s.quad),this.post=s}_sizePost(t,e){let s=this.post;for(let a of s.rts)a.dispose();let i={minFilter:Pe,magFilter:Pe,depthBuffer:!1,generateMipmaps:!1};s.scene_rt=new At(t,e,{...i,depthBuffer:!0,samples:this.Q.msaa}),s.half=new At(Math.max(1,t>>1),Math.max(1,e>>1),i),s.blur=new At(Math.max(1,t>>1),Math.max(1,e>>1),i),s.d=[2,3,4,5].map(a=>new At(Math.max(1,t>>a),Math.max(1,e>>a),i)),s.u=[2,3,4].map(a=>new At(Math.max(1,t>>a),Math.max(1,e>>a),i)),s.refl=new At(Math.max(1,t>>1),Math.max(1,e>>1),{...i,depthBuffer:!0}),s.rts=[s.scene_rt,s.half,s.blur,s.refl,...s.d,...s.u],s.w=t,s.h=e}_disposePost(){if(this.post){for(let t of this.post.rts)t.dispose();for(let t of["bright","down","up","comp"])this.post[t].dispose();this.post.quad.geometry.dispose(),this.post=null}}_pass(t,e){let s=this.post;s.quad.material=t,this.gl.setRenderTarget(e),this.gl.render(s.scene,s.cam)}_renderReflection(t){let e=this.post,s=this.waterY;if(this.U.uReflOn.value=0,!e||!e.refl||s===null||t.position.y<s+.05)return;let i=new X(0,1,0),a=new X(t.position.x,s,t.position.z),n=new ss().extractRotation(t.matrixWorld),r=a.clone().sub(t.position).reflect(i).negate().add(a),l=new X(0,0,-1).applyMatrix4(n).add(t.position),c=a.clone().sub(l).reflect(i).negate().add(a),u=this.reflCam;u.position.copy(r),u.up.set(0,1,0).applyMatrix4(n).reflect(i),u.lookAt(c),u.near=t.near,u.far=t.far,u.fov=t.fov,u.aspect=t.aspect,u.updateMatrixWorld(),u.projectionMatrix.copy(t.projectionMatrix);let f=new os().setFromNormalAndCoplanarPoint(i,a);f.applyMatrix4(u.matrixWorldInverse);let p=new Ct(f.normal.x,f.normal.y,f.normal.z,f.constant),m=u.projectionMatrix.elements,v=new Ct((Math.sign(p.x)+m[8])/m[0],(Math.sign(p.y)+m[9])/m[5],-1,(1+m[10])/m[14]);p.multiplyScalar(2/p.dot(v)),m[2]=p.x,m[6]=p.y,m[10]=p.z+1-.003,m[14]=p.w,u.projectionMatrixInverse.copy(u.projectionMatrix).invert();let b=[];for(let x of this.chunks)x&&x.tr&&x.tr.visible&&(x.tr.visible=!1,b.push(x.tr));for(let x of[this.hover,this.face,this.ghostBox,this.ghostEdges,this.rain,this.ghostStamp,...(this.skirt||[]).filter(y=>y.material===this.matTrans)])x&&x.visible&&(x.visible=!1,b.push(x));this.sky.position.copy(u.position),this.gl.setRenderTarget(e.refl),this.gl.render(this.scene,u);for(let x of b)x.visible=!0;this.sky.position.copy(t.position),this.U.tRefl.value=e.refl.texture,this.U.uReflOn.value=1}render(t={}){if(this.lost||!this.world)return;let e=this.camera;this.gl.info.autoReset=!1,this.gl.info.reset(),this.sky.position.copy(e.position),this.rain.material.uniforms.uCam.value.copy(e.position),this.U.uFogDensity.value=(t.fog??.0032)*this.Q.fog;let s=this.gl;if(!this.post)this.U.uReflOn.value=0,s.setRenderTarget(null),s.render(this.scene,e);else{let a=this.post;e.updateMatrixWorld(),this._renderReflection(e),this.U.uScreen.value.set(a.w,a.h),s.setRenderTarget(a.scene_rt),s.render(this.scene,e);let n=f=>a.bright.uniforms.uTexel.value.set(1/f.width,1/f.height);a.bright.uniforms.tSrc.value=a.scene_rt.texture,n(a.scene_rt),this._pass(a.bright,a.half);let r=a.half;for(let f of a.d)a.down.uniforms.tSrc.value=r.texture,a.down.uniforms.uTexel.value.set(1/r.width,1/r.height),this._pass(a.down,f),r=f;let l=a.d[3];for(let f=2;f>=0;f--)a.up.uniforms.tSrc.value=l.texture,a.up.uniforms.tAdd.value=a.d[f].texture,a.up.uniforms.uTexel.value.set(1/l.width,1/l.height),this._pass(a.up,a.u[f]),l=a.u[f];let c=t.tilt||0;c>0&&(a.down.uniforms.tSrc.value=a.scene_rt.texture,a.down.uniforms.uTexel.value.set(1/a.w,1/a.h),this._pass(a.down,a.blur));let u=a.comp.uniforms;u.tScene.value=a.scene_rt.texture,u.tBloom.value=a.u[0].texture,u.tBlur.value=a.blur.texture,u.uBloom.value=this.Q.bloom*(t.bloom??.75),u.uTilt.value=c,u.uFocus.value=t.focus??.5,u.uVignette.value=t.vignette??.3,u.uTexel.value.set(1/(a.w>>1),1/(a.h>>1)),this._pass(a.comp,null)}let i=s.info.render;this.stats.draws=i.calls,this.stats.tris=i.triangles}screenshot(t){return this.render(t),this.canvas.toDataURL("image/png")}dispose(){this.canvas.removeEventListener("webglcontextlost",this._onLost),this.canvas.removeEventListener("webglcontextrestored",this._onRestored);for(let t of this.chunks)this._dropChunk(t);if(this.skirt)for(let t of this.skirt)t.geometry.dispose();if(this.ents)for(let t of this.ents)t.traverse(e=>{e.isMesh&&(e.geometry.dispose(),e.material.dispose())});this.wires&&this.wires.geometry.dispose(),this.ghostStamp&&this.ghostStamp.geometry.dispose(),this.scene.traverse(t=>{t.geometry&&t.geometry.dispose(),t.material&&(Array.isArray(t.material)?t.material:[t.material]).forEach(e=>e.dispose())}),this.matOpaque.dispose(),this.matTrans.dispose(),this.matGhost.dispose(),this._disposePost(),this.gl.dispose();try{this.gl.forceContextLoss()}catch{}}};var ao=[[0,"#03050d","#141228","#3a1f3a","#0d0c1a",[.05,.06,.1],[.16,.19,.28],1.35,1.7,1,1,1.1],[4.6,"#05081a","#1b1a36","#3a2440","#11112a",[.06,.07,.12],[.14,.17,.26],1.3,1.65,1,.9,1.1],[5.6,"#273a6e","#d08a7a","#4a2a3a","#4a4a6a",[.25,.26,.34],[.9,.55,.4],1,1.5,.45,.2,1.05],[7,"#4a7fc8","#cfd8e6","#000000","#a9b7cc",[.5,.55,.65],[1.25,1.12,.95],.4,1,0,0,1],[12,"#3d78cc","#c6d8ec","#000000","#b3c4d8",[.55,.6,.7],[1.4,1.3,1.15],.35,1,0,0,.95],[16.5,"#4a72b8","#e6cfae","#000000","#c0b6a8",[.5,.5,.55],[1.35,1.05,.75],.45,1,.05,0,1],[17.8,"#3d4f8c","#f09a62","#5a2a20","#8a6a6a",[.36,.32,.36],[1.2,.62,.35],.8,1.3,.3,0,1.05],[18.6,"#1d2a5e","#8a6a9a","#7a3a4a","#3c3c62",[.16,.17,.27],[.35,.3,.45],1.05,1.45,.7,.3,1.08],[19.4,"#0c1438","#3a3260","#5a2a48","#1f1e3e",[.09,.1,.17],[.2,.22,.34],1.25,1.6,.9,.7,1.1],[20.5,"#050819","#1a1832","#46243e","#121128",[.06,.07,.11],[.16,.19,.28],1.35,1.7,1,1,1.1],[24,"#03050d","#141228","#3a1f3a","#0d0c1a",[.05,.06,.1],[.16,.19,.28],1.35,1.7,1,1,1.1]],ve=o=>{let t=parseInt(o.slice(1),16);return[(t>>16&255)/255,(t>>8&255)/255,(t&255)/255].map(e=>e<=.04045?e/12.92:((e+.055)/1.055)**2.4)},be=ao.map(o=>[o[0],ve(o[1]),ve(o[2]),ve(o[3]),ve(o[4]),o[5],o[6],o[7],o[8],o[9],o[10],o[11]]),Et=(o,t,e)=>o+(t-o)*e,zt=(o,t,e)=>[Et(o[0],t[0],e),Et(o[1],t[1],e),Et(o[2],t[2],e)];function Rs(o){o=(o%24+24)%24;let t=0;for(;t<be.length-2&&be[t+1][0]<=o;)t++;let e=be[t],s=be[t+1],i=(o-e[0])/(s[0]-e[0]);i=i*i*(3-2*i);let a={zenith:zt(e[1],s[1],i),horizon:zt(e[2],s[2],i),glow:zt(e[3],s[3],i),fog:zt(e[4],s[4],i),skyAmb:zt(e[5],s[5],i),dirCol:zt(e[6],s[6],i),blockGain:Et(e[7],s[7],i),emGain:Et(e[8],s[8],i),night:Et(e[9],s[9],i),stars:Et(e[10],s[10],i),exposure:Et(e[11],s[11],i)},n=(o-6)/12*Math.PI,r=[Math.cos(n),Math.sin(n),.45],l=Math.hypot(...r);a.sunDir=r.map(f=>f/l);let c=[-.45,.62,.64],u=Math.hypot(...c);return a.moonDir=c.map(f=>f/u),a.sunVis=Math.max(0,Math.min(1,a.sunDir[1]*6+.3)),a.lightDir=a.sunDir[1]>.05?a.sunDir:a.moonDir,a}var _=o=>o.trim().split(`
`).map(t=>t.trim()),Wt={\u30A2:_(`
#######
......#
...#.#.
...##..
...#...
..#....
.#.....`),\u30A4:_(`
......#
.....#.
....##.
..##.#.
##...#.
.....#.
.....#.`),\u30A6:_(`
...#...
#######
#.....#
......#
.....#.
....#..
..##...`),\u30A8:_(`
.......
.#####.
...#...
...#...
...#...
#######
.......`),\u30AA:_(`
....#..
#######
...##..
..#.#..
.#..#..
#...#..
..###..`),\u30AB:_(`
..#....
#######
..#...#
..#...#
.#....#
.#....#
#...##.`),\u30AD:_(`
...#...
.#####.
...#...
#######
...#...
...#...
...#...`),\u30AF:_(`
..#....
.######
#.....#
.....#.
....#..
...#...
.##....`),\u30B1:_(`
.#.....
.######
#...#..
....#..
....#..
...#...
.##....`),\u30B3:_(`
.......
######.
.....#.
.....#.
.....#.
######.
.......`),\u30B5:_(`
.#...#.
#######
.#...#.
.....#.
....#..
...#...
.##....`),\u30B7:_(`
##....#
......#
##...#.
....#..
...#...
.##....
#......`),\u30B9:_(`
######.
.....#.
....#..
...#...
..#.#..
.#...#.
#.....#`),\u30BB:_(`
.#.....
.#..###
.###..#
.#...#.
.#.....
.#.....
..####.`),\u30BD:_(`
#.....#
.#....#
.#...#.
....#..
...#...
..#....
##.....`),\u30BF:_(`
..#....
.######
.#....#
#.#..#.
...##..
...#...
.##....`),\u30C1:_(`
....##.
.###...
...#...
#######
...#...
...#...
..#....`),\u30C4:_(`
#..#..#
.#..#.#
......#
.....#.
....#..
...#...
.##....`),\u30C6:_(`
.#####.
.......
#######
...#...
...#...
..#....
.#.....`),\u30C8:_(`
.#.....
.#.....
.###...
.#..##.
.#.....
.#.....
.#.....`),\u30CA:_(`
...#...
#######
...#...
...#...
...#...
..#....
.#.....`),\u30CB:_(`
.......
.#####.
.......
.......
.......
#######
.......`),\u30CC:_(`
######.
.....#.
.#..#..
..##...
..##...
.#..#..
#......`),\u30CD:_(`
...#...
.####..
....#..
...#...
.#####.
#..#..#
...#...`),\u30CE:_(`
......#
.....#.
.....#.
....#..
...#...
..#....
##.....`),\u30CF:_(`
.......
..#.#..
..#..#.
.#...#.
.#....#
#.....#
.......`),\u30D2:_(`
#......
#...##.
###....
#......
#......
#......
.#####.`),\u30D5:_(`
#######
......#
......#
.....#.
....#..
...#...
.##....`),\u30D8:_(`
.......
..#....
.#.#...
#...#..
.....#.
......#
.......`),\u30DB:_(`
...#...
#######
...#...
.#.#.#.
#..#..#
...#...
..##...`),\u30DE:_(`
#######
......#
.....#.
.#.##..
..#....
...#...
....#..`),\u30DF:_(`
.###...
....##.
.###...
....##.
.###...
....##.
.......`),\u30E0:_(`
...#...
...#...
..#....
..#....
.#...#.
.#....#
#######`),\u30E1:_(`
......#
.....#.
.#..#..
..##...
..##...
.#..#..
#......`),\u30E2:_(`
.#####.
...#...
#######
...#...
...#...
...#...
....###`),\u30E4:_(`
..#....
..#####
###..#.
...##..
...#...
...#...
...#...`),\u30E6:_(`
.......
.####..
....#..
....#..
....#..
#######
.......`),\u30E8:_(`
######.
.....#.
.....#.
######.
.....#.
.....#.
######.`),\u30E9:_(`
.#####.
.......
#######
......#
.....#.
....#..
.##....`),\u30EA:_(`
#....#.
#....#.
#....#.
#....#.
.....#.
....#..
..##...`),\u30EB:_(`
.#..#..
.#..#..
.#..#..
.#..#..
.#..#.#
#...##.
#...#..`),\u30EC:_(`
.#.....
.#.....
.#.....
.#.....
.#...#.
.#..#..
.###...`),\u30ED:_(`
.......
#######
#.....#
#.....#
#.....#
#######
.......`),\u30EF:_(`
#######
#.....#
#.....#
.....#.
....#..
...#...
.##....`),\u30F2:_(`
#######
......#
.######
.....#.
....#..
...#...
.##....`),\u30F3:_(`
##.....
..#...#
......#
.....#.
....#..
...#...
###....`),\u30FC:_(`
.......
.......
.......
#######
.......
.......
.......`),"\uFF5C":_(`
...#...
...#...
...#...
...#...
...#...
...#...
...#...`),\u30C3:_(`
..#.#.#
..#.#.#
......#
.....#.
...##..
.......
.......`),\u3086:_(`
.....#...
.#...#...
.#..####.
#..#.#..#
#.#..#..#
##...#..#
#..#.#.#.
.#..###..
....#....`),\u672C:_(`
...#...
#######
..###..
.#.#.#.
#..#..#
..###..
...#...`),\u53E4:_(`
...#...
#######
...#...
.#####.
.#...#.
.#...#.
.#####.`),\u9152:_(`
#.#######
.#..#.#..
..#######
#.#.#.#.#
#.#.#.#.#
..#.###.#
..#######
.##.....#
#.#######`),\u6E6F:_(`
#...#####..
.#..#...#..
....#####..
#...#...#..
.#..#####..
...########
....#......
...########
.#.#..#.#.#
.#.#.#.#..#
#.#.#.#..##`)},no={A:".###.|#...#|#...#|#####|#...#|#...#|#...#",B:"####.|#...#|#...#|####.|#...#|#...#|####.",C:".###.|#...#|#....|#....|#....|#...#|.###.",D:"####.|#...#|#...#|#...#|#...#|#...#|####.",E:"#####|#....|#....|####.|#....|#....|#####",F:"#####|#....|#....|####.|#....|#....|#....",G:".###.|#...#|#....|#.###|#...#|#...#|.####",H:"#...#|#...#|#...#|#####|#...#|#...#|#...#",I:".###.|..#..|..#..|..#..|..#..|..#..|.###.",J:"..###|...#.|...#.|...#.|...#.|#..#.|.##..",K:"#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#",L:"#....|#....|#....|#....|#....|#....|#####",M:"#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#",N:"#...#|#...#|##..#|#.#.#|#..##|#...#|#...#",O:".###.|#...#|#...#|#...#|#...#|#...#|.###.",P:"####.|#...#|#...#|####.|#....|#....|#....",Q:".###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#",R:"####.|#...#|#...#|####.|#.#..|#..#.|#...#",S:".####|#....|#....|.###.|....#|....#|####.",T:"#####|..#..|..#..|..#..|..#..|..#..|..#..",U:"#...#|#...#|#...#|#...#|#...#|#...#|.###.",V:"#...#|#...#|#...#|#...#|#...#|.#.#.|..#..",W:"#...#|#...#|#...#|#.#.#|#.#.#|#.#.#|.#.#.",X:"#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#",Y:"#...#|#...#|.#.#.|..#..|..#..|..#..|..#..",Z:"#####|....#|...#.|..#..|.#...|#....|#####",0:".###.|#...#|#..##|#.#.#|##..#|#...#|.###.",1:"..#..|.##..|..#..|..#..|..#..|..#..|.###.",2:".###.|#...#|....#|...#.|..#..|.#...|#####",3:"#####|...#.|..#..|...#.|....#|#...#|.###.",4:"...#.|..##.|.#.#.|#..#.|#####|...#.|...#.",5:"#####|#....|####.|....#|....#|#...#|.###.",6:"..##.|.#...|#....|####.|#...#|#...#|.###.",7:"#####|....#|...#.|..#..|.#...|.#...|.#...",8:".###.|#...#|#...#|.###.|#...#|#...#|.###.",9:".###.|#...#|#...#|.####|....#|...#.|.##..","!":"..#..|..#..|..#..|..#..|..#..|.....|..#..","\u2665":".....|.#.#.|#####|#####|.###.|..#..|....."};for(let[o,t]of Object.entries(no))Wt[o]=t.split("|");var Cs="\u30A2\u30A4\u30A6\u30A8\u30AA\u30AB\u30AD\u30AF\u30B1\u30B3\u30B5\u30B7\u30B9\u30BB\u30BD\u30BF\u30C1\u30C4\u30C6\u30C8\u30CA\u30CB\u30CC\u30CD\u30CE\u30CF\u30D2\u30D5\u30D8\u30DB\u30DE\u30DF\u30E0\u30E1\u30E2\u30E4\u30E6\u30E8\u30E9\u30EA\u30EB\u30EC\u30ED\u30EF\u30F2\u30F3\u30FC".split(""),Ei="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");var P=96,xe=48,Y=96,h=4;function Ds(o){let t=o>>>0;return()=>{t=t+1831565813|0;let e=Math.imul(t^t>>>15,1|t);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}}var As=o=>typeof o=="string"?M[o]:o,Bt=class{constructor(t,e){this.w=t,this.r=Ds(e),this.meta={wires:[],props:[],train:null,cat:null,petals:[],landmarks:{},spawn:null}}rand(t,e){return t+Math.floor(this.r()*(e-t+1))}chance(t){return this.r()<t}pick(t){return t[Math.floor(this.r()*t.length)]}set(t,e,s,i){this.w.setRaw(t,e,s,As(i))}get(t,e,s){return this.w.get(t,e,s)}box(t,e,s,i,a,n,r){this.w.fill(t,e,s,i,a,n,As(r))}mark(t,e,s,i,a,n,r){this.meta.landmarks[t]=[e,s,i,a,n,r]}wire(t,e,s=1.2){this.meta.wires.push([...t,...e,s])}},at=class{constructor(t,e,s,i,a,n){Object.assign(this,{g:t,x0:e,x1:s,z0:i,z1:a,face:n}),this.w=s-e+1,this.dep=a-i+1}P(t,e){return this.face>0?[this.x0+t,this.z1-e]:[this.x1-t,this.z0+e]}set(t,e,s,i){let[a,n]=this.P(t,s);this.g.set(a,e,n,i)}get(t,e,s){let[i,a]=this.P(t,s);return this.g.get(i,e,a)}box(t,e,s,i,a,n,r){let[l,c]=this.P(t,s),[u,f]=this.P(i,n);this.g.box(l,e,c,u,a,f,r)}world(t,e,s){let[i,a]=this.P(t,s);return[i,e,a]}};function Ps(o,t,e,s,{vertical:i=!0,gap:a=1,colW:n=7}={}){let r=0,l=0;for(let c of t){let u=Wt[c];if(!u){i?l+=4:r+=4;continue}let f=u.length,p=u[0].length,m=i?Math.floor((n-p)/2):0;for(let v=0;v<f;v++)for(let b=0;b<p;b++)if(u[v][b]==="#"){let[x,y,k]=e(r+m+b,l+v);o.set(x,y,k,s)}i?l+=f+a:r+=p+a}return i?l-a:r-a}function Hs(o,t=!0,e=1){let s=0,i=0;for(let a of o){let n=Wt[a],r=n?n.length:3,l=n?n[0].length:3;t?(i+=r+e,s=Math.max(s,l)):(s+=l+e,i=Math.max(i,r))}return t?[s,i-e]:[s-e,i]}function _t(o,t,e,s,i,{back:a="signboard",border:n=null,d:r=-1,vertical:l=!0,pad:c=1}={}){let[u,f]=Hs(t,l),p=u+c*2,m=f+c*2;for(let v=0;v<m;v++)for(let b=0;b<p;b++){let x=v===0||b===0||v===m-1||b===p-1;o.set(e+b,s-v,r,x&&n?n:a)}return Ps(o.g,t,(v,b)=>o.world(e+c+v,s-c-b,r),i,{vertical:l,colW:u}),[p,m]}function ro(o,t,e,s,i,{back:a="signboard",border:n=null,vertical:r=!0}={}){let[l,c]=Hs(t,r),u=l+2,f=c+2;for(let p of[0,1]){for(let m=0;m<f;m++)for(let v=0;v<u;v++){let b=m===0||v===0||m===f-1||v===u-1;o.set(e+p,s-m,-1-v,b&&n?n:a)}Ps(o.g,t,(m,v)=>o.world(e+p,s-1-v,p?-u+1+m:-2-m),i,{vertical:r,colW:l})}return[u,f]}function se(o,t,e,s,i,a,n="rooftile",r="slabroof",l="x",c="darkwood"){let u=l==="x"?i-s:e-t,f=a;for(let p=0;p<=u;p++){let m=Math.min(p,u-p),v=m<2?m*.5+.5:1.5+(m-2),b=Math.floor(v),x=v-b>=.5;for(let y=l==="x"?t:s;y<=(l==="x"?e:i);y++){let k=l==="x"?y:t+p,g=l==="x"?s+p:y;for(let T=0;T<b;T++)o.set(k,a+T,g,n);x&&o.set(k,a+b,g,r),f=Math.max(f,a+b)}}if(c){let p=Math.floor(u/2),m=Math.ceil(u/2);for(let v=l==="x"?t:s;v<=(l==="x"?e:i);v++)for(let b of new Set([p,m])){let x=l==="x"?v:t+b,y=l==="x"?s+b:v,k=a;for(;o.get(x,k,y);)k++;o.set(x,k,y,c)}}return f}function ye(o,t,e,s=6,i=.4){let a=o.g,n=o.dep-1;for(let r=t;r+3<=e;r+=s)for(let l=1;l+1<o.w-1;l+=4){let c=a.chance(i),u=c?a.chance(.3)?"shoji":"window":"darkglass";for(let f=r+1;f<=r+3;f++)o.set(l,f,n,u),o.set(l+1,f,n,u);a.chance(.4)&&o.set(l+2,r+1,n+1,"vendwhite"),a.chance(.2)&&o.set(l,r,n+1,"slabconc")}if(o.w>4)for(let r=h;r<=e;r++)o.set(o.w-2,r,n+1,"pole")}function ke(o,t="asphalt"){o.box(0,0,0,P-1,1,Y-1,"soil"),o.box(0,2,0,P-1,2,Y-1,"concrete"),o.box(0,3,0,P-1,3,Y-1,t)}function Rt(o,{top:t,wall:e,band:s=null,groundH:i=7,floorH:a=6,litP:n=.55,winMat:r="window",sideWin:l=[!1,!1],ac:c=.3,from:u=0,back:f=!0}){let p=o.g;o.box(0,h,0,o.w-1,t,o.dep-1,e),f&&ye(o,h+i,t-1,a,n*.7),o.box(0,t,0,o.w-1,t,o.dep-1,"concrete");for(let m=0;m<o.w;m++)o.set(m,t+1,0,"concrete"),o.set(m,t+1,o.dep-1,"concrete");for(let m=0;m<o.dep;m++)o.set(0,t+1,m,"concrete"),o.set(o.w-1,t+1,m,"concrete");for(let m=h+i;m+4<=t;m+=a){if(s)for(let v=0;v<o.w;v++)o.set(v,m,0,s);for(let v=1+u;v+1<o.w;v+=3){let x=p.chance(n)?r:"darkglass";for(let y=m+2;y<=m+4;y++)o.set(v,y,0,x),v+1<o.w-1&&o.set(v+1,y,0,x);p.chance(c)&&o.set(v,m+1,-1,"vendwhite")}for(let v of[0,1])if(l[v]){let b=v?o.w-1:0;for(let x=2;x+1<o.dep-1;x+=4){let y=p.chance(n*.7);for(let k=m+2;k<=m+4;k++)o.set(b,k,x,y?"window":"darkglass"),o.set(b,k,x+1,y?"window":"darkglass")}}}}function Mt(o,t,e,s,i,a="wood",n="shoplight",r=3){o.box(t,h,0,e,h+i-1,s-1,"air"),o.box(t,3,0,e,3,s-1,a);for(let l=t+1;l<=e-1;l+=r)for(let c=1;c<s-1;c+=r)o.set(l,h+i,c,n)}function te(o,t,e,s=h){o.set(t,s,e,"stone"),o.set(t,s+1,e,"pole"),o.set(t,s+2,e,"stone"),o.set(t,s+3,e,"paperlamp"),o.set(t,s+4,e,"slabstone")}function ee(o,t,e,{r:s=6,h:i=9,y:a=h,seed:n=1,leaf:r="sakura"}={}){let l=Ds(n);for(let p=0;p<i;p++)o.set(t,a+p,e,"bark");o.set(t+1,a,e,"bark"),o.set(t-1,a,e,"bark"),o.set(t,a,e+1,"bark");let c=a+i+1,u=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1]];for(let[p,m]of u)for(let v=1;v<=Math.floor(s*.6);v++)o.set(t+p*v,a+i-2+Math.floor(v/2),e+m*v,"bark");let f=[[0,0,0,s]];for(let p=0;p<6;p++){let m=l()*Math.PI*2;f.push([Math.cos(m)*s*.6,-1+l()*2.5,Math.sin(m)*s*.6,s*(.5+l()*.25)])}for(let p=-s;p<=s;p++)for(let m=-s-3;m<=s+3;m++)for(let v=-s-3;v<=s+3;v++){let b=!1;for(let[T,S,R,H]of f){let A=v-T,$=(p-S)*1.45,W=m-R;if(A*A+$*$+W*W<H*H){b=!0;break}}if(!b||Math.sin(v*1.7+p*2.3)*Math.cos(m*1.9-p)>.82&&l()<.5)continue;let y=t+v,k=c+p,g=e+m;k<=a+2||o.get(y,k,g)===0&&o.set(y,k,g,r)}o.meta.petals.push([t,c,e,s])}function Ns(o,t,e,s=h+17,i="z"){for(let a=h;a<=s;a++)o.set(t,a,e,"pole");for(let a=-1;a<=1;a++)i==="z"?o.set(t,s-1,e+a,"steel"):o.set(t+a,s-1,e,"steel");return s}function we(o,t,e,s,i="vendred"){let[a,n]=s,r=n!==0?1:0,l=a!==0?1:0;for(let c=0;c<2;c++){let u=t+r*c,f=e+l*c;o.set(u,h,f,"black"),o.set(u,h+1,f,i),o.set(u,h+2,f,"screen"),o.set(u,h+3,f,"konbini")}}function Oe(o=1977){let t=new it(P,xe,Y),e=new Bt(t,o);return ke(e,"asphalt"),lo(e),co(e),uo(e),po(e),mo(e),vo(e),bo(e),wo(e),xo(e),yo(e),ko(e),go(e),Mo(e),To(e),So(e),Eo(e),_o(e),ho(e),Ro(e),Co(e),Ao(e,18,65),e.meta.props.push({t:"bike",x:64.5,y:h,z:50.6,r:.1},{t:"bike",x:66.2,y:h,z:50.7,r:-.05},{t:"bike",x:68,y:h,z:50.5,r:.12},{t:"bike",x:27,y:h,z:64.8,r:1.5},{t:"bike",x:50.5,y:h,z:68.6,r:.02}),e.meta.cat={x:16,z:33},e.meta.spawn={x:22,z:45,yaw:-Math.PI/2},t.meta=e.meta,t.relight(),t}function lo(o){o.box(0,3,40,P-1,3,51,"paving"),o.box(0,3,40,P-1,3,40,"stone"),o.box(0,3,51,P-1,3,51,"stone"),o.mark("shotengai",0,3,40,P-1,3,51),o.box(0,3,64,P-1,3,69,"asphalt");for(let t=0;t<P;t+=1)o.set(t,3,64,t%6<4?"plaster":"asphalt");o.box(30,3,0,77,3,7,"concrete")}function co(o){o.box(0,0,70,P-1,3,79,"stone"),o.box(0,1,71,P-1,3,78,"air"),o.box(0,0,71,P-1,0,78,"soil"),o.box(0,1,71,P-1,1,78,"water");for(let t=0;t<P;t++)o.chance(.3)&&o.set(t,2,70,"grass"),o.chance(.3)&&o.set(t,2,79,"grass");for(let t=0;t<P;t++)t>=40&&t<=47||(o.set(t,h,70,"slabstone"),o.set(t,h,79,"slabstone"));o.mark("canal",0,1,71,P-1,1,78)}function ho(o){let t={69:0,70:1,71:1,72:2,73:2,74:2,75:2,76:2,77:2,78:1,79:1,80:0},e={71:2,72:2,73:3,74:3,75:3,76:3,77:2,78:2};for(let s=69;s<=80;s++){let i=3+t[s],a=e[s]!==void 0?e[s]:0;for(let n=40;n<=47;n++){for(let r=Math.max(a,1);r<=i;r++)o.set(n,r,s,"stone");o.set(n,i,s,s===69||s===80?"paving":"wood")}s>=70&&s<=79&&(o.set(40,i+1,s,"vermilion"),o.set(47,i+1,s,"vermilion"))}for(let s of[70,79])for(let i of[40,47]){let a=3+t[s];o.set(i,a+2,s,"woodpost")}o.mark("bridge",40,1,69,47,7,80)}function uo(o){o.box(0,3,0,29,3,39,"gravel");for(let a=0;a<=29;a++)(a<12||a>18)&&(o.set(a,h,39,"stone"),o.set(a,h+1,39,"slabstone"));for(let a=0;a<=39;a++)o.set(29,h,a,"stone"),o.set(29,h+1,a,"slabstone");for(let a=1;a<=10;a++)o.chance(.8)&&o.set(a,h,38,"leaves");for(let a=20;a<=27;a++)o.chance(.8)&&o.set(a,h,38,"leaves");o.box(13,3,15,17,3,39,"stone");for(let a=16;a<=39;a+=2)o.set(13,3,a,"paving"),o.set(17,3,a+1,"paving");fo(o),zs(o,15,37),te(o,10,30),te(o,20,30),te(o,10,22),te(o,20,22);for(let a of[11,19])o.set(a,h,34,"stone"),o.set(a,h+1,34,"stone"),o.set(a,h+2,34,"slabstone"),o.set(a,h+1,33,"slabstone");o.box(23,h,29,26,h,30,"stone"),o.box(24,h,29,25,h,30,"water");for(let[a,n]of[[22,28],[27,28],[22,31],[27,31]])o.set(a,h,n,"woodpost"),o.set(a,h+1,n,"woodpost"),o.set(a,h+2,n,"woodpost"),o.set(a,h+3,n,"woodpost");o.box(21,h+4,27,28,h+4,32,"slabroof"),o.box(22,h+4,28,27,h+4,31,"rooftile"),ee(o,6,26,{r:7,h:9,seed:7}),ee(o,25,8,{r:5,h:8,seed:11,leaf:"leaves"});for(let a=17;a<=35;a++)o.chance(.25)&&o.set(12,h,a,"fern"),o.chance(.25)&&o.set(18,h,a,o.chance(.4)?"flowers":"fern");o.mark("shrine",0,3,0,29,24,39)}function fo(o){o.box(8,h,3,22,h,14,"stone");for(let s=13;s<=17;s++)o.set(s,h,15,"stairstoneN");o.box(9,h+1,4,21,h+6,13,"darkwood"),o.box(10,h+1,5,20,h+6,12,"air");for(let s=10;s<=20;s++)for(let i=h+2;i<=h+5;i++)o.set(s,i,13,"shoji");for(let s of[9,12,15,18,21])for(let i=h+1;i<=h+6;i++)o.set(s,i,13,"vermilion");o.set(15,h+1,13,"air"),o.set(15,h+2,13,"air"),o.set(15,h+1,14,"darkwood"),o.set(15,h+3,8,"paperlamp"),o.set(12,h+3,8,"paperlamp"),o.set(18,h+3,8,"paperlamp"),o.box(10,h+1,5,20,h+1,12,"wood");let t=h+7,e=se(o,6,24,1,17,t,"copper","slabcopper","x","darkwood");for(let s of[6,24])o.set(s,e+1,8,"darkwood"),o.set(s,e+1,10,"darkwood"),o.set(s,e+2,7,"darkwood"),o.set(s,e+2,11,"darkwood");for(let s of[10,13,17,20])o.set(s,e+2,9,"wood");o.box(9,t,4,21,t,13,"darkwood"),o.set(15,h+5,14,"cream"),o.mark("honden",6,h,1,24,e+2,17)}function zs(o,t,e){let s=h;for(let i of[t-3,t+3]){o.set(i,s,e,"black");for(let a=s+1;a<=s+9;a++)o.set(i,a,e,"vermilion")}for(let i=t-4;i<=t+4;i++)o.set(i,s+7,e,"vermilion");o.set(t,s+8,e,"signboard");for(let i=t-4;i<=t+4;i++)o.set(i,s+9,e,"vermilion");for(let i=t-6;i<=t+6;i++)o.set(i,s+10,e,"black");o.set(t-6,s+11,e,"black"),o.set(t+6,s+11,e,"black"),o.set(t-7,s+11,e,"slabwood"),o.set(t+7,s+11,e,"slabwood");for(let i=t-2;i<=t+2;i++)o.set(i,s+6,e,"cream");o.set(t-1,s+5,e,"plaster"),o.set(t+1,s+5,e,"plaster"),o.mark("torii",t-7,s,e,t+7,s+11,e)}function po(o){o.box(30,3,0,33,3,39,"asphalt");for(let t=0;t<=39;t++)t%5<3&&o.set(30,3,t,"plaster")}function mo(o){let t=new at(o,34,45,8,39,1),e=h+7+6*6-1;Rt(t,{top:e,wall:"tile",band:"concrete",sideWin:[!0,!1],litP:.5,from:9}),Mt(t,1,10,8,5,"wood"),t.box(1,h,4,10,h+1,4,"darkwood"),t.box(1,h,6,10,h+1,7,"steel"),t.box(2,h,2,9,h,2,"slabwood"),t.set(3,h+2,4,"konbini"),t.set(8,h+2,7,"paperlamp"),t.box(0,h+5,0,11,h+6,0,"darkwood");for(let s=2;s<=9;s++)t.set(s,h+4,0,"norenblue");t.set(0,h+4,-1,"lantern"),t.set(11,h+4,-1,"lantern"),_t(t,"\u30E9\uFF5C\u30E1\u30F3",0,e-1,"neonred",{border:"neonamber"}),o.mark("ramen",34,h,8,45,e+1,40)}function vo(o){let t=new at(o,46,59,8,39,1),e=h+7+6*3-1;Rt(t,{top:e,wall:"plaster",band:"tileblue",litP:.6}),Mt(t,1,12,14,5,"paving","konbini",2);for(let i=1;i<=12;i++)for(let a=h;a<=h+4;a++)i>=6&&i<=7&&a<=h+3||t.set(i,a,0,"glass");for(let i of[4,7,10])t.box(2,h,i,9,h+1,i,i===7?"tileblue":"cream"),t.box(2,h+2,i,9,h+2,i,"vendwhite");t.box(10,h,2,11,h+1,4,"vendwhite"),t.set(11,h+2,3,"screen"),t.box(1,h,12,12,h+3,12,"glass"),t.box(1,h+4,12,12,h+4,12,"konbini"),t.box(0,h+5,-1,13,h+6,-1,"konbini"),t.box(0,h+5,-1,13,h+5,-1,"neonblue"),t.box(0,h+6,-1,13,h+6,-1,"konbini");for(let i=0;i<=13;i+=13)t.set(i,h+6,-1,"neongreen");for(let i=h+7+6;i<e;i+=6)for(let a=1;a<=12;a++)t.set(a,i,-1,"slabconc"),a%2&&t.set(a,i+1,-1,"pole");let s=e+1;t.box(1,s,1,12,s,3,"wood"),t.box(2,s,2,11,s,2,"grass");for(let i=2;i<=11;i++)t.set(i,s+1,2,o.chance(.5)?"flowers":"fern");t.box(1,s,9,3,s,11,"wood"),t.box(2,s+1,10,2,s+4,10,"bark");for(let i=4;i<=6;i++)for(let a=-1;a<=1;a++)for(let n=-1;n<=1;n++)Math.abs(a)+Math.abs(n)+(i===6?1:0)<3&&t.set(2+a,s+i,10+n,"leaves");t.box(5,s,6,7,s,6,"slabwood");for(let[i,a]of[[8,14],[11,14],[8,17],[11,17]])t.set(i,s,a,"pole"),t.set(i,s+1,a,"pole");t.box(8,s+2,14,11,s+5,17,"tank"),t.box(9,s+6,15,10,s+6,16,"slabconc"),t.box(1,s,20,2,s+1,21,"vendwhite"),t.box(4,s,20,5,s+1,21,"vendwhite"),o.mark("konbini",46,h,8,59,e+7,40),o.mark("rooftop",46,s,8,59,s+6,39)}function bo(o){let t=new at(o,60,67,8,39,1),e=h+7+6*5-1;Rt(t,{top:e,wall:"cream",band:"brick",litP:.45}),Mt(t,1,6,5,5,"darkwood","shoplight"),t.box(1,h,0,6,h+4,0,"darkwood"),t.box(2,h,0,3,h+3,0,"air"),t.set(5,h+2,0,"shoji"),t.set(5,h+1,0,"shoji"),t.set(1,h+4,-1,"paperlamp"),_t(t,"\u30B9\u30CA\u30C3\u30AF",0,e-2,"neonpink",{border:"neoncyan"}),o.mark("snack",60,h,8,67,e+1,40)}function wo(o){let t=new at(o,68,77,8,39,1),e=h+7+6*6-1;Rt(t,{top:e,wall:"tileblue",band:"concrete",litP:.7,winMat:"window"}),Mt(t,1,8,6,5,"paving","neonblue",3),t.box(1,h,0,8,h+4,0,"glass"),t.box(4,h,0,5,h+3,0,"air"),t.box(0,h+5,-1,9,h+6,-1,"signboard");for(let s=0;s<=9;s++)t.set(s,h+6,-1,s%2?"neonpink":"neoncyan");_t(t,"\u30AB\u30E9\u30AA\u30B1",1,e-1,"neoncyan",{border:"neonpink"}),o.mark("karaoke",68,h,8,77,e+1,40)}function xo(o){let t=new at(o,0,17,52,63,-1),e=h+19;t.box(0,h,0,17,e,11,"plaster");for(let s of[0,4,8,9,13,17])t.box(s,h,0,s,e,0,"darkwood");t.box(0,h+5,0,17,h+5,0,"darkwood"),t.box(5,h,0,7,h+3,2,"air"),t.box(10,h,0,12,h+3,2,"air"),t.box(5,3,0,12,3,2,"wood");for(let s=5;s<=7;s++)t.set(s,h+3,0,"norenblue");for(let s=10;s<=12;s++)t.set(s,h+3,0,"norenred");t.set(6,h+4,2,"shoplight"),t.set(11,h+4,2,"shoplight"),t.box(5,h,3,12,h+3,3,"shoji"),_t(t,"\u6E6F",2,e-1,"neoncyan",{border:"neonblue",d:-1}),se(o,-1,18,51,64,e+1,"rooftile","slabroof","z","darkwood"),o.box(4,h+5,50,13,h+5,51,"slabroof"),o.box(6,h+6,50,11,h+6,51,"rooftile"),o.box(7,h+7,50,10,h+7,50,"slabroof"),ye(t,h,e,6,.5);for(let s=h;s<=45;s++)for(let[i,a]of[[2,8],[3,8],[2,9],[3,9]])t.set(i,s,a,s>=38&&s<=39?"plaster":"brick");t.set(2,46,8,"neonred"),t.set(4,h+4,-1,"paperlamp"),t.set(13,h+4,-1,"paperlamp"),o.mark("sento",0,h,52,17,46,63)}function yo(o){let t=new at(o,18,27,52,63,-1),e=h+13;t.box(0,h,0,9,e,11,"wood"),Mt(t,1,8,8,5,"wood","shoplight",3);for(let s=h;s<=h+3;s++)t.box(1,s,7,8,s,7,"books"),t.box(1,s,1,1,s,6,"books"),t.box(8,s,1,8,s,6,"books");t.box(3,h,3,6,h,4,"darkwood"),t.box(3,h+1,3,6,h+1,4,"books"),t.box(0,h+5,0,9,h+5,0,"darkwood"),t.box(0,h+6,0,9,e,0,"darkwood");for(let s=1;s<=8;s++)for(let i=h+8;i<=h+10;i++)t.set(s,i,0,"shoji");_t(t,"\u672C",1,e+0,"neonamber",{border:null,d:-1,back:"darkwood"}),se(o,17,28,51,64,e+1,"rooftile","slabroof","x","darkwood"),ye(t,h,e,6,.5),t.set(0,h+4,-1,"paperlamp"),o.mark("bookshop",18,h,52,27,e+8,63)}function ko(o){let t=new at(o,28,39,52,63,-1),e=h+7+6*2-1;Rt(t,{top:e,wall:"darkwood",band:"wood",litP:.9,winMat:"shoji",sideWin:[!1,!0]}),Mt(t,1,10,7,5,"wood","paperlamp"),t.box(1,h,4,10,h+1,4,"wood"),t.box(1,h,6,10,h+3,6,"books"),t.box(1,h,0,10,h+4,0,"shoji"),t.box(4,h,0,6,h+3,0,"air");for(let s=4;s<=6;s++)t.set(s,h+3,0,"norenred");t.set(2,h+3,-1,"lantern"),t.set(8,h+3,-1,"lantern"),t.set(2,h+2,-1,"lantern"),t.set(8,h+2,-1,"lantern"),_t(t,"\u9152",1,e-1,"neonred",{border:"neonamber"}),o.mark("izakaya",28,h,52,39,e+1,63)}function go(o){o.box(40,3,52,47,3,63,"paving"),we(o,40,54,[1,0],"vendred"),we(o,40,56,[1,0],"vendwhite"),we(o,40,58,[1,0],"vendred"),o.set(40,h,60,"tileblue"),o.mark("vending",40,h,54,40,h+3,59)}function Mo(o){let t=new at(o,48,61,52,63,-1),e=h+7+6*3-1;Rt(t,{top:e,wall:"brick",band:"cream",litP:.55}),Mt(t,1,12,8,5,"darkwood","shoplight",3);for(let s=1;s<=12;s++)for(let i=h;i<=h+4;i++)s>=2&&s<=3&&i<=h+3||t.set(s,i,0,"glass");for(let s of[5,9])t.set(s,h,3,"darkwood"),t.set(s,h,5,"darkwood"),t.set(s+1,h,4,"slabwood");t.box(0,h+5,-1,13,h+5,-2,"slabroof"),t.box(0,h+5,-1,13,h+5,-1,"leaves");for(let s of[0,13])t.set(s,h,-1,"wood"),t.set(s,h+1,-1,o.chance(.5)?"flowers":"fern");ro(t,"BAR",11,e-2,"neonamber",{border:"neonpink"}),o.mark("kissa",48,h,52,61,e+1,63)}function To(o){let t=new at(o,62,77,52,63,-1),e=h+11;t.box(0,h,1,15,e,11,"plaster"),t.box(0,h,1,15,h+5,1,"darkwood");for(let s of[0,5,10,15])t.box(s,h,1,s,e,1,"darkwood");t.box(6,h,1,9,h+3,1,"shoji");for(let s=1;s<=14;s++)if(s%5)for(let i=h+7;i<=h+9;i++)t.set(s,i,1,s>10?"window":"shoji");t.box(-1,h+6,-1,16,h+6,0,"slabroof"),se(o,61,78,52,64,e+1,"rooftile","slabroof","x","darkwood"),ye(t,h,e,6,.5);for(let s of[1,2,3,12,13])t.set(s,h,0,"wood"),t.set(s,h+1,0,o.chance(.5)?"flowers":"fern");t.set(11,h+5,0,"paperlamp"),o.mark("oldhouse",62,h,52,77,e+8,63)}function So(o){o.box(0,3,80,P-1,3,84,"paving"),o.box(0,3,85,P-1,3,Y-1,"grass");for(let e=6;e<78;e+=12)if(!(e>=38&&e<=49)){for(let s=h;s<=h+5;s++)o.set(e,s,80,"pole");o.set(e,h+6,80,"paperlamp")}ee(o,54,86,{r:5,h:7,seed:23}),ee(o,30,87,{r:4,h:6,seed:31,leaf:"leaves"});let t=[[0,13],[16,27],[62,75]];for(let[e,s]of t){let i=new at(o,e,s,86,95,-1),a=h+10;i.box(0,h,1,i.w-1,a,i.dep-1,o.pick(["plaster","cream","wood"]));for(let n=1;n<i.w-1;n+=3){let r=o.chance(.6);for(let l=h+6;l<=h+8;l++)i.set(n,l,1,r?"window":"darkglass"),i.set(n+1,l,1,r?"window":"darkglass")}i.box(2,h,1,3,h+3,1,"darkwood"),se(o,e-1,s+1,86,96,a+1,"rooftile","slabroof","x","darkwood");for(let n=0;n<i.w;n++)(n<2||n>4)&&o.chance(.7)&&i.set(n,h,0,"leaves")}for(let e=40;e<=47;e++)o.set(e,3,84,"paving");o.mark("southbank",0,3,80,P-1,20,Y-1)}function Eo(o){let i=[[40,51],[64,79]],a=r=>i.some(([l,c])=>r>=l&&r<=c);for(let r=0;r<Y;r++){if(a(r)){if(o.box(78,15,r,87,17,r,"steel"),o.set(78,14,r,"steel"),o.set(87,14,r,"steel"),r%3===0)for(let l=79;l<87;l++)o.set(l,14,r,"steel")}else o.box(78,h,r,87,17,r,"brick");o.box(79,18,r,86,18,r,"rail"),o.set(78,18,r,"concrete"),o.set(87,18,r,"concrete"),o.set(78,19,r,"concrete"),o.set(87,19,r,"concrete")}let n=[];for(let r=2;r+5<40;r+=8)n.push(r);for(let r of[53,57])n.push(r);for(let r=81;r+5<Y;r+=8)n.push(r);for(let r of n){let l=Math.min(5,r<52||r>80?5:3);for(let c=r;c<=r+l;c++)for(let u=h;u<=h+9;u++){let f=Math.abs(c-(r+l/2))/(l/2+.5),p=h+7+Math.round(2*Math.sqrt(Math.max(0,1-f*f)));if(u<=p)for(let m=78;m<=86;m++)o.set(m,u,c,"air")}for(let c=r;c<=r+l;c++)o.set(78,3,c,"paving");if(r<40){for(let c=r;c<=r+l;c++)o.set(85,h,c,"darkwood"),o.set(85,h+1,c,"wood"),o.set(86,h+5,c,"shoplight");o.set(78,h+6,r+1,"lantern"),o.set(78,h+6,r+l-1,"lantern"),o.box(78,h+5,r+2,78,h+5,r+l-2,"norenred")}else o.set(78,h+6,r+1,"paperlamp")}for(let r of[43,48])for(let l of[80,85])o.set(l,13,r,"paperlamp");for(let r of[66])for(let l of[80,85])o.set(l,13,r,"konbini");o.meta.train={x:166/2,y:19,axis:"z"},o.mark("viaduct",78,h,0,87,19,Y-1)}function _o(o){let t=new at(o,88,95,8,39,1),e=h+7+6*5-1;Rt(t,{top:e,wall:"concrete",band:"tile",litP:.6,sideWin:[!1,!1]}),Mt(t,1,6,5,5,"paving","shoplight"),t.box(1,h,0,6,h+4,0,"glass"),t.box(3,h,0,4,h+3,0,"air"),_t(t,"\u30DB\u30C6\u30EB",0,e-2,"neonpink",{border:"neonblue"});let s=new at(o,88,95,52,63,-1);s.box(0,h,0,7,h+9,11,"metal"),s.box(1,h,0,6,h+6,0,"air"),s.box(1,h,1,6,h+6,8,"air"),s.set(3,h+7,2,"shoplight"),we(o,94,51,[0,-1],"vendwhite"),o.mark("east",88,h,8,95,e+1,63)}function Ro(o){for(let t=3;t<78;t+=6){let e=h+6;o.wire([t+.5,e+1.25,39.6],[t+.5,e+1.25,52.4],.9);let s=t/6%2<1;for(let i of[42,45,48])o.set(t,e,i,s?i===45?"paperlamp":"lantern":i===45?"lantern":"paperlamp")}o.mark("lanterns",3,h+6,42,77,h+6,48)}function Co(o){let t=[6,22,38,55,71];for(let s of t)Ns(o,s,64),o.set(s,h+11,65,"konbini");o.set(55,h+14,65,"metal"),o.set(55,h+14,63,"metal");for(let s=0;s+1<t.length;s++)for(let i of[-1,0,1])o.wire([t[s]+.5,h+16.6,64.5+i],[t[s+1]+.5,h+16.6,64.5+i],1.6);let e=[4,20,36];for(let s of e)Ns(o,33,s,h+17,"x");for(let s=0;s+1<e.length;s++)for(let i of[-1,0,1])o.wire([33.5+i,h+16.6,e[s]+.5],[33.5+i,h+16.6,e[s+1]+.5],1.6);o.wire([22.5,h+16.6,64.5],[22.5,h+12,63.2],.5),o.wire([55.5,h+16.6,64.5],[55.5,h+13,63.2],.5),o.wire([33.5,h+16.6,36.5],[45.5,h+30,39.2],1.5)}function Ao(o,t,e){for(let s of[1,5])for(let i of[0,2])o.set(t+s,h,e+i,"black");o.box(t,h+1,e,t+6,h+1,e+2,"kei"),o.box(t+5,h+2,e,t+6,h+3,e+2,"kei"),o.box(t+6,h+3,e,t+6,h+3,e+2,"glass"),o.box(t+5,h+3,e,t+5,h+3,e+2,"glass"),o.set(t+6,h+2,e,"neonamber"),o.set(t+6,h+2,e+2,"neonamber");for(let s=0;s<=4;s++)o.set(t+s,h+2,e,"slabconc"),o.set(t+s,h+2,e+2,"slabconc");o.set(t,h+2,e+1,"slabconc"),o.set(t+2,h+2,e+1,"wood"),o.set(t+3,h+2,e+1,"cream"),o.mark("kei",t,h,e,t+6,h+3,e+2)}function No(o=1){let t=new it(P,xe,Y),e=new Bt(t,o);ke(e,"asphalt"),e.box(4,3,4,P-5,3,Y-5,"concrete");for(let s=8;s<P-8;s+=6)for(let i=10;i<20;i++)e.set(s,3,i,"plaster");for(let[s,i]of[[4,4],[P-5,4],[4,Y-5],[P-5,Y-5]]){for(let a=h;a<=h+7;a++)e.set(s,a,i,"pole");e.set(s,h+8,i,"paperlamp")}return t.meta={...e.meta,spawn:{x:48,z:48,yaw:0}},t.relight(),t}function Do(o=2){let t=new it(P,xe,Y),e=new Bt(t,o);ke(e,"grass");for(let i=0;i<720;i++){let a=i/720*Math.PI*2,n=Math.round(48+Math.cos(a)*32),r=Math.round(48+Math.sin(a)*26);e.box(n-1,3,r-1,n+1,3,r+1,"gravel")}for(let i=30;i<=66;i++)for(let a=30;a<=66;a++){let n=((a-48)/14)**2+((i-48)/10)**2;n<1?(e.set(a,3,i,"water"),e.set(a,2,i,"water")):n<1.25&&e.set(a,3,i,"stone")}e.box(46,3,37,50,3,59,"wood");for(let i=37;i<=59;i++)e.set(46,h,i,"vermilion"),e.set(50,h,i,"vermilion");let s=e.r;for(let i=0;i<14;i++){let a=i/14*Math.PI*2+.2;ee(e,Math.round(48+Math.cos(a)*40),Math.round(48+Math.sin(a)*36),{r:4+Math.floor(s()*3),h:6+Math.floor(s()*3),seed:50+i,leaf:i%3?"sakura":"leaves"})}for(let i=0;i<8;i++){let a=i/8*Math.PI*2;te(e,Math.round(48+Math.cos(a)*28),Math.round(48+Math.sin(a)*22))}zs(e,48,14);for(let i=0;i<300;i++){let a=e.rand(0,P-1),n=e.rand(0,Y-1);t.get(a,3,n)===M.grass&&t.get(a,h,n)===0&&e.set(a,h,n,e.chance(.4)?"flowers":"fern")}return t.meta={...e.meta,cat:{x:30,z:48},spawn:{x:48,z:90,yaw:0}},t.relight(),t}function Po(o=3){let t=new it(P,xe,Y),e=new Bt(t,o);ke(e,"asphalt");let s=["\u30E9\uFF5C\u30E1\u30F3","\u30AB\u30E9\u30AA\u30B1","\u30B9\u30CA\u30C3\u30AF","\u30DB\u30C6\u30EB","\u30B5\u30A6\u30CA","\u30B7\u30CD\u30DE","\u30CD\u30AA\u30F3","\u30DE\u30C1","BAR","\u30E4\u30AD\u30C8\u30EA"],i=["neonpink","neoncyan","neonred","neonamber","neongreen","neonblue"],a=["tile","tileblue","plaster","cream","concrete","brick","metal"];for(let n of[0,32,64])e.box(0,3,n+26,P-1,3,n+31,"paving");for(let n=0;n<Y;n+=32){for(let r of[1,-1]){let l=r>0?n+13:n,c=r>0?n+25:n+11;if(r<0&&n===0)continue;let u=0;for(;u<P-6;){let f=Math.min(P-u,e.rand(8,14)),p=new at(e,u,u+f-1,r>0?l:l-0,(r>0,c),r>0?1:-1),m=e.rand(1,5),v=h+7+6*m-1;Rt(p,{top:v,wall:e.pick(a),band:e.pick(["concrete","tile",null]),litP:.6}),Mt(p,1,f-2,5,5,"paving",e.chance(.3)?"konbini":"shoplight");for(let b=1;b<=f-2;b++)for(let x=h;x<=h+4;x++)e.chance(.4)&&x>h&&p.set(b,x,0,"glass");p.box(0,h+5,-1,f-1,h+5,-1,e.pick(i)),m>=4&&f>=9?_t(p,e.pick(s.slice(0,7)),0,v-1,e.pick(i),{border:e.pick(i)}):m>=2&&e.chance(.5)&&p.set(1,h+4,-1,e.chance(.5)?"lantern":"paperlamp"),u+=f}}for(let r=4;r<P;r+=10){let l=h+9,c=n+26;if(!(c+5>=Y))for(let u of[c+1,c+3,c+5])e.set(r,l,Math.min(Y-1,u),u===c+3?"paperlamp":"lantern")}}return t.meta={...e.meta,cat:{x:20,z:28},spawn:{x:10,z:28,yaw:-Math.PI/2}},t.relight(),t}var ge={tokyo:{name:"Tokyo corner",make:Oe},empty:{name:"Empty lot",make:No},park:{name:"Flat park",make:Do},district:{name:"Random district",make:o=>Po(o??Date.now()%1e5)}};var Ho=200,Me=1500,Te=class{constructor(t){this.world=t,this.undoStack=[],this.redoStack=[],this.group=null,this.mirrorX=!1,this.mirrorZ=!1,this.onChange=null,this.bulk=!1}setWorld(t){this.world=t,this.undoStack=[],this.redoStack=[],this.group=null}begin(){this.group||(this.group=[])}_write(t,e,s,i){let a=this.world;if(!a.inside(t,e,s))return!1;let n=a.idx(t,e,s),r=a.blocks[n];return r===i?!1:(this.group.push(n,r,i),this.bulk?a.blocks[n]=i:a.set(t,e,s,i),!0)}put(t,e,s,i){let a=this.world,n=0,r=[[t,s,i]];this.mirrorX&&r.push([a.W-1-t,s,jt(i,"x")]),this.mirrorZ&&r.push([t,a.D-1-s,jt(i,"z")]),this.mirrorX&&this.mirrorZ&&r.push([a.W-1-t,a.D-1-s,jt(jt(i,"x"),"z")]);for(let[l,c,u]of r)this._write(l,e,c,u)&&n++;return n}end(){let t=this.group;return this.group=null,this.bulk&&(this.bulk=!1,this.world.relight()),!t||!t.length?0:(this.undoStack.push(Int32Array.from(t)),this.undoStack.length>Ho&&this.undoStack.shift(),this.redoStack.length=0,this.onChange&&this.onChange(),t.length/3)}_replay(t,e){let s=this.world,i=t.length/3,a=i>Me,n=s.W,r=s.D,l=n*r,c=u=>{let f=t[u*3],p=e?t[u*3+2]:t[u*3+1];a?s.blocks[f]=p:s.set(f%n,f/l|0,(f/n|0)%r,p)};if(e)for(let u=0;u<i;u++)c(u);else for(let u=i-1;u>=0;u--)c(u);a&&s.relight()}undo(){let t=this.undoStack.pop();return t?(this._replay(t,!1),this.redoStack.push(t),this.onChange&&this.onChange(),!0):!1}redo(){let t=this.redoStack.pop();return t?(this._replay(t,!0),this.undoStack.push(t),this.onChange&&this.onChange(),!0):!1}get canUndo(){return this.undoStack.length>0}get canRedo(){return this.redoStack.length>0}place(t,e,s,i){return this.begin(),this.put(t,e,s,i),this.end()}remove(t,e,s){return this.begin(),this.put(t,e,s,0),this.end()}box(t,e,s){let[i,a]=[Math.min(t[0],e[0]),Math.max(t[0],e[0])],[n,r]=[Math.min(t[1],e[1]),Math.max(t[1],e[1])],[l,c]=[Math.min(t[2],e[2]),Math.max(t[2],e[2])],u=(a-i+1)*(r-n+1)*(c-l+1)*(1+this.mirrorX+this.mirrorZ+(this.mirrorX&&this.mirrorZ));this.begin(),this.bulk=u>Me;for(let f=n;f<=r;f++)for(let p=l;p<=c;p++)for(let m=i;m<=a;m++)this.put(m,f,p,s);return this.end()}line(t,e,s,i=1){let a=zo(t,e);this.begin(),this.bulk=a.length*i>Me;for(let[n,r,l]of a)for(let c=0;c<i;c++)this.put(n,r+c,l,s);return this.end()}stamp(t,e,s,i,a=0){let n=qe(t,a),r=e-Math.floor(n.w/2),l=i-Math.floor(n.d/2);this.begin(),this.bulk=n.w*n.h*n.d>Me*4;for(let c=0;c<n.h;c++)for(let u=0;u<n.d;u++)for(let f=0;f<n.w;f++){let p=n.data[f+n.w*(u+n.d*c)];p&&this.put(r+f,s+c,l+u,p)}return this.end()}copy(t,e,s="Copy"){let[i,a]=[Math.min(t[0],e[0]),Math.max(t[0],e[0])],[n,r]=[Math.min(t[1],e[1]),Math.max(t[1],e[1])],[l,c]=[Math.min(t[2],e[2]),Math.max(t[2],e[2])],u=a-i+1,f=r-n+1,p=c-l+1,m=new Uint8Array(u*f*p);for(let v=0;v<f;v++)for(let b=0;b<p;b++)for(let x=0;x<u;x++)m[x+u*(b+p*v)]=this.world.get(i+x,n+v,l+b);return{name:s,w:u,h:f,d:p,data:m}}};function zo(o,t){let e=[t[0]-o[0],t[1]-o[1],t[2]-o[2]],s=Math.max(Math.abs(e[0]),Math.abs(e[1]),Math.abs(e[2])),i=[];for(let a=0;a<=s;a++){let n=s?a/s:0;i.push([Math.round(o[0]+e[0]*n),Math.round(o[1]+e[1]*n),Math.round(o[2]+e[2]*n)])}return i}function qe(o,t){t=(t%4+4)%4;let e=o;for(let s=0;s<t;s++){let{w:i,h:a,d:n,data:r}=e,l=n,c=i,u=new Uint8Array(r.length);for(let f=0;f<a;f++)for(let p=0;p<n;p++)for(let m=0;m<i;m++){let v=n-1-p,b=m;u[v+l*(b+c*f)]=fs(r[m+i*(p+n*f)])}e={...e,w:l,d:c,data:u}}return e}function Ws(o,t,e,s){return o+1>s[0]&&o<s[3]&&t+1>s[1]&&t<s[4]&&e+1>s[2]&&e<s[5]}var Se=.55,Wo=3.3,Bo=3,Fs=[[[0,0,0,1,1,1]],[[0,0,0,1,.5,1]],[[0,0,0,1,.5,1],[0,.5,0,1,1,.5]],[[0,0,0,1,.5,1],[.5,.5,0,1,1,1]],[[0,0,0,1,.5,1],[0,.5,.5,1,1,1]],[[0,0,0,1,.5,1],[0,.5,0,.5,1,1]],[[.34,0,.34,.66,1,.66]]],Bs=Fs[0];function Fo(o,t,e,s){if(e<0||t<0||s<0||t>=o.W||s>=o.D)return Bs;if(e>=o.H)return null;let i=o.blocks[t+o.W*(s+o.D*e)];if(!i||!St[i])return null;let a=ft[i];return a<=6?Fs[a]:null}function Go(o,t,e,s,i,a,n){for(let l=Math.floor(e+1e-6);l<=Math.floor(a-1e-6);l++)for(let c=Math.floor(s+1e-6);c<=Math.floor(n-1e-6);c++)for(let u=Math.floor(t+1e-6);u<=Math.floor(i-1e-6);u++){let f=Fo(o,u,l,c);if(f){for(let p of f)if(u+p[3]>t+1e-6&&u+p[0]<i-1e-6&&l+p[4]>e+1e-6&&l+p[1]<a-1e-6&&c+p[5]>s+1e-6&&c+p[2]<n-1e-6)return!0}}return!1}var oe=class{constructor(t){this.world=t,this.pos=[0,0,0],this.vel=[0,0,0],this.yaw=0,this.pitch=0,this.onGround=!1,this.fly=!1,this.stepAcc=0,this.eyeLag=0,this.lastJump=-9,this.time=0,this.inWater=!1}box(t=this.pos){return[t[0]-Se,t[1],t[2]-Se,t[0]+Se,t[1]+Wo,t[2]+Se]}blocked(t){let e=this.box(t);return Go(this.world,...e)}spawn(t,e,s=0){let i=this.world;t=Math.max(1,Math.min(i.W-2,t)),e=Math.max(1,Math.min(i.D-2,e));for(let a=0;a<i.H;a++){let n=[t,a,e];if(!this.blocked(n)&&this.blocked([t,a-.05,e])){this.pos=n;break}this.pos=[t,i.H,e]}this.vel=[0,0,0],this.yaw=s,this.pitch=0,this.fly=!1}step(t,e){this.time+=t;let i=this.world.get(Math.floor(this.pos[0]),Math.floor(this.pos[1]+.2),Math.floor(this.pos[2]));this.inWater=i===M.water,e.jumpPressed&&(this.time-this.lastJump<.3?(this.fly=!this.fly,this.vel[1]=0,this.lastJump=-9):this.lastJump=this.time);let a=(this.fly?18:e.sprint?13:8)*(this.inWater?.55:1),n=Math.sin(this.yaw),r=Math.cos(this.yaw),l=e.fwd||0,c=e.strafe||0,u=-n*l+r*c,f=-r*l-n*c,p=Math.hypot(u,f);p>1&&(u/=p,f/=p);let m=this.onGround||this.fly?14:4,v=1-Math.exp(-m*t);if(this.vel[0]+=(u*a-this.vel[0])*v,this.vel[2]+=(f*a-this.vel[2])*v,this.fly){let b=(e.jump?1:0)-(e.down?1:0);this.vel[1]+=(b*a*.8-this.vel[1])*v}else this.inWater?(this.vel[1]-=12*t,this.vel[1]=Math.max(this.vel[1],-5),e.jump&&(this.vel[1]=5)):(this.vel[1]-=40*t,this.vel[1]=Math.max(this.vel[1],-60)),e.jump&&this.onGround&&(this.vel[1]=14.2,this.onGround=!1);this.move(t)}move(t){let e=this.pos,s=this.onGround;this.onGround=!1;for(let i of[1,0,2]){let a=this.vel[i]*t,n=Math.max(1,Math.ceil(Math.abs(a)/.2)),r=a/n;for(let l=0;l<n;l++){let c=[e[0],e[1],e[2]];if(c[i]+=r,!this.blocked(c)){e[i]=c[i];continue}if(i!==1&&(s||this.onGround)&&!this.fly){let p=!1;for(let m of[.5,1]){let v=[c[0],c[1]+m+.01,c[2]];if(!this.blocked(v)&&!this.blocked([e[0],e[1]+m+.01,e[2]])){e[0]=v[0],e[1]=v[1],e[2]=v[2],this.eyeLag-=m+.01,p=!0;break}}if(p)continue}let u=0,f=r;for(let p=0;p<8;p++){let m=(u+f)/2,v=[e[0],e[1],e[2]];v[i]+=m,this.blocked(v)?f=m:u=m}e[i]+=u,i===1&&this.vel[1]<0&&(this.onGround=!0),this.vel[i]=0;break}}!this.onGround&&this.vel[1]<=0&&this.blocked([e[0],e[1]-.04,e[2]])&&(this.onGround=!0),this.pos[1]<-20&&this.spawn(this.world.W/2,this.world.D/2),this.eyeLag*=Math.exp(-t*14),this.onGround&&Math.hypot(this.vel[0],this.vel[2])>1?this.stepAcc+=Math.hypot(this.vel[0],this.vel[2])*t:this.onGround||(this.stepAcc=0)}eye(){return[this.pos[0],this.pos[1]+Bo+this.eyeLag,this.pos[2]]}};var Us="machi",Ls=1,Is=4*1024*1024,Uo=[128,64,128],ie="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";function Lo(o){let t="";for(let e=0;e<o.length;e+=3){let s=o[e],i=o[e+1],a=o[e+2],n=s<<16|(i||0)<<8|(a||0);t+=ie[n>>18&63]+ie[n>>12&63]+(e+1<o.length?ie[n>>6&63]:"=")+(e+2<o.length?ie[n&63]:"=")}return t}var Os=new Int16Array(128).fill(-1);for(let o=0;o<64;o++)Os[ie.charCodeAt(o)]=o;function Io(o){if(typeof o!="string"||o.length%4!==0)throw new Error("bad data");let t=o.endsWith("==")?2:o.endsWith("=")?1:0,e=new Uint8Array(o.length/4*3-t),s=0;for(let i=0;i<o.length;i+=4){let a=0;for(let n=0;n<4;n++){let r=o.charCodeAt(i+n),l;if(r===61&&i+n>=o.length-t)l=0;else if(l=r<128?Os[r]:-1,l<0)throw new Error("bad data");a=a<<6|l}s<e.length&&(e[s++]=a>>16&255),s<e.length&&(e[s++]=a>>8&255),s<e.length&&(e[s++]=a&255)}return e}function Gs(o,t){for(;t>=128;)o.push(t&127|128),t=Math.floor(t/128);o.push(t)}function Ee(o,t={}){let e=[],s=new Map,i=[],a=o.blocks,n=0;for(;n<a.length;){let r=a[n],l=n+1;for(;l<a.length&&a[l]===r;)l++;let c=s.get(r);c===void 0&&(c=e.length,s.set(r,c),e.push(q[r]?q[r].key:"placeholder")),Gs(i,c),Gs(i,l-n),n=l}return{format:Us,v:Ls,dims:[o.W,o.H,o.D],palette:e,rle:Lo(Uint8Array.from(i)),meta:qs(o.meta),...t}}function _e(o,t=null){if(!o||typeof o!="object"||Array.isArray(o))throw new Error("Not a MACHI save");if(o.format!==Us)throw new Error("Not a MACHI save");if(typeof o.v!="number"||o.v>Ls||o.v<1)throw new Error("Unsupported save version");let e=o.dims;if(!Array.isArray(e)||e.length!==3||!e.every((b,x)=>Number.isInteger(b)&&b>=1&&b<=Uo[x]))throw new Error("Bad world size");let s=o.palette;if(!Array.isArray(s)||s.length<1||s.length>256||!s.every(b=>typeof b=="string"&&b.length<=40))throw new Error("Bad block list");if(typeof o.rle!="string"||o.rle.length>Is*1.4)throw new Error("Save too large");let i=s.map(b=>Object.prototype.hasOwnProperty.call(M,b)?M[b]:M.placeholder),a=Io(o.rle),[n,r,l]=e,c=n*r*l,u=new Uint8Array(c),f=0,p=0,m=()=>{let b=0,x=1,y=0;for(;;){if(p>=a.length||y>4)throw new Error("Corrupt data");let k=a[p++];if(b+=(k&127)*x,y++,k<128)break;x*=128}return b};for(;p<a.length;){let b=m(),x=m();if(b>=i.length||x<1||f+x>c)throw new Error("Corrupt data");u.fill(i[b],f,f+x),f+=x}if(f!==c)throw new Error("Corrupt data");let v=t&&t.W===n&&t.H===r&&t.D===l?t:new it(n,r,l);return v.blocks.set(u),v.meta=qs(o.meta),v.relight(),v}function qs(o){let t={wires:[],props:[],petals:[],train:null,cat:null,spawn:null,landmarks:{}};if(!o||typeof o!="object")return t;let e=(s,i)=>Array.isArray(s)&&s.length===i&&s.every(a=>typeof a=="number"&&Number.isFinite(a)&&Math.abs(a)<1e4);if(Array.isArray(o.wires)&&(t.wires=o.wires.filter(s=>e(s,7)).slice(0,400)),Array.isArray(o.petals)&&(t.petals=o.petals.filter(s=>e(s,4)).slice(0,64)),Array.isArray(o.props)&&(t.props=o.props.filter(s=>s&&s.t==="bike"&&["x","y","z","r"].every(i=>typeof s[i]=="number"&&Number.isFinite(s[i]))).slice(0,64).map(s=>({t:"bike",x:s.x,y:s.y,z:s.z,r:s.r}))),o.train&&["x","y"].every(s=>typeof o.train[s]=="number"&&Number.isFinite(o.train[s]))&&(t.train={x:o.train.x,y:o.train.y,axis:"z"}),o.cat&&typeof o.cat.x=="number"&&typeof o.cat.z=="number"&&Number.isFinite(o.cat.x+o.cat.z)&&(t.cat={x:o.cat.x,z:o.cat.z}),o.spawn&&typeof o.spawn.x=="number"&&typeof o.spawn.z=="number"&&Number.isFinite(o.spawn.x+o.spawn.z)&&(t.spawn={x:o.spawn.x,z:o.spawn.z,yaw:Number.isFinite(o.spawn.yaw)?o.spawn.yaw:0}),o.landmarks&&typeof o.landmarks=="object")for(let[s,i]of Object.entries(o.landmarks))typeof s=="string"&&s.length<20&&e(i,6)&&(t.landmarks[s]=i);return t}function Vs(o){if(typeof o!="string")throw new Error("Not a MACHI save");if(o.length>Is)throw new Error("File too large (4 MB max)");let t;try{t=JSON.parse(o)}catch{throw new Error("Not valid JSON")}return t}function Oo(o,t){let e=o.W,s=o.H,i=o.D,a=-1,n=-1,r=-1;for(let p=0;p<o.H;p++)for(let m=0;m<o.D;m++)for(let v=0;v<o.W;v++)o.get(v,p,m)&&(e=Math.min(e,v),s=Math.min(s,p),i=Math.min(i,m),a=Math.max(a,v),n=Math.max(n,p),r=Math.max(r,m));let l=a-e+1,c=n-s+1,u=r-i+1,f=new Uint8Array(l*c*u);for(let p=0;p<c;p++)for(let m=0;m<u;m++)for(let v=0;v<l;v++)f[v+l*(m+u*p)]=o.get(e+v,s+p,i+m);return{name:t,w:l,h:c,d:u,data:f}}function Nt(o,t,e,s,i){let a=new it(t,e,s);return i((n,r,l,c)=>a.setRaw(n,r,l,M[c])),Oo(a,o)}function Ks(){let o=[];return o.push(Nt("Torii",17,13,1,t=>{for(let e of[5,11]){t(e,0,0,"black");for(let s=1;s<=9;s++)t(e,s,0,"vermilion")}for(let e=4;e<=12;e++)t(e,7,0,"vermilion"),t(e,9,0,"vermilion");t(8,8,0,"signboard");for(let e=2;e<=14;e++)t(e,10,0,"black");t(2,11,0,"black"),t(14,11,0,"black"),t(1,11,0,"slabwood"),t(15,11,0,"slabwood")})),o.push(Nt("Stone lantern",1,5,1,t=>{t(0,0,0,"stone"),t(0,1,0,"pole"),t(0,2,0,"stone"),t(0,3,0,"paperlamp"),t(0,4,0,"slabstone")})),o.push(Nt("Vending machine",2,4,1,t=>{for(let e of[0,1])t(e,0,0,"black"),t(e,1,0,"vendred"),t(e,2,0,"screen"),t(e,3,0,"konbini")})),o.push(Nt("Sakura tree",11,12,11,t=>{for(let e=0;e<6;e++)t(5,e,5,"bark");for(let e=-3;e<=3;e++)for(let s=-5;s<=5;s++)for(let i=-5;i<=5;i++)i*i+(e*1.5)**2+s*s<22&&i*7+e*13+s*5&7&&t(5+i,8+e,5+s,"sakura")})),o.push(Nt("Lantern string",1,1,9,t=>{for(let e=0;e<9;e+=2)t(0,0,e,e%4?"paperlamp":"lantern")})),o.push(Nt("Power pole",3,18,1,t=>{for(let e=0;e<18;e++)t(1,e,0,"pole");t(0,16,0,"steel"),t(1,16,0,"steel"),t(2,16,0,"steel"),t(1,10,0,"konbini")})),o.push(Nt("Planter",3,2,1,t=>{for(let e=0;e<3;e++)t(e,0,0,"wood"),t(e,1,0,e===1?"flowers":"fern")})),o}function js(o,t="neonpink",e=null){let s=Wt[o];if(!s)return null;let i=s.length,a=s[0].length,n=e?1:0,r=a+n*2,l=i+n*2,c=new Uint8Array(r*l);for(let u=0;u<l;u++)for(let f=0;f<r;f++){let p=u-n,m=f-n,v=p>=0&&m>=0&&p<i&&m<a&&s[p][m]==="#";c[f+r*(l-1-u)]=v?M[t]:e?M[e]:0}return{name:o,w:r,h:l,d:1,data:c}}var $s=[0,2,4,7,9],Re=class{constructor(){this.ctx=null,this.on=!0,this.streak=0,this.lastPop=-9,this.rainGain=null}ensure(){if(this.ctx||typeof window>"u")return this.ctx;let t=window.AudioContext||window.webkitAudioContext;if(!t)return null;try{this.ctx=new t}catch{return null}let e=this.ctx;this.master=e.createGain(),this.master.gain.value=this.on?.8:0,this.master.connect(e.destination),this.comp=e.createDynamicsCompressor(),this.comp.connect(this.master);let s=e.sampleRate*1.6,i=e.createBuffer(2,s,e.sampleRate);for(let l=0;l<2;l++){let c=i.getChannelData(l);for(let u=0;u<s;u++)c[u]=(Math.random()*2-1)*Math.pow(1-u/s,3)}this.verb=e.createConvolver(),this.verb.buffer=i,this.verbGain=e.createGain(),this.verbGain.gain.value=.25,this.verb.connect(this.verbGain),this.verbGain.connect(this.comp);let a=e.createBuffer(1,e.sampleRate*2,e.sampleRate),n=a.getChannelData(0),r=0;for(let l=0;l<n.length;l++){let c=Math.random()*2-1;r=(r+.02*c)/1.02,n[l]=c*.5+r*2}return this.noiseBuf=a,this.hum=this._loopNoise(180,.05),this.rainGain=this._loopNoise(2600,0,"bandpass",.6),this.trainGain=this._loopNoise(110,0),this.trainClack=0,this._padTimer=0,this._padStep=0,e}_loopNoise(t,e,s="lowpass",i=.7){let a=this.ctx,n=a.createBufferSource();n.buffer=this.noiseBuf,n.loop=!0;let r=a.createBiquadFilter();r.type=s,r.frequency.value=t,r.Q.value=i;let l=a.createGain();return l.gain.value=e,n.connect(r),r.connect(l),l.connect(this.comp),n.start(),l}resume(){let t=this.ensure();t&&t.state==="suspended"&&t.resume().catch(()=>{})}suspend(){this.ctx&&this.ctx.state==="running"&&this.ctx.suspend().catch(()=>{})}setOn(t){this.on=t,this.master&&this.master.gain.setTargetAtTime(t?.8:0,this.ctx.currentTime,.05)}_tone(t,e,{type:s="sine",gain:i=.2,attack:a=.004,slide:n=0,verb:r=.3,when:l=0}={}){let c=this.ctx;if(!c||!this.on)return;let u=c.currentTime+l,f=c.createOscillator(),p=c.createGain();if(f.type=s,f.frequency.setValueAtTime(t,u),n&&f.frequency.exponentialRampToValueAtTime(Math.max(30,t*n),u+e),p.gain.setValueAtTime(0,u),p.gain.linearRampToValueAtTime(i,u+a),p.gain.exponentialRampToValueAtTime(8e-4,u+e),f.connect(p),p.connect(this.comp),r){let m=c.createGain();m.gain.value=r,p.connect(m),m.connect(this.verb)}f.start(u),f.stop(u+e+.05)}_noise(t,e,s,i="bandpass",a=1.2){let n=this.ctx;if(!n||!this.on)return;let r=n.currentTime,l=n.createBufferSource();l.buffer=this.noiseBuf,l.playbackRate.value=.8+Math.random()*.4;let c=n.createBiquadFilter();c.type=i,c.frequency.value=e,c.Q.value=a;let u=n.createGain();u.gain.setValueAtTime(s,r),u.gain.exponentialRampToValueAtTime(8e-4,r+t),l.connect(c),c.connect(u),u.connect(this.comp),l.start(r,Math.random()),l.stop(r+t+.05)}pop(t){if(!this.ctx)return;this.streak=t-this.lastPop<1.2?this.streak+1:0,this.lastPop=t;let e=this.streak%15,s=$s[e%5]+12*Math.floor(e/5),i=392*Math.pow(2,s/12);this._tone(i,.16,{type:"sine",gain:.16,slide:1.02,verb:.35}),this._tone(i*2,.06,{type:"triangle",gain:.04,verb:0})}thud(){this._tone(150,.12,{type:"sine",gain:.18,slide:.5,verb:.1}),this._noise(.08,900,.08)}click(){this._tone(1200,.03,{type:"square",gain:.025,verb:0})}step(t){let e={stone:[1400,.07,.12],wood:[520,.09,.14],grass:[2600,.06,.05],gravel:[3200,.08,.09],metal:[2100,.07,.08],water:[800,.18,.1],glass:[2400,.05,.07],cloth:[1800,.05,.04]}[t]||[1400,.07,.1];this._noise(e[1],e[0],e[2],"bandpass",1.8),t==="wood"&&this._tone(140,.07,{gain:.05,verb:0}),t==="metal"&&this._tone(900,.05,{type:"triangle",gain:.02,verb:.1})}update(t,{rain:e=0,train:s=0,night:i=1}={}){let a=this.ctx;if(!a||a.state!=="running")return;let n=a.currentTime;if(this.rainGain.gain.setTargetAtTime(e*.22,n,.4),this.trainGain.gain.setTargetAtTime(s*.35,n,.2),this.hum.gain.setTargetAtTime(.035+.02*i,n,.5),s>.05&&(this.trainClack-=t,this.trainClack<=0&&(this.trainClack=.42,this._noise(.05,700,s*.12,"lowpass"),setTimeout(()=>this._noise(.05,650,s*.1,"lowpass"),110))),this._padTimer-=t,this._padTimer<=0&&this.on){this._padTimer=6+Math.random()*4;let r=[146.8,164.8,130.8,110],l=r[this._padStep++%r.length];for(let c of[0,7,12+$s[1+Math.floor(Math.random()*4)]])this._tone(l*Math.pow(2,c/12),7,{type:"sine",gain:.018,attack:2.5,verb:.8})}}dispose(){try{this.ctx&&this.ctx.close()}catch{}this.ctx=null}};var Ke="nc2:machi:",Ft=(o,t=null)=>{try{let e=localStorage.getItem(Ke+o);return e===null?t:JSON.parse(e)}catch{return t}},Gt=(o,t)=>{try{return localStorage.setItem(Ke+o,JSON.stringify(t)),!0}catch{return!1}},qo=o=>{try{localStorage.removeItem(Ke+o)}catch{}},Vo=()=>typeof window<"u"&&(navigator.maxTouchPoints>0||"ontouchstart"in window)&&window.matchMedia&&window.matchMedia("(pointer: coarse)").matches,nt=(o,t,e)=>Math.max(t,Math.min(e,o)),je=["place","remove","paint","pick","box","line","select","stamp"],Ve=["plaster","tile","wood","rooftile","glass","lantern","neonpink","neoncyan","sakura"].map(o=>M[o]),Xs=18.6,Ut={opening:{target:[50,8,50],yaw:.52,pitch:.6,dist:104},south:{target:[48,12,48],yaw:0,pitch:.42,dist:100},north:{target:[48,12,48],yaw:Math.PI,pitch:.42,dist:100},east:{target:[48,12,48],yaw:Math.PI/2,pitch:.42,dist:100},west:{target:[48,12,48],yaw:-Math.PI/2,pitch:.42,dist:100},top:{target:[48,4,48],yaw:0,pitch:1.45,dist:130},shotengai:{target:[44,6,46],yaw:-Math.PI/2,pitch:.36,dist:50},street:{walk:[7,46,60,12,45]},shrine:{walk:[14,31,9,13,11]},bridge:{walk:[31,67.5,44,4.5,75]},viaduct:{walk:[44,74.5,84,17,73]},konbini:{walk:[53,49,53,7,39]},canal:{walk:[43.5,74.5,4,0,74.5]}},Ce=class{constructor(t,e,{onExit:s}={}){for(this.canvas=t,this.stage=e,this.onExit=s,this.listeners=new Set,this.reduced=typeof window<"u"&&window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches,this.touch=Vo(),this.settings={quality:"auto",sound:!0,invertY:!1,sens:1,tilt:!0,...Ft("settings")||{}},this.renderer=new me(t,{quality:this.resolveQuality(),reduced:this.reduced}),this.audio=new Re,this.audio.on=this.settings.sound,this.stamps=Ks(),this.ui={mode:"build",tool:"place",slot:0,hotbar:(Ft("hotbar")||Ve).slice(0,9),mirrorX:!1,mirrorZ:!1,canUndo:!1,canRedo:!1,hour:Xs,drift:!0,cycle:!1,rain:!1,boxMode:"fill",boxH:0,selection:null,stamp:null,stampRot:0,locked:!1,coach:Ft("coach",0),toast:null,photo:!1,fov:60,tilt:.25,panel:null,hoverName:"",quality:this.renderer.qualityName,saving:!1,template:"tokyo"};this.ui.hotbar.length<9;)this.ui.hotbar.push(Ve[this.ui.hotbar.length]);this.ui.hotbar=this.ui.hotbar.map((n,r)=>q[n]&&!q[n].hidden?n:Ve[r]);let i=null,a=Ft("auto");if(a)try{i=_e(a),this.ui.template=a.template||"tokyo"}catch{i=null}i||(i=Oe()),this.world=i,this.editor=new Te(i),this.editor.onChange=()=>this._edited(),this.walker=new oe(i),this.renderer.setWorld(i),this.renderer.flush(),this.orbit={target:[...Ut.opening.target],yaw:Ut.opening.yaw,pitch:Ut.opening.pitch,dist:Ut.opening.dist*this._aspectK()},this.orbitGoal={...this.orbit,target:[...this.orbit.target]},this.sim={t:0,trainT:22,cat:null,petals:new Float32Array(600*3),petalV:new Float32Array(600*4),nPetals:0,wet:0,stepT:0},this._initCat(),this._initPetals(),this.keys=new Set,this.pointer={x:-1,y:-1,inside:!1},this.drag=null,this.touches=new Map,this.hit=null,this.paused=!1,this.hidden=!1,this.frameT=0,this.ft=16,this.slowT=0,this.fastT=0,this.raycaster=new hs,this._bind(),this._applyEnv(),this._last=performance.now(),this.running=!0,this._raf=requestAnimationFrame(n=>this._frame(n)),this._exposeHook()}resolveQuality(){let t=this.settings.quality;return Jt[t]?t:this.touch?"low":"balanced"}emit(){this._emitQueued||(this._emitQueued=!0,queueMicrotask(()=>{this._emitQueued=!1;for(let t of this.listeners)t()}))}subscribe(t){return this.listeners.add(t),()=>this.listeners.delete(t)}set(t){Object.assign(this.ui,t),this.emit()}toast(t,e=2200){this.ui.toast=t,this.emit(),clearTimeout(this._toastT),this._toastT=setTimeout(()=>{this.ui.toast=null,this.emit()},e)}_initCat(){let t=this.world.meta&&this.world.meta.cat;if(!t){this.sim.cat=null;return}let e=this._standY(t.x,t.z,h+2);this.sim.cat={home:[t.x,t.z],x:t.x+.5,y:e,z:t.z+.5,yaw:0,state:"sit",t:3,tx:t.x,tz:t.z,ty:e,hop:0,from:null,bob:0,phase:0}}_standY(t,e,s){let i=this.world;t=Math.floor(t),e=Math.floor(e);for(let a=Math.min(i.H-1,Math.floor(s)+1);a>=0;a--){let n=i.get(t,a,e);if(n&&St[n])return a+(ft[n]===1||ft[n]>=2&&ft[n]<=5?.5:1)}return 0}_catStep(t){let e=this.sim.cat;if(!e)return;let s=this.world;e.t-=t;let i=this._standY(e.x,e.z,e.y+.4);if(e.state!=="hop"&&i<e.y-.05&&(e.y=Math.max(i,e.y-10*t)),e.state!=="hop"&&i>e.y+.05&&i-e.y<1.1&&(e.y=i),e.state==="sit"&&e.t<=0){for(let a=0;a<12;a++){let n=Math.random()*Math.PI*2,r=3+Math.random()*8,l=nt(e.home[0]+Math.cos(n)*r,1,s.W-2),c=nt(e.home[1]+Math.sin(n)*r,1,s.D-2),u=this._standY(l,c,e.y+2);if(Math.abs(u-e.y)<=2&&s.get(Math.floor(l),Math.floor(u),Math.floor(c))!==M.water&&!s.get(Math.floor(l),Math.floor(u)+1,Math.floor(c))){Object.assign(e,{state:"walk",tx:l,tz:c,ty:u,t:8});break}}e.state==="sit"&&(e.t=2)}else if(e.state==="walk"){let a=e.tx-e.x,n=e.tz-e.z,r=Math.hypot(a,n),c=Math.atan2(a,n)-e.yaw;for(;c>Math.PI;)c-=Math.PI*2;for(;c<-Math.PI;)c+=Math.PI*2;if(e.yaw+=c*Math.min(1,t*6),r<.2||e.t<=0)Object.assign(e,{state:"sit",t:4+Math.random()*7});else{let u=2.2*t,f=e.x+a/r*u,p=e.z+n/r*u,m=this._standY(f,p,e.y+1.2),v=m-e.y>.6||s.get(Math.floor(f),Math.floor(m)+0,Math.floor(p))&&St[s.get(Math.floor(f),Math.floor(m),Math.floor(p))];m-e.y>.6&&m-e.y<=2.2?Object.assign(e,{state:"hop",from:[e.x,e.y,e.z],to:[f+a/r*.4,m,p+n/r*.4],hop:0,next:"walk"}):v||e.y-m>3?Object.assign(e,{state:"sit",t:2+Math.random()*3}):(e.x=f,e.z=p,e.phase+=t*10,e.bob=Math.abs(Math.sin(e.phase))*.06)}}else if(e.state==="hop"){e.hop+=t/.45;let a=Math.min(1,e.hop),[n,r,l]=e.from,[c,u,f]=e.to;e.x=n+(c-n)*a,e.z=l+(f-l)*a,e.y=r+(u-r)*a+Math.sin(a*Math.PI)*(1+Math.max(0,u-r)*.4),e.yaw=Math.atan2(c-n,f-l),a>=1&&(e.y=u,e.next==="sit"?Object.assign(e,{state:"sit",t:9+Math.random()*6}):Object.assign(e,{state:"walk",t:Math.max(e.t,2)}))}e.sit=e.state==="sit"}_catNotice(t,e,s){let i=this.sim.cat;if(!i||i.state==="hop"||Math.hypot(t+.5-i.x,s+.5-i.z)>9)return;let a=this._standY(t+.5,s+.5,this.world.H-1);a-i.y>8||this.world.get(t,Math.floor(a),s)||(Object.assign(i,{state:"hop",from:[i.x,i.y,i.z],to:[t+.5,a,s+.5],hop:-.6,next:"sit"}),i.hop=-.6)}_initPetals(){let t=this.world.meta||{};this.emitters=(t.petals||[]).filter(s=>this.world.get(s[0],s[1],s[2])===M.sakura||!0);let e=this.emitters.length?Math.floor(Jt[this.renderer.qualityName].petals*(this.reduced?.4:1)):0;this.sim.nPetals=e;for(let s=0;s<e;s++)this._spawnPetal(s,!0)}_spawnPetal(t,e=!1){let s=this.emitters[Math.random()*this.emitters.length|0],i=this.sim.petals,a=this.sim.petalV,n=Math.random()*Math.PI*2,r=Math.sqrt(Math.random())*s[3];i[t*3]=s[0]+.5+Math.cos(n)*r,i[t*3+2]=s[2]+.5+Math.sin(n)*r,i[t*3+1]=e?h+Math.random()*(s[1]-h):s[1]-s[3]*.3+Math.random()*2,a[t*4]=Math.random()*6.28,a[t*4+1]=.5+Math.random()*.6,a[t*4+2]=0,a[t*4+3]=0}_petalStep(t){let e=this.sim.petals,s=this.sim.petalV,i=this.world,a=this.sim.t,n=this.reduced?.5:1;for(let r=0;r<this.sim.nPetals;r++){if(s[r*4+3]>0){s[r*4+3]-=t,s[r*4+3]<=0&&this._spawnPetal(r);continue}let l=s[r*4]+a*s[r*4+1]*2;e[r*3]+=(Math.sin(l)*.9+.5)*t*n,e[r*3+2]+=Math.cos(l*.7)*.7*t*n,e[r*3+1]-=(.9+.4*Math.sin(l*1.3))*t*n;let c=Math.floor(e[r*3]),u=Math.floor(e[r*3+1]-.02),f=Math.floor(e[r*3+2]),p=i.get(c,u,f);u<0||p&&p!==M.sakura&&p!==M.leaves&&St[p]?s[r*4+3]=2+Math.random()*3:p===M.water&&(s[r*4+3]=1+Math.random())}}_trainState(){let t=this.world.meta;if(!t||!t.train||!this.renderer.train)return{on:!1};let e=48,s=16,i=this.sim.trainT%(e*2),a=i<e?0:1,n=i%e;if(n>s)return{on:!1};let r=this.renderer.train.len,l=this.world.D+2*150+r,c=a?-1:1,u=n/s*l,f=c>0?-150+u:this.world.D+150-u;return{on:!0,x:t.train.x,y:t.train.y,z:f,dir:c}}simTick(t){let e=this.sim;e.t+=t,e.trainT+=t;let s=this.ui;s.cycle?s.hour=(s.hour+t/30)%24:s.drift&&s.hour<21&&(s.hour=Math.min(21,s.hour+t/50)),e.wet+=((s.rain?1:0)-e.wet)*Math.min(1,t*.5),this._catStep(t),this._petalStep(t),s.mode==="walk"&&this._walkStep(t),this._cameraStep(t)}_walkStep(t){let e=this.keys,s=this.walker,i=(e.has("KeyW")||e.has("ArrowUp")?1:0)-(e.has("KeyS")||e.has("ArrowDown")?1:0),a=(e.has("KeyD")||e.has("ArrowRight")?1:0)-(e.has("KeyA")||e.has("ArrowLeft")?1:0);this.stick&&(i+=-this.stick.y,a+=this.stick.x);let n=this._jumpPressed;if(this._jumpPressed=!1,s.step(t,{fwd:i,strafe:a,jump:e.has("Space")||!!this.touchJump,jumpPressed:n,sprint:e.has("ShiftLeft")||e.has("ShiftRight")||this.stick&&Math.hypot(this.stick.x,this.stick.y)>.95,down:e.has("KeyC")||e.has("ControlLeft")}),s.stepAcc>2.6){s.stepAcc=0;let r=this.world.get(Math.floor(s.pos[0]),Math.floor(s.pos[1]-.1),Math.floor(s.pos[2]));this.audio.step(s.inWater?"water":r?q[r].sound:"stone")}}setMode(t){if(t!==this.ui.mode){if(t==="walk"){let e=this.world.meta&&this.world.meta.spawn||{x:this.world.W/2,z:this.world.D/2,yaw:0},[s,,i]=this.orbit.target;this.walker.spawn(s,i,this.orbit.yaw),this.walker.pos[1]>h+6&&this.walker.spawn(e.x,e.z,e.yaw),this.walker.yaw=this.orbit.yaw,this.walker.pitch=-.05,this.ui.mode="walk",this.ui.coach===2&&this._coachNext(),["place","remove"].includes(this.ui.tool)||(this.ui.tool="place"),this.renderer.setGhost(null),this.renderer.setStampGhost(null),this.touch||this.requestLock()}else{if(this.ui.mode="build",document.pointerLockElement)try{document.exitPointerLock()}catch{}let e=this.walker.eye();this.orbitGoal.target=[e[0],Math.max(h,e[1]-2),e[2]],this.orbitGoal.yaw=this.walker.yaw,this.orbitGoal.dist=Math.max(40,this.orbitGoal.dist),this.orbitGoal.pitch=Math.max(.35,this.orbitGoal.pitch)}this.camera(null),this.emit()}}requestLock(){try{let t=this.canvas.requestPointerLock&&this.canvas.requestPointerLock();t&&t.catch&&t.catch(()=>{})}catch{}}_cameraStep(t){let e=this.renderer.camera;if(this.ui.mode==="walk"){let f=this.walker.eye();e.position.set(f[0],f[1],f[2]),e.rotation.order="YXZ",e.rotation.set(this.walker.pitch,this.walker.yaw,0);let p=this.ui.photo?this.ui.fov:72;e.fov!==p&&(e.fov=p,e.updateProjectionMatrix());return}let s=this.keys,i=this.orbitGoal,a=(s.has("KeyW")?1:0)-(s.has("KeyS")?1:0),n=(s.has("KeyD")?1:0)-(s.has("KeyA")?1:0);if(a||n){let f=Math.sin(i.yaw),p=Math.cos(i.yaw),m=t*(20+i.dist*.4);i.target[0]+=(-f*a+p*n)*m,i.target[2]+=(-p*a-f*n)*m}s.has("ArrowLeft")&&(i.yaw-=t*1.4),s.has("ArrowRight")&&(i.yaw+=t*1.4),s.has("ArrowUp")&&(i.pitch+=t),s.has("ArrowDown")&&(i.pitch-=t),(s.has("Equal")||s.has("NumpadAdd"))&&(i.dist*=1-t*1.5),(s.has("Minus")||s.has("NumpadSubtract"))&&(i.dist*=1+t*1.5),i.pitch=nt(i.pitch,.06,1.48),i.dist=nt(i.dist,10,240),i.target[0]=nt(i.target[0],-16,this.world.W+16),i.target[2]=nt(i.target[2],-16,this.world.D+16),i.target[1]=nt(i.target[1],0,this.world.H);let r=this.orbit,l=this.reduced?1:1-Math.exp(-t*12);r.yaw+=(i.yaw-r.yaw)*l,r.pitch+=(i.pitch-r.pitch)*l,r.dist+=(i.dist-r.dist)*l;for(let f=0;f<3;f++)r.target[f]+=(i.target[f]-r.target[f])*l;let c=Math.cos(r.pitch);e.position.set(r.target[0]+Math.sin(r.yaw)*c*r.dist,r.target[1]+Math.sin(r.pitch)*r.dist,r.target[2]+Math.cos(r.yaw)*c*r.dist),e.lookAt(r.target[0],r.target[1],r.target[2]);let u=this.ui.photo?this.ui.fov:45;e.fov!==u&&(e.fov=u,e.updateProjectionMatrix())}_aspectK(){let t=this.stage.getBoundingClientRect(),e=t.width/Math.max(1,t.height);return nt(1.45/e,1,2.1)}camera(t){if(t&&Ut[t]){let s=Ut[t];if(s.walk){this.ui.mode!=="walk"&&(this.ui.mode="walk",this.renderer.setGhost(null));let[i,a,n,r,l]=s.walk;this.walker.spawn(i,a,0);let c=this.walker.eye();this.walker.yaw=Math.atan2(-(n-i),-(l-a)),this.walker.pitch=Math.atan2(r-c[1],Math.hypot(n-i,l-a))}else{this.ui.mode!=="build"&&(this.ui.mode="build");let i=s.dist*this._aspectK();this.orbitGoal={target:[...s.target],yaw:s.yaw,pitch:s.pitch,dist:i},this.orbit={target:[...s.target],yaw:s.yaw,pitch:s.pitch,dist:i}}this._cameraStep(0),this.emit()}let e=this.renderer.camera;return{mode:this.ui.mode,pos:e.position.toArray(),yaw:this.ui.mode==="walk"?this.walker.yaw:this.orbit.yaw}}_ray(t,e){let s=this.stage.getBoundingClientRect(),i=new wt(t/s.width*2-1,-(e/s.height)*2+1);return this.raycaster.setFromCamera(i,this.renderer.camera),this.raycaster.ray}pick(t,e){let s=this.ui.mode==="walk",i=s?{origin:this.renderer.camera.position,direction:this.renderer.camera.getWorldDirection(new X)}:this._ray(t,e),a=i.origin,n=i.direction;return this.world.raycast(a.x,a.y,a.z,n.x,n.y,n.z,s?11:400)}_placeCell(t){return t.ground?[t.x,0,t.z]:[t.x+t.nx,t.y+t.ny,t.z+t.nz]}_selectedId(){let t=this.ui.hotbar[this.ui.slot],e=q[t];if(e&&e.base){let s=this.ui.mode==="walk"?this.walker.yaw:this.orbit.yaw,i=-Math.sin(s),a=-Math.cos(s),n=Math.abs(i)>Math.abs(a)?i>0?"E":"W":a>0?"S":"N";t=ps(e.base,n)}return t}_canPlaceAt(t,e,s){return!(!this.world.inside(t,e,s)||this.ui.mode==="walk"&&St[this._selectedId()]&&Ws(t,e,s,this.walker.box()))}applyTool(t,e,s={}){if(!e)return!1;let i=this.editor,a=this.sim.t;if(t==="place"){let[n,r,l]=this._placeCell(e);if(!this._canPlaceAt(n,r,l))return!1;let c=this._selectedId();if(i.place(n,r,l,c))return this.audio.pop(a),this._catNotice(n,r,l),this.ui.coach===0&&this._coachNext(),!0}else if(t==="remove"){if(e.ground)return!1;if(i.remove(e.x,e.y,e.z))return this.audio.thud(),this.ui.coach===1&&this._coachNext(),!0}else if(t==="paint"){if(e.ground)return!1;if(i.place(e.x,e.y,e.z,this._selectedId()))return this.audio.pop(a),!0}else if(t==="pick"){if(e.ground||!e.id)return!1;let n=e.id,r=q[n];if(r.base&&(n=M[r.base+"N"]),r.hidden&&!r.base)return!1;let l=this.ui.hotbar.slice(),c=l.indexOf(n);return c>=0?this.ui.slot=c:l[this.ui.slot]=n,this.ui.hotbar=l,Gt("hotbar",l),this.audio.click(),s.keepTool||(this.ui.tool="place"),this.toast(q[n].name,1200),this.emit(),!0}else if(t==="stamp"){let n=this._stampFor(e);if(!n)return!1;let[r,l,c]=this._placeCell(e);if(i.stamp(n.st,r,l,c,n.rot))return this.audio.pop(a),this._catNotice(r,l,c),!0}return!1}_stampFor(t){let e=this.ui.stamp;if(!e)return null;let s=this.ui.stampRot;return e.d===1&&e.letter&&t&&!t.ground&&t.ny===0&&(s=t.nz>0?0:t.nx<0?1:t.nz<0?2:3),{st:e,rot:s}}_shapeCells(t,e){let s=this.ui.boxH,i=[Math.min(t[0],e[0]),Math.min(t[1],e[1]),Math.min(t[2],e[2]),Math.max(t[0],e[0]),Math.max(t[1],e[1]),Math.max(t[2],e[2])];return s>0?i[4]+=s:s<0&&(i[1]+=s),i}_commitShape(t,e,s){let i=this.editor,a=this._shapeCells(e,s),n=0;if(t==="box")n=i.box([a[0],a[1],a[2]],[a[3],a[4],a[5]],this.ui.boxMode==="clear"?0:this._selectedId());else if(t==="line")n=i.line(e,s,this.ui.boxMode==="clear"?0:this._selectedId(),1+Math.max(0,this.ui.boxH));else if(t==="select"){this.ui.selection=a,this.emit();return}n&&(this.ui.boxMode==="clear"?this.audio.thud():(this.audio.pop(this.sim.t),this._catNotice(s[0],s[1],s[2])),this.toast(`${n} ${n===1?"block":"blocks"}`,1e3))}shapeAnchor(t,e){return t?this.ui.boxMode==="clear"&&e!=="select"||e==="select"&&!t.ground?[t.x,Math.max(0,t.y),t.z]:this._placeCell(t):null}copySelection(){let t=this.ui.selection;if(!t)return;let e=this.editor.copy([t[0],t[1],t[2]],[t[3],t[4],t[5]],"Clipboard");this.clipboard=e,this.set({stamp:e,stampRot:0,tool:"stamp",selection:null}),this.renderer.setGhost(null),this.toast("Copied. Click to paste, R to rotate",2600)}clearSelection(){let t=this.ui.selection;t&&(this.editor.box([t[0],t[1],t[2]],[t[3],t[4],t[5]],0),this.audio.thud(),this.set({selection:null}),this.renderer.setGhost(null))}fillSelection(){let t=this.ui.selection;t&&(this.editor.box([t[0],t[1],t[2]],[t[3],t[4],t[5]],this._selectedId()),this.audio.pop(this.sim.t),this.set({selection:null}),this.renderer.setGhost(null))}setTool(t){je.includes(t)&&(t==="stamp"&&!this.ui.stamp&&(this.ui.stamp=this.stamps[0]),this.ui.tool=t,this.drag=null,t!=="select"&&(this.ui.selection=null),this.renderer.setGhost(null),this.renderer.setStampGhost(null),this.audio.click(),this.emit())}setStamp(t){this.ui.stamp=t,this.ui.stampRot=0,this.ui.tool="stamp",this.emit()}letter(t,e){let s=js(t,e,null);s&&(s.letter=!0,this.setStamp(s))}undo(){this.editor.undo()&&(this.audio.click(),this.toast("Undo",700))}redo(){this.editor.redo()&&(this.audio.click(),this.toast("Redo",700))}_edited(){this.ui.canUndo=this.editor.canUndo,this.ui.canRedo=this.editor.canRedo,this._dirtySave=!0,this._saveT=performance.now(),clearTimeout(this._autoT),this._autoT=setTimeout(()=>{this._dirtySave&&this.running&&this.autosave()},2e3),this.emit()}autosave(){let t=Ee(this.world,{template:this.ui.template,saved:Date.now()});return Gt("auto",t)?(this._dirtySave=!1,!0):(this.toast("Browser storage is full. Use Export to keep your build.",4e3),!1)}slots(){return[1,2,3].map(t=>{let e=Ft("slot"+t);return e?{i:t,name:e.name||`Slot ${t}`,saved:e.saved||0}:{i:t,empty:!0}})}saveSlot(t,e){let s=Ee(this.world,{template:this.ui.template,saved:Date.now(),name:(e||`Slot ${t}`).slice(0,32)});Gt("slot"+t,s)?this.toast(`Saved to ${s.name}`):this.toast("Browser storage is full. Use Export instead.",4e3),this.emit()}loadSlot(t){let e=Ft("slot"+t);if(e)try{this._load(_e(e)),this.ui.template=e.template||"tokyo",this.toast(`Loaded ${e.name||"slot "+t}`)}catch{this.toast("That save could not be read")}}deleteSlot(t){qo("slot"+t),this.emit()}exportJSON(){return JSON.stringify(Ee(this.world,{template:this.ui.template,saved:Date.now(),name:"MACHI export"}))}importJSON(t){try{let e=_e(Vs(t));if(e.W!==this.world.W||e.H!==this.world.H||e.D!==this.world.D){let s=new this.world.constructor(this.world.W,this.world.H,this.world.D);for(let i=0;i<Math.min(e.H,s.H);i++)for(let a=0;a<Math.min(e.D,s.D);a++)for(let n=0;n<Math.min(e.W,s.W);n++)s.setRaw(n,i,a,e.get(n,i,a));s.meta=e.meta,s.relight(),this._load(s)}else this._load(e);return this.toast("Imported"),!0}catch(e){return this.toast(`Import failed: ${e.message}`,3500),!1}}newWorld(t){let e=ge[t];e&&(this._load(e.make()),this.ui.template=t,t==="tokyo"&&(this.camera("opening"),this.ui.hour=Xs,this.ui.drift=!0),this.toast(t==="tokyo"?"Back to the Tokyo corner":e.name),this.autosave())}_load(t){if(this.world=t,this.editor.setWorld(t),this.walker.world=t,this.walker=Object.assign(new oe(t),{}),this.renderer.setWorld(t),this.renderer.flush(),this._initCat(),this._initPetals(),this.ui.selection=null,this.ui.canUndo=!1,this.ui.canRedo=!1,this.ui.mode==="walk"){let e=t.meta&&t.meta.spawn||{x:48,z:48,yaw:0};this.walker.spawn(e.x,e.z,e.yaw)}this.emit()}saveSettings(t){Object.assign(this.settings,t),Gt("settings",this.settings),"sound"in t&&this.audio.setOn(t.sound),"quality"in t&&(this.renderer.setQuality(this.resolveQuality()),this.ui.quality=this.renderer.qualityName,this._initPetals()),this.emit()}_coachNext(){this.ui.coach=Math.min(3,(this.ui.coach|0)+1),Gt("coach",this.ui.coach),this.emit()}skipCoach(){this.ui.coach=3,Gt("coach",3),this.emit()}_applyEnv(){let t=Rs(this.ui.hour);this.renderer.setEnv(t),this.renderer.U.uWet.value=this.sim.wet,this.renderer.U.uTime.value=this.sim.t,this.env=t}_frame(t){if(!this.running)return;this._raf=requestAnimationFrame(n=>this._frame(n));let e=Math.min(.1,(t-this._last)/1e3);if(this._last=t,this.hidden||this.paused||this.frozen)return;this.frameT+=e;let s=1/60,i=(this._acc||0)+e,a=0;for(;i>=s&&a<6;)this.simTick(s),i-=s,a++;this._acc=i,this.draw(e),this._govern(e),this._dirtySave&&performance.now()-this._saveT>2e3&&this.autosave()}draw(t=1/60,e=!1){let s=this.renderer;this._applyEnv();let i=this.hit?[this.hit.x,this.hit.y,this.hit.z]:this.ui.mode==="walk"?this.walker.pos:this.orbit.target;s.processDirty(e?1e9:5,i),(s.wiresDirty||this.world.version!==this._wv)&&(s.world.dirty.some(c=>c)||(s._buildWires(),s._refreshEntityLight(),this._wv=this.world.version)),s.setTrain(this._trainState()),this.sim.cat&&s.setCat(this.sim.cat),s.setPetals(this.sim.petals,this.sim.nPetals),s.setRain(this.sim.wet>.05,Math.min(1,this.sim.wet*1.2)),this._updateHover();let a=this._trainState(),n=0;if(a.on){let c=s.camera.position,u=Math.max(0,Math.abs(c.z-(a.z-a.dir*s.train.len/2))-s.train.len/2);n=nt(1-Math.hypot(c.x-a.x,c.y-a.y,u)/160,0,1)}this.audio.update(t,{rain:this.sim.wet,train:n,night:this.env.night});let r=this.ui,l=this.settings.tilt&&r.mode==="build"&&!this.touch?r.photo?r.tilt:.45:r.photo?r.tilt:0;s.render({tilt:l,focus:.55,bloom:.8,vignette:r.photo?.4:.28,fog:r.mode==="walk"?.0042:.0026})}_govern(t){if(this.settings.quality==="auto"&&(this.ft=this.ft*.95+t*1e3*.05,this.ft>24?this.slowT+=t:this.slowT=Math.max(0,this.slowT-t),this.slowT>2.5)){this.slowT=0;let e=this.renderer;(e.pixelScale||1)>.55?(e.pixelScale=(e.pixelScale||1)*.8,e.resize(e.size[0],e.size[1],!0)):e.qualityName==="high"?e.setQuality("balanced"):e.qualityName==="balanced"&&(e.setQuality("low"),this._initPetals()),this.ui.quality=e.qualityName,this.emit()}}_updateHover(){let t=this.ui,e=this.renderer;if(t.photo){e.setHover(null),e.setStampGhost(null),this.hit=null;return}let s=null;t.mode==="walk"?s=this.pick():this.pointer.inside&&!this.touch&&!(this.drag&&this.drag.kind!=="shape")?s=this.pick(this.pointer.x,this.pointer.y):this.touch&&this.drag&&this.drag.kind==="shape"&&(s=this.drag.lastHit),this.hit=s;let i=s&&!s.ground?q[s.id].name:"";i!==t.hoverName&&(t.hoverName=i,this.emit());let a=t.mode==="walk"?"place":t.tool;if(e.subtle=t.mode==="walk",a==="stamp"&&s&&t.stamp){let n=this._stampFor(s),r=this._rotCache&&this._rotCache.src===n.st&&this._rotCache.rot===n.rot?this._rotCache.out:(this._rotCache={src:n.st,rot:n.rot,out:qe(n.st,n.rot)}).out,[l,c,u]=this._placeCell(s);e.setStampGhost(r,[l-Math.floor(r.w/2),c,u-Math.floor(r.d/2)]),e.setHover(s,"place");return}if(e.setStampGhost(null),this.drag&&this.drag.kind==="shape"){let n=this.shapeAnchor(s,t.tool)||this.drag.b;if(n&&(this.drag.b=n),t.tool==="line"){let r=this.drag.a,l=this.drag.b;e.setGhost([Math.min(r[0],l[0]),Math.min(r[1],l[1]),Math.min(r[2],l[2]),Math.max(r[0],l[0]),Math.max(r[1],l[1])+Math.max(0,t.boxH),Math.max(r[2],l[2])],t.boxMode)}else e.setGhost(this._shapeCells(this.drag.a,this.drag.b),t.tool==="select"?"select":t.boxMode)}else t.selection?e.setGhost(t.selection,"select"):e.setGhost(null);if(!s){e.setHover(null);return}if(a==="place"||["box","line"].includes(a)&&t.boxMode==="fill"){let[n,r,l]=this._placeCell(s);e.setHover(s.ground?{...s,y:-1}:s,"place"),e.hover.position.set(n+.5,r+.5,l+.5)}else e.setHover(s,a==="box"||a==="line"?"remove":a)}_bind(){let t=this.canvas,e=this.stage,s=(a,n,r,l)=>{a.addEventListener(n,r,l),(this._unbind||(this._unbind=[])).push(()=>a.removeEventListener(n,r,l))};s(t,"pointerdown",a=>this._down(a)),s(window,"pointermove",a=>this._move(a)),s(window,"pointerup",a=>this._up(a)),s(window,"pointercancel",a=>this._up(a,!0)),s(t,"pointerleave",()=>{this.pointer.inside=!1}),s(t,"wheel",a=>this._wheel(a),{passive:!1}),s(t,"contextmenu",a=>a.preventDefault()),s(window,"keydown",a=>this._key(a,!0)),s(window,"keyup",a=>this._key(a,!1)),s(window,"blur",()=>this.keys.clear()),s(document,"visibilitychange",()=>{this.hidden=document.hidden,this.hidden?(this.audio.suspend(),this._dirtySave&&this.autosave()):(this._last=performance.now(),this.audio.resume())}),s(window,"pagehide",()=>{this._dirtySave&&this.autosave()}),s(document,"pointerlockchange",()=>{this.ui.locked=document.pointerLockElement===t,this.emit()}),this._ro=new ResizeObserver(()=>{let a=e.getBoundingClientRect();this.renderer.resize(a.width,a.height)}),this._ro.observe(e);let i=e.getBoundingClientRect();this.renderer.resize(i.width,i.height)}_local(t){let e=this.stage.getBoundingClientRect();return[t.clientX-e.left,t.clientY-e.top]}_down(t){this.audio.resume(),this.ui.photo;let[e,s]=this._local(t);this.pointer={x:e,y:s,inside:!0};try{this.canvas.setPointerCapture(t.pointerId)}catch{}if(t.pointerType==="touch")return this._touchDown(t,e,s);if(this.ui.mode==="walk"){if(!this.ui.locked){this.requestLock();return}let a=this.pick();t.button===0?this.applyTool("place",a):t.button===2?this.applyTool("remove",a):t.button===1&&this.applyTool("pick",a,{keepTool:!0});return}let i=this.ui.tool;if(t.button===0&&["box","line","select"].includes(i)&&!t.altKey&&!this.ui.photo){let a=this.pick(e,s);if(a){let n=this.shapeAnchor(a,i);this.drag={kind:"shape",a:n,b:n,x:e,y:s,id:t.pointerId};return}}this.drag={kind:t.button===0&&!t.shiftKey?"orbit":"pan",x:e,y:s,sx:e,sy:s,moved:!1,button:t.button,id:t.pointerId,t:performance.now()}}_move(t){let[e,s]=this._local(t);if(t.pointerType==="touch")return this._touchMove(t,e,s);if(this.ui.mode==="walk"){if(this.ui.locked){let l=.0024*this.settings.sens;this.walker.yaw-=t.movementX*l,this.walker.pitch=nt(this.walker.pitch-t.movementY*l*(this.settings.invertY?-1:1),-1.5,1.5)}return}let i=this.stage.getBoundingClientRect();this.pointer={x:e,y:s,inside:e>=0&&s>=0&&e<=i.width&&s<=i.height};let a=this.drag;if(!a||a.kind==="shape")return;let n=e-a.x,r=s-a.y;a.x=e,a.y=s,Math.hypot(e-a.sx,s-a.sy)>5&&(a.moved=!0),a.moved&&this._orbitDrag(a.kind,n,r)}_orbitDrag(t,e,s){let i=this.orbitGoal,a=this.settings.sens;if(t==="orbit")i.yaw-=e*.0058*a,i.pitch=nt(i.pitch+s*.0046*a*(this.settings.invertY?-1:1),.06,1.48);else{let n=i.dist*.0016,r=Math.sin(i.yaw),l=Math.cos(i.yaw);i.target[0]+=(-l*e-r*s)*n,i.target[2]+=(r*e-l*s)*n}}_up(t,e=!1){let[s,i]=this._local(t);if(t.pointerType==="touch")return this._touchUp(t,s,i,e);let a=this.drag;if(this.drag=null,!(!a||e||this.ui.mode==="walk")){if(a.kind==="shape"){a.a&&a.b&&this._commitShape(this.ui.tool,a.a,a.b);return}if(!a.moved&&!this.ui.photo){let n=this.pick(s,i);a.button===0?this.applyTool(this.ui.tool,n):a.button===2?this.applyTool("remove",n):a.button===1&&this.applyTool("pick",n)}}}_wheel(t){if(t.preventDefault(),t.altKey||this.ui.mode==="walk"){let s=this.ui.hotbar.length;this.ui.slot=(this.ui.slot+(t.deltaY>0?1:s-1))%s,this.emit();return}if(this.drag&&this.drag.kind==="shape"){this.ui.boxH=nt(this.ui.boxH+(t.deltaY<0?1:-1),-30,40),this.emit();return}let e=this.orbitGoal;e.dist=nt(e.dist*Math.exp(t.deltaY*.0012),10,240)}_key(t,e){let s=t.target;if(s&&(s.tagName==="INPUT"||s.tagName==="TEXTAREA"||s.isContentEditable))return;let i=t.code;if(!e){this.keys.delete(i);return}this.audio.resume(),i==="Space"&&!t.repeat&&(this._jumpPressed=!0),this.keys.add(i);let a=t.ctrlKey||t.metaKey;if(a&&i==="KeyZ"){t.preventDefault(),t.shiftKey?this.redo():this.undo();return}if(a&&i==="KeyY"){t.preventDefault(),this.redo();return}if(a&&i==="KeyC"){this.ui.selection&&(t.preventDefault(),this.copySelection());return}if(a&&i==="KeyV"){this.clipboard&&(t.preventDefault(),this.setStamp(this.clipboard));return}if(a)return;if(i==="Tab"){t.preventDefault(),this.setMode(this.ui.mode==="walk"?"build":"walk");return}if(i==="Escape"){this.ui.panel?this.set({panel:null}):this.ui.photo?this.set({photo:!1}):this.ui.selection?(this.set({selection:null}),this.renderer.setGhost(null)):(this.ui.mode!=="walk"||!this.ui.locked)&&this.set({panel:"menu"});return}if(t.repeat)return;let n=/^Digit([1-9])$/.exec(i);if(n){this.ui.slot=+n[1]-1,this.emit();return}if(i==="KeyE"){this.set({panel:this.ui.panel==="palette"?null:"palette"}),document.pointerLockElement&&document.exitPointerLock();return}if(i==="Slash"||i==="KeyH"){this.set({panel:this.ui.panel==="help"?null:"help"});return}if(i==="KeyO"){this.set({photo:!this.ui.photo,panel:null});return}if(this.ui.mode!=="build")return;if(t.shiftKey&&i==="KeyX"){this.editor.mirrorX=!this.editor.mirrorX,this.set({mirrorX:this.editor.mirrorX});return}if(t.shiftKey&&i==="KeyZ"){this.editor.mirrorZ=!this.editor.mirrorZ,this.set({mirrorZ:this.editor.mirrorZ});return}let r={KeyP:"place",KeyX:"remove",KeyC:"paint",KeyI:"pick",KeyB:"box",KeyL:"line",KeyM:"select",KeyT:"stamp"};if(r[i]){this.setTool(r[i]);return}if(i==="KeyR"){this.set({stampRot:(this.ui.stampRot+1)%4});return}if(i==="KeyF"){this.set({boxMode:this.ui.boxMode==="fill"?"clear":"fill"});return}if(i==="Delete"||i==="Backspace"){this.ui.selection&&this.clearSelection();return}}_touchDown(t,e,s){if(this.touches.set(t.pointerId,{x:e,y:s,sx:e,sy:s,t:performance.now()}),this.ui.mode!=="walk")if(this.touches.size===1){let i=this.ui.tool;this.drag={kind:"touch",id:t.pointerId,moved:!1,t:performance.now(),sx:e,sy:s,x:e,y:s},clearTimeout(this._lp),this.ui.photo||(this._lp=setTimeout(()=>{let a=this.drag;if(a&&a.kind==="touch"&&!a.moved){a.done=!0;let n=this.pick(a.sx,a.sy);if(["box","line","select"].includes(i))this.shapeTap(n,!0);else if(this.applyTool("remove",n))try{navigator.vibrate&&navigator.vibrate(12)}catch{}}},480))}else clearTimeout(this._lp),this.drag&&(this.drag.moved=!0),this._pinch=null}_touchMove(t,e,s){let i=this.touches.get(t.pointerId);if(!i)return;let a=e-i.x,n=s-i.y;if(i.x=e,i.y=s,this.ui.mode==="walk"){if(this.lookId===t.pointerId){let r=.005*this.settings.sens;this.walker.yaw-=a*r,this.walker.pitch=nt(this.walker.pitch-n*r*(this.settings.invertY?-1:1),-1.4,1.4)}return}if(this.touches.size===1){let r=this.drag;if(!r)return;Math.hypot(e-r.sx,s-r.sy)>9&&(r.moved=!0,clearTimeout(this._lp)),r.moved&&this._orbitDrag("orbit",a*1.2,n*1.2)}else if(this.touches.size===2){let[r,l]=[...this.touches.values()],c=[(r.x+l.x)/2,(r.y+l.y)/2],u=Math.hypot(r.x-l.x,r.y-l.y);if(this._pinch){this._orbitDrag("pan",c[0]-this._pinch.mid[0],c[1]-this._pinch.mid[1]);let f=this.orbitGoal;f.dist=nt(f.dist*this._pinch.dist/Math.max(20,u),10,240)}this._pinch={mid:c,dist:u}}}_touchUp(t,e,s,i){let a=this.touches.get(t.pointerId);this.touches.delete(t.pointerId),this.lookId===t.pointerId&&(this.lookId=null),this.touches.size<2&&(this._pinch=null);let n=this.drag;if(!n||n.id!==t.pointerId||(clearTimeout(this._lp),this.drag=null,i||n.moved||n.done||this.ui.mode==="walk"||this.ui.photo))return;let r=this.pick(e,s);["box","line","select"].includes(this.ui.tool)?this.shapeTap(r):this.applyTool(this.ui.tool,r)}shapeTap(t){if(!t)return;let e=this.ui.tool,s=this.shapeAnchor(t,e);if(!this._shapeA)this._shapeA=s,this.renderer.setGhost([...s,...s],e==="select"?"select":this.ui.boxMode),this.toast("Now tap the opposite corner",1600);else{let i=this._shapeA;this._shapeA=null,this._commitShape(e,i,s),this.renderer.setGhost(null)}}get pendingCorner(){return!!this._shapeA}_exposeHook(){let t=this;window.__game={id:"machi",state:()=>({mode:t.ui.mode,tool:t.ui.tool,hour:+t.ui.hour.toFixed(2),slot:t.ui.slot,hotbar:t.ui.hotbar.map(e=>q[e].key),walker:{pos:t.walker.pos.map(e=>+e.toFixed(3)),onGround:t.walker.onGround,fly:t.walker.fly},cat:t.sim.cat&&{x:+t.sim.cat.x.toFixed(2),y:+t.sim.cat.y.toFixed(2),z:+t.sim.cat.z.toFixed(2),state:t.sim.cat.state},train:t._trainState(),undo:t.editor.undoStack.length,redo:t.editor.redoStack.length,quality:t.renderer.qualityName,stats:{...t.renderer.stats},dirty:t.world.dirty.reduce((e,s)=>e+s,0),coach:t.ui.coach,rain:t.ui.rain,petals:t.sim.nPetals}),advance(e){let s=.016666666666666666,i=Math.round(e/s);for(let a=0;a<i;a++)t.simTick(s);return t.draw(s,!0),this.state()},pause(){t.frozen=!0},resume(){t.frozen=!1,t._last=performance.now()},input:{key:(e,s=!0)=>t._key({code:e,target:null,preventDefault(){},ctrlKey:!1,metaKey:!1,shiftKey:!1,repeat:!1},s),keys:t.keys,stick:(e,s)=>{t.stick=e===null?null:{x:e,y:s}}},reset(){return t.newWorld("tokyo"),this.state()},template:e=>t.newWorld(e),setMode:e=>{if(t.setMode(e),e==="walk")try{document.exitPointerLock()}catch{}return t.ui.mode},place:(e,s,i,a)=>{let n=typeof a=="string"?M[a]:a;return t.editor.place(e,s,i,n)},remove:(e,s,i)=>t.editor.remove(e,s,i),box:(e,s,i)=>t.editor.box(e,s,typeof i=="string"?M[i]:i),get:(e,s,i)=>q[t.world.get(e,s,i)].key,camera:e=>t.camera(e),orbit:(e,s,i,a)=>{let n={yaw:e,pitch:s,dist:i,target:a||t.orbitGoal.target};t.orbit={...n,target:[...n.target]},t.orbitGoal={...n,target:[...n.target]},t._cameraStep(0)},look:(e,s)=>{t.walker.yaw=e,t.walker.pitch=s},walkTo:(e,s,i=t.walker.yaw,a=0)=>{t.setMode("walk"),t.walker.spawn(e,s,i),t.walker.pitch=a},setTime:(e,s=!1)=>{t.ui.hour=e,t.ui.drift=s,t.ui.cycle=!1,t.emit()},setRain:e=>{t.ui.rain=e,t.sim.wet=e?1:0,t.emit()},setTool:e=>t.setTool(e),setSlot:e=>{t.ui.slot=e,t.emit()},ui:e=>(e&&t.set(e),{...t.ui}),pickAt:(e,s)=>t.pick(e,s),hover:(e,s)=>(t.pointer={x:e,y:s,inside:!0},t._updateHover(),t.hit),shape:(e,s)=>{t.drag={kind:"shape",a:e,b:s},t._updateHover()},endShape:(e=!0)=>{let s=t.drag;t.drag=null,e&&s&&t._commitShape(t.ui.tool,s.a,s.b),t.renderer.setGhost(null)},trainAt:e=>{t.sim.trainT=e},catTo:(e,s)=>{t.sim.cat&&(t.sim.cat.x=e,t.sim.cat.z=s,t.sim.cat.y=t._standY(e,s,40))},quality:e=>(e&&t.saveSettings({quality:e}),t.renderer.qualityName),stats:()=>({...t.renderer.stats}),screenshot:()=>t.renderer.screenshot(),world:()=>t.world,renderer:()=>t.renderer}}dispose(){if(this.running=!1,cancelAnimationFrame(this._raf),this._dirtySave&&this.autosave(),clearTimeout(this._toastT),clearTimeout(this._lp),clearTimeout(this._autoT),this._unbind&&this._unbind.forEach(t=>t()),this._ro&&this._ro.disconnect(),document.pointerLockElement===this.canvas)try{document.exitPointerLock()}catch{}this.audio.dispose(),this.renderer.dispose(),window.__game&&window.__game.id==="machi"&&delete window.__game}};var d=De(Ye(),1),$e=new Map;function Xe(o){if($e.has(o))return $e.get(o);let t=q[o];if(!t||typeof document>"u")return"";let e=document.createElement("canvas");e.width=e.height=48;let s=e.getContext("2d"),i=parseInt(t.color.slice(1),16),a=i>>16&255,n=i>>8&255,r=i&255,l=y=>`rgb(${Math.min(255,a*y)|0},${Math.min(255,n*y)|0},${Math.min(255,r*y)|0})`,c=t.em>0;c&&(s.shadowColor=t.color,s.shadowBlur=12);let u=t.shape==="slab"?.5:1,f=t.shape==="post"?.35:t.shape==="lantern"?.7:1,p=24,m=8+(1-u)*14,v=15*f,b=20*u;if(t.shape==="cross"){s.strokeStyle=l(1),s.lineWidth=3,s.beginPath();for(let y=0;y<5;y++)s.moveTo(24,40),s.lineTo(12+y*6,12+y%2*6);s.stroke(),s.fillStyle=l(1.2);for(let y=0;y<5;y++)s.beginPath(),s.arc(12+y*6,12+y%2*6,3,0,7),s.fill()}else if(t.shape==="curtain"){s.fillStyle=l(1);for(let y=0;y<3;y++)s.fillRect(10+y*10,10,8,26);s.fillStyle=l(.6),s.fillRect(8,8,32,4)}else s.globalAlpha=t.pass==="glass"||t.pass==="water"?.7:1,s.fillStyle=l(c?1.15:1.12),s.beginPath(),s.moveTo(p,m),s.lineTo(p+v*1.15,m+v*.6),s.lineTo(p,m+v*1.2),s.lineTo(p-v*1.15,m+v*.6),s.closePath(),s.fill(),s.shadowBlur=0,s.fillStyle=l(c?.95:.82),s.beginPath(),s.moveTo(p-v*1.15,m+v*.6),s.lineTo(p,m+v*1.2),s.lineTo(p,m+v*1.2+b),s.lineTo(p-v*1.15,m+v*.6+b),s.closePath(),s.fill(),s.fillStyle=l(c?.8:.62),s.beginPath(),s.moveTo(p+v*1.15,m+v*.6),s.lineTo(p,m+v*1.2),s.lineTo(p,m+v*1.2+b),s.lineTo(p+v*1.15,m+v*.6+b),s.closePath(),s.fill(),t.shape.startsWith("stair")&&(s.fillStyle=l(1.12),s.fillRect(p-4,m-6,8,6));let x=e.toDataURL();return $e.set(o,x),x}var Ko={place:"M12 4v16M4 12h16",remove:"M5 12h14",paint:"M4 20l6-6M14 4l6 6-8 8-6-6z",pick:"M15 4l5 5-9 9H6v-5z M13 6l5 5",box:"M4 8l8-4 8 4v8l-8 4-8-4z M4 8l8 4 8-4 M12 12v8",line:"M5 19L19 5",select:"M4 4h4M16 4h4v4M20 16v4h-4M8 20H4v-4M4 8V4",stamp:"M8 4h8v6l3 3v3H5v-3l3-3z M5 20h14",undo:"M9 7L4 12l5 5 M4 12h11a5 5 0 010 10h-3",redo:"M15 7l5 5-5 5 M20 12H9a5 5 0 000 10h3",mx:"M12 3v18 M8 7l-4 5 4 5 M16 7l4 5-4 5",mz:"M3 12h18 M7 8l5-4 5 4 M7 16l5 4 5-4",grid:"M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z",moon:"M20 14A8 8 0 1110 4a6 6 0 0010 10z",rain:"M7 15a5 5 0 115-8 4 4 0 116 5H7z M8 19l-1 2 M12 19l-1 2 M16 19l-1 2",photo:"M4 7h4l2-3h4l2 3h4v12H4z M12 10a3.5 3.5 0 100 7 3.5 3.5 0 000-7z",help:"M9 9a3 3 0 116 0c0 2-3 2-3 5 M12 18v.5",menu:"M4 7h16M4 12h16M4 17h16",close:"M6 6l12 12M18 6L6 18",walk:"M13 4a2 2 0 100 4 2 2 0 000-4z M11 21l2-6-3-3 1-4 4 3h3 M8 13l-2 8",build:"M4 20h16 M6 20V10l6-5 6 5v10 M10 20v-5h4v5",save:"M5 4h11l3 3v13H5z M8 4v5h7V4 M8 20v-6h8v6"},J=({n:o,s:t=20})=>(0,d.jsx)("svg",{width:t,height:t,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:(0,d.jsx)("path",{d:Ko[o]})}),Ae={place:["Place","P"],remove:["Remove","X"],paint:["Paint","C"],pick:["Pick","I"],box:["Box","B"],line:["Line","L"],select:["Select","M"],stamp:["Stamp","T"]},jo=[["neonpink","Pink"],["neoncyan","Cyan"],["neonred","Red"],["neonamber","Amber"],["neongreen","Green"],["neonblue","Violet"]],Ne=o=>{let t=Math.floor(o),e=Math.floor((o-t)*60);return`${String(t).padStart(2,"0")}:${String(e).padStart(2,"0")}`};function $o({onExit:o}){let t=(0,Z.useRef)(null),e=(0,Z.useRef)(null),s=(0,Z.useRef)(null),[,i]=(0,Z.useReducer)(c=>c+1,0),[a,n]=(0,Z.useState)(null);(0,Z.useEffect)(()=>{let c;try{c=new Ce(e.current,t.current,{onExit:o})}catch(f){n(f&&f.message?f.message:"WebGL is not available");return}s.current=c;let u=c.subscribe(i);return i(),()=>{u(),c.dispose(),s.current=null}},[]);let r=s.current,l=r?r.ui:null;return(0,d.jsxs)("div",{className:`machi ${l?`is-${l.mode}`:""} ${l&&l.photo?"is-photo":""} ${r&&r.touch?"is-touch":""}`,ref:t,children:[(0,d.jsx)("canvas",{className:"machi__gl",ref:e,"aria-label":"MACHI voxel town. Build mode: click to place, right-click to remove, drag to orbit.",tabIndex:0}),a&&(0,d.jsxs)("div",{className:"m-error",children:[(0,d.jsx)("b",{children:"MACHI needs WebGL"}),(0,d.jsx)("p",{children:a}),(0,d.jsx)("button",{type:"button",className:"m-btn",onClick:o,children:"Back to the arcade"})]}),r&&(0,d.jsx)(Xo,{g:r,ui:l,onExit:o})]})}function Xo({g:o,ui:t,onExit:e}){let s=t.mode==="walk";return t.photo?(0,d.jsx)(ni,{g:o,ui:t}):(0,d.jsxs)(d.Fragment,{children:[(0,d.jsxs)("header",{className:"m-top",children:[(0,d.jsxs)("div",{className:"m-brand",children:[(0,d.jsx)("b",{children:"MACHI"}),(0,d.jsx)("span",{lang:"ja",children:"\u8857"})]}),(0,d.jsxs)("div",{className:"m-seg",role:"group","aria-label":"Mode",children:[(0,d.jsxs)("button",{type:"button",className:s?"":"on","aria-pressed":!s,onClick:()=>o.setMode("build"),children:[(0,d.jsx)(J,{n:"build",s:16}),(0,d.jsx)("span",{children:"Build"})]}),(0,d.jsxs)("button",{type:"button",className:s?"on":"","aria-pressed":s,onClick:()=>o.setMode("walk"),children:[(0,d.jsx)(J,{n:"walk",s:16}),(0,d.jsx)("span",{children:"Walk"})]})]})]}),(0,d.jsxs)("nav",{className:"m-actions","aria-label":"Scene",children:[(0,d.jsxs)("button",{type:"button",className:`m-icon ${t.panel==="time"?"on":""}`,title:"Time and weather","aria-label":"Time and weather",onClick:()=>o.set({panel:t.panel==="time"?null:"time"}),children:[(0,d.jsx)(J,{n:"moon"}),(0,d.jsx)("span",{className:"m-icon__txt",children:Ne(t.hour)})]}),(0,d.jsx)("button",{type:"button",className:"m-icon",title:"Photo mode (O)","aria-label":"Photo mode",onClick:()=>o.set({photo:!0,panel:null}),children:(0,d.jsx)(J,{n:"photo"})}),(0,d.jsx)("button",{type:"button",className:`m-icon ${t.panel==="help"?"on":""}`,title:"Controls (?)","aria-label":"Controls",onClick:()=>o.set({panel:t.panel==="help"?null:"help"}),children:(0,d.jsx)(J,{n:"help"})}),(0,d.jsx)("button",{type:"button",className:`m-icon ${t.panel==="menu"?"on":""}`,title:"Menu (Esc)","aria-label":"Menu",onClick:()=>o.set({panel:t.panel==="menu"?null:"menu"}),children:(0,d.jsx)(J,{n:"menu"})})]}),!s&&(0,d.jsx)(Yo,{g:o,ui:t}),!s&&(0,d.jsx)(Zo,{g:o,ui:t}),(!s||!o.touch)&&(0,d.jsx)(Jo,{g:o,ui:t}),s&&(0,d.jsx)(ai,{g:o,ui:t}),(0,d.jsx)(ii,{g:o,ui:t}),t.toast&&(0,d.jsx)("div",{className:"m-toast",role:"status",children:t.toast}),t.panel==="palette"&&(0,d.jsx)(ti,{g:o,ui:t}),t.panel==="help"&&(0,d.jsx)(si,{g:o}),t.panel==="menu"&&(0,d.jsx)(oi,{g:o,ui:t,onExit:e}),t.panel==="time"&&(0,d.jsx)(ei,{g:o,ui:t})]})}function Yo({g:o,ui:t}){return(0,d.jsxs)("aside",{className:"m-tools","aria-label":"Tools",children:[je.map(e=>(0,d.jsxs)("button",{type:"button",className:`m-tool ${t.tool===e?"on":""}`,"aria-pressed":t.tool===e,title:`${Ae[e][0]} (${Ae[e][1]})`,"aria-label":Ae[e][0],onClick:()=>o.setTool(e),children:[(0,d.jsx)(J,{n:e}),(0,d.jsx)("span",{className:"m-tool__lbl",children:Ae[e][0]})]},e)),(0,d.jsx)("span",{className:"m-sep"}),(0,d.jsxs)("button",{type:"button",className:"m-tool",disabled:!t.canUndo,title:"Undo (Ctrl+Z)","aria-label":"Undo",onClick:()=>o.undo(),children:[(0,d.jsx)(J,{n:"undo"}),(0,d.jsx)("span",{className:"m-tool__lbl",children:"Undo"})]}),(0,d.jsxs)("button",{type:"button",className:"m-tool",disabled:!t.canRedo,title:"Redo (Ctrl+Shift+Z)","aria-label":"Redo",onClick:()=>o.redo(),children:[(0,d.jsx)(J,{n:"redo"}),(0,d.jsx)("span",{className:"m-tool__lbl",children:"Redo"})]}),(0,d.jsxs)("button",{type:"button",className:`m-tool ${t.mirrorX?"on":""}`,"aria-pressed":t.mirrorX,title:"Mirror X (Shift+X)","aria-label":"Mirror X",onClick:()=>{o.editor.mirrorX=!t.mirrorX,o.set({mirrorX:!t.mirrorX})},children:[(0,d.jsx)(J,{n:"mx"}),(0,d.jsx)("span",{className:"m-tool__lbl",children:"Mirror X"})]}),(0,d.jsxs)("button",{type:"button",className:`m-tool ${t.mirrorZ?"on":""}`,"aria-pressed":t.mirrorZ,title:"Mirror Z (Shift+Z)","aria-label":"Mirror Z",onClick:()=>{o.editor.mirrorZ=!t.mirrorZ,o.set({mirrorZ:!t.mirrorZ})},children:[(0,d.jsx)(J,{n:"mz"}),(0,d.jsx)("span",{className:"m-tool__lbl",children:"Mirror Z"})]}),(0,d.jsxs)("button",{type:"button",className:`m-tool m-tool--pal ${t.panel==="palette"?"on":""}`,title:"All blocks (E)","aria-label":"All blocks",onClick:()=>o.set({panel:t.panel==="palette"?null:"palette"}),children:[(0,d.jsx)(J,{n:"grid"}),(0,d.jsx)("span",{className:"m-tool__lbl",children:"Blocks"})]})]})}function Zo({g:o,ui:t}){let e=t.tool;return["box","line"].includes(e)?(0,d.jsxs)("div",{className:"m-ctx",role:"toolbar","aria-label":`${e} options`,children:[(0,d.jsxs)("div",{className:"m-seg m-seg--sm",children:[(0,d.jsx)("button",{type:"button",className:t.boxMode==="fill"?"on":"",onClick:()=>o.set({boxMode:"fill"}),children:"Fill"}),(0,d.jsx)("button",{type:"button",className:t.boxMode==="clear"?"on":"",onClick:()=>o.set({boxMode:"clear"}),children:"Clear"})]}),(0,d.jsx)("span",{className:"m-ctx__lbl",children:e==="line"?"Wall height":"Extra height"}),(0,d.jsx)("button",{type:"button",className:"m-mini","aria-label":"Lower",onClick:()=>o.set({boxH:Math.max(e==="line"?0:-30,t.boxH-1)}),children:"-"}),(0,d.jsx)("b",{className:"m-ctx__val",children:e==="line"?t.boxH+1:t.boxH}),(0,d.jsx)("button",{type:"button",className:"m-mini","aria-label":"Raise",onClick:()=>o.set({boxH:Math.min(40,t.boxH+1)}),children:"+"}),(0,d.jsx)("span",{className:"m-ctx__hint",children:o.touch?o.pendingCorner?"Tap the second corner":"Tap two corners":"Drag on the scene. Wheel while dragging sets height"})]}):e==="select"?(0,d.jsx)("div",{className:"m-ctx",role:"toolbar","aria-label":"Selection",children:t.selection?(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)("button",{type:"button",className:"m-btn m-btn--sm",onClick:()=>o.copySelection(),children:"Copy as stamp"}),(0,d.jsx)("button",{type:"button",className:"m-btn m-btn--sm",onClick:()=>o.fillSelection(),children:"Fill"}),(0,d.jsx)("button",{type:"button",className:"m-btn m-btn--sm",onClick:()=>o.clearSelection(),children:"Clear"}),(0,d.jsx)("button",{type:"button",className:"m-btn m-btn--sm m-btn--ghost",onClick:()=>{o.set({selection:null}),o.renderer.setGhost(null)},children:"Cancel"})]}):(0,d.jsx)("span",{className:"m-ctx__hint",children:o.touch?"Tap two corners to select":"Drag across the scene to select a region"})}):e==="stamp"?(0,d.jsx)(Qo,{g:o,ui:t}):null}function Qo({g:o,ui:t}){let[e,s]=(0,Z.useState)(""),[i,a]=(0,Z.useState)("neonpink"),n=o.stamps;return(0,d.jsxs)("div",{className:"m-ctx m-ctx--stamp",role:"toolbar","aria-label":"Stamps",children:[(0,d.jsxs)("div",{className:"m-chips",children:[n.map(r=>(0,d.jsx)("button",{type:"button",className:`m-chip ${t.stamp===r?"on":""}`,onClick:()=>o.setStamp(r),children:r.name},r.name)),o.clipboard&&(0,d.jsx)("button",{type:"button",className:`m-chip ${t.stamp===o.clipboard?"on":""}`,onClick:()=>o.setStamp(o.clipboard),children:"Clipboard"})]}),(0,d.jsxs)("div",{className:"m-letters",children:[(0,d.jsx)("label",{className:"m-ctx__lbl",htmlFor:"m-letter",children:"Sign letter"}),(0,d.jsx)("input",{id:"m-letter",className:"m-input",value:e,maxLength:1,placeholder:"A or \u30E9",onChange:r=>{let l=r.target.value.slice(-1).toUpperCase();s(l),l&&o.letter(l,i)}}),(0,d.jsx)("select",{className:"m-input","aria-label":"Neon colour",value:i,onChange:r=>{a(r.target.value),e&&o.letter(e,r.target.value)},children:jo.map(([r,l])=>(0,d.jsx)("option",{value:r,children:l},r))}),(0,d.jsx)("div",{className:"m-kana","aria-label":"Katakana",children:Cs.slice(0,46).map(r=>(0,d.jsx)("button",{type:"button",lang:"ja",className:`m-kana__k ${e===r?"on":""}`,onClick:()=>{s(r),o.letter(r,i)},children:r},r))})]}),(0,d.jsx)("button",{type:"button",className:"m-mini","aria-label":"Rotate stamp (R)",title:"Rotate (R)",onClick:()=>o.set({stampRot:(t.stampRot+1)%4}),children:"\u27F3"})]})}function Jo({g:o,ui:t}){return(0,d.jsxs)("div",{className:"m-hotbar",role:"toolbar","aria-label":"Hotbar",children:[t.hotbar.map((e,s)=>(0,d.jsxs)("button",{type:"button",className:`m-slot ${t.slot===s?"on":""}`,"aria-pressed":t.slot===s,title:`${q[e].name} (${s+1})`,"aria-label":`${q[e].name}, slot ${s+1}`,onClick:()=>{t.slot===s&&!o.touch?o.set({panel:"palette"}):o.set({slot:s})},children:[(0,d.jsx)("img",{src:Xe(e),alt:"",draggable:"false"}),(0,d.jsx)("i",{children:s+1})]},s)),(0,d.jsx)("span",{className:"m-hotbar__name",children:q[t.hotbar[t.slot]].name})]})}function ti({g:o,ui:t}){let[e,s]=(0,Z.useState)(""),i=(0,Z.useMemo)(()=>{let n=new Map;for(let r of ms){let l=q[r];e&&!`${l.name} ${l.group} ${l.key}`.toLowerCase().includes(e.toLowerCase())||(n.has(l.group)||n.set(l.group,[]),n.get(l.group).push(l))}return[...n.entries()]},[e]),a=n=>{let r=t.hotbar.slice(),l=r.indexOf(n);if(l>=0)o.set({slot:l});else{r[t.slot]=n;try{localStorage.setItem("nc2:machi:hotbar",JSON.stringify(r))}catch{}o.set({hotbar:r})}o.touch&&o.set({panel:null})};return(0,d.jsxs)("section",{className:"m-panel m-palette","aria-label":"All blocks",children:[(0,d.jsxs)("div",{className:"m-panel__head",children:[(0,d.jsx)("input",{className:"m-input m-search",autoFocus:!o.touch,placeholder:"Search blocks",value:e,onChange:n=>s(n.target.value),"aria-label":"Search blocks"}),(0,d.jsxs)("span",{className:"m-panel__note",children:["Picks go into slot ",t.slot+1]}),(0,d.jsx)("button",{type:"button",className:"m-icon","aria-label":"Close",onClick:()=>o.set({panel:null}),children:(0,d.jsx)(J,{n:"close"})})]}),(0,d.jsxs)("div",{className:"m-palette__body",children:[i.map(([n,r])=>(0,d.jsxs)("div",{className:"m-palette__grp",children:[(0,d.jsx)("h3",{children:n}),(0,d.jsx)("div",{className:"m-palette__grid",children:r.map(l=>(0,d.jsxs)("button",{type:"button",className:`m-pal ${t.hotbar[t.slot]===l.id?"on":""}`,onClick:()=>a(l.id),title:l.name,children:[(0,d.jsx)("img",{src:Xe(l.id),alt:""}),(0,d.jsx)("span",{children:l.name})]},l.id))})]},n)),!i.length&&(0,d.jsx)("p",{className:"m-panel__note",children:"No block matches that."})]})]})}function ei({g:o,ui:t}){return(0,d.jsxs)("section",{className:"m-panel m-pop","aria-label":"Time and weather",children:[(0,d.jsxs)("label",{className:"m-row",children:[(0,d.jsxs)("span",{children:["Time ",(0,d.jsx)("b",{children:Ne(t.hour)})]}),(0,d.jsx)("input",{type:"range",min:"0",max:"23.99",step:"0.05",value:t.hour,onChange:e=>o.set({hour:+e.target.value,drift:!1,cycle:!1}),"aria-label":"Time of day"})]}),(0,d.jsx)("div",{className:"m-row m-row--btns",children:[["Dawn",5.6],["Noon",12.5],["Dusk",18.4],["Blue hour",19],["Night",22]].map(([e,s])=>(0,d.jsx)("button",{type:"button",className:"m-chip",onClick:()=>o.set({hour:s,drift:!1,cycle:!1}),children:e},e))}),(0,d.jsxs)("label",{className:"m-check",children:[(0,d.jsx)("input",{type:"checkbox",checked:t.cycle,onChange:e=>o.set({cycle:e.target.checked,drift:!1})})," Day and night cycle"]}),(0,d.jsxs)("label",{className:"m-check",children:[(0,d.jsx)("input",{type:"checkbox",checked:t.rain,onChange:e=>o.set({rain:e.target.checked})})," Rain"]})]})}function si({g:o}){let t=o.touch?[["Tap a face","Use the tool (place by default)"],["Long-press","Remove a block"],["One-finger drag","Orbit"],["Two fingers","Pan and pinch to zoom"],["Box, Line, Select","Tap two corners"],["Walk","Left stick moves, drag right side to look"],["Jump twice","Fly on or off"]]:[["Click","Use the tool (place by default)"],["Right-click","Remove a block"],["Middle-click","Pick the block under the cursor"],["Left-drag","Orbit"],["Right or Shift-drag","Pan"],["Wheel","Zoom"],["WASD / arrows","Move and turn the camera"],["1 to 9, Alt+wheel","Choose a block"],["E","All blocks"],["P X C I B L M T","Place, Remove, Paint, Pick, Box, Line, Select, Stamp"],["Wheel while dragging","Box or wall height"],["F","Box: fill or clear"],["R","Rotate stamp"],["Shift+X / Shift+Z","Mirror"],["Ctrl+Z, Ctrl+Shift+Z","Undo, redo"],["Ctrl+C, Ctrl+V, Delete","Copy, paste, clear a selection"],["Tab","Walk or build"],["Walk: WASD, Space, Shift","Move, jump, sprint. Jump twice to fly, C to go down"],["Walk: left / right click","Place / remove at the crosshair"],["O","Photo mode"],["Esc","Menu"]];return(0,d.jsxs)("section",{className:"m-panel m-help",role:"dialog","aria-label":"Controls",children:[(0,d.jsxs)("div",{className:"m-panel__head",children:[(0,d.jsx)("h2",{children:"Controls"}),(0,d.jsx)("button",{type:"button",className:"m-icon","aria-label":"Close",onClick:()=>o.set({panel:null}),children:(0,d.jsx)(J,{n:"close"})})]}),(0,d.jsx)("dl",{children:t.map(([e,s])=>(0,d.jsxs)("div",{children:[(0,d.jsx)("dt",{children:e}),(0,d.jsx)("dd",{children:s})]},e))}),(0,d.jsx)("p",{className:"m-panel__note",children:"Your town saves itself in this browser. Signs, shops and street names here are invented."})]})}function oi({g:o,ui:t,onExit:e}){let[s,i]=(0,Z.useState)({}),a=o.settings,n=(0,Z.useRef)(null),r=()=>{let c=new Blob([o.exportJSON()],{type:"application/json"}),u=document.createElement("a");u.href=URL.createObjectURL(c),u.download="machi-town.json",u.click(),setTimeout(()=>URL.revokeObjectURL(u.href),2e3)},l=c=>{let u=c.target.files&&c.target.files[0];if(!u)return;if(u.size>4*1024*1024){o.toast("File too large (4 MB max)");return}let f=new FileReader;f.onload=()=>{o.importJSON(String(f.result)),o.set({panel:null})},f.readAsText(u),c.target.value=""};return(0,d.jsxs)("section",{className:"m-panel m-menu",role:"dialog","aria-label":"Menu",children:[(0,d.jsxs)("div",{className:"m-panel__head",children:[(0,d.jsx)("h2",{children:"Menu"}),(0,d.jsx)("button",{type:"button",className:"m-icon","aria-label":"Close",onClick:()=>o.set({panel:null}),children:(0,d.jsx)(J,{n:"close"})})]}),(0,d.jsx)("h3",{children:"Saves"}),(0,d.jsx)("ul",{className:"m-slots",children:o.slots().map(c=>(0,d.jsxs)("li",{children:[(0,d.jsx)("input",{className:"m-input","aria-label":`Name for slot ${c.i}`,placeholder:`Slot ${c.i}`,value:s[c.i]??(c.empty?"":c.name),onChange:u=>i({...s,[c.i]:u.target.value})}),(0,d.jsx)("button",{type:"button",className:"m-btn m-btn--sm",onClick:()=>o.saveSlot(c.i,s[c.i]||(c.empty?`Slot ${c.i}`:c.name)),children:"Save"}),(0,d.jsx)("button",{type:"button",className:"m-btn m-btn--sm",disabled:c.empty,onClick:()=>{o.loadSlot(c.i),o.set({panel:null})},children:"Load"})]},c.i))}),(0,d.jsxs)("div",{className:"m-row m-row--btns",children:[(0,d.jsx)("button",{type:"button",className:"m-btn m-btn--sm",onClick:r,children:"Export file"}),(0,d.jsx)("button",{type:"button",className:"m-btn m-btn--sm",onClick:()=>n.current&&n.current.click(),children:"Import file"}),(0,d.jsx)("input",{ref:n,type:"file",accept:".json,application/json",hidden:!0,onChange:l})]}),(0,d.jsx)("h3",{children:"New world"}),(0,d.jsx)("div",{className:"m-row m-row--btns",children:Object.entries(ge).map(([c,u])=>(0,d.jsx)("button",{type:"button",className:`m-btn m-btn--sm ${c==="tokyo"?"m-btn--signal":""}`,onClick:()=>{window.confirm(c==="tokyo"?"Reset to the Tokyo corner? Unsaved changes are lost (save to a slot first).":`Start a new ${u.name.toLowerCase()}? Unsaved changes are lost.`)&&(o.newWorld(c),o.set({panel:null}))},children:c==="tokyo"?"Reset to Tokyo":u.name},c))}),(0,d.jsx)("h3",{children:"Settings"}),(0,d.jsxs)("div",{className:"m-row",children:[(0,d.jsx)("span",{children:"Quality"}),(0,d.jsx)("div",{className:"m-seg m-seg--sm",children:["auto","low","balanced","high"].map(c=>(0,d.jsx)("button",{type:"button",className:a.quality===c?"on":"",onClick:()=>o.saveSettings({quality:c}),children:c==="auto"?`Auto (${t.quality})`:c[0].toUpperCase()+c.slice(1)},c))})]}),(0,d.jsxs)("label",{className:"m-check",children:[(0,d.jsx)("input",{type:"checkbox",checked:a.sound,onChange:c=>o.saveSettings({sound:c.target.checked})})," Sound"]}),(0,d.jsxs)("label",{className:"m-check",children:[(0,d.jsx)("input",{type:"checkbox",checked:a.invertY,onChange:c=>o.saveSettings({invertY:c.target.checked})})," Invert look"]}),(0,d.jsxs)("label",{className:"m-check",children:[(0,d.jsx)("input",{type:"checkbox",checked:a.tilt,onChange:c=>o.saveSettings({tilt:c.target.checked})})," Miniature focus in build view"]}),(0,d.jsxs)("label",{className:"m-row",children:[(0,d.jsx)("span",{children:"Look sensitivity"}),(0,d.jsx)("input",{type:"range",min:"0.3",max:"2.5",step:"0.05",value:a.sens,onChange:c=>o.saveSettings({sens:+c.target.value}),"aria-label":"Look sensitivity"})]}),(0,d.jsx)("button",{type:"button",className:"m-btn m-btn--exit",onClick:()=>{o.autosave(),e&&e()},children:"Exit to arcade"})]})}function ii({g:o,ui:t}){let e=t.coach|0;if(e>=3||t.panel||t.mode==="build"&&!["place","remove"].includes(t.tool))return null;let s=o.touch,a=t.mode==="walk"?[s?"Tap + to place a block":"Left-click to place a block",s?"Tap \u2212 to remove a block":"Right-click to remove a block",""][e]:[s?"Tap any face to place a block":"Click any face to place a block",s?"Long-press a block to remove it":"Right-click a block to remove it",s?"Now tap Walk and stroll the street":"Press Tab to walk the street"][e];return a?(0,d.jsxs)("div",{className:"m-coach",role:"status",children:[(0,d.jsxs)("span",{className:"m-coach__n",children:[e+1,"/3"]}),(0,d.jsx)("span",{children:a}),(0,d.jsx)("button",{type:"button",className:"m-coach__skip",onClick:()=>o.skipCoach(),children:"Skip"})]}):null}function ai({g:o,ui:t}){let e=(0,Z.useRef)(null),[s,i]=(0,Z.useState)([0,0]),a=c=>{let u=e.current;if(!u)return;u.setPointerCapture(c.pointerId);let f=u.getBoundingClientRect(),p=f.left+f.width/2,m=f.top+f.height/2,v=f.width/2,b=y=>{let k=(y.clientX-p)/v,g=(y.clientY-m)/v,T=Math.hypot(k,g);T>1&&(k/=T,g/=T),o.stick={x:k,y:g},i([k*v*.6,g*v*.6])},x=()=>{o.stick=null,i([0,0]),u.removeEventListener("pointermove",b),u.removeEventListener("pointerup",x),u.removeEventListener("pointercancel",x)};u.addEventListener("pointermove",b),u.addEventListener("pointerup",x),u.addEventListener("pointercancel",x),b(c)},n=c=>{o.lookId=c.pointerId,o._touchDown(c,c.clientX,c.clientY)},r=t.hotbar,l=r[t.slot];return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)("div",{className:"m-cross","aria-hidden":"true"}),!o.touch&&!t.locked&&!t.panel&&(0,d.jsxs)("button",{type:"button",className:"m-lockhint",onClick:()=>o.requestLock(),children:["Click to look around",(0,d.jsx)("small",{children:"WASD to move \xB7 Space to jump \xB7 Tab to build"})]}),o.touch&&(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)("div",{className:"m-look",onPointerDown:n}),(0,d.jsx)("div",{className:"m-stick",ref:e,onPointerDown:a,"aria-label":"Move",children:(0,d.jsx)("i",{style:{transform:`translate(${s[0]}px, ${s[1]}px)`}})}),(0,d.jsxs)("div",{className:"m-wbtns",children:[(0,d.jsx)("button",{type:"button",className:"m-wbtn","aria-label":"Remove block",onPointerDown:c=>{c.preventDefault(),o.applyTool("remove",o.pick())},children:(0,d.jsx)(J,{n:"remove"})}),(0,d.jsx)("button",{type:"button",className:"m-wbtn m-wbtn--place","aria-label":"Place block",onPointerDown:c=>{c.preventDefault(),o.applyTool("place",o.pick())},children:(0,d.jsx)(J,{n:"place"})}),(0,d.jsx)("button",{type:"button",className:"m-wbtn m-wbtn--jump","aria-label":"Jump (twice to fly)",onPointerDown:c=>{c.preventDefault(),o._jumpPressed=!0,o.touchJump=!0},onPointerUp:()=>{o.touchJump=!1},onPointerCancel:()=>{o.touchJump=!1},children:"Jump"})]}),(0,d.jsxs)("button",{type:"button",className:"m-wblock","aria-label":`Block: ${q[l].name}. Tap for next`,onClick:()=>o.set({slot:(t.slot+1)%r.length}),children:[(0,d.jsx)("img",{src:Xe(l),alt:""}),(0,d.jsx)("span",{children:q[l].name})]})]})]})}function ni({g:o,ui:t}){let e=()=>{let s=o.renderer.screenshot({tilt:t.tilt,focus:.55,bloom:.8,vignette:.4}),i=document.createElement("a");i.href=s,i.download=`machi-${Ne(t.hour).replace(":","")}.png`,i.click()};return(0,d.jsxs)("section",{className:"m-photo","aria-label":"Photo mode",children:[(0,d.jsxs)("label",{className:"m-row",children:[(0,d.jsxs)("span",{children:["Time ",(0,d.jsx)("b",{children:Ne(t.hour)})]}),(0,d.jsx)("input",{type:"range",min:"0",max:"23.99",step:"0.05",value:t.hour,onChange:s=>o.set({hour:+s.target.value,drift:!1,cycle:!1}),"aria-label":"Time of day"})]}),(0,d.jsxs)("label",{className:"m-row",children:[(0,d.jsxs)("span",{children:["Lens ",(0,d.jsxs)("b",{children:[t.fov,"\xB0"]})]}),(0,d.jsx)("input",{type:"range",min:"20",max:"100",step:"1",value:t.fov,onChange:s=>o.set({fov:+s.target.value}),"aria-label":"Field of view"})]}),(0,d.jsxs)("label",{className:"m-row",children:[(0,d.jsx)("span",{children:"Miniature"}),(0,d.jsx)("input",{type:"range",min:"0",max:"1",step:"0.05",value:t.tilt,onChange:s=>o.set({tilt:+s.target.value}),"aria-label":"Tilt-shift strength"})]}),(0,d.jsxs)("div",{className:"m-row m-row--btns",children:[(0,d.jsxs)("button",{type:"button",className:"m-btn m-btn--signal",onClick:e,children:[(0,d.jsx)(J,{n:"save",s:16})," Save PNG"]}),(0,d.jsx)("button",{type:"button",className:"m-btn",onClick:()=>o.set({photo:!1}),children:"Done"})]})]})}export{$o as default};
