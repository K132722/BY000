const CACHE_NAME = 'bina-yemen-v27';
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
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;600;700;800&display=swap',
  'https://html2canvas.hertzen.com/dist/html2canvas.min.js'
];

// فتح قاعدة البيانات IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('binaYemenDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('steelData')) {
        db.createObjectStore('steelData', { keyPath: 'id', autoIncrement: true });
      }

      if (!db.objectStoreNames.contains('calculatorData')) {
        db.createObjectStore('calculatorData', { keyPath: 'id', autoIncrement: true });
      }

      if (!db.objectStoreNames.contains('otherStore')) {
        db.createObjectStore('otherStore', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// INSTALL - تثبيت وتخزين الملفات الأساسية
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('تم فتح الكاش وتخزين الملفات');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// ACTIVATE - تنظيف الكاشات القديمة
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('جاري حذف الكاش القديم:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('الإصدار الجديد نشط الآن');
        return self.clients.claim();
      })
  );
});

// FETCH - استراتيجية متقدمة للتعامل مع الطلبات
self.addEventListener('fetch', (event) => {
  // تجاهل الطلبات التي ليست GET
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. معالجة طلبات الصور المشتركة
  if (url.pathname.startsWith('/shared-images/')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || new Response('الصورة غير موجودة', { status: 404 }))
    );
    return;
  }

  // 2. معالجة طلبات البيانات من IndexedDB
  if (url.pathname === '/data.json') {
    event.respondWith(
      (async () => {
        try {
          const db = await openDB();

          // محاولة جلب البيانات من IndexedDB
          const steelData = await db.getAll('steelData').catch(() => []);
          const calculatorData = await db.getAll('calculatorData').catch(() => []);
          const otherData = await db.getAll('otherStore').catch(() => []);

          const allData = { 
            steelData: steelData || [], 
            calculatorData: calculatorData || [], 
            otherData: otherData || [] 
          };

          // تخزين نسخة في الكاش للاستخدام المستقبلي
          const response = new Response(JSON.stringify(allData), {
            headers: { 
              'Content-Type': 'application/json',
              'Cache-Control': 'max-age=3600'
            }
          });

          // تخزين في الكاش للاستخدام دون اتصال
          const cache = await caches.open(CACHE_NAME);
          cache.put('/data.json', response.clone());

          return response;
        } catch (error) {
          console.error('خطأ في جلب البيانات:', error);

          // إذا فشل، حاول جلب من الكاش
          const cachedResponse = await caches.match('/data.json');
          if (cachedResponse) {
            return cachedResponse;
          }

          return new Response(JSON.stringify({ error: 'البيانات غير متوفرة' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      })()
    );
    return;
  }

  // 3. استراتيجية ذكية للملفات الأخرى
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // إذا وجدت في الكاش، أعدها فوراً
        if (cachedResponse) {
          // تحقق من وجود تحديث في الخلفية (للملفات المهمة)
          if (event.request.url.includes('.html') || event.request.url.includes('.css') || event.request.url.includes('.js')) {
            fetchAndUpdateCache(event.request);
          }
          return cachedResponse;
        }

        // إذا لم توجد في الكاش، جلب من الشبكة
        return fetch(event.request)
          .then((networkResponse) => {
            // تأكد من أن الاستجابة صالحة
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // تخزين نسخة في الكاش للاستخدام المستقبلي
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache))
              .catch(err => console.log('فشل تخزين في الكاش:', err));

            return networkResponse;
          })
          .catch((error) => {
            console.log('فشل جلب المورد:', error);

            // معالجة ذكية لحالة عدم الاتصال
            if (event.request.mode === 'navigate') {
              // إذا كان المستخدم يتصفح صفحة، أعد الصفحة الرئيسية
              return caches.match('/index.html')
                .then(homePage => homePage || new Response('الصفحة الرئيسية غير متوفرة', { 
                  status: 503,
                  headers: { 'Content-Type': 'text/plain; charset=UTF-8' }
                }));
            }

            // للملفات الأخرى، حاول إرجاع نسخة مخزنة من نفس النوع
            return caches.match(event.request).then(fallback => {
              if (fallback) return fallback;

              // رسالة افتراضية حسب نوع الملف
              const extension = event.request.url.split('.').pop().toLowerCase();
              if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
                return new Response('', { status: 404 }); // صورة فارغة
              } else if (extension === 'css') {
                return new Response('/* فشل تحميل ملف CSS */', { 
                  headers: { 'Content-Type': 'text/css' } 
                });
              } else if (extension === 'js') {
                return new Response('// فشل تحميل ملف JavaScript', { 
                  headers: { 'Content-Type': 'application/javascript' } 
                });
              } else {
                return new Response('الوضع غير متصل - المورد غير متوفر', { 
                  status: 503,
                  headers: { 'Content-Type': 'text/plain; charset=UTF-8' }
                });
              }
            });
          });
      })
  );
});

// دالة مساعدة لتحديث الكاش في الخلفية
function fetchAndUpdateCache(request) {
  fetch(request)
    .then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        return caches.open(CACHE_NAME)
          .then(cache => cache.put(request, networkResponse))
          .then(() => console.log('تم تحديث الكاش لـ:', request.url));
      }
    })
    .catch(err => console.log('فشل تحديث الكاش:', err));
}

// مشاركة الصور
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHARE_IMAGE') {
    const imageData = event.data.imageData;

    if (imageData) {
      caches.open(CACHE_NAME)
        .then((cache) => {
          const response = new Response(imageData, {
            headers: { 'Content-Type': 'image/png' }
          });
          const imageName = `/shared-images/image-${Date.now()}.png`;
          return cache.put(imageName, response);
        })
        .then(() => {
          console.log('تم تخزين الصورة المشتركة بنجاح');

          // إرسال تأكيد للصفحة إذا كانت تستمع
          if (event.source && event.source.postMessage) {
            event.source.postMessage({ 
              type: 'IMAGE_SAVED', 
              message: 'تم حفظ الصورة بنجاح' 
            });
          }
        })
        .catch(error => {
          console.error('فشل تخزين الصورة:', error);
        });
    }
  }
});

// الاستماع لأحداث المزامنة الخلفية (اختياري)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      // يمكن إضافة منطق لمزامنة البيانات مع الخادم
      console.log('جاري مزامنة البيانات...')
    );
  }
});

// تنبيه عند تحديث Service Worker
self.addEventListener('controllerchange', () => {
  console.log('تم تحديث Service Worker');
});