// =========================================================
// PAGE: AI COACH
// =========================================================

// In-memory-only response cache (never persisted): avoids re-billing an HF
// call if the user asks the exact same thing twice within a few minutes.
const _aiReplyCache = new Map();
const AI_CACHE_TTL_MS = 10 * 60 * 1000;

function buildAIDigest(){
  if(!S.profile||!S.plan) return {};
  const pl=S.plan;
  const tf=S.food.filter(f=>f.date===today());
  const todayCal=tf.reduce((s,f)=>s+f.cal,0);
  const todayProtein=tf.reduce((s,f)=>s+f.pro,0);
  const weeklyRate=S.logs.length>1
    ? +((S.logs[0].w-S.logs[S.logs.length-1].w)/Math.max(1,S.logs.length)*7).toFixed(2)
    : null;
  const sl7=S.sleep.slice(-7);
  const sleepAvg7=sl7.length?+(sl7.reduce((s,x)=>s+x.h,0)/sl7.length).toFixed(1):null;
  return {
    goal: S.profile.goal==='fl'?'fat_loss':S.profile.goal==='mg'?'muscle_gain':'maintenance',
    targetCal: pl.tCal,
    todayCal,
    todayProtein,
    targetProtein: pl.mac.pro.g,
    weeklyRateKg: weeklyRate,
    streakDays: S.streak.count,
    sleepAvg7,
    waterToday: S.water.date===today()?S.water.count:0,
    bmi: pl.bmi.v
  };
}

// Folds the oldest exchange into the running summary once we have more than
// 2 exchanges (4 turns) stored, so the client never sends — and never even
// stores — an ever-growing chat log. Cheap string-concat, no extra API call.
function foldAIHistory(){
  const turns=S.aiChat.turns;
  while(turns.length>4){
    const u=turns.shift(), a=turns.shift();
    const bit=(u?('User asked: '+u.content.slice(0,80)):'')+
              (a?(' | Salo said: '+a.content.slice(0,80)):'');
    S.aiChat.summary=(S.aiChat.summary+' '+bit).trim().slice(-400);
  }
}

async function askSalo(message){
  const digest=buildAIDigest();
  const cacheKey=JSON.stringify([message,digest]);
  const cached=_aiReplyCache.get(cacheKey);
  if(cached && Date.now()-cached.t<AI_CACHE_TTL_MS) return cached.reply;

  const { data:sd } = await DB.auth.getSession();
  const session=sd&&sd.session;
  if(!session) throw new Error('Not signed in');

  const res=await fetch('/api/ai',{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+session.access_token},
    body:JSON.stringify({
      message,
      digest,
      summary:S.aiChat.summary,
      history:S.aiChat.turns
    })
  });
  const json=await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(json.error||'AI request failed');
  _aiReplyCache.set(cacheKey,{reply:json.reply,t:Date.now()});
  return json.reply;
}

function pgAI(){
  const p=el('div',{class:'page'});
  p.appendChild(el('div',{style:{marginBottom:'13px'}},el('span',{class:'badge bdg-pu',style:{marginBottom:'7px',display:'inline-flex'}},'AI COACH'),el('h1',{class:'h1'},el('span',{style:{display:'inline-flex',alignItems:'center',gap:'8px',verticalAlign:'middle'}},saloEl('happy',{size:30}),__('ai_coach')))));
  if(!S.profile||!S.plan){p.appendChild(noProfCard());return p;}

  // ── Chat with Salo (Hugging Face-backed) ──────────────────────────
  const chatCard=el('div',{class:'card card-pu'});
  chatCard.appendChild(el('div',{class:'fb',style:{marginBottom:'10px'}},
    el('div',{class:'slbl',style:{marginBottom:'0'}},'Ask Salo'),
    saloEl('happy',{size:34})
  ));
  const thread=el('div',{class:'ai-thread'});
  function renderThread(){
    thread.innerHTML='';
    if(S.aiChat.turns.length===0){
      thread.appendChild(saloSpeech('happy','Ask me anything about your plan — like "why am I not losing weight?" or "what should I eat today?"',{size:52}));
    }
    S.aiChat.turns.forEach(t=>{
      thread.appendChild(el('div',{class:'ai-msg '+(t.role==='user'?'ai-msg-user':'ai-msg-bot')},t.content));
    });
  }
  renderThread();
  chatCard.appendChild(thread);

  const chips=el('div',{class:'ai-chips'});
  ['Why am I not losing weight?','What should I eat today?','Am I eating enough protein?'].forEach(q=>{
    const c=el('button',{class:'ai-chip',type:'button'},q);
    c.addEventListener('click',()=>{ input.value=q; sendBtn.click(); });
    chips.appendChild(c);
  });
  chatCard.appendChild(chips);

  const inputRow=el('div',{class:'fr',style:{gap:'8px',marginTop:'8px'}});
  const input=el('input',{class:'inp',type:'text',placeholder:'Ask Salo…','aria-label':'Message to Salo'});
  const sendBtn=el('button',{class:'btn btn-pu btn-ic',type:'button','aria-label':'Send'},'➤');
  inputRow.appendChild(input);inputRow.appendChild(sendBtn);
  chatCard.appendChild(inputRow);

  let sending=false;
  async function doSend(){
    const msg=input.value.trim();
    if(!msg||sending) return;
    sending=true;
    input.value='';
    S.aiChat.turns.push({role:'user',content:msg});
    renderThread();
    const loadingEl=el('div',{class:'ai-msg ai-msg-bot ai-msg-loading salo-speaking'},saloEl('loading',{size:26,className:'salo-pulse'}),el('span',null,'Salo is thinking…'));
    thread.appendChild(loadingEl);
    thread.scrollTop=thread.scrollHeight;
    try{
      const reply=await askSalo(msg);
      S.aiChat.turns.push({role:'assistant',content:reply});
      foldAIHistory();
      saveS();
      renderThread();
    }catch(e){
      loadingEl.remove();
      showToast('😕','Salo is offline',e.message||'Please try again in a moment.','rd');
      S.aiChat.turns.pop(); // don't keep an unanswered question in the log
    }
    sending=false;
  }
  sendBtn.addEventListener('click',doSend);
  input.addEventListener('keydown',e=>{ if(e.key==='Enter') doSend(); });

  p.appendChild(chatCard);

  // ── Free quick plan (local, no API cost) ──────────────────────────
  let aiText=null,loading=false;
  const aiCard=el('div',{class:'card'});
  aiCard.appendChild(el('div',{class:'slbl'},'Quick Plan (Free, offline)'));
  const genBtn=el('button',{class:'btn btn-gh btn-w btn-lg'},'📋 Generate Full Plan');
  const loader=el('div',{style:{display:'none',textAlign:'center',padding:'20px'}},el('div',{class:'spinner',style:{margin:'0 auto 10px'}}),el('div',{style:{fontSize:'13px',color:'var(--tx2)'}},'Analyzing your data...'));
  const panel=el('div',{style:{display:'none'}});
  genBtn.addEventListener('click',()=>{
    if(loading)return;loading=true;genBtn.style.display='none';loader.style.display='block';
    setTimeout(()=>{
      aiText=generateAI();S._aiUsed=true;checkAch();
      loader.style.display='none';panel.style.display='block';
      panel.innerHTML='';panel.appendChild(el('div',{class:'ai-panel'},aiText));
      const regenBtn=el('button',{class:'btn btn-gh btn-sm',style:{marginTop:'12px',width:'100%'}},'🔄 Regenerate Plan');regenBtn.addEventListener('click',()=>{panel.style.display='none';genBtn.style.display='flex';loading=false;});panel.appendChild(regenBtn);
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
