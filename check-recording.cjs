const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {votePalette,adEntryFrames,adOrbitPose,adSlideFrames,wrapAdIndex,previewScale,AD_CARD_GAP,AD_ORBIT_RADIUS,ADS}=require('./app.js');
assert.deepEqual(ADS.map((_,i)=>votePalette(i).id),['apricot','lilac','apricot','rose','apricot','mint']);
assert.equal(votePalette(1).feedbackTop,'#dddefd');
assert.equal(votePalette(5).feedbackTop,'#ccfecd');
const entry=adEntryFrames(1029,343);
assert.equal(entry.length,65);
assert.match(entry[0].transform,/rotateZ\(18\./);
assert.equal(entry.at(-1).transform,adOrbitPose(0,343).transform);
assert.equal(adEntryFrames(2*343,343).at(-1).transform,adOrbitPose(-1,343).transform,'Entrance left card must settle in exactly the same tilted pose as browsing');
assert.equal(adEntryFrames(4*343,343).at(-1).transform,adOrbitPose(1,343).transform);
for(let i=-300;i<=300;i++){
 const pose=adOrbitPose(i/100,343);
 assert.ok(Math.abs(pose.x**2+(AD_ORBIT_RADIUS-pose.y)**2-AD_ORBIT_RADIUS**2)<1e-6,'Every pose belongs to the same circle');
 assert.ok(Math.abs(Math.atan2(pose.x,AD_ORBIT_RADIUS-pose.y)*180/Math.PI-pose.rotation)<1e-8,'Each card follows the circle tangent');
}
assert.ok(adOrbitPose(-1,343).rotation< -6);assert.ok(adOrbitPose(1,343).rotation>6);
assert.equal(adSlideFrames(1,0,343).at(-1).transform,adOrbitPose(0,343).transform);
assert.equal(adSlideFrames(0,-1,343).at(-1).transform,adOrbitPose(-1,343).transform);
assert.equal(wrapAdIndex(-1),5);assert.equal(wrapAdIndex(6),0);
for(const [width,height] of [[390,844],[375,667],[320,568],[1440,900],[844,390]]){
 const insets={top:0,right:0,bottom:34,left:0},scale=previewScale(width,height,insets);
 assert.ok(402*scale<=width+.01);assert.ok(827*scale+34+(width>=460?32:0)<=height+.01);
}
// Exercise the actual shared rendering/state functions across all six works.
const source=fs.readFileSync('app.js','utf8'),nodes=new Map(),clones=[];
function node(){const classes=new Set(),properties={};return {classes,properties,dataset:{},style:{setProperty:(key,value)=>properties[key]=value},classList:{contains:key=>classes.has(key),toggle:(key,on)=>on?classes.add(key):classes.delete(key)},setAttribute(){},append(el){clones.push(el)},remove(){clones.splice(clones.indexOf(this),1)}}}
const app=node(),body=node();
const context={app,document:{body},state:{index:0,votes:[]},view:'vote',busy:false,syncVoteSurface:()=>{},ADS,votePalette,adOrbitPose,wrapAdIndex,theme:()=>{},heart:p=>p.id,adArtwork:ad=>ad.id,slideStep:()=>343,makeSlide:()=>({...node(),dataset:{}}),$:selector=>{if(!nodes.has(selector))nodes.set(selector,node());return nodes.get(selector)},$$:()=>[...clones]};
vm.createContext(context);
for(const [start,end] of [[' function voteFeedback(',' function heart('],[' function renderVote(',' function slideStep('],[' function syncNeighbors(',' function enterAds(']])vm.runInContext(source.slice(source.indexOf(start),source.indexOf(end)),context);
for(let i=0;i<6;i++){
 context.state={index:i,votes:[]};context.renderVote();
 assert.equal(app.classes.has('vote-feedback'),false);
 assert.equal(nodes.get('#next').textContent,'快去投票');assert.equal(nodes.get('#next').disabled,true);
 assert.equal(clones.length,2);
 assert.equal(clones[0].style.transform,adOrbitPose(-1,343).transform);
 assert.equal(clones[1].style.transform,adOrbitPose(1,343).transform);
 context.state.votes=[ADS[i].id];context.renderVote();
 assert.equal(clones.length,2,'Neighbours must be restored after the vote effect without requiring a swipe');
 assert.equal(app.dataset.votePhase,'voted');
 context.setAdBrowsing(true);assert.equal(app.dataset.votePhase,'browsing');assert.equal(clones.length,2);
 context.setAdBrowsing(false);assert.equal(app.dataset.votePhase,'voted');
 nodes.get('#vote').classes.add('flying');context.syncVotePhase();assert.equal(app.dataset.votePhase,'voting');
 nodes.get('#vote').classes.delete('flying');context.syncVotePhase();assert.equal(app.dataset.votePhase,'voted');
 assert.ok(app.classes.has('vote-feedback')&&body.classes.has('vote-feedback'));
 assert.equal(app.properties['--feedback-top'],votePalette(i).feedbackTop);
 assert.equal(nodes.get('#next').textContent,'下一步');assert.equal(nodes.get('#next').disabled,false);
 assert.equal(nodes.get('#vote-button').hidden,true);
 assert.equal(nodes.get('#ad-votes').textContent,(ADS[i].votes+1).toLocaleString('en-US'));
}
context.state={index:1,votes:['anta']};context.renderVote();
assert.equal(app.classes.has('vote-feedback'),false);assert.equal(clones.length,2,'Switching to another work restores normal neighbouring cards');
assert.equal(nodes.get('#ad-history').textContent,'你去年为保时捷投过票');
context.view='choose';context.voteFeedback(false,votePalette(0));assert.equal(body.classes.has('vote-view'),false);assert.equal(app.dataset.votePhase,'off');
const css=fs.readFileSync('reference-2024.css','utf8');
assert.match(css,/\.vote \.ad-image\s*\{[^}]*height: 375px;[^}]*padding: 0;/);
assert.match(css,/\.phone\[data-vote-phase="voting"\] \.ad-clone \{ opacity:0;visibility:hidden; \}/);
assert.match(css,/\.phone\.vote-feedback #vote\.browsing \.ad-clone \{ opacity:1;visibility:visible; \}/);
assert.match(css,/#eee 39%/);assert.match(css,/radial-gradient\(ellipse 105% 48% at 110% 43%/);
assert.match(css,/\.vote\.flying \.ad-image \{ opacity:1;transition:none; \}/);
console.log('PASS: circular geometry; hide neighbours only during voting, restore at effect completion without a swipe; drag/settle phases; sampled gray middle and directional feedback glow; mobile fit.');
