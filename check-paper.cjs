const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('app.js','utf8'),css=fs.readFileSync('choices-refined.css','utf8');
const hash=path=>require('node:crypto').createHash('sha256').update(fs.readFileSync(path)).digest('hex');
assert.equal(hash('assets/choice-paper-sheet.png'),'bcd701c398c665f6f9a4edb765f2c3ab0a320af8bd64d906d8fcefc930e900ca');
assert.equal(hash('assets/b-visuals.js'),'2477ee4532b9cd0a7808c419bbd96cf36a04cdfb446967bd4e5d2807f4ffe731');
assert.match(css,/choice-paper-photo\{filter:grayscale\(1\);opacity:1\}/);
assert.match(source,/planeArtwork:colour=>choiceMaterial\('plane',0,\{home:true\}\)/);
const template=source.slice(source.indexOf(' function choiceMaterial('),source.indexOf(' function paperSheet('));
const context={uid:0,asset:name=>'assets/'+name};vm.createContext(context);vm.runInContext(template,context);
for(let i=0;i<6;i++)for(const kind of ['paper','plane']){
 const svg=vm.runInContext(`choiceMaterial('${kind}',${i})`,context);
 assert.match(svg,/choice-paper-sheet\.png/,'Keep the approved source material');
 assert.match(svg,/<clipPath/);assert.match(svg,/<image[^>]+clip-path=/,'Every original is clipped to its paper contour');
 assert.doesNotMatch(svg,/feGaussianBlur|feDropShadow|<rect|<polygon/,'Do not add a shadow rectangle or redraw the approved plane');
}
assert.doesNotMatch(source,/hingePaper|choicePaperGeometry|data-paper-model="hinged-sheet"/);
assert.doesNotMatch(css,/background-image|background-size/);
assert.match(css,/\.choice-aircraft\{top:0;filter:none\}/);
const voting=source.slice(source.indexOf(' function launchFlight('),source.indexOf(' function choiceMaterial('));
assert.match(voting,/texturePlane\(plane\(p\),'vote'\)/,'Fold wings use the same approved source as the flight');
assert.doesNotMatch(voting,/flyer|flying-plane/,'No separate flight aircraft replaces the folded one');
assert.match(voting,/fold\.style\.transform=`translate3d\(\$\{pos.x-x0\}/);
assert.match(voting,/posePlane\(material,smooth\(\(elapsed-650\)\/380\),'vote'\)/,'Material is fully present before the wings finish opening');
assert.match(voting,/if\(!flightReady\)\{drawPaper\(foldEnd\)/,'A skipped frame still finalises wings before flight');
assert.doesNotMatch(voting,/heartRect/,'Keep the fixed launch area and unified motion');
assert.match(voting,/heartWidth=120\*composition,heartHeight=110\*composition/);
console.log('PASS: approved paper/plane pixels retained in all six choices; contour clips remove screenshot background and ground shadows. Original voting renderer restored, fixed flight origin retained.');

const {wingMatrix,texturePlane,planeCreases}=require('./entry-motion.js');
for(const kind of ['home','vote']){
 const [nose,far,near]=planeCreases(kind);
 for(const axis of [far,near])for(let i=0;i<=100;i++){
  const m=wingMatrix(nose,axis,i/100*1.3),apply=p=>[m[0]*p[0]+m[2]*p[1]+m[4],m[1]*p[0]+m[3]*p[1]+m[5]];
  for(const p of [nose,axis])assert.ok(Math.hypot(...apply(p).map((n,j)=>n-p[j]))<1e-10,'Wing crease anchors never drift');
 }
 const identity=wingMatrix(nose,far,0);identity.forEach((n,i)=>assert.ok(Math.abs(n-[1,0,0,1,0,0][i])<1e-10,'Finished wings preserve original bitmap geometry exactly'));
 const material=texturePlane('<svg><image href="approved-original"/></svg>',kind);
 assert.equal((material.match(/<image/g)||[]).length,1);assert.equal((material.match(/<use/g)||[]).length,3);
}
const ending=fs.readFileSync('ending-2024.css','utf8'),endingJS=fs.readFileSync('ending-2024.js','utf8');
assert.match(ending,/width:calc\(34px \* var\(--ending-scale,1\)\);height:calc\(34px \* var\(--ending-scale,1\)\)/);
assert.match(endingJS,/class="ending-packet-close"[^>]*><svg viewBox="0 0 34 34"/);
console.log('PASS: one original texture spans folding and flight, completed wing transforms are identity, skipped frames are safe; packet close is a square SVG circle and cross.');
