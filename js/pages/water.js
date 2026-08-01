// =========================================================
// PAGE: WATER
// =========================================================
function pgWater(){
  const p=el('div',{class:'page'});p.appendChild(el('div',{style:{marginBottom:'13px'}},el('span',{class:'badge bdg-ac',style:{marginBottom:'7px',display:'inline-flex'}},'WATER'),el('h1',{class:'h1'},__('water'))));
  if(S.water.date!==today())S.water={date:today(),count:0};
  const target=8,pct=Math.min(100,Math.round(S.water.count/target*100));
  const wC=el('div',{class:'card card-ac',style:{textAlign:'center',padding:'26px 18px'}});
  wC.appendChild(el('div',{style:{fontSize:'58px',marginBottom:'8px',filter:'drop-shadow(0 4px 14px rgba(59,130,246,.5))'}},'💧'));
  wC.appendChild(el('div',{style:{fontSize:'52px',fontWeight:'900',color:'var(--ac2)',lineHeight:'1'}},String(S.water.count)));
  wC.appendChild(el('div',{style:{fontSize:'14px',color:'var(--tx2)',marginTop:'5px'}},'/ '+target+' '+__('glasses')));
  wC.appendChild(el('div',{class:'pbar',style:{height:'10px',margin:'14px 0 16px'}},el('div',{class:'pfil pf-ac',style:{width:pct+'%'}})));
  const gg=el('div',{style:{display:'flex',gap:'7px',flexWrap:'wrap',justifyContent:'center',marginBottom:'16px'}});
  for(let i=0;i<target;i++)gg.appendChild(el('div',{class:'gbtn'+(i<S.water.count?' full':'')},i<S.water.count?'🥤':'🫙'));
  wC.appendChild(gg);
  const bRow=el('div',{style:{display:'flex',gap:'10px',justifyContent:'center'}});
  const ag=el('button',{class:'btn btn-ac'},__('add_glass'));ag.addEventListener('click',()=>{S.water.count=Math.min(20,S.water.count+1);saveS();if(S.water.count===8)showToast('💧','Hydration Goal!','You hit 8 glasses today!','ac');render();});
  const rg=el('button',{class:'btn btn-gh'},'-1');rg.addEventListener('click',()=>{S.water.count=Math.max(0,S.water.count-1);saveS();render();});
  bRow.appendChild(rg);bRow.appendChild(ag);wC.appendChild(bRow);p.appendChild(wC);
  const tc=el('div',{class:'card'});tc.appendChild(el('div',{class:'slbl'},'💧 Hydration Science'));['Drink a glass before each meal — reduces calorie intake by up to 13%.','During Ramadan: 2 glasses at Iftar, 4 during evening, 2 at Suhoor.','In hot weather or after exercise, increase to 10-12 glasses daily.','Adequate hydration reduces false hunger signals significantly.'].forEach(t=>tc.appendChild(el('div',{class:'tip tip-i',style:{marginBottom:'6px'}},t)));p.appendChild(tc);return p;
}
