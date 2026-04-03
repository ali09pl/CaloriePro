// =========================================================
// MODULE: TOAST
// =========================================================
function showToast(icon,title,msg,type){
  const c=document.getElementById('toasts');if(!c)return;
  const t=document.createElement('div');t.className='toast';
  const cols={pr:'#10b981',ac:'#3b82f6',pu:'#8b5cf6',yl:'#f59e0b',rd:'#ef4444',gold:'#f59e0b'};
  t.style.borderLeft=`3px solid ${cols[type]||cols.pr}`;
  t.innerHTML=`<div class="t-icon">${icon}</div><div class="t-body"><div class="t-title">${title}</div>${msg?`<div class="t-msg">${msg}</div>`:''}</div>`;
  c.appendChild(t);
  setTimeout(()=>{t.classList.add('toast-hide');setTimeout(()=>t.remove(),260);},3400);
}


// =========================================================
// MODULE: DOM HELPER
// =========================================================
function el(tag,props,...children){
  const e=document.createElement(tag);
  if(props&&typeof props==='object'&&!Array.isArray(props)){
    for(const[k,v]of Object.entries(props)){
      if(v===null||v===undefined)continue;
      if(k==='class')e.className=v;
      else if(k==='style'&&typeof v==='object'){for(const sk in v)if(v[sk]!=null)e.style[sk]=v[sk];}
      else if(k.startsWith('on')&&typeof v==='function')e.addEventListener(k.slice(2).toLowerCase(),v);
      else e.setAttribute(k,String(v));
    }
  }
  for(const c of children){
    if(c===null||c===undefined||c===false||c===true)continue;
    if(typeof c==='function')continue;
    if(Array.isArray(c)){c.forEach(ci=>{if(ci==null||ci===false||ci===true||typeof ci==='function')return;e.appendChild(typeof ci==='string'||typeof ci==='number'?document.createTextNode(String(ci)):ci);});continue;}
    if(typeof c==='string'||typeof c==='number'){e.appendChild(document.createTextNode(String(c)));continue;}
    if(typeof c==='object'&&c.nodeType){e.appendChild(c);continue;}
  }
  return e;
}
function mkSw(on,cb,col){
  const s=el('div',{class:'sw'+(on?' on':'')});
  s.style.background=on?(col||'var(--pr)'):'var(--bor2)';
  const k=el('div',{class:'swk'});k.style.left=on?'25px':'3px';s.appendChild(k);
  s.addEventListener('click',()=>cb(!s.classList.contains('on')));return s;
}
function noProfCard(){
  const p=el('div',{class:'page'});
  p.appendChild(el('div',{class:'card card-pr',style:{textAlign:'center',padding:'48px 20px'}},
    el('div',{style:{fontSize:'58px',marginBottom:'14px'}},'📋'),
    el('h2',{class:'h1',style:{marginBottom:'10px'}},'Profile Required'),
    el('p',{style:{color:'var(--tx2)',marginBottom:'24px',fontSize:'14px',lineHeight:'1.75'}},__('no_profile')),
    (()=>{const b=el('button',{class:'btn btn-pr',style:{margin:'0 auto',display:'flex'}},'🚀 Set Up Profile');b.addEventListener('click',()=>go('setup'));return b;})()
  ));return p;
}
function emptyState(icon,title,msg,btnLabel,btnFn){
  const d=el('div',{class:'empty'},el('div',{class:'empty-ic'},icon),el('div',{class:'empty-t'},title),el('div',{class:'empty-m'},msg));
  if(btnLabel&&btnFn){const b=el('button',{class:'btn btn-pr btn-sm',style:{margin:'16px auto 0',display:'flex'}},btnLabel);b.addEventListener('click',btnFn);d.appendChild(b);}
  return d;
}
