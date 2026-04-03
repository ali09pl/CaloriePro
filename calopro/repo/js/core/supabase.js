// =========================================================
// MODULE: SUPABASE
// =========================================================
const SUPABASE_URL  = "https://momnfuwtgzsatptkntgp.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vbW5mdXd0Z3pzYXRwdGtudGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNDMxMjYsImV4cCI6MjA5MDYxOTEyNn0.lcuaL2wlDJ5mX5NOBq_O8Myt6t3rVAl2_nyMRMoklko";

const { createClient } = supabase;
const DB = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── Auth Guard — redirect to login if not logged in ──────
DB.auth.getSession().then(({ data }) => {
  if (!data.session) {
    window.location.href = '/login.html';
  }
});

// ── Current user ─────────────────────────────────────────
let CURRENT_USER = null;
DB.auth.onAuthStateChange((event, session) => {
  if (session) {
    CURRENT_USER = session.user;
  } else {
    window.location.href = '/login.html';
  }
});

// ── Logout function ──────────────────────────────────────
async function doLogout() {
  await DB.auth.signOut();
  window.location.href = '/login.html';
}

// ── Device ID (unique per browser) ──────────────────────
function getDeviceId() {
  let id = localStorage.getItem('cp6_did');
  if (!id) {
    id = 'dev_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('cp6_did', id);
  }
  return id;
}
const DEVICE_ID = getDeviceId();

// ── Save profile to Supabase ─────────────────────────────
async function dbSaveProfile(profile) {
  if (!profile) return;
  try {
    await DB.from('profiles').upsert({
      device_id: DEVICE_ID,
      data: profile,
      updated_at: new Date().toISOString()
    }, { onConflict: 'device_id' });
  } catch(e) { console.warn('dbSaveProfile:', e); }
}

// ── Load profile from Supabase ───────────────────────────
async function dbLoadProfile() {
  try {
    const { data, error } = await DB.from('profiles')
      .select('data')
      .eq('device_id', DEVICE_ID)
      .single();
    if (error || !data) return null;
    return data.data;
  } catch(e) { return null; }
}

// ── Save a weight log entry ──────────────────────────────
async function dbSaveLog(entry) {
  try {
    await DB.from('weight_logs').insert({
      device_id: DEVICE_ID,
      entry_id:  String(entry.id),
      date:      entry.date,
      weight:    entry.w,
      note:      entry.note || null
    });
  } catch(e) { console.warn('dbSaveLog:', e); }
}

// ── Load all weight logs ─────────────────────────────────
async function dbLoadLogs() {
  try {
    const { data, error } = await DB.from('weight_logs')
      .select('*')
      .eq('device_id', DEVICE_ID)
      .order('date', { ascending: true });
    if (error || !data) return null;
    return data.map(r => ({ id: Number(r.entry_id), date: r.date, w: r.weight, note: r.note || '' }));
  } catch(e) { return null; }
}

// ── Save a food entry ────────────────────────────────────
async function dbSaveFood(entry) {
  try {
    await DB.from('food_logs').insert({
      device_id: DEVICE_ID,
      entry_id:  String(entry.id),
      date:      entry.date,
      name:      entry.name,
      icon:      entry.icon || '🍽️',
      meal:      entry.meal,
      grams:     entry.g,
      calories:  entry.cal,
      protein:   entry.pro,
      carbs:     entry.car,
      fat:       entry.fat
    });
  } catch(e) { console.warn('dbSaveFood:', e); }
}

// ── Load all food logs ───────────────────────────────────
async function dbLoadFood() {
  try {
    const { data, error } = await DB.from('food_logs')
      .select('*')
      .eq('device_id', DEVICE_ID)
      .order('date', { ascending: true });
    if (error || !data) return null;
    return data.map(r => ({
      id: Number(r.entry_id), date: r.date, name: r.name,
      icon: r.icon, meal: r.meal, g: r.grams,
      cal: r.calories, pro: r.protein, car: r.carbs, fat: r.fat
    }));
  } catch(e) { return null; }
}

// ── Delete weight log ────────────────────────────────────
async function dbDeleteLog(id) {
  try {
    await DB.from('weight_logs')
      .delete()
      .eq('device_id', DEVICE_ID)
      .eq('entry_id', String(id));
  } catch(e) { console.warn('dbDeleteLog:', e); }
}

// ── Delete food entry ────────────────────────────────────
async function dbDeleteFood(id) {
  try {
    await DB.from('food_logs')
      .delete()
      .eq('device_id', DEVICE_ID)
      .eq('entry_id', String(id));
  } catch(e) { console.warn('dbDeleteFood:', e); }
}

// ── Sync on boot: load from Supabase → merge with localStorage ──
async function dbSync() {
  try {
    const [remoteProfile, remoteLogs, remoteFood] = await Promise.all([
      dbLoadProfile(),
      dbLoadLogs(),
      dbLoadFood()
    ]);

    if (remoteProfile && !S.profile) {
      S.profile = remoteProfile;
      S.plan = calcPlan(remoteProfile);
      saveS();
    }

    if (remoteLogs && remoteLogs.length > S.logs.length) {
      S.logs = remoteLogs;
      saveS();
    }

    if (remoteFood && remoteFood.length > S.food.length) {
      S.food = remoteFood;
      saveS();
    }

    console.log('✅ Supabase sync done');
  } catch(e) {
    console.warn('dbSync failed (offline?):', e);
  }
}
