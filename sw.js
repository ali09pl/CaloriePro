// =========================================================
// CALORIEPRO SERVICE WORKER
// Bump CACHE_NAME on every deploy that changes any precached file
// so old clients pick up fresh assets instead of stale cache.
// =========================================================
const CACHE_NAME = 'cp7-v1';

const STATIC_ASSETS = [
  '/app.html',
  '/style.css',
  '/js/shell.js',
  '/js/core/helpers.js',
  '/js/core/math.js',
  '/js/core/state.js',
  '/js/core/storage.js',
  '/js/core/supabase.js',
  '/js/core/xp.js',
  '/js/core/salo.js',
  '/js/data/foods.js',
  '/js/data/translations.js',
  '/js/pages/achievements.js',
  '/js/pages/activity.js',
  '/js/pages/ai.js',
  '/js/pages/challenges.js',
  '/js/pages/dashboard.js',
  '/js/pages/food.js',
  '/js/pages/home.js',
  '/js/pages/more.js',
  '/js/pages/onboarding.js',
  '/js/pages/ramadan.js',
  '/js/pages/results.js',
  '/js/pages/settings.js',
  '/js/pages/setup.js',
  '/js/pages/sleep.js',
  '/js/pages/track.js',
  '/js/pages/water.js'
];

// Install: precache the app shell. Individual failures (e.g. a file that
// gets renamed later) shouldn't block install of everything else.
self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return Promise.all(STATIC_ASSETS.map(function(url){
        return cache.add(url).catch(function(err){
          console.warn('[SW] precache failed for', url, err);
        });
      }));
    })
  );
});

// Activate: drop old cache versions.
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(names){
      return Promise.all(
        names.filter(function(n){ return n !== CACHE_NAME; })
             .map(function(n){ return caches.delete(n); })
      );
    }).then(function(){ return self.clients.claim(); })
  );
});

// Fetch strategy:
//   - Non-GET: pass through untouched (never cache mutations).
//   - Supabase / API calls: network-first, no caching of responses that may
//     contain per-user data or auth tokens.
//   - Same-origin static assets: cache-first with background network fallback.
self.addEventListener('fetch', function(e){
  const req = e.request;
  if(req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch(err) { return; }

  const isApiOrAuth = url.pathname.startsWith('/api/') ||
                       url.hostname.indexOf('supabase.co') !== -1;

  if(isApiOrAuth){
    e.respondWith(fetch(req).catch(function(){
      return new Response(JSON.stringify({ error: 'offline' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }));
    return;
  }

  if(url.origin !== self.location.origin) return; // let CDN scripts pass through normally

  e.respondWith(
    caches.match(req).then(function(cached){
      const network = fetch(req).then(function(res){
        if(res && res.status === 200){
          const clone = res.clone();
          caches.open(CACHE_NAME).then(function(cache){ cache.put(req, clone); });
        }
        return res;
      }).catch(function(){ return cached; });
      return cached || network;
    })
  );
});
