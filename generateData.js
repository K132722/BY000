async function getAllData() {
  const db = await openDB('binaYemenDB', 1);

  const steelData = await db.getAll('steelData');
  const calculatorData = await db.getAll('calculatorData');
  // ضيف أي ObjectStore ثانية هنا
  const otherData = await db.getAll('otherStore');

  return { steelData, calculatorData, otherData };
}

async function updateDataJson() {
  const allData = await getAllData();
  const blob = new Blob([JSON.stringify(allData)], { type: 'application/json' });
  const response = new Response(blob);

  const cache = await caches.open('bina-yemen-v18');
  await cache.put('/data.json', response);
}

// كل مرة تحدث بياناتك بعد تعديلها
updateDataJson();