const CACHE_NAME = 'bina-yemen-v31';
const ASSETS_TO_CACHE = [
  'index.html',
  'bundles.html',
  'rods.html',
  'workers.html',
  'box.html',
  'offline.html',
  'style.css',
  'script.js',
  'calculator.js',
  'calculator.css',
  'generateData.js',
  'fa-icons.js',
  'fa-local.css',
  'html2canvas.min.js',
  'jspdf.umd.min.js',
  'manifest.json',
  'IMG_4411.png',
  'IMG_5033.png',
  'IMG_5078.png',
  'IMG_5079.png',
  'IMG_5080.png',
  'IMG_5081.png',
  'png 2.png',
  'png.3.png',
  'android-chrome-192x192.png',
  'android-chrome-512x512.png',
  'fonts/tajawal/tajawal.css',
  'fonts/tajawal/tajawal-300-arabic.woff2',
  'fonts/tajawal/tajawal-300-latin.woff2',
  'fonts/tajawal/tajawal-400-arabic.woff2',
  'fonts/tajawal/tajawal-400-latin.woff2',
  'fonts/tajawal/tajawal-500-arabic.woff2',
  'fonts/tajawal/tajawal-500-latin.woff2',
  'fonts/tajawal/tajawal-700-arabic.woff2',
  'fonts/tajawal/tajawal-700-latin.woff2',
  'fonts/tajawal/tajawal-800-arabic.woff2',
  'fonts/tajawal/tajawal-800-latin.woff2',
  'webfonts/fa-solid-900.woff2',
  'webfonts/fa-regular-400.woff2',
  'webfonts/fa-brands-400.woff2',
  'webfonts/fa-v4compatibility.woff2',
  'webfonts/fa-solid-900.ttf',
  'webfonts/fa-regular-400.ttf',
  'webfonts/fa-brands-400.ttf',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null)
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith('/shared-images/')) {
    event.respondWith(
      caches.match(event.request).then(res => res || new Response('Not found', {status: 404}))
    );
    return;
  }

  if (url.pathname === '/data.json') {
    event.respondWith(
      (async () => {
        const db = await openDB('binaYemenDB', 1);
        const steelData = await db.getAll('steelData');
        const calculatorData = await db.getAll('calculatorData');
        const otherData = await db.getAll('otherStore');

        const allData = { steelData, calculatorData, otherData };
        return new Response(JSON.stringify(allData), {
          headers: { 'Content-Type': 'application/json' }
        });
      })()
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).catch(() => {
      return new Response('الوضع غير متصل', { status: 503, headers: {'Content-Type':'text/plain;charset=UTF-8'} });
    }))
  );
});

self.addEventListener('message', (event) => {
  if (event.data.type === 'SHARE_IMAGE') {
    const imageData = event.data.imageData;
    caches.open(CACHE_NAME).then(cache => {
      const response = new Response(imageData);
      cache.put(`/shared-images/${Date.now()}`, response);
    });
  }
});
