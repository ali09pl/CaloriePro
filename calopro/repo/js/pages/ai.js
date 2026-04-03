// =========================================================
// PAGE: AI COACH
// =========================================================
function pgAI(){
  const p=el('div',{class:'page'});p.appendChild(el('div',{style:{marginBottom:'13px'}},el('span',{class:'badge bdg-pu',style:{marginBottom:'7px',display:'inline-flex'}},'AI COACH'),el('h1',{class:'h1'},'🤖 '+__('ai_coach'))));
  if(!S.profile||!S.plan){p.appendChild(noProfCard());return p;}
  let aiText=null,loading=false;
  const aiCard=el('div',{class:'card card-pu'});
  const genBtn=el('button',{class:'btn btn-ai btn-w btn-lg'},'🤖 Generate Full AI Plan');
  const loader=el('div',{style:{display:'none',textAlign:'center',padding:'20px'}},el('div',{class:'spinner',style:{margin:'0 auto 10px'}}),el('div',{style:{fontSize:'13px',color:'var(--tx2)'}},'Analyzing your data...'));
  const panel=el('div',{style:{display:'none'}});
  genBtn.addEventListener('click',()=>{
    if(loading)return;loading=true;genBtn.style.display='none';loader.style.display='block';
    setTimeout(()=>{
      aiText=generateAI();S._aiUsed=true;checkAch();
      loader.style.display='none';panel.style.display='block';
      panel.innerHTML='';panel.appendChild(el('div',{class:'ai-panel'},aiText));
      const regenBtn=el('button',{class:'btn btn-ai btn-sm',style:{marginTop:'12px',width:'100%'}},'🔄 Regenerate Plan');regenBtn.addEventListener('click',()=>{panel.style.display='none';genBtn.style.display='flex';loading=false;});panel.appendChild(regenBtn);
    },1200);
  });
  aiCard.appendChild(genBtn);aiCard.appendChild(loader);aiCard.appendChild(panel);p.appendChild(aiCard);
  // Quick insights
  const tipsCard=el('div',{class:'card'});tipsCard.appendChild(el('div',{class:'slbl'},'Quick Insights'));
  const aiTips=buildAITips();const tm={w:'tip-w',g:'tip-g',i:'tip-i',a:'tip-ai'};aiTips.forEach(t=>tipsCard.appendChild(el('div',{class:'tip '+(tm[t.t]||'tip-i'),style:{marginBottom:'8px'}},t.m)));p.appendChild(tipsCard);
  // Recommendations
  if(S.plan){const rCard=el('div',{class:'card'});rCard.appendChild(el('div',{class:'slbl'},'Daily Recommendations'));const pl=S.plan;[['🥩','Protein Target',pl.mac.pro.g+'g/day','~'+Math.round(pl.mac.pro.g/3)+'g per meal'],['💧','Water','8 glasses/day','Before meals reduces intake ~13%'],['😴','Sleep','7-9 hours','Controls hunger hormones directly'],['🚶','Steps','8,000-10,000/day','Burns 320-400 extra kcal'],['🍽️','Meal Timing','Every 4-5 hours','Prevents blood sugar crashes'],['🥗','Vegetables','5 portions/day','Fiber = better satiety']].forEach(([i,t,v,d])=>{const row=el('div',{style:{display:'flex',gap:'11px',alignItems:'flex-start',padding:'9px 0',borderBottom:'1px solid var(--bor)'}},el('span',{style:{fontSize:'21px',flexShrink:'0'}},i),el('div',{style:{flex:'1'}},el('div',{style:{fontSize:'12px',fontWeight:'700'}},t),el('div',{style:{fontSize:'11px',color:'var(--tx2)',marginTop:'2px'}},d)),el('div',{style:{fontSize:'11px',fontWeight:'700',color:'var(--pr2)',flexShrink:'0',textAlign:'right'}},v));rCard.appendChild(row);});p.appendChild(rCard);}
  return p;
}
