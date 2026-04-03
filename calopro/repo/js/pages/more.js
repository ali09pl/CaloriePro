// =========================================================
// PAGE: MORE
// =========================================================
function pgMore(){
  const p=el('div',{class:'page'});p.appendChild(el('h1',{class:'h1',style:{marginBottom:'15px'}},__('more')));
  const items=[[__('ramadan'),'🌙','ramadan'],[__('ai_coach'),'🤖','ai'],[__('achievements'),'🏆','ach'],[__('challenges'),'🎯','chal'],[__('activity'),'⚡','activ'],[__('water'),'💧','water'],[__('sleep'),'😴','sleep'],[__('settings'),'⚙️','sett']];
  const mg=el('div',{class:'moregrid'});items.forEach(([l,i,pg])=>{const c=el('div',{class:'morec'},el('span',{style:{fontSize:'27px'}},i),l);c.addEventListener('click',()=>go(pg));mg.appendChild(c);});p.appendChild(mg);
  if(S.profile&&S.plan){const pc=el('div',{class:'card'});pc.appendChild(el('div',{class:'slbl'},__('about')||'Profile'));const pr=S.profile,pl=S.plan;[[pr.age+' yrs — '+pr.sex,pl.bmi.v+' BMI ('+pl.bmi.cat+')'],[pr.w+'kg → '+pr.t+'kg','~'+pl.weeks+' '+__('weeks')],[fmt(pl.tCal)+' kcal/day',S.streak.count+' day streak']].forEach(row=>pc.appendChild(el('div',{class:'fb',style:{padding:'7px 0',borderBottom:'1px solid var(--bor)'}},el('span',{style:{fontSize:'12px',color:'var(--tx2)'}},row[0]),el('span',{style:{fontSize:'12px',fontWeight:'700'}},row[1]))));const eb=el('button',{class:'btn btn-gh btn-w',style:{marginTop:'9px'}},__('edit_profile'));eb.addEventListener('click',()=>go('setup'));pc.appendChild(eb);p.appendChild(pc);}
  return p;
}
