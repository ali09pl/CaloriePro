// api/sync.js — Secure Turso Backup API
// Requires environment variables:
//   TURSO_URL
//   TURSO_AUTH_TOKEN
//   SUPABASE_URL
//   SUPABASE_SERVICE_KEY

import { createClient } from "@libsql/client/http";

// Turso client (credentials from env)
const turso = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

// Rate limiting (simple in-memory, use Redis in production)
const rateLimits = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 100;

// Initialize Turso tables
async function initDB() {
  await turso.batch([
    `CREATE TABLE IF NOT EXISTS profiles (
      user_id TEXT PRIMARY KEY,
      email TEXT,
      data TEXT,
      updated_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS weight_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      entry_id TEXT,
      date TEXT,
      weight REAL,
      note TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS food_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      entry_id TEXT,
      date TEXT,
      name TEXT,
      icon TEXT,
      meal TEXT,
      grams REAL,
      calories INTEGER,
      protein REAL,
      carbs REAL,
      fat REAL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`
  ], "write");
}

// Validate and extract user from Supabase JWT via REST API
async function authenticate(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }

  const token = authHeader.slice(7);
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Server configuration error');
  }

  // Verify token with Supabase Auth API
  const authRes = await fetch(supabaseUrl + '/auth/v1/user', {
    headers: {
      'Authorization': 'Bearer ' + token,
      'apikey': serviceKey
    }
  });

  if (!authRes.ok) {
    throw new Error('Invalid or expired token');
  }

  const user = await authRes.json();
  if (!user.id) throw new Error('Invalid token: no user ID');

  return {
    userId: user.id,
    email: user.email || null
  };
}

// Rate limit check
function checkRateLimit(userId) {
  const now = Date.now();
  const userLimit = rateLimits.get(userId);

  if (!userLimit || now - userLimit.windowStart > RATE_LIMIT_WINDOW) {
    rateLimits.set(userId, { windowStart: now, count: 1 });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_MAX) {
    return false;
  }

  userLimit.count++;
  return true;
}

// Input validation helpers
function validateString(val, maxLen) {
  maxLen = maxLen || 255;
  if (typeof val !== 'string') return null;
  const trimmed = val.trim();
  if (trimmed.length === 0 || trimmed.length > maxLen) return null;
  return trimmed;
}

function validateNumber(val, min, max) {
  min = min || 0;
  max = max || 100000;
  const num = Number(val);
  if (isNaN(num) || num < min || num > max) return null;
  return num;
}

function validateDate(val) {
  const str = validateString(val, 10);
  if (!str || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
  return str;
}

// CORS headers
function setCorsHeaders(res, req) {
  const allowedOrigins = [
    'https://calorie-pro.vercel.app',
    'http://localhost:3000'
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.indexOf(origin) !== -1) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

export default async function handler(req, res) {
  setCorsHeaders(res, req);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    await initDB();

    // Authenticate all requests
    const user = await authenticate(req);

    // Rate limit
    if (!checkRateLimit(user.userId)) {
      return res.status(429).json({ error: 'Rate limit exceeded. Try again later.' });
    }

    // GET — load data from Turso
    if (req.method === 'GET') {
      const [profile, logs, food] = await Promise.all([
        turso.execute({ 
          sql: 'SELECT * FROM profiles WHERE user_id = ?', 
          args: [user.userId] 
        }),
        turso.execute({ 
          sql: 'SELECT * FROM weight_logs WHERE user_id = ? ORDER BY date ASC', 
          args: [user.userId] 
        }),
        turso.execute({ 
          sql: 'SELECT * FROM food_logs WHERE user_id = ? ORDER BY date ASC', 
          args: [user.userId] 
        })
      ]);

      return res.status(200).json({
        profile: profile.rows[0] ? JSON.parse(profile.rows[0].data) : null,
        logs: logs.rows.map(function(r) { 
          return { id: Number(r.entry_id), date: r.date, w: r.weight, note: r.note || '' };
        }),
        food: food.rows.map(function(r) { 
          return { 
            id: Number(r.entry_id), date: r.date, name: r.name, icon: r.icon, 
            meal: r.meal, g: r.grams, cal: r.calories, pro: r.protein, 
            car: r.carbs, fat: r.fat 
          };
        })
      });
    }

    // POST — save data to Turso
    if (req.method === 'POST') {
      const body = req.body || {};
      const type = body.type;
      const data = body.data;

      if (!type || !data) {
        return res.status(400).json({ error: 'Missing type or data' });
      }

      if (type === 'profile') {
        const dataStr = JSON.stringify(data);
        if (!dataStr || dataStr.length > 50000) {
          return res.status(400).json({ error: 'Invalid profile data' });
        }

        await turso.execute({
          sql: 'INSERT OR REPLACE INTO profiles (user_id, email, data, updated_at) VALUES (?, ?, ?, ?)',
          args: [user.userId, user.email, dataStr, new Date().toISOString()]
        });
        return res.status(200).json({ ok: true });
      }

      if (type === 'log') {
        const entryId = validateString(String(data.id), 50);
        const date = validateDate(data.date);
        const weight = validateNumber(data.w, 1, 1000);

        if (!entryId || !date || weight === null) {
          return res.status(400).json({ error: 'Invalid log data' });
        }

        await turso.execute({
          sql: 'INSERT OR REPLACE INTO weight_logs (user_id, entry_id, date, weight, note) VALUES (?, ?, ?, ?, ?)',
          args: [user.userId, entryId, date, weight, validateString(data.note, 500) || null]
        });
        return res.status(200).json({ ok: true });
      }

      if (type === 'food') {
        const entryId = validateString(String(data.id), 50);
        const date = validateDate(data.date);
        const name = validateString(data.name, 200);
        const calories = validateNumber(data.cal, 0, 50000);

        if (!entryId || !date || !name || calories === null) {
          return res.status(400).json({ error: 'Invalid food data' });
        }

        await turso.execute({
          sql: 'INSERT OR REPLACE INTO food_logs (user_id, entry_id, date, name, icon, meal, grams, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          args: [
            user.userId, entryId, date, name,
            validateString(data.icon, 10) || '🍽️',
            validateString(data.meal, 20) || null,
            validateNumber(data.g, 0, 10000) || 0,
            calories,
            validateNumber(data.pro, 0, 1000) || 0,
            validateNumber(data.car, 0, 1000) || 0,
            validateNumber(data.fat, 0, 1000) || 0
          ]
        });
        return res.status(200).json({ ok: true });
      }

      if (type === 'delete_log') {
        const entryId = validateString(String(data.id), 50);
        if (!entryId) return res.status(400).json({ error: 'Invalid id' });

        await turso.execute({ 
          sql: 'DELETE FROM weight_logs WHERE user_id = ? AND entry_id = ?', 
          args: [user.userId, entryId] 
        });
        return res.status(200).json({ ok: true });
      }

      if (type === 'delete_food') {
        const entryId = validateString(String(data.id), 50);
        if (!entryId) return res.status(400).json({ error: 'Invalid id' });

        await turso.execute({ 
          sql: 'DELETE FROM food_logs WHERE user_id = ? AND entry_id = ?', 
          args: [user.userId, entryId] 
        });
        return res.status(200).json({ ok: true });
      }

      return res.status(400).json({ error: 'Unknown type' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('Turso API error:', e);
    const status = (e.message && (e.message.indexOf('token') !== -1 || e.message.indexOf('auth') !== -1)) ? 401 : 500;
    res.status(status).json({ error: e.message || 'Internal server error' });
  }
}
