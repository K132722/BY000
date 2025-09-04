// Load saved data from localStorage or use default
const steelData = JSON.parse(localStorage.getItem('steelData')) || {
  bundles: {
    "20": { weightPerBundle: 1.956, rodsPerBundle: 66 },
    "18": { weightPerBundle: 1.968, rodsPerBundle: 82 },
    "16": { weightPerBundle: 1.972, rodsPerBundle: 104 },
    "14": { weightPerBundle: 1.975, rodsPerBundle: 136 },
    "12": { weightPerBundle: 1.918, rodsPerBundle: 180 },
    "10": { weightPerBundle: 1.999, rodsPerBundle: 270 },
    "8": { weightPerBundle: 1.991, rodsPerBundle: 420 }
  },
  rods: {
    "20": 32,
    "18": 40,
    "16": 50,
    "14": 66,
    "12": 90,
    "10": 130,
    "8": 200
  }
};

// Save data to localStorage
function saveData() {
  localStorage.setItem('steelData', JSON.stringify(steelData));
  console.log('Data saved successfully');
}

// تسجيل Service Worker لتثبيت PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);

      // Check for updates
      registration.update().then(() => {
        console.log('ServiceWorker update check completed');
      });
    }).catch(err => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

// Check if app is running as PWA
function isRunningAsPWA() {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone ||
         document.referrer.includes('android-app://');
}

// Show install prompt for PWA
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('PWA install prompt available');

  // You can show your custom install button here
  // and call deferredPrompt.prompt() when clicked
});

// وظيفة نسخ النتائج
function copyResult(resultText) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(resultText).then(() => {
      alert("تم نسخ النتيجة");
    }).catch(err => {
      console.error('Failed to copy: ', err);
      alert("فشل نسخ النتيجة");
    });
  } else {
    // Fallback for browsers that don't support clipboard API
    const textarea = document.createElement('textarea');
    textarea.value = resultText;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      alert("تم نسخ النتيجة");
    } catch (err) {
      console.error('Failed to copy: ', err);
      alert("فشل نسخ النتيجة");
    }
    document.body.removeChild(textarea);
  }
}

// Detect offline status
window.addEventListener('online', () => {
  console.log('Application is online');
  // You can show a message or sync data here
});

window.addEventListener('offline', () => {
  console.log('Application is offline');
  // You can show a message that app is working in offline mode
});

// Offline notification
function showOfflineNotification() {
  const notification = document.createElement('div');
  notification.className = 'offline-notification';
  notification.textContent = 'أنت في وضع عدم الاتصال';
  document.body.appendChild(notification);
  notification.style.display = 'block';
  setTimeout(() => notification.style.display = 'none', 3000);
}

// Handle image sharing
async function shareImage(imageFile) {
  try {
    const imageData = await imageFile.arrayBuffer();
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHARE_IMAGE',
        imageData: imageData
      });
    }
    localStorage.setItem(`shared-image-${Date.now()}`, imageData);
  } catch (error) {
    console.error('Error sharing image:', error);
  }
}

// Initial check
window.addEventListener('load', () => {
  if (!navigator.onLine) {
    showOfflineNotification();
  }
});

window.addEventListener('online', () => {
  console.log('Application is online');
});

window.addEventListener('offline', () => {
  console.log('Application is offline');
  showOfflineNotification();
});

// Save data before app closes
window.addEventListener('beforeunload', () => {
  localStorage.setItem('steelData', JSON.stringify(steelData));
});