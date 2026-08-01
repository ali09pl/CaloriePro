// api/ai.js — Salo AI Coach, backed by Hugging Face Inference Providers
// Environment: HF_TOKEN (required), HF_MODEL (optional, see default below),
//              SUPABASE_URL, SUPABASE_SERVICE_KEY (to verify the caller)
//
// TOKEN-BUDGET DESIGN (why this file is shaped the way it is):
//   1. SYSTEM_PROMPT is a short, fixed string — never rebuilt per request —
//      so it is byte-identical across calls and can benefit from any
//      provider-side prompt caching, and it's cheap even without caching.
//   2. The client never sends raw log/food arrays. It sends a small
//      pre-computed "digest" object (today's totals, 7-day averages, a
//      couple of deltas) — a few dozen tokens instead of hundreds.
//   3. Conversation history is capped: the client keeps only a short
//      rolling summary string + the last couple of turns (see
//      js/pages/ai.js / buildAIDigest()), never the full chat log.
//   4. Output is capped with max_tokens and a moderate temperature.

const HF_MODEL = process.env.HF_MODEL || 'Qwen/Qwen2.5-7B-Instruct-1M';

const SYSTEM_PROMPT =
  "You are Salo, a warm and encouraging nutrition & fitness coach inside " +
  "the CaloriePro app. Keep replies short (3-6 sentences, plain text, no " +
  "markdown headers). Be specific and practical, referencing the user's " +
  "numbers when given. Never invent data you weren't given. If asked about " +
  "medical conditions, medication, or eating disorders, gently suggest " +
  "seeing a doctor or dietitian instead of prescribing anything.";

// Rate limit: per authenticated user, in-memory (per serverless instance).
const rateLimits = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 12;

function checkRateLimit(userId){
  const now = Date.now();
  const rec = rateLimits.get(userId);
  if (!rec || now - rec.windowStart > RATE_LIMIT_WINDOW) {
    rateLimits.set(userId, { windowStart: now, count: 1 });
    return true;
  }
  if (rec.count >= RATE_LIMIT_MAX) return false;
  rec.count++;
  return true;
}

function setCorsHeaders(res, req){
  const origin = req.headers.origin || '';
  const allowed = /^https:\/\/([a-z0-9-]+\.)?calorie-pro\.vercel\.app$|^https:\/\/calorie-pro\.vercel\.app$|^http:\/\/localhost(:\d+)?$/.test(origin);
  res.setHeader('Access-Control-Allow-Origin', allowed ? origin : 'https://calorie-pro.vercel.app');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function clampStr(v, max){
  if (typeof v !== 'string') return '';
  return v.slice(0, max);
}

// Keep the digest strictly to known numeric/short-string fields so a
// malicious client can't smuggle a huge payload (and burn tokens/cost) by
// stuffing arbitrary text into "digest".
function sanitizeDigest(d){
  d = d && typeof d === 'object' ? d : {};
  const num = (v) => (typeof v === 'number' && isFinite(v)) ? Math.round(v * 10) / 10 : null;
  return {
    goal: clampStr(d.goal, 20),
    targetCal: num(d.targetCal),
    todayCal: num(d.todayCal),
    todayProtein: num(d.todayProtein),
    targetProtein: num(d.targetProtein),
    weeklyRateKg: num(d.weeklyRateKg),
    streakDays: num(d.streakDays),
    sleepAvg7: num(d.sleepAvg7),
    waterToday: num(d.waterToday),
    bmi: num(d.bmi)
  };
}

function sanitizeHistory(h){
  if (!Array.isArray(h)) return [];
  // Last 4 turns max, short strings only — this is the client's already-
  // compacted rolling window, we just defensively re-clamp it server-side.
  return h.slice(-4).map(function(m){
    return {
      role: (m && (m.role === 'user' || m.role === 'assistant')) ? m.role : 'user',
      content: clampStr(m && m.content, 500)
    };
  });
}

export default async function handler(req, res){
  setCorsHeaders(res, req);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.slice(7);
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const authRes = await fetch(supabaseUrl + '/auth/v1/user', {
      headers: { 'Authorization': 'Bearer ' + token, 'apikey': serviceKey }
    });
    if (!authRes.ok) return res.status(401).json({ error: 'Invalid or expired token' });
    const user = await authRes.json();
    if (!user.id) return res.status(401).json({ error: 'Invalid token' });

    if (!checkRateLimit(user.id)) {
      return res.status(429).json({ error: 'Too many requests. Wait a minute and try again.' });
    }

    const hfToken = process.env.HF_TOKEN;
    if (!hfToken) return res.status(500).json({ error: 'AI service not configured' });

    const body = req.body || {};
    const message = clampStr(body.message, 600).trim();
    if (!message) return res.status(400).json({ error: 'Message required' });

    const digest = sanitizeDigest(body.digest);
    const summary = clampStr(body.summary, 400);
    const history = sanitizeHistory(body.history);

    const contextLine = 'User context (JSON, may have nulls for unknown): ' + JSON.stringify(digest);
    const messages = [{ role: 'system', content: SYSTEM_PROMPT }];
    if (summary) messages.push({ role: 'system', content: 'Conversation so far (summary): ' + summary });
    messages.push({ role: 'system', content: contextLine });
    history.forEach(function(m){ messages.push(m); });
    messages.push({ role: 'user', content: message });

    const hfRes = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + hfToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: HF_MODEL,
        messages: messages,
        max_tokens: 350,
        temperature: 0.6
      })
    });

    if (!hfRes.ok) {
      const errText = await hfRes.text().catch(function(){ return ''; });
      console.error('HF inference error:', hfRes.status, errText.slice(0, 300));
      return res.status(502).json({ error: 'AI service temporarily unavailable' });
    }

    const data = await hfRes.json();
    const reply = data && data.choices && data.choices[0] && data.choices[0].message
      ? data.choices[0].message.content
      : null;

    if (!reply) return res.status(502).json({ error: 'AI service returned no reply' });

    res.status(200).json({ reply: reply.trim() });
  } catch (e) {
    console.error('AI API error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
}
