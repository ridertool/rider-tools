// 앱 화면을 캐시해서 홈 화면 아이콘으로 빠르게 열리게 함 (기록은 폰 안에만 저장)
const CACHE = 'riderbook-v12';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== 'riderbook-share').map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // 다른 앱에서 ‘공유’로 보낸 캡처를 잠깐 저장해 두고 장부 화면으로 넘김
  if (e.request.method === 'POST' && url.origin === location.origin && url.pathname.endsWith('/share-target')) {
    e.respondWith((async () => {
      try {
        const fd = await e.request.formData();
        const f = fd.get('image');
        if (f && f.size) { const c = await caches.open('riderbook-share'); await c.put('shared-image', new Response(f, { headers: { 'content-type': f.type || 'image/png' } })); }
      } catch (_) {}
      return Response.redirect('./?shared=1', 303);
    })());
    return;
  }
  if (url.origin !== location.origin || e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
});
