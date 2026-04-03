// =========================================================
// SHELL: TOP BAR + BOTTOM NAV + RENDER
// =========================================================
const PAGE_TITLES={home:'CaloriePro',setup:'Setup',results:'My Plan',dash:'Dashboard',food:'Food Log',track:'Weight Log',activ:'Activity',water:'Water',sleep:'Sleep',ramadan:'Ramadan',ai:'AI Coach',ach:'Achievements',chal:'Challenges',sett:'Settings',more:'More'};

function mkTopBar(){
  const bar=el('div',{class:'topbar'});
  const left=el('div',{style:{display:'flex',alignItems:'center',gap:'8px'}});
  if(!['home','dash'].includes(S.page)){const bk=el('button',{class:'btn btn-gh btn-ic',style:{padding:'6px 10px',fontSize:'14px'}});bk.textContent='←';bk.addEventListener('click',()=>go('home'));left.appendChild(bk);}
  const brand=el('div',{class:'tbrand'});
  if(S.page==='home'){const logo=el('div',{class:'blogo'});logo.textContent='🥗';brand.appendChild(logo);}
  const nameEl=el('span',{class:'bname'});nameEl.textContent=PAGE_TITLES[S.page]||'CaloriePro';brand.appendChild(nameEl);
  if(S.page==='home'&&S.plan){const badge=el('span',{class:'bbadge'});badge.textContent='PRO';brand.appendChild(badge);}
  left.appendChild(brand);bar.appendChild(left);
  const right=el('div',{class:'tbar-r'});
  // Lang pill — toggles EN <-> AR directly
  const lb=el('div',{style:{display:'flex',alignItems:'center',gap:'4px',padding:'5px 9px',borderRadius:'8px',background:'var(--glass2)',border:'1px solid var(--bor)',cursor:'pointer',userSelect:'none',fontSize:'11px',fontWeight:'800',color:'var(--tx2)',letterSpacing:'.5px',transition:'background .18s'}});
  lb.textContent=(S.lang||'en')==='ar'?'AR 🇲🇦':'EN 🇬🇧';
  lb.title='Switch language / تغيير اللغة';
  lb.addEventListener('click',()=>{S.lang=S.lang==='ar'?'en':'ar';LS.set('cp6_lg',S.lang);applyLang();render();});
  right.appendChild(lb);
  // Theme toggle
  const thb=el('button',{class:'btn btn-gh btn-ic',style:{fontSize:'15px'}});thb.textContent=S.theme==='dark'?'☀️':'🌙';thb.addEventListener('click',()=>{S.theme=S.theme==='dark'?'light':'dark';document.documentElement.setAttribute('data-theme',S.theme);LS.set('cp6_th',S.theme);render();});right.appendChild(thb);
  const lgb=el('button',{class:'btn btn-gh btn-ic',style:{fontSize:'13px',padding:'7px 10px',color:'var(--rd2)',borderColor:'rgba(239,68,68,.25)'}});lgb.textContent='Exit';lgb.title='Logout';lgb.addEventListener('click',()=>{if(confirm('Log out?'))doLogout();});right.appendChild(lgb);
  bar.appendChild(right);return bar;
}

function mkBottomNav(){
  const nav=el('div',{class:'bnav'});
  const tabs=[['home','Home','🏠'],['dash','Plan','⚡'],['food','Food','🍽️'],['track','Track','📊'],['more','More','☰']];
  tabs.forEach(([id,label,icon])=>{
    const b=el('button',{class:'nb'+(S.page===id||(['setup','results'].includes(S.page)&&id==='dash')?' on':'')});
    b.appendChild(el('span',{class:'nbi'},icon));b.appendChild(document.createTextNode(label));
    b.addEventListener('click',()=>go(id));nav.appendChild(b);
  });return nav;
}

const PAGE_MAP={
  home:pgHome, setup:pgSetup, results:pgResults, dash:pgDash,
  food:pgFood, track:pgTrack, activ:pgActiv, water:pgWater,
  sleep:pgSleep, ramadan:pgRamadan, ai:pgAI, ach:pgAch,
  chal:pgChal, more:pgMore, sett:pgSett,
};

function render(){
  const app=document.getElementById('app');
  app.innerHTML='';
  document.documentElement.setAttribute('data-theme',S.theme);
  applyLang();
  app.appendChild(mkTopBar());
  app.appendChild((PAGE_MAP[S.page]||pgHome)());
  app.appendChild(mkBottomNav());
}

// =========================================================
// BOOT
// =========================================================
if(!['en','ar'].includes(S.lang)){S.lang='en';LS.set('cp6_lg','en');}
if(S.profile){S.plan=calcPlan(S.profile);S.page='dash';}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();window._dip=e;});
checkAch();
applyLang();

// Show onboarding for first-time users
if(!S.onboarded){
  render();
  document.getElementById('app').appendChild(pgOnboard());
} else {
  render();
}

// Supabase sync (runs in background after render)
dbSync().then(()=>{ render(); });

// Service Worker (offline support)
if('serviceWorker' in navigator){
  try{
    const swCode=`self.addEventListener('install',e=>e.waitUntil(caches.open('cp6').then(c=>c.add(location.href))));self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))))`;
    navigator.serviceWorker.register(URL.createObjectURL(new Blob([swCode],{type:'application/javascript'}))).catch(()=>{});
  }catch(e){}
}