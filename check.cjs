const assert=require('node:assert/strict');
const recordingAds=require('./ads-2024.js');
global.window={FLIGHT_ADS_2024:recordingAds};
global.FLIGHT_ADS_2024=recordingAds;
const {normalizeState,toggleStandard,castVote,cubic,cubicTangent,foldPaper,projectPaper,hingePaper,choicePaperGeometry,PAPER_STAGES,ADS,POSTER_ROUTE,voteFlightPath}=require('./app.js');
assert.deepEqual(ADS,recordingAds);
assert.deepEqual(ADS.map(ad=>[ad.id,ad.votes]),[['anta',228690],['porsche',201008],['vivo',354344],['gucci',174560],['kiehls',121832],['huawei',154875]]);
assert.ok(ADS.every(ad=>ad.image.startsWith('ads-2024/')&&ad.crop.w>0&&ad.crop.h>0));
let s=normalizeState({votes:['anta','anta','unknown'],index:99,selected:[0,0,1,2,3,'4',-1]});
assert.deepEqual(s,{votes:['anta'],index:5,selected:[0,1,2,3],locked:false});
s=normalizeState(null);s=castVote(s);s=castVote(s);assert.equal(s.votes.length,1);
for(let i=0;i<ADS.length;i++)s=castVote({...s,index:i});assert.equal(s.votes.length,6);
let selected=[];for(let i=0;i<6;i++)selected=toggleStandard(selected,i);assert.deepEqual(selected,[0,1,2,3,4,5]);selected=toggleStandard(selected,1);assert.deepEqual(selected,[0,2,3,4,5]);selected=toggleStandard(selected,1);assert.deepEqual(selected,[0,2,3,4,5,1]);assert.deepEqual(toggleStandard(selected,6),selected);
assert.deepEqual(normalizeState(JSON.parse(JSON.stringify({...s,selected}))),{...s,selected});
const locked=normalizeState({votes:['anta'],index:1,selected:[5,2,0,5],locked:true});
assert.deepEqual(locked,{votes:['anta'],index:1,selected:[5,2,0],locked:true});
assert.strictEqual(castVote(locked),locked,'Generated results must lock voting, including a previously unvoted ad');
assert.deepEqual(normalizeState(JSON.parse(JSON.stringify(locked))),locked);
assert.equal(normalizeState({selected:[],locked:true}).locked,false);
const a={x:0,y:0},b={x:20,y:50},c={x:60,y:70},d={x:100,y:10};assert.deepEqual(cubic(a,b,c,d,0),a);assert.deepEqual(cubic(a,b,c,d,1),d);
console.log('PASS: six recording ads in order with verified vote counts, unique votes, locked result restoration, six selectable standards, deselection and flight-curve endpoints.');

for(let stage=0;stage<4;stage++){
 const first=foldPaper(stage,0),last=foldPaper(stage,1);assert.deepEqual(first.map(v=>[v.x,v.y]),PAPER_STAGES[stage]);assert.deepEqual(last.map(v=>[v.x,v.y]),PAPER_STAGES[stage+1]);
 for(const t of [.1,.5,.9])assert.ok(foldPaper(stage,t).every(v=>[v.x,v.y,v.z].every(Number.isFinite)));
}
console.log('PASS: a connected 11-vertex paper sheet traverses all four fold stages continuously.');

const paths=ADS.map((_,i)=>voteFlightPath(i,402,775,201,586));
for(const path of paths)assert.deepEqual(path,paths[0],'Every vote uses the same curve, time, bank and launch orientation');
assert.ok(paths.every(p=>p.destination.x>402&&p.destination.y<p.origin.y));
for(const p of paths){let angle=null;for(let i=0;i<=1000;i++){const v=cubicTangent(p.origin,p.control1,p.control2,p.destination,i/1000);assert.ok(Math.hypot(v.x,v.y)>1);assert.ok(v.x>0&&v.y<0,'All vote flights keep the original upper-right direction without backtracking');const next=Math.atan2(v.y,v.x);if(angle!==null)assert.ok(Math.abs(next-angle)<Math.PI/180);angle=next}}
console.log('PASS: all six votes use one identical upper-right flight, with no stationary tangent, reversal or extra loop.');

const wing={x:8,y:43,z:5},nose={x:170,y:20,z:0},root={x:76,y:76,z:0};
for(let i=0;i<=100;i++){const p=hingePaper(wing,nose,root,i/100*1.38);for(const anchor of [nose,root])assert.ok(Math.abs(Math.hypot(p.x-anchor.x,p.y-anchor.y,p.z-anchor.z)-Math.hypot(wing.x-anchor.x,wing.y-anchor.y,wing.z-anchor.z))<1e-10,'A wing rotates rigidly about its crease without stretching')}
assert.equal(choicePaperGeometry(3).length,6,'Six joined points define complete wings, body and folded underside');
for(let i=0;i<=300;i++)assert.ok(choicePaperGeometry(i/100).every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));
for(const join of [1,2]){const before=choicePaperGeometry(join-1e-6),after=choicePaperGeometry(join+1e-6);assert.ok(before.every((p,i)=>Math.hypot(p.x-after[i].x,p.y-after[i].y)<.001),'Folding stays connected across stage joins')}
console.log('PASS: choice wings rotate around rigid crease axes without stretching; paper projection stays finite and continuous.');

// The visible S route must remain tangent-continuous through every cubic join.
const coordinates=POSTER_ROUTE.match(/-?\d+(?:\.\d+)?/g).map(Number);
let previous={x:coordinates[0],y:coordinates[1]},lastTangent=null;
for(let i=2;i<coordinates.length;i+=6){
 const control1={x:coordinates[i],y:coordinates[i+1]},control2={x:coordinates[i+2],y:coordinates[i+3]},end={x:coordinates[i+4],y:coordinates[i+5]};
 const startTangent=cubicTangent(previous,control1,control2,end,0);
 if(lastTangent){
  const cross=lastTangent.x*startTangent.y-lastTangent.y*startTangent.x;
  assert.ok(Math.abs(cross)<1e-8);assert.ok(lastTangent.x*startTangent.x+lastTangent.y*startTangent.y>0);
 }
 for(let sample=0;sample<=100;sample++){const v=cubicTangent(previous,control1,control2,end,sample/100);assert.ok(Math.hypot(v.x,v.y)>1)}
 lastTangent=cubicTangent(previous,control1,control2,end,1);previous=end;
}
console.log('PASS: the shared gray S route has no stationary tangent or corner at any cubic join.');
