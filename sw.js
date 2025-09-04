const CACHE_NAME = 'bina-yemen-v18';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/bundles.html',
  '/rods.html',
  '/workers.html',
  '/box.html',
  '/style.css',
  '/script.js',
  '/calculator.js',
  '/calculator.css',
  '/IMG_4411.png',
  '/IMG_5033.png',
  '/IMG_5078.png',
  '/IMG_5079.png',
  '/IMG_5080.png',
  '/IMG_5081.png',
  '/png 2.png',
  '/png.3.png',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;600;700;800&display=swap',
  'https://html2canvas.hertzen.com/dist/html2canvas.min.js'
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
        // لو عندك ObjectStore ثانية، ضيفها هنا
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