// =========================================================
// MODULE: SUPABASE — SECURE VERSION v7.1
// Client uses the PUBLIC anon key only (safe with RLS).
// Override via window.__ENV__ if you inject config at deploy.
// Service role keys must NEVER appear in client code.
// =========================================================

// Public project credentials (anon key is designed for client use + RLS).
// Optional runtime override: window.__ENV__ = { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY }
const SUPABASE_URL  = (window.__ENV__ && window.__ENV__.VITE_SUPABASE_URL)
  || 'https://momnfuwtgzsatptkntgp.supabase.co';
const SUPABASE_ANON = (window.__ENV__ && window.__ENV__.VITE_SUPABASE_ANON_KEY)
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vbW5mdXd0Z3pzYXRwdGtudGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNDMxMjYsImV4cCI6MjA5MDYxOTEyNn0.lcuaL2wlDJ5mX5NOBq_O8Myt6t3rVAl2_nyMRMoklko';

if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.error('CaloriePro: Missing Supabase configuration. Auth and sync will not work.');
}

const { createClient } = supabase;

// Create client with auth persistence
const DB = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage,
    storageKey: 'cp7_auth_token'
  },
  global: {
    headers: {
      'X-Client-Info': 'caloriepro/7.1'
    }
  }
});

let CURRENT_USER = null;
let SYNC_IN_PROGRESS = false;
let SYNC_QUEUE = [];

// =========================================================
// AUTH GUARD
// =========================================================
DB.auth.onAuthStateChange((event, session) => {
  if (session) {
    CURRENT_USER = session.user;
    if (event === 'SIGNED_IN') {
      const key = 'cp7_welcomed_' + session.user.id;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, '1');
        if (session.user.email) {
          const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || '';
          sendWelcomeEmailServer(session.user.email, name);
        }
      }
      setTimeout(() => dbSync(), 500);
    }
  } else if (event === 'SIGNED_OUT') {
    CURRENT_USER = null;
    window.location.href = '/login.html';
  }
});

// Initial session check
DB.auth.getSession().then(({ data, error }) => {
  if (error || !data.session) {
    const protectedPages = ['/app.html', '/admin.html', '/nx-admin-7x9k2p.html'];
    const currentPath = window.location.pathname;
    if (protectedPages.some(p => currentPath.endsWith(p))) {
      window.location.href = '/login.html';
    }
  } else {
    CURRENT_USER = data.session.user;
  }
});

async function doLogout() {
  await DB.auth.signOut();
  localStorage.removeItem('cp7_auth_token');
  window.location.href = '/login.html';
}

// =========================================================
// SERVER-SIDE WELCOME EMAIL
// =========================================================
async function sendWelcomeEmailServer(email, name) {
  try {
    const { data: { session } } = await DB.auth.getSession();
    if (!session) return;

    const res = await fetch('/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + session.access_token
      },
      body: JSON.stringify({
        type: 'welcome',
        to: email,
        name: name || 'there'
      })
    });

    if (!res.ok) throw new Error('Email API failed');
  } catch (e) {
    console.warn('Welcome email failed:', e);
  }
}

// =========================================================
// RETRY HELPER
// =========================================================
async function withRetry(fn, maxRetries, delay) {
  maxRetries = maxRetries || 3;
  delay = delay || 1000;
  var lastError;
  for (var i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (i < maxRetries - 1) {
        await new Promise(function(r) { setTimeout(r, delay * (i + 1)); });
      }
    }
  }
  throw lastError;
}

// =========================================================
// GET CURRENT USER ID (auth.uid() standard)
// =========================================================
function getUserId() {
  return CURRENT_USER ? CURRENT_USER.id : null;
}

async function ensureAuth() {
  var sd = await DB.auth.getSession();
  var session = sd.data ? sd.data.session : null;
  if (!session || !session.user) throw new Error('Not authenticated');
  return session.user;
}

// =========================================================
// PROFILE OPERATIONS — user_id based
// =========================================================
async function dbSaveProfile(profile) {
  if (!profile) return;
  try {
    var user = await ensureAuth();
    var payload = {
      user_id: user.id,
      data: profile,
      email: user.email || null,
      updated_at: new Date().toISOString()
    };

    await withRetry(function() {
      return DB.from('profiles').upsert(payload, { onConflict: 'user_id' });
    });
    tursoBackup('profile', profile);
  } catch (e) {
    console.warn('dbSaveProfile:', e);
    throw e;
  }
}

async function dbLoadProfile() {
  try {
    var user = await ensureAuth();
    var result = await withRetry(function() {
      return DB.from('profiles').select('data').eq('user_id', user.id).single();
    });
    if (result.error || !result.data) return null;
    return result.data.data;
  } catch (e) {
    console.warn('dbLoadProfile:', e);
    return null;
  }
}

async function dbIsAdmin() {
  try {
    var user = await ensureAuth();
    var result = await withRetry(function() {
      return DB.from('profiles').select('is_admin').eq('user_id', user.id).single();
    });
    if (result.error || !result.data) return false;
    return !!result.data.is_admin;
  } catch (e) {
    return false;
  }
}

// =========================================================
// WEIGHT LOG OPERATIONS — user_id based
// =========================================================
async function dbSaveLog(entry) {
  try {
    var user = await ensureAuth();
    await withRetry(function() {
      return DB.from('weight_logs').upsert({
        user_id: user.id,
        entry_id: String(entry.id),
        date: entry.date,
        weight: entry.w,
        note: entry.note || null
      }, { onConflict: 'user_id,entry_id' });
    });
    tursoBackup('log', entry);
  } catch (e) {
    console.warn('dbSaveLog:', e);
    throw e;
  }
}

async function dbLoadLogs() {
  try {
    var user = await ensureAuth();
    var result = await withRetry(function() {
      return DB.from('weight_logs').select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });
    });
    if (result.error || !result.data) return null;
    return result.data.map(function(r) {
      return { id: Number(r.entry_id), date: r.date, w: r.weight, note: r.note || '' };
    });
  } catch (e) {
    console.warn('dbLoadLogs:', e);
    return null;
  }
}

async function dbDeleteLog(id) {
  try {
    var user = await ensureAuth();
    await withRetry(function() {
      return DB.from('weight_logs').delete()
        .eq('user_id', user.id)
        .eq('entry_id', String(id));
    });
    tursoBackup('delete_log', { id: id });
  } catch (e) {
    console.warn('dbDeleteLog:', e);
    throw e;
  }
}

// =========================================================
// FOOD LOG OPERATIONS — user_id based
// =========================================================
async function dbSaveFood(entry) {
  try {
    var user = await ensureAuth();
    await withRetry(function() {
      return DB.from('food_logs').upsert({
        user_id: user.id,
        entry_id: String(entry.id),
        date: entry.date,
        name: entry.name,
        icon: entry.icon || '🍽️',
        meal: entry.meal,
        grams: entry.g,
        calories: entry.cal,
        protein: entry.pro,
        carbs: entry.car,
        fat: entry.fat
      }, { onConflict: 'user_id,entry_id' });
    });
    tursoBackup('food', entry);
  } catch (e) {
    console.warn('dbSaveFood:', e);
    throw e;
  }
}

async function dbLoadFood() {
  try {
    var user = await ensureAuth();
    var result = await withRetry(function() {
      return DB.from('food_logs').select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });
    });
    if (result.error || !result.data) return null;
    return result.data.map(function(r) {
      return {
        id: Number(r.entry_id), date: r.date, name: r.name, icon: r.icon,
        meal: r.meal, g: r.grams, cal: r.calories, pro: r.protein,
        car: r.carbs, fat: r.fat
      };
    });
  } catch (e) {
    console.warn('dbLoadFood:', e);
    return null;
  }
}

async function dbDeleteFood(id) {
  try {
    var user = await ensureAuth();
    await withRetry(function() {
      return DB.from('food_logs').delete()
        .eq('user_id', user.id)
        .eq('entry_id', String(id));
    });
    tursoBackup('delete_food', { id: id });
  } catch (e) {
    console.warn('dbDeleteFood:', e);
    throw e;
  }
}

// =========================================================
// SYNC OPERATIONS — with deduplication
// =========================================================
async function dbSync() {
  if (SYNC_IN_PROGRESS) {
    SYNC_QUEUE.push('sync');
    return;
  }
  SYNC_IN_PROGRESS = true;

  try {
    var results = await Promise.all([dbLoadProfile(), dbLoadLogs(), dbLoadFood()]);
    var remoteProfile = results[0];
    var remoteLogs = results[1];
    var remoteFood = results[2];

    var changed = false;

    if (remoteProfile && !S.profile) {
      S.profile = remoteProfile;
      S.plan = calcPlan(remoteProfile);
      changed = true;
    }
    if (remoteLogs && remoteLogs.length > S.logs.length) {
      S.logs = remoteLogs;
      changed = true;
    }
    if (remoteFood && remoteFood.length > S.food.length) {
      S.food = remoteFood;
      changed = true;
    }

    if (changed) saveS();
    console.log('Supabase sync done');
  } catch (e) {
    console.warn('dbSync failed:', e);
  } finally {
    SYNC_IN_PROGRESS = false;
    if (SYNC_QUEUE.length > 0) {
      SYNC_QUEUE = [];
      setTimeout(function() { dbSync(); }, 100);
    }
  }
}

// =========================================================
// TURSO BACKUP — Server-side only via API
// =========================================================
async function tursoBackup(type, data) {
  try {
    var sd = await DB.auth.getSession();
    var session = sd.data ? sd.data.session : null;
    if (!session) return;

    await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + session.access_token
      },
      body: JSON.stringify({ type: type, data: data })
    });
  } catch (e) {
    console.warn('Turso backup failed:', e);
  }
}

