const CACHE_NAME = 'macroforge-v2';
const STATIC_ASSETS = [
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icon-192.svg',
  '/icon-512.svg',
];

const STATIC_EXT_REGEX = /\.(?:js|css|svg|png|jpg|jpeg|webp|gif|ico|woff2?|ttf|webmanifest)$/i;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.origin) return;

  // Never cache navigations, Next.js RSC/router fetches, or API calls — always hit network directly
  if (
    event.request.mode === 'navigate' ||
    url.pathname.startsWith('/api/') ||
    url.searchParams.has('_rsc') ||
    event.request.headers.get('RSC') === '1' ||
    event.request.headers.get('Next-Router-State-Tree')
  ) {
    return;
  }

  // Only cache immutable Next.js static bundles and static media/manifest assets
  const isImmutableNextAsset = url.pathname.startsWith('/_next/static/');
  const isStaticFile = STATIC_EXT_REGEX.test(url.pathname);
  if (!isImmutableNextAsset && !isStaticFile) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached && isImmutableNextAsset) {
        return cached;
      }

      const fetched = fetch(event.request)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          }
          return res;
        })
        .catch(() => cached);

      return cached || fetched;
    })
  );
});
