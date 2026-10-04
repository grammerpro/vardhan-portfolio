import assert from 'node:assert/strict';
import { mkdir,writeFile } from 'node:fs/promises';
const luminance = hex => {
  const rgb=[1,3,5].map(index=>parseInt(hex.slice(index,index+2),16)/255).map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4);
  return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
};
const pairs=[
  ['Paper primary text','#151719','#E9E6DF',4.5],
  ['Paper secondary text','#585E60','#E9E6DF',4.5],
  ['Dark primary text','#F4F1EA','#111315',4.5],
  ['Dark secondary text','#ADB3B8','#111315',4.5],
  ['Dark amber accent text','#EEAE62','#111315',4.5],
  ['Panel caption','#A7B3B8','#1A1E22',4.5],
  ['Paper focus indicator','#96511A','#E9E6DF',3],
  ['Dark focus indicator','#EEAE62','#1A1E22',3],
  ['Form field boundary','#67756E','#131B18',3],
  ['Paper muted large heading','#717365','#E9E6DF',3],
];
const results=pairs.map(([role,foreground,background,minimum])=>{
 const a=luminance(foreground),b=luminance(background),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
 assert.ok(ratio>=minimum,`${role}: ${ratio.toFixed(2)} below ${minimum}`);
 return {role,foreground,background,ratio:Number(ratio.toFixed(2)),minimum};
});
await mkdir('docs/evidence/accessibility',{recursive:true});
await writeFile('docs/evidence/accessibility/contrast.json',JSON.stringify({scope:'Declared critical opaque text/focus/control pairs. Not a substitute for composited gradient/canvas inspection or a full WCAG audit.',results},null,2));
console.log(JSON.stringify(results,null,2));
