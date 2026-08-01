// api/admin/send-email.js — Admin email sending
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

    // Verify token
    const authRes = await fetch(supabaseUrl + '/auth/v1/user', {
      headers: {
        'Authorization': 'Bearer ' + token,
        'apikey': serviceKey
      }
    });

    if (!authRes.ok) return res.status(401).json({ error: 'Invalid token' });

    const user = await authRes.json();

    // Check admin
    const adminCheck = await fetch(
      supabaseUrl + '/rest/v1/profiles?select=is_admin&user_id=eq.' + user.id,
      {
        headers: {
          'Authorization': 'Bearer ' + serviceKey,
          'apikey': serviceKey
        }
      }
    );

    const profiles = await adminCheck.json();
    if (!profiles[0] || !profiles[0].is_admin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const body = req.body || {};
    const to = body.to;
    const subject = body.subject;
    const bodyText = body.body;

    if (!to || !subject || !bodyText) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

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
        from: 'Nexora Studio <onboarding@resend.dev>',
        to: [to],
        subject: subject.slice(0, 200),
        text: bodyText.slice(0, 50000),
        html: bodyText.slice(0, 50000).replace(/\n/g, '<br>')
      })
    });

    const result = await emailRes.json();

    if (!emailRes.ok) throw new Error(result.message || 'Failed to send');

    res.status(200).json({ ok: true, id: result.id });
  } catch (e) {
    console.error('Admin email error:', e);
    res.status(500).json({ error: e.message || 'Failed to send email' });
  }
}
