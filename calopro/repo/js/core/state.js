// =========================================================
// MODULE: STATE
// =========================================================
let S={
  theme:LS.get('cp6_th','dark'), lang:LS.get('cp6_lg','en'),
  page:'home', onboarded:LS.get('cp6_ob',false),
  profile:LS.get('cp6_pr',null), plan:null,
  logs:LS.get('cp6_lo',[]), food:LS.get('cp6_fd',[]),
  water:LS.get('cp6_wt',{date:'',count:0}),
  sleep:LS.get('cp6_sl',[]), acts:LS.get('cp6_ac',[]),
  achiev:LS.get('cp6_ach',[]), xp:LS.get('cp6_xp',0),
  streak:LS.get('cp6_st',{count:0,last:'',hist:[]}),
  steps:LS.get('cp6_sp',{date:'',count:0}),
  goal:LS.get('cp6_gl','fl'),
  challenges:LS.get('cp6_ch',{}),
  ramadan:LS.get('cp6_rm',false),
  notifs:LS.get('cp6_nt',true),
};
function saveS(){
  LS.set('cp6_th',S.theme);LS.set('cp6_lg',S.lang);LS.set('cp6_ob',S.onboarded);
  LS.set('cp6_pr',S.profile);LS.set('cp6_lo',S.logs);LS.set('cp6_fd',S.food);
  LS.set('cp6_wt',S.water);LS.set('cp6_sl',S.sleep);LS.set('cp6_ac',S.acts);
  LS.set('cp6_ach',S.achiev);LS.set('cp6_xp',S.xp);LS.set('cp6_st',S.streak);
  LS.set('cp6_sp',S.steps);LS.set('cp6_gl',S.goal);LS.set('cp6_ch',S.challenges);
  LS.set('cp6_rm',S.ramadan);LS.set('cp6_nt',S.notifs);
}
function go(pg){S.page=pg;render();window.scrollTo({top:0,behavior:'smooth'});}

