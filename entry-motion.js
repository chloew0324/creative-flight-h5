'use strict';
(() => {
const STAGES=[
 [[90,30],[108,12],[136,12],[157,33],[157,61],[90,137],[23,61],[23,33],[44,12],[72,12],[90,78]],
 [[90,8],[118,36],[139,57],[160,78],[125,113],[90,148],[55,113],[20,78],[48,50],[69,29],[90,78]],
 [[90,8],[62,36],[41,57],[20,78],[55,113],[90,148],[55,113],[20,78],[48,50],[69,29],[90,78]],
 [[166,20],[166,20],[104,61],[73,78],[84,105],[103,113],[84,105],[73,78],[104,61],[166,20],[93,80]],
 [[170,20],[170,20],[170,20],[103,117],[72,106],[86,75],[76,76],[8,43],[89,31.5],[170,20],[86,75]]
];
const DEPART=[[201,324],[472,114]],ARRIVE=[[110,837],[315,678]],TIME={grow:400,fold:720,fly:1320,exit:2020,reenter:2240,land:3120,end:3320};
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)},mix=(a,b,t)=>a+(b-a)*t;
function fold(stage,t){const e=ease(t);return STAGES[stage].map((a,i)=>{const b=STAGES[stage+1][i],moving=Math.hypot(b[0]-a[0],b[1]-a[1]),z=Math.sin(t*Math.PI)*Math.min(48,moving*.5)*(i===10?0:(stage===1&&i>4?0:1)),perspective=460/(460-z);return {x:90+(mix(a[0],b[0],e)-90)*perspective,y:80+(mix(a[1],b[1],e)-80)*perspective}})}
if(typeof module!=='undefined')module.exports={STAGES,DEPART,ARRIVE,TIME,fold};
if(typeof document==='undefined')return;
globalThis.FLIGHT_ENTRY={mount(root,{planeArtwork}={}){
const $=s=>root.querySelector(s),phone=root,paper=$('#shared-paper'),faces=$('.faces');let raf=0,start=0,arrived=false;
faces.innerHTML=Array.from({length:10},()=>'<polygon/>').join('');const polygons=[...faces.children],originalPlane=planeArtwork?document.createElementNS('http://www.w3.org/2000/svg','g'):null;
if(originalPlane){originalPlane.innerHTML=planeArtwork('mint');originalPlane.style.opacity='0';paper.querySelector('svg').append(originalPlane)}
const baseColors=['#51e995','#19d681','#0cce77','#17ce7e','#02be70','#04c775','#00b86c','#41e58e','#5cef9f','#19d27c'];
function drawPaper(value){
 const stage=Math.min(3,Math.floor(value)),t=value===4?1:value%1,points=fold(stage,t),center=points[10],finish=clamp((value-2.6)/1.4);
 polygons.forEach((face,i)=>{const a=points[i],b=points[(i+1)%10];face.setAttribute('points',`${center.x},${center.y} ${a.x},${a.y} ${b.x},${b.y}`);face.setAttribute('fill',value<2.6?baseColors[i]:i===2?'url(#paper-near)':i===3?'#effff6':i===7||i===8?'url(#paper-light)':i===6?'#22c982':baseColors[i])});
 $('.edge').setAttribute('d',points.slice(0,10).map((v,i)=>(i?'L':'M')+v.x+' '+v.y).join('')+'Z');
 $('.crease').setAttribute('d',`M${points[0].x} ${points[0].y}L${center.x} ${center.y}L${points[5].x} ${points[5].y}M${points[3].x} ${points[3].y}L${center.x} ${center.y}L${points[7].x} ${points[7].y}`);
 $('.keel').setAttribute('d',`M${points[6].x} ${points[6].y}L${points[4].x} ${points[4].y}L${points[0].x} ${points[0].y}Z`);$('.keel').style.opacity=String(finish);
 if(originalPlane){const material=clamp((value-3.45)/.55);originalPlane.style.opacity=String(material);faces.style.opacity=String(1-material);$('.edge').style.opacity=String(1-material);$('.crease').style.opacity=String(1-material);$('.keel').style.opacity=String(finish*(1-material))}
 $('.top-word').style.opacity=String(1-clamp(value*3.2));
}
function place(x,y,scale,angle,anchorY){paper.style.transform=`translate(${x}px,${y}px) rotate(${angle}deg) scale(${scale}) translate(-90px,-${anchorY}px)`;paper.dataset.centerX=x.toFixed(2);paper.dataset.centerY=y.toFixed(2);paper.dataset.rotation=angle.toFixed(2)}
function smallPlane(main,light,dark){return `<svg viewBox="0 0 180 160"><path d="M76 76 72 106 170 20Z" fill="${dark}"/><path d="M8 43 170 20 76 76Z" fill="${light}"/><path d="M72 106 103 117 86 75Z" fill="#fffdf9"/><path d="M86 75 170 20 103 117Z" fill="${main}"/><path d="M76 76 170 20 86 75 72 106Z" fill="${dark}" opacity=".32"/><path d="M8 43 170 20 103 117M76 76 170 20 86 75" fill="none" stroke="#fff" stroke-width="1.1"/></svg>`}
$('.coral').innerHTML=planeArtwork?planeArtwork('coral'):smallPlane('#faab94','#ffe0d0','#ca6e59');$('.lilac').innerHTML=planeArtwork?planeArtwork('lilac'):smallPlane('#b69be4','#e9e0fc','#7d5fac');
const underline=$('.underline path'),underLength=underline.getTotalLength();underline.style.strokeDasharray=String(underLength);
function render(elapsed){
 const phase=elapsed<TIME.grow?'intro':elapsed<TIME.fold?'grow':elapsed<TIME.fly?'fold':elapsed<TIME.exit?'exit-flight':elapsed<TIME.reenter?'between-scenes':elapsed<TIME.land?'entry-flight':'landed';phone.dataset.phase=phase;phone.dataset.elapsed=Math.round(elapsed);
 $('.intro-copy').setAttribute('aria-hidden',String(elapsed>=TIME.exit));$('.home').setAttribute('aria-hidden',String(elapsed<1920));
 const foldValue=clamp((elapsed-TIME.fold)/(TIME.fly-TIME.fold))*4;drawPaper(foldValue);
 $('.intro-copy').style.opacity=String(1-ease((elapsed-1520)/460));$('.home').style.opacity=String(ease((elapsed-1920)/470));
 const personal=ease((elapsed-2020)/430);$('.personal').style.opacity=String(personal);$('.welcome-copy').style.opacity=String(personal);$('.topic').style.opacity=String(ease((elapsed-1980)/400));
 const entry=ease((elapsed-3000)/320);$('.entry').style.opacity=String(entry);underline.style.strokeDashoffset=String(underLength*(1-entry));$('.rail-svg').style.opacity='0';
 if(elapsed>=2090&&!arrived){phone.classList.add('home-arrived');arrived=true}
 if(elapsed<TIME.fly){paper.style.opacity='1';const grow=ease((elapsed-TIME.grow)/(TIME.fold-TIME.grow));place(201,mix(324,316,grow)*(1-clamp(foldValue/4))+324*clamp(foldValue/4),mix(139/180,139/180*1.28,grow),0,mix(80,69,clamp(foldValue/4)))}
 else if(elapsed<TIME.exit){
  const t=clamp((elapsed-TIME.fly)/(TIME.exit-TIME.fly)),travel=Math.pow(t,1.4);paper.style.opacity=String(1-clamp((t-.7)/.3));place(mix(DEPART[0][0],DEPART[1][0],travel),mix(DEPART[0][1],DEPART[1][1],travel),mix(139/180*1.28,.8,ease(t)),-.9,69);
 }else if(elapsed<TIME.reenter){paper.style.opacity='0';place(DEPART[1][0],DEPART[1][1],.8,-.9,69)}
 else{
  const t=clamp((elapsed-TIME.reenter)/(TIME.land-TIME.reenter)),travel=1-Math.pow(1-t,2);paper.style.opacity=String(ease(t/.22));place(mix(ARRIVE[0][0],ARRIVE[1][0],travel),mix(ARRIVE[0][1],ARRIVE[1][1],travel),mix(.8,.76,ease(t)),-.9,69);
 }
 paper.setAttribute('aria-label',phase==='landed'?'停在开始投票旁的纸飞机':phase==='intro'||phase==='grow'?'TOP折纸爱心':phase==='fold'?'正在折成纸飞机':'正在飞入首页的纸飞机');
 if(phase==='landed')phone.dataset.landedPaperId=paper.dataset.paperId;
}
function restart(){cancelAnimationFrame(raf);phone.classList.remove('home-arrived');arrived=false;delete phone.dataset.landedPaperId;render(0);start=performance.now();if(matchMedia('(prefers-reduced-motion: reduce)').matches){render(TIME.end);return}function tick(now){const elapsed=Math.min(TIME.end,now-start);render(elapsed);if(elapsed<TIME.end)raf=requestAnimationFrame(tick)}raf=requestAnimationFrame(tick)}
function seek(elapsed){cancelAnimationFrame(raf);render(Math.max(0,Math.min(TIME.end,elapsed)))}
return {restart,seek,cancel(){cancelAnimationFrame(raf)},showHome(){seek(TIME.end)}};
}};
const demo=document.querySelector('[data-entry-demo]');
if(demo){const continueURL=new URL('index.html?entry=vote',document.currentScript.src).href;let touchStart=null;demo.addEventListener('pointerdown',e=>{touchStart={x:e.clientX,y:e.clientY}});demo.addEventListener('pointerup',e=>{if(touchStart&&demo.dataset.phase==='landed'&&e.clientY-touchStart.y< -35&&Math.abs(e.clientY-touchStart.y)>Math.abs(e.clientX-touchStart.x))location.href=continueURL;touchStart=null});demo.addEventListener('wheel',e=>{if(e.deltaY>35&&demo.dataset.phase==='landed')location.href=continueURL},{passive:true});const controller=globalThis.FLIGHT_ENTRY.mount(demo);addEventListener('message',event=>{if(event.origin!==location.origin)return;if(event.data==='restart-intro')controller.restart();if(event.data&&event.data.type==='seek-intro'&&Number.isFinite(event.data.time))controller.seek(event.data.time)});document.fonts.ready.then(()=>{const frame=new URLSearchParams(location.search).get('frame');frame===null?controller.restart():controller.seek(Number(frame))})}
})();
