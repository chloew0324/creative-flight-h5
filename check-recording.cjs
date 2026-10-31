const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {votePalette,adEntryFrames,previewScale,ADS}=require('./app.js');
assert.deepEqual(ADS.map((_,i)=>votePalette(i).id),['apricot','lilac','apricot','rose','apricot','mint']);
assert.equal(votePalette(1).feedbackTop,'#dddefd');
assert.equal(votePalette(5).feedbackTop,'#ccfecd');
const entry=adEntryFrames(963,321);
assert.match(entry[0].transform,/150px.*scale\(\.58\)/);
assert.match(entry[1].transform,/65px.*scale\(\.8\)/);
assert.equal(entry[2].transform,'translate3d(0px,0,0) rotateY(0deg) scale(1)');
for(const [width,height] of [[390,844],[375,667],[320,568],[1440,900],[844,390]]){
 const insets={top:0,right:0,bottom:34,left:0},scale=previewScale(width,height,insets);
 assert.ok(402*scale<=width+.01);assert.ok(827*scale+34+(width>=460?32:0)<=height+.01);
}
// Exercise the actual shared rendering/state functions across all six works.
const source=fs.readFileSync('app.js','utf8'),nodes=new Map(),clones=[];
function node(){const classes=new Set(),properties={};return {classes,properties,style:{setProperty:(key,value)=>properties[key]=value},classList:{toggle:(key,on)=>on?classes.add(key):classes.delete(key)},setAttribute(){},append(el){clones.push(el)},remove(){clones.splice(clones.indexOf(this),1)}}}
const app=node(),body=node();
const context={app,document:{body},state:{index:0,votes:[]},view:'vote',busy:false,ADS,votePalette,theme:()=>{},heart:p=>p.id,adArtwork:ad=>ad.id,slideStep:()=>321,makeSlide:()=>({...node(),dataset:{}}),$:selector=>{if(!nodes.has(selector))nodes.set(selector,node());return nodes.get(selector)},$$:()=>[...clones]};
vm.createContext(context);
for(const [start,end] of [[' function voteFeedback(',' function heart('],[' function renderVote(',' function slideStep('],[' function syncNeighbors(',' function enterAds(']])vm.runInContext(source.slice(source.indexOf(start),source.indexOf(end)),context);
for(let i=0;i<6;i++){
 context.state={index:i,votes:[]};context.renderVote();
 assert.equal(app.classes.has('vote-feedback'),false);
 assert.equal(nodes.get('#next').textContent,'快去投票');assert.equal(nodes.get('#next').disabled,true);
 assert.equal(clones.length,(i>0?1:0)+(i<5?1:0));
 context.state.votes=[ADS[i].id];context.renderVote();
 assert.equal(clones.length,0,'Both side advertisements leave after voting');
 assert.ok(app.classes.has('vote-feedback')&&body.classes.has('vote-feedback'));
 assert.equal(app.properties['--feedback-top'],votePalette(i).feedbackTop);
 assert.equal(nodes.get('#next').textContent,'下一步');assert.equal(nodes.get('#next').disabled,false);
 assert.equal(nodes.get('#vote-button').hidden,true);
 assert.equal(nodes.get('#ad-votes').textContent,(ADS[i].votes+1).toLocaleString('en-US'));
}
context.state={index:1,votes:['anta']};context.renderVote();
assert.equal(app.classes.has('vote-feedback'),false);assert.equal(clones.length,2,'Switching to another work restores normal neighbouring cards');
assert.equal(nodes.get('#ad-history').textContent,'你去年为保时捷投过票');
const css=fs.readFileSync('reference-2024.css','utf8');
assert.match(css,/\.vote \.ad-image\s*\{[^}]*height: 375px;[^}]*padding: 0;/);
assert.match(css,/\.phone\.vote-feedback \.wechat,\.phone\.vote-feedback \.vote \{ background:transparent; \}/);
console.log('PASS: recording palettes; full-page vote feedback; six shared ad renders; side-card exit/restoration; vote counters; historical hint; growing entrance queue; narrow/short/safe-area viewport fit.');
