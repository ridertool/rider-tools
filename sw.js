// 라이더 도구함 홈 화면 캐시 (항상 최신 우선, 오프라인이면 저장본)
const CACHE = 'ridertool-home-v1';
const FILES = ['/', '/index.html', '/privacy.html', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png', '/maskable-512.png', '/ads.css', '/site-config.js', '/ads.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('ridertool-home-') && k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin || e.request.method !== 'GET') return;
  // 하위 앱(바로길·장부)은 각자 서비스워커가 처리
  if (url.pathname.startsWith('/barogil/') || url.pathname.startsWith('/rider/')) return;
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match('/index.html'))));
});
