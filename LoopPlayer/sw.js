/* LoopPlayer service worker.
 *
 * Its only job is to let the app itself open without internet. It keeps the
 * handful of files that make up the app in a cache and serves them from there
 * first, refreshing them in the background when the network is up.
 *
 * The media files never pass through here: they live in IndexedDB and are
 * played from blob: URLs. Any request that is not one of the app's own files
 * (including downloads the user starts from a link) goes straight to the
 * network untouched.
 *
 * Registered from LoopPlayer/index.html, so its scope is /LoopPlayer/ and it
 * cannot affect any other page on the site.
 */
const CACHE = 'loopplayer-v1';
const SHELL = [
  'index.html',
  'manifest.webmanifest',
  'icon.svg',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-512.png',
  'apple-touch-icon.png',
];
const SCOPE = new URL(self.registration.scope);
const shellUrl = (path) => new URL(path, SCOPE).href;
const SHELL_URLS = new Set(SHELL.map(shellUrl));
const INDEX = shellUrl('index.html');

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll([...SHELL_URLS]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith('loopplayer-') && k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== SCOPE.origin) return;

  let key;
  if (req.mode === 'navigate' && url.pathname.startsWith(SCOPE.pathname)) {
    key = INDEX; // /LoopPlayer/, /LoopPlayer/index.html, with or without ?query
  } else {
    const bare = url.origin + url.pathname;
    if (!SHELL_URLS.has(bare)) return; // not ours: let the browser handle it
    key = bare;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(key);
    // Revalidate in the background. The browser's HTTP cache turns this into a
    // conditional request, so an unchanged file costs only a few hundred bytes.
    const refresh = fetch(key).then((res) => {
      if (res.ok && !res.redirected) return cache.put(key, res.clone()).then(() => res);
      return res;
    }).catch(() => null);

    if (cached) {
      event.waitUntil(refresh);
      return cached;
    }
    const res = await refresh;
    if (res) return res;
    return new Response('ออฟไลน์ และยังไม่เคยเปิดแอปนี้ขณะมีเน็ต', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  })());
});
