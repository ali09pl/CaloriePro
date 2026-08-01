// =========================================================
// PAGE: RESULTS
// =========================================================
function pgResults(){
  if(!S.plan)return noProfCard();
  const pl=S.plan,pr=S.profile;
  const p=el('div',{class:'page'});
  p.appendChild(el('div',{style:{marginBottom:'18px'}},el('span',{class:'badge bdg-pr',style:{marginBottom:'8px',display:'inline-flex'}},__('results')),el('h1',{class:'h1'},'Your Personal Plan')));
  // Hero
  const hc=el('div',{class:'card card-pr glow-pr',style:{textAlign:'center',padding:'26px 17px'}});
  hc.appendChild(el('div',{class:'badge bdg-pr',style:{margin:'0 auto 11px',display:'inline-flex'}},__('daily_cal')));
  const dn=el('div',{class:'display'});dn.textContent=fmt(pl.tCal);hc.appendChild(dn);
  hc.appendChild(el('div',{style:{fontSize:'11px',color:'var(--tx2)',letterSpacing:'2px',textTransform:'uppercase',marginTop:'5px'}},__('kcal_day')));
  const mr=el('div',{style:{display:'flex',justifyContent:'center',gap:'20px',marginTop:'14px',flexWrap:'wrap'}});
  [[fmt(pl.tdee),'TDEE','var(--tx2)'],['-'+fmt(pl.def),__('deficit'),'var(--rd2)'],[fmt(pl.bmr),'BMR','var(--tx2)']].forEach(([v,l,c])=>mr.appendChild(el('div',{style:{textAlign:'center'}},el('div',{style:{fontSize:'15px',fontWeight:'800',color:c}},v),el('div',{style:{fontSize:'10px',color:'var(--tx3)',textTransform:'uppercase',letterSpacing:'1px',marginTop:'3px'}},l))));
  hc.appendChild(mr);
  if(!pl.safe)hc.appendChild(el('div',{class:'tip tip-w',style:{marginTop:'13px',textAlign:'left'}},'At 1200 kcal safety minimum. Consider a slower loss rate.'));
  p.appendChild(hc);
  // Stats grid
  const sg=el('div',{class:'g3',style:{marginBottom:'13px'}});
  [[pl.bmi.v,__('bmi'),pl.bmi.cat,pl.bmi.col],['~'+pl.weeks+'w',__('weeks'),'to goal','var(--ac2)'],[pl.toLose.toFixed(1)+'kg','To Lose','total','var(--yl2)']].forEach(([v,l,s,c])=>sg.appendChild(el('div',{class:'sbox'},el('div',{class:'sv',style:{color:c,fontSize:'18px'}},v),el('div',{class:'sl'},l),el('div',{style:{fontSize:'10px',color:'var(--tx3)',marginTop:'2px'}},s))));
  p.appendChild(sg);
  // Goal date
  p.appendChild(el('div',{class:'card fb',style:{padding:'13px 16px'}},el('div',null,el('div',{style:{fontSize:'10px',color:'var(--tx3)',fontWeight:'700',textTransform:'uppercase',letterSpacing:'1px'}},__('goal_date')),el('div',{style:{fontSize:'15px',fontWeight:'800',marginTop:'4px'}},pl.goalDate.toLocaleDateString('en-US',{weekday:'short',month:'long',day:'numeric',year:'numeric'}))),el('span',{style:{fontSize:'30px'}},'🏁')));
  // BMI bar
  const bmid=el('div',{class:'card'});bmid.appendChild(el('div',{class:'slbl'},__('bmi')+' Analysis'));
  bmid.appendChild(el('div',{class:'fb',style:{marginBottom:'7px'}},el('div',null,el('div',{style:{fontSize:'30px',fontWeight:'900',color:pl.bmi.col}},String(pl.bmi.v)),el('div',{style:{fontSize:'13px',fontWeight:'700',color:pl.bmi.col}},pl.bmi.cat)),el('div',{style:{textAlign:'right',fontSize:'12px',color:'var(--tx2)'}},'Normal: 18.5-24.9  '+pr.h+'cm — '+pr.w+'kg')));
  const bb=el('div',{class:'bmibar'});const bp=Math.min(95,Math.max(5,((pl.bmi.v-15)/(40-15))*100));
  const pin=el('div',{class:'bmipin'});pin.style.left=bp+'%';pin.style.background=pl.bmi.col;pin.style.boxShadow=`0 0 0 3px ${pl.bmi.col}44`;bb.appendChild(pin);bmid.appendChild(bb);p.appendChild(bmid);
  // Body fat
  if(pr.bf){const bfc=pr.bf<14?'Essential':pr.bf<25?'Fit':pr.bf<32?'Average':'Obese';p.appendChild(el('div',{class:'card fb'},el('div',null,el('div',{class:'slbl',style:{marginBottom:'6px'}},__('body_fat')),el('div',{style:{fontSize:'30px',fontWeight:'900',color:'var(--or2)'}},pr.bf+'%'),el('div',{style:{fontSize:'13px',fontWeight:'700',color:'var(--or2)'}},bfc)),el('span',{style:{fontSize:'40px'}},'🧬')));}
  // Macros
  const mc=el('div',{class:'card'});mc.appendChild(el('div',{class:'slbl'},'Daily Macros'));
  const mb=el('div',{style:{display:'flex',height:'11px',borderRadius:'7px',overflow:'hidden',marginBottom:'13px',gap:'2px'}});
  mb.appendChild(el('div',{style:{flex:String(pl.mac.pro.pct),background:'#a78bfa',borderRadius:'7px 0 0 7px'}}));
  mb.appendChild(el('div',{style:{flex:String(pl.mac.car.pct),background:'#fbbf24'}}));
  mb.appendChild(el('div',{style:{flex:String(pl.mac.fat.pct),background:'#f87171',borderRadius:'0 7px 7px 0'}}));
  mc.appendChild(mb);
  const mgg=el('div',{class:'g3'});
  [[__('protein'),pl.mac.pro,'#a78bfa','🥩'],[__('carbs'),pl.mac.car,'#fbbf24','🌾'],[__('fats'),pl.mac.fat,'#f87171','🥑']].forEach(([l,d,c,i])=>mgg.appendChild(el('div',{style:{textAlign:'center'}},el('div',{style:{fontSize:'17px',marginBottom:'4px'}},i),el('div',{style:{fontSize:'20px',fontWeight:'900',color:c}},d.g+'g'),el('div',{class:'sl'},l),el('div',{style:{fontSize:'10px',color:'var(--tx3)',marginTop:'1px'}},d.pct+'%'))));
  mc.appendChild(mgg);p.appendChild(mc);
  // Weekly plan
  const wpc=el('div',{class:'card'});wpc.appendChild(el('div',{class:'slbl'},__('weekly_plan')));
  wpc.appendChild(el('div',{style:{fontSize:'12px',color:'var(--tx2)',marginBottom:'10px'}},'Gradual 8-week reduction for sustainable fat loss:'));
  pl.wp.forEach((cal,i)=>{const row=el('div',{class:'wkrow'});const pct=Math.round(((cal-1200)/(pl.tCal+200-1200))*100);row.appendChild(el('div',{class:'wkn'},'Week '+(i+1)));row.appendChild(el('div',{class:'wkc'},fmt(cal)+' kcal'));row.appendChild(el('div',{style:{flex:'1'}},el('div',{class:'pbar',style:{height:'5px'}},el('div',{class:'pfil pf-pr',style:{width:Math.min(100,pct)+'%'}}))));wpc.appendChild(row);});p.appendChild(wpc);
  // Milestones
  const msc=el('div',{class:'card'});msc.appendChild(el('div',{class:'slbl'},__('milestones')));
  const curW2=S.logs.length?S.logs[S.logs.length-1].w:pr.w;const lostN=Math.max(0,pr.w-curW2);
  pl.ms.forEach(m=>{const done=lostN>=m.pct*pl.toLose;const row=el('div',{style:{display:'flex',alignItems:'center',gap:'11px',padding:'8px 0',borderBottom:'1px solid var(--bor)'}},el('div',{style:{width:'11px',height:'11px',borderRadius:'50%',flexShrink:'0',background:done?'var(--pr2)':'var(--bor2)',boxShadow:done?'0 0 8px var(--pr)':''}}),el('div',{style:{fontSize:'12px',color:'var(--tx2)',minWidth:'78px'}},m.date.toLocaleDateString('en-US',{month:'short',day:'numeric'})),el('div',{style:{fontSize:'14px',fontWeight:'800',flex:'1'}},m.wt+' kg'),el('div',{style:{fontSize:'12px',fontWeight:'700',color:done?'var(--pr2)':'var(--tx3)'}},Math.round(m.pct*100)+'%'+(done?' ✓':'')));msc.appendChild(row);});p.appendChild(msc);
  // AI CTA
  const aiBtn=el('button',{class:'btn btn-ai btn-w btn-lg',style:{marginBottom:'10px'}},'🤖 Get AI Coach Analysis');
  aiBtn.addEventListener('click',()=>go('ai'));p.appendChild(aiBtn);
  const dbBtn=el('button',{class:'btn btn-ac btn-w'},'⚡ Open Dashboard');
  dbBtn.textContent='⚡ Open Dashboard';dbBtn.addEventListener('click',()=>go('dash'));p.appendChild(dbBtn);
  p.appendChild(el('div',{style:{height:'14px'}}));return p;
}

