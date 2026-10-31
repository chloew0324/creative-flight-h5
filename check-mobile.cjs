const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('app.js','utf8');
const gestureCode=source.slice(source.indexOf(' let longPress=0;'),source.indexOf(" document.addEventListener('keydown'"));
function run(view,start,end,{button=false,cancel=false,scale=1,index=1}={}){
 const listeners={},calls=[],capture=new Set();
 const app={clientWidth:402,getBoundingClientRect:()=>({width:402*scale}),addEventListener:(name,fn)=>listeners[name]=fn,setPointerCapture:id=>capture.add(id),hasPointerCapture:id=>capture.has(id),releasePointerCapture:id=>capture.delete(id)};
 const context={app,view,busy:false,pointer:null,state:{index},ADS:[1,2,3],clearTimeout:()=>{},setTimeout:()=>1,beginVoting:()=>calls.push('vote'),show:page=>calls.push(page),moveCard:d=>calls.push('card'+d),moveAd:d=>calls.push('ad'+d),paintDrag:()=>{},$:()=>({}),$$:()=>[]};
 vm.createContext(context);vm.runInContext(gestureCode,context);
 const event=(point)=>({clientX:point[0],clientY:point[1],pointerId:1,isPrimary:true,cancelable:true,preventDefault(){},target:{closest:selector=>button&&(selector==='button'||selector==='#start')?{}:null}});
 listeners.pointerdown(event(start));listeners.pointermove(event(end));listeners[cancel?'pointercancel':'pointerup'](event(end));return calls;
}
assert.deepEqual(run('cover',[190,650],[190,530]),['vote']);
assert.deepEqual(run('cover',[190,650],[190,530],{button:true}),['vote'],'swipe beginning on start button works');
assert.deepEqual(run('cover',[190,400],[190,375],{scale:.6}),['vote'],'screen-scaled gestures use design coordinates');
assert.deepEqual(run('cover',[190,500],[190,510]),[]);
assert.deepEqual(run('cover',[190,650],[190,530],{cancel:true}),[]);
assert.deepEqual(run('cards',[190,650],[190,530]),['gift']);
assert.deepEqual(run('cards',[280,450],[100,450]),['card1']);
assert.deepEqual(run('cover',[100,450],[280,450]),[]);
assert.deepEqual(run('vote',[100,400],[250,400],{index:0}),['ad-1'],'first work connects to its visible left neighbour');
assert.deepEqual(run('vote',[250,400],[100,400],{index:2}),['ad1'],'last work connects to its visible right neighbour');
assert.match(fs.readFileSync('integration.css','utf8'),/#cover,\.phone #cards\{touch-action:none/);
console.log('PASS: cover swipe, swipe on start button, scaled touch coordinates, cancellation, card swipe and gift continuation');
