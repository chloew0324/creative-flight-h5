'use strict';
const PALETTES=[
 {id:'mint',main:'#58c99b',light:'#c4f2da',dark:'#319c75',ink:'#347d64',soft:'#f0faf4'},
 {id:'rose',main:'#e6a0b3',light:'#fbe0e5',dark:'#c97b94',ink:'#a5647c',soft:'#fff6f7'},
 {id:'lilac',main:'#b0a1dc',light:'#e8e0f7',dark:'#8d7bbb',ink:'#7e6a9f',soft:'#f8f5fd'},
 {id:'apricot',main:'#ecba83',light:'#ffe7c8',dark:'#d29a62',ink:'#a57a4e',soft:'#fff9ef'},
 {id:'aqua',main:'#87cbd3',light:'#d8f1f2',dark:'#5baab7',ink:'#548b97',soft:'#f2fafb'},
 {id:'lime',main:'#bfd28c',light:'#ebf3ce',dark:'#9caf6b',ink:'#7f9259',soft:'#f8fbee'}
];
const ADS=globalThis.FLIGHT_ADS_2024||(typeof require==='function'?require('./ads-2024.js'):[]);
// Recording ad feedback is yellow / purple / yellow / pink / yellow / green.
// Keep it independent of the six creative-standard colours.
const VOTE_PALETTES=[
 {id:'apricot',main:'#ffb83e',light:'#ffe4a4',dark:'#f29d30',ink:'#cd922b',soft:'#fffde9',feedbackTop:'#fdf7c3',feedbackRestTop:'#fff7e0',feedbackMid:'#fcfcdd',feedbackGlow:'#ffdf82',feedbackBottom:'#fbfde5'},
 {id:'lilac',main:'#9869ee',light:'#dfd0ff',dark:'#7943d5',ink:'#7851b4',soft:'#f4efff',feedbackTop:'#dddefd',feedbackRestTop:'#e1e5ff',feedbackMid:'#e4e4fe',feedbackGlow:'#bcb3ff',feedbackBottom:'#e3ecfb'},
 {id:'rose',main:'#ed9bb9',light:'#ffe0ed',dark:'#d7739c',ink:'#b95a82',soft:'#fff1f6',feedbackTop:'#ffe0ef',feedbackMid:'#fce9f0',feedbackGlow:'#f9abc9',feedbackBottom:'#fff0f5'},
 {id:'mint',main:'#17ce69',light:'#b4f99b',dark:'#00ae57',ink:'#17994d',soft:'#efffe8',feedbackTop:'#ccfecd',feedbackMid:'#dbfede',feedbackGlow:'#a6f599',feedbackBottom:'#e6fee4'}
];
const votePalette=index=>VOTE_PALETTES[[0,1,0,2,0,3][index]];
const wrapAdIndex=index=>(index%ADS.length+ADS.length)%ADS.length;
// Top-centres travel on one large circle; each card follows its tangent.
// At the adjacent slots this yields the recording's visible ±6° in-plane tilt.
function adOrbitPose(position,step,arrival=1){
 const radius=3000,angle=Math.asin(step/radius)*position,growth=.58+.42*arrival;
 const x=radius*Math.sin(angle)*growth,y=radius*(1-Math.cos(angle))*growth+150*(1-arrival),rotation=angle*180/Math.PI,yaw=-rotation*.6,scale=growth*(1-.02*Math.min(6,Math.abs(position)));
 const n=value=>Number(value.toFixed(4));
 return {x,y,rotation,yaw,scale,transform:`translate3d(${n(x)}px,${n(y)}px,0) rotateZ(${n(rotation)}deg) rotateY(${n(yaw)}deg) scale(${n(scale)})`};
}
function adEntryFrames(x,step){return Array.from({length:65},(_,i)=>{
 const t=i/64,arrival=1-(1-Math.min(1,t/.7))**3;
 return {transform:adOrbitPose(x/step-3*t,step,arrival).transform,opacity:Math.min(1,t/.12),offset:t};
})}
function adSlideFrames(from,to,step){return Array.from({length:25},(_,i)=>{
 const t=i/24;return {transform:adOrbitPose(from+(to-from)*t,step).transform,offset:t};
})}
function previewScale(width,height,insets={top:0,right:0,bottom:0,left:0}){
 return Math.max(.01,Math.min(1,(width-insets.left-insets.right)/402,(height-insets.top-insets.bottom-(width>=460?32:0))/827));
}
const STANDARDS=['点子新鲜','故事动人','画面好看','文案有梗','互动好玩','细节用心'];
const CARD_COPY=[
 {line:'把日常，折成意想不到。',quote:'让好奇，带你飞向新鲜。'},
 {line:'有些故事，值得飞得更远。',quote:'总有一份心意，与你共鸣。'},
 {line:'把心动，留在这一帧。',quote:'让美好，被更多人看见。'},
 {line:'一句灵感，让会心一笑发生。',quote:'有趣的表达，自有回响。'},
 {line:'每一次参与，都是新的可能。',quote:'让快乐，在你我之间传递。'},
 {line:'那些小小的用心，都有回声。',quote:'认真，终会被温柔看见。'}
];
const STORE='creative-flight-2024-aligned-v2';
// This is both the visible dashed line and the motion rail, from the lower clouds upward.
const POSTER_ROUTE='M151 587C158 578 176 567.4 202 557C257 535 338 487.5 268 435C192 378 55 397 42 352C29 307 89 280 159 294C209 304 250 268 302 256';
const POSTER_NOSE_ANGLE=Math.atan2(60,80)*180/Math.PI;
// One connected sheet: heart, opened square, half-folded triangle, keel, open wings.
const PAPER_STAGES=[
 [[90,30],[108,12],[136,12],[157,33],[157,61],[90,137],[23,61],[23,33],[44,12],[72,12],[90,78]],
 [[90,8],[118,36],[139,57],[160,78],[125,113],[90,148],[55,113],[20,78],[48,50],[69,29],[90,78]],
 [[90,8],[62,36],[41,57],[20,78],[55,113],[90,148],[55,113],[20,78],[48,50],[69,29],[90,78]],
 [[166,20],[166,20],[104,61],[73,78],[84,105],[103,113],[84,105],[73,78],[104,61],[166,20],[93,80]],
 [[170,20],[170,20],[170,20],[103,117],[72,106],[86,75],[76,76],[8,43],[89,31.5],[170,20],[86,75]]
];
function foldPaper(stage,t){
 const from=PAPER_STAGES[stage],to=PAPER_STAGES[stage+1],ease=t*t*(3-2*t);
 return from.map((a,i)=>{const b=to[i],moving=Math.hypot(b[0]-a[0],b[1]-a[1]);return {x:a[0]+(b[0]-a[0])*ease,y:a[1]+(b[1]-a[1])*ease,z:Math.sin(t*Math.PI)*Math.min(48,moving*.5)*(i===10?0:(stage===1&&i>4?0:1))}});
}
function normalizeState(raw){
 const selected=[...new Set(Array.isArray(raw?.selected)?raw.selected.filter(i=>Number.isInteger(i)&&i>=0&&i<STANDARDS.length):[])];
 return {votes:[...new Set(Array.isArray(raw?.votes)?raw.votes.filter(id=>ADS.some(ad=>ad.id===id)):[])],index:Number.isInteger(raw?.index)?Math.max(0,Math.min(ADS.length-1,raw.index)):0,selected,locked:Boolean(raw?.locked)&&selected.length>0};
}
function toggleStandard(selected,id){if(!Number.isInteger(id)||id<0||id>=STANDARDS.length)return selected;return selected.includes(id)?selected.filter(i=>i!==id):[...selected,id]}
function castVote(state){if(state.locked)return state;const id=ADS[state.index]?.id;return id&&!state.votes.includes(id)?{...state,votes:[...state.votes,id]}:state}
function cubic(a,b,c,d,t){const u=1-t;return {x:u*u*u*a.x+3*u*u*t*b.x+3*u*t*t*c.x+t*t*t*d.x,y:u*u*u*a.y+3*u*u*t*b.y+3*u*t*t*c.y+t*t*t*d.y}}
function cubicTangent(a,b,c,d,t){const u=1-t;return {x:3*u*u*(b.x-a.x)+6*u*t*(c.x-b.x)+3*t*t*(d.x-c.x),y:3*u*u*(b.y-a.y)+6*u*t*(c.y-b.y)+3*t*t*(d.y-c.y)}}
function voteFlightPath(index,w,h,x,y){
 const i=((index%6)+6)%6,origin={x,y:y-51};
 return {index:i,origin,control1:{x:x+w*[.22,.13,.27,.18,.09,.24][i],y:origin.y-[45,85,36,68,60,52][i]},control2:{x:w*[.98,.98,.91,.96,.98,.94][i],y:h*[.40,.34,.46,.37,.41,.31][i]},destination:{x:w*1.17,y:h*[.07,.10,.04,.13,.05,.09][i]},duration:[2100,2250,2050,2300,2200,2150][i],bank:[10,13,9,11,14,12][i],pattern:i%3};
}
if(typeof module!=='undefined')module.exports={normalizeState,toggleStandard,castVote,cubic,cubicTangent,foldPaper,PAPER_STAGES,ADS,STANDARDS,POSTER_ROUTE,CARD_COPY,voteFlightPath,votePalette,adEntryFrames,adOrbitPose,adSlideFrames,wrapAdIndex,previewScale};
if(typeof document!=='undefined'){
 const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],app=$('#app');
 let entryController=null;
 const standardPaper=i=>PALETTES[[0,3,1,4,2,5][i]];
 const asset=name=>globalThis.FLIGHT_ASSETS?.[name]||'assets/'+name;
 const choiceFrames=new Map();
 let currentCard='0',fontPromise=null,savingArtwork=false;
 let state=normalizeState(null),view='cover',busy=false,frame=0,journeyFrame=0,journeyTimer=0,toastTimer=0,transitionTimer=0,uid=0,pointer=null;
 try{state=normalizeState(JSON.parse(localStorage.getItem(STORE)||'null'))}catch{}
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 function saveState(){try{localStorage.setItem(STORE,JSON.stringify(state))}catch{}}
 function theme(p){app.style.setProperty('--accent',p.main);app.style.setProperty('--soft',p.soft);app.style.setProperty('--dark',p.dark);app.style.setProperty('--ink',p.ink)}
 function voteFeedback(active,p){
  app.classList.toggle('vote-feedback',active);document.body.classList.toggle('vote-feedback',active);
  document.body.classList.toggle('vote-view',view==='vote');
  for(const target of [app,document.body])for(const key of ['top','mid','glow','bottom'])target.style.setProperty('--feedback-'+key,p['feedback'+key[0].toUpperCase()+key.slice(1)]||'#fff');
  for(const target of [app,document.body]){target.style.setProperty('--feedback-rest-top',p.feedbackRestTop||p.feedbackMid||'#fff');target.style.setProperty('--feedback-glow-soft',(p.feedbackGlow||'#ffffff')+'24')}
  syncVotePhase();
 }
 function syncVotePhase(){
  const vote=$('#vote'),phase=view!=='vote'?'off':vote.classList.contains('entering')?'entry':vote.classList.contains('browsing')?'browsing':vote.classList.contains('flying')?'voting':state.votes.includes(ADS[state.index].id)?'voted':'idle';
  app.dataset.votePhase=phase;document.body.dataset.votePhase=phase;
 }
 function setAdBrowsing(active){$('#vote').classList.toggle('browsing',active);syncVotePhase()}
 function heart(p){
  const id='h'+uid++;
  return `<svg class="heart-svg origami-heart" viewBox="0 0 180 160" aria-hidden="true"><defs><linearGradient id="${id}paper" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="${p.light}"/><stop offset=".45" stop-color="${p.main}"/><stop offset="1" stop-color="${p.main}"/></linearGradient><linearGradient id="${id}shade" x1="0" y1="0" x2="1" y2=".7"><stop stop-color="${p.main}"/><stop offset="1" stop-color="${p.dark}"/></linearGradient></defs><g transform="translate(10 0)"><path d="M80 30 62 12H34L13 33V61L80 137 147 61V33L126 12H98Z" fill="url(#${id}paper)"/><path d="M80 30 98 12H126L147 33V61L80 137Z" fill="url(#${id}shade)" opacity=".7"/><path d="M34 12H62L80 30 48 43 13 33Z" fill="${p.light}" opacity=".56"/><path d="M98 12H126L147 33 112 43 80 30Z" fill="${p.light}" opacity=".29"/><path d="M13 61 80 93V137Z" fill="${p.dark}" opacity=".23"/><path d="M147 61 80 93V137Z" fill="${p.light}" opacity=".18"/><path d="M13 33 48 43 80 30M80 30 112 43 147 33" fill="none" stroke="white" stroke-opacity=".42" stroke-width=".65"/><path d="M13 61 80 93 147 61" fill="none" stroke="${p.dark}" stroke-opacity=".15" stroke-width=".65"/><path d="M80 30V136" fill="none" stroke="${p.dark}" stroke-opacity=".26" stroke-width="1.3"/><path d="M79.35 31V135" fill="none" stroke="white" stroke-opacity=".75" stroke-width=".65"/><path d="M34 12H62L80 30 98 12H126L147 33" fill="none" stroke="white" stroke-opacity=".6" stroke-width=".6"/></g></svg>`;
 }
 function plane(p,{opacity=1}={}){
  const id='p'+uid++;
  if(globalThis.FLIGHT_VISUALS){
   const tint={mint:[1,0,.56],rose:[-.36,.4,.25],lilac:[.12,.28,-.33],apricot:[-.36,.12,.55],aqua:[.7,-.06,-.19],lime:[.01,-.15,.5]}[p.id];
   const matrix=tint.map(c=>`${c} ${1-c} 0 0 0`).join(' ')+' 0 0 0 1 0';
   return `<svg class="plane-svg paper-plane" viewBox="0 0 180 160" aria-hidden="true" style="opacity:${opacity}"><defs><filter id="${id}tint" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${matrix}"/></filter></defs><svg x="8" y="20" width="162" height="113" viewBox="132 69 1322 922" overflow="visible"><image href="${globalThis.FLIGHT_VISUALS.plane}" width="1536" height="1024" filter="url(#${id}tint)"/></svg></svg>`;
  }
  return `<svg class="plane-svg paper-plane" viewBox="0 0 180 160" aria-hidden="true" style="opacity:${opacity}"><defs><linearGradient id="${id}far" x1=".2" y1="0" x2=".7" y2="1"><stop stop-color="${p.light}"/><stop offset=".55" stop-color="${p.light}"/><stop offset="1" stop-color="${p.main}"/></linearGradient><linearGradient id="${id}near" x1=".2" y1="0" x2=".95" y2="1"><stop stop-color="${p.light}"/><stop offset=".36" stop-color="${p.main}"/><stop offset="1" stop-color="${p.dark}"/></linearGradient><linearGradient id="${id}keel" x1="0" y1="1" x2="1" y2="0"><stop stop-color="${p.dark}"/><stop offset="1" stop-color="${p.main}"/></linearGradient></defs><path class="plane-keel" d="M76 76 72 106 170 20Z" fill="url(#${id}keel)"/><path class="wing-light" d="M8 43 170 20 76 76Z" fill="url(#${id}far)"/><path d="M8 43 170 20 65 55Z" fill="white" opacity=".15"/><path d="M72 106 103 117 86 75Z" fill="${p.light}"/><path class="wing-near" d="M86 75 170 20 103 117Z" fill="url(#${id}near)"/><path d="M76 76 170 20 86 75 72 106Z" fill="${p.dark}" opacity=".24"/><path d="M8 43 170 20 103 117" fill="none" stroke="white" stroke-opacity=".75" stroke-width=".65" stroke-linejoin="round"/><path d="M76 76 170 20 86 75" fill="none" stroke="white" stroke-opacity=".85" stroke-width=".75" stroke-linejoin="round"/><path d="M86 75 103 117" fill="none" stroke="${p.dark}" stroke-opacity=".2" stroke-width=".55"/></svg>`;
 }
 function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2300)}
 function announce(message){$('#announcement').textContent=message}
 function closeDialogs(){$$('dialog[open]').forEach(d=>d.close())}
 function stopFlight(){cancelAnimationFrame(frame);frame=0;$('#flight').hidden=true;$('#flight').classList.remove('flight-running');$('#vote').classList.remove('flying');busy=false}
 function show(next,{entry=false,fly=false}={}){
  if(next==='journey'){next='result';fly=true}
  if(busy&&view==='vote')return;
  if(state.locked&&['vote','choose'].includes(next))next='cards';
  if(['choose','journey','result','cards'].includes(next)&&!state.votes.length){toast('先为一个喜欢的作品投票吧');next='vote'}
  if(['journey','result','cards'].includes(next)&&!state.selected.length)next='choose';
  if(['result','cards','gift'].includes(next)&&!state.locked)next='choose';
  choiceFrames.forEach(id=>cancelAnimationFrame(id));choiceFrames.clear();
  cancelAnimationFrame(journeyFrame);clearTimeout(journeyTimer);clearTimeout(transitionTimer);stopFlight();app.classList.remove('poster-flying');closeDialogs();view=next;app.dataset.view=next;
  $$('.page').forEach(el=>el.hidden=el.id!==next);$('#vote').classList.remove('entering','browsing');pointer=null;$('#back').textContent='×';theme(PALETTES[0]);voteFeedback(false,PALETTES[0]);
  if(next==='cover')entryController?.showHome();else entryController?.cancel();
  if(next==='vote'){renderVote();if(entry&&!reduced())enterAds()}
  if(next==='choose')renderChoices();if(next==='result'){renderResult();if(fly)flyPoster()}if(next==='cards')renderCards();
  $('.wechat span').textContent='朋友圈广告年度评选';
  if(next==='gift')globalThis.FLIGHT_ENDING?.afterShowGift();
  fitPreview();
  window.scrollTo({top:0,behavior:'instant'});const h=$('#'+next+' h1');if(h){h.tabIndex=-1;h.focus({preventScroll:true})}
 }
 function adArtwork(ad){const {x,y,w,h}=ad.crop;return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" role="img" aria-label="${ad.title}，录屏原广告内容"><image href="${asset(ad.image)}" width="${ad.frameWidth}" height="${ad.frameHeight}"/></svg>`}
 function renderVote(){
  const ad=ADS[state.index],p=votePalette(state.index),voted=state.votes.includes(ad.id);theme(p);voteFeedback(voted,p);
  $('#ad-title').textContent=ad.title;$('#ad-votes').textContent=(ad.votes+Number(voted)).toLocaleString('en-US');$('#ad-brand').textContent=ad.brand;$('#ad-image').innerHTML=adArtwork(ad);$('#ad-image').setAttribute('aria-label',ad.title);$('#vote-count').textContent=state.votes.length;
  $('#ad-history').textContent=ad.id==='porsche'?'你去年为保时捷投过票':ad.id==='gucci'?'你去年为GUCCI投过票':'';
  $('#vote-heart').innerHTML=heart(p);$('#vote-button').hidden=voted;$('#vote-button').disabled=busy;$('#voted').hidden=!voted;$('.voted-icon').innerHTML=heart(p);$('#next').disabled=!state.votes.length||busy;
  $('#next').textContent=state.votes.length?'下一步':'快去投票';
  if(!busy){$('#ad-card').style.transform=adOrbitPose(0,slideStep()).transform;syncNeighbors()}
 }
 function slideStep(){return $('#ad-card').offsetWidth+20}
 function makeSlide(index){
  const ad=ADS[index],p=votePalette(index),clone=$('#ad-card').cloneNode(true),voted=state.votes.includes(ad.id);
  clone.querySelector('#ad-image').innerHTML=adArtwork(ad);clone.querySelector('#vote-heart').innerHTML=heart(p);clone.querySelector('#ad-brand').textContent=ad.brand;clone.querySelector('#vote-button').hidden=voted;clone.querySelector('#voted').hidden=!voted;clone.querySelector('#voted').classList.add('voted-state');clone.querySelector('.voted-icon').innerHTML=heart(p);
  for(const node of [clone,...clone.querySelectorAll('[id]')])node.removeAttribute('id');clone.className='ad-card ad-clone';clone.style.transform='';clone.setAttribute('aria-hidden','true');clone.inert=true;clone.style.setProperty('--accent',p.main);clone.style.setProperty('--dark',p.dark);return clone;
 }
 function syncNeighbors(){
  $$('.ad-clone').forEach(el=>el.remove());
  const step=slideStep();for(const direction of [-1,1]){const slide=makeSlide(wrapAdIndex(state.index+direction));slide.dataset.direction=direction;slide.style.transform=adOrbitPose(direction,step).transform;$('#carousel').append(slide)}
 }
 function enterAds(){
  busy=true;renderVote();$('#vote').classList.add('entering');$$('.ad-clone').forEach(el=>el.remove());const step=slideStep(),cards=[];
  voteFeedback(false,votePalette(state.index));
  for(let i=0;i<5;i++){const el=i===3?$('#ad-card'):makeSlide(wrapAdIndex(state.index+i-3));if(i!==3)$('#carousel').append(el);cards.push({el,x:i*step})}
  const animations=cards.map(({el,x})=>el.animate(adEntryFrames(x,step),{duration:2600,easing:'cubic-bezier(.2,.55,.14,1)',fill:'forwards'}));
  transitionTimer=setTimeout(()=>{animations.forEach(a=>a.cancel());busy=false;$('#vote').classList.remove('entering');renderVote()},2650);
 }
 function paintDrag(dx){const step=slideStep(),shift=dx/step;$('#ad-card').style.transform=adOrbitPose(shift,step).transform;$$('.ad-clone').forEach(el=>el.style.transform=adOrbitPose(Number(el.dataset.direction)+shift,step).transform)}
 function moveAd(direction){
  if(busy||view!=='vote')return;const previous=state.index,next=wrapAdIndex(previous+direction);
  if(reduced()){state.index=next;saveState();setAdBrowsing(false);renderVote();return}
  const card=$('#ad-card'),step=slideStep(),offset=pointer?.dx||0,outgoing=makeSlide(state.index);outgoing.classList.add('ad-outgoing');busy=true;pointer=null;setAdBrowsing(true);$$('.ad-clone').forEach(el=>el.remove());$('#carousel').append(outgoing);state.index=next;saveState();renderVote();card.style.transform='';
  const duration=Math.max(240,450-Math.abs(offset)*.4),options={duration,easing:'cubic-bezier(.2,.75,.2,1)',fill:'forwards'};
  const shift=offset/step,out=outgoing.animate(adSlideFrames(shift,-direction,step),options);
  const incoming=card.animate(adSlideFrames(direction+shift,0,step),options);
  const companions=[-direction,2*direction].map(position=>{const el=makeSlide(wrapAdIndex(previous+position));$('#carousel').append(el);return el.animate(adSlideFrames(position+shift,position-direction,step),options)});
  $('.vote-heading').animate([{opacity:.12},{opacity:1}],{duration:350});incoming.finished.then(()=>{incoming.cancel();out.cancel();companions.forEach(a=>a.cancel());busy=false;setAdBrowsing(false);renderVote()});
 }
 function vote(){if(busy||state.locked||state.votes.includes(ADS[state.index].id))return;state=castVote(state);saveState();launchFlight()}
 function launchFlight(){
  if(busy||view!=='vote')return;
  if(reduced()){renderVote();announce('喜欢，已启航。已投'+state.votes.length+'票。');toast('喜欢，已启航。');return}
  busy=true;const p=votePalette(state.index),overlay=$('#flight'),fold=$('#fold-heart'),flyer=$('#flying-plane'),canvas=$('#flight-canvas'),ctx=canvas.getContext('2d'),button=$('#vote-button');
  const launch=$('.heart-area').getBoundingClientRect(),bounds=app.getBoundingClientRect(),top=$('.wechat').offsetHeight,w=app.clientWidth,h=app.clientHeight-top,heartRect=(button.hidden?$('.voted-icon'):button).getBoundingClientRect(),coordinateScale=w/bounds.width,heartWidth=heartRect.width*coordinateScale||164,heartHeight=heartRect.height*coordinateScale||146,x0=heartRect.width?(heartRect.x-bounds.x)*coordinateScale+heartWidth/2:(launch.x-bounds.x+launch.width/2)*coordinateScale,y0=heartRect.height?(heartRect.y-bounds.y)*coordinateScale-top+heartHeight/2:(launch.y-bounds.y+launch.height/2)*coordinateScale-top-9;
  const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
  fold.style.width=heartWidth+'px';fold.style.height=heartHeight+'px';fold.style.left=x0-heartWidth/2+'px';fold.style.top=y0-heartHeight/2+'px';fold.style.opacity='1';fold.style.transform='none';
  fold.innerHTML=`<svg class="folding-paper" viewBox="0 0 180 160" aria-hidden="true"><g>${Array.from({length:10},()=>'<polygon stroke="white" stroke-opacity=".24" stroke-width=".55" stroke-linejoin="round"/>').join('')}</g><path class="paper-outline" fill="none" stroke="white" stroke-opacity=".68" stroke-width=".7" stroke-linejoin="round"/><path class="paper-crease" fill="none" stroke="${p.ink}" stroke-opacity=".22" stroke-width=".7"/></svg>`;
  const faces=[...fold.querySelectorAll('polygon')],outline=fold.querySelector('.paper-outline'),crease=fold.querySelector('.paper-crease');
  flyer.style.width=heartWidth+'px';flyer.style.height=heartHeight+'px';flyer.innerHTML=plane(p);flyer.style.opacity='0';$('#flight-copy').style.top='85px';$('#flight-copy span').textContent='把喜欢，折成远方。';$('#flight-copy small').textContent='';
  overlay.hidden=false;overlay.classList.remove('flight-running');void overlay.offsetWidth;overlay.classList.add('flight-running');$('#vote').classList.add('flying');renderVote();
  const profile=voteFlightPath(state.index,w,h,x0,y0),{origin,control1,control2,destination}=profile;overlay.dataset.flightVariant=String(profile.index);canvas.dataset.effect=['paper-petals','prism-glints','wind-orbits'][profile.pattern];
  const trail=[],sparks=[],start=performance.now(),steps=[{at:0,duration:210},{at:210,duration:220},{at:430,duration:260},{at:690,duration:340}],foldEnd=1030,takeoffAt=1130,flightDuration=profile.duration;let lastSpark=0;
  function pointAt(t){return cubic(origin,control1,control2,destination,t)}
  function drawAtmosphere(elapsed){
   const pulse=Math.max(0,Math.min(1,(elapsed-180)/1000)),fade=Math.max(0,1-(elapsed-1550)/1500);
   if(pulse>0&&fade>0){const radius=45+pulse*115,glow=ctx.createRadialGradient(x0,y0-25,3,x0,y0-25,radius);glow.addColorStop(0,p.light);glow.addColorStop(1,'#ffffff00');ctx.globalAlpha=Math.sin(pulse*Math.PI*.8)*fade*.24;ctx.fillStyle=glow;ctx.beginPath();ctx.arc(x0,y0-25,radius,0,Math.PI*2);ctx.fill();}
   for(let i=0;i<18;i++){
    const age=elapsed-(420+i%6*115),life=1700+i%3*180,t=age/life;if(t<=0||t>=1)continue;
    const side=i%2?1:-1,edge=side<0?24+i%4*11:w-24-i%4*11,x=edge+Math.sin(t*Math.PI*1.3+i)*9,y=h*(.2+(i%9)*.068)-t*(38+i%4*12),size=3.1+(i%4)*.7;
    ctx.save();ctx.translate(x,y);ctx.rotate(i*.8+t*(side*.7));ctx.globalAlpha=Math.sin(t*Math.PI)*(.38+(i%3)*.06);
    if((i+profile.pattern)%3===0){ctx.strokeStyle=i%4?p.main:p.dark;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-size*1.5,0);ctx.quadraticCurveTo(0,0,0,-size*1.5);ctx.quadraticCurveTo(0,0,size*1.5,0);ctx.quadraticCurveTo(0,0,0,size*1.5);ctx.quadraticCurveTo(0,0,-size*1.5,0);ctx.stroke()}
    else{ctx.fillStyle=p.light;ctx.beginPath();ctx.moveTo(0,-size*1.6);ctx.lineTo(size,0);ctx.lineTo(0,size*1.4);ctx.lineTo(-size*.8,0);ctx.closePath();ctx.fill();ctx.fillStyle=p.main;ctx.globalAlpha*=.72;ctx.beginPath();ctx.moveTo(0,-size*1.6);ctx.lineTo(size,0);ctx.lineTo(0,size*1.4);ctx.closePath();ctx.fill()}
    ctx.restore();
   }
   const t=(elapsed-700)/2300;if(t>0&&t<1){ctx.save();ctx.globalAlpha=Math.sin(t*Math.PI)*.18;ctx.strokeStyle=p.main;ctx.lineWidth=1.1;ctx.lineCap='round';for(let k=0;k<2;k++){const side=k?1:-1,x=k?w-42:30,y=h*(k?.47:.72)-t*48;ctx.beginPath();ctx.moveTo(x-side*34,y+34);ctx.bezierCurveTo(x+side*20,y+12,x-side*24,y-55,x+side*12,y-78);ctx.stroke();}if(profile.pattern===2){ctx.globalAlpha*=.6;ctx.beginPath();ctx.ellipse(x0,y0-29,66+t*74,(18+t*23),-.32,Math.PI*.1,Math.PI*1.6);ctx.stroke()}ctx.restore();}
   ctx.globalAlpha=1;
  }
  function drawPaper(elapsed){
   let stage=0,t=0;for(let i=0;i<steps.length;i++)if(elapsed>=steps[i].at){stage=i;t=Math.min(1,(elapsed-steps[i].at)/steps[i].duration)}
   const nodes=foldPaper(stage,t),angle=(stage===2?Math.sin(t*Math.PI)*.14:0),project=point=>{const x=point.x-90,z=point.z,rx=x*Math.cos(angle)-z*Math.sin(angle),rz=x*Math.sin(angle)+z*Math.cos(angle),perspective=460/(460-rz);return {x:90+rx*perspective,y:80+(point.y-80)*perspective}},points=nodes.map(project),center=points[10];
   const heartShades=[p.main,p.main,p.main,p.dark,p.main,p.main,p.main,p.light,p.light,p.main],planeShades=[p.main,p.main,p.main,p.light,p.dark,p.dark,p.light,p.light,p.light,p.light];
   faces.forEach((face,i)=>{const a=points[i],b=points[(i+1)%10];face.setAttribute('points',`${center.x},${center.y} ${a.x},${a.y} ${b.x},${b.y}`);face.setAttribute('fill',stage===0&&t<.35?heartShades[i]:stage>=2?planeShades[i]:i<5?p.main:p.light);face.setAttribute('fill-opacity',stage===0&&t<.35?(i===3?'.6':'1'):'1')});
   outline.setAttribute('d',points.slice(0,10).map((v,i)=>(i?'L':'M')+v.x+' '+v.y).join('')+'Z');crease.setAttribute('d',`M${points[0].x} ${points[0].y}L${center.x} ${center.y}L${points[5].x} ${points[5].y}M${points[3].x} ${points[3].y}L${center.x} ${center.y}L${points[7].x} ${points[7].y}`);
   const lift=Math.min(1,elapsed/750),scale=1+Math.min(1,elapsed/750)*.15;
   fold.style.transform=`translateY(${-51*lift}px) rotateX(${Math.sin(elapsed/900)*3}deg) scale(${scale})`;fold.style.opacity=String(elapsed>foldEnd?Math.max(0,1-(elapsed-foldEnd)/100):1);
  }
  function draw(now){
   const elapsed=now-start;ctx.clearRect(0,0,w,h);drawAtmosphere(elapsed);
   if(elapsed<takeoffAt)drawPaper(elapsed);
   if(elapsed>=foldEnd){
    const t=Math.max(0,Math.min(1,(elapsed-takeoffAt)/flightDuration)),pos=t>0?pointAt(t):origin,tangent=cubicTangent(origin,control1,control2,destination,t);
    const angle=(Math.atan2(tangent.y,tangent.x)*180/Math.PI+POSTER_NOSE_ANGLE)*Math.min(1,(elapsed-foldEnd)/120);
    const scale=t===0?1.15:1.15+Math.sin(Math.min(1,t/.4)*Math.PI)*.10-t*.79,roll=-Math.sin(t*Math.PI)*profile.bank;
    flyer.style.opacity=String(Math.min(1,(elapsed-foldEnd)/100)*(t>.93?(1-t)/.07:1));flyer.style.transform=`translate3d(${pos.x-heartWidth/2}px,${pos.y-heartHeight/2}px,0) rotate(${angle}deg) rotateX(${roll}deg) scale(${scale})`;
    if(t>0){$('#flight-copy span').textContent='喜欢，已启航。';trail.push({x:pos.x,y:pos.y,time:now,scale});if(now-lastSpark>34){lastSpark=now;sparks.push({x:pos.x+(Math.random()-.5)*10,y:pos.y+(Math.random()-.5)*10,vx:(Math.random()-.5)*14,vy:14+Math.random()*18,born:now,life:500+Math.random()*350,size:Math.random()*1.6+.6,star:Math.random()>.65})}}
   }
   while(trail.length&&now-trail[0].time>1100)trail.shift();
   if(trail.length>2){
    for(let ribbon=0;ribbon<3;ribbon++)for(let i=1;i<trail.length;i++){
     const a=trail[i-1],b=trail[i],life=1-(now-b.time)/1100,fraction=i/trail.length,offset=(ribbon-1)*5*b.scale;
     ctx.beginPath();ctx.moveTo(a.x+offset,a.y+offset*.7);ctx.lineTo(b.x+offset,b.y+offset*.7);ctx.lineCap='round';ctx.strokeStyle=p.main;ctx.globalAlpha=life*fraction*(ribbon===1?.18:.14);ctx.lineWidth=(ribbon===1?17:1.6)*b.scale;ctx.shadowColor=p.light;ctx.shadowBlur=ribbon===1?14:0;ctx.stroke();
    }
    ctx.shadowBlur=0;ctx.globalAlpha=1;
    for(let i=0;i<trail.length;i+=5){const a=trail[i],life=1-(now-a.time)/1100;ctx.globalAlpha=life*.5;ctx.fillStyle=p.light;ctx.beginPath();ctx.arc(a.x,a.y,1.5*a.scale,0,Math.PI*2);ctx.fill()}
   }
   for(let i=sparks.length-1;i>=0;i--){const s=sparks[i],age=now-s.born,t=age/1000;if(age>s.life){sparks.splice(i,1);continue}const alpha=(1-age/s.life)*.75,x=s.x+s.vx*t,y=s.y+s.vy*t;ctx.globalAlpha=alpha;ctx.fillStyle=i%4===0?'#fff':p.main;ctx.beginPath();if(s.star){ctx.moveTo(x,y-s.size*2.2);ctx.quadraticCurveTo(x+.5,y-.5,x+s.size*2.2,y);ctx.quadraticCurveTo(x+.5,y+.5,x,y+s.size*2.2);ctx.quadraticCurveTo(x-.5,y+.5,x-s.size*2.2,y);ctx.quadraticCurveTo(x-.5,y-.5,x,y-s.size*2.2)}else ctx.arc(x,y,s.size,0,Math.PI*2);ctx.fill()}
   ctx.globalAlpha=1;
   if(elapsed<takeoffAt+flightDuration+370)frame=requestAnimationFrame(draw);else{stopFlight();renderVote();announce('喜欢，已启航。已投'+state.votes.length+'票，可以继续浏览或进入下一步。')}
  }
  frame=requestAnimationFrame(draw);
 }
 function paperSheet(p){
  return `<svg class="choice-paper-svg" viewBox="0 0 180 160" aria-hidden="true"><g>${Array.from({length:10},()=>'<polygon stroke="white" stroke-opacity=".32" stroke-width=".7" stroke-linejoin="round"/>').join('')}</g><path class="sheet-edge" fill="none" stroke="${p.dark}" stroke-opacity=".15" stroke-width=".8"/><path class="sheet-crease" fill="none" stroke="white" stroke-opacity=".8" stroke-width="1"/><path class="sheet-tab" d="M118 36 111 57H139Z" fill="${p.light}" stroke="white" stroke-opacity=".7" stroke-width=".7"/></svg>`;
 }
 function drawChoiceSheet(button,p,value){
  button.dataset.foldValue=String(value);button.classList.toggle('show-plane',value>2.82);
  const stage=1+Math.min(2,Math.floor(value)),t=value>=3?1:value%1,points=foldPaper(stage,t).map(v=>{const perspective=460/(460-v.z);return {x:90+(v.x-90)*perspective,y:80+(v.y-80)*perspective}}),center=points[10];
  button.querySelectorAll('.choice-paper-svg polygon').forEach((face,i)=>{const a=points[i],b=points[(i+1)%10];face.setAttribute('points',`${center.x},${center.y} ${a.x},${a.y} ${b.x},${b.y}`);face.setAttribute('fill',i<5?p.main:p.light);face.setAttribute('fill-opacity',String(i<5?.48+Math.min(1,value)*.52:1))});
  button.querySelector('.sheet-edge').setAttribute('d',points.slice(0,10).map((v,i)=>(i?'L':'M')+v.x+' '+v.y).join('')+'Z');
  button.querySelector('.sheet-crease').setAttribute('d',`M${points[0].x} ${points[0].y}L${center.x} ${center.y}L${points[5].x} ${points[5].y}M${points[3].x} ${points[3].y}L${center.x} ${center.y}L${points[7].x} ${points[7].y}`);
  button.querySelector('.sheet-tab').style.opacity=String(Math.max(0,1-value*3));
 }
 function updateChoiceCount(){$('#selected-count').textContent=state.selected.length;$('#release').disabled=state.selected.length===0}
 function animateChoice(button,p,pressed){
  cancelAnimationFrame(choiceFrames.get(button));button.setAttribute('aria-pressed',String(pressed));
  if(reduced()){button.classList.remove('is-folding');drawChoiceSheet(button,p,pressed?3:0);return}
  const start=performance.now(),from=Number(button.dataset.foldValue),target=pressed?3:0,duration=Math.max(160,(pressed?540:420)*Math.abs(target-from)/3);button.classList.add('is-folding');
  function draw(now){const t=Math.min(1,(now-start)/duration),value=from+(target-from)*t;drawChoiceSheet(button,p,value);button.classList.toggle('show-plane',value>2.82);if(t<1)choiceFrames.set(button,requestAnimationFrame(draw));else{button.classList.remove('is-folding');choiceFrames.delete(button)}}
  draw(start);
 }
 function renderChoices(){
  theme(PALETTES[0]);$('#chosen-ad-count').textContent=state.votes.length;$('#choices').innerHTML=STANDARDS.map((label,i)=>{const p=standardPaper(i),pressed=state.selected.includes(i),paperCrop=[[1017,370,.6631578],[1017,370,.6631578],[1020,543,.684783],[1020,543,.684783],[780,706,.6631578],[1014,704,.649485]][i],airCrop=i===2?[780,532,.65625]:[784,365,.6631578];return `<button class="choice" data-standard="${i}" aria-label="${label}" aria-pressed="${pressed}" style="--accent:${p.main};--dark:${p.ink};--paper-x:${paperCrop[0]};--paper-y:${paperCrop[1]};--paper-scale:${paperCrop[2]};--air-x:${airCrop[0]};--air-y:${airCrop[1]};--air-scale:${airCrop[2]};--air-hue:${[0,-112,0,53,122,-69][i]}deg"><span class="choice-paper-photo" aria-hidden="true"></span><span class="choice-index" aria-hidden="true">${String(i+1).padStart(2,'0')}</span><span class="choice-sheet">${paperSheet(p)}</span><span class="choice-aircraft"><span class="choice-plane-photo" aria-hidden="true"></span></span><span class="choice-label">${label}</span></button>`}).join('');
  $$('.choice').forEach(button=>drawChoiceSheet(button,standardPaper(Number(button.dataset.standard)),button.getAttribute('aria-pressed')==='true'?3:0));updateChoiceCount();
 }
 // Use the browser's SVG arc length for both artwork placement and animation.
 function routeSample(path,distance,direction=1){
  const length=path.getTotalLength(),d=Math.max(0,Math.min(length,distance)),point=path.getPointAtLength(d);
  const before=path.getPointAtLength(Math.max(0,d-.35)),after=path.getPointAtLength(Math.min(length,d+.35));
  return {x:point.x,y:point.y,rotation:Math.atan2((after.y-before.y)*direction,(after.x-before.x)*direction)*180/Math.PI+POSTER_NOSE_ANGLE};
 }
 function planeTransform(point,w,scale=1){
  return `translate(${point.x} ${point.y}) rotate(${point.rotation}) scale(${scale}) translate(${-w/2} ${-w*160/180/2})`;
 }
 function posterSVG(selected,{exported=false,fontData=null,routeId='poster-route'}={}){
  const many=selected.length>3,route=document.createElementNS('http://www.w3.org/2000/svg','path');route.setAttribute('d',POSTER_ROUTE);
  const length=route.getTotalLength(),poses=many?[
   {end:.76,direction:1,w:137,lx:80,ly:220}, {end:.98,direction:1,w:87,lx:274,ly:211},
   {end:.61,direction:-1,w:82,lx:15,ly:419}, {end:.30,direction:1,w:82,lx:266,ly:390},
   {end:.065,direction:-1,w:82,lx:152,ly:510}, {end:.46,direction:1,w:82,lx:130,ly:448}
  ]:[{end:.76,direction:1,w:137,lx:80,ly:220},{end:.98,direction:1,w:87,lx:274,ly:211},{end:.23,direction:-1,w:91,lx:266,ly:552}];
  const fonts=fontData?`<style>@font-face{font-family:RefSans;src:url("${fontData.regular}") format("woff");font-weight:400}@font-face{font-family:RefSans;src:url("${fontData.bold}") format("woff");font-weight:600 900}@font-face{font-family:FlightHand;src:url("${fontData.hand}") format("woff");font-weight:400}</style>`:'';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 780" ${exported?'width="1170" height="2340"':''} font-family="RefSans,PingFang SC,sans-serif"><defs>${fonts}</defs><image href="${globalThis.FLIGHT_VISUALS.background}" width="390" height="780"/><g text-anchor="middle"><text x="195" y="97" font-size="34" font-weight="700" letter-spacing=".7" fill="#00b773">我的创意航线</text><text x="195" y="132" font-size="21" font-weight="700" fill="#00b773">腾讯十周年</text><text x="195" y="160" font-size="14" fill="#999e9c">谢谢你，让好创意飞得更远</text></g><path id="${routeId}" d="${POSTER_ROUTE}" fill="none" stroke="#bbc5c3" stroke-opacity=".85" stroke-width="1.15" stroke-dasharray="7 8" stroke-linecap="round"/>${selected.map((s,i)=>{const p=poses[i],distance=p.end*length,point=routeSample(route,distance,p.direction);return `<g class="poster-plane" data-width="${p.w}" data-route-end="${p.end}" data-route-distance="${distance}" data-direction="${p.direction}" transform="${planeTransform(point,p.w)}"><svg width="${p.w}" height="${p.w*160/180}" viewBox="0 0 180 160">${plane(standardPaper(s)).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'')}</svg></g><text class="poster-label" x="0" y="0" transform="translate(${p.lx} ${p.ly}) rotate(-10) skewX(-6)" font-size="${many?17:19}" font-weight="700" fill="#006d4e">${STANDARDS[s]}</text>`}).join('')}<g transform="rotate(-3 195 710)"><text x="195" y="713" text-anchor="middle" font-family="FlightHand,HanziPen SC,cursive" font-size="24" fill="#007b59">十年，因你而更有创意</text><path d="M176 736Q242 714 300 724" fill="none" stroke="#00d386" stroke-width="3.2" stroke-linecap="round"/></g></svg>`;
 }
 function flyPoster(){
  clearTimeout(journeyTimer);
  if(app.classList.contains('poster-flying'))return;
  if(reduced()){journeyTimer=setTimeout(completeJourney,500);return;}
  const route=$('#poster-route'),length=route.getTotalLength(),groups=[...$('#route-card').querySelectorAll('.poster-plane')],labels=[...$('#route-card').querySelectorAll('.poster-label')],start=performance.now(),button=$('#save');
  app.classList.add('poster-flying');button.disabled=true;button.textContent='创意正在飞行…';
  const flights=groups.map((el,i)=>{
   const w=Number(el.dataset.width),end=Number(el.dataset.routeEnd),direction=Number(el.dataset.direction);
   const from=Math.max(0,Math.min(1,end-direction*.67));
   el.style.opacity='0';labels[i].style.opacity='0';
   return {el,label:labels[i],w,end,from,direction,delay:i*160,duration:Math.max(1400,Math.abs(end-from)*4500)};
  });
  function draw(now){
   let finished=true;
   flights.forEach(f=>{
    const t=Math.max(0,Math.min(1,(now-start-f.delay)/f.duration));if(t<1)finished=false;
    // A gentle stop changes speed only; position and nose always come from the visible rail.
    const progress=t<.8?t/.9:(.8+(t-.8)-2.5*(t-.8)**2)/.9;
    const distance=(f.from+(f.end-f.from)*progress)*length,point=routeSample(route,distance,f.direction);
    f.el.style.opacity=String(Math.min(1,t*9));
    f.el.dataset.routeDistance=String(distance);
    f.el.setAttribute('transform',planeTransform(point,f.w,.72+.28*progress));
    f.label.style.opacity=String(Math.max(0,(t-.84)/.16));
   });
   if(!finished)journeyFrame=requestAnimationFrame(draw);
   else{app.classList.remove('poster-flying');button.disabled=false;button.innerHTML='挑选我的创意卡片 <span>→</span>';announce('纸飞机已沿航线抵达，你的创意航线已经完成。');journeyTimer=setTimeout(completeJourney,1000)}
  }
  journeyFrame=requestAnimationFrame(draw);
 }
 function renderResult(){theme(PALETTES[0]);$('#route-card').innerHTML=posterSVG(state.selected);$('#route-card').setAttribute('aria-label','我的创意航线：'+state.selected.map(i=>STANDARDS[i]).join('、'))}
 function completeJourney(){
  if(view!=='result')return;show('cards');
  globalThis.FLIGHT_ENDING?.openPacket({onDone:()=>announce('左右滑动，挑选你的创意卡片。')});
 }
 function cardOptions(){return [...state.selected].sort((a,b)=>a-b).map(String)}
 function cardSVG(card){return globalThis.FLIGHT_CARD_ARTWORK.svg(Number(card),{identity:globalThis.FLIGHT_IDENTITY})}
 function renderCards({animate=false}={}){
  const options=cardOptions();if(!options.includes(currentCard))currentCard=options[0];const position=options.indexOf(currentCard);
  $('#keepsake-preview').innerHTML=cardSVG(currentCard);$('#keepsake-preview').setAttribute('aria-label',STANDARDS[Number(currentCard)]+'，'+(globalThis.FLIGHT_IDENTITY?.name||'Aragakey.')+'的创意卡片');
  for(const [side,delta] of [['left',-1],['right',1]]){const index=(position+delta+options.length)%options.length,neighbor=$('.keepsake-neighbor.'+side);neighbor.innerHTML=options.length>1?cardSVG(options[index]):'';neighbor.hidden=options.length<2;}
  $('#card-dots').innerHTML=options.map((id,i)=>`<button data-card="${id}" aria-label="第${i+1}张：${STANDARDS[Number(id)]}" aria-current="${id===currentCard}" class="${id===currentCard?'active':''}"></button>`).join('');
  if(animate&&!reduced())$('#keepsake-preview').animate([{opacity:.5,transform:'translateX(16px)'},{opacity:1,transform:'none'}],{duration:240,easing:'ease-out'});
  globalThis.FLIGHT_CARD_ARTWORK.preload(options.map(Number)).catch(()=>{});
 }
 function moveCard(direction){const options=cardOptions(),next=(options.indexOf(currentCard)+direction+options.length)%options.length;currentCard=options[next];renderCards({animate:true})}
 async function artworkFonts(){
  if(globalThis.FLIGHT_FONT_DATA)return globalThis.FLIGHT_FONT_DATA;
  if(!fontPromise)fontPromise=Promise.all(['reference-sans.woff','reference-sans-bold.woff','reference-hand.woff','reference-hand-bold.woff'].map(async name=>{const response=await fetch(asset(name));if(!response.ok)throw new Error('Font unavailable');const blob=await response.blob();return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob)})})).then(([regular,bold,hand,handBold])=>({regular,bold,hand,handBold})).catch(error=>{fontPromise=null;throw error});
  return fontPromise;
 }
 async function downloadArtwork(kind,button){
  if(savingArtwork)return;savingArtwork=true;const original=button.innerHTML,card=currentCard,selected=[...state.selected];button.disabled=true;button.textContent='图片正在生成…';
  try{
   let png;
   if(kind==='card')png=await globalThis.FLIGHT_CARD_ARTWORK.toPNG(Number(card),{width:1080,identity:globalThis.FLIGHT_IDENTITY});
   else{
    const fontData=await artworkFonts(),svg=posterSVG(selected,{exported:true,fontData}),url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'})),image=new Image();
    try{await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;image.src=url});const canvas=document.createElement('canvas');canvas.width=1170;canvas.height=2340;canvas.getContext('2d').drawImage(image,0,0);png=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));}finally{URL.revokeObjectURL(url)}
   }
   if(!png)throw new Error('Unable to export');const url=URL.createObjectURL(png),a=document.createElement('a');a.href=url;a.download=kind==='card'?STANDARDS[Number(card)]+'-'+(globalThis.FLIGHT_IDENTITY?.name||'Aragakey')+'-创意卡片.png':'我的创意航线-腾讯十周年.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);toast('图片已生成，正在保存');
  }catch(error){console.error(error);toast('图片生成失败，请再试一次')}finally{savingArtwork=false;button.disabled=false;button.innerHTML=original}
 }
 function beginVoting(){
  if(state.locked){state=normalizeState(null);saveState()}
  show('vote',{entry:true});
 }
 function renderIdentity(){
  const identity=globalThis.FLIGHT_IDENTITY;$('#welcome-name').textContent=identity?.name||'Aragakey.';
  if(identity?.avatar)$('#welcome-avatar').innerHTML=`<img src="${globalThis.FLIGHT_ASSETS?.[identity.avatar.replace(/^assets\//,'')]||identity.avatar}" alt="${identity.name}的头像">`;
 }
 globalThis.FLIGHT_ENDING?.mount({onWallpaper:()=>downloadArtwork('poster',$('#gift-wallpaper')||$('#save-card')),onReplay:()=>{show('result');flyPoster()},onCards:()=>show('cards'),notify:toast});
 renderIdentity();
 $$('.home-plane').forEach((el,i)=>el.innerHTML=plane(standardPaper([0,2,4][i])));
 $('#intro-heart').innerHTML=heart({...PALETTES[0],main:'#00cf74',light:'#75ffa2',dark:'#00bb65'}).replace('</svg>','<text x="90" y="78" fill="white" font-family="Arial,sans-serif" font-size="37" font-weight="700" text-anchor="middle">TOP</text></svg>');
 $('#start').addEventListener('click',beginVoting);$('#vote-button').addEventListener('click',vote);$('#next').addEventListener('click',()=>show('choose'));
 $('#choices').addEventListener('click',event=>{const button=event.target.closest('[data-standard]');if(!button||state.locked)return;const id=Number(button.dataset.standard);state.selected=toggleStandard(state.selected,id);saveState();animateChoice(button,standardPaper(id),state.selected.includes(id));updateChoiceCount();announce('已选'+state.selected.length+'项')});
 $('#choices').addEventListener('scroll',()=>$('#choose').classList.toggle('is-scrolled',$('#choices').scrollTop>24),{passive:true});
 $('#card-dots').addEventListener('click',event=>{const button=event.target.closest('[data-card]');if(!button)return;currentCard=button.dataset.card;renderCards({animate:true})});
 $('#save-card').addEventListener('click',()=>downloadArtwork('card',$('#save-card')));$('#keepsake-preview').addEventListener('contextmenu',event=>{event.preventDefault();downloadArtwork('card',$('#save-card'))});
 $('#gift-next').addEventListener('click',()=>show('gift'));
 $('#release').addEventListener('click',()=>{if(!state.selected.length)return;state.locked=true;saveState();show('journey')});$('#save').addEventListener('click',completeJourney);$('#again').addEventListener('click',flyPoster);
 $('#back').addEventListener('click',()=>{if(busy){toast('创意正在启航，请稍等片刻');return}show('cover')});
 $('#menu').addEventListener('click',()=>{if(busy)return;$('#menu-dialog').showModal()});$('#menu-home').addEventListener('click',()=>show('cover'));$('#menu-route').addEventListener('click',()=>show('result'));$('#menu-cards').addEventListener('click',()=>show('cards'));$('#reset').addEventListener('click',()=>{closeDialogs();$('#reset-dialog').showModal()});$('#confirm-reset').addEventListener('click',()=>{state=normalizeState(null);saveState();show('cover');toast('新的创意，准备启航')});
 $$('[data-action="rules"]').forEach(button=>button.addEventListener('click',()=>{closeDialogs();$('#rules-dialog').showModal()}));$$('dialog .close').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));$$('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()}}));
 let longPress=0;
 app.addEventListener('pointerdown',event=>{if(busy||event.isPrimary===false||event.target.closest('dialog')||(event.target.closest('button')&&!(view==='cover'&&event.target.closest('#start'))))return;pointer={x:event.clientX,y:event.clientY,id:event.pointerId,dx:0,dragging:false};if(view==='cards'&&event.target.closest('#keepsake-preview'))longPress=setTimeout(()=>{pointer=null;downloadArtwork('card',$('#save-card'))},650)});
 app.addEventListener('pointermove',event=>{if(!pointer||pointer.id!==event.pointerId)return;const ratio=app.clientWidth/app.getBoundingClientRect().width;let dx=(event.clientX-pointer.x)*ratio,dy=(event.clientY-pointer.y)*ratio;if(Math.hypot(dx,dy)>8){clearTimeout(longPress);if(view==='cover'||view==='cards'){app.setPointerCapture(event.pointerId);if(event.cancelable)event.preventDefault()}}if(view!=='vote')return;if(!pointer.dragging){if(Math.abs(dy)>10&&Math.abs(dy)>Math.abs(dx)){pointer=null;return}if(Math.abs(dx)<8||Math.abs(dx)<Math.abs(dy))return;pointer.dragging=true;setAdBrowsing(true);app.setPointerCapture(event.pointerId)}pointer.dx=dx;paintDrag(dx)});
 function releasePointer(event,cancelled=false){
  clearTimeout(longPress);if(!pointer||pointer.id!==event.pointerId)return;const drag=pointer,ratio=app.clientWidth/app.getBoundingClientRect().width,dx=(event.clientX-drag.x)*ratio,dy=(event.clientY-drag.y)*ratio;pointer=null;if(app.hasPointerCapture(event.pointerId))app.releasePointerCapture(event.pointerId);
  if(!cancelled&&view==='cover'&&dy< -35&&Math.abs(dy)>Math.abs(dx)){event.preventDefault();beginVoting();return}
  if(!cancelled&&view==='cards'){if(Math.abs(dx)>35&&Math.abs(dx)>Math.abs(dy))moveCard(dx<0?1:-1);else if(dy< -40)show('gift');return}
  if(view!=='vote')return;const direction=drag.dx<0?1:-1;if(drag.dragging&&!cancelled&&Math.abs(drag.dx)>45){pointer=drag;moveAd(direction);return}
  if(drag.dragging){if(reduced()){paintDrag(0);setAdBrowsing(false);renderVote();return}const step=slideStep(),elements=[$('#ad-card'),...$$('.ad-clone')];busy=true;paintDrag(0);const animations=elements.map(el=>{const slot=Number(el.dataset.direction||0);return el.animate(adSlideFrames(slot+drag.dx/step,slot,step),{duration:230,easing:'ease-out'})});Promise.all(animations.map(a=>a.finished)).then(()=>{busy=false;setAdBrowsing(false);renderVote()})}
 }
 app.addEventListener('pointerup',event=>releasePointer(event));app.addEventListener('pointercancel',event=>releasePointer(event,true));
 document.addEventListener('keydown',event=>{if($('dialog[open]')||busy)return;if(view==='cards'){if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();moveCard(event.key==='ArrowRight'?1:-1)}else if(event.key==='ArrowDown'){event.preventDefault();show('gift')}return}if(view==='vote'&&['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();moveAd(event.key==='ArrowRight'?1:-1)}});
 $('#cover').addEventListener('wheel',event=>{if(event.deltaY>30&&view==='cover'&&!busy)beginVoting()},{passive:true});
 $('#cards').addEventListener('wheel',event=>{if(event.deltaY>40&&view==='cards')show('gift')},{passive:true});
 window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);cancelAnimationFrame(journeyFrame)});
 function fitPreview(){const height=window.visualViewport?.height||window.innerHeight,style=getComputedStyle(document.documentElement),insets=Object.fromEntries(['top','right','bottom','left'].map(side=>[side,parseFloat(style.getPropertyValue('--safe-'+side))||0]));app.style.setProperty('--preview-scale',String(previewScale(window.innerWidth,height,insets)))}
 window.addEventListener('resize',fitPreview);window.visualViewport?.addEventListener('resize',fitPreview);fitPreview();
 const entryURL=new URL(location.href);
 if(entryURL.searchParams.has('view')){entryURL.searchParams.delete('view');history.replaceState(null,'',entryURL)}
 const enterFromPreview=entryURL.searchParams.get('entry')==='vote';
 if(enterFromPreview){entryURL.searchParams.delete('entry');history.replaceState(null,'',entryURL)}
 show('cover');entryController=globalThis.FLIGHT_ENTRY?.mount($('#cover .entry-stage'));
 if(enterFromPreview){entryController?.showHome();beginVoting()}
 else if(entryController)document.fonts.ready.then(()=>entryController.restart());
}
