// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: magic;
// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: calculator;

let webView = new WebView();

let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        :root {
            --primary-dark: #0d1b2a;
            --primary: #1b263b;
            --secondary: #415a77;
            --accent: #778da9;
            --text: #e0e1dd;
            --glass-bg: rgba(27, 38, 59, 0.85);
            --transition: all 0.3s ease;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: -apple-system, 'SF Arabic', sans-serif;
        }
        
        body {
            background: linear-gradient(135deg, var(--primary-dark), var(--primary));
            min-height: 100vh;
            color: var(--text);
            direction: rtl;
        }
        
        .page {
            display: none;
            padding: 20px;
            animation: fadeIn 0.4s forwards;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .active {
            display: block;
        }
        
        .container {
            max-width: 500px;
            margin: 0 auto;
            background: var(--glass-bg);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .institute-name {
            font-size: 20px;
            text-align: center;
            margin-bottom: 5px;
            color: var(--accent);
            font-weight: bold;
        }
        
        h1 {
            color: var(--accent);
            text-align: center;
            margin-bottom: 25px;
            font-size: 24px;
            padding-bottom: 10px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        
        .form-group {
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        label {
            font-size: 16px;
            font-weight: 500;
            flex: 1;
            text-align: right;
            padding-left: 10px;
        }
        
        input {
            width: 100px;
            padding: 10px;
            font-size: 16px;
            border: 2px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            text-align: center;
            direction: ltr;
            background: rgba(0,0,0,0.2);
            color: white;
        }
        
        input:focus {
            border-color: var(--accent);
            outline: none;
        }
        
        .buttons {
            display: flex;
            justify-content: space-between;
            margin-top: 25px;
            gap: 10px;
        }
        
        button {
            background: var(--secondary);
            border: none;
            color: white;
            padding: 12px 0;
            font-size: 16px;
            font-weight: bold;
            width: 48%;
            border-radius: 8px;
            cursor: pointer;
            transition: var(--transition);
        }
        
        button:hover {
            background: var(--accent);
            transform: translateY(-2px);
        }
        
        button:active {
            transform: translateY(0);
        }
        
        .back-btn {
            background: transparent;
            border: 1px solid var(--accent);
            margin-top: 15px;
        }
        
        #result {
            margin-top: 20px;
            padding: 15px;
            background-color: rgba(0,0,0,0.2);
            border-radius: 8px;
            border-left: 4px solid var(--accent);
            font-family: -apple-system, sans-serif;
            display: none;
            text-align: right;
        }
        
        .price-input {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid rgba(255,255,255,0.1);
        }
        
        .price-input label {
            font-weight: bold;
            color: var(--accent);
        }
        
        .result-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 14px;
        }
        
        .result-table th, .result-table td {
            padding: 8px 5px;
            text-align: right;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            white-space: nowrap;
        }
        
        .result-table th {
            background-color: rgba(0,0,0,0.2);
            font-weight: bold;
        }
        
        .numeric-cell {
            font-family: monospace;
            direction: ltr;
            text-align: left;
            padding-left: 8px;
        }
        
        .signature {
            text-align: center;
            font-size: 12px;
            margin-top: 30px;
            opacity: 0.7;
        }
        
        .price-note {
            text-align: center;
            font-size: 14px;
            margin-top: 10px;
            color: #aaa;
            font-style: italic;
        }
        
        @media (max-width: 400px) {
            .result-table {
                font-size: 13px;
            }
            
            .result-table th, 
            .result-table td {
                padding: 6px 3px;
            }
        }
    </style>
</head>
<body>
    <!-- الصفحة الرئيسية -->
    <div id="mainPage" class="page active">
        <div class="container">
            <div class="institute-name">مؤسسة بناء اليمن للتجارة</div>
            <h1>حاسبة أسعار الحديد</h1>
            
            <button onclick="showPage('bundlesPage')" style="width:100%;margin-bottom:10px;">
                📦 حاسبة البنادل
            </button>
            
            <button onclick="showPage('rodsPage')" style="width:100%">
                📏 حاسبة الأسياخ
            </button>
            
            <div class="signature">
                تصميم وبرمجة المهندس / أبو جراح الخولاني
            </div>
        </div>
    </div>

    <!-- صفحة حاسبة البنادل -->
    <div id="bundlesPage" class="page">
        <div class="container">
            <button class="back-btn" onclick="showPage('mainPage')">
                ← العودة للرئيسية
            </button>
            
            <h1>حاسبة البنادل</h1>
            
            <div class="form-group">
                <label for="size-18">18 ملم</label>
                <input type="number" id="size-18" placeholder="0" min="0">
            </div>
            <div class="form-group">
                <label for="size-16">16 ملم</label>
                <input type="number" id="size-16" placeholder="0" min="0">
            </div>
            <div class="form-group">
                <label for="size-14">14 ملم</label>
                <input type="number" id="size-14" placeholder="0" min="0">
            </div>
            <div class="form-group">
                <label for="size-12">12 ملم</label>
                <input type="number" id="size-12" placeholder="0" min="0">
            </div>
            <div class="form-group">
                <label for="size-10">10 ملم</label>
                <input type="number" id="size-10" placeholder="0" min="0">
            </div>
            <div class="form-group">
                <label for="size-8">8 ملم</label>
                <input type="number" id="size-8" placeholder="0" min="0">
            </div>
            
            <div class="form-group price-input">
                <label for="price">سعر الطن (ريال سعودي)</label>
                <input type="number" id="price" placeholder="3000" min="0">
            </div>
            
            <div class="buttons">
                <button onclick="calculateBundles()">حساب</button>
                <button onclick="copyResult('bundles')">نسخ النتيجة</button>
            </div>
            
            <div id="bundlesResult" style="display: none;">
                <h3 style="text-align:center;margin-bottom:15px;">نتيجة الحساب</h3>
                <table class="result-table">
                    <thead>
                        <tr>
                            <th>المقاس</th>
                            <th>البنادل</th>
                            <th>الأسياخ</th>
                            <th>الوزن (طن)</th>
                            <th>السعر (ر.س)</th>
                        </tr>
                    </thead>
                    <tbody id="bundlesResultBody">
                    </tbody>
                </table>
                <div style="margin-top:15px;font-weight:bold;text-align:center;" id="bundlesTotal"></div>
                <div class="price-note" id="bundlesNote"></div>
            </div>
            
            <div class="signature">
                تصميم وبرمجة المهندس / أبو جراح الخولاني
            </div>
        </div>
    </div>

    <!-- صفحة حاسبة الأسياخ -->
    <div id="rodsPage" class="page">
        <div class="container">
            <button class="back-btn" onclick="showPage('mainPage')">
                ← العودة للرئيسية
            </button>
            
            <h1>حاسبة الأسياخ</h1>
            
            <div class="form-group">
                <label for="rod-18">18 ملم</label>
                <input type="number" id="rod-18" placeholder="0" min="0">
            </div>
            <div class="form-group">
                <label for="rod-16">16 ملم</label>
                <input type="number" id="rod-16" placeholder="0" min="0">
            </div>
            <div class="form-group">
                <label for="rod-14">14 ملم</label>
                <input type="number" id="rod-14" placeholder="0" min="0">
            </div>
            <div class="form-group">
                <label for="rod-12">12 ملم</label>
                <input type="number" id="rod-12" placeholder="0" min="0">
            </div>
            <div class="form-group">
                <label for="rod-10">10 ملم</label>
                <input type="number" id="rod-10" placeholder="0" min="0">
            </div>
            <div class="form-group">
                <label for="rod-8">8 ملم</label>
                <input type="number" id="rod-8" placeholder="0" min="0">
            </div>
            
            <div class="form-group price-input">
                <label for="rodPrice">سعر الطن (ريال يمني)</label>
                <input type="number" id="rodPrice" placeholder="400000" min="0">
            </div>
            
            <div class="buttons">
                <button onclick="calculateRods()">حساب</button>
                <button onclick="copyResult('rods')">نسخ النتيجة</button>
            </div>
            
            <div id="rodsResult" style="display: none;">
                <h3 style="text-align:center;margin-bottom:15px;">نتيجة الحساب</h3>
                <table class="result-table">
                    <thead>
                        <tr>
                            <th>المقاس</th>
                            <th>العدد</th>
                            <th>السعر</th>
                        </tr>
                    </thead>
                    <tbody id="rodsResultBody">
                    </tbody>
                </table>
                <div style="margin-top:15px;font-weight:bold;text-align:center;" id="rodsTotal"></div>
                <div class="price-note" id="rodsNote"></div>
            </div>
            
            <div class="signature">
                تصميم وبرمجة المهندس / أبو جراح الخولاني
            </div>
        </div>
    </div>

    <script>
        const steelData = {
            bundles: {
                "18": { weightPerBundle: 1.968, rodsPerBundle: 82 },
                "16": { weightPerBundle: 1.972, rodsPerBundle: 104 },
                "14": { weightPerBundle: 1.975, rodsPerBundle: 136 },
                "12": { weightPerBundle: 1.918, rodsPerBundle: 180 },
                "10": { weightPerBundle: 1.999, rodsPerBundle: 270 },
                "8": { weightPerBundle: 1.991, rodsPerBundle: 420 }
            },
            rods: {
                "18": 40,
                "16": 50,
                "14": 66,
                "12": 90,
                "10": 130,
                "8": 200
            }
        };

        function showPage(pageId) {
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            document.getElementById(pageId).classList.add('active');
        }

        function calculateBundles() {
            const pricePerTon = parseFloat(document.getElementById('price').value) || 3000;
            let totalWeight = 0;
            let totalPrice = 0;
            let totalBundles = 0;
            let totalRods = 0;
            
            const sizes = ['18', '16', '14', '12', '10', '8'];
            const resultBody = document.getElementById('bundlesResultBody');
            resultBody.innerHTML = '';
            
            sizes.forEach(size => {
                const bundleCount = parseInt(document.getElementById('size-' + size).value) || 0;
                if (bundleCount > 0) {
                    totalBundles += bundleCount;
                    const bundleData = steelData.bundles[size];
                    const rodsCount = bundleData.rodsPerBundle * bundleCount;
                    const weight = (bundleData.weightPerBundle * bundleCount).toFixed(3);
                    const price = (weight * pricePerTon).toFixed(2);
                    
                    totalWeight += parseFloat(weight);
                    totalPrice += parseFloat(price);
                    totalRods += rodsCount;
                    
                    const row = document.createElement('tr');
                    row.innerHTML = \`
                        <td>\${size} ملم</td>
                        <td>\${bundleCount}</td>
                        <td class="numeric-cell">\${rodsCount}</td>
                        <td class="numeric-cell">\${weight}</td>
                        <td class="numeric-cell">\${price}</td>
                    \`;
                    resultBody.appendChild(row);
                }
            });
            
            if (resultBody.children.length === 0) {
                alert("الرجاء إدخال الكميات أولاً");
                return;
            }
            
            document.getElementById('bundlesTotal').innerHTML = \`
                <div>إجمالي البنادل: \${totalBundles}</div>
                <div>إجمالي الأسياخ: \${totalRods}</div>
                <div>الوزن الإجمالي: \${totalWeight.toFixed(3)} طن</div>
                <div>السعر الإجمالي: \${totalPrice.toFixed(2)} ر.س</div>
            \`;
            
            document.getElementById('bundlesNote').innerText = \`ملاحظة: هذا الحساب بسعر \${pricePerTon} ريال سعودي للطن\`;
            document.getElementById('bundlesResult').style.display = 'block';
        }

        function calculateRods() {
            const pricePerTon = parseFloat(document.getElementById('rodPrice').value) || 400000;
            let totalSum = 0;
            
            const sizes = ['18', '16', '14', '12', '10', '8'];
            const resultBody = document.getElementById('rodsResultBody');
            resultBody.innerHTML = '';
            
            sizes.forEach(size => {
                const count = parseInt(document.getElementById('rod-' + size).value) || 0;
                if (count > 0) {
                    const rodsPerTon = steelData.rods[size];
                    const pricePerRod = pricePerTon / rodsPerTon;
                    const totalPriceItem = pricePerRod * count;
                    totalSum += totalPriceItem;
                    
                    const row = document.createElement('tr');
                    row.innerHTML = \`
                        <td>\${size} ملم</td>
                        <td>\${count}</td>
                        <td class="numeric-cell">\${totalPriceItem.toFixed(2)} ر.ي</td>
                    \`;
                    resultBody.appendChild(row);
                }
            });
            
            if (resultBody.children.length === 0) {
                alert("الرجاء إدخال الكميات أولاً");
                return;
            }
            
            document.getElementById('rodsTotal').innerText = \`الإجمالي الكلي: \${totalSum.toFixed(2)} ريال يمني\`;
            document.getElementById('rodsNote').innerText = \`ملاحظة: هذا الحساب بسعر \${pricePerTon} ريال يمني للطن\`;
            document.getElementById('rodsResult').style.display = 'block';
        }

        function copyResult(type) {
            const resultText = document.getElementById(type + 'Result').innerText;
            if (resultText && !resultText.includes('الرجاء إدخال الكميات أولاً')) {
                window.webkit.messageHandlers.scriptable.postMessage({
                    action: 'copy',
                    data: resultText
                });
                alert("تم نسخ النتيجة");
            } else {
                alert("لا توجد نتيجة لحسابها بعد");
            }
        }
    </script>
</body>
</html>`;

// معالجة نسخ النتائج
webView.messageHandlers = {
    scriptable: (message) => {
        if (message.action === 'copy') {
            Pasteboard.copyString(message.data);
        }
    }
};

await webView.loadHTML(html);
await webView.present();