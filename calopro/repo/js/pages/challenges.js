// =========================================================
// PAGE: CHALLENGES
// =========================================================
function pgChal(){
  const p=el('div',{class:'page'});p.appendChild(el('div',{style:{marginBottom:'13px'}},el('span',{class:'badge bdg-ac',style:{marginBottom:'7px',display:'inline-flex'}},__('challenges')),el('h1',{class:'h1'},'🎯 '+__('challenges'))));
  CHALLENGES.forEach(ch=>{const prog=S.challenges[ch.id]||0;const pct=Math.min(100,Math.round(prog/ch.target*100));const done=prog>=ch.target;
    const card=el('div',{class:'chalc'+(done?' done':'')});card.appendChild(el('div',{class:'fb',style:{marginBottom:'9px'}},el('div',{style:{display:'flex',alignItems:'center',gap:'9px'}},el('span',{style:{fontSize:'27px'}},ch.icon),el('div',null,el('div',{style:{fontSize:'13px',fontWeight:'700'}},ch.name),el('div',{style:{fontSize:'11px',color:'var(--tx2)',marginTop:'2px'}},prog+' / '+ch.target+' '+ch.unit))),done?el('span',{class:'badge bdg-pr'},'✓ Done!'):el('span',{style:{fontSize:'12px',fontWeight:'700',color:'var(--tx2)'}},pct+'%')));
    card.appendChild(el('div',{class:'pbar',style:{height:'7px',marginBottom:done?'0':'9px'}},el('div',{class:'pfil pf-ac',style:{width:pct+'%'}})));
    if(!done){const ub=el('button',{class:'btn btn-gh btn-sm btn-w'},'Mark Progress +1');ub.addEventListener('click',()=>{S.challenges[ch.id]=(S.challenges[ch.id]||0)+1;saveS();render();});card.appendChild(ub);}
    p.appendChild(card);
  });p.appendChild(el('div',{class:'tip tip-i'},'Challenges build long-term discipline. Mark progress consistently and watch your habits transform!'));return p;
}
