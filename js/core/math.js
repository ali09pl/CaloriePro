// =========================================================
// MODULE: MATH
// =========================================================
const AM={s:1.2,l:1.375,m:1.55,a:1.725,v:1.9};
function calcBMR(p){const b=10*p.w+6.25*p.h-5*p.age;return p.sex==='m'?b+5:b-161;}
function calcPlan(p){
  const bmr=calcBMR(p),tdee=bmr*(AM[p.act]||1.55),rate=p.rate||0.5;
  const tCal=Math.max(1200,Math.round(p.goal==='mnt'?tdee:tdee-(rate*7700/7)));
  const def=Math.round(tdee-tCal);
  const bv=p.w/((p.h/100)**2);
  const bc=bv<18.5?'Underweight':bv<25?'Normal':bv<30?'Overweight':'Obese';
  const bcol=bv<18.5?'#3b82f6':bv<25?'#10b981':bv<30?'#f59e0b':'#ef4444';
  const proG=Math.round(p.w*(p.goal==='mg'?2.2:1.8)),fatG=Math.round(tCal*0.25/9);
  const carG=Math.max(0,Math.round((tCal-proG*4-fatG*9)/4));
  const toLose=Math.max(0,p.w-p.t),weeks=toLose>0?Math.ceil(toLose/rate):0;
  const gd=new Date();gd.setDate(gd.getDate()+weeks*7);
  const ms=[0.25,0.5,0.75,1].map(pct=>{const lk=toLose*pct;const d=new Date();d.setDate(d.getDate()+Math.ceil(lk/rate)*7);return{pct,wt:+(p.w-lk).toFixed(1),date:d};});
  const wp=Array.from({length:8},(_,i)=>Math.max(1200,tCal-i*50));
  return{bmr:Math.round(bmr),tdee:Math.round(tdee),tCal,def,bmi:{v:+bv.toFixed(1),cat:bc,col:bcol},mac:{pro:{g:proG,pct:Math.round(proG*4/tCal*100)},car:{g:carG,pct:Math.round(carG*4/tCal*100)},fat:{g:fatG,pct:Math.round(fatG*9/tCal*100)}},toLose,weeks,goalDate:gd,ms,wp,safe:tCal>=1200};
}
function estBody(hc,bt,sex){
  const hm={short:sex==='m'?162:152,medium:sex==='m'?173:163,tall:sex==='m'?183:173};
  const bo={slim:-12,average:0,heavy:18};
  const h=hm[hc]||170,bmi=22+(bo[bt]||0);
  return{h,w:Math.round(bmi*(h/100)**2)};
}
function calcBF(sex,waist,neck,height){
  if(!waist||!neck||!height)return null;
  const bf=sex==='m'?495/(1.0324-0.19077*Math.log10(waist-neck)+0.15456*Math.log10(height))-450:495/(1.29579-0.35004*Math.log10(waist+waist*0.1-neck)+0.22100*Math.log10(height))-450;
  return Math.max(3,Math.min(60,+bf.toFixed(1)));
}
function stpKcal(steps,w){return Math.round(steps*w*0.0005);}
function fCals(f,g){const r=(g||f.srv)/100;return{cal:Math.round(f.cal*r),pro:+(f.pro*r).toFixed(1),car:+(f.car*r).toFixed(1),fat:+(f.fat*r).toFixed(1)};}
function fmt(n){return isNaN(n)||n==null?'—':Math.round(n).toLocaleString();}
function today(){return new Date().toISOString().split('T')[0];}
function dago(ds){return Math.round((Date.now()-new Date(ds).getTime())/86400000);}

