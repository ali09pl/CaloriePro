// =========================================================
// PAGE: FOOD LOG
// =========================================================
function pgFood(){
  const tF=S.food.filter(f=>f.date===today());
  const tots=tF.reduce((a,f)=>({cal:a.cal+f.cal,pro:a.pro+f.pro,car:a.car+f.car,fat:a.fat+f.fat}),{cal:0,pro:0,car:0,fat:0});
  const target=S.plan?S.plan.tCal:2000,pct=Math.min(100,Math.round(tots.cal/target*100)),over=tots.cal>target;
  const p=el('div',{class:'page'});
  p.appendChild(el('div',{style:{marginBottom:'13px'}},el('span',{class:'badge bdg-yl',style:{marginBottom:'7px',display:'inline-flex'}},'FOOD LOG'),el('div',{class:'fb'},el('h1',{class:'h1'},__('today_intake')),el('span',{style:{fontSize:'11px',color:'var(--tx2)'}},new Date().toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})))));
  const sc=el('div',{class:'card card-pr',style:{padding:'14px 16px'}});
  sc.appendChild(el('div',{class:'fb',style:{marginBottom:'8px'}},el('div',null,el('div',{style:{fontSize:'10px',color:'var(--tx2)',fontWeight:'700',textTransform:'uppercase',letterSpacing:'1px'}},__('today_intake')),el('div',{style:{fontSize:'26px',fontWeight:'900',color:over?'var(--rd2)':'var(--tx)'}},fmt(tots.cal)),el('div',{style:{fontSize:'11px',color:'var(--tx2)'}},'/ '+fmt(target)+' kcal')),el('div',{style:{textAlign:'right'}},el('div',{style:{fontSize:'20px',fontWeight:'800',color:over?'var(--rd2)':'var(--pr2)'}},over?'+'+(tots.cal-target):(target-tots.cal)),el('div',{style:{fontSize:'10px',color:'var(--tx2)',textTransform:'uppercase',letterSpacing:'1px'}},over?__('over'):__('remaining')))));
  sc.appendChild(el('div',{class:'pbar'},el('div',{class:'pfil pf-pr',style:{width:pct+'%'}})));
  if(S.plan&&tF.length>0){const mb=el('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'7px',marginTop:'10px'}});[[__('protein'),tots.pro,S.plan.mac.pro.g,'#a78bfa'],[__('carbs'),tots.car,S.plan.mac.car.g,'#fbbf24'],[__('fats'),tots.fat,S.plan.mac.fat.g,'#f87171']].forEach(([l,e,g,c])=>{const mp=Math.min(100,Math.round(e/g*100));const mbox=el('div',null);const mh=el('div',{style:{display:'flex',justifyContent:'space-between',marginBottom:'2px'}});mh.appendChild(el('span',{style:{fontSize:'9px',color:'var(--tx2)',fontWeight:'600'}},l));mh.appendChild(el('span',{style:{fontSize:'9px',color:c,fontWeight:'700'}},e+'g'));mbox.appendChild(mh);const bar=el('div',{class:'pbar',style:{height:'3px'}});bar.appendChild(el('div',{style:{height:'100%',width:mp+'%',background:c,borderRadius:'3px',transition:'width .7s'}}));mbox.appendChild(bar);mb.appendChild(mbox);});sc.appendChild(mb);}
  p.appendChild(sc);
  const bRow=el('div',{style:{display:'flex',gap:'8px',marginBottom:'13px'}});
  const addBtn=el('button',{class:'btn btn-pr',style:{flex:'1'}},__('add_food'));addBtn.addEventListener('click',()=>openFoodModal(food=>{const _fe={...food,date:today(),id:Date.now()};S.food.push(_fe);saveS();checkAch();dbSaveFood(_fe);render();}));
  const scanBtn=el('button',{class:'btn btn-gh btn-ic',style:{fontSize:'19px',padding:'10px 14px'}},'📷');scanBtn.title='Scan Barcode';scanBtn.addEventListener('click',()=>openBarcodeModal(food=>{if(food){const _fe={...food,date:today(),id:Date.now()};S.food.push(_fe);saveS();dbSaveFood(_fe);render();}}));
  bRow.appendChild(addBtn);bRow.appendChild(scanBtn);p.appendChild(bRow);
  // Meal slots
  const mm={breakfast:[],lunch:[],dinner:[],snack:[]};tF.forEach(f=>(mm[f.meal]||mm.snack).push(f));
  const slots=S.ramadan?[[__('iftar_m'),'🌙','breakfast'],[__('evsnack'),'🫖','snack'],[__('suhoor_m'),'🌅','dinner']]:[[__('breakfast'),'🌅','breakfast'],[__('lunch'),'☀️','lunch'],[__('dinner'),'🌙','dinner'],[__('snack_m'),'🫖','snack']];
  slots.forEach(([label,icon,mid])=>{
    const items=mm[mid]||[];const mCals=items.reduce((s,f)=>s+f.cal,0);
    const mc=el('div',{class:'card',style:{marginBottom:'9px'}});
    mc.appendChild(el('div',{class:'fb'},el('div',{style:{display:'flex',alignItems:'center',gap:'8px'}},el('span',{style:{fontSize:'16px'}},icon),el('div',null,el('div',{style:{fontSize:'13px',fontWeight:'700'}},label))),el('div',{style:{textAlign:'right'}},el('div',{style:{fontSize:'14px',fontWeight:'800',color:'var(--pr2)'}},mCals>0?fmt(mCals):'—'),mCals>0?el('div',{style:{fontSize:'10px',color:'var(--tx2)'}},'kcal'):null)));
    items.forEach(f=>{const row=el('div',{style:{display:'flex',alignItems:'center',gap:'8px',padding:'7px 0',borderTop:'1px solid var(--bor)',marginTop:'5px'}});row.appendChild(el('span',{style:{fontSize:'21px'}},f.icon||'🍽️'));row.appendChild(el('div',{style:{flex:'1',minWidth:'0'}},el('div',{style:{fontSize:'12px',fontWeight:'600',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},f.name),el('div',{style:{fontSize:'11px',color:'var(--tx3)'}},f.g+'g — P:'+f.pro+'g C:'+f.car+'g')));row.appendChild(el('div',{style:{textAlign:'right',flexShrink:'0'}},el('div',{style:{fontSize:'13px',fontWeight:'800',color:'var(--pr2)'}},String(f.cal)),el('div',{style:{fontSize:'10px',color:'var(--tx2)'}},'kcal')));const db=el('button',{style:{background:'none',border:'none',color:'var(--tx2)',cursor:'pointer',fontSize:'19px',padding:'0 3px'}});db.textContent='×';db.addEventListener('click',()=>{dbDeleteFood(f.id);S.food=S.food.filter(x=>x.id!==f.id);saveS();render();});row.appendChild(db);mc.appendChild(row);});
    if(!items.length)mc.appendChild(el('div',{style:{fontSize:'11px',color:'var(--tx3)',paddingTop:'7px',borderTop:'1px solid var(--bor)',marginTop:'5px',textAlign:'center'}},'Nothing logged yet'));
    p.appendChild(mc);
  });
  // DB
  const dbc=el('div',{class:'card'});dbc.appendChild(el('div',{class:'slbl'},__('food_db')+' ('+FOODS.length+')'));
  const cats=[{id:'all',l:'All'},{id:'main',l:'Mains'},{id:'soup',l:'Soups'},{id:'salad',l:'Salads'},{id:'bread',l:'Bread'},{id:'sweet',l:'Sweets'},{id:'drink',l:'Drinks'},{id:'protein',l:'Protein'},{id:'fruit',l:'Fruits'},{id:'dairy',l:'Dairy'},{id:'carbs',l:'Carbs'},{id:'fat',l:'Fats'}];
  let aCat='all',sq='';
  const catpills=el('div',{class:'catpills'});const cBs={};
  cats.forEach(c=>{const b=el('div',{class:'catpill'+(aCat===c.id?' on':'')},c.l);b.addEventListener('click',()=>{aCat=c.id;Object.values(cBs).forEach(x=>x.classList.remove('on'));b.classList.add('on');renderDB();});cBs[c.id]=b;catpills.appendChild(b);});
  const sinp=el('input',{class:'inp',placeholder:__('search_foods'),style:{marginBottom:'9px'}});sinp.addEventListener('input',()=>{sq=sinp.value.toLowerCase();renderDB();});
  const dbList=el('div');
  function renderDB(){dbList.innerHTML='';let flt=FOODS.filter(f=>aCat==='all'||f.cat===aCat);if(sq)flt=flt.filter(f=>f.name.toLowerCase().includes(sq)||f.ar.includes(sq));if(!flt.length){dbList.appendChild(emptyState('🥺','No foods found','Try a different search.',));return;}flt.slice(0,20).forEach(f=>{const fc=Math.round(f.cal*f.srv/100);const row=el('div',{class:'frow'});row.appendChild(el('span',{class:'femo'},f.icon));row.appendChild(el('div',{style:{flex:'1',minWidth:'0'}},el('div',{class:'fname'},f.name),el('div',{class:'fmeta'},f.ar+' — '+f.srv+'g')));row.appendChild(el('div',{class:'fkcal'},fc+' kcal'));const ab=el('button',{class:'btn btn-gh btn-sm',style:{flexShrink:'0'}},'+');ab.addEventListener('click',e=>{e.stopPropagation();openFoodModal(food=>{const _fe={...food,date:today(),id:Date.now()};S.food.push(_fe);saveS();checkAch();dbSaveFood(_fe);render();},f);});row.appendChild(ab);dbList.appendChild(row);});}
  dbc.appendChild(catpills);dbc.appendChild(sinp);dbc.appendChild(dbList);renderDB();p.appendChild(dbc);return p;
}
function openFoodModal(onAdd,pre){
  let sel=pre||null,grams=pre?pre.srv:100,mealId='lunch';
  const ov=el('div',{class:'modal-bg'});const box=el('div',{class:'modal-box'});ov.appendChild(box);ov.addEventListener('click',e=>{if(e.target===ov)ov.remove();});
  const mls={breakfast:__('breakfast'),lunch:__('lunch'),dinner:__('dinner'),snack:__('snack_m')};
  function build(){box.innerHTML='';box.appendChild(el('div',{class:'mhandle'}));box.appendChild(el('div',{style:{fontWeight:'800',fontSize:'17px',marginBottom:'11px'}},'🔍 '+__('add_food')));
    const mr=el('div',{style:{display:'flex',gap:'6px',marginBottom:'10px',overflowX:'auto'}});['breakfast','lunch','dinner','snack'].forEach(m=>{const b=el('div',{class:'catpill'+(mealId===m?' on':'')},mls[m]);b.addEventListener('click',()=>{mealId=m;build();});mr.appendChild(b);});box.appendChild(mr);
    const qi=el('input',{class:'inp',placeholder:__('search_foods'),style:{marginBottom:'9px'}});box.appendChild(qi);
    const lst=el('div',{style:{overflowY:'auto',maxHeight:'29vh',marginBottom:'11px'}});
    function dl(q){lst.innerHTML='';const flt=q?FOODS.filter(f=>f.name.toLowerCase().includes(q)||f.ar.includes(q)).slice(0,20):FOODS.slice(0,15);flt.forEach(f=>{const fc=Math.round(f.cal*f.srv/100);const row=el('div',{class:'frow'+(sel&&sel.id===f.id?' sel':'')},el('span',{class:'femo'},f.icon),el('div',{style:{flex:'1',minWidth:'0'}},el('div',{class:'fname'},f.name),el('div',{class:'fmeta'},f.ar+' — '+f.srv+'g')),el('div',{class:'fkcal'},fc+' kcal'));row.addEventListener('click',()=>{sel=f;grams=f.srv;build();});lst.appendChild(row);});}
    dl('');qi.addEventListener('input',()=>dl(qi.value.toLowerCase().trim()));box.appendChild(lst);
    if(sel){const c=fCals(sel,grams);const sr=el('div',{style:{display:'flex',gap:'8px',alignItems:'center',marginBottom:'11px'}});const si=el('input',{class:'inp',type:'number',style:{maxWidth:'84px'},value:String(grams)});si.addEventListener('input',()=>{grams=parseFloat(si.value)||sel.srv;build();});sr.appendChild(si);sr.appendChild(el('span',{style:{color:'var(--tx2)',fontSize:'13px'}},'g serving'));box.appendChild(sr);const mg=el('div',{class:'g4',style:{marginBottom:'12px'}});[[String(c.cal),'kcal','var(--pr2)'],[c.pro+'g',__('protein'),'#a78bfa'],[c.car+'g',__('carbs'),'#fbbf24'],[c.fat+'g',__('fats'),'#f87171']].forEach(([v,l,c2])=>mg.appendChild(el('div',{class:'sbox',style:{padding:'8px 4px'}},el('div',{class:'sv',style:{color:c2,fontSize:'13px'}},v),el('div',{class:'sl',style:{fontSize:'8px'}},l))));box.appendChild(mg);}
    const ab=el('button',{class:'btn btn-pr btn-w'},sel?__('add_to_meal')+' — '+mls[mealId]:__('sel_first'));if(!sel)ab.disabled=true;ab.addEventListener('click',()=>{if(!sel)return;const c=fCals(sel,grams);onAdd({name:sel.name,icon:sel.icon,meal:mealId,g:grams,...c});ov.remove();});box.appendChild(ab);}
  build();document.body.appendChild(ov);
}
function openBarcodeModal(onDone){
  const ov=el('div',{class:'modal-bg'});const box=el('div',{class:'modal-box'});ov.appendChild(box);let stream=null,scanInt=null;
  const stop=()=>{if(scanInt)clearInterval(scanInt);if(stream)stream.getTracks().forEach(t=>t.stop());};
  ov.addEventListener('click',e=>{if(e.target===ov){stop();ov.remove();}});
  const lookup=code=>{stop();st.textContent='Looking up: '+code;fetch('https://world.openfoodfacts.org/api/v2/product/'+code+'.json').then(r=>r.json()).then(d=>{if(d.status===1&&d.product){const pr=d.product,n=pr.nutriments||{};onDone({name:pr.product_name||'Scanned Food',icon:'📦',meal:'lunch',g:100,cal:Math.round(n['energy-kcal_100g']||0),pro:+(n.proteins_100g||0).toFixed(1),car:+(n.carbohydrates_100g||0).toFixed(1),fat:+(n.fat_100g||0).toFixed(1)});ov.remove();}else st.textContent='Not found. Try manual entry.';}).catch(()=>st.textContent='Network error.');};
  box.appendChild(el('div',{class:'mhandle'}));box.appendChild(el('div',{style:{fontWeight:'800',fontSize:'17px',marginBottom:'10px'}},'📷 Barcode Scanner'));
  const st=el('div',{style:{fontSize:'12px',color:'var(--tx2)',textAlign:'center',marginBottom:'9px'}},'Point camera at barcode');box.appendChild(st);
  const vid=document.createElement('video');vid.autoplay=true;vid.playsInline=true;vid.style.cssText='width:100%;border-radius:12px;background:#000;max-height:200px;object-fit:cover;display:block;margin-bottom:9px';if(typeof BarcodeDetector!=='undefined')box.appendChild(vid);
  const mi=el('input',{class:'inp',type:'text',placeholder:'Enter barcode manually...',style:{marginBottom:'7px'}});const mb=el('button',{class:'btn btn-pr btn-w'},'Look Up Product');mb.addEventListener('click',()=>{const c=mi.value.trim();if(c)lookup(c);});box.appendChild(mi);box.appendChild(mb);
  if(typeof BarcodeDetector!=='undefined'){navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'},audio:false}).then(s=>{stream=s;vid.srcObject=s;vid.play();const det=new BarcodeDetector({formats:['ean_13','ean_8','upc_a','upc_e','code_128','qr_code']});scanInt=setInterval(()=>det.detect(vid).then(b=>{if(b.length){clearInterval(scanInt);lookup(b[0].rawValue);}}).catch(()=>{}),500);}).catch(()=>st.textContent='Camera denied — use manual entry.');}
  document.body.appendChild(ov);
}
