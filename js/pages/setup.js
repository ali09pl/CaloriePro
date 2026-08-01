// =========================================================
// PAGE: SETUP
// =========================================================
function pgSetup(){
  const p=el('div',{class:'page'});
  p.appendChild(el('div',{style:{marginBottom:'18px'}},el('span',{class:'badge bdg-pr',style:{marginBottom:'7px',display:'inline-flex'}},__('setup')),el('h1',{class:'h1'},'Build Your Profile'),el('p',{style:{color:'var(--tx2)',fontSize:'13px',marginTop:'5px'}},__('approx_ok'))));
  let sex=S.profile?.sex||'m',act=S.profile?.act||'m',rate=S.profile?.rate||0.5,goalV=S.goal||'fl',useEst=false,hCat='medium',bType='average';
  // Goal
  const gc=el('div',{class:'card'});gc.appendChild(el('div',{class:'slbl'},__('goal_label')));
  const gr=el('div',{class:'segr'});
  [['fl',__('fat_loss')],['mnt',__('maintenance')],['mg',__('muscle_gain')]].forEach(([id,l])=>{
    const b=el('button',{class:'seg'+(goalV===id?' on':'')},l);b.addEventListener('click',()=>{goalV=id;gr.querySelectorAll('.seg').forEach(x=>x.classList.remove('on'));b.classList.add('on');});gr.appendChild(b);
  });gc.appendChild(gr);p.appendChild(gc);
  // Basic
  const bic=el('div',{class:'card'});bic.appendChild(el('div',{class:'slbl'},'Basic Info'));
  const big=el('div',{class:'g2'});
  const ainp=el('input',{class:'inp',type:'number',placeholder:'25',value:S.profile?String(S.profile.age):''});
  big.appendChild(el('div',{class:'field'},el('label',{class:'lbl'},__('age')),ainp));
  const sr=el('div',{class:'segr'});
  [['m',__('male')],['f',__('female')]].forEach(([id,l])=>{const b=el('button',{class:'seg'+(sex===id?' on':'')},l);b.addEventListener('click',()=>{sex=id;sr.querySelectorAll('.seg').forEach(x=>x.classList.remove('on'));b.classList.add('on');});sr.appendChild(b);});
  big.appendChild(el('div',{class:'field'},el('label',{class:'lbl'},__('sex')),sr));bic.appendChild(big);p.appendChild(bic);
  // Measurements
  const mc=el('div',{class:'card'});mc.appendChild(el('div',{class:'slbl'},'Measurements'));
  const winp=el('input',{class:'inp',type:'number',step:'0.1',placeholder:'80',value:S.profile?String(S.profile.w):''}),hinp=el('input',{class:'inp',type:'number',placeholder:'175',value:S.profile?String(S.profile.h):''}),tinp=el('input',{class:'inp',type:'number',step:'0.1',placeholder:'70',value:S.profile?String(S.profile.t):''});
  const mg=el('div',{class:'g3'});
  mg.appendChild(el('div',{class:'field'},el('label',{class:'lbl'},__('weight_kg')),winp));
  mg.appendChild(el('div',{class:'field'},el('label',{class:'lbl'},__('height_cm')),hinp));
  mg.appendChild(el('div',{class:'field'},el('label',{class:'lbl'},__('target_kg')),tinp));
  mc.appendChild(mg);
  const ew=el('div',null);const echk=el('input',{type:'checkbox',id:'eck'});echk.style.marginRight='7px';
  ew.appendChild(el('div',{style:{display:'flex',alignItems:'center',marginBottom:'8px'}},echk,el('label',{for:'eck',style:{fontSize:'13px',color:'var(--tx2)',cursor:'pointer'}},"Don't know exact measurements — estimate for me")));
  const esec=el('div');esec.style.cssText='display:none;padding:13px;background:var(--glass2);border-radius:12px;margin-top:4px';
  esec.appendChild(el('div',{class:'lbl'},__('height_cat')));
  const hcr=el('div',{class:'segr',style:{marginBottom:'10px'}});
  ['short','medium','tall'].forEach(h=>{const k=h==='medium'?'medh':h;const b=el('button',{class:'seg'+(hCat===h?' on':''),style:{fontSize:'11px'}},__(k));b.addEventListener('click',()=>{hCat=h;hcr.querySelectorAll('.seg').forEach(x=>x.classList.remove('on'));b.classList.add('on');});hcr.appendChild(b);});esec.appendChild(hcr);
  esec.appendChild(el('div',{class:'lbl'},__('body_type')));
  const btr=el('div',{class:'segr'});
  ['slim','average','heavy'].forEach(b=>{const btn=el('button',{class:'seg'+(bType===b?' on':''),style:{fontSize:'11px'}},__(b));btn.addEventListener('click',()=>{bType=b;btr.querySelectorAll('.seg').forEach(x=>x.classList.remove('on'));btn.classList.add('on');});btr.appendChild(btn);});esec.appendChild(btr);ew.appendChild(esec);
  echk.addEventListener('change',()=>{useEst=echk.checked;esec.style.display=useEst?'block':'none';mg.style.opacity=useEst?'0.4':'1';winp.disabled=hinp.disabled=useEst;});
  mc.appendChild(ew);p.appendChild(mc);
  // Body fat
  const bfc=el('div',{class:'card'});bfc.appendChild(el('div',{class:'slbl'},__('body_fat')+' (optional)'));
  const wstinp=el('input',{class:'inp',type:'number',placeholder:'82'}),nckinp=el('input',{class:'inp',type:'number',placeholder:'38'});
  bfc.appendChild(el('div',{class:'g2'},el('div',{class:'field'},el('label',{class:'lbl'},__('waist')),wstinp),el('div',{class:'field'},el('label',{class:'lbl'},__('neck')),nckinp)));p.appendChild(bfc);
  // Activity
  const ac2=el('div',{class:'card'});ac2.appendChild(el('div',{class:'slbl'},__('act_level')));
  [['s',__('sed'),'🛋️','No exercise'],['l',__('light_a'),'🚶','1-3 days/wk'],['m',__('mod_a'),'🏃','3-5 days/wk'],['a',__('act_a'),'💪','6-7 days/wk'],['v',__('very_a'),'🔥','Physical job+training']].forEach(([id,l,ic,d])=>{
    const sc=el('div',{class:'selc'+(act===id?' on':'')},el('span',{style:{fontSize:'22px'}},ic),el('div',{style:{flex:'1'}},el('div',{style:{fontSize:'13px',fontWeight:'700'}},l),el('div',{style:{fontSize:'11px',color:'var(--tx3)',marginTop:'2px'}},d)),el('div',{class:'sdot'}));
    sc.addEventListener('click',()=>{act=id;ac2.querySelectorAll('.selc').forEach(x=>x.classList.remove('on'));sc.classList.add('on');const d2=sc.querySelector('.sdot');d2.style.background='var(--pr)';d2.style.borderColor='var(--pr)';});ac2.appendChild(sc);
  });p.appendChild(ac2);
  // Rate
  const rc=el('div',{class:'card'});rc.appendChild(el('div',{class:'slbl'},__('weekly_goal')));
  const rg=el('div',{class:'g4'});
  [[0.25,'😌','Gentle','0.25 kg'],[0.5,'👍','Moderate','0.5 kg'],[0.75,'💪','Fast','0.75 kg'],[1,'🔥','Maximum','1 kg']].forEach(([v,ic,l,s])=>{
    const b=el('button',{class:'seg'+(rate===v?' on':''),style:{flexDirection:'column',display:'flex',gap:'3px',padding:'10px 5px',height:'auto'}},el('span',{style:{fontSize:'18px'}},ic),el('span',{style:{fontSize:'11px',fontWeight:'800'}},l),el('span',{style:{fontSize:'10px',opacity:'.7'}},s));
    b.addEventListener('click',()=>{rate=v;rg.querySelectorAll('.seg').forEach(x=>x.classList.remove('on'));b.classList.add('on');});rg.appendChild(b);
  });rc.appendChild(rg);p.appendChild(rc);
  const errd=el('div',{class:'tip tip-d',style:{display:'none',marginBottom:'12px'}});p.appendChild(errd);
  const sub=el('button',{class:'btn btn-pr btn-w btn-lg',style:{fontSize:'16px'}},__('calculate'));
  sub.addEventListener('click',()=>{
    let w,h,t;const a=parseFloat(ainp.value);
    if(useEst){const e=estBody(hCat,bType,sex);w=e.w;h=e.h;t=Math.round(w*0.88);}
    else{w=parseFloat(winp.value);h=parseFloat(hinp.value);t=parseFloat(tinp.value);}
    if(isNaN(a)||a<10||a>110){errd.style.display='block';errd.textContent='Enter a valid age (10-110).';return;}
    if([w,h,t].some(v=>isNaN(v)||v<=0)){errd.style.display='block';errd.textContent='Please fill all measurements.';return;}
    if(t>=w){errd.style.display='block';errd.textContent='Target must be less than current weight.';return;}
    errd.style.display='none';
    const bf=calcBF(sex,parseFloat(wstinp.value),parseFloat(nckinp.value),h);
    S.profile={age:a,sex,w:+w.toFixed(1),h:+h.toFixed(0),t:+t.toFixed(1),act,rate,goal:goalV,bf,setupDate:today()};
    S.plan=calcPlan(S.profile);S.goal=goalV;saveS();checkAch();addXP(100,'Profile setup complete!');dbSaveProfile(S.profile);
    showToast('🎉','Profile Complete!','Your personalized plan is ready.','pr');go('results');
  });
  p.appendChild(sub);p.appendChild(el('div',{style:{height:'14px'}}));return p;
}
