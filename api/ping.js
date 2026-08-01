// api/ping.js — Secure Health Check
// Environment: SUPABASE_URL, SUPABASE_SERVICE_KEY

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return res.status(500).json({ ok: false, error: 'Missing environment variables' });
    }

    const response = await fetch(
      supabaseUrl + '/rest/v1/profiles?limit=1',
      {
        headers: {
          'apikey': serviceKey,
          'Authorization': 'Bearer ' + serviceKey
        }
      }
    );

    res.status(200).json({ 
      ok: true, 
      status: response.status, 
      time: new Date().toISOString() 
    });
  } catch (e) {
    console.error('Ping failed:', e);
    res.status(500).json({ ok: false, error: 'Service unavailable' });
  }
}
