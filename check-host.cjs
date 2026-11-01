const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8'),source=fs.readFileSync('app.js','utf8'),css=fs.readFileSync('reference-2024.css','utf8');
const boot=html.match(/<script>(document\.documentElement[^<]+)<\/script>/)[1];
for(const [ua,expected]of [['Mozilla/5.0 iPhone MicroMessenger/8.0.63',true],['Mozilla/5.0 Android micromessenger/8.0.6',true],['Mozilla/5.0 MacWeChat MicroMessenger/4.0',true],['Mozilla/5.0 iPhone Safari/605.1.15',false],['Mozilla/5.0 Chrome/145.0',false]]){
 let result;vm.runInNewContext(boot,{navigator:{userAgent:ua},document:{documentElement:{classList:{toggle:(name,on)=>{assert.equal(name,'native-wechat');result=on}}}}});assert.equal(result,expected);
}
assert.ok(html.indexOf(boot)<html.indexOf('<link rel="stylesheet"'),'Detect before first paint');
assert.match(html,/<title>朋友圈广告年度评选<\/title>/);
assert.match(css,/:root.native-wechat \{ --reference-height:775px;--reference-nav:0px; \}/);
const {previewScale,AD_CARD_GAP,AD_ORBIT_RADIUS,adOrbitPose}=require('./app.js');
assert.equal(AD_CARD_GAP,42);assert.equal(AD_ORBIT_RADIUS,3200);
assert.ok(Math.abs(adOrbitPose(1,301+AD_CARD_GAP).rotation-6.15)<.05,'Wider spacing preserves the recording tilt');
for(const [w,h]of [[390,844],[375,667],[320,568]])assert.ok(previewScale(w,h,{top:0,right:0,bottom:0,left:0},775)*775<=h+.01);
const layers=[],surface={prepend:n=>layers.unshift(n),replaceChildren:()=>layers.splice(0)},context={view:'vote',reduced:()=>false,$:()=>surface,app:{},getComputedStyle:()=>context.background,background:{backgroundImage:'neutral',backgroundColor:'white'},document:{createElement:()=>{const n={style:{},remove:()=>{const i=layers.indexOf(n);if(i>=0)layers.splice(i,1)},animate:(frames,options)=>{assert.deepEqual(JSON.parse(JSON.stringify(frames)),[{opacity:1},{opacity:0}]);assert.equal(options.duration,850);return{finished:{then:done=>n.finish=done}}}};return n}}};
vm.createContext(context);vm.runInContext(source.slice(source.indexOf(' let previousVoteSurface='),source.indexOf(' function voteFeedback(')),context);
context.syncVoteSurface();assert.equal(layers.length,0);
context.background={backgroundImage:'strong-purple',backgroundColor:'white'};context.syncVoteSurface();const first=layers[0];assert.equal(first.style.backgroundImage,'neutral');
context.background={backgroundImage:'rest-purple',backgroundColor:'white'};context.syncVoteSurface();assert.equal(layers[0].style.backgroundImage,'strong-purple');assert.equal(layers[1],first,'Interrupted fades stay above the new old-surface layer');
first.finish();assert.equal(layers.length,1);context.view='choose';context.syncVoteSurface();assert.equal(layers.length,0);
const ending=fs.readFileSync('ending-2024.js','utf8'),dialog={style:{setProperty(){}}};let headerHeight=0;
const dialogContext={document:{querySelector:()=>({querySelector:()=>({getBoundingClientRect:()=>({height:headerHeight})}),getBoundingClientRect:()=>({left:25,top:16,bottom:683,width:324,height:667})})}};
vm.createContext(dialogContext);vm.runInContext(ending.slice(ending.indexOf('  function fitDialog('),ending.indexOf('  function openInfo(')),dialogContext);dialogContext.fitDialog(dialog);assert.equal(dialog.style.top,'16px');assert.equal(dialog.style.height,'667px');headerHeight=42;dialogContext.fitDialog(dialog);assert.equal(dialog.style.top,'58px');assert.equal(dialog.style.height,'625px');
console.log('PASS: WeChat-only native header before paint, browser title retained, cropped layout and dialogs fit; 42px spacing preserves tilt; interrupted 850ms background fades remain continuous.');

// Flight completion unlocks the CTA; only its click may open the packet.
const journey=source.slice(source.indexOf(' function flyPoster('),source.indexOf(' function renderResult('));
assert.ok(!journey.includes('completeJourney'));
const finishContext={app:{classList:{remove:name=>assert.equal(name,'poster-flying')}},$:()=>finishButton,announce:()=>{}};
const finishButton={disabled:true,innerHTML:''};
vm.createContext(finishContext);vm.runInContext(source.slice(source.indexOf(' function finishPoster('),source.indexOf(' function renderResult(')),finishContext);finishContext.finishPoster();assert.equal(finishButton.disabled,false);assert.match(finishButton.innerHTML,/挑选我的创意卡片/);
assert.match(source,/\$\('#save'\)\.addEventListener\('click',completeJourney\)/);
console.log('PASS: flight completion stays on the route; both normal and reduced motion require the card CTA before opening the packet.');

const {viewportLayout}=require('./app.js');
for(const native of [false,true])for(const [w,h]of [[390,844],[375,667],[320,568],[430,932],[390,620],[390,740],[844,390]]){
 const insets={top:0,right:0,bottom:34,left:0},layout=viewportLayout(w,h,insets,native,true);
 assert.ok(Math.abs(layout.scale*402-w)<.001);assert.ok(Math.abs(layout.scale*layout.height+34-h)<.001);
 assert.ok(Math.abs(layout.main+(native?0:52)-layout.height)<.001);
 assert.ok(775*layout.composition<=layout.main+.001);
}
assert.equal(viewportLayout(1280,900).mobile,false);assert.equal(viewportLayout(1280,900).composition,1);
assert.match(source,/if\(\$\('#ad-card'\)\.dataset.adId!==ad.id\)/,'A vote must not recreate the current ad image');
assert.match(source,/else finishVoteFlight\(\)/);
console.log('PASS: mobile surface fills both viewport dimensions, artwork remains uniform, browser chrome resizes and WeChat modes fit; ad image persists through focus and return.');
