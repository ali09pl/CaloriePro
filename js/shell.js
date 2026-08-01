// =========================================================
// SHELL: TOP BAR + BOTTOM NAV + RENDER
// =========================================================
const PAGE_TITLES={home:'CaloriePro',setup:'Setup',results:'My Plan',dash:'Dashboard',food:'Food Log',track:'Weight Log',activ:'Activity',water:'Water',sleep:'Sleep',ramadan:'Ramadan',ai:'AI Coach',ach:'Achievements',chal:'Challenges',sett:'Settings',more:'More'};

/** Chart instances registry — destroy before re-render to avoid memory leaks */
window._cpCharts = window._cpCharts || [];
function destroyCharts(){
  if(!window._cpCharts) return;
  window._cpCharts.forEach(c=>{ try{ c.destroy(); }catch(e){} });
  window._cpCharts = [];
}
function registerChart(chart){
  if(chart) window._cpCharts.push(chart);
  return chart;
}

function mkTopBar(){
  const bar=el('div',{class:'topbar',role:'banner'});
  const left=el('div',{style:{display:'flex',alignItems:'center',gap:'8px',minWidth:'0',flex:'1'}});
  if(!['home','dash'].includes(S.page)){
    const bk=el('button',{class:'btn btn-gh btn-ic',style:{padding:'6px 10px',fontSize:'14px'},'aria-label':'Go back'});
    bk.textContent='←';
    bk.addEventListener('click',()=>go('home'));
    left.appendChild(bk);
  }
  const brand=el('div',{class:'tbrand',role:'button',tabindex:'0','aria-label':'CaloriePro home'});
  brand.addEventListener('click',()=>go('home'));
  brand.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); go('home'); }});
  if(S.page==='home'){
    const logo=el('div',{class:'blogo','aria-hidden':'true'});
    logo.textContent='🥗';
    brand.appendChild(logo);
  }
  const nameEl=el('span',{class:'bname'});
  nameEl.textContent=PAGE_TITLES[S.page]||'CaloriePro';
  brand.appendChild(nameEl);
  if(S.page==='home'&&S.plan){
    const badge=el('span',{class:'bbadge'});
    badge.textContent='PRO';
    brand.appendChild(badge);
  }
  left.appendChild(brand);
  bar.appendChild(left);

  const right=el('div',{class:'tbar-r',role:'toolbar','aria-label':'App controls'});
  // Lang pill — toggles EN <-> AR directly
  const lb=el('button',{
    type:'button',
    style:{display:'flex',alignItems:'center',gap:'4px',padding:'5px 9px',borderRadius:'8px',background:'var(--glass2)',border:'1px solid var(--bor)',cursor:'pointer',userSelect:'none',fontSize:'11px',fontWeight:'800',color:'var(--tx2)',letterSpacing:'.5px',transition:'background .18s',minHeight:'36px'},
    'aria-label':'Switch language',
    title:'Switch language / تغيير اللغة'
  });
  lb.textContent=(S.lang||'en')==='ar'?'AR 🇲🇦':'EN 🇬🇧';
  lb.addEventListener('click',()=>{
    S.lang=S.lang==='ar'?'en':'ar';
    LS.set('cp6_lg',S.lang);
    applyLang();
    render();
  });
  right.appendChild(lb);

  // Theme toggle
  const thb=el('button',{class:'btn btn-gh btn-ic',type:'button',style:{fontSize:'15px'},'aria-label':S.theme==='dark'?'Switch to light theme':'Switch to dark theme'});
  thb.textContent=S.theme==='dark'?'☀️':'🌙';
  thb.addEventListener('click',()=>{
    S.theme=S.theme==='dark'?'light':'dark';
    document.documentElement.setAttribute('data-theme',S.theme);
    LS.set('cp6_th',S.theme);
    render();
  });
  right.appendChild(thb);

  const lgb=el('button',{class:'btn btn-gh btn-ic',type:'button',style:{fontSize:'13px',padding:'7px 10px',color:'var(--rd2)',borderColor:'rgba(239,68,68,.25)'},'aria-label':'Log out',title:'Logout'});
  lgb.textContent='Exit';
  lgb.addEventListener('click',()=>{ if(confirm('Log out?')) doLogout(); });
  right.appendChild(lgb);

  // Admin button — visible only for nexorastudio74@gmail.com
  if(typeof DB!=='undefined'&&DB.auth){
    DB.auth.getSession().then(({data})=>{
      if(data.session&&data.session.user.email==='nexorastudio74@gmail.com'){
        const ab=el('button',{class:'btn btn-gh btn-ic',type:'button',style:{fontSize:'13px',padding:'7px 10px',color:'var(--pu2)',borderColor:'rgba(139,92,246,.3)'},title:'Admin Panel','aria-label':'Admin panel'});
        ab.textContent='⚡';
        ab.addEventListener('click',()=>window.location.href='/nx-admin-7x9k2p.html');
        right.appendChild(ab);
      }
    }).catch(()=>{});
  }
  bar.appendChild(right);
  return bar;
}

function mkBottomNav(){
  const nav=el('nav',{class:'bnav',role:'navigation','aria-label':'Main'});
  const tabs=[
    ['home','Home','🏠'],
    ['dash','Plan','⚡'],
    ['food','Food','🍽️'],
    ['track','Track','📊'],
    ['more','More','☰']
  ];
  tabs.forEach(([id,label,icon])=>{
    const isOn=S.page===id||(['setup','results'].includes(S.page)&&id==='dash');
    const b=el('button',{
      class:'nb'+(isOn?' on':''),
      type:'button',
      'aria-label':label,
      'aria-current':isOn?'page':null
    });
    const ic=el('span',{class:'nbi','aria-hidden':'true'});
    ic.textContent=icon;
    b.appendChild(ic);
    b.appendChild(document.createTextNode(label));
    b.addEventListener('click',()=>go(id));
    nav.appendChild(b);
  });
  return nav;
}

const PAGE_MAP={
  home:pgHome, setup:pgSetup, results:pgResults, dash:pgDash,
  food:pgFood, track:pgTrack, activ:pgActiv, water:pgWater,
  sleep:pgSleep, ramadan:pgRamadan, ai:pgAI, ach:pgAch,
  chal:pgChal, more:pgMore, sett:pgSett,
};

function render(){
  destroyCharts();
  const app=document.getElementById('app');
  if(!app) return;
  app.innerHTML='';
  document.documentElement.setAttribute('data-theme',S.theme);
  document.documentElement.lang=S.lang==='ar'?'ar':'en';
  applyLang();
  app.appendChild(mkTopBar());
  const pageEl=(PAGE_MAP[S.page]||pgHome)();
  if(pageEl){
    pageEl.setAttribute('role','main');
    pageEl.id='main-content';
    app.appendChild(pageEl);
  }
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
if(typeof dbSync==='function'){
  dbSync().then(()=>{ render(); }).catch(()=>{});
}

// Service Worker registration lives in js/sw-register.js (loaded from app.html)
