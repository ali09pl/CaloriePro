// =========================================================
// PAGE: SETTINGS
// =========================================================
function pgSett(){
  const p=el('div',{class:'page'});
  p.appendChild(el('div',{style:{marginBottom:'18px'}},
    el('span',{class:'badge bdg-ac',style:{marginBottom:'8px',display:'inline-flex'}},__('settings')),
    el('h1',{class:'h1'},__('settings'))
  ));
  // Topbar hint
  p.appendChild(el('div',{class:'tip tip-i',style:{direction:'ltr',textAlign:'left'}},'Use the ☀️/🌙 button to switch theme and the EN/AR button to switch language — both are in the top bar.'));
  // Profile summary
  if(S.profile&&S.plan){
    const prc=el('div',{class:'card'});prc.appendChild(el('div',{class:'slbl'},'Your Profile'));
    const pr=S.profile,pl=S.plan;
    [[pr.age+' yrs',pr.sex==='m'?'♂ Male':'♀ Female'],[pr.w+' kg current',pr.h+' cm height'],[pr.t+' kg target',pl.bmi.v+' BMI ('+pl.bmi.cat+')'],[fmt(pl.tCal)+' kcal/day','Deficit: -'+fmt(pl.def)]].forEach(row=>prc.appendChild(el('div',{class:'fb',style:{padding:'8px 0',borderBottom:'1px solid var(--bor)'}},el('span',{style:{fontSize:'12px',color:'var(--tx2)'}},row[0]),el('span',{style:{fontSize:'12px',fontWeight:'700'}},row[1]))));
    const eb=el('button',{class:'btn btn-gh btn-w',style:{marginTop:'11px'}},__('edit_profile'));
    eb.addEventListener('click',()=>go('setup'));prc.appendChild(eb);p.appendChild(prc);
  }
  // Data & Privacy
  const dc=el('div',{class:'card'});dc.appendChild(el('div',{class:'slbl'},'Data & Privacy'));
  [['Weight entries',S.logs.length+' logs'],['Food entries',String(S.food.length)],['Activities',String(S.acts.length)],['Sleep logs',String(S.sleep.length)],['Achievements',S.achiev.length+'/'+ACHIEVEMENTS.length],['Total XP',fmt(S.xp)+' pts']].forEach(d=>dc.appendChild(el('div',{class:'fb',style:{padding:'7px 0',borderBottom:'1px solid var(--bor)'}},el('span',{style:{fontSize:'12px',color:'var(--tx2)'}},d[0]),el('span',{style:{fontSize:'12px',fontWeight:'700'}},d[1]))));
  dc.appendChild(el('div',{class:'tip tip-i',style:{marginTop:'10px'}},__('data_local')));
  const clr=el('button',{class:'btn btn-gh btn-w',style:{marginTop:'9px',color:'var(--rd2)',borderColor:'rgba(239,68,68,.28)'}},__('clear_data'));
  clr.addEventListener('click',()=>{if(confirm('Delete ALL data permanently? This cannot be undone.')){localStorage.clear();location.reload();}});
  dc.appendChild(clr);p.appendChild(dc);
  // About
  const ac=el('div',{class:'card'});ac.appendChild(el('div',{class:'slbl'},__('about')));
  const ai=el('div',{style:{fontSize:'13px',color:'var(--tx2)',lineHeight:'2'}});
  [['📱 ','CaloriePro v6.0 — Professional Health Platform'],['🇲🇦 ','50+ Moroccan foods — Optimized for Morocco'],['🧮 ','Mifflin-St Jeor BMR · Navy body fat formula'],['🤖 ','AI Coach · 13 Achievements · XP Level System'],['📊 ','Chart.js visualization · EN/AR · Full RTL support'],['🔒 ','100% local storage — nothing sent anywhere']].forEach(([i,t])=>{const d=el('div',null);d.appendChild(el('span',null,i));d.appendChild(document.createTextNode(t));ai.appendChild(d);});
  ac.appendChild(ai);p.appendChild(ac);return p;
}
