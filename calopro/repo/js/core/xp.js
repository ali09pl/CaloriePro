// =========================================================
// MODULE: XP + LEVEL
// =========================================================
function addXP(amt,label){
  S.xp+=amt;saveS();
  showToast('⭐','+'+amt+' XP',label||'Experience gained!','pr');
}
function getLevel(){
  const thr=[0,100,250,500,850,1400,2200,3300,5000,7500,10000,15000,25000];
  const names=['Beginner','Starter','Active','Motivated','Consistent','Dedicated','Athlete','Champion','Elite','Legend','Grandmaster','Master','Ultimate'];
  let lvl=1;
  for(let i=0;i<thr.length;i++){if(S.xp>=thr[i])lvl=i+1;else break;}
  const next=thr[lvl]||thr[thr.length-1],prev=thr[lvl-1]||0;
  const prog=next>prev?Math.min(100,Math.round((S.xp-prev)/(next-prev)*100)):100;
  return{level:lvl,name:names[lvl-1]||'Ultimate',xpToNext:Math.max(0,next-S.xp),prog};
}


// =========================================================
// MODULE: ACHIEVEMENTS
// =========================================================
function unlock(id){
  if(S.achiev.includes(id))return;
  S.achiev.push(id);
  const a=ACHIEVEMENTS.find(x=>x.id===id);
  if(a){addXP(a.xp,a.name+' unlocked!');showToast(a.icon,a.name,'Achievement unlocked!','gold');}
  saveS();
}
function checkAch(){
  if(S.profile)unlock('pd');
  if(S.logs.length>=1)unlock('fl');
  if(S.ramadan)unlock('rm');
  if(S.food.length>=10)unlock('f10');
  if(S.acts.length>=5)unlock('a5');
  if(S._aiUsed)unlock('ai1');
  if(S.logs.length>=1&&S.profile){
    const lost=S.profile.w-(S.logs[S.logs.length-1].w||S.profile.w);
    if(lost>=1)unlock('f1k');if(lost>=5)unlock('f5k');
    if(S.logs[S.logs.length-1].w<=S.profile.t)unlock('gr');
  }
  const td=today();
  if(S.streak.last!==td){
    const g=dago(S.streak.last||td);
    S.streak.count=g<=1?S.streak.count+1:1;
    S.streak.last=td;
    if(!S.streak.hist)S.streak.hist=[];
    S.streak.hist.push(td);
    if(S.streak.hist.length>30)S.streak.hist=S.streak.hist.slice(-30);
    saveS();
  }
  if(S.streak.count>=7)unlock('w7');if(S.streak.count>=30)unlock('m30');
}


// =========================================================
// MODULE: AI COACH
// =========================================================
function generateAI(){
  if(!S.profile||!S.plan)return 'Set up your profile first to generate a personalized AI plan.';
  const p=S.profile,pl=S.plan;
  const curW=S.logs.length?+(S.logs.reduce((s,l)=>s+l.w,0)/S.logs.length).toFixed(1):p.w;
  const lost=+(p.w-curW).toFixed(1);
  const weekRate=S.logs.length>1?+((S.logs[0].w-S.logs[S.logs.length-1].w)/Math.max(1,S.logs.length)*7).toFixed(2):0;
  const tf=S.food.filter(f=>f.date===today());
  const tp=tf.reduce((s,f)=>s+f.pro,0),tc=tf.reduce((s,f)=>s+f.cal,0);
  const wa=S.acts.filter(a=>dago(a.date)<=7).length;
  const gn=p.goal==='fl'?'Fat Loss':p.goal==='mnt'?'Maintenance':'Muscle Gain';
  let out=[];
  out.push('## Your Personalized AI Nutrition & Fitness Plan');
  out.push(`Goal: ${gn}  |  BMI: ${pl.bmi.v} (${pl.bmi.cat})  |  Daily target: ${fmt(pl.tCal)} kcal`);
  out.push('');
  out.push('### Current Status');
  out.push(`Starting weight: ${p.w}kg  ->  Current average: ${curW}kg`);
  if(lost>0)out.push(`Total lost: ${lost}kg  --  Great work!`);
  else if(lost<-0.5)out.push(`Weight slightly up -- review your intake and reduce refined carbs.`);
  if(weekRate>0)out.push(`Weekly rate: ${weekRate}kg/week (target: ${p.rate}kg/week)`);
  out.push('');
  out.push('### Daily Macro Targets');
  out.push(`Protein: ${pl.mac.pro.g}g (${pl.mac.pro.pct}%)  -- PRIORITY for body composition`);
  out.push(`Carbs:   ${pl.mac.car.g}g (${pl.mac.car.pct}%)  -- Fuel for energy`);
  out.push(`Fat:     ${pl.mac.fat.g}g (${pl.mac.fat.pct}%)  -- Hormones & satiety`);
  out.push('');
  out.push('### Moroccan Meal Plan');
  if(S.ramadan){
    const ift=Math.round(pl.tCal*0.4),snk=Math.round(pl.tCal*0.15),suo=Math.round(pl.tCal*0.45);
    out.push('(Ramadan Mode Active)');
    out.push(`Iftar (${fmt(ift)} kcal):  Dates + water -> Harira -> Chicken Tagine + Zaalouk`);
    out.push(`Evening Snack (${fmt(snk)} kcal):  Mint tea + Baghrir with honey`);
    out.push(`Suhoor (${fmt(suo)} kcal):  Oatmeal + 2 eggs + Khobz slice + Leben`);
  } else {
    const bk=Math.round(pl.tCal*0.28),ln=Math.round(pl.tCal*0.38),dn=Math.round(pl.tCal*0.25),sn=pl.tCal-Math.round(pl.tCal*0.28)-Math.round(pl.tCal*0.38)-Math.round(pl.tCal*0.25);
    out.push(`Breakfast (${fmt(bk)} kcal):  80g oatmeal + 2 boiled eggs + 1 fruit`);
    out.push(`Lunch (${fmt(ln)} kcal):  Chicken Tagine (350g) + Zaalouk + 1 Khobz`);
    out.push(`Dinner (${fmt(dn)} kcal):  Harira + Grilled chicken (150g) + vegetables`);
    if(sn>0)out.push(`Snack (${fmt(sn)} kcal):  Yogurt + fruit  OR  30g peanuts`);
  }
  out.push('');
  out.push('### Weekly Workout Plan (4 days)');
  out.push(`Mon/Thu: Upper body -- Push-ups (3x${p.goal==='mg'?'12':'10'}), Pike push-ups (3x8), Plank (3x45s)`);
  out.push(`Tue/Fri: Lower body + cardio -- Squats (3x${p.goal==='mg'?'15':'20'}), Lunges (3x10), 20min walk`);
  out.push(`Daily: 8,000-10,000 steps (~${stpKcal(9000,p.w)} kcal burned)`);
  out.push('');
  out.push('### AI Insights for You');
  if(tc>0&&tc>pl.tCal*1.15)out.push(`WARNING: Today intake (${fmt(tc)} kcal) is ${fmt(tc-pl.tCal)} kcal over -- adjust dinner.`);
  else if(tc>0)out.push(`Today intake looks good -- keep it consistent.`);
  if(tp>0&&tp<pl.mac.pro.g*0.7)out.push(`WARNING: Protein low today (${tp}g vs ${pl.mac.pro.g}g) -- add chicken, eggs or tuna.`);
  if(wa===0)out.push(`No workouts this week -- even a 20min walk counts. Start small.`);
  else if(wa>=4)out.push(`${wa} workouts this week -- outstanding dedication!`);
  const wc=S.water.date===today()?S.water.count:0;
  if(wc<5)out.push(`Only ${wc}/8 water glasses today -- dehydration reduces performance by 30%.`);
  const sl7=S.sleep.slice(-7);
  if(sl7.length>0){const av=sl7.reduce((s,x)=>s+x.h,0)/sl7.length;if(av<7)out.push(`Average sleep ${av.toFixed(1)}h -- below 7h increases hunger hormones by 24%.`);else out.push(`Sleep average ${av.toFixed(1)}h -- excellent for recovery!`);}
  if(S.streak.count>=7)out.push(`${S.streak.count}-day streak -- consistency is everything!`);
  return out.join('\n');
}

