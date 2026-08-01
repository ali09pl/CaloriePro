// api/email.js — Secure Email API
// Environment: RESEND_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowed = /^https:\/\/([a-z0-9-]+\.)?calorie-pro\.vercel\.app$|^https:\/\/calorie-pro\.vercel\.app$|^http:\/\/localhost(:\d+)?$/.test(origin);
  res.setHeader('Access-Control-Allow-Origin', allowed ? origin : 'https://calorie-pro.vercel.app');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;
    const token = authHeader.slice(7);

    // Verify token with Supabase
    const authRes = await fetch(supabaseUrl + '/auth/v1/user', {
      headers: {
        'Authorization': 'Bearer ' + token,
        'apikey': serviceKey
      }
    });

    if (!authRes.ok) return res.status(401).json({ error: 'Invalid token' });

    const user = await authRes.json();
    const body = req.body || {};
    const type = body.type;
    const name = body.name;
    // Recipient is always the verified session user's own email — never the
    // client-supplied value — so an authenticated user cannot use this
    // endpoint to relay email to arbitrary third-party addresses.
    const to = user.email;

    if (!type || !to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    if (type === 'welcome') {
      const resendKey = process.env.RESEND_API_KEY;
      if (!resendKey) {
        return res.status(500).json({ error: 'Email service not configured' });
      }

      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + resendKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'CaloriePro <onboarding@resend.dev>',
          to: [to],
          subject: 'Welcome to CaloriePro! 🥗',
          html: '<h1>Welcome to CaloriePro, ' + (name || 'there') + '!</h1><p>We\'re excited to have you on board. Start tracking your nutrition and reach your goals.</p><p>Stay consistent, stay healthy! 💪</p><p>— The CaloriePro Team</p>'
        })
      });

      if (!emailRes.ok) throw new Error('Resend API failed');

      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Unknown email type' });
  } catch (e) {
    console.error('Email API error:', e);
    res.status(500).json({ error: 'Failed to send email' });
  }
}
