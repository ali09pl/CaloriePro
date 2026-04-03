// =========================================================
// PAGE: DASHBOARD
// =========================================================
function pgDash(){
  if(!S.plan)return noProfCard();
  const pl=S.plan,pr=S.profile;
  const curW=S.logs.length?S.logs[S.logs.length-1].w:pr.w;
  const lostTotal=Math.max(0,pr.w-curW),progPct=pl.toLose>0?Math.min(100,Math.round(lostTotal/pl.toLose*100)):100;
  const tF=S.food.filter(f=>f.date===today());
  const tCals=tF.reduce((s,f)=>s+f.cal,0),calPct=Math.min(100,Math.round(tCals/pl.tCal*100)),over=tCals>pl.tCal;
  const wG=S.water.date===today()?S.water.count:0;
  const lSlp=S.sleep.length?S.sleep[S.sleep.length-1]:{h:0};
  const tStp=S.steps.date===today()?S.steps.count:0;
  const lvl=getLevel();
  const p=el('div',{class:'page'});
  // Header
  const hdr=el('div',{class:'fb',style:{marginBottom:'16px'}});
  hdr.appendChild(el('div',null,el('span',{class:'badge bdg-pr',style:{marginBottom:'5px',display:'inline-block'}},__('dashboard')),el('h1',{class:'h1'},'Welcome back 👋')));
  const rw=el('div',{style:{display:'flex',flexDirection:'column',alignItems:'center',gap:'5px'}});
  rw.appendChild(mkSw(S.ramadan,v=>{S.ramadan=v;saveS();checkAch();render();}));
  rw.appendChild(el('span',{style:{fontSize:'9px',color:'var(--tx3)',fontWeight:'700',letterSpacing:'1px'}},'🌙 RAMADAN'));
  hdr.appendChild(rw);p.appendChild(hdr);
  // Calorie ring
  const ringCard=el('div',{class:'card card-pr glow-pr',style:{padding:'19px'}});
  const ringRow=el('div',{style:{display:'flex',alignItems:'center',gap:'15px'}});
  const ns='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(ns,'svg');svg.setAttribute('width','86');svg.setAttribute('height','86');svg.setAttribute('viewBox','0 0 86 86');
  const bgC=document.createElementNS(ns,'circle');bgC.setAttribute('cx','43');bgC.setAttribute('cy','43');bgC.setAttribute('r','35');bgC.setAttribute('fill','none');bgC.setAttribute('stroke','rgba(255,255,255,.1)');bgC.setAttribute('stroke-width','7');
  const fgC=document.createElementNS(ns,'circle');fgC.setAttribute('cx','43');fgC.setAttribute('cy','43');fgC.setAttribute('r','35');fgC.setAttribute('fill','none');fgC.setAttribute('stroke',over?'#ef4444':'#10b981');fgC.setAttribute('stroke-width','7');fgC.setAttribute('stroke-linecap','round');
  const ci=2*Math.PI*35;fgC.setAttribute('stroke-dasharray',`${ci*calPct/100} ${ci*(1-calPct/100)}`);fgC.setAttribute('stroke-dashoffset',String(ci*0.25));
  svg.appendChild(bgC);svg.appendChild(fgC);
  const rw2=el('div',{style:{position:'relative',width:'86px',height:'86px',flexShrink:'0'}});rw2.appendChild(svg);
  const rl=el('div',{style:{position:'absolute',inset:'0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',fontWeight:'900',color:over?'var(--rd2)':'var(--pr2)'}});rl.textContent=calPct+'%';rw2.appendChild(rl);ringRow.appendChild(rw2);
  const ri=el('div',{style:{flex:'1'}});
  ri.appendChild(el('div',{style:{fontSize:'11px',color:'var(--tx2)',fontWeight:'700',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'3px'}},__('today_intake')));
  const calNum=el('div',{style:{fontSize:'28px',fontWeight:'900',letterSpacing:'-1.5px'}});calNum.style.color=over?'var(--rd2)':'var(--tx)';calNum.textContent=fmt(tCals);ri.appendChild(calNum);
  ri.appendChild(el('div',{style:{fontSize:'12px',color:'var(--tx2)'}},'/ '+fmt(pl.tCal)+' kcal'));
  const diff=el('div',{style:{fontSize:'12px',fontWeight:'700',marginTop:'4px'}});diff.style.color=over?'var(--rd2)':'var(--pr2)';diff.textContent=over?'+'+(tCals-pl.tCal)+' '+__('over'):(pl.tCal-tCals)+' '+__('remaining');ri.appendChild(diff);
  ringRow.appendChild(ri);ringCard.appendChild(ringRow);
  // Macro mini bars
  const mb=el('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'7px',marginTop:'12px'}});
  const tP=tF.reduce((s,f)=>s+f.pro,0),tC=tF.reduce((s,f)=>s+f.car,0),tFt=tF.reduce((s,f)=>s+f.fat,0);
  [[__('protein'),tP,pl.mac.pro.g,'#a78bfa'],[__('carbs'),tC,pl.mac.car.g,'#fbbf24'],[__('fats'),tFt,pl.mac.fat.g,'#f87171']].forEach(([l,e,g,c])=>{
    const mp=Math.min(100,Math.round(e/g*100));
    const mbox=el('div',null);const mh=el('div',{style:{display:'flex',justifyContent:'space-between',marginBottom:'3px'}});
    mh.appendChild(el('span',{style:{fontSize:'10px',color:'var(--tx2)',fontWeight:'600'}},l));mh.appendChild(el('span',{style:{fontSize:'10px',color:c,fontWeight:'700'}},e+'g'));mbox.appendChild(mh);
    const bar=el('div',{class:'pbar',style:{height:'4px'}});bar.appendChild(el('div',{style:{height:'100%',width:mp+'%',background:c,borderRadius:'4px',transition:'width .7s var(--ease)'}}));mbox.appendChild(bar);
    mbox.appendChild(el('div',{style:{fontSize:'9px',color:'var(--tx3)',marginTop:'1px'}},'/'+g+'g'));mb.appendChild(mbox);
  });ringCard.appendChild(mb);p.appendChild(ringCard);
  // Quick actions
  const qa=el('div',{class:'g4',style:{marginBottom:'13px'}});
  [['Log Food','🍽️','food'],['Weight','⚖️','track'],['Activity','⚡','activ'],['AI Coach','🤖','ai']].forEach(([l,ic,pg])=>{
    const b=el('button',{class:'btn btn-gh',style:{flexDirection:'column',display:'flex',gap:'4px',padding:'11px 5px',height:'auto',width:'100%',fontSize:'11px',borderRadius:'var(--rl)'}},el('span',{style:{fontSize:'22px'}},ic),l);b.addEventListener('click',()=>go(pg));qa.appendChild(b);
  });p.appendChild(qa);
  // XP card
  const xpCard=el('div',{class:'card',style:{padding:'15px 17px'}});
  const xpTop=el('div',{class:'fb',style:{marginBottom:'8px'}});
  xpTop.appendChild(el('div',null,el('div',{class:'lvlbadge'},'⭐ '+__('level')+' '+lvl.level+' — '+lvl.name),el('div',{style:{fontSize:'11px',color:'var(--tx3)',marginTop:'5px'}},fmt(S.xp)+' XP — '+fmt(lvl.xpToNext)+' to next')));
  xpTop.appendChild(el('div',{style:{fontSize:'34px'}},lvl.level>=10?'👑':lvl.level>=7?'🏆':lvl.level>=4?'💪':'🌱'));
  xpCard.appendChild(xpTop);const xpb=el('div',{class:'xpbar'});xpb.appendChild(el('div',{class:'xpfil',style:{width:lvl.prog+'%'}}));xpCard.appendChild(xpb);p.appendChild(xpCard);
  // Progress
  const pc=el('div',{class:'card'});pc.appendChild(el('div',{class:'fb',style:{marginBottom:'9px'}},el('span',{style:{fontSize:'13px',fontWeight:'700'}},__('overall_prog')),el('span',{class:'badge bdg-pr'},progPct+'%')));
  pc.appendChild(el('div',{class:'pbar',style:{height:'10px',marginBottom:'8px'}},el('div',{class:'pfil pf-pr',style:{width:progPct+'%'}})));
  pc.appendChild(el('div',{class:'fb',style:{fontSize:'11px',color:'var(--tx2)'}},el('span',__('lost')+': '+lostTotal.toFixed(1)+'kg'),el('span','Left: '+Math.max(0,pl.toLose-lostTotal).toFixed(1)+'kg'),el('span','Goal: '+pl.goalDate.toLocaleDateString('en-US',{month:'short',day:'numeric'}))));
  p.appendChild(pc);
  // Stats
  const sgg=el('div',{class:'g4',style:{marginBottom:'13px'}});
  [[curW+'kg',__('current'),'var(--pr2)'],[pl.bmi.v,__('bmi'),pl.bmi.col],[S.streak.count+'d',__('streak'),'var(--yl2)'],[tStp>0?Math.round(tStp/1000)+'k':'—','Steps','var(--or2)']].forEach(([v,l,c])=>sgg.appendChild(el('div',{class:'sbox'},el('div',{class:'sv',style:{color:c,fontSize:'16px'}},v),el('div',{class:'sl'},l))));
  p.appendChild(sgg);
  // Water + Sleep
  const mini=el('div',{class:'g2',style:{marginBottom:'13px'}});
  const wC=el('div',{class:'card card-ac',style:{padding:'13px',cursor:'pointer'}});wC.appendChild(el('div',{class:'fb'},el('span',{style:{fontSize:'20px'}},'💧'),el('div',{style:{textAlign:'right'}},el('div',{style:{fontSize:'21px',fontWeight:'900',color:'var(--ac2)'}},wG+'/8'),el('div',{style:{fontSize:'10px',color:'var(--tx2)'}},__('glasses')))));wC.addEventListener('click',()=>go('water'));
  const sC=el('div',{class:'card card-pu',style:{padding:'13px',cursor:'pointer'}});sC.appendChild(el('div',{class:'fb'},el('span',{style:{fontSize:'20px'}},'😴'),el('div',{style:{textAlign:'right'}},el('div',{style:{fontSize:'21px',fontWeight:'900',color:'var(--pu2)'}},lSlp.h+'h'),el('div',{style:{fontSize:'10px',color:'var(--tx2)'}},__('sleep')))));sC.addEventListener('click',()=>go('sleep'));
  mini.appendChild(wC);mini.appendChild(sC);p.appendChild(mini);
  // Steps
  if(tStp>0){const sk=stpKcal(tStp,pr.w);p.appendChild(el('div',{class:'card card-or',style:{padding:'12px 15px'}},el('div',{class:'fb'},el('div',null,el('div',{style:{fontSize:'10px',color:'var(--or2)',fontWeight:'700',textTransform:'uppercase',letterSpacing:'1px'}},__('steps_today')),el('div',{style:{fontSize:'21px',fontWeight:'900'}},tStp.toLocaleString()+' steps')),el('div',{style:{textAlign:'right'}},el('div',{style:{fontSize:'17px',fontWeight:'800',color:'var(--or2)'}},'-'+sk),el('div',{style:{fontSize:'10px',color:'var(--tx2)'}},'kcal burned')))));}
  // Streak 7-day
  const strkCard=el('div',{class:'card',style:{padding:'17px'}});strkCard.appendChild(el('div',{class:'slbl'},'🔥 '+__('streak')));
  const stTop=el('div',{class:'fb',style:{marginBottom:'9px'}});stTop.appendChild(el('div',null,el('div',{style:{fontSize:'36px',fontWeight:'900',color:'var(--or2)',letterSpacing:'-1px'}},S.streak.count+' days'),el('div',{style:{fontSize:'12px',color:'var(--tx2)'}},'Keep going — consistency is everything!')));stTop.appendChild(el('div',{style:{fontSize:'40px'},class:'flame'},'🔥'));strkCard.appendChild(stTop);
  const now2=new Date();const sevenD=el('div',{class:'sdots',style:{justifyContent:'flex-start'}});
  for(let i=6;i>=0;i--){const d2=new Date(now2);d2.setDate(d2.getDate()-i);const ds2=d2.toISOString().split('T')[0];const dn2=d2.toLocaleDateString('en-US',{weekday:'short'}).slice(0,1);const isToday=i===0;const isDone=S.streak.hist&&S.streak.hist.includes(ds2);const dot=el('div',{class:'sdot2 '+(isToday?'today':isDone?'done':'missed')},dn2);sevenD.appendChild(dot);}strkCard.appendChild(sevenD);p.appendChild(strkCard);
  // Weight chart
  if(S.logs.length>1){const wch=el('div',{class:'card'});wch.appendChild(el('div',{class:'slbl'},__('weight_trend')));const cv=el('canvas');const cw=el('div',{class:'chw'});cw.appendChild(cv);wch.appendChild(cw);p.appendChild(wch);
    setTimeout(()=>{try{const ls=S.logs.slice(-14).map(l=>l.date.slice(5));const dt=S.logs.slice(-14).map(l=>l.w);new Chart(cv,{type:'line',data:{labels:ls,datasets:[{label:'Weight',data:dt,borderColor:'#10b981',backgroundColor:'rgba(16,185,129,.1)',tension:.4,fill:true,pointBackgroundColor:'#10b981',pointRadius:4,pointHoverRadius:8,pointBorderColor:'var(--bg2)',pointBorderWidth:2},{label:'Target',data:Array(ls.length).fill(pr.t),borderColor:'#60a5fa',borderDash:[6,4],pointRadius:0,borderWidth:1.5}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#7a9abb',font:{size:10},usePointStyle:true}}},scales:{y:{grid:{color:'rgba(255,255,255,.05)'},ticks:{color:'#7a9abb',font:{size:10}}},x:{grid:{display:false},ticks:{color:'#7a9abb',font:{size:10}}}}}});}catch{}},100);}
  // Cal trend
  const dds=[...new Set(S.food.map(f=>f.date))].sort().slice(-10);
  if(dds.length>1){const cch=el('div',{class:'card'});cch.appendChild(el('div',{class:'slbl'},__('cal_trend')));const cv2=el('canvas');const cw2=el('div',{class:'chwsm'});cw2.appendChild(cv2);cch.appendChild(cw2);p.appendChild(cch);
    setTimeout(()=>{try{const l2=dds.map(d=>d.slice(5));const d2=dds.map(d=>S.food.filter(f=>f.date===d).reduce((s,f)=>s+f.cal,0));new Chart(cv2,{type:'bar',data:{labels:l2,datasets:[{label:'Calories',data:d2,backgroundColor:'rgba(59,130,246,.55)',borderRadius:6,borderSkipped:false},{label:'Target',data:Array(l2.length).fill(pl.tCal),type:'line',borderColor:'#a78bfa',borderDash:[5,4],pointRadius:0,borderWidth:1.5}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{grid:{color:'rgba(255,255,255,.05)'},ticks:{color:'#7a9abb',font:{size:10}}},x:{grid:{display:false},ticks:{color:'#7a9abb',font:{size:10}}}}}});}catch{}},160);}
  // AI tip
  const aiTips=buildAITips();if(aiTips.length){const aiCard=el('div',{class:'card card-pu'});aiCard.appendChild(el('div',{class:'slbl'},'🤖 AI Insights'));const tm={w:'tip-w',g:'tip-g',i:'tip-i',a:'tip-ai'};aiCard.appendChild(el('div',{class:'tip '+(tm[aiTips[0].t]||'tip-i')},aiTips[0].m));const ab=el('button',{class:'btn btn-gh btn-sm btn-w',style:{marginTop:'8px'}},'🤖 Full AI Coach Analysis →');ab.addEventListener('click',()=>go('ai'));aiCard.appendChild(ab);p.appendChild(aiCard);}
  // Ach peek
  const unlk=ACHIEVEMENTS.filter(a=>S.achiev.includes(a.id));const achCard=el('div',{class:'card'});
  achCard.appendChild(el('div',{class:'fb',style:{marginBottom:'9px'}},el('div',{class:'slbl',style:{marginBottom:'0'}},__('achievements')),el('span',{class:'badge bdg-pu'},unlk.length+'/'+ACHIEVEMENTS.length)));
  const ar=el('div',{style:{display:'flex',gap:'8px',flexWrap:'wrap'}});
  ACHIEVEMENTS.slice(0,9).forEach(a=>ar.appendChild(el('div',{title:a.name,style:{fontSize:'29px',filter:S.achiev.includes(a.id)?'none':'grayscale(1)',opacity:S.achiev.includes(a.id)?'1':'0.2',transition:'all .3s'}},a.icon)));achCard.appendChild(ar);
  const ab2=el('button',{class:'btn btn-gh btn-sm btn-w',style:{marginTop:'9px'}},'View All Achievements →');ab2.addEventListener('click',()=>go('ach'));achCard.appendChild(ab2);p.appendChild(achCard);
  return p;
}
function buildAITips(){
  if(!S.profile||!S.plan)return[{t:'i',m:'Set up your profile to unlock AI coaching.'}];
  const tips=[],pl=S.plan,pr=S.profile;
  if(S.logs.length>=3){const diff=S.logs[0].w-S.logs[S.logs.length-1].w,rate=(diff/S.logs.length)*7;if(rate>pr.rate*1.7)tips.push({t:'w',m:'Losing '+rate.toFixed(2)+'kg/week too fast. Eat 150 more kcal to protect muscle.'});else if(rate<pr.rate*0.4&&rate>0)tips.push({t:'w',m:'Progress slow ('+rate.toFixed(2)+'kg/wk). Reduce 100 kcal + 20min daily walks.'});else if(rate>0)tips.push({t:'g',m:'Losing '+rate.toFixed(2)+'kg/week — right on target!'});}
  const tf=S.food.filter(f=>f.date===today()),tp=tf.reduce((s,f)=>s+f.pro,0);
  if(tf.length>0&&tp<pl.mac.pro.g*0.7)tips.push({t:'w',m:'Your carbohydrate intake is high. Consider reducing bread and adding chicken, eggs or tuna. Protein: '+tp+'g vs '+pl.mac.pro.g+'g target.'});
  const ra=S.acts.filter(a=>dago(a.date)<=7).length;
  if(ra===0)tips.push({t:'i',m:'No activity this week. Try 20min daily walk — burns ~150 kcal.'});else tips.push({t:'g',m:ra+' activities this week — excellent consistency!'});
  const wc=S.water.date===today()?S.water.count:0;if(wc<5)tips.push({t:'i',m:'Only '+wc+'/8 water glasses today. Dehydration reduces performance by 30%.'});
  if(S.streak.count>=7)tips.push({t:'a',m:S.streak.count+'-day streak! Consistency is the single biggest predictor of success.'});
  if(!tips.length)tips.push({t:'i',m:'Keep logging meals, weight and sleep daily for richer insights.'});
  return tips;
}
