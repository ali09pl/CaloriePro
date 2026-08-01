// =========================================================
// PAGE: HOME
// =========================================================
function pgHome(){
  const p=el('div',{class:'page'});
  const hero=el('div',{class:'herosec'});
  const hi=el('div',{style:{position:'relative',zIndex:'1'}});
  hi.appendChild(el('div',{style:{marginBottom:'12px',display:'flex',justifyContent:'center'}},
    saloEl(S.plan?'waving':'happy',{size:88,className:'salo-bob'})
  ));
  const h1=el('h1',{class:'h1',style:{marginBottom:'10px',color:'var(--tx)'}});
  h1.textContent=__('app_name');
  const sub=el('span',{style:{color:'var(--pr2)',fontSize:'20px'}});sub.textContent=' — '+__('app_sub');h1.appendChild(sub);hi.appendChild(h1);
  hi.appendChild(el('p',{style:{color:'var(--tx2)',fontSize:'13px',lineHeight:'1.8',maxWidth:'400px',margin:'0 auto 22px'}},'Morocco\'s most complete health platform. AI coaching, calorie tracking, Ramadan mode, 5 languages.'));
  const hb=el('div',{style:{display:'flex',gap:'10px',justifyContent:'center',flexWrap:'wrap'}});
  const mb=el('button',{class:'btn btn-pr btn-lg'},S.plan?'⚡ Go to Dashboard':'🚀 '+__('get_started'));
  mb.addEventListener('click',()=>go(S.plan?'dash':'setup'));hb.appendChild(mb);
  hi.appendChild(hb);
  if(S.plan){
    const st=el('div',{style:{display:'flex',gap:'22px',justifyContent:'center',marginTop:'20px',flexWrap:'wrap'}});
    [[fmt(S.plan.tCal),'kcal/day'],['~'+S.plan.weeks+'w','to goal'],[S.streak.count+'d','streak'],[S.xp+' XP','earned']].forEach(([v,l])=>{
      st.appendChild(el('div',{style:{textAlign:'center'}},el('div',{style:{fontSize:'19px',fontWeight:'900',color:'var(--pr2)'}},v),el('div',{style:{fontSize:'10px',color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:'1px'}},l)));
    });hi.appendChild(st);
  }
  hero.appendChild(hi);p.appendChild(hero);
  // PWA banner
  if(!window.matchMedia('(display-mode: standalone)').matches){
    const pwa=el('div',{class:'pwab'},el('span',{style:{fontSize:'26px'}},'📲'),
      el('div',{style:{flex:'1'}},el('div',{style:{fontSize:'13px',fontWeight:'700'}},__('install_app')),el('div',{style:{fontSize:'11px',color:'var(--tx3)',marginTop:'2px'}},__('install_sub'))),
      (()=>{const b=el('button',{class:'btn btn-gh btn-sm'},'Install');b.addEventListener('click',()=>{if(window._dip)window._dip.prompt();else alert('iOS: Share -> Add to Home Screen\nAndroid: Menu -> Add to Home Screen');});return b;})()
    );p.appendChild(pwa);
  }
  // Feature grid
  const feats=[['🧮','BMR + TDEE','Mifflin-St Jeor'],['🍽','50+ Moroccan Foods','Full macro DB'],['📷','Barcode Scanner','OpenFoodFacts'],['🤖','AI Coach','Personalized plans'],['🌙','Ramadan Mode','Iftar/Suhoor splits'],['💧','Water Tracker','8-glass goal'],['😴','Sleep Tracker','Quality insights'],['⚡','Activity Calc','MET calorie burner'],['🏆','Achievements','13 badges + XP'],['📊','Live Charts','Weight & calorie trends'],['🌐','5 Languages','EN/AR/FR/ES/DZ'],['🎯','Challenges','30-day goals']];
  const fc=el('div',{class:'card'});fc.appendChild(el('div',{class:'slbl'},__('features')||'Everything You Need'));
  const fg=el('div',{class:'g2',style:{gap:'11px'}});
  feats.forEach(([ic,t,s])=>fg.appendChild(el('div',{style:{display:'flex',gap:'9px',alignItems:'flex-start'}},el('span',{style:{fontSize:'21px',flexShrink:'0'}},""+ic),el('div',null,el('div',{style:{fontSize:'12px',fontWeight:'700'}},t),el('div',{style:{fontSize:'11px',color:'var(--tx3)',marginTop:'1px'}},s)))));
  fc.appendChild(fg);p.appendChild(fc);
  if(!S.plan){
    const cta=el('div',{class:'card card-pr glow-pr',style:{textAlign:'center',padding:'34px 18px'}});
    cta.appendChild(el('div',{style:{marginBottom:'12px',display:'flex',justifyContent:'center'}},saloEl('excited',{size:76,className:'salo-bob'})));
    cta.appendChild(el('h3',{class:'h1',style:{marginBottom:'8px'}},__('start_journey')));
    cta.appendChild(el('p',{style:{fontSize:'13px',color:'var(--tx2)',marginBottom:'20px',lineHeight:'1.75'}},__('free_note')));
    const gb=el('button',{class:'btn btn-pr btn-lg btn-w'},'🚀 '+__('get_started'));gb.addEventListener('click',()=>go('setup'));cta.appendChild(gb);p.appendChild(cta);
  }
  return p;
}

