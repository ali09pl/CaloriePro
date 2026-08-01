// api/admin/clients.js — Admin-only client list
// Environment: SUPABASE_URL, SUPABASE_SERVICE_KEY

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowed = /^https:\/\/([a-z0-9-]+\.)?calorie-pro\.vercel\.app$|^https:\/\/calorie-pro\.vercel\.app$|^http:\/\/localhost(:\d+)?$/.test(origin);
  res.setHeader('Access-Control-Allow-Origin', allowed ? origin : 'https://calorie-pro.vercel.app');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

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

    // Check admin status
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
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    // Fetch all clients
    const clientsRes = await fetch(
      supabaseUrl + '/rest/v1/profiles?select=user_id,email,data,updated_at&order=updated_at.desc',
      {
        headers: {
          'Authorization': 'Bearer ' + serviceKey,
          'apikey': serviceKey
        }
      }
    );

    const clients = await clientsRes.json();

    res.status(200).json({
      clients: clients.map(function(c) {
        return {
          id: c.user_id,
          email: c.email || (c.data && c.data.email) || 'unknown',
          name: (c.data && c.data.name) || 'User',
          joinDate: c.updated_at ? c.updated_at.split('T')[0] : '—'
        };
      })
    });
  } catch (e) {
    console.error('Admin clients error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
}
