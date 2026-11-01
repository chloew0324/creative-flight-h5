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
assert.match(voting,/flyer\.innerHTML=plane\(p\)/,'Voting uses the original textured plane renderer');
assert.doesNotMatch(voting,/heartRect/,'Keep the fixed launch area and unified motion');
assert.match(voting,/heartWidth=120,heartHeight=110/);
console.log('PASS: approved paper/plane pixels retained in all six choices; contour clips remove screenshot background and ground shadows. Original voting renderer restored, fixed flight origin retained.');
