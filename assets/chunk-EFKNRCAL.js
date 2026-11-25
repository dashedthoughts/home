import{a as ma,b as va,c as xa,d as mo,e as vo,f as Bo,g as Ia,h as Ms,i as yr,j as Tr,k as qo}from"./chunk-TFUOTVP4.js";import{A as Ya,C as Ds,H as Ls,I as ya,c as jr,d as wa,g as wo,h as qt,j as Eo,k as Xr,l as qr,m as Yr,n as Kr,o as wt,q as Qr,r as Zr,s as Jr,u as Go,v as Jo,w as Gs,x as qa,z as Ea}from"./chunk-VLIFHQUH.js";import{$ as Gr,A as Se,Aa as Xa,B as Ss,Ba as Ue,Ca as Pt,D as lt,Da as Or,E as Ie,Ea as Ps,F as ne,Fa as Zo,G as Cr,Ga as Ur,H as xt,I as Jt,Ia as Vr,J as As,K as W,L as Ee,M as zr,N as Xt,O as gt,P as dt,Q as D,R as V,S as _t,T as we,U as kr,W as Le,X as Br,Y as Pr,Z as Cs,_ as Be,aa as Dr,b as br,ba as Na,c as Mt,d as Mr,e as Ke,ea as Lr,fa as kt,ga as Oe,ha as Oa,ia as zs,ja as Fr,ka as $t,l as Rr,la as Ua,m as Rs,ma as ks,n as Hr,na as Bs,o as xo,oa as go,p as Yo,pa as Ae,q as Sr,qa as Po,r as Ko,sa as ga,t as Hs,ta as Va,u as zt,ua as Wr,v as Ar,va as ja,wa as Ir,x as jt,xa as Nr,ya as Bt,za as Qo}from"./chunk-Q7RZRAJ3.js";import"./chunk-5TBO732O.js";var To=3.6,Je=[-To,0,To],wi=5.4,yo=6.05,_e=70,Ei=1.38,yi=1.12,Rt=4.4,Do=1.95,Ti=3,_r=5,Ka=10,$r=80,bi=1e4,Mi=.35,Ri=.6,Hi=2.5,Si=1.35,Ai=2,rt=(s,o,t)=>s<o?o:s>t?t:s;function eo(s){let o=s>>>0;return()=>{o=o+1831565813>>>0;let t=o;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}}function en(s={}){let o=s.onEvent||(()=>{}),t=s.mode||"attract",r={car:"wedge",difficulty:"street",weather:"clear",assist:!1,...s.config||{}},a={left:!1,right:!1,boost:!1,brake:!1,axis:0,strike:!1,wheelie:!1},e={},n=Math.random,i=Math.random,u=$r,m=f=>wo(u+f),l=f=>Xr(u+f),h=f=>Jr(u+f),v=(f,S)=>S+(qt(u+S,f)||wa),E={z0:0,z1:0,index:-1,name:"",jp:""};function M(f){let S=m(f),F=null,q=1/0;for(let B=0;B<Eo.length;B++){let Q=Eo[B],Y=S>=Q.from&&S<Q.to,_=Y?-(S-Q.from):qt(S,Q.from);if((Y||_<q)&&(F=Q,q=_,E.index=B,Y))break}return E.z0=f+q,E.z1=E.z0+F.length,E.name=F.name,E.jp=F.jp,E}function p(){let f=Ya(m(e.z)+1);e.jct=f,e.nextJunction=v(f.s,e.z),e.jctCalled=!1}function H(){for(;e.nextShardZ<e.z+520;){if(e.finale)return;let f=e.nextShardZ,S=u+f;if(Ls(S,120,20)||!wt(S)&&wt(S+60)){e.nextShardZ+=60;continue}let q=wt(S)||wt(S+45)?0:i(),B=i()*3|0,Q=6;for(let Y=0;Y<Q;Y++){let _=Je[B];q>.66?_=Math.sin(Y/(Q-1)*Math.PI*2)*To:q>.38&&(_=Je[B]+Y/(Q-1)*(B===2?-1:1)*To),e.shardList.push({z:f+Y*9,x:_,taken:!1,missed:!1,id:e.uid++})}e.spawned+=Q,e.nextShardZ+=g()}}let k=255;function g(){let f=170+i()*170;if(t!=="play")return f;let S=bi-u-e.nextShardZ,F=0;for(let _ of e.shardList)!_.taken&&!_.missed&&F++;let q=e.spawned-F,B=rt((e.shards+Mi*24)/(q+24),.2,.95),Q=Ka*_r-e.shards-F*B;if(S<400||Q<=0)return f;let Y=S/(Q/(6*B))-45;return f*rt(Y/k,Ri,Hi)}function b(f){return e.finale?!1:wt(u+f)}function U(f,S,F){for(let q of e.cars)if((q.lane===f||q.target===f)&&Math.abs(q.z-S)<F)return!1;return!0}function J(f,S,F,q=34){let B=0;for(let Q=0;Q<3;Q++)Q!==f&&e.cars.some(Y=>Y!==F&&(Y.lane===Q||Y.target===Q)&&Math.abs(Y.z-S)<q)&&B++;return B>=2}function j(){let f=Bo[r.difficulty]||Bo.street;if(e.finale)return;let S=Ea(u+e.z+300)||Ea(u+e.z+120),F=t==="play"?1+Math.min(.3,(e.sector-1)*.06):1,q=Math.round((t==="attract"?9:13)*f.density*(S?Si:1)*F),B=0;for(;e.cars.length<q&&B++<20;){let Q=e.z+220+i()*260+(e.cars.length===0?-140:0),Y=Ea(u+Q)&&i()<.5,_=Y?i()<.5?0:2:i()*3|0;if(!U(_,Q,28)||J(_,Q,null))continue;let Me=i()<.16?"hauler":i()<.5?"sedan":"hatch",w=(24+i()*18)*f.trafficSpeed*(Y?.85:1)*(Me==="hauler"?.85:1)*(1+(F-1)*.3);e.cars.push({id:e.uid++,z:Q,lane:_,target:_,x:Je[_],speed:w,cruise:w,kind:Me,paint:i()*8|0,blink:0,brake:!1,prevDz:Q-e.z,hit:0,think:Y?.4+i():i()*2})}}function z(f){i=f!=null?eo(f):Math.random,n=f!=null?eo(f*7+3):Math.random;let S=ma[r.car]||ma.wedge,F=Bo[r.difficulty]||Bo.street;u=wo(r.startS!=null?r.startS:$r),Object.assign(e,{z:0,x:0,vx:0,steer:0,speed:t==="attract"?_e*.8:0,heat:0,glitch:0,slip:0,draft:0,invuln:0,hitstop:0,lives:F.lives,maxLives:F.lives,score:0,shards:0,files:0,chain:0,nearMisses:0,topSpeed:0,dist:0,time:0,over:!1,overT:0,count:t==="play"?3.6:0,lastCount:4,overclock:!1,onKerb:!1,scrape:0,shake:0,flash:0,cars:[],shardList:[],nextShardZ:t==="play"?140:60,uid:1,car:S,ai:{target:0,think:0},s:u,startS:u,lap:1,district:Jo(u),merge:!1,jct:null,nextJunction:0,jctCalled:!1,sector:1,spawned:0,finale:!1,finaleT:0,done:!1,rival:{z:-9,x:Je[2],lane:2,target:2,speed:t==="attract"?_e*.8:0,swapT:-9,think:0,stun:0,cd:.8,hits:0,fight:!1,fightT:0,fightCd:6,surge:0,guard:0,block:0},pos:1,raceWon:null,strikeCd:0,swing:0,wheelie:0,wanted:0,cop:null,cops:[],bust:0,lost:0,busts:0,chaseT:0,swarmT:0,inTunnel:!1,wet:!1,aqua:0,crash:null,nmChain:0,nmT:0,sprint:!1,raceT:0,graceT:0,powers:[],nextPowerZ:520,ghost:0}),p(),j(),H()}function G(f){let S=e.ai;if(S.think-=f,S.think<=0){S.think=.2;let B=0,Q=-1e9;Je.forEach((Y,_)=>{let Me=-Math.abs(Y-e.x)*.3-(_===1?0:.2);for(let w of e.cars){let C=w.z-e.z;C>-4&&C<90&&Math.abs(w.x-Y)<2.4&&(Me-=(90-C)*.5)}for(let w of e.shardList){let C=w.z-e.z;!w.taken&&C>0&&C<70&&Math.abs(w.x-Y)<1.6&&(Me+=(70-C)*.08)}Me>Q&&(Q=Me,B=Y)}),S.target=B}let F=S.target-e.x-e.vx*.35;a.axis=rt(F*.9,-1,1),a.left=a.right=!1;let q=_e*(r.cruise||1.4);a.boost=e.heat<62&&Math.abs(l(e.z+30))<.45&&e.speed<q-2,a.brake=e.speed>q+18}function L(f){if(e.time+=f,e.flash>0&&(e.flash-=f),e.shake>0&&(e.shake-=f),e.hitstop>0){e.hitstop-=f;return}let S=e.car,F=vo[r.weather]||vo.clear;e.inTunnel=b(e.z),e.wet=!!F.rain&&!e.inTunnel,e.aqua=e.wet?rt((e.speed/_e-1)/.3,0,1):0;let q=S.grip*(e.wet?F.grip*(1-.16*e.aqua):1);if(e.count>0){e.count-=f;let c=Math.ceil(e.count);c!==e.lastCount&&c>=1&&c<=3&&o({type:"count",n:c}),e.lastCount=c,e.count<=0&&(o({type:"go"}),e.car.bike&&(e.wheelie=1.5))}let B=e.count<=0&&!e.over&&!e.done;B&&(e.raceT+=f),e.graceT>0&&(e.graceT-=f),t==="attract"&&G(f);let Q=rt((a.right?1:0)-(a.left?1:0)+a.axis,-1,1);e.glitch>0&&(Q=-Q),B||(Q=0),e.steer+=(Q-e.steer)*Math.min(1,f*11);let Y=B&&a.boost&&e.glitch<=0,_=_e*S.top*(Y?Ei:1)*(e.slip>0?yi:1);e.crash&&(e.crash.t+=f,e.crash.t>=e.crash.dur&&!e.crash.final&&(e.crash=null)),e.over?e.speed=Math.max(0,e.speed-(e.crash&&e.crash.final?18:22)*f):B?e.finale||(a.brake?e.speed=Math.max(0,e.speed-34*(e.wet&&F.brake||1)*f):e.speed<_?e.speed+=21*S.accel*(Y?1.25:1)*Math.max(.12,1-(e.speed/_)**2)*f:e.speed=Math.max(_,e.speed-9*f)):e.speed=t==="attract"?e.speed:0,e.onKerb=Math.abs(e.x)>wi-.95,e.onKerb&&e.speed>_e*.45&&(e.speed-=7*f);let Me=e.z;e.z+=e.speed*f,e.dist+=e.speed*f,e.s=m(e.z),e.merge=Ea(e.s),e.topSpeed=Math.max(e.topSpeed,e.speed);let w=e.speed/_e,C=34*q*rt(e.speed/16,0,1);e.vx+=e.steer*C*f;let O=l(e.z);if(e.vx-=O*w*w*15*f,r.assist&&Math.abs(Q)<.15&&B){let c=Je.reduce((le,ce)=>Math.abs(ce-e.x)<Math.abs(le-e.x)?ce:le);e.vx+=(c-e.x)*5*f}if(e.vx*=Math.exp(-f*6.5*q),e.x+=e.vx*f,e.scrape=Math.max(0,e.scrape-f),Math.abs(e.x)>yo){let c=Math.sign(e.x);e.x=c*yo,(Math.abs(e.vx)>2||e.speed>20)&&(e.scrape<=0&&o({type:"scrape",side:c}),e.scrape=.12),Math.abs(e.vx)>8.5&&e.speed>30&&B&&!e.crash&&(e.speed*=.86,e.chain=0,e.crash={t:0,dur:.7,dir:-c,sev:.45,final:!1},r.effects!=="reduced"&&(e.shake=Math.max(e.shake,.3)),o({type:"slam",side:c,x:e.x})),e.vx=-c*Math.max(2.5,Math.abs(e.vx)*.4),e.speed*=Math.exp(-f*1.6),r.effects!=="reduced"&&(e.shake=Math.max(e.shake,.08))}e.glitch>0?(e.glitch-=f,e.glitch<=0&&(e.heat=40,o({type:"glitch-end"}))):Y&&e.speed>_e*.5?(e.heat+=21/S.cool*f,e.heat>=100&&(e.heat=100,e.glitch=Ti,e.chain=0,o({type:"glitch"}))):e.heat=Math.max(0,e.heat-15*S.cool*(e.wet&&F.cool||1)*f),e.overclock=Y,e.slip>0&&(e.slip-=f),!e.jctCalled&&e.nextJunction-e.z<320&&(e.jctCalled=!0,t==="play"&&!e.finale&&o({type:"junction",name:e.jct.name,jp:e.jct.jp,dist:Math.round(e.nextJunction-e.z),sector:e.sector+1})),e.z>=e.nextJunction&&(e.sector+=1,p());let $=Jo(e.s);$!==e.district&&(e.district=$,t==="play"&&B&&o({type:"district",id:$.id,name:$.name,jp:$.jp}));let se=1+Math.floor((u+e.z)/wa);se!==e.lap&&(e.lap=se,t==="play"&&B&&o({type:"lap",lap:se})),e.finale&&(e.finaleT+=f,a.boost=!1,e.cars=e.cars.filter(c=>Math.abs(c.z-e.z)>60||e.finaleT<.5),e.finaleT>1.2&&(e.speed=Math.max(0,e.speed-14*f)),e.speed<=.5&&!e.done&&e.finaleT>2&&(e.done=!0,o({type:"complete",won:e.raceWon,score:Math.round(e.score),files:e.files,dist:e.dist,top:e.topSpeed,nearMisses:e.nearMisses,shards:e.shards,sectors:e.sector,laps:e.lap,district:e.district.name}))),e.invuln>0&&(e.invuln-=f);let re=Bo[r.difficulty]||Bo.street,ye=null;for(let c of e.cars){let le=null;for(let N of e.cars){if(N===c)continue;let X=N.z-c.z;X>0&&X<32&&Math.abs(N.x-c.x)<2.2&&(!le||X<le.z-c.z)&&(le=N)}let ce=c.cruise*(F.rain&&!b(c.z)&&F.traffic||1);le&&(ce=Math.min(ce,le.speed-1.5)),c.hit>0&&(c.hit=Math.max(0,c.hit-f),c.z<e.z-2&&(ce=Math.min(ce,c.cruise*.55)));let Fe=0,Ge=1e9;for(let N=0;N<3;N++){if(N===c.lane)continue;let X=e.cars.find(he=>he!==c&&he.lane===N&&he.z-c.z>-3&&he.z-c.z<18);X&&(Fe++,Ge=Math.min(Ge,X.speed))}Fe===2&&(ce=Math.min(ce,Ge-4));let ee=e.z-c.z;if(ee>0&&ee<30&&Math.abs(e.x-c.x)<2.3&&(ce=Math.min(ce,e.speed-2)),ce=Math.max(0,ce),c.brake=ce<c.speed-.5,c.speed=Math.max(0,c.speed+rt(ce-c.speed,-14*f,6*f)),c.think-=f,c.blink===0&&c.think<=0&&(c.think=1.5+i()*3,!b(c.z)&&c.hit<=0&&(le||i()<.18*re.density))){let X=[c.lane-1,c.lane+1].filter(he=>he>=0&&he<=2&&U(he,c.z,20)&&!J(he,c.z,c)).filter(he=>!(Math.abs(Je[he]-e.x)<2.2&&Math.abs(c.z-e.z)<16));X.length&&(c.target=X[i()*X.length|0],c.blink=1.1)}c.blink>0&&(c.blink-=f,c.blink<=.45&&(c.lane=c.target),c.blink<=0&&(c.blink=0));let Pe=Je[c.lane];c.x+=rt(Pe-c.x,-2.4*f,2.4*f),c.kv&&(c.x=rt(c.x+c.kv*f,-yo+.9,yo-.9),c.kv*=Math.exp(-f*3.2),Math.abs(c.kv)<.05&&(c.kv=0)),c.z+=c.speed*f;let at=c.z-e.z,x=c.kind==="hauler"?at-.9:at,Z=c.x-e.x,fe=S.bike?1.22:Do,K=(c.kind==="hauler"?4.4:c.kind==="hatch"?2:2.25)+(S.bike?1.1:2.2);if(Math.abs(x)<K&&Math.abs(Z)<fe&&(t!=="play"||e.invuln>0||!B)){x>=0?(c.z=e.z+K+.15+(at-x),c.speed=Math.max(c.speed,e.speed+2)):(c.z=e.z-K-.15+(at-x),c.speed=Math.min(c.speed,Math.max(0,e.speed-2))),c.prevDz=c.z-e.z;continue}if(t!=="play"&&x>0&&x<16&&Math.abs(Z)<fe+.3&&(e.speed=Math.min(e.speed,Math.max(c.speed-.5,0))),B&&Math.abs(x)<K&&Math.abs(Z)<fe){if(t==="play"&&e.invuln<=0){let N=x>0,X=Math.max(0,N?e.speed-c.speed:c.speed-e.speed),he=Math.abs(Z)>fe*.6&&Math.abs(x)<K*.8,de=rt((he?.3:.25)+X/55,.25,1)*(he?.7:1),nt=c.kind==="hauler"?3.2:c.kind==="hatch"?.85:1;r.zen||(e.lives-=1),e.invuln=2.6,e.graceT=4.5,e.hitstop=.05+.07*de,c.hit=2.2;let St=Z>0?-1:1;e.vx=St*(5.2+2.3*de),e.x+=St*.5,c.kv=-St*(1+1.1*de)/nt,he?(e.speed*=1-.14*de,c.speed=Math.max(0,c.speed-3/nt)):N?(e.speed=Math.min(e.speed,c.speed*(.8-.22*de)),c.speed+=(3+4*de)/nt):(e.speed+=X*.15/nt,c.speed=Math.max(0,c.speed-X*.3)),e.chain=0,r.effects!=="reduced"&&(e.shake=.3+.3*de,e.flash=.2+.25*de);let Wt=e.lives<=0;Wt&&(e.speed=Math.max(e.speed,30)),e.crash={t:0,dur:Wt?1.7:.55+.45*de,dir:-St,sev:de,final:Wt},o({type:"hit",lives:e.lives,sev:de,swipe:he,x:e.x+Z*.5,z:x*.5,kind:c.kind}),r.police!==!1&&!r.zen&&e.raceT>25&&(e.wanted=Math.min(3,e.wanted+.5)),Wt&&(e.over=!0,o({type:"over",score:Math.round(e.score),files:e.files,dist:e.dist,top:e.topSpeed,nearMisses:e.nearMisses,shards:e.shards}))}}else if(B&&c.prevDz>0&&x<=0&&Math.abs(Z)<3.2&&!c.hit&&t==="play"){e.nmChain=e.nmT>0?Math.min(8,e.nmChain+1):1,e.nmT=4;let N=250*(Y?2:1)*e.nmChain*(e.merge?Ai:1);e.score+=N,e.nearMisses+=1,e.heat=Math.max(0,e.heat-8),o({type:"nearmiss",pts:N,chain:e.nmChain,merge:e.merge})}x>5&&x<38&&Math.abs(Z)<1.3&&(ye=c),c.prevDz=x}if(e.nmT>0&&(e.nmT-=f),e.cars=e.cars.filter(c=>c.z>e.z-45&&c.z<e.z+700),j(),B&&ye&&e.speed>_e*.45?(e.draft+=f*.6,e.draft>=1&&(e.draft=0,e.slip=2.2,e.heat=Math.max(0,e.heat-18),t==="play"&&o({type:"slipstream"}))):e.draft=Math.max(0,e.draft-f*.9),t==="play"&&r.race!==!1&&(B||e.finale||e.over)){let c=e.rival,le=c.z-e.z,ce=r.rash&&e.car.bike;e.sprint=e.files>=8&&!e.finale;let Fe=1.035+.07*Math.sin(e.time*.21)+.035*Math.sin(e.time*.67+1.3)+(e.sprint?.05:0)+Math.min(.04,(e.sector-1)*.01)+(ce?.02:0),Ge=Math.max(_e*.9,e.speed),ee=Ge*Fe*(re.rival||1);le<-25?ee=Math.max(ee,Ge*(1.12+Math.min(.2,-le/400))):le>110&&(ee=Math.min(ee,Ge*(.99-Math.min(.14,(le-110)/500)))),c.surge>0&&(c.surge-=f,ee=Math.max(ee,e.speed*1.16+5)),ee=Math.min(ee,_e*1.55);let Pe=e.dist<450&&le<45;Pe&&(ee=Math.max(ee,e.speed*1.4+10)),(e.finale||e.over)&&(ee=Math.max(0,c.speed-14*f));let at=42+Math.max(0,c.speed-40)*1.2,x=e.cars.find(K=>K.z-c.z>0&&K.z-c.z<at&&Math.abs(K.x-c.x)<2.2),Z=e.z-c.z>0&&e.z-c.z<26&&Math.abs(e.x-c.x)<2.2&&c.speed>e.speed-2;if(c.think-=f,(x||Z)&&c.target===c.lane&&c.think<=0){c.think=.4;for(let K of[c.lane-1,c.lane+1].filter(N=>N>=0&&N<3).sort(()=>e.time%2<1?1:-1)){let N=e.cars.some(he=>Math.abs(he.x-Je[K])<2.4&&he.z-c.z>-9&&he.z-c.z<46),X=Math.abs(e.x-Je[K])<2.4&&Math.abs(e.z-c.z)<9;if(!N&&!X){c.target=K;break}}}if(x&&c.target===c.lane&&(ee=Math.min(ee,x.speed-1)),B&&!e.finale){let K=e.x<-To/2?0:e.x>To/2?2:1;if(c.block-=f,!c.fight&&c.block<=0&&c.stun<=0&&le>5&&le<34&&e.speed>c.speed+1&&c.target===c.lane&&K!==c.lane&&Math.abs(K-c.lane)===1&&(e.cars.some(X=>Math.abs(X.x-Je[K])<2.4&&X.z-c.z>-8&&X.z-c.z<30)||(c.target=K,c.block=2.4+i()*1.2,e.time-(c.blockT||-9)>6&&(c.blockT=e.time,o({type:"blocked"})))),c.fightCd-=f,!c.fight&&c.fightCd<=0&&Math.abs(le)<70&&c.stun<=0&&!Pe&&e.raceT>12&&e.graceT<=0&&(c.fight=!0,c.fightT=0),c.fight){c.fightT+=f;let N=K===0||K===2?1:c.x>=e.x?2:0;e.cars.some(X=>Math.abs(X.x-Je[N])<2.4&&X.z-c.z>-6&&X.z-c.z<20)||(c.target=N),ee=rt(e.speed-(le-1.2)*1.1,e.speed*.55,_e*1.5),(c.fightT>4.5||c.stun>.5)&&(c.fight=!1,c.fightCd=(ce?4:7)+i()*3,c.stun<=0&&(c.surge=2.6))}}if(c.stun>0&&(c.stun-=f,ee*=.82),c.guard>0&&(c.guard-=f),c.speed+=rt(ee-c.speed,-16*f,(Pe?30:c.surge>0?16:11)*f),c.x+=rt(Je[c.target]-c.x,-5.5*f,5.5*f),B&&!r.zen&&!e.finale){c.cd-=f;let K=Math.abs(c.z-e.z)<3.6&&Math.abs(c.x-e.x)<3.95,N=(e.cops||[]).some(X=>e.z-X.z<30);if(K&&c.cd<=0&&c.stun<=0&&e.invuln<=0&&e.graceT<=0&&e.raceT>12&&!N&&(c.cd=ce?2.2+i()*1.2:4.5+i()*2,e.graceT=Math.max(e.graceT,2.5),!ce||i()<.85)){let X=Math.sign(e.x-c.x)||1;!e.cars.some(de=>Math.abs(de.z-e.z)<7&&Math.abs(de.x-(e.x+X*2))<2.4)&&(e.vx+=X*(ce?7.5:6.5)),e.speed*=ce?.8:.87,e.shake=ce?.35:.3,ce&&(e.heat=Math.min(100,e.heat+8)),c.fight&&(c.fight=!1,c.fightCd=(ce?4:7)+i()*3,c.surge=2.6),o({type:"struck",x:(c.x+e.x)/2})}}if(B&&!e.finale&&(e.strikeCd-=f,e.swing=Math.max(0,e.swing-f),a.strike&&e.strikeCd<=0)){e.strikeCd=1.1,e.swing=.25,a.strike=!1;let K=X=>Math.abs(X.z-e.z)<6&&Math.abs(X.x-e.x)<4.4,N=(e.cops||[]).find(K);if(K(c)&&c.guard<=0){c.stun=1.2,c.guard=3.2,c.speed*=.8,c.hits++,c.fight=!1,c.surge=0,c.fightCd=4+i()*2;let X=Math.sign(c.x-e.x)||1;e.cars.some(he=>Math.abs(he.z-c.z)<7&&Math.abs(he.x-(c.x+X*1.6))<2.2)||(c.x=rt(c.x+X*1.6,-yo+1,yo-1)),c.target=rt(c.lane+X,0,2),e.score+=400,e.shake=.2,o({type:"strike",x:(c.x+e.x)/2}),r.police!==!1&&!r.zen&&(e.wanted=Math.min(3,e.wanted+.3))}else K(c)?o({type:"parried"}):N?(N.speed*=.5,N.z-=8,N.stun=1.5,e.bust=Math.max(0,(e.bust||0)-.6),e.score+=300,o({type:"strike",cop:!0,x:(N.x+e.x)/2})):o({type:"whiff"})}Math.abs(Je[c.target]-c.x)<.05&&(c.lane=c.target),c.z+=c.speed*f,c.z=rt(c.z,e.z-260,e.z+260);for(let K=0;K<3;K++){let N=!1;for(let he of e.cars)Math.abs(he.z-c.z)<Rt&&Math.abs(he.x-c.x)<Do&&(c.z=he.z-Rt-.1,c.speed=Math.min(c.speed,he.speed),N=!0);let X=c.z-e.z;if(Math.abs(X)<Rt&&Math.abs(c.x-e.x)<Do&&(X>0&&B&&K===0?(c.z=e.z+Rt+.1,c.speed=Math.max(c.speed,e.speed*.98),e.speed>c.speed&&(e.speed=Math.max(c.speed-1,e.speed-8)),e.time-(c.bumpT||-9)>1.5&&(c.bumpT=e.time,r.effects!=="reduced"&&(e.shake=Math.max(e.shake,.15)),o({type:"bump",x:(c.x+e.x)/2}))):(c.z=e.z-Rt-.1,c.speed=Math.min(c.speed,e.speed)),N=!0),!N)break}Math.abs(c.z-e.z)<Rt&&Math.abs(c.x-e.x)<Do&&(c.z=e.z-Rt-.1),B&&c.z-e.z>5&&c.z-e.z<38&&Math.abs(c.x-e.x)<1.3&&e.speed>_e*.45&&(e.draft=Math.min(1.05,e.draft+f*1.5));let fe=c.z>e.z?2:1;fe!==e.pos&&!e.finale&&(e.time-c.swapT>1.2&&e.dist>300&&o({type:fe===1?"overtake":"overtaken"}),c.swapT=e.time,e.pos=fe)}if(e.swarmT>0){e.swarmT-=f;for(let c of e.cops)c.z=e.z+c.off,c.x=rt(e.x+c.side*3.6,-yo,yo),c.speed=e.speed;e.speed=Math.max(0,e.speed-30*f),e.swarmT<=0&&(e.cops=[],e.cop=null)}else if(t==="play"&&r.police!==!1&&!r.zen&&B&&!e.finale){e.cops=e.cops||[],e.speed>_e*.95&&e.raceT>30?e.wanted=Math.min(3,e.wanted+f*.03*(e.speed/_e)):e.cops.length||(e.wanted=Math.max(0,e.wanted-f*.03));let c=Math.floor(e.wanted+1e-6);for(;e.cops.length<c&&e.graceT<=0;)e.cops.push({z:e.z-150-e.cops.length*40,x:Je[e.cops.length%3],target:1,speed:e.speed,slot:e.cops.length,stun:0}),o({type:"police",stars:c});let le=Math.max(1,e.cops.length),ce=e.x<-To/2?0:e.x>To/2?2:1,Fe=0,Ge=1e9;for(let ee of e.cops){let Pe=e.z-ee.z;Ge=Math.min(Ge,Pe);let at=ee.slot===0?0:ee.slot===1?-1:1,x=Math.max(0,Math.min(2,ce+at));ee.target=Pe<30?x:ce;let Z=_e*(1.05+.05*le)*(F.rain&&!b(ee.z)?.97:1),fe=Math.min(Z,Math.max(e.speed*1.04,_e*.9)),K=ee.slot===0?7:0,N=Pe>K+2?fe:e.speed+(Pe-K)*1.5;ee.stun>0&&(ee.stun-=f,N=Math.min(N,e.speed*.8)),ee.speed+=rt(N-ee.speed,-18*f,14*f),ee.x+=rt(Je[ee.target]-ee.x,-6.5*f,6.5*f),ee.z+=ee.speed*f;for(let de of e.cars)Math.abs(de.z-ee.z)<Rt&&Math.abs(de.x-ee.x)<Do&&(ee.z=de.z-Rt-.1,ee.speed=Math.min(ee.speed,de.speed));for(let de of e.cops)de!==ee&&Math.abs(de.z-ee.z)<Rt&&Math.abs(de.x-ee.x)<Do&&(ee.z=de.z-Rt-.1);Math.abs(ee.z-e.z)<Rt&&Math.abs(ee.x-e.x)<Do&&(ee.z=e.z-Rt-.1),ee.z=Math.max(ee.z,e.z-420);let X=Math.abs(ee.z-e.z)<4&&Math.abs(ee.x-e.x)<4.2,he=Pe>0&&Pe<12&&Math.abs(ee.x-e.x)<2.6;X?Fe+=1:he&&(Fe+=.6)}if(e.bust=e.invuln>0?0:Math.max(0,(e.bust||0)+(Fe>0?f*Fe*.5:-f*1)),e.bust>=1){e.lives-=1,e.busts+=1,e.invuln=3.5,e.graceT=5,e.speed*=.4,e.wanted=0,e.bust=0,e.chain=0,e.chaseT=0,e.swarmT=2.2,e.cops=[{off:-6.5,side:0},{off:.8,side:-1},{off:.8,side:1}].map((Pe,at)=>({...Pe,z:e.z+Pe.off,x:e.x+Pe.side*3.6,speed:e.speed,slot:at,target:1,stun:0}));let ee=Math.min(1,e.shards-e.files*5);e.shards-=ee,o({type:"busted",lives:e.lives,lost:ee}),e.lives<=0&&(e.over=!0,o({type:"over",busted:!0,score:Math.round(e.score),files:e.files,dist:e.dist,top:e.topSpeed,nearMisses:e.nearMisses,shards:e.shards}))}if(e.cops.length&&e.swarmT<=0){e.chaseT+=f,e.lost=Ge>160?(e.lost||0)+f:0;let ee=e.chaseT>26+8*le;if(e.lost>2.5||ee){let Pe=1e3*le;e.score+=Pe,e.cops=[],e.wanted=0,e.lost=0,e.chaseT=0,o({type:"escaped",pts:Pe,outlasted:ee})}}else e.lost=0,e.chaseT=0;e.cop=e.cops[0]||null}else e.cops&&e.cops.length&&(e.finale||r.zen||r.police===!1)&&(e.cops=[],e.cop=null,e.wanted=0);if(t==="play"&&!e.finale){for(;e.nextPowerZ<e.z+420;)Ls(u+e.nextPowerZ,130,30)&&(e.nextPowerZ+=170),e.powers.push({id:e.uid++,z:e.nextPowerZ,x:Je[n()*3|0],kind:n()<.5?"ghost":"nitro",taken:!1}),e.nextPowerZ+=650+n()*550;for(let c of e.powers)c.taken||!B||Math.abs(c.z-e.z)<2.6&&Math.abs(c.x-e.x)<1.7&&(c.taken=!0,c.kind==="ghost"?(e.ghost=5,e.invuln=Math.max(e.invuln,5)):(e.slip=2.6,e.heat=0,e.draft=0),o({type:"power",kind:c.kind,x:c.x}));e.powers=e.powers.filter(c=>!c.taken&&c.z>e.z-20)}e.ghost>0&&(e.ghost-=f),e.wheelie>0&&(e.wheelie=Math.max(0,e.wheelie-f)),a.wheelie&&e.car.bike&&B&&e.wheelie<=0&&e.speed>12&&(e.wheelie=1.6,e.score+=150,o({type:"wheelie"})),a.wheelie=!1;for(let c of e.shardList)if(!(c.taken||c.missed))if(c.z<=e.z+1.6&&c.z>=Me-1.6&&Math.abs(c.x-e.x)<1.55){c.taken=!0,e.chain+=1,e.shards+=1;let le=(1+Math.min(4,Math.floor(e.chain/6)))*(Y?2:1);if(e.score+=Math.round(100*le),t==="play"&&(o({type:"shard",mult:le,chain:e.chain,x:c.x}),e.shards%_r===0&&e.files<Ka)){e.files+=1;let ce=e.lives<e.maxLives&&!r.zen;ce&&(e.lives+=1),o({type:"casefile",n:e.files,repaired:ce,lives:e.lives}),e.files===Ka-2&&r.race!==!1&&o({type:"sprint"}),e.files===Ka&&!e.finale&&(e.finale=!0,e.finaleT=0,e.raceWon=r.race===!1?null:e.pos===1,o({type:"finale",won:e.raceWon}))}}else c.z<e.z-3&&(c.missed=!0,t==="play"&&e.chain>0&&(e.chain=0,o({type:"chain-break"})));e.shardList=e.shardList.filter(c=>c.z>e.z-20),H(),B&&(e.score+=e.speed*f*.12*(Y?2:1)),e.over&&(e.overT+=f)}return z(s.seed),{S:e,input:a,step:L,reset:z,curveAt:l,hillAt:h,tunnelAt:b,tunnelNear:M,trackS:m,track:ya,get mode(){return t},setMode(f){t=f},configure(f){let S=f.car&&f.car!==r.car;r={...r,...f},S&&(e.car=ma[r.car]||ma.wedge)},get config(){return r}}}var ie={uCurve:{value:0},uHill:{value:0},uTime:{value:0},uFogColor:{value:new W("#5a1650")},uFogDensity:{value:.004}},Gt=`
uniform float uCurve;
uniform float uHill;
vec4 bendW(vec4 wp) {
  float d = clamp(-wp.z, 0.0, 1200.0);
  wp.x += uCurve * d * d;
  wp.y += uHill * d * d;
  return wp;
}
`,_o=`
uniform vec3 uFogColor;
uniform float uFogDensity;
float fogF(float depth) { float k = uFogDensity * depth; return 1.0 - exp(-k * k); }
`,$o=`
float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
`;function tn(s){return s.onBeforeCompile=o=>{o.uniforms.uCurve=ie.uCurve,o.uniforms.uHill=ie.uHill,o.vertexShader=o.vertexShader.replace("#include <common>",`#include <common>
`+Gt).replace("#include <project_vertex>",`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
  mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
  mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = viewMatrix * bendW( modelMatrix * mvPosition );
gl_Position = projectionMatrix * mvPosition;`)},s.customProgramCacheKey=()=>"bend",s}var ct=s=>tn(new Ue(s)),Ht=s=>tn(new Ee(s));function Za({gain:s=1,fog:o=!0,bent:t=!0,size:r=1}={}){return new we({uniforms:{...ie,uGain:{value:s},uFogOn:{value:o?1:0},uBent:{value:t?1:0},uSize:{value:r}},vertexShader:`
      ${Gt}
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
      }`,fragmentShader:`
      ${_o}
      uniform float uGain; uniform float uFogOn;
      varying vec2 vUv; varying vec3 vCol; varying float vDepth;
      void main() {
        float d = length(vUv - 0.5) * 2.0;
        float a = pow(max(0.0, 1.0 - d), 2.2) + 0.6 * pow(max(0.0, 1.0 - d), 12.0);
        if (uFogOn > 0.5) a *= 1.0 - fogF(vDepth);
        gl_FragColor = vec4(vCol * a * uGain, 1.0);
      }`,transparent:!0,depthWrite:!1,blending:Ke})}function Ja({shape:s="pool",gain:o=1}={}){return new we({uniforms:{...ie,uGain:{value:o},uShape:{value:s==="pool"?0:1}},vertexShader:`
      ${Gt}
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
      }`,fragmentShader:`
      ${_o}
      ${$o}
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
      }`,transparent:!0,depthWrite:!1,blending:Ke,polygonOffset:!0,polygonOffsetFactor:-2})}function on(){return new we({uniforms:{uZenith:{value:new W},uHorizon:{value:new W},uGlow:{value:new W},uFogC:{value:new W},uCityGlow:{value:new W},uStars:{value:0},uCloud:{value:.7},uCloudLit:{value:1},uGlowVar:{value:0},uTime:ie.uTime},vertexShader:`
      varying vec3 vDir;
      void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,fragmentShader:`
      ${$o}
      uniform vec3 uZenith, uHorizon, uGlow, uFogC, uCityGlow; uniform float uStars, uTime, uCloud, uCloudLit, uGlowVar;
      varying vec3 vDir;
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
      float fbm(vec2 p, float oct){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { if (float(i) >= oct) break; s += a * vn(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p + 3.1; a *= 0.5; } return s; }
      void main() {
        vec3 d = normalize(vDir);
        float y = d.y;
        // light-pollution dome
        vec3 col = mix(uHorizon, uZenith, pow(clamp(y, 0.0, 1.0), 0.42));
        // light pollution is uneven: two broad lobes around the compass, so one side of the sky is dirtier than the other
        float az = atan(d.z, d.x);
        float dense = 1.0 + uGlowVar * (0.6 * sin(az * 2.0 + 0.7) + 0.4 * sin(az * 5.0 - 1.9));
        col += uGlow * dense * (exp(-max(y, 0.0) * 14.0) * 0.5 + exp(-max(y, 0.0) * 4.0) * 0.1);
        // low cloud deck, lit from below: bright bellies near the horizon over the city, dark gaps between
        float cov = 0.0;
        if (y > 0.0 && uCloud > 0.0) {
          vec2 cp = d.xz / (y + 0.14) * 0.9 + vec2(uTime * 0.006, uTime * 0.002);
          float oct = mix(3.0, 5.0, smoothstep(0.04, 0.3, y));            // fewer octaves where it is tiny: no shimmer
          float n = fbm(cp, oct);
          cov = smoothstep(0.4, 0.75, n) * smoothstep(0.0, 0.07, y) * uCloud;
          float under = exp(-y * 4.5);
          vec3 cc = uCityGlow * uCloudLit * dense * (0.08 + 0.5 * under) * (0.55 + 0.9 * smoothstep(0.45, 0.85, n)) + uZenith * 0.5;
          col = mix(col, cc, cov);
        }
        col = mix(col, uFogC, smoothstep(0.03, -0.02, y));       // below horizon \u2192 fog
        // stars: few, faint, hidden by cloud and by the glow near the horizon
        vec2 g = vec2(atan(d.z, d.x) * 180.0, y * 180.0);
        vec2 id = floor(g);
        float s = h21(id);
        float tw = 0.6 + 0.4 * sin(uTime * (1.0 + s * 3.0) + s * 50.0);
        float star = step(0.985, s) * smoothstep(0.5, 0.0, length(fract(g) - 0.5)) * tw;
        col += vec3(star) * uStars * smoothstep(0.12, 0.4, y) * (1.0 - cov) * 1.2;
        gl_FragColor = vec4(col, 1.0);
      }`,side:br,depthWrite:!1,fog:!1})}var Ci=new W;function an(s,o){s.uZenith.value.set(o.zenith),s.uHorizon.value.set(o.horizon),s.uGlow.value.set(o.glow),s.uFogC.value.set(o.fog),s.uStars.value=o.stars,s.uCityGlow.value.set(o.glow).lerp(Ci.set(o.windows[1]),.35),s.uCloud.value=o.clouds!=null?o.clouds:.7,s.uCloudLit.value=o.cloudLit!=null?o.cloudLit:1,s.uGlowVar.value=o.glowVar||0}function sn(){return new we({uniforms:{uColor:{value:new W},uSun:{value:0},uGlowC:{value:new W}},vertexShader:"varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`
      ${$o}
      uniform vec3 uColor, uGlowC; uniform float uSun;
      varying vec2 vUv;
      float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
        return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
      void main() {
        vec2 p = (vUv - 0.5) * 2.0;     // quad is 3\xD7 the disc
        float r = length(p) * 3.0;
        float disc = smoothstep(1.0, 0.985, r);
        vec3 col;
        if (uSun > 0.5) {
          // striped sunset disc: gradient top\u2192bottom, slats cut through the lower half
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
      }`,transparent:!0,depthWrite:!1,blending:Ke,fog:!1})}function rn(){return new we({uniforms:{uScale:{value:300}},vertexShader:`
      attribute vec3 aColor; attribute float aSize;
      uniform float uScale;
      varying vec3 vCol;
      void main() {
        vCol = aColor;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * uScale / max(0.1, -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,fragmentShader:`
      varying vec3 vCol;
      void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        float a = pow(max(0.0, 1.0 - d), 2.0);
        gl_FragColor = vec4(vCol * a, 1.0);
      }`,transparent:!0,depthWrite:!1,blending:Ke})}function nn(){return new we({uniforms:{uColor:{value:new W("#00f0ff")},uGain:{value:1.6}},vertexShader:"varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`
      uniform vec3 uColor; uniform float uGain; varying vec2 vUv;
      void main() {
        vec2 p = (vUv - 0.5) * 2.0;
        // a soft, dim spill of light on the asphalt (it used to tone-map into a flat cyan polygon): a gaussian that
        // reaches zero well inside the quad, at roughly a fifth of the old energy
        float d = length(p * vec2(1.0, 0.62));
        float a = exp(-d * d * 3.4) * smoothstep(1.0, 0.5, d);
        gl_FragColor = vec4(uColor * a * uGain * 0.2, 1.0);
      }`,transparent:!0,depthWrite:!1,blending:Ke})}var Et={N:256,STEP:4,NEAR:14},Qa=`
uniform sampler2D uProf;
vec4 prof0(float z) { return texture2D(uProf, vec2((14.0 - z) / 1024.0, 0.25)); }
vec4 prof1(float z) { return texture2D(uProf, vec2((14.0 - z) / 1024.0, 0.75)); }
float deckOf(vec4 p) { return p.r * 64.0 - 24.0; }
`,ht={uProf:{value:null},uS:{value:0},uAmb:{value:new W("#202638")},uUp:{value:new W("#ffb070")},uLampCol:{value:new W("#ffb35a")},uLampPhase:{value:0},uTunCol:{value:new W("#ffc78e")},uSky:{value:new W("#141c40")},uDetail:{value:1}};function _a({gain:s=2,fog:o=!1,bent:t=!1,farFog:r=!0}={}){return new we({uniforms:{...ie,uGain:{value:s},uFogOn:{value:o?1:0},uBent:{value:t?1:0},uFarFog:{value:r?1:0}},vertexShader:`
      ${Gt}
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
      }`,fragmentShader:`
      ${_o}
      uniform float uGain, uFogOn, uFarFog;
      varying vec2 vUv; varying vec3 vCol; varying float vDepth; varying float vOn;
      void main() {
        float d = length(vUv - 0.5) * 2.0;
        float a = pow(max(0.0, 1.0 - d), 2.4) + 0.8 * pow(max(0.0, 1.0 - d), 14.0);
        if (uFogOn > 0.5) a *= 1.0 - fogF(vDepth);
        if (uFarFog > 0.5) a *= 1.0 - 0.75 * clamp(1.0 - exp(-vDepth * 0.0003), 0.0, 1.0);
        gl_FragColor = vec4(vCol * a * uGain * vOn, 1.0);
      }`,transparent:!0,depthWrite:!1,blending:Ke})}function $a(s,{holo:o=!1,bent:t=!0}={}){return new we({uniforms:{...ie,uMap:{value:s},uHolo:{value:o?1:0},uBent:{value:t?1:0}},vertexShader:`
      ${Gt}
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
      }`,fragmentShader:`
      ${_o}
      ${$o}
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
      }`,side:Mt,...o?{transparent:!0,depthWrite:!1,blending:Ke}:{}})}function ln(){return new we({uniforms:{...ie,...ht},vertexShader:`
      ${Gt}
      ${Qa}
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
      }`,fragmentShader:`
      ${_o}
      ${$o}
      ${Qa}
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
      }`.replace("lane_dummy(0.0)","x")})}function cn(){return new we({uniforms:{...ie,...ht,uHeadX:{value:0},uLed:{value:new W("#7fe8ff")}},vertexShader:`
      ${Gt}
      ${Qa}
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
      }`,fragmentShader:`
      ${_o}
      ${$o}
      ${Qa}
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
      }`})}function Ta({color:s="#ff7a2a",color2:o="#ffd9b0",gain:t=1,rings:r=12,panels:a=3,bands:e=0}={}){return new we({uniforms:{...ie,uC1:{value:new W(s)},uC2:{value:new W(o)},uGain:{value:t},uRings:{value:r},uPanels:{value:a},uBands:{value:e}},vertexShader:`
      varying vec2 vF; varying float vDepth; varying float vY;
      void main() {
        vF = uv; vY = position.y;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,fragmentShader:`
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
      }`,transparent:!0,depthWrite:!1,blending:Ke,side:Mt})}var ta=(s,o)=>{let t=document.createElement("canvas");return t.width=s,t.height=o,[t,t.getContext("2d")]};function fn(){let[r,a]=ta(1024,2048),e=eo(4),n=1024/3,i=2048/24;a.fillStyle="#1f1f21",a.fillRect(0,0,1024,2048);for(let p=0;p<40;p++){let H=e()*1024,k=e()*2048,g=(60+e()*160)*2,b=e()<.5?0:255,U=a.createRadialGradient(H,k,0,H,k,g);U.addColorStop(0,`rgba(${b},${b},${b},0.05)`),U.addColorStop(1,`rgba(${b},${b},${b},0)`),a.fillStyle=U;for(let J of[0,2048,-2048])a.save(),a.translate(0,J),a.fillRect(H-g,k-g,g*2,g*2),a.restore()}{let p=a.getImageData(0,0,1024,2048),H=p.data;for(let k=0;k<H.length;k+=4){let g=e(),b=g>.972?78+(g-.972)*1900:H[k]*(.55+g*.95);H[k]=H[k+1]=b,H[k+2]=b+1}a.putImageData(p,0,0)}a.fillStyle="rgba(0,0,0,0.28)",a.fillRect(n*1.12,2048*.58,n*.7,2048*.16),a.strokeStyle="rgba(0,0,0,0.55)",a.lineWidth=2*2,a.strokeRect(n*1.12,2048*.58,n*.7,2048*.16);let u=(p,H,k)=>{let g=a.createLinearGradient(p-H,0,p+H,0);g.addColorStop(0,"rgba(0,0,0,0)"),g.addColorStop(.5,`rgba(0,0,0,${k})`),g.addColorStop(1,"rgba(0,0,0,0)"),a.fillStyle=g,a.fillRect(p-H,0,H*2,2048)};for(let p=0;p<3;p++)u(p*n+n*.27,26*2,.34),u(p*n+n*.73,26*2,.34),u(p*n+n*.5,9*2,.22);a.strokeStyle="rgba(0,0,0,.5)";for(let p=0;p<9;p++){a.lineWidth=(1+e()*1.2)*2,a.beginPath();let H=e()*1024,k=e()*2048*.8;a.moveTo(H,k);for(let g=0;g<6;g++)H+=(e()-.5)*34*2,k+=e()*30*2,a.lineTo(H,k);a.stroke()}let m=(p,H,k,g,b)=>{a.fillStyle="#c4c2bb",a.fillRect(p,H,k,g);for(let U=0,J=k*g*b/(2*2)|0;U<J;U++)a.fillStyle=`rgba(30,30,31,${.12+e()*.3})`,a.fillRect(p+e()*k,H+e()*g,(1+e()*2.2)*2,(2+e()*9)*2)};m(10*2,0,9*2,2048,.05),m(1024-19*2,0,9*2,2048,.05);for(let p=1;p<3;p++)for(let H=0;H<2;H++)m(p*n-4*2,H*(2048/2),8*2,2048/4,.09);let l=(p,H,k)=>{a.fillStyle="#060607",a.fillRect(p-5*2,H-6*2,10*2,12*2),a.fillStyle=k,a.fillRect(p-3*2,H-3*2,6*2,5*2)};for(let p=0;p<2;p++){let H=p*1024+768;for(let k=1;k<3;k++)l(k*n,H,"#f3ead2");l(26*2,H,"#ffc45a"),l(1024-26*2,H,"#ffc45a")}{let p=Math.round(1904.64),H=Math.max(3,Math.round(.09*i));a.fillStyle="rgba(0,0,0,0.6)",a.fillRect(0,p-2*2,1024,H+4*2),a.fillStyle="#34363a",a.fillRect(0,p,1024,H)}let h=new $t(r);h.colorSpace=jt;let[v,E]=ta(256,512);E.fillStyle="rgb(0,154,150)",E.fillRect(0,0,256,512);for(let p=0;p<3;p++)for(let H of[.27,.73]){let k=(p+H)*85.33333333333333,g=E.createLinearGradient(k-14,0,k+14,0);g.addColorStop(0,"rgba(0,150,255,0)"),g.addColorStop(.5,"rgba(0,128,255,0.55)"),g.addColorStop(1,"rgba(0,150,255,0)"),E.fillStyle=g,E.fillRect(k-14,0,28,512)}for(let p=0;p<60;p++){let H=e()*256,k=e()*512,g=10+e()*50,b=20+e()*90,U=E.createRadialGradient(H,k,0,H,k,Math.max(g,b));U.addColorStop(0,"rgba(0,10,255,0.95)"),U.addColorStop(1,"rgba(0,10,255,0)"),E.fillStyle=U,E.beginPath(),E.ellipse(H,k,g,b,0,0,Math.PI*2),E.fill()}{let p=E.getImageData(0,0,256,512),H=p.data;for(let k=0;k<H.length;k+=4)H[k+2]=Math.max(0,Math.min(255,H[k+2]*(.5+e()*.62)));E.putImageData(p,0,0)}let M=new $t(v);for(let p of[h,M])p.wrapS=Hr,p.wrapT=Rs,p.anisotropy=8;return{map:h,rough:M}}function un(s,o){let[t,r]=ta(16,128);r.fillStyle=s,r.fillRect(0,0,16,64),r.fillStyle=o,r.fillRect(0,64,16,64);let a=new $t(t);return a.colorSpace=jt,a.wrapT=Rs,a.magFilter=xo,a}function ba(s="2FAST4U"){let[o,t]=ta(256,64);t.fillStyle="#e9e4d8",t.fillRect(0,0,256,64),t.fillStyle="#0d0d0d",t.fillRect(4,4,248,56),t.fillStyle="#e9e4d8",t.font='400 40px "Share Tech Mono", monospace',t.textAlign="center",t.textBaseline="middle",t.fillText(s,128,34);let r=new $t(o);return r.colorSpace=jt,r}function dn(s,o){let t=new Na;t.background=new W("#05040a");let r=new V(1,1,1),a=(i,u,m,l)=>{let h=new D(r,new Ee({color:new W(i).multiplyScalar(u*.55)}));h.position.set(...m),h.scale.set(...l),t.add(h)};a(o.horizon,1.6,[0,10,-30],[120,6,1]),a(o.zenith,1,[0,30,0],[120,1,120]),a(o.a,4,[-14,4,0],[.4,.4,80]),a(o.b,4,[14,4,0],[.4,.4,80]),a(o.c,2.5,[-20,9,-10],[.3,12,6]),a(o.a,2.5,[22,7,8],[.3,8,5]),a(o.glow,2,[0,6,30],[60,4,1]),a("#ffffff",3,[0,18,-6],[10,.3,.3]);let e=new Pr(s),n=e.fromScene(t,.02);return e.dispose(),t.traverse(i=>i.material&&i.material.dispose()),r.dispose(),n}var oa='"Noto Sans JP", "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif',zi=(s,o,t,r,a,e)=>{let n=a;for(s.font=`${t} ${n}px ${r}`;s.measureText(o).width>e&&n>8;)n-=2,s.font=`${t} ${n}px ${r}`;return n};function vt(s,o,t,r,a,e,n=900,i=oa){zi(s,o,n,i,e,a),s.fillText(o,t,r)}var Ma=(s,o,t,r,a,e)=>{s.beginPath(),s.moveTo(o+e,t),s.arcTo(o+r,t,o+r,t+a,e),s.arcTo(o+r,t+a,o,t+a,e),s.arcTo(o,t+a,o,t,e),s.arcTo(o,t,o+r,t,e),s.closePath()};function Fs(s,o=2048){let[t,r]=ta(o,o),a=new Map,e=[...s].sort((h,v)=>v.h-h.h),n=0,i=0,u=0;for(let h of e){let v=h.w+8,E=h.h+8;if(n+v>o&&(n=0,i+=u,u=0),i+E>o){console.warn("atlas full at",h.id);break}a.set(h.id,[n+4,i+4,h.w,h.h,h]),n+=v,u=Math.max(u,E)}let m=new $t(t);m.colorSpace=jt,m.anisotropy=8,m.generateMipmaps=!0,m.minFilter=Ko;let l=()=>{r.clearRect(0,0,o,o);for(let[,[h,v,E,M,p]]of a){r.save(),r.translate(h,v),r.beginPath(),r.rect(-2,-2,E+4,M+4),r.clip(),r.textAlign="center",r.textBaseline="middle";try{p.draw(r,E,M)}catch{}r.restore();for(let[H,k,g,b,U,J,j,z]of[[h,v,E,1,h,v-4,E,4],[h,v+M-1,E,1,h,v+M,E,4],[h,v,1,M,h-4,v,4,M],[h+E-1,v,1,M,h+E,v,4,M]])r.drawImage(t,H,k,g,b,U,J,j,z)}m.needsUpdate=!0};return l(),{texture:m,has:h=>a.has(h),rect(h){let v=a.get(h);return v?[v[0]/o,1-(v[1]+v[3])/o,v[2]/o,v[3]/o]:[0,0,0,0]},aspect(h){let v=a.get(h);return v?v[2]/v[3]:1},redraw:l}}var oo="#0d7a4a";function ea(s,o,t,r,a,e=!1){s.save(),s.font=`900 ${Math.round(r*.62)}px Rajdhani, "Chakra Petch", sans-serif`;let n=Math.max(r*1.15,s.measureText(a).width+r*.45);return Ma(s,o,t,n,r,r*.2),s.fillStyle=e?"#ffffff":oo,s.fill(),s.lineWidth=Math.max(2,r*.07),s.strokeStyle=e?oo:"#ffffff",s.stroke(),s.fillStyle=e?oo:"#ffffff",s.textAlign="center",s.textBaseline="middle",s.fillText(a,o+n/2,t+r*.55),s.restore(),n}function Ws(s){let[r,a]=s&&s.image?[s.image,s.image.getContext("2d")]:ta(1024,384),e=s||new $t(r);return e.colorSpace=jt,e.anisotropy=8,e.draw=n=>{a.setTransform(1,0,0,1,0,0),a.fillStyle=oo,a.fillRect(0,0,1024,384),a.strokeStyle="#ffffff",a.lineWidth=8,Ma(a,10,10,1004,364,18),a.stroke(),a.fillStyle="#ffffff",a.textBaseline="middle";let i=(u,m,l,h)=>{a.save(),a.translate(u,m),a.rotate(h*.6),a.beginPath(),a.moveTo(0,-l),a.lineTo(l*.62,-l*.28),a.lineTo(l*.2,-l*.28),a.lineTo(l*.2,l),a.lineTo(-l*.2,l),a.lineTo(-l*.2,-l*.28),a.lineTo(-l*.62,-l*.28),a.closePath(),a.fill(),a.restore()};if(!n)a.textAlign="center",ea(a,380,60,110,"C1"),vt(a,"\u90FD\u5FC3\u74B0\u72B6\u7DDA",640,215,700,96),a.font="600 52px Rajdhani, sans-serif",a.fillText("Inner Circular Route",512,310);else if(n.kind==="advance")ea(a,46,46,96,"C1"),a.textAlign="left",vt(a,n.jp,190,120,560,120),a.font="600 56px Rajdhani, sans-serif",a.fillText(n.name,196,222),a.textAlign="right",a.font="700 92px Rajdhani, sans-serif",a.fillText(n.dist,974,120),a.textAlign="left",a.font='500 40px "Noto Sans JP", sans-serif',a.fillText("\u5185\u56DE\u308A  Inner Loop",196,300);else{a.fillStyle="#ffffff",a.fillRect(1024*.56,30,6,324);let u=n.branches||[];u.forEach((m,l)=>{let h=u.length>1?70+l*150:110;i(70,h+40,46,-1);let v=ea(a,120,h-10,78,m[0]);a.textAlign="left",vt(a,m[1],140+v,h+22,400-v,84),a.font="600 40px Rajdhani, sans-serif",a.fillText(m[2],142+v,h+86)}),i(1024*.56+70,190,64,0),ea(a,1024*.56+130,60,92,"C1"),a.textAlign="left",vt(a,n.next||"\u90FD\u5FC3\u74B0\u72B6\u7DDA",1024*.56+130,225,300,72),a.font="600 40px Rajdhani, sans-serif",a.fillText(n.nextEn||"Inner Loop",1024*.56+132,295),a.font='700 30px "Noto Sans JP", sans-serif',a.textAlign="right",a.fillText(n.jp,984,340)}e.needsUpdate=!0},e}function Lo(s,o=!1){let t=s[0].index!==null,r=new Set(Object.keys(s[0].attributes)),a=new Set(Object.keys(s[0].morphAttributes)),e={},n={},i=s[0].morphTargetsRelative,u=new dt,m=0;for(let l=0;l<s.length;++l){let h=s[l],v=0;if(t!==(h.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+l+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let E in h.attributes){if(!r.has(E))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+l+'. All geometries must have compatible attributes; make sure "'+E+'" attribute exists among all geometries, or in none of them.'),null;e[E]===void 0&&(e[E]=[]),e[E].push(h.attributes[E]),v++}if(v!==r.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+l+". Make sure all geometries have the same number of attributes."),null;if(i!==h.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+l+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let E in h.morphAttributes){if(!a.has(E))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+l+".  .morphAttributes must be consistent throughout all geometries."),null;n[E]===void 0&&(n[E]=[]),n[E].push(h.morphAttributes[E])}if(o){let E;if(t)E=h.index.count;else if(h.attributes.position!==void 0)E=h.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+l+". The geometry must have either an index or a position attribute"),null;u.addGroup(m,E,l),m+=E}}if(t){let l=0,h=[];for(let v=0;v<s.length;++v){let E=s[v].index;for(let M=0;M<E.count;++M)h.push(E.getX(M)+l);l+=s[v].attributes.position.count}u.setIndex(h)}for(let l in e){let h=hn(e[l]);if(!h)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+l+" attribute."),null;u.setAttribute(l,h)}for(let l in n){let h=n[l][0].length;if(h===0)break;u.morphAttributes=u.morphAttributes||{},u.morphAttributes[l]=[];for(let v=0;v<h;++v){let E=[];for(let p=0;p<n[l].length;++p)E.push(n[l][p][v]);let M=hn(E);if(!M)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+l+" morphAttribute."),null;u.morphAttributes[l].push(M)}}return u}function hn(s){let o,t,r,a=-1,e=0;for(let m=0;m<s.length;++m){let l=s[m];if(o===void 0&&(o=l.array.constructor),o!==l.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=l.itemSize),t!==l.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(r===void 0&&(r=l.normalized),r!==l.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(a===-1&&(a=l.gpuType),a!==l.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;e+=l.count*t}let n=new o(e),i=new Xt(n,t,r),u=0;for(let m=0;m<s.length;++m){let l=s[m];if(l.isInterleavedBufferAttribute){let h=u/t;for(let v=0,E=l.count;v<E;v++)for(let M=0;M<t;M++){let p=l.getComponent(v,M);i.setComponent(v+h,M,p)}}else n.set(l.array,u);u+=l.count*t}return a!==void 0&&(i.gpuType=a),i}function aa(s,o=1e-4){o=Math.max(o,Number.EPSILON);let t={},r=s.getIndex(),a=s.getAttribute("position"),e=r?r.count:a.count,n=0,i=Object.keys(s.attributes),u={},m={},l=[],h=["getX","getY","getZ","getW"],v=["setX","setY","setZ","setW"];for(let g=0,b=i.length;g<b;g++){let U=i[g],J=s.attributes[U];u[U]=new J.constructor(new J.array.constructor(J.count*J.itemSize),J.itemSize,J.normalized);let j=s.morphAttributes[U];j&&(m[U]||(m[U]=[]),j.forEach((z,G)=>{let L=new z.array.constructor(z.count*z.itemSize);m[U][G]=new z.constructor(L,z.itemSize,z.normalized)}))}let E=o*.5,M=Math.log10(1/o),p=Math.pow(10,M),H=E*p;for(let g=0;g<e;g++){let b=r?r.getX(g):g,U="";for(let J=0,j=i.length;J<j;J++){let z=i[J],G=s.getAttribute(z),L=G.itemSize;for(let f=0;f<L;f++)U+=`${~~(G[h[f]](b)*p+H)},`}if(U in t)l.push(t[U]);else{for(let J=0,j=i.length;J<j;J++){let z=i[J],G=s.getAttribute(z),L=s.morphAttributes[z],f=G.itemSize,S=u[z],F=m[z];for(let q=0;q<f;q++){let B=h[q],Q=v[q];if(S[Q](n,G[B](b)),L)for(let Y=0,_=L.length;Y<_;Y++)F[Y][Q](n,L[Y][B](b))}}t[U]=n,l.push(n),n++}}let k=s.clone();for(let g in s.attributes){let b=u[g];if(k.setAttribute(g,new b.constructor(b.array.slice(0,n*b.itemSize),b.itemSize,b.normalized)),g in m)for(let U=0;U<m[g].length;U++){let J=m[g][U];k.morphAttributes[g][U]=new J.constructor(J.array.slice(0,n*J.itemSize),J.itemSize,J.normalized)}}return k.setIndex(l),k}var Ra=new ne;function Dt(s,o,t,r,a,e){let n=2*Math.PI*a/4,i=Math.max(e-2*a,0),u=Math.PI/4;Ra.copy(o),Ra[r]=0,Ra.normalize();let m=.5*n/(n+i),l=1-Ra.angleTo(s)/u;return Math.sign(Ra[t])===1?l*m:i/(n+i)+m+m*(1-l)}var tt=class extends V{constructor(o=1,t=1,r=1,a=2,e=.1){if(a=a*2+1,e=Math.min(o/2,t/2,r/2,e),super(1,1,1,a,a,a),a===1)return;let n=this.toNonIndexed();this.index=null,this.attributes.position=n.attributes.position,this.attributes.normal=n.attributes.normal,this.attributes.uv=n.attributes.uv;let i=new ne,u=new ne,m=new ne(o,t,r).divideScalar(2).subScalar(e),l=this.attributes.position.array,h=this.attributes.normal.array,v=this.attributes.uv.array,E=l.length/6,M=new ne,p=.5/a;for(let H=0,k=0;H<l.length;H+=3,k+=2)switch(i.fromArray(l,H),u.copy(i),u.x-=Math.sign(u.x)*p,u.y-=Math.sign(u.y)*p,u.z-=Math.sign(u.z)*p,u.normalize(),l[H+0]=m.x*Math.sign(i.x)+u.x*e,l[H+1]=m.y*Math.sign(i.y)+u.y*e,l[H+2]=m.z*Math.sign(i.z)+u.z*e,h[H+0]=u.x,h[H+1]=u.y,h[H+2]=u.z,Math.floor(H/E)){case 0:M.set(1,0,0),v[k+0]=Dt(M,u,"z","y",e,r),v[k+1]=1-Dt(M,u,"y","z",e,t);break;case 1:M.set(-1,0,0),v[k+0]=1-Dt(M,u,"z","y",e,r),v[k+1]=1-Dt(M,u,"y","z",e,t);break;case 2:M.set(0,1,0),v[k+0]=1-Dt(M,u,"x","z",e,o),v[k+1]=Dt(M,u,"z","x",e,r);break;case 3:M.set(0,-1,0),v[k+0]=1-Dt(M,u,"x","z",e,o),v[k+1]=1-Dt(M,u,"z","x",e,r);break;case 4:M.set(0,0,1),v[k+0]=1-Dt(M,u,"x","y",e,o),v[k+1]=1-Dt(M,u,"y","x",e,t);break;case 5:M.set(0,0,-1),v[k+0]=Dt(M,u,"x","y",e,o),v[k+1]=1-Dt(M,u,"y","x",e,t);break}}};var ao=(s,o)=>new W(s).multiplyScalar(o),Ha=new ne(0,1,0);function so(s,o,t,r=.07,a=16){let e=new ga;s(e);let n=Math.max(.01,t-r*2),i=new Va(e,{depth:n,bevelEnabled:r>0,bevelThickness:r,bevelSize:r*.85,bevelSegments:4,curveSegments:a,steps:1});return i.translate(-o/2,0,-n/2),i.rotateY(Math.PI/2),i.deleteAttribute("uv"),i.deleteAttribute("normal"),i=aa(i,1e-4),i.computeVertexNormals(),i}function Is(){let s={},o={add(t,r,a,e,n){let i=r.index?r:aa(r);i.attributes.uv&&i.deleteAttribute("uv"),i.attributes.uv1&&i.deleteAttribute("uv1");let u=new xt().compose(a?new ne(...a):new ne,e?e.isQuaternion?e:new Ie().setFromEuler(new Jt(...e)):new Ie,n?new ne(...n):new ne(1,1,1));return(s[t]||(s[t]=[])).push(i.clone().applyMatrix4(u)),o},rod(t,r,a,e,n=10){let i=new ne(...r),u=new ne(...a),m=i.distanceTo(u),l=new Ae(e,e,m,n,1),h=new Ie().setFromUnitVectors(Ha,u.clone().sub(i).normalize()),v=i.clone().add(u).multiplyScalar(.5);return o.add(t,l,[v.x,v.y,v.z],h)},tube(t,r,a,e=40){let n=new Ua(r.map(i=>new ne(...i)));return o.add(t,new Xa(n,e,a,10,!1))},build(t,r){for(let[a,e]of Object.entries(s)){let n=new D(Lo(e,!1),r[a]);n.name=a,t.add(n)}}};return o}function pn({R:s,width:o,rimR:t,spokes:r,spokeStyle:a="straight",mats:e,disc:n=null,glowRing:i=!1}){let u=new Be,m=[],l=o/2,h=s-t;for(let p=0;p<=12;p++){let H=p/12*Math.PI;m.push(new Se(t+h*(.15+.85*Math.sin(H)),-l+o*(p/12)))}let v=new ks(m,40).rotateZ(Math.PI/2);u.add(new D(v,e.tyre));let E=[new Se(t*.98,-l*.9),new Se(t,-l*.95),new Se(t*1.02,-l*.8),new Se(t*.96,l*.6),new Se(t*1.02,l*.85),new Se(t,l*.95)];u.add(new D(new ks(E,36).rotateZ(Math.PI/2),e.rim));let M=Is();for(let p=0;p<r;p++){let H=p/r*Math.PI*2;if(a==="y")for(let k of[-.16,.16]){let g=new Ie().setFromEuler(new Jt(H+k*.5,0,0)),b=new ne(0,t*.52,0).applyQuaternion(g);M.add("rim",new V(o*.35,t*.62,.028),[l*.25,b.y,b.z],g)}else{let k=new Ie().setFromEuler(new Jt(H,0,0)),g=new ne(0,t*.52,0).applyQuaternion(k);M.add("rim",new V(o*.28,t*.95,.03),[l*.3,g.y,g.z],k)}}if(M.add("rim",new Ae(t*.2,t*.2,o*.5,20).rotateZ(Math.PI/2),[l*.25,0,0]),M.add("metal",new Ae(t*.08,t*.08,o*.55,12).rotateZ(Math.PI/2),[l*.3,0,0]),n)for(let p of n.xs){M.add("disc",new Ae(n.r,n.r,.012,40).rotateZ(Math.PI/2),[p,0,0]),M.add("metal",new Ae(n.r*.55,n.r*.55,.016,24).rotateZ(Math.PI/2),[p,0,0]);for(let H=0;H<18;H++){let k=H/18*Math.PI*2;M.add("tyre",new Ae(.009,.009,.016,6).rotateZ(Math.PI/2),[p+.002,Math.cos(k)*n.r*.78,Math.sin(k)*n.r*.78])}}if(M.build(u,e),i)for(let p of[-l*.92,l*.92]){let H=new D(new Qo(t*1.01,.008,6,48).rotateY(Math.PI/2),e.glow);H.position.x=p,u.add(H)}return u}function mn(s,o){return{paint:new Pt({color:s.body,emissive:s.body,emissiveIntensity:.08,metalness:.35,roughness:.32,clearcoat:1,clearcoatRoughness:.05,envMapIntensity:1}),stripe:new Pt({color:s.stripe,metalness:.2,roughness:.4,clearcoat:1,polygonOffset:!0,polygonOffsetFactor:-1}),trim:new Ue({color:s.trim,metalness:.6,roughness:.35}),carbon:new Ue({color:"#141418",metalness:.5,roughness:.45}),glass:new Pt({color:"#06060c",metalness:.9,roughness:.04,envMapIntensity:2.2}),tyre:new Ue({color:"#0c0c0f",roughness:.82}),rim:new Ue({color:"#2a2a32",metalness:.85,roughness:.28}),metal:new Ue({color:"#9aa0ad",metalness:1,roughness:.25}),disc:new Ue({color:"#7d828c",metalness:1,roughness:.42}),caliper:new Ue({color:"#d5161f",emissive:"#d5161f",emissiveIntensity:.15,metalness:.3,roughness:.35}),gold:new Ue({color:"#c9a03a",metalness:1,roughness:.3}),frame:new Ue({color:"#c8102e",emissive:"#c8102e",emissiveIntensity:.12,metalness:.4,roughness:.32}),engine:new Ue({color:"#2b2c33",metalness:.85,roughness:.38}),pipe:new Ue({color:"#8e7f74",metalness:1,roughness:.3,emissive:"#2a1a40",emissiveIntensity:.25}),suit:new Ue({color:"#232029",roughness:.5,metalness:.3}),suitAccent:new Ue({color:s.stripe,emissive:s.stripe,emissiveIntensity:.12,roughness:.4}),helmet:new Pt({color:s.body,emissive:s.body,emissiveIntensity:.12,metalness:.3,roughness:.15,clearcoat:1}),tail:new Ee({color:ao("#ff1a3c",6)}),tailDim:new Ee({color:ao("#ff1a3c",1.6)}),head:new Ee({color:ao("#e8f4ff",5)}),amber:new Ee({color:ao("#ffa000",2.5)}),glow:new Ee({color:ao(o||s.stripe,2.4)}),exGlow:new Ee({color:ao("#ff6a00",.9)})}}function vn(s,o=1){let t=new Ee({color:ao("#4fd8ff",3),transparent:!0,opacity:.9,blending:Ke,depthWrite:!1});return s.map(([r,a,e])=>{let n=new D(new Po(.055*o,.45*o,12,1,!0),t);return n.rotation.x=Math.PI/2,n.position.set(r,a,e),n.visible=!1,n})}function xn(s,o,t,r=26){let a=null;o&&(a=new Zo(new W(o),r,9,1.6),a.position.set(0,.3,0),s.add(a));let e=new Zo(new W("#ff1a3c"),1.2,6,2);return e.position.set(0,.25,t+1.8),e.intensity=0,{glowLight:a,tailLight:e}}function gn(s,o){let e=new Be,n=mn(s,o),i=3.53,u=1,m=.46,l=.38,h=4.4/2-i,v=4.4/2-u,E=(f,S)=>{let F=-Math.asin((l-.22)/m);f.lineTo(S+Math.cos(F)*m,.22),f.absarc(S,l,m,F,Math.PI-F,!1)},M=f=>{f.moveTo(.05,.3),f.lineTo(0,.64),f.quadraticCurveTo(.02,.84,.3,.86),f.lineTo(1.5,.89),f.quadraticCurveTo(2.6,.92,3.25,.8),f.lineTo(4.36,.5),f.lineTo(4.44,.43),f.lineTo(4.36,.27),f.lineTo(4.05,.22),E(f,i),f.lineTo(1.3,.22),E(f,u),f.lineTo(.14,.22),f.quadraticCurveTo(.05,.22,.05,.3)},p=Is(),H=f=>{let S=f.attributes.position;for(let F=0;F<S.count;F++){let q=S.getZ(F),B=Math.min(1,Math.max(0,(-q-1.55)/.7));S.setX(F,S.getX(F)*(1-.2*B*B))}return S.needsUpdate=!0,f.computeVertexNormals(),f};p.add("paint",H(so(M,4.4,1.82,.085,20)));let g=new Cr().setFromBufferAttribute(new D(so(M,4.4,1.82,.085)).geometry.attributes.position).max.z,b=H(so(M,4.4,.34,0));p.add("stripe",b,[0,0,0],null,[1,1.008,1.006]),p.add("glass",so(f=>{f.moveTo(1.45,.88),f.quadraticCurveTo(1.85,1.15,2.4,1.17),f.lineTo(2.75,1.16),f.quadraticCurveTo(3.05,1.1,3.32,.79),f.lineTo(1.45,.88)},4.4,1.36,.06));for(let f of[-1,1]){p.add("carbon",new V(.06,.09,2.02),[f*(1.82/2+.005),.25,0]),p.add("carbon",new V(.05,.18,.62),[f*(1.82/2+.01),.52,.62],[.12*f,0,0]);for(let S=0;S<4;S++)p.add("trim",new V(.052,.012,.56),[f*(1.82/2+.02),.45+S*.045,.62]);p.add("carbon",new V(.02,.5,.012),[f*(1.82/2+.003),.62,-.38]),p.add("carbon",new V(.02,.012,1.1),[f*(1.82/2+.003),.86,-.05]),p.rod("carbon",[f*.66,.88,-.9],[f*.92,.94,-.93],.015),p.add("paint",new tt(.18,.08,.12,2,.03),[f*.97,.95,-.93])}for(let f=0;f<6;f++)p.add("carbon",new V(1.2,.02,.06),[0,.9-f*.004,.95+f*.15],[-.04,0,0]);p.add("carbon",new V(1.82*.98,.04,.36),[0,1.06,g-.4],[-.07,0,0]),p.add("carbon",new V(1.82*.98,.012,.12),[0,1.09,g-.23],[-.5,0,0]);for(let f of[-1,1])p.rod("carbon",[f*.5,.92,g-.28],[f*.46,1.18,g-.5],.025),p.add("carbon",new V(.025,.2,.42),[f*1.82*.49,1.15,g-.42]);p.add("carbon",new V(1.82*.86,.12,.5),[0,.23,g-.25],[.2,0,0]);for(let f=-3;f<=3;f++)p.add("carbon",new V(.018,.17,.42),[f*.2,.27,g-.14]);p.add("carbon",new V(1.82*.96,.025,.42),[0,.2,-4.4/2-.02]);for(let f of[-1,1])p.add("carbon",new V(.02,.12,.4),[f*1.82*.47,.26,-4.4/2-.02]);for(let f of[-.42,-.28,.28,.42])p.add("metal",new Ae(.052,.052,.16,18,1,!0).rotateX(Math.PI/2),[f,.33,g-.06]),p.add("exGlow",new go(.04,16),[f,.33,g+.015]);p.add("tail",new V(1.82*.86,.2,.03),[0,.73,g-.03]);for(let f=0;f<6;f++)p.add("carbon",new V(1.82*.89,.016,.05),[0,.645+f*.034,g-0]);p.add("trim",new V(1.82*.91,.03,.06),[0,.845,g-.01]),p.add("trim",new V(1.82*.91,.03,.06),[0,.615,g-.01]);for(let f of[-1,1])p.add("tail",new V(.06,.2,.04),[f*1.82*.44,.64,g-.03]);p.add("tail",new V(.36,.025,.03),[0,.93,g-.35]),p.add("glass",new Le(1.82*.74,.25),[0,.47,g+.005]);for(let f of[-1,1]){for(let S=0;S<5;S++)p.add("paint",new V(.045,.022,1.05-S*.05),[f*(1.82/2+.02),.44+S*.065,.2+S*.025]);p.add("carbon",new V(.02,.33,1.05),[f*(1.82/2-.005),.57,.22]),p.add("stripe",new V(.03,.035,2.3),[f*(1.82/2+.035),.2,-.05]),p.add("head",new V(.34,.03,.04),[f*1.82*.32,.53,-4.4/2+.14],[Math.atan2(.3,1.11),f*.35,f*.12])}p.add("stripe",new V(1.82*.96,.02,.05),[0,.19,-4.4/2-.21]);let U=Math.atan2(.3,1.11);p.add("carbon",new V(1.82*.86,.075,.05),[0,.505,-4.4/2+.01],[U,0,0]),p.add("head",new V(1.82*.8,.022,.03),[0,.512,-4.4/2-.005],[U,0,0]);for(let f of[-1,1])p.add("head",new V(.05,.05,.03),[f*1.82*.41,.5,-4.4/2+0],[U,0,0]);p.add("carbon",new V(1.82*.56,.06,.06),[0,.33,-4.4/2-.03]),p.add("carbon",new V(1.82*.72,.12,.05),[0,.355,-4.4/2-.03]),p.add("head",new V(1.82*.66,.04,.03),[0,.365,-4.4/2-.06]);for(let f of[-1,1])p.add("amber",new V(.08,.04,.03),[f*1.82*.35,.365,-4.4/2-.055]);for(let f of[-1,1])p.add("carbon",new V(.22,.09,.04),[f*1.82*.33,.3,-4.4/2+.02],[0,f*.5,0]);for(let[f,S]of[[h,-1],[h,1],[v,-1],[v,1]])p.add("caliper",new tt(.06,.16,.1,2,.02),[S*(1.82/2-.17),.48,f-.06]);p.build(e,n);let J=new D(new Le(.5,.125),new Ee({map:ba(),color:ao("#ffffff",.9)}));J.position.set(0,.47,g+.012),e.add(J);let j=[];for(let f of[h,v])for(let S of[-1,1]){let F=pn({R:.38,width:.29,rimR:.29,spokes:10,mats:n,disc:{r:.18,xs:[-.06*S]},glowRing:!!o});S<0&&(F.rotation.y=Math.PI);let q=new Be;q.add(F),q.userData={spin:F,sign:S<0?-1:1},q.position.set(S*(1.82/2-.12),.38,f),e.add(q),j.push(q)}let z=vn([[-.35,.33,g+.3],[.35,.33,g+.3]]);z.forEach(f=>e.add(f));let{glowLight:G,tailLight:L}=xn(e,null,g);return{group:e,wheels:j,flames:z,M:n,glowLight:G,tailLight:L,length:4.4,width:1.82,wheelR:.38,rearZ:g,tailY:.74,tailHalfW:1.82*.42}}function wn(s,o,t="monster"){let r=t==="roadster",a=r?"metal":"frame",e=new Be,n=mn(s,o),i=.31,u=-.74,m=.72,l=Is(),h=(w,C,O)=>[w,C,O];for(let w of[-1,1]){let C=h(w*.07,.94,-.5),O=h(w*.07,.76,-.45),$=h(w*.13,.9,.08),se=h(w*.15,.66,-.2),re=h(w*.15,.48,.1),ye=h(w*.13,.78,-.08);for(let[c,le]of[[C,ye],[ye,$],[O,se],[se,re],[C,se],[se,ye],[ye,re],[$,re],[O,C]])l.rod(a,c,le,.016);l.rod(a,$,[w*.09,.98,.62],.013),l.rod(a,re,[w*.09,.9,.55],.012)}l.rod(a,[-.13,.9,.08],[.13,.9,.08],.014),l.rod(a,[-.15,.48,.1],[.15,.48,.1],.02),l.add(a,new Ae(.045,.045,.22,16),[0,.86,-.49],[-.42,0,0]),l.add("engine",new tt(.3,.26,.44,3,.06),[0,.38,-.06]);let v=(w,C)=>{let O=new ne(0,Math.cos(C),-Math.sin(C));for(let se=0;se<9;se++){let re=new ne(...w).addScaledVector(O,.02+se*.026);l.add("engine",new Ae(.11,.11,.008,20),[re.x,re.y,re.z],new Ie().setFromUnitVectors(Ha,O))}let $=new ne(...w).addScaledVector(O,.27);return l.add("engine",new tt(.2,.08,.17,2,.03),[$.x,$.y,$.z],new Ie().setFromUnitVectors(Ha,O)),l.add("metal",new Ae(.08,.08,.24,16),[$.x*.5+w[0]*.5,($.y+w[1])/2,($.z+w[2])/2],new Ie().setFromUnitVectors(Ha,O)),$},E=v([0,.45,-.22],1),M=v([0,.5,0],-.25);l.add("engine",new Ae(.12,.12,.05,28).rotateZ(Math.PI/2),[.17,.38,-.02]),l.add("metal",new Ae(.07,.07,.055,20).rotateZ(Math.PI/2),[.19,.38,-.02]),l.add("carbon",new V(.36,.3,.05),[0,.6,-.56],[.25,0,0]);for(let w=0;w<9;w++)l.add("metal",new V(.34,.006,.055),[0,.47+w*.03,-.56-w*.0077],[.25,0,0]);l.tube("pipe",[[E.x,E.y-.04,E.z-.04],[.02,.32,-.48],[.04,.17,-.25],[.05,.18,.12],[.06,.4,.42],[.04,.7,.6]],.026),l.tube("pipe",[[M.x,M.y,M.z+.06],[.08,.56,.22],[.07,.52,.4],[.04,.72,.58]],.024);let p=r?[[0,.74,.932],[0,.86,.932]]:[[.21,.5,.86],[.21,.63,.83]];if(r)for(let[w,C]of[[.74,.05],[.86,.045]])l.add("pipe",new Ae(C,C*1.08,.38,20).rotateX(Math.PI/2),[0,w,.74]),l.add("exGlow",new go(C*.7,16),[0,w,.932]);else{for(let[w,C]of[[.5,.66],[.63,.63]])l.add("pipe",new Ae(.05,.056,.42,20).rotateX(Math.PI/2-.22),[.21,w,C]),l.add("carbon",new Ae(.058,.058,.05,20).rotateX(Math.PI/2-.22),[.21,w+.045,C+.2]),l.add("exGlow",new go(.036,16).rotateX(-.22),[.21,w+.05,C+.23]);l.tube("pipe",[[.06,.4,.42],[.18,.44,.5],[.21,.47,.5]],.024)}let H=r?w=>{w.moveTo(0,0),w.quadraticCurveTo(.06,.16,.36,.19),w.quadraticCurveTo(.62,.19,.72,.08),w.lineTo(.7,-.04),w.quadraticCurveTo(.34,-.06,0,0)}:w=>{w.moveTo(0,0),w.quadraticCurveTo(.06,.15,.3,.19),w.quadraticCurveTo(.56,.2,.68,.1),w.lineTo(.66,-.04),w.quadraticCurveTo(.33,-.07,0,0)},k=r?.4:.46,g=w=>{w.computeBoundingBox();let C=w.boundingBox,O=w.attributes.position;for(let $=0;$<O.count;$++){let se=(O.getZ($)-C.min.z)/(C.max.z-C.min.z||1),re=Math.min(1,Math.max(0,se));O.setX($,O.getX($)*(.42+.58*Math.sin(Math.min(1,(1-re)*1.25+.05)*Math.PI/2)))}return O.needsUpdate=!0,w.computeVertexNormals(),w};if(l.add("paint",g(so(H,.66,k,.08)),[0,.86,-.2],null,[1,.72,1]),l.add("stripe",g(so(H,.66,r?.06:.1,0)),[0,.862,-.2],null,[1,.74,1]),!r)for(let w of[-1,1])l.add("carbon",new tt(.025,.09,.2,2,.01),[w*(k/2-.02),.89,-.1]);let b=w=>{w.moveTo(0,0),w.lineTo(.38,.02),w.quadraticCurveTo(.46,.06,.48,.1),w.lineTo(.02,.07),w.lineTo(0,0)};l.add("carbon",so(b,.48,.3,.03),[0,.92,.3]);let U=w=>{w.moveTo(0,0),w.lineTo(.5,.02),w.quadraticCurveTo(.6,.06,.62,.16),w.lineTo(.08,.1),w.quadraticCurveTo(0,.06,0,0)};l.add("paint",so(U,.62,.26,.04),[0,.9,.62]);let J=.93;{let w=new ga;w.moveTo(-.14,0),w.lineTo(0,.07),w.lineTo(.14,0),w.lineTo(.1,-.02),w.lineTo(0,.03),w.lineTo(-.1,-.02),w.closePath(),l.add("tail",new Nr(w).scale(.75,.75,1),[0,1,J+.012],[-.25,0,0])}l.rod("carbon",[0,.92,.88],[0,.62,1.02],.012);for(let w of[-1,1])l.add("amber",new V(.04,.02,.02),[w*.1,.66,1.02]);let j=.42,z=[0,.98,-.53],G=[0,i,u];for(let w of[-1,1]){let C=[w*.085,z[1],z[2]],O=[w*.085,G[1],G[2]],$=[w*.085,(C[1]+O[1])*.5+.06,(C[2]+O[2])*.5-.02];l.rod("carbon",C,$,.03,14),l.rod("gold",$,[w*.085,G[1]+.05,G[2]+.01],.026,14),l.add("caliper",new tt(.04,.16,.07,2,.015),[w*.105,G[1]+.13,G[2]+.12],[j,0,0])}l.add("engine",new V(.24,.035,.1),[0,.98,-.53],[j,0,0]),l.add("engine",new V(.24,.03,.09),[0,.86,-.58],[j,0,0]),l.add("paint",so(w=>{w.moveTo(0,0),w.quadraticCurveTo(.2,.12,.42,.04),w.lineTo(.4,0),w.quadraticCurveTo(.2,.08,.02,-.03),w.lineTo(0,0)},.42,.14,.01),[0,.6,u-.02]);let L=new Ie().setFromEuler(new Jt(Math.PI/2-.15,0,0));for(let[w,C]of r?[[-.075,.068],[.075,.068]]:[[0,.1]])l.add("carbon",new Ae(C+.014,C*.75,.11,24),[w,.88,-.66],L),l.add("metal",new Qo(C+.004,.009,8,28),[w,.886,-.718],[-.15,0,0]),l.add("head",new go(C,24),[w,.886,-.72],[Math.PI-.15,0,0]);for(let w of[-1,1])l.rod("carbon",[w*.05,1,-.5],[w*.06,1.07,-.48],.016),l.rod("metal",[w*.06,1.07,-.48],[w*.37,1.09,-.42],.013),l.rod("carbon",[w*.3,1.09,-.43],[w*.39,1.09,-.41],.019),l.rod("carbon",[w*.24,1.09,-.45],[w*.3,1.27,-.47],.007),l.add("carbon",new tt(.1,.055,.02,2,.01),[w*.31,1.29,-.47]);l.add("engine",new tt(.07,.11,.66,2,.025),[-.13,.4,.42],[.12,0,0]),l.add("metal",new Ae(.07,.07,.07,20).rotateZ(Math.PI/2),[-.12,i,m]);let f=[];for(let w=0;w<=24;w++){let C=w/24*Math.PI*2;f.push([.12,.38+Math.sin(C)*.07,.36+Math.cos(C)*.36])}l.tube("carbon",f,.008,60),l.add("caliper",new tt(.04,.09,.08,2,.015),[-.1,i+.17,m+.04]);let S=(w,C,O,$)=>{let se=new ne(...w),re=new ne(...C),ye=se.distanceTo(re);l.add($,new Bs(O,Math.max(.01,ye-O*2),6,12),[(se.x+re.x)/2,(se.y+re.y)/2,(se.z+re.z)/2],new Ie().setFromUnitVectors(Ha,re.clone().sub(se).normalize()))};S([0,1.06,.34],[0,1.4,-.04],.16,"suit");for(let w of[-1,1])S([w*.19,1.36,-.02],[w*.3,1.2,-.3],.055,"suit"),S([w*.3,1.2,-.3],[w*.35,1.1,-.42],.04,"carbon"),S([w*.14,1.04,.3],[w*.24,.9,-.08],.075,"suit"),S([w*.24,.9,-.08],[w*.2,.58,.24],.06,"suit"),S([w*.2,.58,.24],[w*.2,.55,.33],.045,"carbon"),l.add("carbon",new Bt(.06,10,8),[w*.2,1.38,-.02]);let F=-.14,q=1.56;for(let w of[-1,1])l.add("glow",new V(.006,.09,.006),[w*.165,q-.03,F-.1],[.5,0,0]);l.add("glow",new Ae(.158,.158,.03,32,1,!0,Math.PI*.6,Math.PI*.8),[0,q+.005,F],null,[1,1,1.16]),l.add("stripe",new V(.035,.012,.32),[0,q+.148,F+.01],[.08,0,0]);for(let w of[-1,1])l.add("carbon",new tt(.02,.05,.08,2,.008),[w*.145,q+.01,F+.03]);l.build(e,n);{let w=new Pt({color:"#07070c",metalness:.4,roughness:.18,clearcoat:1,clearcoatRoughness:.04,flatShading:!0}),C=new D(new Bt(.152,28,20),new Pt({color:"#08080d",metalness:.5,roughness:.15,clearcoat:1,clearcoatRoughness:.03}));C.position.set(0,q,F),C.scale.set(1.12,1.06,1.3),e.add(C);let O=new D(new Ae(.075,.09,.12,12),w);O.position.set(0,q-.15,F+.03),e.add(O);let $=new D(new Po(.1,.18,4),w);$.position.set(0,q-.085,F-.12),$.rotation.set(-Math.PI/2-.45,Math.PI/4,0),$.scale.set(1.25,1,.65),e.add($);let se=new D(new Ae(.157,.157,.075,24,1,!0,Math.PI*.64,Math.PI*.72),new Pt({color:"#020205",metalness:.95,roughness:.04,side:Mt}));se.position.set(0,q+.04,F),se.scale.set(1,1,1.18),e.add(se);let re=new D(new V(.012,.07,.16),w);re.position.set(0,q+.13,F+.12),re.rotation.x=-.5,e.add(re);for(let ye of[-1,1]){let c=new D(new V(.01,.03,.11),w);c.position.set(ye*.07,q+.1,F+.15),c.rotation.set(-.45,ye*.25,0),e.add(c)}}let B=new D(new Le(.24,.06),new Ee({map:ba(),color:ao("#ffffff",.9)}));B.position.set(0,.62,1.035),e.add(B);let Q=[];for(let[w,C,O]of[[u,.12,{r:.16,xs:[-.075,.075]}],[m,.18,{r:.12,xs:[-.09]}]]){let $=pn({R:i,width:C,rimR:.22,spokes:3,spokeStyle:"y",mats:n,disc:O,glowRing:!!o}),se=new Be;se.add($),se.userData={spin:$,sign:1};let re=w>0?1.24:1.16;se.scale.setScalar(re),se.position.set(0,i*re,w),e.add(se),Q.push(se)}let Y=vn(p.map(([w,C,O])=>[w,C,O+.16]),.9);Y.forEach(w=>e.add(w));let{glowLight:_,tailLight:Me}=xn(e,null,J);return{group:e,wheels:Q,flames:Y,M:n,glowLight:_,tailLight:Me,length:2.2,width:.75,wheelR:i*1.2,rearZ:J,tailY:1.04,tailHalfW:.08,bike:!0}}var Yt=(s,o)=>new W(s).multiplyScalar(o);function Ns(s,o,t,r=.07){let a=new ga;s(a);let e=Math.max(.01,t-r*2),n=new Va(a,{depth:e,bevelEnabled:r>0,bevelThickness:r,bevelSize:r*.85,bevelSegments:4,curveSegments:14,steps:1});return n.translate(-o/2,0,-e/2),n.rotateY(Math.PI/2),n.deleteAttribute("uv"),n.deleteAttribute("normal"),n=aa(n,1e-4),n.computeVertexNormals(),n}var $e=(s,o,t)=>new V(s,o,t);function ki(s,{r:o=.34,x:t,zs:r,trimMat:a,tireMat:e}){let n=new Ae(o,o,.27,28);n.rotateZ(Math.PI/2);let i=new Ae(o*.62,o*.62,.28,20);i.rotateZ(Math.PI/2);let u=[];for(let m of r)for(let l of[-1,1]){let h=new Be;h.add(new D(n,e));let v=new D(i,a);h.add(v);for(let E=0;E<5;E++){let M=new D($e(.29,.05,o*1.15),a);M.rotation.x=E/5*Math.PI,h.add(M)}h.position.set(l*t,o,m),s.add(h),u.push(h)}return u}var En={wedge:{L:4.55,W:1.96,wheelR:.35,wheelZ:[-1.45,1.42],body:s=>{s.moveTo(.05,.3),s.lineTo(0,.64),s.quadraticCurveTo(.02,.84,.3,.87),s.lineTo(1.35,.91),s.lineTo(2.9,.82),s.quadraticCurveTo(3.9,.66,4.45,.47),s.quadraticCurveTo(4.62,.37,4.5,.26),s.lineTo(4.15,.2),s.lineTo(.4,.2),s.quadraticCurveTo(.08,.2,.05,.3)},cabin:s=>{s.moveTo(1,.86),s.quadraticCurveTo(1.35,1.17,2,1.2),s.lineTo(2.7,1.18),s.quadraticCurveTo(3.2,1.1,3.6,.8),s.lineTo(1,.86)},cabinW:1.46,rear(s,o,t,r){let a=new D($e(t*.84,.06,.05),o.tail);a.position.set(0,.72,r-.01),s.add(a);for(let n of[-1,1]){let i=new D($e(.07,.2,.05),o.tail);i.position.set(n*(t*.42),.64,r-.02),s.add(i)}let e=new D($e(t*.96,.045,.34),o.trim);e.position.set(0,1.13,r-.38),e.rotation.x=-.08,s.add(e);for(let n of[-1,1]){let i=new D($e(.05,.25,.12),o.trim);i.position.set(n*.48,.99,r-.34),s.add(i);let u=new D($e(.03,.17,.38),o.trim);u.position.set(n*t*.48,1.12,r-.38),s.add(u)}}},coupe:{L:4.8,W:1.94,wheelR:.35,wheelZ:[-1.55,1.5],body:s=>{s.moveTo(.06,.32),s.quadraticCurveTo(-.03,.6,.14,.75),s.quadraticCurveTo(.6,.85,1.45,.87),s.lineTo(3.2,.79),s.quadraticCurveTo(4.3,.67,4.75,.45),s.quadraticCurveTo(4.86,.31,4.7,.24),s.lineTo(.42,.22),s.quadraticCurveTo(.1,.22,.06,.32)},cabin:s=>{s.moveTo(.45,.84),s.quadraticCurveTo(1.55,1.2,2.55,1.18),s.quadraticCurveTo(3.3,1.13,3.78,.8),s.lineTo(.45,.84)},cabinW:1.5,rear(s,o,t,r){let a=new go(.1,24);for(let i of[-1,1])for(let u of[.36,.62]){let m=new D(a,o.tail);m.position.set(i*t*u*.75,.6,r+.005),s.add(m)}let e=new D($e(t*.5,.02,.02),o.tailDim);e.position.set(0,.6,r),s.add(e);let n=new D($e(t*.8,.05,.16),o.trim);n.position.set(0,.86,r-.12),n.rotation.x=-.25,s.add(n)}},kei:{L:3.5,W:1.6,wheelR:.3,wheelZ:[-1.12,1.1],body:s=>{s.moveTo(0,.28),s.lineTo(0,1),s.quadraticCurveTo(0,1.43,.24,1.46),s.lineTo(2.35,1.46),s.quadraticCurveTo(2.72,1.43,2.88,1.06),s.lineTo(3.38,.84),s.quadraticCurveTo(3.56,.76,3.5,.42),s.lineTo(3.3,.24),s.lineTo(.25,.22),s.quadraticCurveTo(0,.22,0,.28)},cabin:s=>{s.moveTo(.14,.95),s.lineTo(.14,1.3),s.lineTo(2.33,1.33),s.lineTo(2.74,1.06),s.lineTo(2.6,.95),s.lineTo(.14,.95)},cabinW:1.63,rear(s,o,t,r){for(let n of[-1,1]){let i=new D($e(.11,.46,.05),o.tail);i.position.set(n*(t/2-.12),.82,r),s.add(i)}let a=new D(new Le(t*.78,.34),o.glass);a.position.set(0,1.15,r+.005),s.add(a);for(let n of[-1,1]){let i=new D($e(.05,.05,2),o.trim);i.position.set(n*.62,1.55,.05),s.add(i)}for(let n of[-.6,0,.6]){let i=new D($e(1.3,.04,.05),o.trim);i.position.set(0,1.58,n),s.add(i)}let e=new D($e(t*.86,.05,.2),o.trim);e.position.set(0,1.47,r-.08),s.add(e)}}};function Os(s,o,t,r){if(s==="bike")return wn(o,t,r);if(s==="wedge")return gn(o,t);let a=En[s]||En.wedge,e=new Be,n={paint:new Pt({color:o.body,emissive:o.body,emissiveIntensity:.1,metalness:.25,roughness:.38,clearcoat:1,clearcoatRoughness:.06,envMapIntensity:.9}),stripe:new Pt({color:o.stripe,metalness:.3,roughness:.4,clearcoat:1,clearcoatRoughness:.1,polygonOffset:!0,polygonOffsetFactor:-1}),trim:new Ue({color:o.trim,metalness:.7,roughness:.35}),glass:new Pt({color:"#05050a",metalness:.9,roughness:.04,envMapIntensity:2.2}),tire:new Ue({color:"#0b0b0e",roughness:.85}),tail:new Ee({color:Yt("#ff1a3c",6)}),tailDim:new Ee({color:Yt("#ff1a3c",1.4)}),under:new Ue({color:"#08080c",roughness:.6,metalness:.4})},i=new D(Ns(a.body,a.L,a.W,.08),n.paint);e.add(i),i.geometry.computeBoundingBox();let u=i.geometry.boundingBox.max.z,m=new D(Ns(a.body,a.L,.36,0),n.stripe);m.scale.set(1,1.008,1.006),e.add(m);let l=new D(Ns(a.cabin,a.L,a.cabinW,.06),n.glass);e.add(l);let h=new D($e(a.W*.86,.12,a.L*.9),n.under);h.position.set(0,.2,0),e.add(h);let v=u;for(let z=-2;z<=2;z++){let G=new D($e(.025,.14,.32),n.under);G.position.set(z*.22,.24,v-.12),e.add(G)}let E=new Ae(.065,.065,.12,16);E.rotateX(Math.PI/2);let M=new Ee({color:Yt("#ff6a00",.6)});for(let z of[-1,1]){let G=new D(E,n.trim);G.position.set(z*.34,.3,v-.03),e.add(G);let L=new D(new go(.048,16),M);L.position.set(z*.34,.3,v+.035),e.add(L)}let p=new Ee({color:Yt("#4fd8ff",3),transparent:!0,opacity:.9,blending:Ke,depthWrite:!1}),H=[];for(let z of[-1,1]){let G=new D(new Po(.06,.5,12,1,!0),p);G.rotation.x=Math.PI/2,G.position.set(z*.34,.3,v+.36),G.visible=!1,e.add(G),H.push(G)}let k=new D(new Le(.5,.125),new Ee({map:ba(),color:Yt("#ffffff",.9)}));k.position.set(0,.42,v+.012),e.add(k);for(let z of[-1,1]){let G=new D($e(.16,.08,.12),n.paint);G.position.set(z*(a.W/2+.04),s==="kei"?1:.92,-a.L*.12),e.add(G)}a.rear(e,n,a.W,u);let g=ki(e,{r:a.wheelR,x:a.W/2-.1,zs:a.wheelZ,trimMat:n.trim,tireMat:n.tire}),b=null;t&&(b=new Zo(new W(t),26,9,1.6),b.position.set(0,.3,0),e.add(b));let U=new Zo(new W("#ff1a3c"),1.2,6,2);U.position.set(0,.25,v+1.8);let J=new D(new Le(a.W*.72,.26),n.glass);J.position.set(0,.47,v+.006),e.add(J),e.add(U);let j={wedge:[.72,a.W*.42],coupe:[.6,a.W*.4],kei:[.82,a.W/2-.12]}[s]||[.7,.8];return{group:e,wheels:g,flames:H,M:n,glowLight:b,tailLight:U,length:a.L,width:a.W,wheelR:a.wheelR,rearZ:u,tailY:j[0],tailHalfW:j[1]}}var Bi=["#2a2d3a","#3b1f4a","#1d3a4a","#55555e","#6b0f1a","#bdb8ac","#0f4f4a","#2b2b2b"];function yn(){let s=Bi.map(M=>ct({color:M,metalness:.6,roughness:.32,envMapIntensity:1.1})),o=ct({color:"#06060b",metalness:.9,roughness:.06,envMapIntensity:1.8}),t=ct({color:"#0a0a0d",roughness:.7}),r=ct({color:"#c9c6bd",metalness:.2,roughness:.55}),a=Ht({color:Yt("#ffa000",5)}),e=Ht({color:Yt("#ffa000",3)}),n=["#00f0ff","#ff2bd6","#b8ff2e","#fcee0a"].map(M=>Ht({color:Yt(M,3)})),i={sedanBody:new tt(1.86,.62,4.5,3,.2),sedanCabin:new tt(1.58,.54,2.25,3,.2),hatchBody:new tt(1.8,.72,4,3,.2),hatchCabin:new tt(1.62,.62,2.5,3,.2),cab:new tt(2.3,2,2.2,3,.2),box:new tt(2.5,2.9,6.6,2,.08),tire:new Ae(.34,.34,.26,18).rotateZ(Math.PI/2),lamp:$e(.42,.1,.05),vlamp:$e(.12,.3,.05),blink:$e(.14,.08,.05),tiny:$e(.12,.06,.04),strip:$e(.03,.08,6.4),rstrip:$e(2.3,.08,.03)},u=0,m=Ht({color:Yt("#d8d4c8",.9)}),l=M=>{if(!M.length)return null;let p=M.map(([H,k,g,b,U=0])=>{let J=(H.index,H.clone());return J.attributes.uv&&J.deleteAttribute("uv"),J.index||(J=aa(J)),J.applyMatrix4(new xt().compose(new ne(k,g,b),new Ie().setFromEuler(new Jt(U,0,0)),new ne(1,1,1))),J});return Lo(p,!1)},h={};function v(M){if(h[M])return h[M];let p={paint:[],glass:[],dark:[],plate:[],tail:[],amber:[]};if(M==="hauler"){p.paint.push([i.cab,0,1.25,-3.3]),p.glass.push([new V(2,.7,.05),0,1.75,-4.42]),p.dark.push([new V(2.5,.25,.2),0,.4,4.22]),p.plate.push([new Le(.42,.11),0,.42,4.33]);for(let g of[-1,1])p.tail.push([i.vlamp,g*1.05,.62,4.22]),p.amber.push([i.blink,g*1.05,.88,4.22]);for(let g=-2;g<=2;g++)p.amber.push([i.tiny,g*.45,3.25,4.22]);for(let g of[-3.3,1.6,3])for(let b of[-1,1])p.dark.push([i.tire,b*1.05,.34,g])}else{let g=M==="hatch",b=g?2.02:2.27;p.paint.push([g?i.hatchBody:i.sedanBody,0,g?.58:.54,0]),p.glass.push([g?i.hatchCabin:i.sedanCabin,0,g?1.12:1.04,g?.55:.25]),p.paint.push([new V(g?1.5:1.42,.06,g?1.9:1.6),0,g?1.43:1.32,g?.5:.2]),p.dark.push([new V(1.78,.16,.12),0,.36,b+.02]),p.dark.push([new V(1.2,.05,.05),0,.92,b+.01]),p.plate.push([new Le(.4,.1),0,.5,b+.03]);for(let U of[-1,1])p.dark.push([new V(.14,.08,.1),U*1,.98,g?-.6:-.75]),p.amber.push([i.blink,U*(g?.76:.88),g?.62:.66,b]),g?p.tail.push([i.vlamp,U*.76,.86,b]):(p.tail.push([i.lamp,U*.6,.68,b]),p.tail.push([new V(.18,.03,.04),U*.22,.68,b]));for(let U of g?[-1.3,1.25]:[-1.45,1.45])for(let J of[-1,1])p.dark.push([i.tire,J*.82,.34,U])}let H={};for(let[g,b]of Object.entries(p))b.length&&g!=="amber"&&(H[g]=l(b));H.blinkL=l(p.amber.filter(g=>g[1]<0&&Math.abs(g[1])>.5&&g[2]<1.5)),H.blinkR=l(p.amber.filter(g=>g[1]>0&&Math.abs(g[1])>.5&&g[2]<1.5));let k=p.amber.filter(g=>g[2]>3);return k.length&&(H.markers=l(k)),h[M]=H,H}function E(M,p){let H=new Be,k=Ht({color:Yt("#ff1a3c",3)}),g=v(M),b=s[p%s.length];if(H.add(new D(g.paint,b)),H.add(new D(g.glass,o)),H.add(new D(g.dark,t)),H.add(new D(g.plate,m)),H.add(new D(g.tail,k)),M==="hauler"){let j=new D(i.box,r);j.position.set(0,1.85,.9),H.add(j);let z=n[u++%n.length];for(let[G,L,f,S]of[[i.strip,-1.26,1.2,.9],[i.strip,1.26,1.2,.9],[i.rstrip,0,1.2,4.21]]){let F=new D(G,z);F.position.set(L,f,S),H.add(F)}g.markers&&H.add(new D(g.markers,e))}let U=new D(g.blinkL||new dt,a),J=new D(g.blinkR||new dt,a);return H.add(U,J),{group:H,tail:k,blinkers:[U,J],len:M==="hauler"?8.8:M==="hatch"?4:4.5}}return{make:E}}var Tn=`
uniform vec3 uFogColor; uniform float uFogDensity;
float fogF(float depth) { float k = uFogDensity * depth; return 1.0 - exp(-k * k); }
float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
`,sa={uFAmb:{value:new W("#0c0f16")},uFStreet:{value:new W("#5a4630")},uFSky:{value:new W("#1a1c24")},uFCool:{value:new W("#e9ecea")},uFWarm:{value:new W("#ffc98a")},uFLit:{value:1}};function bn(){return new we({uniforms:{...ie,...sa,uLampCol:ht.uLampCol,uDetail:ht.uDetail,uWin:{value:[new W,new W,new W,new W]}},vertexShader:`
      ${Gt}
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
      }`,fragmentShader:`
      ${Tn}
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
      }`})}function Us({gain:s=1}={}){return new we({uniforms:{...ie,...sa,uGain:{value:s},uWin:{value:[new W,new W,new W,new W]}},vertexShader:`
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
      }`,fragmentShader:`
      ${Tn}
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
      }`})}var na=(s,o)=>new W(s).multiplyScalar(o);function Mn(s){let t=[-1,1].map(()=>{let l=new Float32Array(336),h=new Float32Array(56*2),v=[];for(let p=0;p<55;p++){let H=p*2,k=H+1,g=H+2,b=H+3;v.push(H,k,g,k,b,g)}let E=new dt;E.setAttribute("position",new Xt(l,3)),E.setAttribute("aFade",new Xt(h,1)),E.setIndex(v);let M=new D(E,new we({uniforms:{uColor:{value:na("#ff1a2c",2.2)}},vertexShader:"attribute float aFade; varying float vF; void main(){ vF = aFade; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:"uniform vec3 uColor; varying float vF; void main(){ gl_FragColor = vec4(uColor * vF * vF, 1.0); }",transparent:!0,depthWrite:!1,blending:Ke,side:Mt}));return M.frustumCulled=!1,s.add(M),{m:M,pos:l,fade:h,g:E}}),r=new Float32Array(56),a=new Float64Array(56),e=new Float64Array(56),n=new Float32Array(56),i=0,u=0,m=0;return{update(l,h,v,E,M=.38,p=0){u&&(Math.abs(l.z-a[i])>12||l.time<e[i])&&(u=0);let H=u?Math.min(.1,Math.max(0,l.time-e[i])):0;i=(i+56-1)%56,r[i]=l.x,a[i]=l.z,e[i]=l.time,n[i]=p,u=Math.min(56,u+1);let k=Math.min(1,Math.max(0,(l.speed-48.5)/8.5)),g=k*k*(3-2*k);m+=((l.overclock||l.slip>0?1:0)-m)*Math.min(1,H*4);let b=M>0?Math.max(g,m):0,U=.55+.25*g+.5*m,J=.022;for(let j=0;j<2;j++){let z=t[j],G=j?1:-1,L=z.pos,f=z.fade,S=0,F=0,q=0,B=!1,Q=0,Y=0;for(let _=0;_<56;_++){let Me=(i+Math.min(_,u-1))%56,w=r[Me],C=n[Me],O=l.z-a[Me];if(B)w=Q,C=Y,O=U;else if(O>=U){let Fe=_?(U-q)/Math.max(1e-4,O-q):0;w=_?S+(w-S)*Fe:w,C=_?F+(C-F)*Fe:C,O=U,B=!0,Q=w,Y=C}S=w,F=C,q=O;let $=Math.max(0,1-O/U)*b,se=Math.cos(C),re=Math.sin(C),ye=w+G*v*se-E*re,c=E*se+G*v*re,le=h+.12+O,ce=_*6;L[ce]=ye,L[ce+1]=c+J,L[ce+2]=le,L[ce+3]=ye,L[ce+4]=c-J,L[ce+5]=le,f[_*2]=f[_*2+1]=$}z.g.attributes.position.needsUpdate=!0,z.g.attributes.aFade.needsUpdate=!0}},setColor(l){t.forEach(h=>h.m.material.uniforms.uColor.value.copy(l))}}}function Rn(s,o=64){let t=new we({uniforms:{...ie,uColor:{value:na("#ff1a2c",1.5)}},vertexShader:`${Gt}
      varying vec2 vUv; varying float vD;
      void main(){ vUv = uv; vec4 wp = bendW(modelMatrix * instanceMatrix * vec4(position, 1.0)); vec4 mv = viewMatrix * wp; vD = -mv.z; gl_Position = projectionMatrix * mv; }`,fragmentShader:`uniform vec3 uColor; varying vec2 vUv; varying float vD;
      void main(){ float x = (vUv.x - 0.5) * 2.0; float a = exp(-x * x * 5.0) * pow(vUv.y, 1.6) * (1.0 - smoothstep(45.0, 120.0, vD)); gl_FragColor = vec4(uColor * a, 1.0); }`,transparent:!0,depthWrite:!1,blending:Ke,side:Mt}),r=new Le(1,1).rotateX(-Math.PI/2).translate(0,0,.5),a=new Oe(r,t,o);a.frustumCulled=!1,s.add(a);let e=new xt,n=new ne,i=new Ie,u=new ne,m=0;return{begin(){m=0},add(l,h,v,E){m>=o||a.setMatrixAt(m++,e.compose(n.set(l,h,v),i,u.set(.07,1,E*.6)))},end(){a.count=m,a.instanceMatrix.needsUpdate=!0}}}function Hn(s){let o=new we({uniforms:{uColor:{value:na("#fff1d6",.22)}},vertexShader:`varying float vH; varying vec3 vN; varying vec3 vV;
      void main(){ vH = uv.y; vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,fragmentShader:`uniform vec3 uColor; varying float vH; varying vec3 vN; varying vec3 vV;
      void main(){ float core = pow(abs(dot(vN, vV)), 3.0); float a = core * pow(vH, 1.6) * (1.0 - smoothstep(0.97, 1.0, vH)); gl_FragColor = vec4(uColor * a, 1.0); }`,transparent:!0,depthWrite:!1,blending:Ke,side:Mt,fog:!1}),t=new Po(42,900,24,1,!0).rotateX(Math.PI).translate(0,450,0),r=[],a=[[-420,-1100],[260,-1250],[-120,-1400],[520,-900]];for(let[e,n]of a){let i=new D(t,o);i.position.set(e,-20,n),s.add(i),r.push({b:i,phase:Math.random()*10,speed:.12+Math.random()*.15})}return{set visible(e){r.forEach(n=>n.b.visible=e)},update(e){for(let n of r)n.b.rotation.z=Math.sin(e*n.speed+n.phase)*.45,n.b.rotation.x=Math.cos(e*n.speed*.7+n.phase)*.2-.1}}}function Sn(s){let o=new we({uniforms:{uTime:ie.uTime,uA:{value:na("#ff8a2a",1.6)},uB:{value:na("#eef4ff",1.2)},uC:{value:na("#ff2a3a",1.4)}},vertexShader:"varying vec2 vP; varying float vD; void main(){ vec4 wp = modelMatrix * vec4(position,1.0); vP = wp.xz; vec4 mv = viewMatrix * wp; vD = -mv.z; gl_Position = projectionMatrix * mv; }",fragmentShader:`
      uniform vec3 uA, uB, uC; uniform float uTime; varying vec2 vP; varying float vD;
      float h(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      void main() {
        // blocks of uneven size: streets every ~40 m, avenues every ~200 m
        vec2 cell = vP / 40.0; vec2 id = floor(cell); vec2 f = fract(cell);
        vec2 av = vP / 200.0; vec2 af = abs(fract(av) - 0.5);
        float street = max(smoothstep(0.06, 0.02, abs(f.x - 0.5) * (0.9 + 0.3 * h(id.yy))), smoothstep(0.06, 0.02, abs(f.y - 0.5) * (0.9 + 0.3 * h(id.xx))));
        float avenue = max(smoothstep(0.022, 0.006, af.x), smoothstep(0.022, 0.006, af.y));
        // rooftops: dark slabs with a faint tone per building, lit windows scattered across them
        vec2 bid = floor(vP / vec2(13.0, 17.0));
        vec3 roof = vec3(0.025, 0.028, 0.045) * (0.6 + 0.8 * h(bid));
        vec2 w = vP / 2.6; vec2 wid = floor(w);
        float win = step(0.86, h(wid + bid)) * step(0.25, fract(w.x)) * step(0.3, fract(w.y));
        vec3 col = roof + mix(vec3(1.0, 0.82, 0.55), vec3(0.75, 0.9, 1.0), h(wid * 1.7)) * win * 0.55;
        // neon on some roofs (billboards): a coloured glow patch
        float sign = step(0.93, h(bid * 0.71)) * smoothstep(0.5, 0.15, length(fract(vP / vec2(13.0, 17.0)) - 0.5));
        col += mix(vec3(1.0, 0.2, 0.6), vec3(0.2, 0.9, 1.0), h(bid * 3.3)) * sign * 1.6;
        // streets: warm sodium glow; avenues brighter, with moving car lights (white one way, red the other)
        col = mix(col, uA * 0.45, street * 0.85);
        float lane = fract(av.x) < 0.5 ? 1.0 : -1.0;
        float flowX = step(0.94, h(vec2(floor(vP.x / 9.0 - uTime * 3.0), floor(vP.y / 3.0))));
        float flowZ = step(0.94, h(vec2(floor(vP.y / 9.0 + uTime * 3.0), floor(vP.x / 3.0))));
        vec3 cars = mix(uB, uC, step(0.5, fract(vP.x / 6.0))) * max(flowX * smoothstep(0.012, 0.0, af.y), flowZ * smoothstep(0.012, 0.0, af.x));
        col = mix(col, uA * 0.9, avenue * 0.8) + cars * 2.2;
        // the big crossings glow
        col += uB * 0.5 * smoothstep(0.05, 0.0, max(af.x, af.y));
        float fade = smoothstep(2600.0, 600.0, vD) * smoothstep(60.0, 220.0, vD);
        gl_FragColor = vec4(col * fade, 1.0);
      }`,fog:!1,depthWrite:!1}),t=new D(new Le(6e3,6e3).rotateX(-Math.PI/2),o);return t.position.y=-45,t.renderOrder=-5,s.add(t),t}var ra=1900,ft={x:0,y:0},It=new xt,bo=new ne,Mo=new Ie,Ro=new ne;function es(s,o,t,r=4){let a=[],e=[],n=[];for(let u=0;u<r;u++){let m=u/r*Math.PI*2+Math.PI/r,l=(u+1)/r*Math.PI*2+Math.PI/r,h=a.length/3;for(let v=0;v<=t;v++){let E=v/t*o,M=s(E)/Math.cos(Math.PI/r);if(a.push(Math.cos(m)*M,E,Math.sin(m)*M,Math.cos(l)*M,E,Math.sin(l)*M),e.push(0,E,1,E),v<t){let p=h+v*2;n.push(p,p+2,p+1,p+1,p+2,p+3)}}}let i=new dt;return i.setAttribute("position",new gt(a,3)),i.setAttribute("uv",new gt(e,2)),i.setIndex(n),i}var ia=(s,o=2.4)=>{let t=new Le(1,1),r=new Float32Array(s*4);t.setAttribute("aBlink",new kt(r,4));let a=new Oe(t,_a({gain:o,fog:!1,bent:!1}),s);a.frustumCulled=!1;for(let e=0;e<s;e++)a.setColorAt(e,new W("#ffffff")),a.setMatrixAt(e,It.makeScale(0,0,0));return{m:a,blink:r,n:0,add(e,n,i,u,m,l=0,h=0,v=1,E=1){let M=this.n++;a.setMatrixAt(M,It.compose(bo.set(e,n,i),Mo.identity(),Ro.set(u,u,u))),a.setColorAt(M,new W(m)),r.set([l,h,v,E],M*4)}}};function Pi(){let s=new Be,o=333,t=i=>i<296?2.4+41.6*Math.pow(1-i/300,2.25):1.2;s.add(new D(es(t,296,60),Ta({color:"#ff7a2a",color2:"#ffe2b8",gain:2.1,rings:9,panels:3,bands:0})));let r=new D(es(()=>1.1,37,6).translate(0,296,0),Ta({color:"#ffd6a8",gain:2.2,rings:4,panels:1}));s.add(r);let a=new Ee({color:new W("#ffe0b0").multiplyScalar(1.6),fog:!1}),e=new Ee({color:"#1a0e0a",fog:!1});for(let[i,u,m]of[[145,10,t(150)*2+7],[247,5,t(250)*2+4]]){let l=new D(new V(m,u,m),e);l.position.y=i+u/2,s.add(l);let h=new D(new V(m+.3,u*.42,m+.3),a);h.position.y=i+u*.55,s.add(h)}let n=ia(12,2.6);n.add(0,o,0,7,"#ff2a1a",.5,0,.5,.05);for(let[i,u]of[[156,1],[253,1]])for(let m of[-1,1])n.add(m*(t(i)+4)*u,i,0,5,"#ff2a1a",.5,.02,.5,.05);for(let[i,u]of[[-1,-1],[1,-1],[1,1],[-1,1]])n.add(i*40,3,u*40,16,"#ffb070",0,0,1,1);return s.add(n.m),s}function Gi(){let s=new Be,o=a=>2.5+31*Math.pow(1-a/690,1.15);s.add(new D(es(o,497,50,6),Ta({color:"#8fdcff",color2:"#ffffff",gain:2,rings:14,panels:2}))),s.add(new D(es(()=>2.2,137,8,6).translate(0,497,0),Ta({color:"#cfefff",gain:1.8,rings:8,panels:1})));let t=new Ee({color:new W("#e8f6ff").multiplyScalar(1.8),fog:!1});for(let[a,e,n]of[[340,14,o(347)+9],[445,6,o(448)+5]]){let i=new D(new Ae(n,n*.92,e,24),t);i.position.y=a+e/2,s.add(i)}let r=ia(4,2.4);return r.add(0,634,0,14,"#ff2a1a",.5,.3,.5,.05),r.add(0,497,0,10,"#ff2a1a",.5,.3,.5,.05),s.add(r.m),s}function Di(){let s=new Be,o=new Ee({color:new W("#dfe6f2").multiplyScalar(.9),fog:!1}),t=new Ee({color:"#1a1c22",fog:!1});for(let i of[-285,285]){for(let u of[-13,13]){let m=new D(new V(6,126,5).translate(0,63,0),o);m.position.set(i,0,u),s.add(m)}for(let u of[70,104,124]){let m=new D(new V(5,4,30),o);m.position.set(i,u,0),s.add(m)}}let r=new D(new V(920,7,30).translate(0,49,0),t);s.add(r);let a=new D(new V(920,.8,30.4).translate(0,52.6,0),new Ee({color:new W("#ffd9a0").multiplyScalar(1.2),fog:!1}));s.add(a);let e=ia(190,2),n=i=>{let u=Math.abs(i);return u<=285?58+68*Math.pow(u/285,2):126-72*Math.pow((u-285)/175,1.4)};for(let i of[-13,13])for(let u=-455;u<=455;u+=10)e.add(u,n(u),i,4.5,"#f4f7ff",0,0,1,1);for(let i of[-285,285])for(let u of[-13,13])e.add(i,127,u,8,"#ff2a1a",.5,.1,.5,.05);return s.add(e.m),s}function Li(){let s=new Be,o=document.createElement("canvas");o.width=512,o.height=64;let t=o.getContext("2d");t.fillStyle="#6a2a1c",t.fillRect(0,0,512,64),t.fillStyle="#e8e0d0";for(let u of[20,40])t.fillRect(0,u,512,2);for(let u=0;u<128;u++)for(let m of[6,26,46])t.fillStyle=u%5===0?"#ffe9b8":"#ffcf80",t.fillRect(u*4+1,m,2,10);let r=new $t(o);r.colorSpace=jt;let a=new Ee({map:r,color:new W("#ffffff").multiplyScalar(1.1),fog:!1}),e=new D(new V(335,24,22).translate(0,12,0),a);s.add(e);let n=new Ee({color:"#2a3a36",fog:!1});for(let u of[-150,150]){let m=new D(new Ae(11,11,8,8).translate(0,28,0),a);m.position.x=u,s.add(m);let l=new D(new Bt(11.5,16,8,0,Math.PI*2,0,Math.PI/2).translate(0,32,0),n);l.position.x=u,s.add(l)}let i=new D(new V(30,30,24).translate(0,15,0),a);return s.add(i),s}function Fi(){let s=[],o=r=>Ds.find(a=>a.id===r),t=(r,a,e,n,i,u,m)=>{let l=o(r);s.push({x:l.x+a,y:l.y+e,w:n,h:i,d:u,crown:m})};return t("roppongi-hills",0,0,62,238,52,"#bfe9ff"),t("toranomon-hills",0,0,50,222,50,"#ffe0a8"),t("toranomon-hills",0,0,36,256,36,"#ffe0a8"),t("shiodome",0,0,44,213,30,"#e8f2ff"),t("shiodome",120,160,40,200,40,null),t("shiodome",-110,220,36,170,36,null),t("shiodome",40,-180,46,190,34,"#bfe9ff"),t("tocho",-90,0,52,243,40,"#ffffff"),t("tocho",90,0,52,243,40,"#ffffff"),t("tocho",-400,-700,50,223,50,null),t("tocho",500,-300,46,210,46,null),t("tocho",250,520,44,200,44,null),s}var Wi=[[-571,760,700,820],[-650,1560,330,360],[-130,-380,190,200],[542,-1909,240,220],[-777,-2186,230,210],[-2567,377,520,480],[-3164,-1220,300,300]];function Ii(s,o){if(o<-2950&&s>-300||s>1500&&o<-2300)return 0;{let n=Math.max(0,Math.min(1,((s-2350)*-600+(o-1600)*-3950)/15962500));if(Math.hypot(s-2350-n*-600,o-1600-n*-3950)<140)return 0}for(let[t,r,a,e]of Wi)if(((s-t)/a)**2+((o-r)/e)**2<1)return 0;return 1}function Ni(s,o,t){return s>250&&s<1450&&o>-350&&o<1350||s>200&&s<850&&o>-2250&&o<-1250||s>-1200&&s<-250&&o>-1350&&o<-250||s>-2900&&s<-1700&&o>-2300&&o<-1300?70+Math.pow(t,.9)*110:20+Math.pow(t,2.4)*80}function An(s,o){let t=new Be;s.add(t);let r=B=>Ds.find(Q=>Q.id===B),a=[],e=(B,Q,Y=0,_=-12)=>(B.rotation.y=Y,t.add(B),a.push({obj:B,x:Q.x,y:Q.y,base:_}),B),n=e(Pi(),r("tokyo-tower"));e(Gi(),r("skytree")),e(Di(),r("rainbow-bridge"),Math.PI/2-126*Math.PI/180,-14),e(Li(),r("tokyo-station"),Math.PI/2-12*Math.PI/180,-6);let i=Fi(),u=new V(1,1,1).translate(0,.5,0),m=new Float32Array(i.length).map((B,Q)=>(Q*.137+.21)%1);u.setAttribute("aSeed",new kt(m,1));let l=Us(),h=new Oe(u,l,i.length);h.frustumCulled=!1,t.add(h);let v=ia(i.length*3,2.4);i.forEach(B=>{v.add(0,0,0,0,"#ff1a24",.75,.01,.4,.06),v.add(0,0,0,0,"#ff1a24",.75,.03,.4,.06),v.add(0,0,0,0,B.crown||"#ffffff",0,0,1,.5)}),t.add(v.m);let E=170,M=340,p=new V(1,1,1).translate(0,.5,0),H=new Float32Array(M);p.setAttribute("aSeed",new kt(H,1));let k=Us(),g=new Oe(p,k,M);g.frustumCulled=!1,s.add(g);let b=ia(90,2.2);for(let B=0;B<90;B++)b.add(0,0,0,0,"#ff1a24",B%3?0:.75,B%7*.006,.4,.3);s.add(b.m);let U=(B,Q,Y)=>{let _=B*374761393+Q*668265263+Y*1442695041|0;return _=(_^_>>>13)*1274126177|0,((_^_>>>16)>>>0)/4294967296},J=1e9,j=1e9,z=-30;function G(){let B=0,Q=0,Y=Math.floor((ft.x-1850)/E),_=Math.floor((ft.x+1850)/E),Me=Math.floor((ft.y-1850)/E),w=Math.floor((ft.y+1850)/E);for(let C=Y;C<=_&&B<M;C++)for(let O=Me;O<=w&&B<M;O++){let $=(C+.2+.6*U(C,O,1))*E,se=(O+.2+.6*U(C,O,2))*E,re=$-ft.x,ye=se-ft.y,c=Math.hypot(re,ye);if(c<520||c>1850||!Ii($,se))continue;let le=Ni($,se,U(C,O,3)),ce=34+50*U(C,O,4),Fe=30+46*U(C,O,5);g.setMatrixAt(B,It.compose(bo.set(re,z,-ye),Mo.identity(),Ro.set(ce,le,Fe))),H[B]=U(C,O,6),le>100&&Q<90&&b.m.setMatrixAt(Q++,It.compose(bo.set(re,z+le+4,-ye),Mo.identity(),Ro.set(9,9,9))),B++}g.count=B;for(let C=Q;C<90;C++)b.m.setMatrixAt(C,It.makeScale(0,0,0));g.instanceMatrix.needsUpdate=!0,p.attributes.aSeed.needsUpdate=!0,b.m.instanceMatrix.needsUpdate=!0,J=ft.x,j=ft.y}let L=3,f=ia(L*3,2.2);for(let B=0;B<L;B++)f.add(0,0,0,0,"#ffffff",0,0,1,1),f.add(0,0,0,0,"#ff2a2a",1.1,B*.3,.25,0),f.add(0,0,0,0,"#eaf4ff",.9,B*.17,.12,0);s.add(f.m);let S={x:-5200,y:9e3,z:1100},F={x:2080,y:-14200,z:0};function q(B,Q){Kr(B,ft),Math.hypot(ft.x-J,ft.y-j)>40&&G();for(let Y of a){let _=Y.x-ft.x,Me=Y.y-ft.y,w=Math.hypot(_,Me)||1,C=w>ra?ra/w:1;Y.obj.position.set(_*C,Y.base*C+z*(1-C),-Me*C),Y.obj.scale.setScalar(C)}for(let Y=0;Y<i.length;Y++){let _=i[Y],Me=_.x-ft.x,w=_.y-ft.y,C=Math.hypot(Me,w)||1,O=C>ra?ra/C:1,$=Me*O,se=-w*O,re=z*O+z*(1-O);h.setMatrixAt(Y,It.compose(bo.set($,re,se),Mo.identity(),Ro.set(_.w*O,_.h*O,_.d*O)));let ye=re+_.h*O,c=9*O;v.m.setMatrixAt(Y*3,It.compose(bo.set($-_.w*.4*O,ye+2*O,se),Mo.identity(),Ro.set(c,c,c))),v.m.setMatrixAt(Y*3+1,It.compose(bo.set($+_.w*.4*O,ye+2*O,se),Mo.identity(),Ro.set(c,c,c))),v.m.setMatrixAt(Y*3+2,_.crown?It.compose(bo.set($,ye-4*O,se),Mo.identity(),Ro.set(_.w*.32*O,_.w*.32*O,1)):It.makeScale(0,0,0))}h.instanceMatrix.needsUpdate=v.m.instanceMatrix.needsUpdate=!0;for(let Y=0;Y<L;Y++){let _=(Q*.006+Y/L)%1,Me=S.x+(F.x-S.x)*_,w=S.y+(F.y-S.y)*_,C=S.z+(F.z-S.z)*_,O=Me-ft.x,$=w-ft.y,se=Math.hypot(O,$,C),re=se>ra?ra/se:1,ye=C>150?1:0;for(let c=0;c<3;c++)f.m.setMatrixAt(Y*3+c,It.compose(bo.set(O*re+(c===2?1.5:0),C*re+z+(c===1?1.2:0),-$*re),Mo.identity(),Ro.setScalar(ye*(c===0?7:5))))}f.m.instanceMatrix.needsUpdate=!0}return{update:q,tower:n,materials:[k,l],set visible(B){t.visible=g.visible=b.m.visible=f.m.visible=B}}}function Cn(s){let o=[{from:13150,len:1340,x:-34,y:9,kind:"jr"},{from:4300,len:600,x:34,y:8,kind:"jr"},{from:12880,len:520,x:30,y:12,kind:"mono"}],t=ct({color:"#3a3a40",roughness:.9,metalness:.1}),r=new we({uniforms:{...ie,uMono:{value:0}},vertexShader:`${Gt}
      varying vec2 vUv; varying vec3 vN; varying float vDepth;
      void main(){ vUv = uv; vN = normal; vec4 wp = bendW(modelMatrix * vec4(position, 1.0)); vec4 mv = viewMatrix * wp; vDepth = -mv.z; gl_Position = projectionMatrix * mv; }`,fragmentShader:`uniform float uMono; uniform vec3 uFogColor; uniform float uFogDensity; varying vec2 vUv; varying vec3 vN; varying float vDepth;
      void main(){
        vec3 body = mix(vec3(0.16, 0.17, 0.19), vec3(0.2, 0.22, 0.27), uMono);
        if (abs(vN.x) > 0.5) {
          float L = 200.0, u = vUv.x * L, v = vUv.y;
          float car = fract(u / 20.0), gap = step(car, 0.025);
          float win = step(0.48, v) * step(v, 0.78) * step(0.16, fract(u / 1.6)) * step(fract(u / 1.6), 0.86) * (1.0 - gap);
          float door = step(0.2, v) * step(v, 0.8) * step(abs(fract(u / 5.0) - 0.5), 0.07);
          float stripe = step(0.38, v) * step(v, 0.44);
          body = mix(body, mix(vec3(0.05, 0.32, 0.3), vec3(0.12, 0.25, 0.6), uMono), stripe);
          body = mix(body, vec3(0.05), max(gap, door * 0.6));
          body += vec3(0.85, 0.93, 1.0) * 2.0 * win;
        }
        float k = uFogDensity * vDepth; float fog = 1.0 - exp(-k * k);
        gl_FragColor = vec4(mix(body, uFogColor, fog), 1.0);
      }`}),a=r.clone();a.uniforms={...ie,uMono:{value:1}};let e=o.map(n=>{let i=new Be,u=new D(new V(n.kind==="mono"?1.6:9,1.4,n.len,1,1,Math.ceil(n.len/8)).translate(0,-.7,-n.len/2),t),m=new D(new V(3,3.5,200,1,1,50).translate(0,n.kind==="mono"?.6:1.9,0),n.kind==="mono"?a:r);return i.add(u,m),i.visible=!1,i.traverse(l=>l.frustumCulled=!1),s.add(i),{...n,g:i,train:m}});return{update(n,i,u,m){for(let l of e){let h=qt(l.from,n.s),v=h<l.len+20?-h:qt(n.s,l.from),E=m&&v<700&&v>-l.len-20;if(l.g.visible=E,!E)continue;l.g.position.set(l.x,Math.max(-i(l.from+l.len/2)+l.y,-.5),-v);let M=-520+(u*38+l.from)%460;l.train.position.z=M+v,l.train.visible=M+v<0&&M+v>-l.len}}}}var Sa=wa,ca=jr,ot=Math.round(Sa/ca),ts=(s,o,t)=>s+(o-s)*t,Oi=s=>s*s*(3-2*s),Lt=new xt().makeScale(0,0,0),os=30,Vs=680,Ce=(s,o,t,r,a,e,n,i)=>({x0:s,xj:o,dep:t,len:r,gap:a,h:e,pow:n,kinds:i}),zn={towers:{rows:[Ce(12,6,[18,30],[26,50],[4,12],[22,70],1.2,{0:3,1:2}),Ce(46,20,[24,40],[30,60],[8,20],[90,205],.9,{0:4,1:1}),Ce(110,70,[30,50],[40,80],[20,70],[120,215],1,{0:1})],lit:.13,warm:.15,shop:.5,signs:.3,lamp:"led",barrier:0},neon:{rows:[Ce(9.2,1.5,[10,18],[6,13],[0,1.5],[16,46],1.3,{2:6,3:2,1:1}),Ce(27,8,[14,24],[12,28],[1,5],[24,56],1.2,{1:2,3:1,0:1,2:1}),Ce(70,40,[20,40],[20,50],[10,40],[50,140],1,{0:1,1:2})],lit:.42,warm:.6,shop:1.2,signs:1,lamp:"sodium",barrier:0},office:{rows:[Ce(11,5,[16,28],[22,46],[3,10],[28,95],1.1,{1:3,0:2,3:1}),Ce(45,15,[22,36],[28,56],[6,16],[70,190],1,{0:3,1:2}),Ce(110,60,[30,50],[40,70],[20,60],[110,200],1,{0:2,1:1})],lit:.16,warm:.2,shop:.35,signs:.25,lamp:"led",barrier:0},river:{rows:[Ce(26,4,[12,22],[10,24],[1,5],[18,52],1.2,{3:3,1:2,2:1}),Ce(55,15,[18,30],[20,45],[4,12],[30,120],1.1,{1:2,0:1,3:1}),Ce(110,60,[30,50],[40,70],[20,60],[90,190],1,{0:1,1:1})],lit:.26,warm:.45,shop:.6,signs:.55,lamp:"sodium",barrier:0,river:1},park:{rows:[Ce(14,6,[16,26],[24,46],[4,12],[25,62],1.1,{1:2,0:1}),Ce(50,20,[22,34],[30,56],[8,20],[40,110],1,{1:2,0:1}),Ce(120,60,[30,50],[40,70],[20,60],[60,150],1,{0:1,1:1})],left:"palace",lit:.15,warm:.25,shop:.2,signs:.1,lamp:"led",barrier:0,river:1},moat:{rows:[Ce(16,6,[14,24],[18,36],[3,10],[14,44],1.2,{1:2,5:1,3:1}),Ce(55,20,[18,30],[24,46],[6,16],[28,80],1,{1:2,5:2}),Ce(120,60,[24,40],[30,60],[20,60],[50,120],1,{1:1,5:1})],left:"palace",lit:.22,warm:.5,shop:.15,signs:.05,lamp:"sodium",barrier:0},gov:{rows:[Ce(14,6,[20,34],[30,60],[6,14],[20,46],1.2,{4:4,1:1}),Ce(50,20,[24,40],[30,60],[8,20],[30,100],1,{4:2,1:2,0:1}),Ce(120,60,[30,50],[40,70],[20,60],[80,180],1,{0:2,1:1})],lit:.42,warm:.08,shop:.1,signs:.05,lamp:"led",barrier:0},hills:{rows:[Ce(12,6,[14,26],[18,40],[3,10],[18,60],1.2,{1:2,5:1,0:1}),Ce(45,20,[22,36],[26,50],[6,18],[50,165],1,{0:2,1:1,5:1}),Ce(110,60,[30,50],[40,70],[20,60],[120,230],1,{0:2,5:1})],lit:.22,warm:.4,shop:.4,signs:.35,lamp:"led",barrier:2.2},resid:{rows:[Ce(12,5,[12,22],[14,30],[2,8],[12,42],1.3,{5:3,3:2}),Ce(40,15,[16,30],[20,40],[4,14],[30,120],1.1,{5:3,1:1}),Ce(100,60,[24,40],[30,60],[20,60],[60,160],1,{5:2,0:1})],lit:.3,warm:.85,shop:.25,signs:.12,lamp:"led",barrier:3.6},tower:{rows:[Ce(22,5,[14,26],[18,40],[3,10],[20,62],1.2,{1:2,5:1,3:1}),Ce(52,20,[20,34],[26,50],[6,18],[40,130],1,{1:2,0:1,5:1}),Ce(120,60,[30,50],[40,70],[20,60],[80,180],1,{0:1,1:1})],left:"park",lit:.2,warm:.4,shop:.35,signs:.3,lamp:"sodium",barrier:0,river:1},bay:{rows:[Ce(24,6,[16,30],[20,44],[4,14],[14,40],1.2,{3:2,1:1}),Ce(60,25,[22,36],[28,56],[8,20],[40,150],1,{0:2,1:1}),Ce(130,70,[30,50],[40,70],[30,80],[80,200],1,{0:1})],lit:.15,warm:.3,shop:.3,signs:.3,lamp:"led",barrier:0,river:1,bayRight:1}},Ui={miyakezaka:{left:"palace"},iikura:{river:0,leftCap:24},otemachi:{river:1},shibakoen:{leftCap:30}},Vi=s=>{let o=zn[s.style]||zn.office,t=Ui[s.id];return t?{...o,...t}:o},ss=Go.map(Vi),qs=s=>ss[Jo(s).index].lamp,Ln={\u6C5F\u6238\u6A4BJCT:[["1","\u4E0A\u91CE","Ueno"],["6","\u5411\u5CF6","Mukojima"]],\u7AF9\u6A4BJCT:[["5","\u6C60\u888B","Ikebukuro"]],\u4E09\u5B85\u5742JCT:[["4","\u65B0\u5BBF","Shinjuku"]],\u8C37\u753AJCT:[["3","\u6E0B\u8C37","Shibuya"]],\u4E00\u30CE\u6A4BJCT:[["2","\u76EE\u9ED2","Meguro"]],\u6D5C\u5D0E\u6A4BJCT:[["1","\u7FBD\u7530","Haneda"],["11","\u53F0\u5834","Daiba"]]},as={shiodome:["\u6E2F\u533A","Minato City"],ginza:["\u4E2D\u592E\u533A","Chuo City"],kyobashi:["\u4E2D\u592E\u533A","Chuo City"],nihonbashi:["\u4E2D\u592E\u533A","Chuo City"],otemachi:["\u5343\u4EE3\u7530\u533A","Chiyoda City"],takebashi:["\u5343\u4EE3\u7530\u533A","Chiyoda City"],kitanomaru:["\u5343\u4EE3\u7530\u533A","Chiyoda City"],miyakezaka:["\u5343\u4EE3\u7530\u533A","Chiyoda City"],kasumigaseki:["\u5343\u4EE3\u7530\u533A","Chiyoda City"],tanimachi:["\u6E2F\u533A","Minato City"],iikura:["\u6E2F\u533A","Minato City"],shibakoen:["\u6E2F\u533A","Minato City"],hamazakibashi:["\u6E2F\u533A","Minato City"]},Ho=new Float32Array(ot),la=new Float32Array(ot),Fn=new Float32Array(ot),rs=new Float32Array(ot),js=new Float32Array(ot),Wn=new Float32Array(ot),Xs=new Float32Array(ot),ns=new Float32Array(ot),In=new Uint8Array(ot);{let s=new Float32Array(ot).fill(1e9);for(let a of Eo)for(let e=0;e<ot;e++){let n=e*ca,i=n>=a.from&&n<a.to?0:Math.min(qt(n,a.from),qt(a.to,n));i<s[e]&&(s[e]=i)}let o=eo(91),t=Array.from({length:Math.ceil(ot/30)+1},()=>o());for(let a=0;a<ot;a++){let e=a*ca,n=Jo(e),i=ss[n.index];In[a]=n.index;let u=Oi(Math.max(0,1-s[a]/90)),m=Zr(e),l=Math.min(m,-7.5);Ho[a]=m+(l-m)*u,la[a]=wt(e)?1:0;let h=Qr(e)&&!la[a]&&u===0;Fn[a]=h&&i.barrier?i.barrier*(t[Math.floor(a/30)]<(i.barrier>3?.8:.5)?1:0):0,rs[a]=i.river&&Ho[a]>4&&!la[a]?1:0,js[a]=i.left==="palace"?1:0,Wn[a]=0,ns[a]=i.bayRight?1:0,Xs[a]=e>13150||e<700?-1:e>4300&&e<4900||e>12880&&e<13400?1:0}let r=(a,e)=>{let n=Float32Array.from(a);for(let i=0;i<ot;i++){let u=0;for(let m=-e;m<=e;m++)u+=n[(i+m+ot)%ot];a[i]=u/(2*e+1)}};r(Ho,2),r(rs,1),r(js,1),r(ns,2)}var pt=(s,o)=>{let t=wo(o)/ca,r=Math.floor(t)%ot,a=t-Math.floor(t);return s[r]+(s[(r+1)%ot]-s[r])*a},ji=s=>pt(Ho,s),kn=s=>Go[In[Math.floor(wo(s)/ca)%ot]],Bn=[64,256],Pn=[96,384],Gn=[240,60],is=[360,72],ls=[288,108],Dn=[128,384],Kt=["#ff2a3a","#ffd23a","#2af0ff","#ff3fd0","#9dff3a","#ff8a1a","#ffffff","#7a6bff"];function Xi(){let s=[],o=qo;o.blades.forEach((r,a)=>s.push({id:"blade"+a,w:Bn[0],h:Bn[1],draw(e,n,i){let u=a%5,m=[...r.replace(/ /g,"")],l=["#f4f0e6","#c8141e","#08070a","#ffd400","#1640a8"][u],h=["#c8141e","#ffffff",Kt[a%Kt.length],"#111111","#ffffff"][u];e.fillStyle=l,e.fillRect(0,0,n,i),e.strokeStyle=u===2?h:"rgba(0,0,0,.35)",e.lineWidth=u===2?4:3,e.strokeRect(4,4,n-8,i-8);let v=Math.min(n*.86,(i-20)/m.length);e.font=`${a%3===0?700:900} ${Math.round(v*.84)}px ${oa}`,e.fillStyle=h,u===2&&(e.shadowColor=h,e.shadowBlur=8),m.forEach((E,M)=>e.fillText(E,n/2,10+v*(M+.5)+(i-20-v*m.length)/2)),e.shadowBlur=0}}));for(let r=0;r<8;r++)s.push({id:"stack"+r,w:Pn[0],h:Pn[1],draw(a,e,n){a.fillStyle="#16141a",a.fillRect(0,0,e,n);let i=8,u=n/i;for(let m=0;m<i;m++){let l=o.floors[(r*5+m*3)%o.floors.length],h=m===i-1?"B1":`${i-m}F`,v=(r+m*2)%4;a.fillStyle=["#f8f4ea",Kt[(r+m)%Kt.length],"#0c0b10","#ffe9a8"][v],a.fillRect(3,m*u+3,e-6,u-6),a.fillStyle=v===2?Kt[(r*3+m)%Kt.length]:"#14121a",a.font=`700 ${Math.round(u*.24)}px Rajdhani, sans-serif`,a.textAlign="left",a.fillText(h,7,m*u+u*.28),a.textAlign="center",vt(a,l,e/2+6,m*u+u*.6,e-20,Math.round(u*.42),900)}}});o.boards.forEach(([r,a],e)=>s.push({id:"board"+e,w:Gn[0],h:Gn[1],draw(n,i,u){let m=e%4,l=["#0b0a10","#f6f2e8","#c8141e","#103a8a"][m],h=[Kt[e%Kt.length],"#d0101e","#ffffff","#ffe36b"][m];n.fillStyle=l,n.fillRect(0,0,i,u),n.fillStyle=h,m===0&&(n.shadowColor=h,n.shadowBlur=6),vt(n,r,i*.5,u*.42,i-20,Math.round(u*.56),900),n.shadowBlur=0,n.globalAlpha=.85,n.font=`500 ${Math.round(u*.2)}px ${oa}`,n.fillText(a,i*.5,u*.83),n.globalAlpha=1}})),o.crowns.forEach(([r,a],e)=>s.push({id:"crown"+e,w:is[0],h:is[1],draw(n,i,u){n.fillStyle="#000",n.fillRect(0,0,i,u),n.fillStyle=["#e8f2ff","#ffffff","#bfe9ff"][e%3],vt(n,r,i*.36,u*.52,i*.62,Math.round(u*.72),700),n.font=`700 ${Math.round(u*.42)}px Rajdhani, sans-serif`,n.fillText(a,i*.83,u*.54)}}));let t=[...Tr.map(r=>[r,null]),...o.roofs];return t.forEach(([r,a],e)=>s.push({id:"roof"+e,w:ls[0],h:ls[1],draw(n,i,u){let m=Kt[e*3%Kt.length];n.fillStyle="#050407",n.fillRect(0,0,i,u),n.fillStyle="rgba(255,255,255,0.035)";for(let l=2;l<u;l+=5)for(let h=2;h<i;h+=5)n.fillRect(h,l,2,2);n.strokeStyle=m,n.lineWidth=4,n.strokeRect(5,5,i-10,u-10),n.fillStyle=m,n.shadowColor=m,n.shadowBlur=5,a?(vt(n,r,i/2,u*.42,i-32,50,900),n.shadowBlur=0,n.font="600 18px Rajdhani, sans-serif",n.globalAlpha=.8,n.fillText(a,i/2,u*.78),n.globalAlpha=1):vt(n,r,i/2,u*.52,i-32,56,700,e%2?"Rajdhani, sans-serif":'"Chakra Petch", Rajdhani, sans-serif'),n.shadowBlur=0}})),o.holos.forEach((r,a)=>s.push({id:"holo"+a,w:Dn[0],h:Dn[1],draw(e,n,i){e.fillStyle="#000",e.fillRect(0,0,n,i);let u=[...r];e.fillStyle="#ffffff",e.shadowColor="#bff",e.shadowBlur=12;let m=Math.min(n*.9,(i-20)/u.length);e.font=`900 ${Math.round(m*.86)}px ${oa}`,u.forEach((l,h)=>e.fillText(l,n/2,10+m*(h+.5)+(i-20-m*u.length)/2)),e.shadowBlur=0,e.globalAlpha=.6,e.strokeStyle="#fff",e.lineWidth=2,e.strokeRect(6,6,n-12,i-12),e.globalAlpha=1}})),{E:s,nRoof:t.length}}function qi(){let s=[];for(let t=0;t<=Math.floor(Sa/100);t++)s.push({id:"kp"+t,w:40,h:24,draw(r,a,e){r.fillStyle=oo,r.fillRect(0,0,a,e),r.strokeStyle="#fff",r.lineWidth=2,r.strokeRect(2,2,a-4,e-4),r.fillStyle="#fff",r.font="700 17px Rajdhani, sans-serif",r.fillText((t/10).toFixed(1),a/2,e/2+1)}});let o=new Map;for(let t of Gs)t.kind==="exit"&&o.set(t.jp+t.ref,t);for(let[t,r]of o)s.push({id:"exit:"+t,w:176,h:92,draw(a,e,n){a.fillStyle=oo,a.fillRect(0,0,e,n),a.strokeStyle="#fff",a.lineWidth=3,Ma(a,4,4,e-8,n-8,6),a.stroke(),a.fillStyle="#fff",a.fillRect(10,10,50,27),a.fillStyle=oo,a.font=`900 19px ${oa}`,a.fillText("\u51FA\u53E3",35,24),a.fillStyle="#fff",a.font="700 14px Rajdhani, sans-serif",a.fillText("EXIT",35,48),r.ref&&(a.font="700 17px Rajdhani, sans-serif",a.fillText(r.ref,35,70),a.strokeStyle="#fff",a.lineWidth=2,a.strokeRect(21,59,28,22)),a.textAlign="left",vt(a,r.jp,70,35,e-78,38,900),a.font="600 18px Rajdhani, sans-serif",a.fillText(r.name,71,71)}});s.push({id:"speed",w:80,h:80,draw(t,r,a){t.clearRect(0,0,r,a),t.beginPath(),t.arc(r/2,a/2,r/2-2,0,Math.PI*2),t.fillStyle="#d8101c",t.fill(),t.beginPath(),t.arc(r/2,a/2,r/2-10,0,Math.PI*2),t.fillStyle="#ffffff",t.fill(),t.fillStyle="#1340a0",t.font='700 40px Rajdhani, "Chakra Petch", sans-serif',t.fillText("50",r/2,a/2+3)}}),s.push({id:"c1",w:176,h:88,draw(t,r,a){t.fillStyle=oo,t.fillRect(0,0,r,a),t.strokeStyle="#fff",t.lineWidth=3,Ma(t,4,4,r-8,a-8,6),t.stroke(),ea(t,11,14,42,"C1",!0),t.fillStyle="#fff",t.textAlign="left",vt(t,"\u90FD\u5FC3\u74B0\u72B6\u7DDA",70,36,96,28,900),t.font="600 15px Rajdhani, sans-serif",t.fillText("Inner Circular Rt",70,68)}});for(let[t,r]of new Map(Object.values(as).map(a=>[a[0],a])))s.push({id:"ward:"+t,w:176,h:66,draw(a,e,n){a.fillStyle="#1846a8",a.fillRect(0,0,e,n),a.strokeStyle="#fff",a.lineWidth=3,a.strokeRect(4,4,e-8,n-8),a.fillStyle="#fff",vt(a,t,e/2,n*.4,e-24,30,900),a.font="600 15px Rajdhani, sans-serif",a.fillText(r[1],e/2,n*.8)}});for(let t of[1,-1])s.push({id:t>0?"chev-r":"chev-l",w:48,h:60,draw(r,a,e){r.fillStyle="#ffd200",r.fillRect(0,0,a,e),r.fillStyle="#111",r.save(),r.translate(a/2,e/2),r.scale(t*.72,.72);for(let n of[-14,10])r.beginPath(),r.moveTo(n-10,-26),r.lineTo(n+10,0),r.lineTo(n-10,26),r.lineTo(n-22,26),r.lineTo(n-2,0),r.lineTo(n-22,-26),r.closePath(),r.fill();r.restore()}});for(let t of Eo)t.name&&s.push({id:"tun:"+t.name,w:320,h:84,draw(r,a,e){r.fillStyle="#e9e5da",r.fillRect(0,0,a,e),r.strokeStyle="#333",r.lineWidth=3,r.strokeRect(4,4,a-8,e-8),r.fillStyle="#16151a",vt(r,t.jp,a/2,e*.4,a-30,44,900),r.font="700 18px Rajdhani, sans-serif",r.fillText(`${t.name.toUpperCase()}   ${t.length.toLocaleString("en")} m`,a/2,e*.8)}});return s.push({id:"sos",w:64,h:40,draw(t,r,a){t.fillStyle="#ffffff",t.fillRect(0,0,r,a),t.fillStyle="#d0101c",t.fillRect(3,3,r-6,a-6),t.fillStyle="#fff",vt(t,"\u975E\u5E38\u96FB\u8A71",r/2,a*.42,r-10,15,900),t.font="700 10px Rajdhani, sans-serif",t.fillText("SOS",r/2,a*.8)}}),s}function Yi(){let s=[],o=(t,r,a,e,n,i,u=!1,m=1,l=0)=>s.push({s:wo(t),id:r,x:a,y:e,w:n,h:i,post:u,gain:m,mode:l});for(let t=0;t<=Math.floor(Sa/100);t++){let r=t*100;wt(r)?o(r,"kp"+t,-7,1.5,.66,.4):o(r,"kp"+t,-6.5,1.36,.66,.4)}for(let t of Gs)if(t.kind==="exit")for(let r of[400,40]){let a=t.s-r,e="exit:"+t.jp+t.ref;wt(a)?o(a,e,-4.6,5,3.4,1.78):o(a,e,-7.6,4.6,3.8,1.98,!0)}for(let t=600;t<Sa;t+=1500)wt(t)||o(t,"speed",-7.4,3.2,1,1,!0);for(let t of qa){let r=t.nodes[t.nodes.length-1]+420;wt(r)||o(r,"c1",-7.6,3.4,2.4,1.2,!0)}for(let t=0;t<Go.length;t++){let r=Go[t],a=Go[(t+1)%Go.length];as[r.id][0]!==as[a.id][0]&&!wt(a.from)&&o(a.from,"ward:"+as[a.id][0],-7.5,3,2.2,.82,!0)}for(let t=0;t<Sa;t+=14){let r=qr(t);Math.abs(r)>1/140&&!wt(t)&&o(t,r>0?"chev-r":"chev-l",r>0?-6.58:6.58,1.5,.62,.78,!1,1.1)}for(let t of Eo)for(let r=t.from+100;r<t.to-20;r+=200)o(r,"sos",-7.1,2.6,.8,.5,!1,1.2);for(let t of Eo)t.name&&o(t.from-6.2,"tun:"+t.name,0,8.25,5.4,1.42,!1,.9);return s.sort((t,r)=>t.s-r.s),s}function Ki(){let s=[0,1,2].map(o=>{let t=new V(1,1,1).translate(0,.5,0);return t.setAttribute("aTid",new gt(new Array(t.attributes.position.count).fill(o),1)),t});return Lo(s,!1)}function Qi(){let s=[[6.1,.004,6.4,.004,0,0,0,1],[6.4,0,6.4,1.05,1,0,0,1],[6.4,1.05,6.75,1.05,2,0,0,1],[6.75,1.05,6.75,-2,3,0,0,1],[6.75,-2,0,-2,3,0,0,1],[6.6,1.05,6.6,1.05,5,0,1,1],[7.2,0,7.2,0,6,0,2,1],[6.75,.004,7.2,.004,7,0,0,1],[7.2,.03,8.3,.03,7,2,2,1],[7.2,0,7.2,7,8,0,0,1],[7.14,5.7,7.14,6.1,9,0,0,1],[-7.2,7,7.2,7,10,0,0,0],[-34.5,-2.5,-34.5,8,11,3,3,0]],o=Et.N,t=Et.NEAR,r=Et.STEP,a=[],e=[],n=[],i=[],u=[];for(let[l,h,v,E,M,p,H,k]of s)for(let g of k?[1,-1]:[1]){let b=l*g,U=v*g,J=-(E-h),j=(v-l)*g,z=Math.hypot(J,j)||1;J/=z,j/=z;let G=a.length/3;for(let L=0;L<=o;L++){let f=t-L*r;if(a.push(b,h,f,U,E,f),e.push(J,j,0,J,j,0),n.push(M,M),i.push(p,H),L<o){let S=G+L*2;u.push(S,S+1,S+2,S+1,S+3,S+2)}}}let m=new dt;return m.setAttribute("position",new gt(a,3)),m.setAttribute("normal",new gt(e,3)),m.setAttribute("aPart",new gt(n,1)),m.setAttribute("aMode",new gt(i,1)),m.setIndex(u),m}function Zi(){let s=[-340,-150,-70,-36,-34.6,-34.4,-24.6,-24.2,-14.2,-13.8,-8.3,-7.25,-7.15,7.15,7.25,8.3,13.8,14.2,24.2,24.6,34.4,34.6,60,60.4,150,340],o=Et.N,t=Et.NEAR,r=Et.STEP,a=[],e=[],n=s.length;for(let u=0;u<=o;u++)for(let m of s)a.push(m,0,t-u*r);for(let u=0;u<o;u++)for(let m=0;m<n-1;m++){let l=u*n+m,h=l+n;e.push(l,h,l+1,l+1,h,h+1)}let i=new dt;return i.setAttribute("position",new gt(a,3)),i.setIndex(e),i}function Nn(s,{seed:o=2066}={}){let t=eo(o),r=new Be;s.add(r);let a=0,e=-1e9,n=-1,i=!0,u=new Uint8Array(Et.N*2*4),m=new Lr(u,Et.N,2,Ar);m.magFilter=m.minFilter=Yo,m.needsUpdate=!0,ht.uProf.value=m;let l=d=>Math.max(0,Math.min(255,Math.round(d*255)));function h(d){for(let T=0;T<Et.N;T++){let te=d-Et.NEAR+(T+.5)*Et.STEP,oe=T*4,ve=(Et.N+T)*4;u[oe]=l((pt(Ho,te)+24)/64),u[oe+1]=l(pt(la,te)),u[oe+2]=l(pt(Fn,te)/8),u[oe+3]=l(pt(rs,te)),u[ve]=l(pt(js,te)),u[ve+1]=l(pt(Wn,te)),u[ve+2]=l(Math.abs(pt(Xs,te))),u[ve+3]=l(pt(ns,te))}m.needsUpdate=!0}let v=new D(Zi(),ln());v.frustumCulled=!1,v.renderOrder=-1;let E=cn();E.side=Mt,E.uniforms.uLed&&E.uniforms.uLed.value.set("#000000");let M=new D(Qi(),E);M.frustumCulled=!1,s.add(v,M);let p=30,H=Math.ceil(Vs/p)+2,k=ct({color:"#5c5a58",roughness:.9,metalness:.05}),g=new Oe(new V(2.6,1,2.2).translate(0,.5,0),k,H),b=new Oe(new V(12.2,1.4,2.6).translate(0,-.7,0),k,H);g.frustumCulled=b.frustumCulled=!1,s.add(g,b);let U=ct({color:"#6a6660",roughness:.9,metalness:.05}),J=Lo([new V(24,3.6,2.2).translate(0,8.8,0),new V(5,7.2,2.2).translate(-9.7,3.6,0),new V(5,7.2,2.2).translate(9.7,3.6,0)],!1),j=[0,1].map(()=>{let d=new D(J,U);return d.frustumCulled=!1,d.visible=!1,s.add(d),d}),z=[64,26,12],G=2*z.reduce((d,T)=>d+T,0),L=Ki(),f=new Float32Array(G),S=new Float32Array(G*4),F=new Float32Array(G*4);L.setAttribute("aSeed",new kt(f,1)),L.setAttribute("aTier",new kt(S,4)),L.setAttribute("aKind",new kt(F,4));let q=bn(),B=new Oe(L,q,G);B.frustumCulled=!1,r.add(B);let Q=[],Y=[];for(let d of[-1,1])z.forEach((T,te)=>{let oe={side:d,row:te,idx:[],head:0,cursor:0};for(let ve=0;ve<T;ve++)oe.idx.push(Q.length),Q.push({thin:te===1&&ve%2===1,side:d,row:te,z:0,len:10,gap:0,x:0,dep:10,h:0,base:0,kind:1,seed:0,tier:[1,1,0,0],sign:[-1,-1,-1],holo:-1,helipad:!1});Y.push(oe)});let{E:_,nRoof:Me}=Xi(),w=Fs(_,2048),C=new Le(1,1),O=(d,T,te)=>{let oe=d.clone(),ve=new Float32Array(te*4),He=new Float32Array(te*4);oe.setAttribute("aRect",new kt(ve,4)),oe.setAttribute("aAnim",new kt(He,4));let Te=new Oe(oe,T,te);Te.frustumCulled=!1;for(let ue=0;ue<te;ue++)Te.setMatrixAt(ue,Lt);return{m:Te,r:ve,a:He}},$=O(C,$a(w.texture),G*3),se=O(C,$a(w.texture,{holo:!0}),G);r.add($.m,se.m);let re=new Oe(new V(1,1,1).translate(0,.5,0),ct({color:"#2a2a30",roughness:.8,metalness:.3}),G*3);re.frustumCulled=!1,r.add(re);let ye=new Le(1,1),c=new Float32Array(G*2*4);ye.setAttribute("aBlink",new kt(c,4));let le=new Oe(ye,_a({gain:2.2,fog:!0,bent:!0}),G*2);le.frustumCulled=!1;for(let d=0;d<G*2;d++)le.setColorAt(d,new W("#ff1a24")),le.setMatrixAt(d,Lt);r.add(le);let ce=90,Fe=new Wr(1,1),Ge=new Oe(Fe,ct({color:"#0e1a12",roughness:1,metalness:0,emissive:"#06100a",emissiveIntensity:.6}),ce*2);Ge.frustumCulled=!1,r.add(Ge);let ee=[],Pe=[];for(let d of[-1,1]){let T={side:d,idx:[],head:0,cursor:0};for(let te=0;te<ce;te++)T.idx.push(ee.length),ee.push({side:d,z:0,step:8,x:0,y:0,r:0});Pe.push(T)}let at=Fs(qi(),1024),x=Yi(),Z=72,fe=O(C,$a(at.texture),Z);for(let d of x)d.rect=at.rect(d.id);let K=new Oe(new V(.2,1,.2).translate(0,.5,0),ct({color:"#3a3c40",roughness:.5,metalness:.6}),Z);K.frustumCulled=!1,s.add(fe.m,K),document.fonts?.ready&&Promise.all([document.fonts.load('900 40px "Noto Sans JP"',"\u9AD8\u901F\u51FA\u53E3\u90FD\u5FC3\u74B0\u72B6\u7DDA"),document.fonts.load("700 40px Rajdhani"),document.fonts.load('700 40px "Chakra Petch"')]).catch(()=>{}).then(()=>{w.redraw(),at.redraw()});let N=new xt,X=new ne,he=new Ie,de=new ne,nt=new Ie,St=[new Ie().setFromAxisAngle(new ne(0,1,0),Math.PI/2),new Ie().setFromAxisAngle(new ne(0,1,0),-Math.PI/2)],Wt=[new Ie().setFromAxisAngle(new ne(0,1,0),.55),new Ie().setFromAxisAngle(new ne(0,1,0),-.55)],Nt={buildings:1,extras:!0},ro=d=>d,ms=d=>{let T=0;for(let oe in d)T+=d[oe];let te=t()*T;for(let oe in d)if(te-=d[oe],te<=0)return+oe;return 1};function no(d,T){let te=ro(T),oe=kn(te),ve=ss[oe.index],He=ve.rows[d.row],Te=d.side;d.z=T,d.sign[0]=d.sign[1]=d.sign[2]=-1,d.holo=-1;let ue=Te<0?ve.left:ve.right;if(ue==="palace"||ue==="park"&&d.row<2||Te>0&&ve.bayRight&&d.row>0||d.thin&&Nt.buildings<1){d.h=0,d.len=16+t()*10,d.gap=0;return}d.len=ts(He.len[0],He.len[1],t()),d.gap=ts(He.gap[0],He.gap[1],t()),d.dep=ts(He.dep[0],He.dep[1],t()),d.h=ts(He.h[0],He.h[1],Math.pow(t(),He.pow)),Te<0&&ve.leftCap&&(d.h=Math.min(d.h,ve.leftCap+t()*6));let be=te+d.len/2,Ve=pt(Ho,be),me=He.x0+t()*He.xj;d.row===0&&pt(rs,be)>.1&&(me=Math.max(me,25.2)),d.row===0&&Ve<-.3&&(me=Math.max(me,8.6)),d.row===0&&pt(ns,be)>.1&&Te>0&&(me=Math.max(me,26)),Xs[Math.floor(wo(be)/ca)%ot]===Te&&(me=Math.max(me,d.row===0?50:70)),d.x=Te*(me+d.dep/2),d.base=-Ve,d.kind=ms(He.kinds),d.seed=t(),d.h>55&&(d.kind<2||d.kind===4||d.kind===5)?d.tier=[Math.min(.4,(10+t()*14)/d.h),1-(.04+t()*.07),.06+t()*.14,.22+t()*.2]:d.h>24&&t()<.3?d.tier=[1-(.12+t()*.1),1,.16+t()*.12,0]:d.tier=[1,1,0,0];let De=Math.floor(d.seed*997+.5)/997;d.helipad=d.h>110&&De*13.7%1>.45&&d.kind<2,d.lit=Math.min(.9,(ve.lit+.06)*(d.kind===4?1.2:1)*(.3+1.7*t()*t())),d.warm=ve.warm,d.shop=ve.shop*(d.row===0?1:.35);let qe=ve.signs;d.row<2&&(t()<qe*(d.kind===2?1:.55)&&d.h>9&&(d.sign[0]=t()<.3&&d.kind===2?100+(t()*8|0):t()*qo.blades.length|0),t()<qe*.7&&(d.sign[1]=200+(t()*qo.boards.length|0))),d.h>60&&(d.kind<2||d.kind===4)&&t()<(ve.lamp==="led"?.45:.25)&&(d.sign[1]=300+(t()*qo.crowns.length|0)),d.h<48&&d.h>12&&!d.helipad&&t()<qe*.32&&(d.sign[2]=400+(t()*Me|0)),d.h>40&&t()<qe*.07&&(d.holo=t()*qo.holos.length|0)}let io=d=>d>=400?"roof"+(d-400):d>=300?"crown"+(d-300):d>=200?"board"+(d-200):d>=100?"stack"+(d-100):"blade"+d;function Ot(d,T,te,oe,ve,He,Te){let ue=w.rect(te);d.r[T*4]=ue[0],d.r[T*4+1]=ue[1],d.r[T*4+2]=ue[2],d.r[T*4+3]=ue[3],d.a[T*4]=oe,d.a[T*4+1]=ve,d.a[T*4+2]=He,d.a[T*4+3]=Te}function lo(d){let T=Q[d],te=-(T.z+T.len/2-a);for(let xe=0;xe<3;xe++)$.m.setMatrixAt(d*3+xe,Lt),re.setMatrixAt(d*3+xe,Lt);if(se.m.setMatrixAt(d,Lt),le.setMatrixAt(d*2,Lt),le.setMatrixAt(d*2+1,Lt),T.h<=0){B.setMatrixAt(d,Lt);return}B.setMatrixAt(d,N.compose(X.set(T.x,T.base,te),nt,de.set(T.dep,T.h,T.len))),f[d]=T.seed,S.set(T.tier,d*4),F[d*4]=T.kind,F[d*4+1]=T.lit,F[d*4+2]=T.warm,F[d*4+3]=T.shop;let oe=T.side,ve=T.x-oe*T.dep/2,He=T.base+T.h,Te=T.seed*7.3,ue=St[oe>0?1:0];if(T.sign[0]>=0){let xe=T.sign[0]>=100,De=xe?1.7:1.2+T.seed*.7,qe=De*4,yt=T.base+Math.min(T.h-qe-1,4+T.seed*Math.max(0,T.h*.5-qe))+qe/2;if(yt-qe/2>T.base+2.5){$.m.setMatrixAt(d*3,N.compose(X.set(ve-oe*(De/2+.25),yt,te+T.len/2-.8),nt,de.set(De,qe,1)));let Vo=!xe&&(T.sign[0]%5===0||T.sign[0]%5===3);Ot($,d*3,io(T.sign[0]),xe?0:1,0,Te,xe?1.1:Vo?.85:1.5)}}if(T.sign[1]>=300){let xe=T.tier[2],De=T.tier[1]<1?T.tier[1]:1,qe=Math.min(T.len*(1-xe)*.82,26),yt=qe*is[1]/is[0];$.m.setMatrixAt(d*3+1,N.compose(X.set(T.x-oe*(T.dep*(1-xe)/2+.06),T.base+T.h*De-yt*.9,te),ue,de.set(qe,yt,1))),Ot($,d*3+1,io(T.sign[1]),0,0,Te,1.05)}else if(T.sign[1]>=200){let xe=Math.min(T.len*.8,6+T.seed*4),De=xe/4;$.m.setMatrixAt(d*3+1,N.compose(X.set(ve-oe*.06,T.base+4.4+De/2+(T.seed>.6?3.2:0),te),ue,de.set(xe,De,1))),Ot($,d*3+1,io(T.sign[1]),T.seed>.7?4:1,.8,Te,(T.sign[1]-200)%4===1?.85:1.15)}if(T.sign[2]>=400){let xe=Math.min(T.len*.9,7+T.seed*5),De=xe*ls[1]/ls[0];$.m.setMatrixAt(d*3+2,N.compose(X.set(T.x-oe*T.dep*.18,He+1.2+De/2,te+T.len*.2),Wt[oe>0?0:1],de.set(xe,De,1))),Ot($,d*3+2,io(T.sign[2]),T.seed>.5?3:1,.04+T.seed*.05,Te,1.35)}if(Nt.extras&&T.holo>=0){let xe=26+T.seed*20,De=xe/3;se.m.setMatrixAt(d,N.compose(X.set(ve-oe*(De*.5+3),T.base+T.h*.35+xe/2,te),nt,de.set(De,xe,1))),Ot(se,d,"holo"+T.holo,5,0,Te,.9)}let be=T.tier[1]<1?T.tier[3]:T.tier[0]<1?T.tier[2]:0,Ve=T.dep*(1-be)/2,me=T.len*(1-be)/2;if(Nt.extras&&!T.helipad&&T.h>8){let xe=T.seed*31.7%1,De=T.seed*57.3%1;re.setMatrixAt(d*3,N.compose(X.set(T.x+(xe-.5)*Ve,He,te+(De-.5)*me),nt,de.set(Math.min(6,Ve*1.1),3.4,Math.min(5,me*.7)))),re.setMatrixAt(d*3+1,N.compose(X.set(T.x-(De-.5)*Ve,He,te-(xe-.5)*me),nt,de.set(Ve*.7,1.3,me*.4))),T.h>35&&re.setMatrixAt(d*3+2,N.compose(X.set(T.x+Ve*.6*(xe>.5?1:-1),He,te+me*.5),nt,de.set(.35,7+De*8,.35)))}if(T.h>60)for(let xe=0;xe<2;xe++){let De=xe?1:-1;le.setMatrixAt(d*2+xe,N.compose(X.set(T.x+De*Ve*.92,He+.6,te+De*me*.92),nt,de.set(2.2,2.2,2.2)));let qe=(d*2+xe)*4;c[qe]=T.h>110?.75:0,c[qe+1]=T.seed*.08,c[qe+2]=.4,c[qe+3]=.3}}function ua(d,T){let te=ro(T),oe=ss[kn(te).index],ve=pt(Ho,te);d.z=T;let He=d.side<0?oe.left:oe.right;He==="palace"&&ve>-3?(d.step=4+t()*4,d.r=4+t()*5,d.x=d.side*(37+d.r+t()*70),d.y=-ve+8+d.r*.3):He==="park"&&ve>-3?(d.step=4+t()*5,d.r=3.5+t()*4,d.x=d.side*(20+d.r+t()*55),d.y=-ve+d.r*.6):(d.step=20,d.r=0)}function da(d){let T=ee[d];if(T.r<=0){Ge.setMatrixAt(d,Lt);return}Ge.setMatrixAt(d,N.compose(X.set(T.x,T.y,-(T.z-a)),nt,de.set(T.r,T.r*.8,T.r)))}function Oo(d){for(let T of Y){T.head=0,T.cursor=d-os+(T.row?-40:0);for(let te of T.idx){let oe=Q[te];no(oe,T.cursor),T.cursor=oe.z+oe.len+oe.gap}}for(let T of Pe){T.head=0,T.cursor=d-os;for(let te of T.idx){let oe=ee[te];ua(oe,T.cursor),T.cursor=oe.z+oe.step}}}function Ut(){for(let d=0;d<G;d++)lo(d);for(let d=0;d<ee.length;d++)da(d);Ba()}function Ba(){for(let d of[B,$.m,se.m,re,le,Ge])d.instanceMatrix.needsUpdate=!0;for(let d of[L])d.attributes.aSeed.needsUpdate=d.attributes.aTier.needsUpdate=d.attributes.aKind.needsUpdate=!0;for(let d of[$,se])d.m.geometry.attributes.aRect.needsUpdate=d.m.geometry.attributes.aAnim.needsUpdate=!0;ye.attributes.aBlink.needsUpdate=!0}let ze=null;function At(d,T,te){ze!==T&&(ze=T,ro=ue=>T.trackS(ue));let oe=d.z;(Math.abs(oe-e)>150||d.startS!==n)&&(n=d.startS,a=Math.floor(oe/1e3)*1e3,Oo(oe),i=!0),e=oe,oe-a>4e3&&(a+=4e3,i=!0),r.position.z=oe-a;let ve=!1;for(let ue of Y)for(let be=0;be<8;be++){let Ve=ue.idx[ue.head],me=Q[Ve];if(me.z+me.len>oe-os)break;no(me,ue.cursor),ue.cursor=me.z+me.len+me.gap,i||lo(Ve),ue.head=(ue.head+1)%ue.idx.length,ve=!0}for(let ue of Pe)for(let be=0;be<8;be++){let Ve=ue.idx[ue.head],me=ee[Ve];if(me.z>oe-os)break;ua(me,ue.cursor),ue.cursor=me.z+me.step,i||da(Ve),ue.head=(ue.head+1)%ue.idx.length,ve=!0}i?(Ut(),i=!1):ve&&Ba();let He=d.s;h(He),ht.uS.value=d.startS+oe,g.position.z=oe%p;for(let ue=0;ue<H;ue++){let be=Et.NEAR-ue*p,Ve=be+g.position.z,me=pt(Ho,He-Ve);if(me<3.5||pt(la,He-Ve)>0){g.setMatrixAt(ue,Lt),b.setMatrixAt(ue,Lt);continue}g.setMatrixAt(ue,N.compose(X.set(0,-me,be),nt,de.set(1,me-3.3,1))),b.setMatrixAt(ue,N.makeTranslation(0,-2,be))}if(b.position.z=g.position.z,g.instanceMatrix.needsUpdate=b.instanceMatrix.needsUpdate=!0,te&&te.index>=0){let ue=te.z0-5-oe,be=te.z1-5-oe;j[0].visible=ue>-40&&ue<Vs,j[0].position.set(0,0,-ue),j[1].visible=be>-40&&be<Vs&&ue<0,j[1].position.set(0,0,-be)}else j[0].visible=j[1].visible=!1;let Te=0;for(let ue=0;ue<x.length&&Te<Z;ue++){let be=x[ue],Ve=qt(He-20,be.s)-20;Ve>640||(fe.m.setMatrixAt(Te,N.compose(X.set(be.x,be.y,-Ve),nt,de.set(be.w,be.h,1))),fe.r[Te*4]=be.rect[0],fe.r[Te*4+1]=be.rect[1],fe.r[Te*4+2]=be.rect[2],fe.r[Te*4+3]=be.rect[3],fe.a[Te*4]=be.mode,fe.a[Te*4+1]=0,fe.a[Te*4+2]=ue*.37,fe.a[Te*4+3]=be.gain,be.post?K.setMatrixAt(Te,N.compose(X.set(-6.58,1.05,-Ve-.12),nt,de.set(1,be.y-1.05,1))):K.setMatrixAt(Te,Lt),Te++)}fe.m.count=K.count=Te,fe.m.instanceMatrix.needsUpdate=K.instanceMatrix.needsUpdate=!0,fe.m.geometry.attributes.aRect.needsUpdate=fe.m.geometry.attributes.aAnim.needsUpdate=!0}let Uo=new W;function vs(d){q.uniforms.uWin.value.forEach((oe,ve)=>oe.set(d.windows[ve])),ht.uSky.value.set(d.horizon).multiplyScalar(.9),ht.uAmb.value.set(d.hemi[0]).multiplyScalar(.05+.08*d.hemi[2]),ht.uUp.value.set(d.windows[1]).lerp(Uo.set("#ff9a50"),.5).multiplyScalar(.42),ht.uLampCol.value.set(d.windows[1]).lerp(Uo.set("#ffffff"),.35),sa.uFAmb.value.set(d.hemi[0]).multiplyScalar(.05+.12*d.hemi[2]),sa.uFStreet.value.set(d.windows[1]).lerp(Uo.set("#ff9a50"),.5).multiplyScalar(.4);let T=sa.uFSky.value.set(d.horizon).lerp(Uo.set(d.glow),.35),te=.2126*T.r+.7152*T.g+.0722*T.b;T.multiplyScalar(te>.1?.1/te:1)}function xs(d){ht.uLampCol.value.copy(d)}function gs(d){Nt={...Nt,...d},ht.uDetail.value=Nt.extras?1:0,re.visible=se.m.visible=!!Nt.extras,e=-1e9}function Xe(d){for(let T of[r,v,M,g,b,fe.m,K])T.visible=d;d||(j[0].visible=j[1].visible=!1)}return{update:At,applyTime:vs,applyQuality:gs,setLamp:xs,setVisible:Xe,deckAt:ji,tunnelAt:d=>pt(la,d)>.5,meshes:{ground:v,structure:M,buildings:B}}}var So=760,Ys=14;var Aa=(s,o)=>new W(s).multiplyScalar(o),Ji=.0011,On=16e-5;function Un(s,o){let t=new Na,r=new kr(60,16/9,.1,3e3);r.position.set(0,2.1,6);let a=eo(77),e={...o},n=null,i=0,u=0,m=0,l=60,h=new ne(0,2.1,6),v=new Or("#ff5aa0","#120a1e",.5);t.add(v);let E=new Ur("#ff9a7a",.35);E.position.set(-60,90,120),t.add(E);let M=new As,p=(A,I)=>{let P=new Ps(A,0,0,.42,.85,0);return P.userData.off=new ne(...I),P.target=M,P},H=p("#fff0e0",[-4,7,-5]),k=p("#c4e2ff",[4,10,7]),g=p("#ffc2a4",[6,7,-3]);t.add(H,k,g,M);let b=0,U=new Ps("#fff1dc",140,75,.42,.6,1.4),J=new As;t.add(U,J),U.target=J,t.fog=new Dr("#5a1650",.004);let j=new D(new Bt(2200,48,24),on());j.renderOrder=10,t.add(j);let z=new Be;t.add(z);let G=new D(new Le(1,1),sn());z.add(G);let L=fn(),f=Math.min(16,s.capabilities.getMaxAnisotropy?.()||8);L.map.anisotropy=L.rough.anisotropy=f;let S={wet:.3,z:0,rough:L.rough,fallback:new W},F=!1,q=ct({map:L.map,roughnessMap:L.rough,roughness:1,metalness:.05,envMapIntensity:.9}),B=new Le(10.8,So,1,380).rotateX(-Math.PI/2).translate(0,0,Ys-So/2);L.map.repeat.set(1,So/24),L.rough.repeat.set(1,So/24);let Q={value:.45};{let A=q.onBeforeCompile;q.onBeforeCompile=I=>{A(I),I.uniforms.uMinRough=Q,I.fragmentShader=I.fragmentShader.replace("void main() {",`uniform float uMinRough;
void main() {`).replace("#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
	roughnessFactor = max(roughnessFactor, uMinRough);`)},q.customProgramCacheKey=()=>"bend-road"}let Y=new D(B,q);t.add(Y);let _=[],Me=[-1,1].map(A=>{let I=un("#57565c","#3c3b42");I.repeat.set(1,So/6);let P=ct({color:"#222",emissive:"#ffffff",emissiveMap:I,emissiveIntensity:.06,roughness:.7});_.push(P);let y=new D(new Le(.7,So,1,380).rotateX(-Math.PI/2).translate(0,0,Ys-So/2),P);return y.position.set(A*5.75,.01,0),t.add(y),y}),w=34,C=Math.ceil(So/w)+1,O=w*2,$=new Be;t.add($);let se=ct({color:"#1c1b24",metalness:.7,roughness:.4}),re=new Oe(new Ae(.11,.16,9,10).translate(0,4.5,0),se,C*2),ye=new Oe(new V(2.8,.14,.18),se,C*2),c=new Oe(new V(1.3,.12,.42),Ht({color:"#ffffff"}),C*2),le=new Oe(new Le(1,1),Za({gain:.5}),C*2),ce=new Oe(new Le(1,1).rotateX(-Math.PI/2),Ja({shape:"pool",gain:.35}),C*2),Fe=new Oe(new Le(1,1).rotateX(-Math.PI/2),Ja({shape:"streak",gain:.9}),C*2),Ge=[new W,new W],ee=new xt,Pe=new Ie,at=new ne,x=new ne,Z=new xt().makeScale(0,0,0),fe=new W("#eef2ff"),K=new W,N=new W;function X(A){let I=ee,P=Pe,y=at,st=x,ge=0;for(let je=0;je<C;je++)for(let Ne of[-1,1]){let Ye=Ys-je*w-(Ne>0?w/2:0),fo=Ne*6.62;re.setMatrixAt(ge,I.makeTranslation(fo,0,Ye)),ye.setMatrixAt(ge,I.makeTranslation(fo-Ne*1.35,8.9,Ye)),c.setMatrixAt(ge,I.makeTranslation(fo-Ne*2.4,8.8,Ye));let Qt=A?A.s-(Ye+$.position.z):0;if(A&&Co.tunnelAt(Qt)){for(let Fa of he)Fa.setMatrixAt(ge,Z);ge++;continue}let bt=K.copy(Ge[Ne<0?0:1]);A&&qs(Qt)==="led"&&bt.lerp(fe,.75),c.setColorAt(ge,N.copy(bt).multiplyScalar(3.2)),le.setMatrixAt(ge,I.compose(st.set(fo-Ne*2.4,8.75,Ye),P,y.set(2.8,2.8,2.8))),le.setColorAt(ge,bt),ce.setMatrixAt(ge,I.compose(st.set(fo-Ne*2.9,.02,Ye),P,y.set(9,1,11))),ce.setColorAt(ge,bt),Fe.setMatrixAt(ge,I.compose(st.set(fo-Ne*2.4,.025,Ye+7),P,y.set(1.1,1,15))),Fe.setColorAt(ge,bt),ge++}for(let je of[re,ye,c,le,ce,Fe])je.instanceMatrix.needsUpdate=!0,je.instanceColor&&(je.instanceColor.needsUpdate=!0),je.frustumCulled=!1}let he=[re,ye,c,le,ce,Fe];$.add(re,ye,c,le,ce,Fe);let de=ct({color:"#111018",metalness:.5,roughness:.5}),nt=new xt,St=[Ws(),Ws()],Wt=null;function Nt(A){Wt=A;let I=Ya(A.nodes[A.nodes.length-1]+1);St[0].draw({kind:"jct",jp:A.jp,branches:Ln[A.jp]||[],next:I.jp.replace(/JCT$/,""),nextEn:I.name.replace(/ JCT$/,"")}),St[1].draw({kind:"advance",jp:A.jp,name:A.name,dist:"500m"})}St.forEach(A=>A.draw(null)),document.fonts?.load&&Promise.all([document.fonts.load('900 40px "Noto Sans JP"',qa.map(A=>A.jp).join("")+"\u90FD\u5FC3\u74B0\u72B6\u7DDA\u5185\u56DE\u308A\u4E0A\u91CE\u5411\u5CF6\u6C60\u888B\u65B0\u5BBF\u6E0B\u8C37\u76EE\u9ED2\u7FBD\u7530\u53F0\u5834"),document.fonts.load("700 40px Rajdhani"),document.fonts.load("600 40px Rajdhani")]).catch(()=>{}).then(()=>{Wt?Nt(Wt):St.forEach(A=>A.draw(null))});let ro=[],ms=Ht({color:Aa("#3dff8a",1.4)});for(let A=0;A<2;A++){let I=new Be,P=new Be,y=new Be;for(let Ne of[-1,1]){let Ye=new D(new V(.6,8.2,.6).translate(0,4.1,0),de);Ye.position.x=Ne*6.9,P.add(Ye)}let st=new D(new V(15,.9,.7),de);st.position.y=7.9,P.add(st),Je.forEach(Ne=>{let Ye=new D(new V(.7,.42,.05),ms);Ye.position.set(Ne,7.2,.38),P.add(Ye)});let ge=new D(new Le(7.2,2.7),Ht({map:St[A],color:Aa("#ffffff",1.05)}));ge.position.set(0,9.75,.2);let je=new D(new V(7.5,3,.3),de);je.position.set(0,9.75,0),y.add(ge,je),I.add(P,y),t.add(I),ro.push({g:I,frame:P,panel:y,z:-1e6})}let no=72,io=new Oe(new ja(.5,0),Ht({color:Aa("#d6f8ff",2.4)}),no),Ot=new Oe(new ja(.62,0),Ht({color:Aa("#ffffff",.4),wireframe:!0}),no),lo=new Oe(new Le(1,1),Za({gain:.5}),no);for(let A of[io,Ot,lo])A.frustumCulled=!1,t.add(A);Ot.visible=!1;for(let A=0;A<no;A++)lo.setColorAt(A,new W("#7fe6ff"));let ua=yn(),da={sedan:[],hatch:[],hauler:[]},Oo=new Map,Ut=new Oe(new Le(1,1).rotateX(-Math.PI/2),Ja({shape:"streak",gain:1.1}),64);Ut.frustumCulled=!1;for(let A=0;A<64;A++)Ut.setColorAt(A,new W("#ff1a3c"));t.add(Ut);function Ba(A){let I=Oo.get(A.id);return I||(I=da[A.kind].pop()||ua.make(A.kind,A.paint),t.add(I.group),I.group.visible=!0,Oo.set(A.id,I),I)}let ze=null,At=new D(new Le(1,1).rotateX(-Math.PI/2),nn());At.position.y=.03;let Uo=0,vs=!1,xs=null;function gs(A){ze&&(t.remove(ze.group),ze.gltf||ze.group.traverse(P=>{P.isMesh&&P!==At&&P.geometry.dispose()})),ze&&(A.lastSpeed=ze.lastSpeed,A.slide=ze.slide,A.group.position.copy(ze.group.position),A.group.rotation.copy(ze.group.rotation)),ze=A;let I=(xa[e.glow]||xa[0]).color;At.scale.set(ze.bike?2.2:ze.width+2.4,1,ze.length+(ze.bike?1.6:2.6)),At.rotation.set(0,0,0),At.material.uniforms.uColor.value.set(I||"#000000"),At.material.uniforms.uGain.value=ze.bike?.75:1.6,At.visible=!!I,ze.group.add(At),te&&(te.scale.set(1,1,1),te.position.set(0,ze.bike?.9:.7,0),ze.group.add(te),te.geometry.dispose(),te.geometry=new Bt(1,24,16).scale(ze.bike?.9:1.3,ze.bike?1.1:.9,ze.length*.62)),oe&&ze.group.add(oe),t.add(ze.group)}let Xe=null,d=null,T=[],te=null,oe=null,ve=new ja(.42,0),He=new Qo(.75,.035,8,40),Te={ghost:new Ee({color:new W("#5ff6ff").multiplyScalar(4)}),nitro:new Ee({color:new W("#ffb020").multiplyScalar(4)})},ue=Array.from({length:3},()=>{let A=new Be;return A.add(new D(ve,Te.ghost),new D(He,Te.ghost)),A.visible=!1,t.add(A),A});function be(){d&&(t.remove(d.group),d.group.traverse(I=>{I.isMesh&&I.geometry.dispose()}));let A=e.car!=="bike"||!!e.rash;d=Os(A?"bike":"wedge",A?va[5]:va[6],A?"#ff2bd6":"#b8ff2e","roadster"),d.glowLight&&(d.group.remove(d.glowLight),d.glowLight=null),d.tailLight&&(d.tailLight.intensity=.6),d.group.visible=!1,t.add(d.group)}function Ve(){if(be(),!te){te=new D(new Bt(1,32,24),new we({uniforms:{uTime:ie.uTime,opacity:{value:.3},uColor:{value:new W("#5ff6ff")}},transparent:!0,depthWrite:!1,blending:Ke,side:Mt,vertexShader:`varying vec3 vN; varying vec3 vV; varying vec3 vP;
          void main(){ vP = position; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,fragmentShader:`uniform float uTime, opacity; uniform vec3 uColor; varying vec3 vN; varying vec3 vV; varying vec3 vP;
          float hex(vec2 p){ p.x *= 1.1547; p.y += mod(floor(p.x), 2.0) * 0.5; p = abs(fract(p) - 0.5); return abs(max(p.x * 1.5 + p.y, p.y * 2.0) - 1.0); }
          void main(){
            float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.6);
            float cells = smoothstep(0.08, 0.0, hex(vec2(atan(vP.z, vP.x) * 3.0, vP.y * 5.0)));
            float ripple = smoothstep(0.12, 0.0, abs(fract(vP.y * 0.5 - uTime * 0.6) - 0.5));
            float a = f * 1.4 + cells * 0.18 * (0.4 + f) + ripple * 0.12;
            gl_FragColor = vec4(uColor * 2.2 * a, a) * opacity * 3.0;
          }`})),te.visible=!1,oe=new Be;let y=[];for(let je=0;je<=16;je++){let Ne=je/16;y.push(new ne(Math.sin(Ne*2.4)*.25*Ne,-Ne*1.9,-Math.sin(Ne*3.1)*.2*Ne))}let st=new D(new Xa(new Ua(y),32,.016,5),new Ee({color:new W("#ff2bd6").multiplyScalar(2.5)})),ge=new D(new Ae(.03,.03,.22,8),new Ue({color:"#0d0d0d",roughness:.4}));ge.position.y=.05,oe.add(st,ge),oe.visible=!1}let A=va[e.livery]||va[0],I=(xa[e.glow]||xa[0]).color,P=++Uo;gs(Os(e.car,A,I))}let me=600,xe=new Float32Array(me*3),De=new Float32Array(me*3),qe=new Float32Array(me),yt=new Float32Array(me*3),Vo=new Float32Array(me),er=new Float32Array(me),jo=new Float32Array(me*3),tr=new Float32Array(me),Ao=new dt;Ao.setAttribute("position",new Xt(xe,3)),Ao.setAttribute("aColor",new Xt(De,3)),Ao.setAttribute("aSize",new Xt(qe,1));let or=rn(),ar=new Fr(Ao,or);ar.frustumCulled=!1,t.add(ar);let Kn=0,Qn=new W;function Qe(A,I,P){let y=Qn.set(P.color);for(let st=0;st<A;st++){let ge=Kn++%me;xe[ge*3]=I.x+(Math.random()-.5)*(P.spread||.3),xe[ge*3+1]=I.y+Math.random()*(P.spreadY||.2),xe[ge*3+2]=I.z+(Math.random()-.5)*(P.spread||.3);let je=P.speed*(.4+Math.random()*.8),Ne=Math.random()*Math.PI*2,Ye=(Math.random()-.2)*Math.PI*.6;yt[ge*3]=Math.cos(Ne)*Math.cos(Ye)*je+(P.vx||0),yt[ge*3+1]=Math.abs(Math.sin(Ye))*je+(P.vy||0),yt[ge*3+2]=Math.sin(Ne)*Math.cos(Ye)*je+(P.vz||0),Vo[ge]=er[ge]=P.life*(.6+Math.random()*.6),jo[ge*3]=y.r*P.gain,jo[ge*3+1]=y.g*P.gain,jo[ge*3+2]=y.b*P.gain,qe[ge]=P.size*(.6+Math.random()*.8),tr[ge]=P.gravity||0}}function Zn(A,I){for(let P=0;P<me;P++){if(Vo[P]<=0){qe[P]=0;continue}Vo[P]-=A;let y=Math.max(0,Vo[P]/er[P]);yt[P*3+1]-=tr[P]*A,xe[P*3]+=yt[P*3]*A,xe[P*3+1]=Math.max(.02,xe[P*3+1]+yt[P*3+1]*A),xe[P*3+2]+=yt[P*3+2]*A+I,De[P*3]=jo[P*3]*y,De[P*3+1]=jo[P*3+1]*y,De[P*3+2]=jo[P*3+2]*y}Ao.attributes.position.needsUpdate=!0,Ao.attributes.aColor.needsUpdate=!0,Ao.attributes.aSize.needsUpdate=!0}let Pa=1400,sr=new Float32Array(Pa*6),co=new Float32Array(Pa*3);for(let A=0;A<Pa;A++)co[A*3]=(Math.random()-.5)*50,co[A*3+1]=Math.random()*22,co[A*3+2]=-Math.random()*70+6;let ws=new dt;ws.setAttribute("position",new Xt(sr,3));let ha=new zs(ws,new Oa({color:Aa("#bcd6ff",.7),transparent:!0,opacity:.28,blending:Ke,depthWrite:!1}));ha.frustumCulled=!1,t.add(ha);let Jn=Mn(t),Ga=Rn(t,64),Es=Hn(z),rr=Sn(z);rr.visible=!1;let Co=Nn(t),ys=An(z,t),_n=ys.tower,$n=Cn(t),ei=new W,nr=new W,ir=new W,ti=new W("#ffb35a"),oi=new W("#3a2410"),Ts=.1,lr=.2,Tt={buildings:1,extras:!0,cull:380};function ai(A){Tt={...Tt,...A},Co.applyQuality(Tt),ce.visible=Fe.visible=Tt.extras,F=!!Tt.reflect,F&&(Fe.visible=!1),Ut.visible=!F,Es.visible=Tt.extras&&!!(mo[e.time]||mo.dusk).searchlights}function si(A){xs=A;let I=[];t.traverse(P=>{P.visible||(I.push(P),P.visible=!0)}),A.compile(t,r),I.forEach(P=>P.visible=!1)}function cr(A){let I=e;e={...e,...A};let P=mo[e.time]||mo.dusk,y=vo[e.weather]||vo.clear;if(!I._applied||I.time!==e.time){let st=j.material.uniforms;an(st,P),t.fog.color.set(P.fog),ie.uFogColor.value.set(P.fog),v.color.set(P.hemi[0]),v.groundColor.set(P.hemi[1]),v.intensity=P.hemi[2]*.3,E.color.set(P.key[0]),E.intensity=P.key[1]*.6,nr.copy(v.color),ir.copy(v.groundColor),Ts=v.intensity,lr=E.intensity;let ge=G.material.uniforms;ge.uColor.value.set(P.body.color),ge.uGlowC.value.set(P.glow).multiplyScalar(.8),ge.uSun.value=P.body.kind==="sun"?1:0,G.scale.setScalar(P.body.size*3),G.position.set(-140,P.body.y+40,-1500),G.lookAt(0,P.body.y*.4,0),P.windows.forEach((je,Ne)=>{for(let Ye of ys.materials)Ye.uniforms.uWin.value[Ne].set(je)}),Co.applyTime(P),Ge[0].set(P.windows[1]).lerp(new W("#ffffff"),.35),Ge[1].set(P.windows[2]).lerp(new W("#ffffff"),.35),X(),S.fallback.set(P.horizon).lerp(new W(P.zenith),.55).multiplyScalar(.6),n&&n.dispose(),n=dn(s,{horizon:P.horizon,zenith:P.zenith,glow:P.glow,a:P.envA||"#00f0ff",b:P.envB||"#ff2bd6",c:P.windows[0]}),t.environment=n.texture}ie.uFogDensity.value=P.fogDensity*(y.rain?1.25:1),t.fog.density=ie.uFogDensity.value,q.roughness=y.rain?.55:.85,q.envMapIntensity=y.rain?.9:.45,Fe.material.uniforms.uGain.value=.55+y.wet*.9,Ut.material.uniforms.uGain.value=.5+y.wet*1,ce.material.uniforms.uGain.value=.25+y.wet*.2,ha.visible=!!y.rain,Es.visible=!!P.searchlights&&Tt.extras,(!I._applied||I.car!==e.car||I.rash!==e.rash||I.livery!==e.livery||I.glow!==e.glow)&&Ve(),e._applied=!0}cr(e);let Da=new ne,La=new ne,fr=new Ie,ur=new Ie,ri=new Jt,ni=new ne(.5,1.15,.5),ii=new ne(1.9,1.9,1.9),li=new ne,ci=new ne,dr=0,bs=0,Vt=0,hr=0,zo=0;function fi(A,I,P){var wr;hr++;{let R=!!(vo[e.weather]||vo.clear).rain,ae=R&&!A.tunnelAt(A.S.z)?1:0;Vt+=(ae-Vt)*Math.min(1,(I||.016)*4),R&&(q.roughness=.85-.3*Vt),zo+=((A.tunnelAt(A.S.z)?1:0)-zo)*Math.min(1,(I||.016)*3),S.wet=(R?.28+.72*Vt:.28)*(1-.4*zo),S.z=A.S.z,v.color.copy(nr).lerp(ti,zo),v.groundColor.copy(ir).lerp(oi,zo),v.intensity=Ts+(2.6-Ts)*zo,E.intensity=lr*(1-zo),q.envMapIntensity=(R?.45+.45*Vt:.45)*(F?.3:1),Q.value=P.view==="showroom"?.72:F?R?.32+.13*(1-Vt):.45:.22}let y=A.S,st=y.z-dr;dr=y.z;let ge=y.speed/_e;ie.uTime.value+=I,bs+=I;let je=A.curveAt(y.z+70),Ne=A.hillAt(y.z+90);ie.uCurve.value+=(je*Ji-ie.uCurve.value)*Math.min(1,I*2.5),ie.uHill.value+=(Ne*On-ie.uHill.value)*Math.min(1,I*2),u=Yr(y.s),z.rotation.y=u,j.rotation.y=u,z.position.y=-ie.uHill.value/On*18;let Ye=y.z/24;L.map.offset.y=Ye%1,L.rough.offset.y=Ye%1;for(let R of _)R.emissiveMap.offset.y=y.z/6%1;$.position.z=y.z%O,X(y),ht.uLampPhase.value=$.position.z,Co.setLamp(ei.copy(Ge[0]).lerp(fe,qs(y.s)==="led"?.75:0)),y.jct&&y.jct!==Wt&&Nt(y.jct),ro[0].z=y.nextJunction,ro[1].z=y.nextJunction-500>y.z-30?y.nextJunction-500:-1e6;for(let R of ro){R.g.visible=R.z>y.z-60&&!y.finale,R.g.position.set(0,0,-(R.z-y.z));let ae=R.g.visible&&Co.tunnelAt(A.trackS(R.z));R.frame.visible=!ae,R.panel.position.y=ae?-4.15:0}let fo=A.tunnelNear(y.z);Co.update(y,A,y.finale?null:fo),ys.update(y.s,ie.uTime.value),$n.update(y,Co.deckAt,ie.uTime.value,Tt.extras&&!y.finale),rr.visible=!!y.finale;let Qt=0,bt=nt;for(let R of y.shardList){if(Qt>=no)break;let ae=-(R.z-y.z);if(R.taken||ae<-700)continue;let Re=1.1+Math.sin(ie.uTime.value*3+R.id)*.18;ur.setFromEuler(ri.set(0,ie.uTime.value*2.2+R.id,0)),bt.compose(Da.set(R.x,Re,ae),ur,ni),io.setMatrixAt(Qt,bt),Ot.setMatrixAt(Qt,bt),bt.compose(Da.set(R.x,Re,ae),fr,ii),lo.setMatrixAt(Qt,bt),Qt++}for(let R of[io,Ot,lo])R.count=Qt,R.instanceMatrix.needsUpdate=!0;lo.instanceColor.needsUpdate=!0,Es.update(ie.uTime.value),Ga.begin();let Fa=new Set,Wa=0;for(let R of y.cars){let ae=-(R.z-y.z);if(ae<-720)continue;Fa.add(R.id);let Re=ae>-Tt.cull,We=Ba(R);We.group.visible=Re;let Ze=We.group.position.x;We.group.position.set(R.x,0,ae);let ke=I>0?(R.x-Ze)/I:0,et=R.hit>0?Math.min(1,R.hit):0;We.group.rotation.set(0,-ke*.035+(et?Math.sin(R.hit*13)*.14*et:0),et?Math.sin(R.hit*17)*.05*et:0);let it=R.blink>0&&Math.floor(bs*3.2)%2===0,Ct=et>0&&Math.floor(bs*5)%2===0,Xo=Math.sign(Je[R.target]-R.x);We.blinkers[0].visible=Ct||it&&Xo<0,We.blinkers[1].visible=Ct||it&&Xo>0,We.tail.color.setRGB(1,.1,.23).multiplyScalar(R.brake||et?9:3.2),Vt>.5&&Re&&ae>-70&&ae<12&&R.speed>10&&(hr+R.id)%3===0&&Qe(1,{x:R.x,y:.2,z:ae+We.len/2+.3},{color:"#9fb6d9",gain:.35,speed:2.4,life:.55,size:.3,spread:1.5,vz:5,vy:1.1,gravity:5});{let ho=ae+We.len/2,ko=R.kind==="hauler"?1.05:R.kind==="hatch"?.76:.6,Zt=R.kind==="hauler"?.62:R.kind==="hatch"?.86:.66,po=1+R.speed*.11;Ga.add(R.x-ko,Zt,ho,po),Ga.add(R.x+ko,Zt,ho,po)}if(Wa<31){let ho=ae+We.len/2,ko=R.kind==="hauler"?1.05:.65;for(let Zt of[-1,1])bt.compose(Da.set(R.x+Zt*ko,.025,ho+5.5),fr,li.set(.7,1,R.brake?13:10)),Ut.setMatrixAt(Wa*2+(Zt>0?1:0),bt);Wa++}}Ga.end(),Ut.count=Wa*2,Ut.instanceMatrix.needsUpdate=!0;for(let[R,ae]of Oo)if(!Fa.has(R)){t.remove(ae.group),Oo.delete(R);let Re=ae.len>8?"hauler":ae.len>4.2?"sedan":"hatch";da[Re].push(ae)}let pe=ze,mt=pe.group;mt.position.set(y.x,0,0);let pr=-Math.min(.03,Math.max(-.03,(y.speed-(pe.lastSpeed||0))*.01));if(pe.bike){let R=0,ae=!1;if(y.wheelie>0&&(R=Math.sin(Math.min(1,(1.6-y.wheelie)/.25)*Math.PI/2)*Math.min(1,y.wheelie/.3)*.34),A.mode==="attract"&&P.view!=="showroom"){let ke=y.time%11;ke<2.4&&(R=Math.sin(ke/2.4*Math.PI)*.32),ae=ke>6&&ke<7.1}let Re=A.input.brake&&y.speed>22&&A.mode==="play"||ae,We=y.steer<-.05?1:-1;if(pe.slide=(pe.slide||0)+((Re?We*.95:0)-(pe.slide||0))*Math.min(1,I*(Re?5:3)),Math.abs(pe.slide)>.3){let ke=Math.sign(pe.slide);Qe(4,{x:y.x+ke*.9,y:.05,z:1},{color:"#b8ff8a",gain:7,speed:4,life:.4,size:.07,gravity:10,vz:9,vx:ke*3}),Qe(1,{x:y.x+ke*.6,y:.1,z:1.2},{color:"#fff4d0",gain:4,speed:2,life:.25,size:.05,vz:7})}let Ze=y.swing>0&&y.rival?Math.sign(y.rival.x-y.x)*Math.sin(y.swing/.25*Math.PI)*.35:0;mt.rotation.set(pr+R,-y.vx*.02+pe.slide,-y.steer*.42-y.vx*.035-pe.slide*.55-Ze),mt.position.y=.72*Math.sin(R),At.rotation.z=-mt.rotation.z}else mt.rotation.set(pr,-y.vx*.032-y.steer*.04,y.vx*.012);if(y.crash&&A.mode==="play"){let R=y.crash,ae=Math.min(1,R.t/R.dur);if(R.final){let Re=1-(1-ae)**3;mt.rotation.y+=R.dir*Math.PI*2.5*Re,pe.bike?(mt.rotation.z=R.dir*1.32*Math.min(1,ae*2.2),mt.position.y=-.18*Math.min(1,ae*2.2)):mt.rotation.z+=Math.sin(ae*Math.PI)*.1*R.dir}else mt.rotation.y+=R.dir*(.3+.6*R.sev)*Math.sin(Math.PI*ae)*(1-ae*.35),mt.rotation.z+=R.dir*(pe.bike?.25:.06)*R.sev*Math.sin(Math.PI*ae);y.speed>5&&(R.final||ae<.8)&&(Qe(R.final?4:2,{x:y.x,y:.2,z:.9},{color:"#cfc9dc",gain:.45,speed:2.2,life:.9,size:.5,spread:1.3,vz:4+y.speed*.08,vy:1.4,gravity:-.6}),R.final&&Qe(2,{x:y.x+(Math.random()-.5)*1.4,y:.08,z:.4},{color:"#ffd27a",gain:6,speed:4,life:.35,size:.07,gravity:12,vz:5}))}pe.lastSpeed=y.speed;let mr=y.speed*I/pe.wheelR;pe.wheels.forEach((R,ae)=>{let Re=R.userData.spin;Re?Re.rotation.x-=mr*R.userData.sign:R.rotation.x-=mr,(pe.bike?ae===0:ae<2)&&(R.rotation.y=-y.steer*(pe.bike?.12:.32))});for(let R of pe.flames)R.visible=y.overclock||y.slip>0,R.scale.set(1,.7+Math.random()*.8+(y.slip>0?.6:0),1);mt.visible=!(y.invuln>0&&y.ghost<=0&&!y.over&&Math.floor(y.time*16)%2===0&&A.mode==="play"),te&&(te.visible=y.ghost>0,te.scale.setScalar(1+Math.sin(ie.uTime.value*12)*.04),te.material.uniforms.opacity.value=Math.min(1,y.ghost)*.35),b=P.view==="showroom"?1:0,H.intensity=2.6*b,k.intensity=2*b,g.intensity=.8*b,M.position.set(y.x,.55,0),ce.visible=Tt.extras&&!b;for(let R of[H,k,g])R.position.set(y.x+R.userData.off.x,R.userData.off.y,R.userData.off.z);if(U.intensity=b?0:140,pe.glowLight&&(pe.glowLight.intensity=(pe.glowBase||26)*(b?.12:1)*(.85+.15*Math.sin(ie.uTime.value*9))),At.material.uniforms.uGain.value=(pe.bike?.75:1.6)*(b?.4:1),pe.M&&pe.M.glow&&((wr=pe.M.glow.userData).base||(wr.base=pe.M.glow.color.clone()),pe.M.glow.color.copy(pe.M.glow.userData.base).multiplyScalar(b?.45:1)),Jn.update(y,pe.rearZ,pe.tailHalfW,pe.tailY,P.view==="showroom"?0:.38,mt.rotation.z),U.position.set(y.x,.75,-2.3),J.position.set(y.x-y.vx*.3,0,-26),d){let R=y.rival,ae=A.mode==="play"&&R&&e.race!==!1&&P.view!=="showroom",Re=ae?-(R.z-y.z):0;if(d.group.visible=ae&&Re>-Tt.cull&&(Re<1.2||Math.abs(R.x-y.x)>2.6),d.group.visible){let We=d.group,Ze=(Je[R.target]-R.x)*.06;We.position.set(R.x,0,Re);let ke=R.stun>0?Math.sin(R.stun*18)*.22*Math.min(1,R.stun):0;We.rotation.set(0,-Ze*.4+ke*1.6,d.bike?-Ze*2.2+ke:ke*.3);let et=R.speed*I/d.wheelR;d.wheels.forEach(it=>{let Ct=it.userData.spin;Ct?Ct.rotation.x-=et*it.userData.sign:it.rotation.x-=et});for(let it of d.flames)it.visible=R.speed>y.speed+4}}if(ue.forEach((R,ae)=>{let Re=A.mode==="play"?y.powers[ae]:null;R.visible=!!Re&&-(Re.z-y.z)>-Tt.cull,R.visible&&(R.position.set(Re.x,1.05+Math.sin(ie.uTime.value*3+ae)*.12,-(Re.z-y.z)),R.children[0].rotation.set(ie.uTime.value*1.5,ie.uTime.value*2.2,0),R.children[1].rotation.set(0,ie.uTime.value*1.2,0),R.children.forEach(We=>We.material=Te[Re.kind]))}),oe){let R=y.swing>0&&y.rival?Math.sin(y.swing/.25*Math.PI):0;if(oe.visible=R>.05,oe.visible){let ae=Math.sign(y.rival.x-y.x)||1;oe.position.set(ae*(pe.bike?.25:.75),pe.bike?1.4:1.15,pe.bike?-.1:.2),oe.rotation.set(.2*R,0,-ae*(Math.PI*.62)*R)}}let vr=Math.floor(ie.uTime.value*8)%2;for(let R=0;R<3;R++){let ae=A.mode==="play"&&y.cops?y.cops[R]:null;if(ae&&!T[R]){let We=ua.make("sedan",0);We.group.children[0].material=new Ue({color:"#0c0d14",metalness:.5,roughness:.35});let Ze=new Be,ke=new Ee({color:new W("#ff1030").multiplyScalar(6)}),et=new Ee({color:new W("#2a6bff").multiplyScalar(6)}),it=new D(new V(.5,.12,.22),ke),Ct=new D(new V(.5,.12,.22),et);it.position.set(-.3,0,0),Ct.position.set(.3,0,0),Ze.add(it,Ct),Ze.position.set(0,1.5,.2),We.group.add(Ze),We.bar=[it,Ct],t.add(We.group),T[R]=We}if(!T[R])continue;if(!ae){T[R].group.visible=!1;continue}let Re=-(ae.z-y.z);T[R].group.visible=Re>-Tt.cull&&(Re<1.2||Math.abs(ae.x-y.x)>2.6),T[R].group.position.set(ae.x,0,Re),T[R].bar[0].visible=(vr+R)%2===0,T[R].bar[1].visible=(vr+R)%2===1}if(y.scrape>0&&Qe(5,{x:y.x+Math.sign(y.x)*1,y:.4,z:.6},{color:"#ffd27a",gain:6,speed:5,life:.45,size:.09,gravity:14,vz:6,vx:-Math.sign(y.x)*2}),y.overclock&&P.full&&Qe(1,{x:y.x+(Math.random()<.5?-.34:.34),y:.3,z:pe.length/2+.6},{color:"#4fd8ff",gain:4,speed:1.5,life:.35,size:.06,vz:4}),Vt>.5&&y.speed>12&&(Qe(2,{x:y.x,y:.15,z:pe.length/2+.4},{color:"#9fb6d9",gain:.5,speed:3,life:.5,size:.22,spread:1.6,vz:6,vy:1,gravity:6}),y.aqua>.25))for(let R of[-1,1])Qe(1+(y.aqua>.7?1:0),{x:y.x+R*pe.width*.45,y:.12,z:-pe.length/2+.5},{color:"#cfe0ff",gain:.9,speed:3.5,life:.45,size:.26,spread:.8,vx:R*5,vz:7,vy:2.2,gravity:9});if(Zn(I,0),ha.material.opacity=.28*Vt,ha.visible&&Vt>.02){let R=42*I,ae=y.speed*I*.85,Re=.25+Math.min(2.4,y.speed*.03),We=.12;for(let Ze=0;Ze<Pa;Ze++){let ke=co[Ze*3+1]-R,et=co[Ze*3+2]+ae;ke<0&&(ke+=22),et>8&&(et-=76),co[Ze*3+1]=ke,co[Ze*3+2]=et;let it=co[Ze*3]+r.position.x;sr.set([it,ke,et,it+We,ke+.7,et-Re],Ze*6)}ws.attributes.position.needsUpdate=!0}if(P.view==="showroom"){let R=P.orbit!=null?P.orbit:ie.uTime.value*.16+.6,ae=(6.4+Math.sin(ie.uTime.value*.1)*.6)*(r.aspect<1?1.9:1)*(ze.bike?.85:1);l+=(42-l)*Math.min(1,I*2),r.fov=l,r.updateProjectionMatrix(),r.position.set(y.x+Math.sin(R)*ae,(ze.bike?1:1.35)+Math.sin(ie.uTime.value*.13)*.2,Math.cos(R)*ae),r.lookAt(y.x,ze.bike?.7:.55,0),h.copy(r.position),m=0;return}if(y.finale&&y.finaleT>1.2){let R=Math.min(1,(y.finaleT-1.2)/6),ae=R*R*(3-2*R),Re=_n.getWorldPosition(Da);if(l+=(50-l)*Math.min(1,I*1.5),r.fov=l,r.updateProjectionMatrix(),r.position.set(y.x*(1-ae),2.1+ae*235,6.2+ae*60),!Xe){Xe=new Be;let ke=new D(new V(44,3,34),new Ue({color:"#0d0c14",roughness:.85,metalness:.2}));ke.position.set(0,158.5,59),Xe.add(ke);let et=new D(new V(44,1.3,.08),new Ee({color:new W("#5ff6ff").multiplyScalar(.6),transparent:!0,opacity:.18,depthWrite:!1}));et.position.set(0,160.65,42.1),Xe.add(et);let it=new D(new V(44,.06,.12),new Ee({color:new W("#5ff6ff").multiplyScalar(3)}));it.position.set(0,161.3,42.1),Xe.add(it);let Ct=new Ee({color:new W("#ff1a2c").multiplyScalar(6)});Xe.reds=[];for(let po=0;po<7;po++){let pa=new D(new Bt(.18,8,6),Ct);pa.position.set(-21+po*7,161.4,42.1),Xe.add(pa),Xe.reds.push(pa)}let Xo=new D(new Ir(5.2,5.6,48).rotateX(-Math.PI/2),new Ee({color:new W("#ffb020").multiplyScalar(2.5)}));Xo.position.set(11,160.03,56),Xe.add(Xo);let ho=new Be;for(let[po,pa,xi,gi]of[[.5,4,-1.2,0],[.5,4,1.2,0],[2.4,.5,0,0]]){let Er=new D(new V(po,.02,pa),Xo.material);Er.position.set(xi,0,gi),ho.add(Er)}ho.position.set(11,160.04,56),Xe.add(ho);let ko=new D(new Ae(.12,.3,18,8),new Ue({color:"#1a1822",metalness:.6,roughness:.4}));ko.position.set(-16,169,50),Xe.add(ko);let Zt=new D(new Bt(.35,8,6),Ct);Zt.position.set(-16,178.2,50),Xe.add(Zt),Xe.reds.push(Zt),Xe.position.z=15,Xe.position.y=70,ke.material.color.set("#2a2236"),ke.material.emissive=new W("#ff2f7a"),ke.material.emissiveIntensity=.08,t.add(Xe)}Xe.visible=ae>.9;let We=Math.floor(ie.uTime.value*1.2)%2===0;Xe.reds.forEach(ke=>ke.visible=We);let Ze=ci.set(y.x*.9,.95,-16).lerp(Re.setY(Re.y+150),ae);r.lookAt(Ze),h.copy(r.position);return}Xe&&(Xe.visible=!1);let pi=58+ge*13+(y.overclock?5:0)+(y.slip>0?4:0);l+=(pi-l)*Math.min(1,I*3),r.fov=l,r.updateProjectionMatrix();let xr=P.cam||"chase",gr=xr==="far",uo=xr==="bumper";if(mt.visible=mt.visible&&!uo,h.x+=(y.x*(uo?1:.84)-h.x)*Math.min(1,I*(uo?12:5)),h.y=uo?pe.bike?1.25:.72:(gr?pe.bike?3:3.6:pe.bike?1.55:2.05)+ge*.12,h.z=uo?-pe.length/2-.25:(gr?pe.bike?8.4:10.8:pe.bike?4.4:6.2)-ge*.5,y.crash&&y.crash.final&&A.mode==="play"){let R=Math.min(1,y.crash.t/1.7),ae=R*R*(3-2*R);h.y+=1.5*ae,h.z+=3.2*ae}if(r.position.copy(h),P.full&&y.shake>0){let R=y.shake*.5;r.position.x+=(Math.random()-.5)*R,r.position.y+=(Math.random()-.5)*R}La.set(y.x*(uo?1:.92),uo?.6:pe.bike?.85:.95,uo?-30:-16),La.x+=ie.uCurve.value*16*16*.6,La.y+=ie.uHill.value*16*16,r.lookAt(La);let mi=P.full&&y.crash&&!y.crash.final?y.crash.dir*y.crash.sev*.07*Math.sin(Math.PI*Math.min(1,y.crash.t/y.crash.dur)):0,vi=P.full?-y.vx*.009+A.curveAt(y.z)*ge*.035+mi:0;m+=(vi-m)*Math.min(1,I*4),r.rotateZ(m)}function ui(A,I,P={}){if(A==="crash"){let y=P.sev||.5,st=-(P.z||0)-1;Qe(Math.round(30+70*y),{x:I,y:.6,z:st},{color:"#ffd27a",gain:7,speed:7+6*y,life:.7,size:.1,gravity:12,vz:4}),Qe(Math.round(10+22*y),{x:I,y:.7,z:st},{color:"#3a3644",gain:1,speed:5+5*y,life:1.1,size:.22,gravity:14,vz:6,vy:3}),Qe(Math.round(8+14*y),{x:I,y:.9,z:st},{color:"#e8f4ff",gain:5,speed:6,life:.5,size:.06,gravity:10,vz:5}),Qe(Math.round(6+10*y),{x:I,y:.4,z:st+1},{color:"#cfc9dc",gain:.4,speed:2,life:1,size:.6,spread:1.2,vz:5,vy:1.5,gravity:-.5});return}if(A==="slam"){Qe(46,{x:I+Math.sign(I)*.9,y:.5,z:0},{color:"#ffd27a",gain:7,speed:8,life:.55,size:.09,gravity:13,vz:9,vx:-Math.sign(I)*3});return}if(A==="bump"){Qe(14,{x:I,y:.5,z:-2.4},{color:"#fff1b0",gain:6,speed:5,life:.3,size:.07,gravity:9,vz:3});return}A==="shard"&&Qe(26,{x:I,y:1.1,z:-.5},{color:"#9fe8ff",gain:3,speed:7,life:.55,size:.12,vz:8}),(A==="ghost"||A==="nitro")&&Qe(46,{x:I,y:1,z:-1},{color:A==="ghost"?"#5ff6ff":"#ffb020",gain:6,speed:8,life:.6,size:.12,vz:6}),A==="strike"&&Qe(34,{x:I,y:1,z:0},{color:"#fff1b0",gain:8,speed:7,life:.4,size:.09,gravity:8,vz:3}),A==="hit"&&Qe(60,{x:I,y:.6,z:-2},{color:"#ffd27a",gain:7,speed:9,life:.7,size:.1,gravity:12,vz:4}),A==="slip"&&Qe(40,{x:I,y:.5,z:2.5},{color:"#00f0ff",gain:5,speed:4,life:.6,size:.1,vz:14,spread:1.4}),A==="file"&&Qe(70,{x:I,y:1.4,z:-1},{color:"#fcee0a",gain:6,speed:9,life:.9,size:.14,vz:6})}function di(A,I){r.aspect=A/I,r.updateProjectionMatrix(),or.uniforms.uScale.value=I*.9}function hi(){vs=!0,t.traverse(A=>{A.geometry&&A.geometry.dispose(),A.material&&(Array.isArray(A.material)?A.material:[A.material]).forEach(I=>{for(let P in I)I[P]&&I[P].isTexture&&I[P].dispose();I.dispose()})}),n&&n.dispose()}return{scene:t,camera:r,update:fi,applyConfig:cr,applyQuality:ai,precompile:si,resize:di,burst:ui,dispose:hi,get config(){return e},road:S}}var cs={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};var ut=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},_i=new Br(-1,1,1,-1,0,1),Ks=class extends dt{constructor(){super(),this.setAttribute("position",new gt([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new gt([0,2,0,0,2,0],2))}},$i=new Ks,Ft=class{constructor(o){this._mesh=new D($i,o)}dispose(){this._mesh.geometry.dispose()}render(o){o.render(this._mesh,_i)}get material(){return this._mesh.material}set material(o){this._mesh.material=o}};var Fo=class extends ut{constructor(o,t){super(),this.textureID=t!==void 0?t:"tDiffuse",o instanceof we?(this.uniforms=o.uniforms,this.material=o):o&&(this.uniforms=_t.clone(o.uniforms),this.material=new we({name:o.name!==void 0?o.name:"unspecified",defines:Object.assign({},o.defines),uniforms:this.uniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader})),this.fsQuad=new Ft(this.material)}render(o,t,r){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=r.texture),this.fsQuad.material=this.material,this.renderToScreen?(o.setRenderTarget(null),this.fsQuad.render(o)):(o.setRenderTarget(t),this.clear&&o.clear(o.autoClearColor,o.autoClearDepth,o.autoClearStencil),this.fsQuad.render(o))}dispose(){this.material.dispose(),this.fsQuad.dispose()}};var Ca=class extends ut{constructor(o,t){super(),this.scene=o,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(o,t,r){let a=o.getContext(),e=o.state;e.buffers.color.setMask(!1),e.buffers.depth.setMask(!1),e.buffers.color.setLocked(!0),e.buffers.depth.setLocked(!0);let n,i;this.inverse?(n=0,i=1):(n=1,i=0),e.buffers.stencil.setTest(!0),e.buffers.stencil.setOp(a.REPLACE,a.REPLACE,a.REPLACE),e.buffers.stencil.setFunc(a.ALWAYS,n,4294967295),e.buffers.stencil.setClear(i),e.buffers.stencil.setLocked(!0),o.setRenderTarget(r),this.clear&&o.clear(),o.render(this.scene,this.camera),o.setRenderTarget(t),this.clear&&o.clear(),o.render(this.scene,this.camera),e.buffers.color.setLocked(!1),e.buffers.depth.setLocked(!1),e.buffers.color.setMask(!0),e.buffers.depth.setMask(!0),e.buffers.stencil.setLocked(!1),e.buffers.stencil.setFunc(a.EQUAL,1,4294967295),e.buffers.stencil.setOp(a.KEEP,a.KEEP,a.KEEP),e.buffers.stencil.setLocked(!0)}},fs=class extends ut{constructor(){super(),this.needsSwap=!1}render(o){o.state.buffers.stencil.setLocked(!1),o.state.buffers.stencil.setTest(!1)}};var us=class{constructor(o,t){if(this.renderer=o,this._pixelRatio=o.getPixelRatio(),t===void 0){let r=o.getSize(new Se);this._width=r.width,this._height=r.height,t=new lt(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:zt}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Fo(cs),this.copyPass.material.blending=Mr,this.clock=new Vr}swapBuffers(){let o=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=o}addPass(o){this.passes.push(o),o.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(o,t){this.passes.splice(t,0,o),o.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(o){let t=this.passes.indexOf(o);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(o){for(let t=o+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(o){o===void 0&&(o=this.clock.getDelta());let t=this.renderer.getRenderTarget(),r=!1;for(let a=0,e=this.passes.length;a<e;a++){let n=this.passes[a];if(n.enabled!==!1){if(n.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(a),n.render(this.renderer,this.writeBuffer,this.readBuffer,o,r),n.needsSwap){if(r){let i=this.renderer.getContext(),u=this.renderer.state.buffers.stencil;u.setFunc(i.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,o),u.setFunc(i.EQUAL,1,4294967295)}this.swapBuffers()}Ca!==void 0&&(n instanceof Ca?r=!0:n instanceof fs&&(r=!1))}}this.renderer.setRenderTarget(t)}reset(o){if(o===void 0){let t=this.renderer.getSize(new Se);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,o=this.renderTarget1.clone(),o.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=o,this.renderTarget2=o.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(o,t){this._width=o,this._height=t;let r=this._width*this._pixelRatio,a=this._height*this._pixelRatio;this.renderTarget1.setSize(r,a),this.renderTarget2.setSize(r,a);for(let e=0;e<this.passes.length;e++)this.passes[e].setSize(r,a)}setPixelRatio(o){this._pixelRatio=o,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};var ds=class extends ut{constructor(o,t,r=null,a=null,e=null){super(),this.scene=o,this.camera=t,this.overrideMaterial=r,this.clearColor=a,this.clearAlpha=e,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new W}render(o,t,r){let a=o.autoClear;o.autoClear=!1;let e,n;this.overrideMaterial!==null&&(n=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(o.getClearColor(this._oldClearColor),o.setClearColor(this.clearColor,o.getClearAlpha())),this.clearAlpha!==null&&(e=o.getClearAlpha(),o.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&o.clearDepth(),o.setRenderTarget(this.renderToScreen?null:r),this.clear===!0&&o.clear(o.autoClearColor,o.autoClearDepth,o.autoClearStencil),o.render(this.scene,this.camera),this.clearColor!==null&&o.setClearColor(this._oldClearColor),this.clearAlpha!==null&&o.setClearAlpha(e),this.overrideMaterial!==null&&(this.scene.overrideMaterial=n),o.autoClear=a}};var Vn={name:"LuminosityHighPassShader",shaderID:"luminosityHighPass",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new W(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};var fa=class s extends ut{constructor(o,t,r,a){super(),this.strength=t!==void 0?t:1,this.radius=r,this.threshold=a,this.resolution=o!==void 0?new Se(o.x,o.y):new Se(256,256),this.clearColor=new W(0,0,0),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let e=Math.round(this.resolution.x/2),n=Math.round(this.resolution.y/2);this.renderTargetBright=new lt(e,n,{type:zt}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let h=0;h<this.nMips;h++){let v=new lt(e,n,{type:zt});v.texture.name="UnrealBloomPass.h"+h,v.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(v);let E=new lt(e,n,{type:zt});E.texture.name="UnrealBloomPass.v"+h,E.texture.generateMipmaps=!1,this.renderTargetsVertical.push(E),e=Math.round(e/2),n=Math.round(n/2)}let i=Vn;this.highPassUniforms=_t.clone(i.uniforms),this.highPassUniforms.luminosityThreshold.value=a,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new we({uniforms:this.highPassUniforms,vertexShader:i.vertexShader,fragmentShader:i.fragmentShader}),this.separableBlurMaterials=[];let u=[3,5,7,9,11];e=Math.round(this.resolution.x/2),n=Math.round(this.resolution.y/2);for(let h=0;h<this.nMips;h++)this.separableBlurMaterials.push(this.getSeperableBlurMaterial(u[h])),this.separableBlurMaterials[h].uniforms.invSize.value=new Se(1/e,1/n),e=Math.round(e/2),n=Math.round(n/2);this.compositeMaterial=this.getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;let m=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=m,this.bloomTintColors=[new ne(1,1,1),new ne(1,1,1),new ne(1,1,1),new ne(1,1,1),new ne(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors;let l=cs;this.copyUniforms=_t.clone(l.uniforms),this.blendMaterial=new we({uniforms:this.copyUniforms,vertexShader:l.vertexShader,fragmentShader:l.fragmentShader,blending:Ke,depthTest:!1,depthWrite:!1,transparent:!0}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new W,this.oldClearAlpha=1,this.basic=new Ee,this.fsQuad=new Ft(null)}dispose(){for(let o=0;o<this.renderTargetsHorizontal.length;o++)this.renderTargetsHorizontal[o].dispose();for(let o=0;o<this.renderTargetsVertical.length;o++)this.renderTargetsVertical[o].dispose();this.renderTargetBright.dispose();for(let o=0;o<this.separableBlurMaterials.length;o++)this.separableBlurMaterials[o].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this.basic.dispose(),this.fsQuad.dispose()}setSize(o,t){let r=Math.round(o/2),a=Math.round(t/2);this.renderTargetBright.setSize(r,a);for(let e=0;e<this.nMips;e++)this.renderTargetsHorizontal[e].setSize(r,a),this.renderTargetsVertical[e].setSize(r,a),this.separableBlurMaterials[e].uniforms.invSize.value=new Se(1/r,1/a),r=Math.round(r/2),a=Math.round(a/2)}render(o,t,r,a,e){o.getClearColor(this._oldClearColor),this.oldClearAlpha=o.getClearAlpha();let n=o.autoClear;o.autoClear=!1,o.setClearColor(this.clearColor,0),e&&o.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this.fsQuad.material=this.basic,this.basic.map=r.texture,o.setRenderTarget(null),o.clear(),this.fsQuad.render(o)),this.highPassUniforms.tDiffuse.value=r.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this.fsQuad.material=this.materialHighPassFilter,o.setRenderTarget(this.renderTargetBright),o.clear(),this.fsQuad.render(o);let i=this.renderTargetBright;for(let u=0;u<this.nMips;u++)this.fsQuad.material=this.separableBlurMaterials[u],this.separableBlurMaterials[u].uniforms.colorTexture.value=i.texture,this.separableBlurMaterials[u].uniforms.direction.value=s.BlurDirectionX,o.setRenderTarget(this.renderTargetsHorizontal[u]),o.clear(),this.fsQuad.render(o),this.separableBlurMaterials[u].uniforms.colorTexture.value=this.renderTargetsHorizontal[u].texture,this.separableBlurMaterials[u].uniforms.direction.value=s.BlurDirectionY,o.setRenderTarget(this.renderTargetsVertical[u]),o.clear(),this.fsQuad.render(o),i=this.renderTargetsVertical[u];this.fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,o.setRenderTarget(this.renderTargetsHorizontal[0]),o.clear(),this.fsQuad.render(o),this.fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,e&&o.state.buffers.stencil.setTest(!0),this.renderToScreen?(o.setRenderTarget(null),this.fsQuad.render(o)):(o.setRenderTarget(r),this.fsQuad.render(o)),o.setClearColor(this._oldClearColor,this.oldClearAlpha),o.autoClear=n}getSeperableBlurMaterial(o){let t=[];for(let r=0;r<o;r++)t.push(.39894*Math.exp(-.5*r*r/(o*o))/o);return new we({defines:{KERNEL_RADIUS:o},uniforms:{colorTexture:{value:null},invSize:{value:new Se(.5,.5)},direction:{value:new Se(.5,.5)},gaussianCoefficients:{value:t}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {
					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += (sample1 + sample2) * w;
						weightSum += 2.0 * w;
					}
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
				}`})}getCompositeMaterial(o){return new we({defines:{NUM_MIPS:o},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				void main() {
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
				}`})}};fa.BlurDirectionX=new Se(1,0);fa.BlurDirectionY=new Se(0,1);var za={name:"SMAAEdgesShader",defines:{SMAA_THRESHOLD:"0.1"},uniforms:{tDiffuse:{value:null},resolution:{value:new Se(1/1024,1/512)}},vertexShader:`

		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 3 ];

		void SMAAEdgeDetectionVS( vec2 texcoord ) {
			vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -1.0, 0.0, 0.0,  1.0 ); // WebGL port note: Changed sign in W component
			vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4(  1.0, 0.0, 0.0, -1.0 ); // WebGL port note: Changed sign in W component
			vOffset[ 2 ] = texcoord.xyxy + resolution.xyxy * vec4( -2.0, 0.0, 0.0,  2.0 ); // WebGL port note: Changed sign in W component
		}

		void main() {

			vUv = uv;

			SMAAEdgeDetectionVS( vUv );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;

		varying vec2 vUv;
		varying vec4 vOffset[ 3 ];

		vec4 SMAAColorEdgeDetectionPS( vec2 texcoord, vec4 offset[3], sampler2D colorTex ) {
			vec2 threshold = vec2( SMAA_THRESHOLD, SMAA_THRESHOLD );

			// Calculate color deltas:
			vec4 delta;
			vec3 C = texture2D( colorTex, texcoord ).rgb;

			vec3 Cleft = texture2D( colorTex, offset[0].xy ).rgb;
			vec3 t = abs( C - Cleft );
			delta.x = max( max( t.r, t.g ), t.b );

			vec3 Ctop = texture2D( colorTex, offset[0].zw ).rgb;
			t = abs( C - Ctop );
			delta.y = max( max( t.r, t.g ), t.b );

			// We do the usual threshold:
			vec2 edges = step( threshold, delta.xy );

			// Then discard if there is no edge:
			if ( dot( edges, vec2( 1.0, 1.0 ) ) == 0.0 )
				discard;

			// Calculate right and bottom deltas:
			vec3 Cright = texture2D( colorTex, offset[1].xy ).rgb;
			t = abs( C - Cright );
			delta.z = max( max( t.r, t.g ), t.b );

			vec3 Cbottom  = texture2D( colorTex, offset[1].zw ).rgb;
			t = abs( C - Cbottom );
			delta.w = max( max( t.r, t.g ), t.b );

			// Calculate the maximum delta in the direct neighborhood:
			float maxDelta = max( max( max( delta.x, delta.y ), delta.z ), delta.w );

			// Calculate left-left and top-top deltas:
			vec3 Cleftleft  = texture2D( colorTex, offset[2].xy ).rgb;
			t = abs( C - Cleftleft );
			delta.z = max( max( t.r, t.g ), t.b );

			vec3 Ctoptop = texture2D( colorTex, offset[2].zw ).rgb;
			t = abs( C - Ctoptop );
			delta.w = max( max( t.r, t.g ), t.b );

			// Calculate the final maximum delta:
			maxDelta = max( max( maxDelta, delta.z ), delta.w );

			// Local contrast adaptation in action:
			edges.xy *= step( 0.5 * maxDelta, delta.xy );

			return vec4( edges, 0.0, 0.0 );
		}

		void main() {

			gl_FragColor = SMAAColorEdgeDetectionPS( vUv, vOffset, tDiffuse );

		}`},ka={name:"SMAAWeightsShader",defines:{SMAA_MAX_SEARCH_STEPS:"8",SMAA_AREATEX_MAX_DISTANCE:"16",SMAA_AREATEX_PIXEL_SIZE:"( 1.0 / vec2( 160.0, 560.0 ) )",SMAA_AREATEX_SUBTEX_SIZE:"( 1.0 / 7.0 )"},uniforms:{tDiffuse:{value:null},tArea:{value:null},tSearch:{value:null},resolution:{value:new Se(1/1024,1/512)}},vertexShader:`

		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 3 ];
		varying vec2 vPixcoord;

		void SMAABlendingWeightCalculationVS( vec2 texcoord ) {
			vPixcoord = texcoord / resolution;

			// We will use these offsets for the searches later on (see @PSEUDO_GATHER4):
			vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -0.25, 0.125, 1.25, 0.125 ); // WebGL port note: Changed sign in Y and W components
			vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4( -0.125, 0.25, -0.125, -1.25 ); // WebGL port note: Changed sign in Y and W components

			// And these for the searches, they indicate the ends of the loops:
			vOffset[ 2 ] = vec4( vOffset[ 0 ].xz, vOffset[ 1 ].yw ) + vec4( -2.0, 2.0, -2.0, 2.0 ) * resolution.xxyy * float( SMAA_MAX_SEARCH_STEPS );

		}

		void main() {

			vUv = uv;

			SMAABlendingWeightCalculationVS( vUv );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		#define SMAASampleLevelZeroOffset( tex, coord, offset ) texture2D( tex, coord + float( offset ) * resolution, 0.0 )

		uniform sampler2D tDiffuse;
		uniform sampler2D tArea;
		uniform sampler2D tSearch;
		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[3];
		varying vec2 vPixcoord;

		#if __VERSION__ == 100
		vec2 round( vec2 x ) {
			return sign( x ) * floor( abs( x ) + 0.5 );
		}
		#endif

		float SMAASearchLength( sampler2D searchTex, vec2 e, float bias, float scale ) {
			// Not required if searchTex accesses are set to point:
			// float2 SEARCH_TEX_PIXEL_SIZE = 1.0 / float2(66.0, 33.0);
			// e = float2(bias, 0.0) + 0.5 * SEARCH_TEX_PIXEL_SIZE +
			//     e * float2(scale, 1.0) * float2(64.0, 32.0) * SEARCH_TEX_PIXEL_SIZE;
			e.r = bias + e.r * scale;
			return 255.0 * texture2D( searchTex, e, 0.0 ).r;
		}

		float SMAASearchXLeft( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			/**
				* @PSEUDO_GATHER4
				* This texcoord has been offset by (-0.25, -0.125) in the vertex shader to
				* sample between edge, thus fetching four edges in a row.
				* Sampling with different offsets in each direction allows to disambiguate
				* which edges are active from the four fetched ones.
				*/
			vec2 e = vec2( 0.0, 1.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord -= vec2( 2.0, 0.0 ) * resolution;
				if ( ! ( texcoord.x > end && e.g > 0.8281 && e.r == 0.0 ) ) break;
			}

			// We correct the previous (-0.25, -0.125) offset we applied:
			texcoord.x += 0.25 * resolution.x;

			// The searches are bias by 1, so adjust the coords accordingly:
			texcoord.x += resolution.x;

			// Disambiguate the length added by the last step:
			texcoord.x += 2.0 * resolution.x; // Undo last step
			texcoord.x -= resolution.x * SMAASearchLength(searchTex, e, 0.0, 0.5);

			return texcoord.x;
		}

		float SMAASearchXRight( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			vec2 e = vec2( 0.0, 1.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord += vec2( 2.0, 0.0 ) * resolution;
				if ( ! ( texcoord.x < end && e.g > 0.8281 && e.r == 0.0 ) ) break;
			}

			texcoord.x -= 0.25 * resolution.x;
			texcoord.x -= resolution.x;
			texcoord.x -= 2.0 * resolution.x;
			texcoord.x += resolution.x * SMAASearchLength( searchTex, e, 0.5, 0.5 );

			return texcoord.x;
		}

		float SMAASearchYUp( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			vec2 e = vec2( 1.0, 0.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord += vec2( 0.0, 2.0 ) * resolution; // WebGL port note: Changed sign
				if ( ! ( texcoord.y > end && e.r > 0.8281 && e.g == 0.0 ) ) break;
			}

			texcoord.y -= 0.25 * resolution.y; // WebGL port note: Changed sign
			texcoord.y -= resolution.y; // WebGL port note: Changed sign
			texcoord.y -= 2.0 * resolution.y; // WebGL port note: Changed sign
			texcoord.y += resolution.y * SMAASearchLength( searchTex, e.gr, 0.0, 0.5 ); // WebGL port note: Changed sign

			return texcoord.y;
		}

		float SMAASearchYDown( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			vec2 e = vec2( 1.0, 0.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord -= vec2( 0.0, 2.0 ) * resolution; // WebGL port note: Changed sign
				if ( ! ( texcoord.y < end && e.r > 0.8281 && e.g == 0.0 ) ) break;
			}

			texcoord.y += 0.25 * resolution.y; // WebGL port note: Changed sign
			texcoord.y += resolution.y; // WebGL port note: Changed sign
			texcoord.y += 2.0 * resolution.y; // WebGL port note: Changed sign
			texcoord.y -= resolution.y * SMAASearchLength( searchTex, e.gr, 0.5, 0.5 ); // WebGL port note: Changed sign

			return texcoord.y;
		}

		vec2 SMAAArea( sampler2D areaTex, vec2 dist, float e1, float e2, float offset ) {
			// Rounding prevents precision errors of bilinear filtering:
			vec2 texcoord = float( SMAA_AREATEX_MAX_DISTANCE ) * round( 4.0 * vec2( e1, e2 ) ) + dist;

			// We do a scale and bias for mapping to texel space:
			texcoord = SMAA_AREATEX_PIXEL_SIZE * texcoord + ( 0.5 * SMAA_AREATEX_PIXEL_SIZE );

			// Move to proper place, according to the subpixel offset:
			texcoord.y += SMAA_AREATEX_SUBTEX_SIZE * offset;

			return texture2D( areaTex, texcoord, 0.0 ).rg;
		}

		vec4 SMAABlendingWeightCalculationPS( vec2 texcoord, vec2 pixcoord, vec4 offset[ 3 ], sampler2D edgesTex, sampler2D areaTex, sampler2D searchTex, ivec4 subsampleIndices ) {
			vec4 weights = vec4( 0.0, 0.0, 0.0, 0.0 );

			vec2 e = texture2D( edgesTex, texcoord ).rg;

			if ( e.g > 0.0 ) { // Edge at north
				vec2 d;

				// Find the distance to the left:
				vec2 coords;
				coords.x = SMAASearchXLeft( edgesTex, searchTex, offset[ 0 ].xy, offset[ 2 ].x );
				coords.y = offset[ 1 ].y; // offset[1].y = texcoord.y - 0.25 * resolution.y (@CROSSING_OFFSET)
				d.x = coords.x;

				// Now fetch the left crossing edges, two at a time using bilinear
				// filtering. Sampling at -0.25 (see @CROSSING_OFFSET) enables to
				// discern what value each edge has:
				float e1 = texture2D( edgesTex, coords, 0.0 ).r;

				// Find the distance to the right:
				coords.x = SMAASearchXRight( edgesTex, searchTex, offset[ 0 ].zw, offset[ 2 ].y );
				d.y = coords.x;

				// We want the distances to be in pixel units (doing this here allow to
				// better interleave arithmetic and memory accesses):
				d = d / resolution.x - pixcoord.x;

				// SMAAArea below needs a sqrt, as the areas texture is compressed
				// quadratically:
				vec2 sqrt_d = sqrt( abs( d ) );

				// Fetch the right crossing edges:
				coords.y -= 1.0 * resolution.y; // WebGL port note: Added
				float e2 = SMAASampleLevelZeroOffset( edgesTex, coords, ivec2( 1, 0 ) ).r;

				// Ok, we know how this pattern looks like, now it is time for getting
				// the actual area:
				weights.rg = SMAAArea( areaTex, sqrt_d, e1, e2, float( subsampleIndices.y ) );
			}

			if ( e.r > 0.0 ) { // Edge at west
				vec2 d;

				// Find the distance to the top:
				vec2 coords;

				coords.y = SMAASearchYUp( edgesTex, searchTex, offset[ 1 ].xy, offset[ 2 ].z );
				coords.x = offset[ 0 ].x; // offset[1].x = texcoord.x - 0.25 * resolution.x;
				d.x = coords.y;

				// Fetch the top crossing edges:
				float e1 = texture2D( edgesTex, coords, 0.0 ).g;

				// Find the distance to the bottom:
				coords.y = SMAASearchYDown( edgesTex, searchTex, offset[ 1 ].zw, offset[ 2 ].w );
				d.y = coords.y;

				// We want the distances to be in pixel units:
				d = d / resolution.y - pixcoord.y;

				// SMAAArea below needs a sqrt, as the areas texture is compressed
				// quadratically:
				vec2 sqrt_d = sqrt( abs( d ) );

				// Fetch the bottom crossing edges:
				coords.y -= 1.0 * resolution.y; // WebGL port note: Added
				float e2 = SMAASampleLevelZeroOffset( edgesTex, coords, ivec2( 0, 1 ) ).g;

				// Get the area for this direction:
				weights.ba = SMAAArea( areaTex, sqrt_d, e1, e2, float( subsampleIndices.x ) );
			}

			return weights;
		}

		void main() {

			gl_FragColor = SMAABlendingWeightCalculationPS( vUv, vPixcoord, vOffset, tDiffuse, tArea, tSearch, ivec4( 0.0 ) );

		}`},hs={name:"SMAABlendShader",uniforms:{tDiffuse:{value:null},tColor:{value:null},resolution:{value:new Se(1/1024,1/512)}},vertexShader:`

		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 2 ];

		void SMAANeighborhoodBlendingVS( vec2 texcoord ) {
			vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -1.0, 0.0, 0.0, 1.0 ); // WebGL port note: Changed sign in W component
			vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4( 1.0, 0.0, 0.0, -1.0 ); // WebGL port note: Changed sign in W component
		}

		void main() {

			vUv = uv;

			SMAANeighborhoodBlendingVS( vUv );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform sampler2D tColor;
		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 2 ];

		vec4 SMAANeighborhoodBlendingPS( vec2 texcoord, vec4 offset[ 2 ], sampler2D colorTex, sampler2D blendTex ) {
			// Fetch the blending weights for current pixel:
			vec4 a;
			a.xz = texture2D( blendTex, texcoord ).xz;
			a.y = texture2D( blendTex, offset[ 1 ].zw ).g;
			a.w = texture2D( blendTex, offset[ 1 ].xy ).a;

			// Is there any blending weight with a value greater than 0.0?
			if ( dot(a, vec4( 1.0, 1.0, 1.0, 1.0 )) < 1e-5 ) {
				return texture2D( colorTex, texcoord, 0.0 );
			} else {
				// Up to 4 lines can be crossing a pixel (one through each edge). We
				// favor blending by choosing the line with the maximum weight for each
				// direction:
				vec2 offset;
				offset.x = a.a > a.b ? a.a : -a.b; // left vs. right
				offset.y = a.g > a.r ? -a.g : a.r; // top vs. bottom // WebGL port note: Changed signs

				// Then we go in the direction that has the maximum weight:
				if ( abs( offset.x ) > abs( offset.y )) { // horizontal vs. vertical
					offset.y = 0.0;
				} else {
					offset.x = 0.0;
				}

				// Fetch the opposite color and lerp by hand:
				vec4 C = texture2D( colorTex, texcoord, 0.0 );
				texcoord += sign( offset ) * resolution;
				vec4 Cop = texture2D( colorTex, texcoord, 0.0 );
				float s = abs( offset.x ) > abs( offset.y ) ? abs( offset.x ) : abs( offset.y );

				// WebGL port note: Added gamma correction
				C.xyz = pow(C.xyz, vec3(2.2));
				Cop.xyz = pow(Cop.xyz, vec3(2.2));
				vec4 mixed = mix(C, Cop, s);
				mixed.xyz = pow(mixed.xyz, vec3(1.0 / 2.2));

				return mixed;
			}
		}

		void main() {

			gl_FragColor = SMAANeighborhoodBlendingPS( vUv, vOffset, tColor, tDiffuse );

		}`};var ps=class extends ut{constructor(o,t){super(),this.edgesRT=new lt(o,t,{depthBuffer:!1,type:zt}),this.edgesRT.texture.name="SMAAPass.edges",this.weightsRT=new lt(o,t,{depthBuffer:!1,type:zt}),this.weightsRT.texture.name="SMAAPass.weights";let r=this,a=new Image;a.src=this.getAreaTexture(),a.onload=function(){r.areaTexture.needsUpdate=!0},this.areaTexture=new Ss,this.areaTexture.name="SMAAPass.area",this.areaTexture.image=a,this.areaTexture.minFilter=Yo,this.areaTexture.generateMipmaps=!1,this.areaTexture.flipY=!1;let e=new Image;e.src=this.getSearchTexture(),e.onload=function(){r.searchTexture.needsUpdate=!0},this.searchTexture=new Ss,this.searchTexture.name="SMAAPass.search",this.searchTexture.image=e,this.searchTexture.magFilter=xo,this.searchTexture.minFilter=xo,this.searchTexture.generateMipmaps=!1,this.searchTexture.flipY=!1,this.uniformsEdges=_t.clone(za.uniforms),this.uniformsEdges.resolution.value.set(1/o,1/t),this.materialEdges=new we({defines:Object.assign({},za.defines),uniforms:this.uniformsEdges,vertexShader:za.vertexShader,fragmentShader:za.fragmentShader}),this.uniformsWeights=_t.clone(ka.uniforms),this.uniformsWeights.resolution.value.set(1/o,1/t),this.uniformsWeights.tDiffuse.value=this.edgesRT.texture,this.uniformsWeights.tArea.value=this.areaTexture,this.uniformsWeights.tSearch.value=this.searchTexture,this.materialWeights=new we({defines:Object.assign({},ka.defines),uniforms:this.uniformsWeights,vertexShader:ka.vertexShader,fragmentShader:ka.fragmentShader}),this.uniformsBlend=_t.clone(hs.uniforms),this.uniformsBlend.resolution.value.set(1/o,1/t),this.uniformsBlend.tDiffuse.value=this.weightsRT.texture,this.materialBlend=new we({uniforms:this.uniformsBlend,vertexShader:hs.vertexShader,fragmentShader:hs.fragmentShader}),this.fsQuad=new Ft(null)}render(o,t,r){this.uniformsEdges.tDiffuse.value=r.texture,this.fsQuad.material=this.materialEdges,o.setRenderTarget(this.edgesRT),this.clear&&o.clear(),this.fsQuad.render(o),this.fsQuad.material=this.materialWeights,o.setRenderTarget(this.weightsRT),this.clear&&o.clear(),this.fsQuad.render(o),this.uniformsBlend.tColor.value=r.texture,this.fsQuad.material=this.materialBlend,this.renderToScreen?(o.setRenderTarget(null),this.fsQuad.render(o)):(o.setRenderTarget(t),this.clear&&o.clear(),this.fsQuad.render(o))}setSize(o,t){this.edgesRT.setSize(o,t),this.weightsRT.setSize(o,t),this.materialEdges.uniforms.resolution.value.set(1/o,1/t),this.materialWeights.uniforms.resolution.value.set(1/o,1/t),this.materialBlend.uniforms.resolution.value.set(1/o,1/t)}getAreaTexture(){return"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAAIwCAIAAACOVPcQAACBeklEQVR42u39W4xlWXrnh/3WWvuciIzMrKxrV8/0rWbY0+SQFKcb4owIkSIFCjY9AC1BT/LYBozRi+EX+cV+8IMsYAaCwRcBwjzMiw2jAWtgwC8WR5Q8mDFHZLNHTarZGrLJJllt1W2qKrsumZWZcTvn7L3W54e1vrXX3vuciLPPORFR1XE2EomorB0nVuz//r71re/y/1eMvb4Cb3N11xV/PP/2v4UBAwJG/7H8urx6/25/Gf8O5hypMQ0EEEQwAqLfoN/Z+97f/SW+/NvcgQk4sGBJK6H7N4PFVL+K+e0N11yNfkKvwUdwdlUAXPHHL38oa15f/i/46Ih6SuMSPmLAYAwyRKn7dfMGH97jaMFBYCJUgotIC2YAdu+LyW9vvubxAP8kAL8H/koAuOKP3+q6+xGnd5kdYCeECnGIJViwGJMAkQKfDvB3WZxjLKGh8VSCCzhwEWBpMc5/kBbjawT4HnwJfhr+pPBIu7uu+OOTo9vsmtQcniMBGkKFd4jDWMSCRUpLjJYNJkM+IRzQ+PQvIeAMTrBS2LEiaiR9b/5PuT6Ap/AcfAFO4Y3dA3DFH7/VS+M8k4baEAQfMI4QfbVDDGIRg7GKaIY52qAjTAgTvGBAPGIIghOCYAUrGFNgzA7Q3QhgCwfwAnwe5vDejgG44o/fbm1C5ZlYQvQDARPAIQGxCWBM+wWl37ZQESb4gImexGMDouhGLx1Cst0Saa4b4AqO4Hk4gxo+3DHAV/nx27p3JziPM2pVgoiia5MdEzCGULprIN7gEEeQ5IQxEBBBQnxhsDb5auGmAAYcHMA9eAAz8PBol8/xij9+C4Djlim4gJjWcwZBhCBgMIIYxGAVIkH3ZtcBuLdtRFMWsPGoY9rN+HoBji9VBYdwD2ZQg4cnO7OSq/z4rU5KKdwVbFAjNojCQzTlCLPFSxtamwh2jMUcEgg2Wm/6XgErIBhBckQtGN3CzbVacERgCnfgLswhnvqf7QyAq/z4rRZm1YglYE3affGITaZsdIe2FmMIpnOCap25I6jt2kCwCW0D1uAD9sZctNGXcQIHCkINDQgc78aCr+zjtw3BU/ijdpw3zhCwcaONwBvdeS2YZKkJNJsMPf2JKEvC28RXxxI0ASJyzQCjCEQrO4Q7sFArEzjZhaFc4cdv+/JFdKULM4px0DfUBI2hIsy06BqLhGTQEVdbfAIZXYMPesq6VoCHICzUyjwInO4Y411//LYLs6TDa9wvg2CC2rElgAnpTBziThxaL22MYhzfkghz6GAs2VHbbdM91VZu1MEEpupMMwKyVTb5ij9+u4VJG/5EgEMMmFF01cFai3isRbKbzb+YaU/MQbAm2XSMoUPAmvZzbuKYRIFApbtlrfFuUGd6vq2hXNnH78ZLh/iFhsQG3T4D1ib7k5CC6vY0DCbtrohgLEIClXiGtl10zc0CnEGIhhatLBva7NP58Tvw0qE8yWhARLQ8h4+AhQSP+I4F5xoU+VilGRJs6wnS7ruti/4KvAY/CfdgqjsMy4pf8fodQO8/gnuX3f/3xi3om1/h7THr+co3x93PP9+FBUfbNUjcjEmhcrkT+8K7ml7V10Jo05mpIEFy1NmCJWx9SIKKt+EjAL4Ez8EBVOB6havuT/rByPvHXK+9zUcfcbb254+9fydJknYnRr1oGfdaiAgpxu1Rx/Rek8KISftx3L+DfsLWAANn8Hvw0/AFeAGO9DFV3c6D+CcWbL8Dj9e7f+T1k8AZv/d7+PXWM/Z+VvdCrIvuAKO09RpEEQJM0Ci6+B4xhTWr4cZNOvhktabw0ta0rSJmqz3Yw5/AKXwenod7cAhTmBSPKf6JBdvH8IP17h95pXqw50/+BFnj88fev4NchyaK47OPhhtI8RFSvAfDSNh0Ck0p2gLxGkib5NJj/JWCr90EWQJvwBzO4AHcgztwAFN1evHPUVGwfXON+0debT1YeGON9Yy9/63X+OguiwmhIhQhD7l4sMqlG3D86Suc3qWZ4rWjI1X7u0Ytw6x3rIMeIOPDprfe2XzNgyj6PahhBjO4C3e6puDgXrdg+/5l948vF3bqwZetZ+z9Rx9zdIY5pInPK4Nk0t+l52xdK2B45Qd87nM8fsD5EfUhIcJcERw4RdqqH7Yde5V7m1vhNmtedkz6EDzUMF/2jJYWbC+4fzzA/Y+/8PPH3j9dcBAPIRP8JLXd5BpAu03aziOL3VVHZzz3CXWDPWd+SH2AnxIqQoTZpo9Ckc6HIrFbAbzNmlcg8Ag8NFDDAhbJvTBZXbC94P7t68EXfv6o+21gUtPETU7bbkLxvNKRFG2+KXzvtObonPP4rBvsgmaKj404DlshFole1Glfh02fE7bYR7dZ82oTewIBGn1Md6CG6YUF26X376oevOLzx95vhUmgblI6LBZwTCDY7vMq0op5WVXgsObOXJ+1x3qaBl9j1FeLxbhU9w1F+Wiba6s1X/TBz1LnUfuYDi4r2C69f1f14BWfP+p+W2GFKuC9phcELMYRRLur9DEZTUdEH+iEqWdaM7X4WOoPGI+ZYD2+wcQ+y+ioHUZ9dTDbArzxmi/bJI9BND0Ynd6lBdve/butBw8+f/T9D3ABa3AG8W3VPX4hBin+bj8dMMmSpp5pg7fJ6xrBFE2WQQEWnV8Qg3FbAWzYfM1rREEnmvkN2o1+acG2d/9u68GDzx91v3mAjb1zkpqT21OipPKO0b9TO5W0nTdOmAQm0TObts3aBKgwARtoPDiCT0gHgwnbArzxmtcLc08HgF1asN0C4Ms/fvD5I+7PhfqyXE/b7RbbrGyRQRT9ARZcwAUmgdoz0ehJ9Fn7QAhUjhDAQSw0bV3T3WbNa59jzmiP6GsWbGXDX2ytjy8+f9T97fiBPq9YeLdBmyuizZHaqXITnXiMUEEVcJ7K4j3BFPurtB4bixW8wTpweL8DC95szWMOqucFYGsWbGU7p3TxxxefP+r+oTVktxY0v5hbq3KiOKYnY8ddJVSBxuMMVffNbxwIOERShst73HZ78DZrHpmJmH3K6sGz0fe3UUj0eyRrSCGTTc+rjVNoGzNSv05srAxUBh8IhqChiQgVNIIBH3AVPnrsnXQZbLTm8ammv8eVXn/vWpaTem5IXRlt+U/LA21zhSb9cye6jcOfCnOwhIAYXAMVTUNV0QhVha9xjgA27ODJbLbmitt3tRN80lqG6N/khgot4ZVlOyO4WNg3OIMzhIZQpUEHieg2im6F91hB3I2tubql6BYNN9Hj5S7G0G2tahslBWKDnOiIvuAEDzakDQKDNFQT6gbn8E2y4BBubM230YIpBnDbMa+y3dx0n1S0BtuG62lCCXwcY0F72T1VRR3t2ONcsmDjbmzNt9RFs2LO2hQNyb022JisaI8rAWuw4HI3FuAIhZdOGIcdjLJvvObqlpqvWTJnnQbyi/1M9O8UxWhBs//H42I0q1Yb/XPGONzcmm+ri172mHKvZBpHkJaNJz6v9jxqiklDj3U4CA2ugpAaYMWqNXsdXbmJNd9egCnJEsphXNM+MnK3m0FCJ5S1kmJpa3DgPVbnQnPGWIDspW9ozbcO4K/9LkfaQO2KHuqlfFXSbdNzcEcwoqNEFE9zcIXu9/6n/ym/BC/C3aJLzEKPuYVlbFnfhZ8kcWxV3dbv4bKl28566wD+8C53aw49lTABp9PWbsB+knfc/Li3eVizf5vv/xmvnPKg5ihwKEwlrcHqucuVcVOxEv8aH37E3ZqpZypUulrHEtIWKUr+txHg+ojZDGlwnqmkGlzcVi1dLiNSJiHjfbRNOPwKpx9TVdTn3K05DBx4psIk4Ei8aCkJahRgffk4YnEXe07T4H2RR1u27E6wfQsBDofUgjFUFnwC2AiVtA+05J2zpiDK2Oa0c5fmAecN1iJzmpqFZxqYBCYhFTCsUNEmUnIcZ6aEA5rQVhEywG6w7HSW02XfOoBlQmjwulOFQAg66SvJblrTEX1YtJ3uG15T/BH1OfOQeuR8g/c0gdpT5fx2SKbs9EfHTKdM8A1GaJRHLVIwhcGyydZsbifAFVKl5EMKNU2Hryo+06BeTgqnxzYjThVySDikbtJPieco75lYfKAJOMEZBTjoITuWHXXZVhcUDIS2hpiXHV9Ku4u44bN5OYLDOkJo8w+xJSMbhBRHEdEs9JZUCkQrPMAvaHyLkxgkEHxiNkx/x2YB0mGsQ8EUWj/stW5YLhtS5SMu+/YBbNPDCkGTUybN8krRLBGPlZkVOA0j+a1+rkyQKWGaPHPLZOkJhioQYnVZ2hS3zVxMtgC46KuRwbJNd9nV2PHgb36F194ecf/Yeu2vAFe5nm/bRBFrnY4BauE8ERmZRFUn0k8hbftiVYSKMEme2dJCJSCGYAlNqh87bXOPdUkGy24P6d1ll21MBqqx48Fvv8ZHH8HZFY7j/uAq1xMJUFqCSUlJPmNbIiNsmwuMs/q9CMtsZsFO6SprzCS1Z7QL8xCQClEelpjTduDMsmWD8S1PT152BtvmIGvUeDA/yRn83u/x0/4qxoPHjx+PXY9pqX9bgMvh/Nz9kpP4pOe1/fYf3axUiMdHLlPpZCNjgtNFAhcHEDxTumNONhHrBduW+vOyY++70WWnPXj98eA4kOt/mj/5E05l9+O4o8ePx67HFqyC+qSSnyselqjZGaVK2TadbFLPWAQ4NBhHqDCCV7OTpo34AlSSylPtIdd2AJZlyzYQrDJ5lcWGNceD80CunPLGGzsfD+7wRb95NevJI5docQ3tgCyr5bGnyaPRlmwNsFELViOOx9loebGNq2moDOKpHLVP5al2cymWHbkfzGXL7kfRl44H9wZy33tvt+PB/Xnf93e+nh5ZlU18wCiRUa9m7kib9LYuOk+hudQNbxwm0AQqbfloimaB2lM5fChex+ylMwuTbfmXQtmWlenZljbdXTLuOxjI/fDDHY4Hjx8/Hrse0zXfPFxbUN1kKqSCCSk50m0Ajtx3ub9XHBKHXESb8iO6E+qGytF4nO0OG3SXzbJlhxBnKtKyl0NwybjvYCD30aMdjgePHz8eu56SVTBbgxJMliQ3Oauwg0QHxXE2Ez/EIReLdQj42Gzb4CLS0YJD9xUx7bsi0vJi5mUbW1QzL0h0PFk17rtiIPfJk52MB48fPx67npJJwyrBa2RCCQRTbGZSPCxTPOiND4G2pYyOQ4h4jINIJh5wFU1NFZt+IsZ59LSnDqBjZ2awbOku+yInunLcd8VA7rNnOxkPHj9+PGY9B0MWJJNozOJmlglvDMXDEozdhQWbgs/U6oBanGzLrdSNNnZFjOkmbi5bNt1lX7JLLhn3vXAg9/h4y/Hg8ePHI9dzQMEkWCgdRfYykYKnkP7D4rIujsujaKPBsB54vE2TS00ccvFY/Tth7JXeq1hz+qgVy04sAJawTsvOknHfCwdyT062HA8eP348Zj0vdoXF4pilKa2BROed+9fyw9rWRXeTFXESMOanvDZfJuJaSXouQdMdDJZtekZcLLvEeK04d8m474UDuaenW44Hjx8/Xns9YYqZpszGWB3AN/4VHw+k7WSFtJ3Qicuqb/NlVmgXWsxh570xg2UwxUw3WfO6B5nOuO8aA7lnZxuPB48fPx6znm1i4bsfcbaptF3zNT78eFPtwi1OaCNOqp1x3zUGcs/PN++AGD1+fMXrSVm2baTtPhPahbPhA71wIHd2bXzRa69nG+3CraTtPivahV/55tXWg8fyRY/9AdsY8VbSdp8V7cKrrgdfM//z6ILQFtJ2nxHtwmuoB4/kf74+gLeRtvvMaBdeSz34+vifx0YG20jbfTa0C6+tHrwe//NmOG0L8EbSdp8R7cLrrQe/996O+ai3ujQOskpTNULa7jOjXXj99eCd8lHvoFiwsbTdZ0a78PrrwTvlo966pLuRtB2fFe3Cm6oHP9kNH/W2FryxtN1nTLvwRurBO+Kj3pWXHidtx2dFu/Bm68Fb81HvykuPlrb7LGkX3mw9eGs+6h1Y8MbSdjegXcguQLjmevDpTQLMxtJ2N6NdyBZu9AbrwVvwUW+LbteULUpCdqm0HTelXbhNPe8G68Gb8lFvVfYfSNuxvrTdTWoXbozAzdaDZzfkorOj1oxVxlIMlpSIlpLrt8D4hrQL17z+c3h6hU/wv4Q/utps4+bm+6P/hIcf0JwQ5oQGPBL0eKPTYEXTW+eL/2DKn73J9BTXYANG57hz1cEMviVf/4tf5b/6C5pTQkMIWoAq7hTpOJjtAM4pxKu5vg5vXeUrtI09/Mo/5H+4z+Mp5xULh7cEm2QbRP2tFIKR7WM3fPf/jZ3SWCqLM2l4NxID5zB72HQXv3jj/8mLR5xXNA5v8EbFQEz7PpRfl1+MB/hlAN65qgDn3wTgH13hK7T59bmP+NIx1SHHU84nLOITt3iVz8mNO+lPrjGAnBFqmioNn1mTyk1ta47R6d4MrX7tjrnjYUpdUbv2rVr6YpVfsGG58AG8Ah9eyUN8CX4WfgV+G8LVWPDGb+Zd4cU584CtqSbMKxauxTg+dyn/LkVgA+IR8KHtejeFKRtTmLLpxN6mYVLjYxwXf5x2VofiZcp/lwKk4wGOpYDnoIZPdg/AAbwMfx0+ge9dgZvYjuqKe4HnGnykYo5TvJbG0Vj12JagRhwKa44H95ShkZa5RyLGGdfYvG7aw1TsF6iapPAS29mNS3NmsTQZCmgTzFwgL3upCTgtBTRwvGMAKrgLn4evwin8+afJRcff+8izUGUM63GOOuAs3tJkw7J4kyoNreqrpO6cYLQeFUd7TTpr5YOTLc9RUUogUOVJQ1GYJaFLAW0oTmKyYS46ZooP4S4EON3xQ5zC8/CX4CnM4c1PE8ApexpoYuzqlP3d4S3OJP8ZDK7cKWNaTlqmgDiiHwl1YsE41w1zT4iRTm3DBqxvOUsbMKKDa/EHxagtnta072ejc3DOIh5ojvh8l3tk1JF/AV6FU6jh3U8HwEazLgdCLYSQ+MYiAI2ltomkzttUb0gGHdSUUgsIYjTzLG3mObX4FBRaYtpDVNZrih9TgTeYOBxsEnN1gOCTM8Bsw/ieMc75w9kuAT6A+/AiHGvN/+Gn4KRkiuzpNNDYhDGFndWRpE6SVfm8U5bxnSgVV2jrg6JCKmneqey8VMFgq2+AM/i4L4RUbfSi27lNXZ7R7W9RTcq/q9fk4Xw3AMQd4I5ifAZz8FcVtm9SAom/dyN4lczJQW/kC42ZrHgcCoIf1oVMKkVItmMBi9cOeNHGLqOZk+QqQmrbc5YmYgxELUUN35z2iohstgfLIFmcMV7s4CFmI74L9+EFmGsi+tGnAOD4Yk9gIpo01Y4cA43BWGygMdr4YZekG3OBIUXXNukvJS8tqa06e+lSDCtnqqMFu6hWHXCF+WaYt64m9QBmNxi7Ioy7D+fa1yHw+FMAcPt7SysFLtoG4PXAk7JOA3aAxBRqUiAdU9Yp5lK3HLSRFtOim0sa8euEt08xvKjYjzeJ2GU7YawexrnKI9tmobInjFXCewpwriY9+RR4aaezFhMhGCppKwom0ChrgFlKzyPKkGlTW1YQrE9HJqu8hKGgMc6hVi5QRq0PZxNfrYNgE64utmRv6KKHRpxf6VDUaOvNP5jCEx5q185My/7RKz69UQu2im5k4/eownpxZxNLwiZ1AZTO2ZjWjkU9uaB2HFn6Q3u0JcsSx/qV9hTEApRzeBLDJQXxYmTnq7bdLa3+uqFrxLJ5w1TehnNHx5ECvCh2g2c3hHH5YsfdaSKddztfjQ6imKFGSyFwlLzxEGPp6r5IevVjk1AMx3wMqi1NxDVjLBiPs9tbsCkIY5we5/ML22zrCScFxnNtzsr9Wcc3CnD+pYO+4VXXiDE0oc/vQQ/fDK3oPESJMYXNmJa/DuloJZkcTpcYE8lIH8Dz8DJMiynNC86Mb2lNaaqP/+L7f2fcE/yP7/Lde8xfgSOdMxvOixZf/9p3+M4hT1+F+zApxg9XfUvYjc8qX2lfOOpK2gNRtB4flpFu9FTKCp2XJRgXnX6olp1zyYjTKJSkGmLE2NjUr1bxFM4AeAAHBUFIeSLqXR+NvH/M9fOnfHzOD2vCSyQJKzfgsCh+yi/Mmc35F2fUrw7miW33W9hBD1vpuUojFphIyvg7aTeoymDkIkeW3XLHmguMzbIAJejN6B5MDrhipE2y6SoFRO/AK/AcHHZHNIfiWrEe/C6cr3f/yOvrQKB+zMM55/GQdLDsR+ifr5Fiuu+/y+M78LzOE5dsNuXC3PYvYWd8NXvphLSkJIasrlD2/HOqQ+RjcRdjKTGWYhhVUm4yxlyiGPuMsZR7sMCHUBeTuNWA7if+ifXgc/hovftHXs/DV+Fvwe+f8shzMiMcweFgBly3//vwJfg5AN4450fn1Hd1Rm1aBLu22Dy3y3H2+OqMemkbGZ4jozcDjJf6596xOLpC0eMTHbKnxLxH27uZ/bMTGs2jOaMOY4m87CfQwF0dw53oa1k80JRuz/XgS+8fX3N9Af4qPIMfzKgCp4H5TDGe9GGeFPzSsZz80SlPTxXjgwJmC45njzgt2vbQ4b4OAdUK4/vWhO8d8v6EE8fMUsfakXbPpFJeLs2ubM/qdm/la3WP91uWhxXHjoWhyRUq2iJ/+5mA73zwIIo+LoZ/SgvIRjAd1IMvvn98PfgOvAJfhhm8scAKVWDuaRaK8aQ9f7vuPDH6Bj47ZXau7rqYJ66mTDwEDU6lLbCjCK0qTXyl5mnDoeNRxanj3FJbaksTk0faXxHxLrssgPkWB9LnA/MFleXcJozzjwsUvUG0X/QCve51qkMDXp9mtcyOy3rwBfdvVJK7D6/ACSzg3RoruIq5UDeESfEmVclDxnniU82vxMLtceD0hGZWzBNPMM/jSPne2OVatiTKUpY5vY7gc0LdUAWeWM5tH+O2I66AOWw9xT2BuyRVLGdoDHUsVRXOo/c+ZdRXvFfnxWyIV4upFLCl9eAL7h8Zv0QH8Ry8pA2cHzQpGesctVA37ZtklBTgHjyvdSeKY/RZw/kJMk0Y25cSNRWSigQtlULPTw+kzuJPeYEkXjQRpoGZobYsLF79pyd1dMRHInbgFTZqNLhDqiIsTNpoex2WLcy0/X6rHcdMMQvFSd5dWA++4P7xv89deACnmr36uGlL69bRCL6BSZsS6c0TU2TKK5gtWCzgAOOwQcurqk9j8whvziZSMLcq5hbuwBEsYjopUBkqw1yYBGpLA97SRElEmx5MCInBY5vgLk94iKqSWmhIGmkJ4Bi9m4L645J68LyY4wsFYBfUg5feP/6gWWm58IEmKQM89hq7KsZNaKtP5TxxrUZZVkNmMJtjbKrGxLNEbHPJxhqy7lAmbC32ZqeF6lTaknRWcYaFpfLUBh/rwaQycCCJmW15Kstv6jRHyJFry2C1ahkkIW0LO75s61+owxK1y3XqweX9m5YLM2DPFeOjn/iiqCKJ+yKXF8t5Yl/kNsqaSCryxPq5xWTFIaP8KSW0RYxqupaUf0RcTNSSdJZGcKYdYA6kdtrtmyBckfKXwqk0pHpUHlwWaffjNRBYFPUDWa8e3Lt/o0R0CdisKDM89cX0pvRHEfM8ca4t0s2Xx4kgo91MPQJ/0c9MQYq0co8MBh7bz1fio0UUHLR4aAIOvOmoYO6kwlEVODSSTliWtOtH6sPkrtctF9ZtJ9GIerBskvhdVS5cFNv9s1BU0AbdUgdK4FG+dRnjFmDTzniRMdZO1QhzMK355vigbdkpz9P6qjUGE5J2qAcXmwJ20cZUiAD0z+pGMx6xkzJkmEf40Hr4qZfVg2XzF9YOyoV5BjzVkUJngKf8lgNYwKECEHrCNDrWZzMlflS3yBhr/InyoUgBc/lKT4pxVrrC6g1YwcceK3BmNxZcAtz3j5EIpqguh9H6wc011YN75cKDLpFDxuwkrPQmUwW4KTbj9mZTwBwLq4aQMUZbHm1rylJ46dzR0dua2n3RYCWZsiHROeywyJGR7mXKlpryyCiouY56sFkBWEnkEB/raeh/Sw4162KeuAxMQpEkzy5alMY5wamMsWKKrtW2WpEWNnReZWONKWjrdsKZarpFjqCslq773PLmEhM448Pc3+FKr1+94vv/rfw4tEcu+lKTBe4kZSdijBrykwv9vbCMPcLQTygBjzVckSLPRVGslqdunwJ4oegtFOYb4SwxNgWLCmD7T9kVjTv5YDgpo0XBmN34Z/rEHp0sgyz7lngsrm4lvMm2Mr1zNOJYJ5cuxuQxwMGJq/TP5emlb8fsQBZviK4t8hFL+zbhtlpwaRSxQRWfeETjuauPsdGxsBVdO7nmP4xvzSoT29pRl7kGqz+k26B3Oy0YNV+SXbbQas1ctC/GarskRdFpKczVAF1ZXnLcpaMuzVe6lZ2g/1ndcvOVgRG3sdUAY1bKD6achijMPdMxV4muKVorSpiDHituH7rSTs7n/4y5DhRXo4FVBN4vO/zbAcxhENzGbHCzU/98Mcx5e7a31kWjw9FCe/zNeYyQjZsWb1uc7U33pN4Mji6hCLhivqfa9Ss6xLg031AgfesA/l99m9fgvnaF9JoE6bYKmkGNK3aPbHB96w3+DnxFm4hs0drLsk7U8kf/N/CvwQNtllna0rjq61sH8L80HAuvwH1tvBy2ChqWSCaYTaGN19sTvlfzFD6n+iKTbvtayfrfe9ueWh6GJFoxLdr7V72a5ZpvHcCPDzma0wTO4EgbLyedxstO81n57LYBOBzyfsOhUKsW1J1BB5vr/tz8RyqOFylQP9Tvst2JALsC5lsH8PyQ40DV4ANzYa4dedNiKNR1s+x2wwbR7q4/4cTxqEk4LWDebfisuo36JXLiWFjOtLrlNWh3K1rRS4xvHcDNlFnNmWBBAl5SWaL3oPOfnvbr5pdjVnEaeBJSYjuLEkyLLsWhKccadmOphZkOPgVdalj2QpSmfOsADhMWE2ZBu4+EEJI4wKTAuCoC4xwQbWXBltpxbjkXJtKxxabo9e7tyhlgb6gNlSbUpMh+l/FaqzVwewGu8BW1Zx7pTpQDJUjb8tsUTW6+GDXbMn3mLbXlXJiGdggxFAoUrtPS3wE4Nk02UZG2OOzlk7fRs7i95QCLo3E0jtrjnM7SR3uS1p4qtS2nJ5OwtQVHgOvArLBFijZUV9QtSl8dAY5d0E0hM0w3HS2DpIeB6m/A1+HfhJcGUq4sOxH+x3f5+VO+Ds9rYNI7zPXOYWPrtf8bYMx6fuOAX5jzNR0PdsuON+X1f7EERxMJJoU6GkTEWBvVolVlb5lh3tKCg6Wx1IbaMDdJ+9sUCc5KC46hKGCk3IVOS4TCqdBNfUs7Kd4iXf2RjnT/LLysJy3XDcHLh/vde3x8DoGvwgsa67vBk91G5Pe/HbOe7xwym0NXbtiuuDkGO2IJDh9oQvJ4cY4vdoqLDuoH9Zl2F/ofsekn8lkuhIlhQcffUtSjytFyp++p6NiE7Rqx/lodgKVoceEp/CP4FfjrquZaTtj2AvH5K/ywpn7M34K/SsoYDAdIN448I1/0/wveW289T1/lX5xBzc8N5IaHr0XMOQdHsIkDuJFifj20pBm5jzwUv9e2FhwRsvhAbalCIuIw3bhJihY3p6nTFFIZgiSYjfTf3aXuOjmeGn4bPoGvwl+CFzTRczBIuHBEeImHc37/lGfwZR0cXzVDOvaKfNHvwe+suZ771K/y/XcBlsoN996JpBhoE2toYxOznNEOS5TJc6Id5GEXLjrWo+LEWGNpPDU4WAwsIRROu+1vM+0oW37z/MBN9kqHnSArwPfgFJ7Cq/Ai3Ie7g7ncmI09v8sjzw9mzOAEXoIHxURueaAce5V80f/DOuuZwHM8vsMb5wBzOFWM7wymTXPAEvm4vcFpZ2ut0VZRjkiP2MlmLd6DIpbGSiHOjdnUHN90hRYmhTnmvhzp1iKDNj+b7t5hi79lWGwQ+HN9RsfFMy0FXbEwhfuczKgCbyxYwBmcFhhvo/7a44v+i3XWcwDP86PzpGQYdWh7csP5dBvZ1jNzdxC8pBGuxqSW5vw40nBpj5JhMwvOzN0RWqERHMr4Lv1kWX84xLR830G3j6yqZ1a8UstTlW+qJPOZ+sZ7xZPKTJLhiNOAFd6tk+jrTH31ncLOxid8+nzRb128HhUcru/y0Wn6iT254YPC6FtVSIMoW2sk727AhvTtrWKZTvgsmckfXYZWeNRXx/3YQ2OUxLDrbHtN11IwrgXT6c8dATDwLniYwxzO4RzuQqTKSC5gAofMZ1QBK3zQ4JWobFbcvJm87FK+6JXrKahLn54m3p+McXzzYtP8VF/QpJuh1OwieElEoI1pRxPS09FBrkq2tWCU59+HdhNtTIqKm8EBrw2RTOEDpG3IKo2Y7mFdLm3ZeVjYwVw11o/oznceMve4CgMfNym/utA/d/ILMR7gpXzRy9eDsgLcgbs8O2Va1L0zzIdwGGemTBuwROHeoMShkUc7P+ISY3KH5ZZeWqO8mFTxQYeXTNuzvvK5FGPdQfuu00DwYFY9dyhctEt+OJDdnucfpmyhzUJzfsJjr29l8S0bXBfwRS9ZT26tmMIdZucch5ZboMz3Nio3nIOsYHCGoDT4kUA9MiXEp9Xsui1S8th/kbWIrMBxDGLodWUQIWcvnXy+9M23xPiSMOiRPqM+YMXkUN3gXFrZJwXGzUaMpJfyRS9ZT0lPe8TpScuRlbMHeUmlaKDoNuy62iWNTWNFYjoxFzuJs8oR+RhRx7O4SVNSXpa0ZJQ0K1LAHDQ+D9IepkMXpcsq5EVCvClBUIzDhDoyKwDw1Lc59GbTeORivugw1IcuaEOaGWdNm+Ps5fQ7/tm0DjMegq3yM3vb5j12qUId5UZD2oxDSEWOZMSqFl/W+5oynWDa/aI04tJRQ2eTXusg86SQVu/nwSYwpW6wLjlqIzwLuxGIvoAvul0PS+ZNz0/akp/pniO/8JDnGyaCkzbhl6YcqmK/69prxPqtpx2+Km9al9sjL+rwMgHw4jE/C8/HQ3m1vBuL1fldbzd8mOueVJ92syqdEY4KJjSCde3mcRw2TA6szxedn+zwhZMps0XrqEsiUjnC1hw0TELC2Ek7uAAdzcheXv1BYLagspxpzSAoZZUsIzIq35MnFQ9DOrlNB30jq3L4pkhccKUAA8/ocvN1Rzx9QyOtERs4CVsJRK/DF71kPYrxYsGsm6RMh4cps5g1DOmM54Ly1ii0Hd3Y/BMk8VWFgBVmhqrkJCPBHAolwZaWzLR9Vb7bcWdX9NyUYE+uB2BKfuaeBUcjDljbYVY4DdtsVWvzRZdWnyUzDpjNl1Du3aloAjVJTNDpcIOVVhrHFF66lLfJL1zJr9PQ2nFJSBaKoDe+sAvLufZVHVzYh7W0h/c6AAZ+7Tvj6q9j68G/cTCS/3n1vLKHZwNi+P+pS0WkZNMBMUl+LDLuiE4omZy71r3UFMwNJV+VJ/GC5ixVUkBStsT4gGKh0Gm4Oy3qvq7Lbmq24nPdDuDR9deR11XzP4vFu3TYzfnIyiSVmgizUYGqkIXNdKTY9pgb9D2Ix5t0+NHkVzCdU03suWkkVZAoCONCn0T35gAeW38de43mf97sMOpSvj4aa1KYUm58USI7Wxxes03bAZdRzk6UtbzMaCQ6IxO0dy7X+XsjoD16hpsBeGz9dfzHj+R/Hp8nCxZRqkEDTaCKCSywjiaoMJ1TITE9eg7Jqnq8HL6gDwiZb0u0V0Rr/rmvqjxKuaLCX7ZWXTvAY+uvm3z8CP7nzVpngqrJpZKwWnCUjIviYVlirlGOzPLI3SMVyp/elvBUjjDkNhrtufFFErQ8pmdSlbK16toBHlt/HV8uHMX/vEGALkV3RJREiSlopxwdMXOZPLZ+ix+kAHpMKIk8UtE1ygtquttwxNhphrIZ1IBzjGF3IIGxGcBj6q8bHJBG8T9vdsoWrTFEuebEZuVxhhClH6P5Zo89OG9fwHNjtNQTpD0TG9PJLEYqvEY6Rlxy+ZZGfL0Aj62/bnQCXp//eeM4KzfQVJbgMQbUjlMFIm6TpcfWlZje7NBSV6IsEVmumWIbjiloUzQX9OzYdo8L1wjw2PrrpimONfmfNyzKklrgnEkSzT5QWYQW40YShyzqsRmMXbvVxKtGuYyMKaU1ugenLDm5Ily4iT14fP11Mx+xJv+zZ3MvnfdFqxU3a1W/FTB4m3Qfsyc1XUcdVhDeUDZXSFHHLQj/Y5jtC7ZqM0CXGwB4bP11i3LhOvzPGygYtiUBiwQV/4wFO0majijGsafHyRLu0yG6q35cL1rOpVxr2s5cM2jJYMCdc10Aj6q/blRpWJ//+dmm5psMl0KA2+AFRx9jMe2WbC4jQxnikd4DU8TwUjRVacgdlhmr3bpddzuJ9zXqr2xnxJfzP29RexdtjDVZqzkqa6PyvcojGrfkXiJ8SEtml/nYskicv0ivlxbqjemwUjMw5evdg8fUX9nOiC/lf94Q2i7MURk9nW1MSj5j8eAyV6y5CN2S6qbnw3vdA1Iwq+XOSCl663udN3IzLnrt+us25cI1+Z83SXQUldqQq0b5XOT17bGpLd6ssN1VMPf8c+jG8L3NeCnMdF+Ra3fRa9dft39/LuZ/3vwHoHrqGmQFafmiQw6eyzMxS05K4bL9uA+SKUQzCnSDkqOGokXyJvbgJ/BHI+qvY69//4rl20NsmK2ou2dTsyIALv/91/8n3P2Aao71WFGi8KKv1fRC5+J67Q/507/E/SOshqN5TsmYIjVt+kcjAx98iz/4SaojbIV1rexE7/C29HcYD/DX4a0rBOF5VTu7omsb11L/AWcVlcVZHSsqGuXLLp9ha8I//w3Mv+T4Ew7nTBsmgapoCrNFObIcN4pf/Ob/mrvHTGqqgAupL8qWjWPS9m/31jAe4DjA+4+uCoQoT/zOzlrNd3qd4SdphFxsUvYwGWbTWtISc3wNOWH+kHBMfc6kpmpwPgHWwqaSUG2ZWWheYOGQGaHB+eQ/kn6b3pOgLV+ODSn94wDvr8Bvb70/LLuiPPEr8OGVWfDmr45PZyccEmsVXZGe1pRNX9SU5+AVQkNTIVPCHF/jGmyDC9j4R9LfWcQvfiETmgMMUCMN1uNCakkweZsowdYobiMSlnKA93u7NzTXlSfe+SVbfnPQXmg9LpYAQxpwEtONyEyaueWM4FPjjyjG3uOaFmBTWDNgBXGEiQpsaWhnAqIijB07Dlsy3fUGeP989xbWkyf+FF2SNEtT1E0f4DYYVlxFlbaSMPIRMk/3iMU5pME2SIWJvjckciebkQuIRRyhUvkHg/iUljG5kzVog5hV7vIlCuBrmlhvgPfNHQM8lCf+FEGsYbMIBC0qC9a0uuy2wLXVbLBaP5kjHokCRxapkQyzI4QEcwgYHRZBp+XEFTqXFuNVzMtjXLJgX4gAid24Hjwc4N3dtVSe+NNiwTrzH4WVUOlDobUqr1FuAgYllc8pmzoVrELRHSIW8ViPxNy4xwjBpyR55I6J220qQTZYR4guvUICJiSpr9gFFle4RcF/OMB7BRiX8sSfhpNSO3lvEZCQfLUVTKT78Ek1LRLhWN+yLyTnp8qWUZ46b6vxdRGXfHVqx3eI75YaLa4iNNiK4NOW7wPW6lhbSOF9/M9qw8e/aoB3d156qTzxp8pXx5BKAsYSTOIIiPkp68GmTq7sZtvyzBQaRLNxIZ+paozHWoLFeExIhRBrWitHCAHrCF7/thhD8JhYz84wg93QRV88wLuLY8zF8sQ36qF1J455bOlgnELfshKVxYOXKVuKx0jaj22sczTQqPqtV/XDgpswmGTWWMSDw3ssyUunLLrVPGjYRsH5ggHeHSWiV8kT33ycFSfMgkoOK8apCye0J6VW6GOYvffgU9RWsukEi2kUV2nl4dOYUzRik9p7bcA4ggdJ53LxKcEe17B1R8eqAd7dOepV8sTXf5lhejoL85hUdhDdknPtKHFhljOT+bdq0hxbm35p2nc8+Ja1Iw+tJykgp0EWuAAZYwMVwac5KzYMslhvgHdHRrxKnvhTYcfKsxTxtTETkjHO7rr3zjoV25lAQHrqpV7bTiy2aXMmUhTBnKS91jhtR3GEoF0oLnWhWNnYgtcc4N0FxlcgT7yz3TgNIKkscx9jtV1ZKpWW+Ub1tc1eOv5ucdgpx+FJy9pgbLE7xDyXb/f+hLHVGeitHOi6A7ybo3sF8sS7w7cgdk0nJaOn3hLj3uyD0Zp5pazFIUXUpuTTU18d1EPkDoX8SkmWTnVIozEdbTcZjoqxhNHf1JrSS/AcvHjZ/SMHhL/7i5z+POsTUh/8BvNfYMTA8n+yU/MlTZxSJDRStqvEuLQKWwDctMTQogUDyQRoTQG5Kc6oQRE1yV1jCA7ri7jdZyK0sYTRjCR0Hnnd+y7nHxNgTULqw+8wj0mQKxpYvhjm9uSUxg+TTy7s2GtLUGcywhXSKZN275GsqlclX90J6bRI1aouxmgL7Q0Nen5ziM80SqMIo8cSOo+8XplT/5DHNWsSUr/6lLN/QQ3rDyzLruEW5enpf7KqZoShEduuSFOV7DLX7Ye+GmXb6/hnNNqKsVXuMDFpb9Y9eH3C6NGEzuOuI3gpMH/I6e+zDiH1fXi15t3vA1czsLws0TGEtmPEJdiiFPwlwKbgLHAFk4P6ZyPdymYYHGE0dutsChQBl2JcBFlrEkY/N5bQeXQ18gjunuMfMfsBlxJSx3niO485fwO4fGD5T/+3fPQqkneWVdwnw/3bMPkW9Wbqg+iC765Zk+xcT98ibKZc2EdgHcLoF8cSOo/Oc8fS+OyEULF4g4sJqXVcmfMfsc7A8v1/yfGXmL9I6Fn5pRwZhsPv0TxFNlAfZCvG+Oohi82UC5f/2IsJo0cTOm9YrDoKhFPEUr/LBYTUNht9zelHXDqwfPCIw4owp3mOcIQcLttWXFe3VZ/j5H3cIc0G6oPbCR+6Y2xF2EC5cGUm6wKC5tGEzhsWqw5hNidUiKX5gFWE1GXh4/Qplw4sVzOmx9QxU78g3EF6wnZlEN4FzJ1QPSLEZz1KfXC7vd8ssGdIbNUYpVx4UapyFUHzJoTOo1McSkeNn1M5MDQfs4qQuhhX5vQZFw8suwWTcyYTgioISk2YdmkhehG4PkE7w51inyAGGaU+uCXADabGzJR1fn3lwkty0asIo8cROm9Vy1g0yDxxtPvHDAmpu+PKnM8Ix1wwsGw91YJqhteaWgjYBmmQiebmSpwKKzE19hx7jkzSWOm66oPbzZ8Yj6kxVSpYjVAuvLzYMCRo3oTQecOOjjgi3NQ4l9K5/hOGhNTdcWVOTrlgYNkEXINbpCkBRyqhp+LdRB3g0OU6rMfW2HPCFFMV9nSp+uB2woepdbLBuJQyaw/ZFysXrlXwHxI0b0LovEkiOpXGA1Ijagf+KUNC6rKNa9bQnLFqYNkEnMc1uJrg2u64ELPBHpkgWbmwKpJoDhMwNbbGzAp7Yg31wS2T5rGtzit59PrKhesWG550CZpHEzpv2NGRaxlNjbMqpmEIzygJqQfjypycs2pg2cS2RY9r8HUqkqdEgKTWtWTKoRvOBPDYBltja2SO0RGjy9UHtxwRjA11ujbKF+ti5cIR9eCnxUg6owidtyoU5tK4NLji5Q3HCtiyF2IqLGYsHViOXTXOYxucDqG0HyttqYAKqYo3KTY1ekyDXRAm2AWh9JmsVh/ccg9WJ2E8YjG201sPq5ULxxX8n3XLXuMInbft2mk80rRGjCGctJ8/GFdmEQ9Ug4FlE1ll1Y7jtiraqm5Fe04VV8lvSVBL8hiPrfFVd8+7QH3Qbu2ipTVi8cvSGivc9cj8yvH11YMHdNSERtuOslM97feYFOPKzGcsI4zW0YGAbTAOaxCnxdfiYUmVWslxiIblCeAYr9VYR1gM7GmoPrilunSxxeT3DN/2eBQ9H11+nk1adn6VK71+5+Jfct4/el10/7KBZfNryUunWSCPxPECk1rdOv1WVSrQmpC+Tl46YD3ikQYcpunSQgzVB2VHFhxHVGKDgMEY5GLlQnP7FMDzw7IacAWnO6sBr12u+XanW2AO0wQ8pknnFhsL7KYIqhkEPmEXFkwaN5KQphbkUmG72wgw7WSm9RiL9QT925hkjiVIIhphFS9HKI6/8QAjlpXqg9W2C0apyaVDwKQwrwLY3j6ADR13ZyUNByQXHQu6RY09Hu6zMqXRaNZGS/KEJs0cJEe9VH1QdvBSJv9h09eiRmy0V2uJcqHcShcdvbSNg5fxkenkVprXM9rDVnX24/y9MVtncvbKY706anNl3ASll9a43UiacVquXGhvq4s2FP62NGKfQLIQYu9q1WmdMfmUrDGt8eDS0cXozH/fjmUH6Jruvm50hBDSaEU/2Ru2LEN/dl006TSc/g7tfJERxGMsgDUEr104pfWH9lQaN+M4KWQjwZbVc2rZVNHsyHal23wZtIs2JJqtIc/WLXXRFCpJkfE9jvWlfFbsNQ9pP5ZBS0zKh4R0aMFj1IjTcTnvi0Zz2rt7NdvQb2mgbju1plsH8MmbnEk7KbK0b+wC2iy3aX3szW8xeZvDwET6hWZYwqTXSSG+wMETKum0Dq/q+x62gt2ua2ppAo309TRk9TPazfV3qL9H8z7uhGqGqxNVg/FKx0HBl9OVUORn8Q8Jx9gFttGQUDr3tzcXX9xGgN0EpzN9mdZ3GATtPhL+CjxFDmkeEU6x56kqZRusLzALXVqkCN7zMEcqwjmywDQ6OhyUe0Xao1Qpyncrg6wKp9XfWDsaZplElvQ/b3sdweeghorwBDlHzgk1JmMc/wiERICVy2VJFdMjFuLQSp3S0W3+sngt2njwNgLssFGVQdJ0tu0KH4ky1LW4yrbkuaA6Iy9oz/qEMMXMMDWyIHhsAyFZc2peV9hc7kiKvfULxCl9iddfRK1f8kk9qvbdOoBtOg7ZkOZ5MsGrSHsokgLXUp9y88smniwWyuFSIRVmjplga3yD8Uij5QS1ZiM4U3Qw5QlSm2bXjFe6jzzBFtpg+/YBbLAWG7OPynNjlCw65fukGNdkJRf7yM1fOxVzbxOJVocFoYIaGwH22mIQkrvu1E2nGuebxIgW9U9TSiukPGU+Lt++c3DJPKhyhEEbXCQLUpae2exiKy6tMPe9mDRBFCEMTWrtwxN8qvuGnt6MoihKWS5NSyBhbH8StXoAz8PLOrRgLtOT/+4vcu+7vDLnqNvztOq7fmd8sMmY9Xzn1zj8Dq8+XVdu2Nv0IIySgEdQo3xVHps3Q5i3fLFsV4aiqzAiBhbgMDEd1uh8qZZ+lwhjkgokkOIv4xNJmyncdfUUzgB4oFMBtiu71Xumpz/P+cfUP+SlwFExwWW62r7b+LSPxqxn/gvMZ5z9C16t15UbNlq+jbGJtco7p8wbYlL4alSyfWdeuu0j7JA3JFNuVAwtst7F7FhWBbPFNKIUORndWtLraFLmMu7KFVDDOzqkeaiN33YAW/r76wR4XDN/yN1z7hejPau06EddkS/6XThfcz1fI/4K736fO48vlxt2PXJYFaeUkFS8U15XE3428xdtn2kc8GQlf1vkIaNRRnOMvLTWrZbElEHeLWi1o0dlKPAh1MVgbbVquPJ5+Cr8LU5/H/+I2QlHIU2ClXM9G8v7Rr7oc/hozfUUgsPnb3D+I+7WF8kNO92GY0SNvuxiE+2Bt8prVJTkzE64sfOstxuwfxUUoyk8VjcTlsqe2qITSFoSj6Epd4KsT6BZOWmtgE3hBfir8IzZDwgV4ZTZvD8VvPHERo8v+vL1DASHTz/i9OlKueHDjK5Rnx/JB1Vb1ioXdBra16dmt7dgik10yA/FwJSVY6XjA3oy4SqM2frqDPPSRMex9qs3XQtoWxMj7/Er8GWYsXgjaVz4OYumP2+9kbxvny/6kvWsEBw+fcb5bInc8APdhpOSs01tEqIkoiZjbAqKMruLbJYddHuHFRIyJcbdEdbl2sVLaySygunutBg96Y2/JjKRCdyHV+AEFtTvIpbKIXOamknYSiB6KV/0JetZITgcjjk5ZdaskBtWO86UF0ap6ozGXJk2WNiRUlCPFir66lzdm/SLSuK7EUdPz8f1z29Skq6F1fXg8+5UVR6bszncP4Tn4KUkkdJ8UFCY1zR1i8RmL/qQL3rlei4THG7OODlnKko4oI01kd3CaM08Ia18kC3GNoVaO9iDh+hWxSyTXFABXoau7Q6q9OxYg/OVEMw6jdbtSrJ9cBcewGmaZmg+bvkUnUUaGr+ZfnMH45Ivevl61hMcXsxYLFTu1hTm2zViCp7u0o5l+2PSUh9bDj6FgYypufBDhqK2+oXkiuHFHR3zfj+9PtA8oR0xnqX8qn+sx3bFODSbbF0X8EUvWQ8jBIcjo5bRmLOljDNtcqNtOe756h3l0VhKa9hDd2l1eqmsnh0MNMT/Cqnx6BInumhLT8luljzQ53RiJeA/0dxe5NK0o2fA1+GLXr6eNQWHNUOJssQaTRlGpLHKL9fD+IrQzTOMZS9fNQD4AnRNVxvTdjC+fJdcDDWQcyB00B0t9BDwTxXgaAfzDZ/DBXzRnfWMFRwuNqocOmX6OKNkY63h5n/fFcB28McVHqnXZVI27K0i4rDLNE9lDKV/rT+udVbD8dFFu2GGZ8mOt0kAXcoX3ZkIWVtw+MNf5NjR2FbivROHmhV1/pj2egv/fMGIOWTIWrV3Av8N9imV9IWml36H6cUjqEWNv9aNc+veb2sH46PRaHSuMBxvtW+twxctq0z+QsHhux8Q7rCY4Ct8lqsx7c6Sy0dl5T89rIeEuZKoVctIk1hNpfavER6yyH1Vvm3MbsUHy4ab4hWr/OZPcsRBphnaV65/ZcdYPNNwsjN/djlf9NqCw9U5ExCPcdhKxUgLSmfROpLp4WSUr8ojdwbncbvCf+a/YzRaEc6QOvXcGO256TXc5Lab9POvB+AWY7PigWYjzhifbovuunzRawsO24ZqQQAqguBtmpmPB7ysXJfyDDaV/aPGillgz1MdQg4u5MYaEtBNNHFjkRlSpd65lp4hd2AVPTfbV7FGpyIOfmNc/XVsPfg7vzaS/3nkvLL593ANLvMuRMGpQIhiF7kUEW9QDpAUbTWYBcbp4WpacHHY1aacqQyjGZS9HI3yCBT9kUZJhVOD+zUDvEH9ddR11fzPcTDQ5TlgB0KwqdXSavk9BC0pKp0WmcuowSw07VXmXC5guzSa4p0UvRw2lbDiYUx0ExJJRzWzi6Gm8cnEkfXXsdcG/M/jAJa0+bmCgdmQ9CYlNlSYZOKixmRsgiFxkrmW4l3KdFKv1DM8tk6WxPYJZhUUzcd8Kdtgrw/gkfXXDT7+avmfVak32qhtkg6NVdUS5wgkru1YzIkSduTW1FDwVWV3JQVJVuieTc0y4iDpFwc7/BvSalvKdQM8sv662cevz/+8sQVnjVAT0W2wLllw1JiMhJRxgDjCjLQsOzSFSgZqx7lAW1JW0e03yAD3asC+GD3NbQhbe+mN5GXH1F83KDOM4n/e5JIuH4NpdQARrFPBVptUNcjj4cVMcFSRTE2NpR1LEYbYMmfWpXgP9KejaPsLUhuvLCsVXznAG9dfx9SR1ud/3hZdCLHb1GMdPqRJgqDmm76mHbvOXDtiO2QPUcKo/TWkQ0i2JFXpBoo7vij1i1Lp3ADAo+qvG3V0rM//vFnnTE4hxd5Ka/Cor5YEdsLVJyKtDgVoHgtW11pWSjolPNMnrlrVj9Fv2Qn60twMwKPqr+N/wvr8z5tZcDsDrv06tkqyzESM85Ycv6XBWA2birlNCXrI6VbD2lx2L0vQO0QVTVVLH4SE67fgsfVXv8n7sz7/85Z7cMtbE6f088wSaR4kCkCm10s6pKbJhfqiUNGLq+0gLWC6eUAZFPnLjwqtKd8EwGvWX59t7iPW4X/eAN1svgRVSY990YZg06BD1ohLMtyFTI4pKTJsS9xREq9EOaPWiO2gpms7397x6nQJkbh+Fz2q/rqRROX6/M8bJrqlVW4l6JEptKeUFuMYUbtCQ7CIttpGc6MY93x1r1vgAnRXvY5cvwWPqb9uWQm+lP95QxdNMeWhOq1x0Db55C7GcUv2ZUuN6n8iKzsvOxibC//Yfs9Na8r2Rlz02vXXDT57FP/zJi66/EJSmsJKa8QxnoqW3VLQ+jZVUtJwJ8PNX1NQCwfNgdhhHD9on7PdRdrdGPF28rJr1F+3LBdeyv+8yYfLoMYet1vX4upNAjVvwOUWnlNXJXlkzk5Il6kqeoiL0C07qno+/CYBXq/+utlnsz7/Mzvy0tmI4zm4ag23PRN3t/CWryoUVJGm+5+K8RJ0V8Hc88/XHUX/HfiAq7t+BH+x6v8t438enWmdJwFA6ZINriLGKv/95f8lT9/FnyA1NMVEvQyaXuu+gz36f/DD73E4pwqpLcvm/o0Vle78n//+L/NPvoefp1pTJye6e4A/D082FERa5/opeH9zpvh13cNm19/4v/LDe5xMWTi8I0Ta0qKlK27AS/v3/r+/x/2GO9K2c7kVMonDpq7//jc5PKCxeNPpFVzaRr01wF8C4Pu76hXuX18H4LduTr79guuFD3n5BHfI+ZRFhY8w29TYhbbLi/bvBdqKE4fUgg1pBKnV3FEaCWOWyA+m3WpORZr/j+9TKJtW8yBTF2/ZEODI9/QavHkVdGFp/Pjn4Q+u5hXapsP5sOH+OXXA1LiKuqJxiMNbhTkbdJTCy4llEt6NnqRT4dhg1V3nbdrm6dYMecA1yTOL4PWTE9L5VzPFlLBCvlG58AhehnN4uHsAYinyJ+AZ/NkVvELbfOBUuOO5syBIEtiqHU1k9XeISX5bsimrkUUhnGDxourN8SgUsCZVtKyGbyGzHXdjOhsAvOAswSRyIBddRdEZWP6GZhNK/yjwew9ehBo+3jEADu7Ay2n8mDc+TS7awUHg0OMzR0LABhqLD4hJEh/BEGyBdGlSJoXYXtr+3HS4ijzVpgi0paWXtdruGTknXBz+11qT1Q2inxaTzQCO46P3lfLpyS4fou2PH/PupwZgCxNhGlj4IvUuWEsTkqMWm6i4xCSMc9N1RDQoCVcuGItJ/MRWefais+3synowi/dESgJjkilnWnBTGvRWmaw8oR15257t7CHmCf8HOn7cwI8+NQBXMBEmAa8PMRemrNCEhLGEhDQKcGZWS319BX9PFBEwGTbRBhLbDcaV3drFcDqk5kCTd2JF1Wp0HraqBx8U0wwBTnbpCadwBA/gTH/CDrcCs93LV8E0YlmmcyQRQnjBa8JESmGUfIjK/7fkaDJpmD2QptFNVJU1bbtIAjjWQizepOKptRjbzR9Kag6xZmMLLjHOtcLT3Tx9o/0EcTT1XN3E45u24AiwEypDJXihKjQxjLprEwcmRKclaDNZCVqr/V8mYWyFADbusiY5hvgFoU2vio49RgJLn5OsReRFN6tabeetiiy0V7KFHT3HyZLx491u95sn4K1QQSPKM9hNT0wMVvAWbzDSVdrKw4zRjZMyJIHkfq1VAVCDl/bUhNKlGq0zGr05+YAceXVPCttVk0oqjVwMPt+BBefx4yPtGVkUsqY3CHDPiCM5ngupUwCdbkpd8kbPrCWHhkmtIKLEetF2499eS1jZlIPGYnlcPXeM2KD9vLS0bW3ktYNqUllpKLn5ZrsxlIzxvDu5eHxzGLctkZLEY4PgSOg2IUVVcUONzUDBEpRaMoXNmUc0tFZrTZquiLyKxrSm3DvIW9Fil+AkhXu5PhEPx9mUNwqypDvZWdKlhIJQY7vn2OsnmBeOWnYZ0m1iwbbw1U60by5om47iHRV6fOgzjMf/DAZrlP40Z7syxpLK0lJ0gqaAK1c2KQKu7tabTXkLFz0sCftuwX++MyNeNn68k5Buq23YQhUh0SNTJa1ioQ0p4nUG2y0XilF1JqODqdImloPS4Bp111DEWT0jJjVv95uX9BBV7eB3bUWcu0acSVM23YZdd8R8UbQUxJ9wdu3oMuhdt929ME+mh6JXJ8di2RxbTi6TbrDquqV4aUKR2iwT6aZbyOwEXN3DUsWr8Hn4EhwNyHuXHh7/pdaUjtR7vnDh/d8c9xD/s5f501eQ1+CuDiCvGhk1AN/4Tf74RfxPwD3toLarR0zNtsnPzmS64KIRk861dMWCU8ArasG9T9H0ZBpsDGnjtAOM2+/LuIb2iIUGXNgl5ZmKD/Tw8TlaAuihaFP5yrw18v4x1898zIdP+DDAX1bM3GAMvPgRP/cJn3zCW013nrhHkrITyvYuwOUkcHuKlRSW5C6rzIdY4ppnF7J8aAJbQepgbJYBjCY9usGXDKQxq7RZfh9eg5d1UHMVATRaD/4BHK93/1iAgYZ/+jqPn8Dn4UExmWrpa3+ZOK6MvM3bjwfzxNWA2dhs8+51XHSPJiaAhGSpWevEs5xHLXcEGFXYiCONySH3fPWq93JIsBiSWvWyc3CAN+EcXoT7rCSANloPPoa31rt/5PUA/gp8Q/jDD3hyrjzlR8VkanfOvB1XPubt17vzxAfdSVbD1pzAnfgyF3ycadOTOTXhpEUoLC1HZyNGW3dtmjeXgr2r56JNmRwdNNWaQVBddd6rh4MhviEB9EFRD/7RGvePvCbwAL4Mx/D6M541hHO4D3e7g6PafdcZVw689z7NGTwo5om7A8sPhccT6qKcl9NJl9aM/9kX+e59Hh1yPqGuCCZxuITcsmNaJ5F7d0q6J3H48TO1/+M57085q2icdu2U+W36Ldllz9Agiv4YGljoEN908EzvDOrBF98/vtJwCC/BF2AG75xxEmjmMIcjxbjoaxqOK3/4hPOZzhMPBpYPG44CM0dTVm1LjLtUWWVz1Bcf8tEx0zs8O2A2YVHRxKYOiy/aOVoAaMu0i7ubu43njjmd4ibMHU1sIDHaQNKrZND/FZYdk54oCXetjq7E7IVl9eAL7t+oHnwXXtLx44czzoRFHBztYVwtH1d+NOMkupZ5MTM+gUmq90X+Bh9zjRlmaQ+m7YMqUL/veemcecAtOJ0yq1JnVlN27di2E0+Klp1tAJ4KRw1eMI7aJjsO3R8kPSI3fUFXnIOfdQe86sIIVtWDL7h//Ok6vj8vwDk08NEcI8zz7OhBy+WwalzZeZ4+0XniRfst9pAJqQHDGLzVQ2pheZnnv1OWhwO43/AgcvAEXEVVpa4db9sGvNK8wjaENHkfFQ4Ci5i7dqnQlPoLQrHXZDvO3BIXZbJOBrOaEbML6sFL798I4FhKihjHMsPjBUZYCMFr6nvaArxqXPn4lCa+cHfSa2cP27g3Z3ziYTRrcbQNGLQmGF3F3cBdzzzX7AILx0IB9rbwn9kx2G1FW3Inic+ZLIsVvKR8Zwfj0l1fkqo8LWY1M3IX14OX3r9RKTIO+d9XzAI8qRPGPn/4NC2n6o4rN8XJ82TOIvuVA8zLKUHRFgBCetlDZlqR1gLKjS39xoE7Bt8UvA6BxuEDjU3tFsEijgA+615tmZkXKqiEENrh41iLDDZNq4pKTWR3LZfnos81LOuNa15cD956vLMsJd1rqYp51gDUQqMYm2XsxnUhD2jg1DM7SeuJxxgrmpfISSXVIJIS5qJJSvJPEQ49DQTVIbYWJ9QWa/E2+c/oPK1drmC7WSfJRNKBO5Yjvcp7Gc3dmmI/Xh1kDTEuiSnWqQf37h+fTMhGnDf6dsS8SQfQWlqqwXXGlc/PEZ/SC5mtzIV0nAshlQdM/LvUtYutrEZ/Y+EAFtq1k28zQhOwLr1AIeANzhF8t9qzTdZf2qRKO6MWE9ohBYwibbOmrFtNmg3mcS+tB28xv2uKd/agYCvOP+GkSc+0lr7RXzyufL7QbkUpjLjEWFLqOIkAGu2B0tNlO9Eau2W1qcOUvVRgKzypKIQZ5KI3q0MLzqTNRYqiZOqmtqloIRlmkBHVpHmRYV6/HixbO6UC47KOFJnoMrVyr7wYz+SlW6GUaghYbY1I6kkxA2W1fSJokUdSh2LQ1GAimRGm0MT+uu57H5l7QgOWxERpO9moLRPgTtquWCfFlGlIjQaRly9odmzMOWY+IBO5tB4sW/0+VWGUh32qYk79EidWKrjWuiLpiVNGFWFRJVktyeXWmbgBBzVl8anPuXyNJlBJOlKLTgAbi/EYHVHxWiDaVR06GnHQNpJcWcK2jJtiCfG2sEHLzuI66sGrMK47nPIInPnu799935aOK2cvmvubrE38ZzZjrELCmXM2hM7UcpXD2oC3+ECVp7xtIuxptJ0jUr3sBmBS47TVxlvJ1Sqb/E0uLdvLj0lLr29ypdd/eMX3f6lrxGlKwKQxEGvw0qHbkbwrF3uHKwVENbIV2wZ13kNEF6zD+x24aLNMfDTCbDPnEikZFyTNttxWBXDaBuM8KtI2rmaMdUY7cXcUPstqTGvBGSrFWIpNMfbdea990bvAOC1YX0qbc6smDS1mPxSJoW4fwEXvjMmhlijDRq6qale6aJEuFGoppYDoBELQzLBuh/mZNx7jkinv0EtnUp50lO9hbNK57lZaMAWuWR5Yo9/kYwcYI0t4gWM47Umnl3YmpeBPqSyNp3K7s2DSAS/39KRuEN2bS4xvowV3dFRMx/VFcp2Yp8w2nTO9hCXtHG1kF1L4KlrJr2wKfyq77R7MKpFKzWlY9UkhYxyHWW6nBWPaudvEAl3CGcNpSXPZ6R9BbBtIl6cHL3gIBi+42CYXqCx1gfGWe7Ap0h3luyXdt1MKy4YUT9xSF01G16YEdWsouW9mgDHd3veyA97H+Ya47ZmEbqMY72oPztCGvK0onL44AvgC49saZKkWRz4veWljE1FHjbRJaWv6ZKKtl875h4CziFCZhG5rx7tefsl0aRT1bMHZjm8dwL/6u7wCRysaQblQoG5yAQN5zpatMNY/+yf8z+GLcH/Qn0iX2W2oEfXP4GvwQHuIL9AYGnaO3zqAX6946nkgqZNnUhx43DIdQtMFeOPrgy/y3Yd85HlJWwjLFkU3kFwq28xPnuPhMWeS+tDLV9Otllq7pQCf3uXJDN9wFDiUTgefHaiYbdfi3b3u8+iY6TnzhgehI1LTe8lcd7s1wJSzKbahCRxKKztTLXstGAiu3a6rPuQs5pk9TWAan5f0BZmGf7Ylxzzk/A7PAs4QPPPAHeFQ2hbFHszlgZuKZsJcUmbDC40sEU403cEjczstOEypa+YxevL4QBC8oRYqWdK6b7sK25tfE+oDZgtOQ2Jg8T41HGcBE6fTWHn4JtHcu9S7uYgU5KSCkl/mcnq+5/YBXOEr6lCUCwOTOM1taOI8mSxx1NsCXBEmLKbMAg5MkwbLmpBaFOPrNSlO2HnLiEqW3tHEwd8AeiQLmn+2gxjC3k6AxREqvKcJbTEzlpLiw4rNZK6oJdidbMMGX9FULKr0AkW+2qDEPBNNm5QAt2Ik2nftNWHetubosHLo2nG4vQA7GkcVCgVCgaDixHqo9UUn1A6OshapaNR/LPRYFV8siT1cCtJE0k/3WtaNSuUZYKPnsVIW0xXWnMUxq5+En4Kvw/MqQmVXnAXj9Z+9zM98zM/Agy7F/qqj2Nh67b8HjFnPP3iBn/tkpdzwEJX/whIcQUXOaikeliCRGUk7tiwF0rItwMEhjkZ309hikFoRAmLTpEXWuHS6y+am/KB/fM50aLEhGnSMwkpxzOov4H0AvgovwJ1iGzDLtJn/9BU+fAINfwUe6FHSLhu83viV/+/HrOePX+STT2B9uWGbrMHHLldRBlhS/CJQmcRxJFqZica01XixAZsYiH1uolZxLrR/SgxVIJjkpQP4PE9sE59LKLr7kltSBogS5tyszzH8Fvw8/AS8rNOg0xUS9fIaHwb+6et8Q/gyvKRjf5OusOzGx8evA/BP4IP11uN/grca5O0lcsPLJ5YjwI4QkJBOHa0WdMZYGxPbh2W2nR9v3WxEWqgp/G3+6VZbRLSAAZ3BhdhAaUL33VUSw9yjEsvbaQ9u4A/gGXwZXoEHOuU1GSj2chf+Mo+f8IcfcAxfIKVmyunRbYQVnoevwgfw3TXXcw++xNuP4fhyueEUNttEduRVaDttddoP0eSxLe2LENk6itYxlrxBNBYrNNKSQmeaLcm9c8UsaB5WyO6675yyQIAWSDpBVoA/gxmcwEvwoDv0m58UE7gHn+fJOa8/Ywan8EKRfjsopF83eCglX/Sfr7OeaRoQfvt1CGvIDccH5BCvw1sWIzRGC/66t0VTcLZQZtm6PlAasbOJ9iwWtUo7biktTSIPxnR24jxP1ZKaqq+2RcXM9OrBAm/AAs7hDJ5bNmGb+KIfwCs8a3jnjBrOFeMjHSCdbKr+2uOLfnOd9eiA8Hvvwwq54VbP2OqwkB48Ytc4YEOiH2vTXqodabfWEOzso4qxdbqD5L6tbtNPECqbhnA708DZH4QOJUXqScmUlks7Ot6FBuZw3n2mEbaUX7kDzxHOOQk8nKWMzAzu6ZZ8sOFw4RK+6PcuXo9tB4SbMz58ApfKDXf3szjNIIbGpD5TKTRxGkEMLjLl+K3wlWXBsCUxIDU+jbOiysESqAy1MGUJpXgwbTWzNOVEziIXZrJ+VIztl1PUBxTSo0dwn2bOmfDRPD3TRTGlfbCJvO9KvuhL1hMHhB9wPuPRLGHcdOWG2xc0U+5bQtAJT0nRTewXL1pgk2+rZAdeWmz3jxAqfNQQdzTlbF8uJ5ecEIWvTkevAHpwz7w78QujlD/Lr491bD8/1vhM2yrUQRrWXNQY4fGilfctMWYjL72UL/qS9eiA8EmN88nbNdour+PBbbAjOjIa4iBhfFg6rxeKdEGcL6p3EWR1Qq2Qkhs2DrnkRnmN9tG2EAqmgPw6hoL7Oza7B+3SCrR9tRftko+Lsf2F/mkTndN2LmzuMcKTuj/mX2+4Va3ki16+nnJY+S7MefpkidxwnV+4wkXH8TKnX0tsYzYp29DOOoSW1nf7nTh2akYiWmcJOuTidSaqESrTYpwjJJNVGQr+rLI7WsqerHW6Kp/oM2pKuV7T1QY9gjqlZp41/WfKpl56FV/0kvXQFRyeQ83xaTu5E8p5dNP3dUF34ihyI3GSpeCsywSh22ZJdWto9winhqifb7VRvgktxp13vyjrS0EjvrRfZ62uyqddSWaWYlwTPAtJZ2oZ3j/Sgi/mi+6vpzesfAcWNA0n8xVyw90GVFGuZjTXEQy+6GfLGLMLL523f5E0OmxVjDoOuRiH91RKU+vtoCtH7TgmvBLvtFXWLW15H9GTdVw8ow4IlRLeHECN9ym1e9K0I+Cbnhgv4Yu+aD2HaQJ80XDqOzSGAV4+4yCqBxrsJAX6ZTIoX36QnvzhhzzMfFW2dZVLOJfo0zbce5OvwXMFaZ81mOnlTVXpDZsQNuoYWveketKb5+6JOOsgX+NTm7H49fUTlx+WLuWL7qxnOFh4BxpmJx0p2gDzA/BUARuS6phR+pUsY7MMboAHx5xNsSVfVZcYSwqCKrqon7zM+8ecCkeS4nm3rINuaWvVNnMRI1IRpxTqx8PZUZ0Br/UEduo3B3hNvmgZfs9gQPj8vIOxd2kndir3awvJ6BLvoUuOfFWNYB0LR1OQJoUySKb9IlOBx74q1+ADC2G6rOdmFdJcD8BkfualA+BdjOOzP9uUhGUEX/TwhZsUduwRr8wNuXKurCixLBgpQI0mDbJr9dIqUuV+92ngkJZ7xduCk2yZKbfWrH1VBiTg9VdzsgRjW3CVXCvAwDd+c1z9dWw9+B+8MJL/eY15ZQ/HqvTwVdsZn5WQsgRRnMaWaecu3jFvMBEmgg+FJFZsnSl0zjB9OqPYaBD7qmoVyImFvzi41usesV0julaAR9dfR15Xzv9sEruRDyk1nb+QaLU67T885GTls6YgcY+UiMa25M/pwGrbCfzkvR3e0jjtuaFtnwuagHTSb5y7boBH119HXhvwP487jJLsLJ4XnUkHX5sLbS61dpiAXRoZSCrFJ+EjpeU3puVfitngYNo6PJrAigKktmwjyQdZpfq30mmtulaAx9Zfx15Xzv+cyeuiBFUs9zq8Kq+XB9a4PVvph3GV4E3y8HENJrN55H1X2p8VyqSKwVusJDKzXOZzplWdzBUFK9e+B4+uv468xvI/b5xtSAkBHQaPvtqWzllVvEOxPbuiE6+j2pvjcKsbvI7txnRErgfH7LdXqjq0IokKzga14GzQ23SSbCQvO6r+Or7SMIr/efOkkqSdMnj9mBx2DRsiY29Uj6+qK9ZrssCKaptR6HKURdwUYeUWA2kPzVKQO8ku2nU3Anhs/XWkBx3F/7wJtCTTTIKftthue1ty9xvNYLY/zo5KSbIuKbXpbEdSyeRyYdAIwKY2neyoc3+k1XUaufYga3T9daMUx/r8z1s10ITknIO0kuoMt+TB8jK0lpayqqjsJ2qtXAYwBU932zinimgmd6mTRDnQfr88q36NAI+tv24E8Pr8zxtasBqx0+xHH9HhlrwsxxNUfKOHQaZBITNf0uccj8GXiVmXAuPEAKSdN/4GLHhs/XWj92dN/uetNuBMnVR+XWDc25JLjo5Mg5IZIq226tmCsip2zZliL213YrTlL2hcFjpCduyim3M7/eB16q/blQsv5X/esDRbtJeabLIosWy3ycavwLhtxdWzbMmHiBTiVjJo6lCLjXZsi7p9PEPnsq6X6wd4bP11i0rD5fzPm/0A6brrIsllenZs0lCJlU4abakR59enZKrKe3BZihbTxlyZ2zl1+g0wvgmA166/bhwDrcn/7Ddz0eWZuJvfSESug6NzZsox3Z04FIxz0mUjMwVOOVTq1CQ0AhdbBGVdjG/CgsfUX7esJl3K/7ytWHRv683praW/8iDOCqWLLhpljDY1ZpzK75QiaZoOTpLKl60auHS/97oBXrv+umU9+FL+5+NtLFgjqVLCdbmj7pY5zPCPLOHNCwXGOcLquOhi8CmCWvbcuO73XmMUPab+ug3A6/A/78Bwe0bcS2+tgHn4J5pyS2WbOck0F51Vq3LcjhLvZ67p1ABbaL2H67bg78BfjKi/jr3+T/ABV3ilLmNXTI2SpvxWBtt6/Z//D0z/FXaGbSBgylzlsEGp+5//xrd4/ae4d8DUUjlslfIYS3t06HZpvfQtvv0N7AHWqtjP2pW08QD/FLy//da38vo8PNlKHf5y37Dxdfe/oj4kVIgFq3koLReSR76W/bx//n9k8jonZxzWTANVwEniDsg87sOSd/z7//PvMp3jQiptGVWFX2caezzAXwfgtzYUvbr0iozs32c3Uge7varH+CNE6cvEYmzbPZ9hMaYDdjK4V2iecf6EcEbdUDVUARda2KzO/JtCuDbNQB/iTeL0EG1JSO1jbXS+nLxtPMDPw1fh5+EPrgSEKE/8Gry5A73ui87AmxwdatyMEBCPNOCSKUeRZ2P6Myb5MRvgCHmA9ywsMifU+AYXcB6Xa5GibUC5TSyerxyh0j6QgLVpdyhfArRTTLqQjwe4HOD9s92D4Ap54odXAPBWLAwB02igG5Kkc+piN4lvODIFGAZgT+EO4Si1s7fjSR7vcQETUkRm9O+MXyo9OYhfe4xt9STQ2pcZRLayCV90b4D3jR0DYAfyxJ+eywg2IL7NTMXna7S/RpQ63JhWEM8U41ZyQGjwsVS0QBrEKLu8xwZsbi4wLcCT+OGidPIOCe1PiSc9Qt+go+vYqB7cG+B9d8cAD+WJPz0Am2gxXgU9IneOqDpAAXOsOltVuMzpdakJXrdPCzXiNVUpCeOos5cxnpQT39G+XVLhs1osQVvJKPZyNq8HDwd4d7pNDuWJPxVX7MSzqUDU6gfadKiNlUFTzLeFHHDlzO4kpa7aiKhBPGKwOqxsBAmYkOIpipyXcQSPlRTf+Tii0U3EJGaZsDER2qoB3h2hu0qe+NNwUooYU8y5mILbJe6OuX+2FTKy7bieTDAemaQyQ0CPthljSWO+xmFDIYiESjM5xKd6Ik5lvLq5GrQ3aCMLvmCA9wowLuWJb9xF59hVVP6O0CrBi3ZjZSNOvRy+I6klNVRJYRBaEzdN+imiUXQ8iVF8fsp+W4JXw7WISW7fDh7lptWkCwZ4d7QTXyBPfJMYK7SijjFppGnlIVJBJBYj7eUwtiP1IBXGI1XCsjNpbjENVpSAJ2hq2LTywEly3hUYazt31J8w2+aiLx3g3fohXixPfOMYm6zCGs9LVo9MoW3MCJE7R5u/WsOIjrqBoHUO0bJE9vxBpbhsd3+Nb4/vtPCZ4oZYCitNeYuC/8UDvDvy0qvkiW/cgqNqRyzqSZa/s0mqNGjtKOoTm14zZpUauiQgVfqtQiZjq7Q27JNaSK5ExRcrGCXO1FJYh6jR6CFqK7bZdQZ4t8g0rSlPfP1RdBtqaa9diqtzJkQ9duSryi2brQXbxDwbRUpFMBHjRj8+Nt7GDKgvph9okW7LX47gu0SpGnnFQ1S1lYldOsC7hYteR574ZuKs7Ei1lBsfdz7IZoxzzCVmmVqaSySzQbBVAWDek+N4jh9E/4VqZrJjPwiv9BC1XcvOWgO8275CVyBPvAtTVlDJfZkaZGU7NpqBogAj/xEHkeAuJihWYCxGN6e8+9JtSegFXF1TrhhLGP1fak3pebgPz192/8gB4d/6WT7+GdYnpH7hH/DJzzFiYPn/vjW0SgNpTNuPIZoAEZv8tlGw4+RLxy+ZjnKa5NdFoC7UaW0aduoYse6+bXg1DLg6UfRYwmhGEjqPvF75U558SANrElK/+MdpXvmqBpaXOa/MTZaa1DOcSiLaw9j0NNNst3c+63c7EKTpkvKHzu6bPbP0RkuHAVcbRY8ijP46MIbQeeT1mhA+5PV/inyDdQipf8LTvMXbwvoDy7IruDNVZKTfV4CTSRUYdybUCnGU7KUTDxLgCknqUm5aAW6/1p6eMsOYsphLzsHrE0Y/P5bQedx1F/4yPHnMB3/IOoTU9+BL8PhtjuFKBpZXnYNJxTuv+2XqolKR2UQgHhS5novuxVySJhBNRF3SoKK1XZbbXjVwWNyOjlqWJjrWJIy+P5bQedyldNScP+HZ61xKSK3jyrz+NiHG1hcOLL/+P+PDF2gOkekKGiNWKgJ+8Z/x8Iv4DdQHzcpZyF4v19I27w9/yPGDFQvmEpKtqv/TLiWMfn4sofMm9eAH8Ao0zzh7h4sJqYtxZd5/D7hkYPneDzl5idlzNHcIB0jVlQ+8ULzw/nc5/ojzl2juE0apD7LRnJxe04dMz2iOCFNtGFpTuXA5AhcTRo8mdN4kz30nVjEC4YTZQy4gpC7GlTlrePKhGsKKgeXpCYeO0MAd/GH7yKQUlXPLOasOH3FnSphjHuDvEu4gB8g66oNbtr6eMbFIA4fIBJkgayoXriw2XEDQPJrQeROAlY6aeYOcMf+IVYTU3XFlZufMHinGywaW3YLpObVBAsbjF4QJMsVUSayjk4voPsHJOQfPWDhCgDnmDl6XIRerD24HsGtw86RMHOLvVSHrKBdeVE26gKB5NKHzaIwLOmrqBWJYZDLhASG16c0Tn+CdRhWDgWXnqRZUTnPIHuMJTfLVpkoYy5CzylHVTGZMTwkGAo2HBlkQplrJX6U+uF1wZz2uwS1SQ12IqWaPuO4baZaEFBdukksJmkcTOm+YJSvoqPFzxFA/YUhIvWxcmSdPWTWwbAKVp6rxTtPFUZfKIwpzm4IoMfaYQLWgmlG5FME2gdBgm+J7J+rtS/XBbaVLsR7bpPQnpMFlo2doWaVceHk9+MkyguZNCJ1He+kuHTWyQAzNM5YSUg/GlTk9ZunAsg1qELVOhUSAK0LABIJHLKbqaEbHZLL1VA3VgqoiOKXYiS+HRyaEKgsfIqX64HYWbLRXy/qWoylIV9gudL1OWBNgBgTNmxA6b4txDT4gi3Ri7xFSLxtXpmmYnzAcWDZgY8d503LFogz5sbonDgkKcxGsWsE1OI+rcQtlgBBCSOKD1mtqYpIU8cTvBmAT0yZe+zUzeY92fYjTtGipXLhuR0ePoHk0ofNWBX+lo8Z7pAZDk8mEw5L7dVyZZoE/pTewbI6SNbiAL5xeygW4xPRuLCGbhcO4RIeTMFYHEJkYyEO9HmJfXMDEj/LaH781wHHZEtqSQ/69UnGpzH7LKIAZEDSPJnTesJTUa+rwTepI9dLJEawYV+ZkRn9g+QirD8vF8Mq0jFQ29js6kCS3E1+jZIhgPNanHdHFqFvPJLHqFwQqbIA4jhDxcNsOCCQLDomaL/dr5lyJaJU6FxPFjO3JOh3kVMcROo8u+C+jo05GjMF3P3/FuDLn5x2M04xXULPwaS6hBYki+MrMdZJSgPHlcB7nCR5bJ9Kr5ACUn9jk5kivdd8tk95SOGrtqu9lr2IhK65ZtEl7ZKrp7DrqwZfRUSN1el7+7NJxZbywOC8neNKTch5vsTEMNsoCCqHBCqIPRjIPkm0BjvFODGtto99rCl+d3wmHkW0FPdpZtC7MMcVtGFQjJLX5bdQ2+x9ypdc313uj8xlsrfuLgWXz1cRhZvJYX0iNVBRcVcmCXZs6aEf3RQF2WI/TcCbKmGU3IOoDJGDdDub0+hYckt6PlGu2BcxmhbTdj/klhccLGJMcqRjMJP1jW2ETqLSWJ/29MAoORluJ+6LPffBZbi5gqi5h6catQpmOT7/OFf5UorRpLzCqcMltBLhwd1are3kztrSzXO0LUbXRQcdLh/RdSZ+swRm819REDrtqzC4es6Gw4JCKlSnjYVpo0xeq33PrADbFLL3RuCmObVmPN+24kfa+AojDuM4umKe2QwCf6EN906HwjujaitDs5o0s1y+k3lgbT2W2i7FJdnwbLXhJUBq/9liTctSmFC/0OqUinb0QddTWamtjbHRFuWJJ6NpqZ8vO3fZJ37Db+2GkaPYLGHs7XTTdiFQJ68SkVJFVmY6McR5UycflNCsccHFaV9FNbR4NttLxw4pQ7wJd066Z0ohVbzihaxHVExd/ay04oxUKWt+AsdiQ9OUyZ2krzN19IZIwafSTFgIBnMV73ADj7V/K8u1MaY2sJp2HWm0f41tqwajEvdHWOJs510MaAqN4aoSiPCXtN2KSi46dUxHdaMquar82O1x5jqhDGvqmoE9LfxcY3zqA7/x3HA67r9ZG4O6Cuxu12/+TP+eLP+I+HErqDDCDVmBDO4larujNe7x8om2rMug0MX0rL1+IWwdwfR+p1TNTyNmVJ85ljWzbWuGv8/C7HD/izjkHNZNYlhZcUOKVzKFUxsxxN/kax+8zPWPSFKw80rJr9Tizyj3o1gEsdwgWGoxPezDdZ1TSENE1dLdNvuKL+I84nxKesZgxXVA1VA1OcL49dFlpFV5yJMhzyCmNQ+a4BqusPJ2bB+xo8V9u3x48VVIEPS/mc3DvAbXyoYr6VgDfh5do5hhHOCXMqBZUPhWYbWZECwVJljLgMUWOCB4MUuMaxGNUQDVI50TQ+S3kFgIcu2qKkNSHVoM0SHsgoZxP2d5HH8B9woOk4x5bPkKtAHucZsdykjxuIpbUrSILgrT8G7G5oCW+K0990o7E3T6AdW4TilH5kDjds+H64kS0mz24grtwlzDHBJqI8YJQExotPvoC4JBq0lEjjQkyBZ8oH2LnRsQ4Hu1QsgDTJbO8fQDnllitkxuVskoiKbRF9VwzMDvxHAdwB7mD9yCplhHFEyUWHx3WtwCbSMMTCUCcEmSGlg4gTXkHpZXWQ7kpznK3EmCHiXInqndkQjunG5kxTKEeGye7jWz9cyMR2mGiFQ15ENRBTbCp+Gh86vAyASdgmJq2MC6hoADQ3GosP0QHbnMHjyBQvQqfhy/BUbeHd5WY/G/9LK/8Ka8Jd7UFeNWEZvzPb458Dn8DGLOe3/wGL/4xP+HXlRt+M1PE2iLhR8t+lfgxsuh7AfO2AOf+owWhSZRYQbd622hbpKWKuU+XuvNzP0OseRDa+mObgDHJUSc/pKx31QdKffQ5OIJpt8GWjlgTwMc/w5MPCR/yl1XC2a2Yut54SvOtMev55Of45BOat9aWG27p2ZVORRvnEk1hqWMVUmqa7S2YtvlIpspuF1pt0syuZS2NV14mUidCSfzQzg+KqvIYCMljIx2YK2AO34fX4GWdu5xcIAb8MzTw+j/lyWM+Dw/gjs4GD6ehNgA48kX/AI7XXM/XAN4WHr+9ntywqoCakCqmKP0rmQrJJEErG2Upg1JObr01lKQy4jskWalKYfJ/EDLMpjNSHFEUAde2fltaDgmrNaWQ9+AAb8I5vKjz3L1n1LriB/BXkG/wwR9y/oRX4LlioHA4LzP2inzRx/DWmutRweFjeP3tNeSGlaE1Fde0OS11yOpmbIp2u/jF1n2RRZviJM0yBT3IZl2HWImKjQOxIyeU325b/qWyU9Moj1o07tS0G7qJDoGHg5m8yeCxMoEH8GU45tnrNM84D2l297DQ9t1YP7jki/7RmutRweEA77/HWXOh3HCxkRgldDQkAjNTMl2Iloc1qN5JfJeeTlyTRzxURTdn1Ixv2uKjs12AbdEWlBtmVdk2k7FFwj07PCZ9XAwW3dG+8xKzNFr4EnwBZpy9Qzhh3jDXebBpYcpuo4fQ44u+fD1dweEnHzI7v0xuuOALRUV8rXpFyfSTQYkhd7IHm07jpyhlkCmI0ALYqPTpUxXS+z4jgDj1Pflvmz5ecuItpIBxyTHpSTGWd9g1ApfD/bvwUhL4nT1EzqgX7cxfCcNmb3mPL/qi9SwTHJ49oj5ZLjccbTG3pRmlYi6JCG0mQrAt1+i2UXTZ2dv9IlQpN5naMYtviaXlTrFpoMsl3bOAFEa8sqPj2WCMrx3Yjx99qFwO59Aw/wgx+HlqNz8oZvA3exRDvuhL1jMQHPaOJ0+XyA3fp1OfM3qObEVdhxjvynxNMXQV4+GJyvOEFqeQBaIbbO7i63rpxCltdZShPFxkjM2FPVkn3TG+Rp9pO3l2RzFegGfxGDHIAh8SteR0C4HopXzRF61nheDw6TFN05Ebvq8M3VKKpGjjO6r7nhudTEGMtYM92HTDaR1FDMXJ1eThsbKfywyoWwrzRSXkc51flG3vIid62h29bIcFbTGhfV+faaB+ohj7dPN0C2e2lC96+XouFByen9AsunLDJZ9z7NExiUc0OuoYW6UZkIyx2YUR2z6/TiRjyKMx5GbbjLHvHuf7YmtKghf34LJfx63Yg8vrvN2zC7lY0x0tvKezo4HmGYDU+Gab6dFL+KI761lDcNifcjLrrr9LWZJctG1FfU1uwhoQE22ObjdfkSzY63CbU5hzs21WeTddH2BaL11Gi7lVdlxP1nkxqhnKhVY6knS3EPgVGg1JpN5cP/hivujOelhXcPj8HC/LyI6MkteVjlolBdMmF3a3DbsuAYhL44dxzthWSN065xxUd55Lmf0wRbOYOqH09/o9WbO2VtFdaMb4qBgtFJoT1SqoN8wPXMoXLb3p1PUEhxfnnLzGzBI0Ku7FxrKsNJj/8bn/H8fPIVOd3rfrklUB/DOeO+nkghgSPzrlPxluCMtOnDL4Yml6dK1r3vsgMxgtPOrMFUZbEUbTdIzii5beq72G4PD0DKnwjmBULUVFmy8t+k7fZ3pKc0Q4UC6jpVRqS9Umv8bxw35flZVOU1X7qkjnhZlsMbk24qQ6Hz7QcuL6sDC0iHHki96Uh2UdvmgZnjIvExy2TeJdMDZNSbdZyAHe/Yd1xsQhHiKzjh7GxQ4yqMPaywPkjMamvqrYpmO7Knad+ZQC5msCuAPWUoxrxVhrGv7a+KLXFhyONdTMrZ7ke23qiO40ZJUyzgYyX5XyL0mV7NiUzEs9mjtbMN0dERqwyAJpigad0B3/zRV7s4PIfXSu6YV/MK7+OrYe/JvfGMn/PHJe2fyUdtnFrKRNpXV0Y2559aWPt/G4BlvjTMtXlVIWCnNyA3YQBDmYIodFz41PvXPSa6rq9lWZawZ4dP115HXV/M/tnFkkrBOdzg6aP4pID+MZnTJ1SuuB6iZlyiox4HT2y3YBtkUKWooacBQUDTpjwaDt5poBHl1/HXltwP887lKKXxNUEyPqpGTyA699UqY/lt9yGdlUKra0fFWS+36iylVWrAyd7Uw0CZM0z7xKTOduznLIjG2Hx8cDPLb+OvK6Bv7n1DYci4CxUuRxrjBc0bb4vD3rN5Zz36ntLb83eVJIB8LiIzCmn6SMPjlX+yNlTjvIGjs+QzHPf60Aj62/jrzG8j9vYMFtm1VoRWCJdmw7z9N0t+c8cxZpPeK4aTRicS25QhrVtUp7U578chk4q04Wx4YoQSjFryUlpcQ1AbxZ/XVMknIU//OGl7Q6z9Zpxi0+3yFhSkjUDpnCIUhLWVX23KQ+L9vKvFKI0ZWFQgkDLvBoylrHNVmaw10zwCPrr5tlodfnf94EWnQ0lFRWy8pW9LbkLsyUVDc2NSTHGDtnD1uMtchjbCeb1mpxFP0YbcClhzdLu6lfO8Bj6q+bdT2sz/+8SZCV7VIxtt0DUn9L7r4cLYWDSXnseEpOGFuty0qbOVlS7NNzs5FOGJUqQpl2Q64/yBpZf90sxbE+//PGdZ02HSipCbmD6NItmQ4Lk5XUrGpDMkhbMm2ZVheNYV+VbUWTcv99+2NyX1VoafSuC+AN6q9bFIMv5X/eagNWXZxEa9JjlMwNWb00akGUkSoepp1/yRuuqHGbUn3UdBSTxBU6SEVklzWRUkPndVvw2PrrpjvxOvzPmwHc0hpmq82npi7GRro8dXp0KXnUQmhZbRL7NEVp1uuZmO45vuzKsHrktS3GLWXODVjw+vXXLYx4Hf7njRPd0i3aoAGX6W29GnaV5YdyDj9TFkakje7GHYzDoObfddHtOSpoi2SmzJHrB3hM/XUDDEbxP2/oosszcRlehWXUvzHv4TpBVktHqwenFo8uLVmy4DKLa5d3RtLrmrM3aMFr1183E4sewf+85VWeg1c5ag276NZrM9IJVNcmLEvDNaV62aq+14IAOGFsBt973Ra8Xv11YzXwNfmft7Jg2oS+XOyoC8/cwzi66Dhmgk38kUmP1CUiYWOX1bpD2zWXt2FCp7uq8703APAa9dfNdscR/M/bZLIyouVxqJfeWvG9Je+JVckHQ9+CI9NWxz+blX/KYYvO5n2tAP/vrlZ7+8/h9y+9qeB/Hnt967e5mevX10rALDWK//FaAT5MXdBXdP0C/BAes792c40H+AiAp1e1oH8HgH94g/Lttx1gp63op1eyoM/Bvw5/G/7xFbqJPcCXnmBiwDPb/YKO4FX4OjyCb289db2/Noqicw4i7N6TVtoz8tNwDH+8x/i6Ae7lmaQVENzJFb3Di/BFeAwz+Is9SjeQySpPqbLFlNmyz47z5a/AF+AYFvDmHqibSXTEzoT4Gc3OALaqAP4KPFUJ6n+1x+rGAM6Zd78bgJ0a8QN4GU614vxwD9e1Amy6CcskNrczLx1JIp6HE5UZD/DBHrFr2oNlgG4Odv226BodoryjGJ9q2T/AR3vQrsOCS0ctXZi3ruLlhpFDJYl4HmYtjQCP9rhdn4suySLKDt6wLcC52h8xPlcjju1fn+yhuw4LZsAGUuo2b4Fx2UwQu77uqRHXGtg92aN3tQCbFexc0uk93vhTXbct6y7MulLycoUljx8ngDMBg1tvJjAazpEmOtxlzclvj1vQf1Tx7QlPDpGpqgtdSKz/d9/hdy1vTfFHSmC9dGDZbLiezz7Ac801HirGZsWjydfZyPvHXL/Y8Mjzg8BxTZiuwKz4Eb8sBE9zznszmjvFwHKPIWUnwhqfVRcd4Ck0K6ate48m1oOfrX3/yOtvAsJ8zsPAM89sjnddmuLuDPjX9Bu/L7x7xpMzFk6nWtyQfPg278Gn4Aekz2ZgOmU9eJ37R14vwE/BL8G3aibCiWMWWDQ0ZtkPMnlcGeAu/Ag+8ZyecU5BPuy2ILD+sQqyZhAKmn7XZd+jIMTN9eBL7x95xVLSX4On8EcNlXDqmBlqS13jG4LpmGbkF/0CnOi3H8ETOIXzmnmtb0a16Tzxj1sUvQCBiXZGDtmB3KAefPH94xcUa/6vwRn80GOFyjEXFpba4A1e8KQfFF+259tx5XS4egYn8fQsLGrqGrHbztr+uByTahWuL1NUGbDpsnrwBfePPwHHIf9X4RnM4Z2ABWdxUBlqQ2PwhuDxoS0vvqB1JzS0P4h2nA/QgTrsJFn+Y3AOjs9JFC07CGWX1oNX3T/yHOzgDjwPn1PM3g9Jk9lZrMEpxnlPmBbjyo2+KFXRU52TJM/2ALcY57RUzjObbjqxVw++4P6RAOf58pcVsw9Daje3htriYrpDOonre3CudSe6bfkTEgHBHuDiyu5MCsc7BHhYDx7ePxLjqigXZsw+ijMHFhuwBmtoTPtOxOrTvYJDnC75dnUbhfwu/ZW9AgYd+peL68HD+0emKquiXHhWjJg/UrkJYzuiaL3E9aI/ytrCvAd4GcYZMCkSQxfUg3v3j8c4e90j5ZTPdvmJJGHnOCI2nHS8081X013pHuBlV1gB2MX1YNmWLHqqGN/TWmG0y6clJWthxNUl48q38Bi8vtMKyzzpFdSDhxZ5WBA5ZLt8Jv3895DduBlgbPYAj8C4B8hO68FDkoh5lydC4FiWvBOVqjYdqjiLv92t8yPDjrDaiHdUD15qkSURSGmXJwOMSxWAXYwr3zaAufJ66l+94vv3AO+vPcD7aw/w/toDvL/2AO+vPcD7aw/wHuD9tQd4f+0B3l97gPfXHuD9tQd4f+0B3l97gG8LwP8G/AL8O/A5OCq0Ys2KIdv/qOIXG/4mvFAMF16gZD+2Xvu/B8as5+8bfllWyg0zaNO5bfXj6vfhhwD86/Aq3NfRS9t9WPnhfnvCIw/CT8GLcFTMnpntdF/z9V+PWc/vWoIH+FL3Znv57PitcdGP4R/C34avw5fgRVUInCwbsn1yyA8C8zm/BH8NXoXnVE6wVPjdeCI38kX/3+Ct9dbz1pTmHFRu+Hm4O9Ch3clr99negxfwj+ER/DR8EV6B5+DuQOnTgUw5rnkY+FbNU3gNXh0o/JYTuWOvyBf9FvzX663HH/HejO8LwAl8Hl5YLTd8q7sqA3wbjuExfAFegQdwfyDoSkWY8swzEf6o4Qyewefg+cHNbqMQruSL/u/WWc+E5g7vnnEXgDmcDeSGb/F4cBcCgT+GGRzDU3hZYburAt9TEtHgbM6JoxJ+6NMzzTcf6c2bycv2+KK/f+l6LBzw5IwfqZJhA3M472pWT/ajKxnjv4AFnMEpnBTPND6s2J7qHbPAqcMK74T2mZ4VGB9uJA465It+/eL1WKhYOD7xHOkr1ajK7d0C4+ke4Hy9qXZwpgLr+Znm/uNFw8xQOSy8H9IzjUrd9+BIfenYaylf9FsXr8fBAadnPIEDna8IBcwlxnuA0/Wv6GAWPd7dDIKjMdSWueAsBj4M7TOd06qBbwDwKr7oleuxMOEcTuEZTHWvDYUO7aHqAe0Bbq+HEFRzOz7WVoTDQkVds7A4sIIxfCQdCefFRoIOF/NFL1mPab/nvOakSL/Q1aFtNpUb/nFOVX6gzyg/1nISyDfUhsokIzaBR9Kxm80s5mK+6P56il1jXic7nhQxsxSm3OwBHl4fFdLqi64nDQZvqE2at7cWAp/IVvrN6/BFL1mPhYrGMBfOi4PyjuSGf6wBBh7p/FZTghCNWGgMzlBbrNJoPJX2mW5mwZfyRffXo7OFi5pZcS4qZUrlViptrXtw+GQoyhDPS+ANjcGBNRiLCQDPZPMHuiZfdFpPSTcQwwKYdRNqpkjm7AFeeT0pJzALgo7g8YYGrMHS0iocy+YTm2vyRUvvpXCIpQ5pe666TJrcygnScUf/p0NDs/iAI/nqDHC8TmQT8x3NF91l76oDdQGwu61Z6E0ABv7uO1dbf/37Zlv+Zw/Pbh8f1s4Avur6657/+YYBvur6657/+YYBvur6657/+YYBvur6657/+aYBvuL6657/+VMA8FXWX/f8zzcN8BXXX/f8zzcNMFdbf93zP38KLPiK6697/uebtuArrr/u+Z9vGmCusP6653/+1FjwVdZf9/zPN7oHX339dc//fNMu+irrr3v+50+Bi+Zq6697/uebA/jz8Pudf9ht/fWv517J/XUzAP8C/BAeX9WCDrUpZ3/dEMBxgPcfbtTVvsYV5Yn32u03B3Ac4P3b8I+vxNBKeeL9dRMAlwO83959qGO78sT769oB7g3w/vGVYFzKE++v6wV4OMD7F7tckFkmT7y/rhHgpQO8b+4Y46XyxPvrugBeNcB7BRiX8sT767oAvmCA9woAHsoT76+rBJjLBnh3txOvkifeX1dswZcO8G6N7sXyxPvr6i340gHe3TnqVfLE++uKAb50gHcXLnrX8sR7gNdPRqwzwLu7Y/FO5Yn3AK9jXCMGeHdgxDuVJ75VAI8ljP7PAb3/RfjcZfePHBB+79dpfpH1CanN30d+mT1h9GqAxxJGM5LQeeQ1+Tb+EQJrElLb38VHQ94TRq900aMIo8cSOo+8Dp8QfsB8zpqE1NO3OI9Zrj1h9EV78PqE0WMJnUdeU6E+Jjyk/hbrEFIfeWbvId8H9oTRFwdZaxJGvziW0Hn0gqYB/wyZ0PwRlxJST+BOw9m77Amj14ii1yGM/txYQudN0qDzGe4EqfA/5GJCagsHcPaEPWH0esekSwmjRxM6b5JEcZ4ww50ilvAOFxBSx4yLW+A/YU8YvfY5+ALC6NGEzhtmyZoFZoarwBLeZxUhtY4rc3bKnjB6TKJjFUHzJoTOozF2YBpsjcyxDgzhQ1YRUse8+J4wenwmaylB82hC5w0zoRXUNXaRBmSMQUqiWSWkLsaVqc/ZE0aPTFUuJWgeTei8SfLZQeMxNaZSIzbII4aE1Nmr13P2hNHjc9E9guYNCZ032YlNwESMLcZiLQHkE4aE1BFg0yAR4z1h9AiAGRA0jyZ03tyIxWMajMPWBIsxYJCnlITU5ShiHYdZ94TR4wCmSxg9jtB5KyPGYzymAYexWEMwAPIsAdYdV6aObmNPGD0aYLoEzaMJnTc0Ygs+YDw0GAtqxBjkuP38bMRWCHn73xNGjz75P73WenCEJnhwyVe3AEe8TtKdJcYhBl97wuhNAObK66lvD/9J9NS75v17wuitAN5fe4D31x7g/bUHeH/tAd5fe4D3AO+vPcD7aw/w/toDvL/2AO+vPcD7aw/w/toDvAd4f/24ABzZ8o+KLsSLS+Pv/TqTb3P4hKlQrTGh+fbIBT0Axqznnb+L/V2mb3HkN5Mb/nEHeK7d4IcDld6lmDW/iH9E+AH1MdOw/Jlu2T1xNmY98sv4wHnD7D3uNHu54WUuOsBTbQuvBsPT/UfzNxGYzwkP8c+Yz3C+r/i6DcyRL/rZ+utRwWH5PmfvcvYEt9jLDS/bg0/B64DWKrQM8AL8FPwS9beQCe6EMKNZYJol37jBMy35otdaz0Bw2H/C2Smc7+WGB0HWDELBmOByA3r5QONo4V+DpzR/hFS4U8wMW1PXNB4TOqYz9urxRV++ntWCw/U59Ty9ebdWbrgfRS9AYKKN63ZokZVygr8GZ/gfIhZXIXPsAlNjPOLBby5c1eOLvmQ9lwkOy5x6QV1j5TYqpS05JtUgUHUp5toHGsVfn4NX4RnMCe+AxTpwmApTYxqMxwfCeJGjpXzRF61nbcHhUBPqWze9svwcHJ+S6NPscKrEjug78Dx8Lj3T8D4YxGIdxmJcwhi34fzZUr7olevZCw5vkOhoClq5zBPZAnygD/Tl9EzDh6kl3VhsHYcDEb+hCtJSvuiV69kLDm+WycrOTArHmB5/VYyP6jOVjwgGawk2zQOaTcc1L+aLXrKeveDwZqlKrw8U9Y1p66uK8dEzdYwBeUQAY7DbyYNezBfdWQ97weEtAKYQg2xJIkuveAT3dYeLGH+ShrWNwZgN0b2YL7qznr3g8JYAo5bQBziPjx7BPZ0d9RCQp4UZbnFdzBddor4XHN4KYMrB2qHFRIzzcLAHQZ5the5ovui94PCWAPefaYnxIdzRwdHCbuR4B+tbiy96Lzi8E4D7z7S0mEPd+eqO3cT53Z0Y8SV80XvB4Z0ADJi/f7X113f+7p7/+UYBvur6657/+YYBvur6657/+aYBvuL6657/+aYBvuL6657/+aYBvuL6657/+aYBvuL6657/+VMA8FXWX/f8z58OgK+y/rrnf75RgLna+uue//lTA/CV1V/3/M837aKvvv6653++UQvmauuve/7nTwfAV1N/3fM/fzr24Cuuv+75nz8FFnxl9dc9//MOr/8/glixwRuUfM4AAAAASUVORK5CYII="}getSearchTexture(){return"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAAAhCAAAAABIXyLAAAAAOElEQVRIx2NgGAWjYBSMglEwEICREYRgFBZBqDCSLA2MGPUIVQETE9iNUAqLR5gIeoQKRgwXjwAAGn4AtaFeYLEAAAAASUVORK5CYII="}dispose(){this.edgesRT.dispose(),this.weightsRT.dispose(),this.areaTexture.dispose(),this.searchTexture.dispose(),this.materialEdges.dispose(),this.materialWeights.dispose(),this.materialBlend.dispose(),this.fsQuad.dispose()}};var jn={name:"FXAAShader",uniforms:{tDiffuse:{value:null},resolution:{value:new Se(1/1024,1/512)}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`
		precision highp float;

		uniform sampler2D tDiffuse;

		uniform vec2 resolution;

		varying vec2 vUv;

		// FXAA 3.11 implementation by NVIDIA, ported to WebGL by Agost Biro (biro@archilogic.com)

		//----------------------------------------------------------------------------------
		// File:        es3-keplerFXAAassetsshaders/FXAA_DefaultES.frag
		// SDK Version: v3.00
		// Email:       gameworks@nvidia.com
		// Site:        http://developer.nvidia.com/
		//
		// Copyright (c) 2014-2015, NVIDIA CORPORATION. All rights reserved.
		//
		// Redistribution and use in source and binary forms, with or without
		// modification, are permitted provided that the following conditions
		// are met:
		//  * Redistributions of source code must retain the above copyright
		//    notice, this list of conditions and the following disclaimer.
		//  * Redistributions in binary form must reproduce the above copyright
		//    notice, this list of conditions and the following disclaimer in the
		//    documentation and/or other materials provided with the distribution.
		//  * Neither the name of NVIDIA CORPORATION nor the names of its
		//    contributors may be used to endorse or promote products derived
		//    from this software without specific prior written permission.
		//
		// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS ''AS IS'' AND ANY
		// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
		// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
		// PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR
		// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
		// EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
		// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
		// PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
		// OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
		// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
		// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
		//
		//----------------------------------------------------------------------------------

		#ifndef FXAA_DISCARD
			//
			// Only valid for PC OpenGL currently.
			// Probably will not work when FXAA_GREEN_AS_LUMA = 1.
			//
			// 1 = Use discard on pixels which don't need AA.
			//     For APIs which enable concurrent TEX+ROP from same surface.
			// 0 = Return unchanged color on pixels which don't need AA.
			//
			#define FXAA_DISCARD 0
		#endif

		/*--------------------------------------------------------------------------*/
		#define FxaaTexTop(t, p) texture2D(t, p, -100.0)
		#define FxaaTexOff(t, p, o, r) texture2D(t, p + (o * r), -100.0)
		/*--------------------------------------------------------------------------*/

		#define NUM_SAMPLES 5

		// assumes colors have premultipliedAlpha, so that the calculated color contrast is scaled by alpha
		float contrast( vec4 a, vec4 b ) {
			vec4 diff = abs( a - b );
			return max( max( max( diff.r, diff.g ), diff.b ), diff.a );
		}

		/*============================================================================

									FXAA3 QUALITY - PC

		============================================================================*/

		/*--------------------------------------------------------------------------*/
		vec4 FxaaPixelShader(
			vec2 posM,
			sampler2D tex,
			vec2 fxaaQualityRcpFrame,
			float fxaaQualityEdgeThreshold,
			float fxaaQualityinvEdgeThreshold
		) {
			vec4 rgbaM = FxaaTexTop(tex, posM);
			vec4 rgbaS = FxaaTexOff(tex, posM, vec2( 0.0, 1.0), fxaaQualityRcpFrame.xy);
			vec4 rgbaE = FxaaTexOff(tex, posM, vec2( 1.0, 0.0), fxaaQualityRcpFrame.xy);
			vec4 rgbaN = FxaaTexOff(tex, posM, vec2( 0.0,-1.0), fxaaQualityRcpFrame.xy);
			vec4 rgbaW = FxaaTexOff(tex, posM, vec2(-1.0, 0.0), fxaaQualityRcpFrame.xy);
			// . S .
			// W M E
			// . N .

			bool earlyExit = max( max( max(
					contrast( rgbaM, rgbaN ),
					contrast( rgbaM, rgbaS ) ),
					contrast( rgbaM, rgbaE ) ),
					contrast( rgbaM, rgbaW ) )
					< fxaaQualityEdgeThreshold;
			// . 0 .
			// 0 0 0
			// . 0 .

			#if (FXAA_DISCARD == 1)
				if(earlyExit) FxaaDiscard;
			#else
				if(earlyExit) return rgbaM;
			#endif

			float contrastN = contrast( rgbaM, rgbaN );
			float contrastS = contrast( rgbaM, rgbaS );
			float contrastE = contrast( rgbaM, rgbaE );
			float contrastW = contrast( rgbaM, rgbaW );

			float relativeVContrast = ( contrastN + contrastS ) - ( contrastE + contrastW );
			relativeVContrast *= fxaaQualityinvEdgeThreshold;

			bool horzSpan = relativeVContrast > 0.;
			// . 1 .
			// 0 0 0
			// . 1 .

			// 45 deg edge detection and corners of objects, aka V/H contrast is too similar
			if( abs( relativeVContrast ) < .3 ) {
				// locate the edge
				vec2 dirToEdge;
				dirToEdge.x = contrastE > contrastW ? 1. : -1.;
				dirToEdge.y = contrastS > contrastN ? 1. : -1.;
				// . 2 .      . 1 .
				// 1 0 2  ~=  0 0 1
				// . 1 .      . 0 .

				// tap 2 pixels and see which ones are "outside" the edge, to
				// determine if the edge is vertical or horizontal

				vec4 rgbaAlongH = FxaaTexOff(tex, posM, vec2( dirToEdge.x, -dirToEdge.y ), fxaaQualityRcpFrame.xy);
				float matchAlongH = contrast( rgbaM, rgbaAlongH );
				// . 1 .
				// 0 0 1
				// . 0 H

				vec4 rgbaAlongV = FxaaTexOff(tex, posM, vec2( -dirToEdge.x, dirToEdge.y ), fxaaQualityRcpFrame.xy);
				float matchAlongV = contrast( rgbaM, rgbaAlongV );
				// V 1 .
				// 0 0 1
				// . 0 .

				relativeVContrast = matchAlongV - matchAlongH;
				relativeVContrast *= fxaaQualityinvEdgeThreshold;

				if( abs( relativeVContrast ) < .3 ) { // 45 deg edge
					// 1 1 .
					// 0 0 1
					// . 0 1

					// do a simple blur
					return mix(
						rgbaM,
						(rgbaN + rgbaS + rgbaE + rgbaW) * .25,
						.4
					);
				}

				horzSpan = relativeVContrast > 0.;
			}

			if(!horzSpan) rgbaN = rgbaW;
			if(!horzSpan) rgbaS = rgbaE;
			// . 0 .      1
			// 1 0 1  ->  0
			// . 0 .      1

			bool pairN = contrast( rgbaM, rgbaN ) > contrast( rgbaM, rgbaS );
			if(!pairN) rgbaN = rgbaS;

			vec2 offNP;
			offNP.x = (!horzSpan) ? 0.0 : fxaaQualityRcpFrame.x;
			offNP.y = ( horzSpan) ? 0.0 : fxaaQualityRcpFrame.y;

			bool doneN = false;
			bool doneP = false;

			float nDist = 0.;
			float pDist = 0.;

			vec2 posN = posM;
			vec2 posP = posM;

			int iterationsUsedN = 0;
			int iterationsUsedP = 0;
			for( int i = 0; i < NUM_SAMPLES; i++ ) {

				float increment = float(i + 1);

				if(!doneN) {
					nDist += increment;
					posN = posM + offNP * nDist;
					vec4 rgbaEndN = FxaaTexTop(tex, posN.xy);
					doneN = contrast( rgbaEndN, rgbaM ) > contrast( rgbaEndN, rgbaN );
					iterationsUsedN = i;
				}

				if(!doneP) {
					pDist += increment;
					posP = posM - offNP * pDist;
					vec4 rgbaEndP = FxaaTexTop(tex, posP.xy);
					doneP = contrast( rgbaEndP, rgbaM ) > contrast( rgbaEndP, rgbaN );
					iterationsUsedP = i;
				}

				if(doneN || doneP) break;
			}


			if ( !doneP && !doneN ) return rgbaM; // failed to find end of edge

			float dist = min(
				doneN ? float( iterationsUsedN ) / float( NUM_SAMPLES - 1 ) : 1.,
				doneP ? float( iterationsUsedP ) / float( NUM_SAMPLES - 1 ) : 1.
			);

			// hacky way of reduces blurriness of mostly diagonal edges
			// but reduces AA quality
			dist = pow(dist, .5);

			dist = 1. - dist;

			return mix(
				rgbaM,
				rgbaN,
				dist * .5
			);
		}

		void main() {
			const float edgeDetectionQuality = .2;
			const float invEdgeDetectionQuality = 1. / edgeDetectionQuality;

			gl_FragColor = FxaaPixelShader(
				vUv,
				tDiffuse,
				resolution,
				edgeDetectionQuality, // [0,1] contrast needed, otherwise early discard
				invEdgeDetectionQuality
			);

		}
	`};var e0={aces:1,agx:2,neutral:3},Io="varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",Wo={type:zt,depthBuffer:!1,stencilBuffer:!1},t0=`
float h12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h12(i), h12(i + vec2(1, 0)), f.x), mix(h12(i + vec2(0, 1)), h12(i + vec2(1, 1)), f.x), f.y); }
`,Qs=class extends ds{constructor(o,t,r){super(o,t),this.stats=r}render(o,t,r,a,e){let n=o.info.render,i=n.calls,u=n.triangles;super.render(o,t,r,a,e),this.stats.sceneCalls=n.calls-i,this.stats.sceneTriangles=n.triangles-u}},Zs=class extends ut{constructor(){super(),this.needsSwap=!1,this.lum=new lt(64,32,{...Wo,generateMipmaps:!0,minFilter:Ko,magFilter:Yo}),this.lum.texture.generateMipmaps=!0,this.ping=[0,1].map(()=>new lt(1,1,{...Wo,minFilter:xo,magFilter:xo})),this.cur=0,this.meter=new we({uniforms:{tDiffuse:{value:null}},vertexShader:Io,fragmentShader:`
        uniform sampler2D tDiffuse; varying vec2 vUv;
        void main(){
          vec2 cell = vec2(1.0 / 64.0, 1.0 / 32.0);
          float s = 0.0;
          for (int y = 0; y < 4; y++) for (int x = 0; x < 4; x++) {
            vec3 c = texture2D(tDiffuse, vUv + (vec2(x, y) - 1.5) * 0.25 * cell).rgb;
            s += log2(dot(c, vec3(0.2126, 0.7152, 0.0722)) + 1e-3);
          }
          gl_FragColor = vec4(s / 16.0, 0.0, 0.0, 1.0);
        }`,depthTest:!1,depthWrite:!1}),this.adapt=new we({uniforms:{tLum:{value:this.lum.texture},tPrev:{value:null},uDt:{value:0},uKey:{value:.02},uMin:{value:.7},uMax:{value:1.4},uReset:{value:1},uOn:{value:1}},vertexShader:Io,fragmentShader:`
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
        }`,depthTest:!1,depthWrite:!1}),this.quad=new Ft(this.meter),this.dt=0}get texture(){return this.ping[this.cur].texture}render(o,t,r){this.meter.uniforms.tDiffuse.value=r.texture,this.quad.material=this.meter,o.setRenderTarget(this.lum),this.quad.render(o);let a=this.ping[this.cur],e=this.ping[1-this.cur],n=this.adapt.uniforms;n.tPrev.value=a.texture,n.uDt.value=this.dt,this.quad.material=this.adapt,o.setRenderTarget(e),this.quad.render(o),n.uReset.value=0,this.cur=1-this.cur}dispose(){this.lum.dispose(),this.ping.forEach(o=>o.dispose()),this.meter.dispose(),this.adapt.dispose(),this.quad.dispose()}},Xn=14,Js=class extends ut{constructor(o){super(),this.needsSwap=!1,this.half=new lt(1,1,Wo),this.qa=new lt(1,1,Wo),this.qb=new lt(1,1,Wo),this.resolve=new we({uniforms:{tColor:{value:null},tDepth:{value:null},uProj:{value:o.projectionMatrix},uProjInv:{value:o.projectionMatrixInverse},uView:{value:o.matrixWorldInverse},uViewInv:{value:o.matrixWorld},uNF:{value:new Se(.1,3e3)},uCurve:ie.uCurve,uHill:ie.uHill,uRoadZ:{value:0},uRipple:{value:.04},uClampL:{value:3.5}},vertexShader:Io,fragmentShader:`
        precision highp float;
        uniform sampler2D tColor, tDepth;
        uniform mat4 uProj, uProjInv, uView, uViewInv;
        uniform vec2 uNF; uniform float uCurve, uHill, uRoadZ, uRipple, uClampL;
        varying vec2 vUv;
        ${t0}
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
          for (int i = 1; i <= ${Xn}; i++) {
            float k = (float(i) - 0.5 + jit) / float(${Xn});
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
        }`,depthTest:!1,depthWrite:!1}),this.blur=new we({uniforms:{tDiffuse:{value:null},uStep:{value:new Se}},vertexShader:Io,fragmentShader:`
        uniform sampler2D tDiffuse; uniform vec2 uStep; varying vec2 vUv;
        void main(){
          vec4 s = texture2D(tDiffuse, vUv) * 0.2270;
          s += (texture2D(tDiffuse, vUv + uStep * 1.3846) + texture2D(tDiffuse, vUv - uStep * 1.3846)) * 0.3162;
          s += (texture2D(tDiffuse, vUv + uStep * 3.2308) + texture2D(tDiffuse, vUv - uStep * 3.2308)) * 0.0703;
          gl_FragColor = s;
        }`,depthTest:!1,depthWrite:!1}),this.quad=new Ft(this.resolve),this.w=this.h=1,this.wet=0}setSize(o,t){this.w=o,this.h=t,this.half.setSize(Math.max(1,Math.round(o/2)),Math.max(1,Math.round(t/2))),this.qa.setSize(Math.max(1,Math.round(o/4)),Math.max(1,Math.round(t/4))),this.qb.setSize(Math.max(1,Math.round(o/4)),Math.max(1,Math.round(t/4)))}pass(o,t,r){this.quad.material=t,o.setRenderTarget(r),this.quad.render(o)}render(o,t,r){let a=this.resolve.uniforms;a.tColor.value=r.texture,a.tDepth.value=r.depthTexture,this.pass(o,this.resolve,this.half);let e=this.blur.uniforms,n=this.qa.width,i=this.qa.height;e.tDiffuse.value=this.half.texture,e.uStep.value.set((1+this.wet)/n,0),this.pass(o,this.blur,this.qa),e.tDiffuse.value=this.qa.texture,e.uStep.value.set(0,1.5/i),this.pass(o,this.blur,this.qb),e.tDiffuse.value=this.qb.texture,e.uStep.value.set(0,4/i),this.pass(o,this.blur,this.qa),e.tDiffuse.value=this.qa.texture,e.uStep.value.set(0,9/i),this.pass(o,this.blur,this.qb)}dispose(){[this.half,this.qa,this.qb,this.resolve,this.blur,this.quad].forEach(o=>o.dispose())}},_s=class extends ut{constructor(o){super(),this.needsSwap=!1,this.bloom=o,this.a=new lt(1,1,Wo),this.b=new lt(1,1,Wo),this.mat=new we({uniforms:{tDiffuse:{value:null},uStep:{value:0},uCut:{value:0}},vertexShader:Io,fragmentShader:`
        uniform sampler2D tDiffuse; uniform float uStep, uCut; varying vec2 vUv;
        void main(){
          vec3 s = vec3(0.0); float wsum = 0.0;
          for (int i = -4; i <= 4; i++) {
            float w = exp(-float(i * i) * 0.18);
            vec3 c = texture2D(tDiffuse, vUv + vec2(float(i) * uStep, 0.0)).rgb;
            s += max(c - uCut, 0.0) * w; wsum += w;
          }
          gl_FragColor = vec4(s / wsum, 1.0);
        }`,depthTest:!1,depthWrite:!1}),this.quad=new Ft(this.mat)}get texture(){return this.a.texture}setSize(o,t){this.a.setSize(Math.max(1,Math.round(o/4)),Math.max(1,Math.round(t/8))),this.b.setSize(Math.max(1,Math.round(o/4)),Math.max(1,Math.round(t/8)))}render(o){let t=this.mat.uniforms,r=1/this.a.width;t.tDiffuse.value=this.bloom.renderTargetBright.texture,t.uStep.value=r*1.5,t.uCut.value=1.2,o.setRenderTarget(this.b),this.quad.render(o),t.tDiffuse.value=this.b.texture,t.uStep.value=r*6,t.uCut.value=0,o.setRenderTarget(this.a),this.quad.render(o)}dispose(){this.a.dispose(),this.b.dispose(),this.mat.dispose(),this.quad.dispose()}};function o0({reflect:s,streak:o,tonemap:t}){return{defines:{REFLECT:s?1:0,STREAK:o?1:0,TONEMAP:t},uniforms:{tDiffuse:{value:null},tDepth:{value:null},tRefl:{value:null},tReflBlur:{value:null},tExp:{value:null},tRough:{value:null},tStreak:{value:null},uTime:{value:0},uSpeed:{value:0},uGlitch:{value:0},uFlash:{value:0},uBoost:{value:0},uGrain:{value:.012},uAspect:{value:1.7},uLines:{value:0},uExposure:{value:.88},uStreakGain:{value:.2},uProjInv:{value:null},uViewInv:{value:null},uNF:{value:new Se(.1,3e3)},uCurve:ie.uCurve,uHill:ie.uHill,uFogColor:ie.uFogColor,uFogDensity:ie.uFogDensity,uWet:{value:.5},uRoadZ:{value:0},uReflGain:{value:1},uFallback:{value:new W("#10142a")},uHaze:{value:new W(.01,.01,.02)},uHazeDens:{value:.0012},uHazeH:{value:22},uHazeSky:{value:.5}},vertexShader:Io,fragmentShader:`
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
              vec3 surf = texture2D(tRough, vec2(clamp(xr / 10.8 + 0.5, 0.0, 1.0), tv)).rgb;   // g roughness, b micro-gloss
              // hollows hold water only when it rains: a dry night has no puddles, just a faint even sheen at grazing angles
              float rainK = smoothstep(0.3, 0.7, uWet);
              float puddle = (1.0 - smoothstep(0.12, 0.5, surf.g)) * rainK;
              float wet = clamp(uWet * (0.55 + 0.45 * puddle) + puddle * 0.35, 0.0, 1.0) * mix(0.2, 1.0, onRoad);
              // asphalt is not a mirror: its grain breaks a reflection into glints (calm only inside a puddle). The
              // grain is a mipmapped texture, so it averages out with distance instead of shimmering.
              float broken = mix(mix(0.3, 1.25, surf.b), 1.0, max(puddle, 0.3 * rainK));   // a soaked road is a calmer mirror
              float ndv = clamp(normalize(uViewInv[3].xyz - wp).y, 0.0, 1.0);
              float F = 0.02 + 0.98 * pow(1.0 - ndv, 5.0);            // Schlick, water F0
              vec4 sharp = texture2D(tRefl, vUv), soft = texture2D(tReflBlur, vUv);
              // standing water is a calmer mirror than soaked asphalt; rain (high uWet) roughens even the puddles
              float rsharp = puddle * (1.0 - 0.45 * uWet) * onRoad;   // off the asphalt: soft only (no half-res blocks)
              vec4 rf = mix(soft, sharp, clamp(rsharp * 0.5, 0.0, 0.5));
              vec3 refl = rf.rgb + uFallback * (1.0 - clamp(rf.a, 0.0, 1.0));
              float fz = uFogDensity * -vp.z, fogT = 1.0 - exp(-fz * fz);   // the same exp\xB2 fog the materials use
              col += refl * F * wet * broken * ground * (1.0 - fogT) * uReflGain;
              // the blurred reflection also blooms a little: wet asphalt glows under neon
              col += soft.rgb * F * wet * broken * ground * (1.0 - fogT) * 0.25 * uReflGain;
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
        // exposure: authored base \xD7 eye adaptation
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
      }`}}var a0=`
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
  }`;function $s(s,o,t,{samples:r=0,bloom:a=.5,aa:e="smaa",reflect:n=0,streak:i=!1,tonemap:u=e0.neutral}={}){s.toneMapping=Rr,s.toneMappingExposure=1;let m=s.getSize(new Se),l=s.getPixelRatio(),h={sceneCalls:0,sceneTriangles:0},v=new lt(m.x*l,m.y*l,{type:zt,samples:r});v.depthTexture=new Cs(m.x*l,m.y*l),v.depthTexture.type=Hs;let E=new us(s,v);E.renderTarget2.depthTexture=new Cs(m.x*l,m.y*l),E.renderTarget2.depthTexture.type=Hs,E.addPass(new Qs(o,t,h));let M=new Zs;E.addPass(M);let p=n?new Js(t):null;p&&E.addPass(p);let H=new fa(new Se(m.x,m.y),.4+a*.3,.22,1.45);H.highPassUniforms.smoothWidth.value=.7,H.highPassUniforms.uTexel={value:new Se(1/Math.max(1,m.x*l),1/Math.max(1,m.y*l))},H.materialHighPassFilter.dispose(),H.materialHighPassFilter=new we({uniforms:H.highPassUniforms,vertexShader:Io,fragmentShader:a0}),E.addPass(H);let k=i?new _s(H):null;k&&E.addPass(k);let g=new Fo(o0({reflect:!!p,streak:!!k,tonemap:u}));g.material.toneMapped=!1;let b=g.uniforms;b.uProjInv.value=t.projectionMatrixInverse,b.uViewInv.value=t.matrixWorld,b.tExp.value=null,E.addPass(g);let U=e==="smaa"?new ps(1,1):new Fo(jn);E.addPass(U);let J=g.render.bind(g);g.render=(z,G,L,f,S)=>{b.tDepth.value=L.depthTexture,b.tExp.value=M.texture,p&&(b.tRefl.value=p.half.texture,b.tReflBlur.value=p.qb.texture),k&&(b.tStreak.value=k.texture),J(z,G,L,f,S)};let j=()=>{b.uNF.value.set(t.near,t.far),p&&p.resolve.uniforms.uNF.value.set(t.near,t.far)};return{composer:E,lens:b,bloom:H,stats:h,road(z,G,L,f){b.uWet.value=z,b.uRoadZ.value=G%2400,L&&(b.tRough.value=L),f&&b.uFallback.value.copy(f),p&&(p.resolve.uniforms.uRoadZ.value=G%2400,p.wet=z)},haze(z,G,L){b.uHaze.value.copy(z),b.uHazeDens.value=G,b.uHazeSky.value=L},adapt(z,G){M.adapt.uniforms.uOn.value=z,G&&(M.adapt.uniforms.uReset.value=1)},meter:M.adapt.uniforms,setExposure(z){b.uExposure.value=z},readExposure(){let z=new Uint16Array(4);return s.readRenderTargetPixels(M.ping[M.cur],0,0,1,1,z),zr.fromHalfFloat(z[0])},setSize(z,G){E.setPixelRatio(s.getPixelRatio()),E.setSize(z,G);let L=s.getPixelRatio(),f=Math.max(1,Math.round(z*L)),S=Math.max(1,Math.round(G*L));H.highPassUniforms.uTexel.value.set(1/f,1/S),e!=="smaa"&&U.uniforms.resolution.value.set(1/f,1/S),b.uAspect.value=z/G},render(z){j(),M.dt=z,E.render(z)},dispose(){E.dispose();for(let z of E.passes)z.dispose?.();v.depthTexture.dispose(),E.renderTarget2.depthTexture?.dispose(),v.dispose()}}}var qn=s=>440*Math.pow(2,(s-69)/12);var s0=[45,45,57,45,43,43,55,43,41,41,53,41,43,43,55,47],r0=[69,72,76,72,67,71,74,71,65,69,72,69,67,71,74,79];function Yn(){let s=null,o,t,r,a,e,n,i,u,m,l=!1,h={sound:!0,music:!0,volume:.7},v=!1,E=0,M=0,p=0;function H(){if(s)return!0;let j=window.AudioContext||window.webkitAudioContext;if(!j)return!1;s=new j,o=s.createGain(),o.connect(s.destination);let z=s.createDynamicsCompressor();z.threshold.value=-14,z.ratio.value=4,z.connect(o),t=s.createGain(),t.connect(z),m=s.createGain(),m.gain.value=0;let G=s.createDelay(.5);G.delayTime.value=.095;let L=s.createGain();L.gain.value=.42;let f=s.createBiquadFilter();f.type="lowpass",f.frequency.value=1800,t.connect(m),m.connect(G),G.connect(f),f.connect(L),L.connect(G),f.connect(z),r=s.createGain(),r.gain.value=.32,r.connect(z),i=s.createBiquadFilter(),i.type="lowpass",i.frequency.value=400,i.Q.value=6,a=s.createGain(),a.gain.value=0,i.connect(a),a.connect(t),e=s.createOscillator(),e.type="sawtooth",n=s.createOscillator(),n.type="square",n.detune.value=9,e.connect(i),n.connect(i),e.start(),n.start(),u=s.createBuffer(1,s.sampleRate,s.sampleRate);let S=u.getChannelData(0);for(let F=0;F<S.length;F++)S[F]=Math.random()*2-1;return k(),!0}function k(){s&&(o.gain.setTargetAtTime(h.sound?h.volume:0,s.currentTime,.05),r.gain.setTargetAtTime(h.music?.32:0,s.currentTime,.1))}function g(j,z,G,L,f){j.gain.setValueAtTime(1e-4,z),j.gain.exponentialRampToValueAtTime(L,z+G),j.gain.exponentialRampToValueAtTime(1e-4,z+G+f)}function b(j,z,G,L,f=.25,S=0,F=t){let q=s.currentTime+S,B=s.createOscillator(),Q=s.createGain();B.type=j,B.frequency.setValueAtTime(z,q),G!==z&&B.frequency.exponentialRampToValueAtTime(Math.max(20,G),q+L),g(Q,q,.005,f,L),B.connect(Q),Q.connect(F),B.start(q),B.stop(q+L+.05)}function U(j,z,G,L,f="bandpass",S=0){let F=s.currentTime+S,q=s.createBufferSource();q.buffer=u;let B=s.createBiquadFilter();B.type=f,B.frequency.setValueAtTime(G,F),B.frequency.exponentialRampToValueAtTime(Math.max(40,L),F+j),B.Q.value=1.2;let Q=s.createGain();g(Q,F,.01,z,j),q.connect(B),B.connect(Q),Q.connect(t),q.start(F,Math.random()*.5),q.stop(F+j+.05)}function J(){if(!v||!s)return;let j=60/112/4;for(;E<s.currentTime+.15;){let z=M%16,G=Math.floor(M/16)%4;if(z%2===0){let L=s0[(G*4+z/2)%16],f=s.createOscillator(),S=s.createBiquadFilter(),F=s.createGain();f.type="sawtooth",f.frequency.value=qn(L-12),S.type="lowpass",S.frequency.setValueAtTime(900,E),S.frequency.exponentialRampToValueAtTime(160,E+j*1.8),g(F,E,.005,.35,j*1.8),f.connect(S),S.connect(F),F.connect(r),f.start(E),f.stop(E+j*2)}if(z%4===0){let L=s.createOscillator(),f=s.createGain();L.frequency.setValueAtTime(140,E),L.frequency.exponentialRampToValueAtTime(42,E+.12),g(f,E,.002,.6,.16),L.connect(f),f.connect(r),L.start(E),L.stop(E+.2)}if(z===4||z===12){let L=s.createBufferSource();L.buffer=u;let f=s.createBiquadFilter();f.type="highpass",f.frequency.value=1800;let S=s.createGain();g(S,E,.002,.22,.12),L.connect(f),f.connect(S),S.connect(r),L.start(E,Math.random()*.5),L.stop(E+.15)}if(G>=2||z%2===1){let L=s.createOscillator(),f=s.createGain();L.type="square",L.frequency.value=qn(r0[(z+G*3)%16]),g(f,E,.003,.05,j*.9),L.connect(f),f.connect(r),L.start(E),L.stop(E+j)}E+=j,M++}}return{unlock(){H()&&s.state==="suspended"&&s.resume()},configure(j){h={...h,...j},k()},musicStart(){!s||v||(v=!0,E=s.currentTime+.05,M=0,p=setInterval(J,40))},musicStop(){v=!1,clearInterval(p)},tunnel(j){!s||j===l||(l=j,m.gain.setTargetAtTime(j?.55:0,s.currentTime,.12),i.Q.setTargetAtTime(j?10:6,s.currentTime,.15))},engine(j,z,G){if(!s)return;let L=s.currentTime,f=38+z*120+(G?28:0);e.frequency.setTargetAtTime(f,L,.05),n.frequency.setTargetAtTime(f*.5,L,.05),i.frequency.setTargetAtTime(260+z*1500+(G?900:0),L,.06),a.gain.setTargetAtTime(j?(.05+z*.05)*(l?1.35:1):0,L,.08)},sfx(j,z=0){if(!(!s||!h.sound))switch(j){case"shard":{let G=660*Math.pow(2,Math.min(z,12)/12);b("triangle",G,G,.09,.18),b("triangle",G*1.5,G*1.5,.12,.14,.05);break}case"file":[0,4,7,12].forEach((G,L)=>b("square",523*Math.pow(2,G/12),523*Math.pow(2,G/12),.14,.09,L*.07));break;case"nearmiss":U(.35,.3,300,3200,"bandpass");break;case"slip":b("sawtooth",220,880,.5,.08),U(.5,.15,800,5e3,"highpass");break;case"hit":b("sine",140,38,.35,.6),U(.3,.45,2400,200,"lowpass");break;case"crash":{let G=Math.max(.25,Math.min(1,z||.5));b("sine",150,34,.3+.25*G,.45+.3*G),U(.25+.3*G,.3+.3*G,2600,180,"lowpass"),G>.55&&(U(.35,.16,5200,7600,"highpass",.06),b("square",90,40,.18,.2,.03));break}case"scrape":U(.12,.12,3500,2500,"bandpass");break;case"glitch":for(let G=0;G<6;G++)b("square",200+Math.random()*1600,80+Math.random()*400,.06,.08,G*.05);break;case"count":b("square",440,440,.12,.12);break;case"go":b("square",880,880,.3,.14);break;case"over":b("sawtooth",330,55,1.1,.2);break;case"ui":b("triangle",1200,1200,.04,.06);break;default:}},suspend(){s&&s.state==="running"&&s.suspend()},resume(){s&&s.state==="suspended"&&s.resume()},destroy(){v=!1,clearInterval(p),s&&s.close(),s=null}}}var n0=null,i0=()=>n0||(n0=Yn());function $l(){try{let s=document.createElement("canvas");return!!(window.WebGL2RenderingContext&&s.getContext("webgl2"))}catch{return!1}}var No=1/120;function ec(s,o={}){let t=o.onTick||(()=>{}),r=o.onEvent||(()=>{}),a=!!o.lite,e=!!o.reducedMotion,n={...yr,...o.config||{}};e&&(n.effects="reduced");let i=new Gr({canvas:s,antialias:!1,powerPreference:"high-performance",alpha:!1,stencil:!1,depth:!0}),u=!1;s.addEventListener("webglcontextlost",x=>{x.preventDefault(),u=!0,r({type:"context-lost"})});let m=()=>1.2*(n.weather==="rain"?.9:1);i.outputColorSpace=jt,i.info.autoReset=!1;let l=a?null:i0(),h=en({mode:o.mode||"attract",config:n,onEvent:z}),v=Un(i,n),E=Ms(n.quality),M=()=>Ia[E],p=1,H=()=>{let x=Math.max(1,s.clientWidth),Z=Math.max(1,s.clientHeight),fe=a?4e5:M().pixels,K=Math.sqrt(fe/(x*Z));return Math.max(.45,Math.min(window.devicePixelRatio||1,K))*p};i.setPixelRatio(H());let k=x=>a?{samples:0,bloom:.3,aa:"fxaa",reflect:0,streak:!1}:{samples:M().samples,bloom:M().bloom,aa:M().aa,reflect:M().reflect,streak:M().streak,...x},g={},b=$s(i,v.scene,v.camera,k(g));b.setExposure(m());function U(){let x=Math.max(1,s.clientWidth),Z=Math.max(1,s.clientHeight);i.setPixelRatio(H()),i.setSize(x,Z,!1),b.setSize(x,Z),v.resize(x,Z)}v.applyQuality(a?{...Ia.low,extras:!1}:M());{let x=Math.min(8,i.capabilities.getMaxAnisotropy?.()||1),Z=new Set,fe=N=>N.minFilter===Ko||N.minFilter===Sr,K=N=>{!N||!N.isTexture||Z.has(N)||N.isRenderTargetTexture||!N.generateMipmaps||!fe(N)||(Z.add(N),N.anisotropy<x&&(N.anisotropy=x,N.image&&(N.needsUpdate=!0)))};v.scene.traverse(N=>{for(let X of Array.isArray(N.material)?N.material:[N.material])if(X){for(let he in X)X[he]&&X[he].isTexture&&K(X[he]);if(X.uniforms)for(let he in X.uniforms)K(X.uniforms[he]&&X.uniforms[he].value)}})}try{v.precompile(i)}catch{}function J(){b.dispose(),i.setPixelRatio(H()),b=$s(i,v.scene,v.camera,k(g)),b.setExposure(m()),v.applyQuality(a?{...Ia.low,extras:!1}:M()),U()}let j=new ResizeObserver(U);j.observe(s),U();function z(x){let Z=h.S;switch(x.type){case"shard":v.burst("shard",x.x),l?.sfx("shard",x.chain);break;case"casefile":v.burst("file",Z.x),l?.sfx("file");break;case"nearmiss":l?.sfx("nearmiss");break;case"slipstream":v.burst("slip",Z.x),l?.sfx("slip");break;case"hit":v.burst("crash",x.x,x),l?.sfx("crash",x.sev);break;case"slam":v.burst("slam",x.x),l?.sfx("crash",.4);break;case"bump":v.burst("bump",x.x),l?.sfx("scrape");break;case"parried":l?.sfx("ui");break;case"blocked":l?.sfx("count");break;case"sprint":l?.sfx("go");break;case"scrape":l?.sfx("scrape");break;case"strike":v.burst("strike",x.x),l?.sfx("hit");break;case"struck":v.burst("strike",x.x),l?.sfx("scrape");break;case"whiff":l?.sfx("ui");break;case"police":l?.sfx("glitch");break;case"power":v.burst(x.kind,x.x),l?.sfx(x.kind==="nitro"?"slip":"file");break;case"busted":v.burst("hit",Z.x),l?.sfx("hit");break;case"escaped":l?.sfx("file");break;case"glitch":l?.sfx("glitch");break;case"count":l?.sfx("count");break;case"go":l?.sfx("go");break;case"over":l?.sfx("over");break;case"junction":l?.sfx("slip");break;case"finale":l?.sfx("file");break;case"complete":l?.engine(!1,0,!1);break;default:}r(x)}let G=!1;function L(){let x=navigator.getGamepads?navigator.getGamepads():null,Z=null;if(x){for(let X=0;X<x.length;X++)if(x[X]&&x[X].connected){Z=x[X];break}}if(!Z)return null;let fe=Math.abs(Z.axes[0])>.15?Z.axes[0]:0,K=X=>!!(Z.buttons[X]&&(Z.buttons[X].pressed||Z.buttons[X].value>.3)),N=K(9);return N&&!G&&r({type:"pad-start"}),G=N,{axis:fe+(K(15)?1:0)-(K(14)?1:0),boost:K(0)||K(7)||K(5),brake:K(1)||K(6)||K(4)}}let f=0,S=!1,F=!1,q=0,B=0,Q=0,Y=16,_=0,Me=0,w=0,C={full:n.effects!=="reduced",view:o.view||"chase",cam:"chase"},O={left:!1,right:!1,boost:!1,brake:!1,strike:!1,wheelie:!1};function $(x){if(!S)return;f=requestAnimationFrame($);let Z=Math.min(.1,(x-q)/1e3||.016);if(q=x,F||u)return;if(h.mode==="play"){let de=L();h.input.left=O.left,h.input.right=O.right,h.input.boost=O.boost||!!de?.boost,h.input.brake=O.brake||!!de?.brake,O.strike&&(h.input.strike=!0,O.strike=!1),O.wheelie&&(h.input.wheelie=!0,O.wheelie=!1),h.input.axis=de?de.axis:0}for(B+=Math.min(Z,.05),C.view==="showroom"&&(B=0);B>=No;)h.step(No),B-=No;let fe=Math.min(Z,.05),K=h.S;C.full=n.effects!=="reduced",v.update(h,fe,C);let N=b.lens,X=K.speed/_e;N.uTime.value+=fe,N.uSpeed.value=C.full?X*.6:0,N.uGlitch.value=K.glitch>0&&C.full?.3+.2*Math.random():0,N.uFlash.value=C.full&&K.flash>0?K.flash*.9:0,N.uBoost.value=K.slip>0?Math.min(1,K.slip):0;let he=!a&&C.full&&C.view!=="showroom"&&(K.overclock||K.slip>0)?Math.min(1,(X-.7)*2.5):0;K.inTunnel&&C.full&&(N.uSpeed.value*=1.35),a&&(N.uSpeed.value*=.55),N.uLines.value+=(Math.max(0,he)-N.uLines.value)*Math.min(1,fe*6),C.view==="showroom"&&(N.uSpeed.value=0),(!a||Q%2===0)&&Ge(fe),l&&h.mode==="play"&&(l.engine(K.count<=0&&!K.over,X,K.overclock),l.tunnel(!!K.inTunnel&&!K.over)),Y+=(Z*1e3-Y)*.03,Y>21?(_+=Z,Me=0):Y<17.6?(Me+=Z,_=0):_=Me=0,x-w>5e3&&(_>2.5&&p>.7?(p=Math.max(.7,p-.1),_=0,w=x,U()):_>3&&n.quality==="auto"&&E!=="low"&&!a?(E="low",p=1,_=0,w=x,J(),r({type:"quality-auto",to:"low"})):Me>8&&p<1&&(p=Math.min(1,p+.1),Me=0,w=x,U())),++Q%6===0&&ee()}let se={towers:"#9fb8ff",neon:"#ff4fa8",office:"#c8dcff",river:"#4fd0c8",park:"#4a6a8a",moat:"#4a6a8a",gov:"#ffb35a",hills:"#b07aff",resid:"#ffc78a",tower:"#ff7a2a",bay:"#5ac8ff"};for(let x in se)se[x]=new W(se[x]);let re=new W,ye=new W,c=new W("#d8a878"),le=0,ce=!1;function Fe(x){let Z=h.S,fe=Z.district,K=fe&&se[fe.style]||se.towers,N=!!(mo[n.time]||mo.tokyo).real;ye.copy(K),N&&ye.lerp(c,.72),ye.multiplyScalar(N?.02:.03).add(ie.uFogColor.value);let X=ce?1-Math.exp(-Math.max(0,x)/.7):1;ce=!0,re.lerp(ye,X),le+=((Z.inTunnel?1:0)-le)*X;let he=n.weather==="rain"?1.6:1;b.haze(re,.0016*he*(1-.8*le),.5*(1-le))}function Ge(x){let Z=v.road;Z&&b.road(n.weather==="rain"?Z.wet:Z.wet*.5,Z.z,Z.rough,Z.fallback),Fe(x),b.adapt(C.view==="showroom"?.35:1,!1),i.info.reset(),b.render(x)}function ee(){let x=h.S;t({score:Math.round(x.score),kmh:Math.round(x.speed*3.6),heat:Math.round(x.heat),glitch:x.glitch>0,overclock:!!x.overclock,slip:x.slip>0,draft:x.draft,lives:x.lives,maxLives:x.maxLives,shards:x.shards,files:x.files,chain:x.chain,mult:1+Math.min(4,Math.floor(x.chain/6)),nearMisses:x.nearMisses,count:x.count,over:x.over,km:(x.dist/1e3).toFixed(1),sector:x.sector,s:x.s,lap:x.lap,merge:!!x.merge,district:x.district?x.district.id:"",districtName:x.district?x.district.name:"",districtJp:x.district?x.district.jp:"",jct:x.jct?x.jct.name:"",jctJp:x.jct?x.jct.jp:"",toJunction:Math.max(0,Math.round(x.nextJunction-x.z)),rivalS:n.race!==!1&&x.rival?h.trackS(x.rival.z):null,copS:x.cops&&x.cops.length?h.trackS(x.cops[0].z):null,finale:x.finale,bend:(()=>{if(x.finale)return 0;let Z=h.curveAt(x.z+170),fe=h.curveAt(x.z);return Math.abs(Z)>.3&&Math.abs(Z-fe)>.3?Math.sign(Z)*Math.min(3,Math.ceil(Math.abs(Z)*3)):0})(),cam:C.cam,race:n.race!==!1,wanted:Math.floor((x.wanted||0)+1e-6),heatOnYou:Math.min(1,(x.wanted||0)%1||(x.wanted>=3?1:0)),wet:!!x.wet,aqua:x.aqua>.5,tunnel:!!x.inTunnel,sprint:!!x.sprint,zen:!!n.zen,ghost:x.ghost>0?Math.ceil(x.ghost):0,beside:!!(n.race!==!1&&x.rival&&(Math.abs(x.rival.z-x.z)<6&&Math.abs(x.rival.x-x.x)<4.4||(x.cops||[]).some(Z=>Math.abs(Z.z-x.z)<6&&Math.abs(Z.x-x.x)<4.4))&&x.strikeCd<=0),copGap:x.cops&&x.cops.length?Math.round(Math.min(...x.cops.map(Z=>x.z-Z.z))):null,cops:x.cops?x.cops.length:0,bust:Math.min(1,x.bust||0),swarm:(x.swarmT||0)>0,pos:x.pos,rivalGap:Math.round(x.rival?x.rival.z-x.z:0)})}function Pe(){S||(S=!0,q=performance.now(),f=requestAnimationFrame($))}if(e&&h.mode==="attract"){for(let x=0;x<30;x++)h.step(No);v.update(h,.016,{full:!1}),Ge(1)}let at={input:O,start(){e&&h.mode==="attract"||Pe()},pause(){F=!0,l?.engine(!1,0,!1)},resume(){S||Pe(),F=!1,q=performance.now()},isPaused:()=>F,restart(){Object.keys(O).forEach(x=>O[x]=!1),h.reset(),F=!1,S||Pe(),ee()},cycleCam(){let x=["chase","far","bumper"];return C.cam=x[(x.indexOf(C.cam)+1)%x.length],ee(),C.cam},orbit(x){C.orbit=x},get scene(){return v.scene},setView(x){C.view!==x&&b.adapt(1,!0),C.view=x,x==="showroom"&&(h.S.speed=0,h.S.x=0,h.S.vx=0,h.S.overclock=!1,h.S.slip=0,h.S.cars.length=0,h.S.shardList.length=0)},setMode(x){h.setMode(x),x==="play"&&l&&(l.unlock(),l.configure({sound:n.sound,music:n.music&&n.radio==="synth",volume:n.volume}),n.music&&n.radio==="synth"&&l.musicStart()),x!=="play"&&l?.engine(!1,0,!1)},configure(x){let Z=n.quality;n={...n,...x},e&&(n.effects="reduced"),b.setExposure(m()),h.configure(n),v.applyConfig(n),l&&(l.configure({sound:n.sound,music:n.music&&n.radio==="synth",volume:n.volume}),h.mode==="play"&&!h.S.over&&(n.music&&n.radio==="synth"?l.musicStart():l.musicStop())),Z!==n.quality&&(E=Ms(n.quality),p=1,J()),(!S||F)&&(v.update(h,0,C),b.adapt(1,!0),Ge(0))},advance(x){C.view==="showroom"&&(x=0),Object.assign(h.input,{left:O.left,right:O.right,boost:O.boost,brake:O.brake}),O.strike&&(h.input.strike=!0,O.strike=!1),O.wheelie&&(h.input.wheelie=!0,O.wheelie=!1);let Z=Math.round(x/No);for(let fe=0;fe<Z;fe++)h.step(No),fe%12===0&&v.update(h,No*12,C);v.update(h,.016,C),Ge(Math.max(.016,x)),ee()},uiSound(x){l?.unlock(),l?.sfx(x)},state:()=>h.S,drawList:()=>{let x={};return v.scene.traverseVisible(Z=>{if(!(Z.isMesh||Z.isLine||Z.isPoints))return;let fe=(Z.material?.type||"?")+(Z.isInstancedMesh?" (instanced)":"");x[fe]=x[fe]||{n:0,tris:0},x[fe].n++;let K=Z.geometry,N=K.index?K.index.count:K.attributes.position.count;x[fe].tris+=Math.round(N/3*(Z.isInstancedMesh?Z.count:1))}),x},quality:()=>E,exposureNow:()=>+(b.readExposure()*b.lens.uExposure.value).toFixed(3),get _post(){return b},stats:()=>({calls:i.info.render.calls,triangles:i.info.render.triangles,sceneCalls:b.stats.sceneCalls,sceneTriangles:b.stats.sceneTriangles,scale:p,effective:E,geometries:i.info.memory.geometries,textures:i.info.memory.textures,programs:i.info.programs?.length,pixelRatio:+i.getPixelRatio().toFixed(2),size:[s.width,s.height]}),get lens(){return b.lens},look(x){g={...x||{}},J(),b.adapt(1,!0),Ge(.016)},get mode(){return h.mode},destroy(){S=!1,cancelAnimationFrame(f),j.disconnect(),l?.engine(!1,0,!1),l?.musicStop(),b.dispose(),v.dispose(),i.dispose()}};return C.view==="showroom"&&at.setView("showroom"),at}export{ec as createRedline,i0 as getAudio,$l as webglAvailable};
