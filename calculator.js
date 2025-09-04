// calculator.js

document.addEventListener('DOMContentLoaded', function() {
    // متغيّرات التطبيق
    let calculatorOpen = false;
    let isDragging = false;
    let startX, startY, offsetX, offsetY;
    let isDraggingScroll = false;
    let startScrollX, scrollLeft;

    // متغيّرات الأرشيف (history)
    let sessions = [];
    let history = [];

    // كل شاشة نعرّفها كمجرّد كائن يحتوي على العنصرين: displayElement و resultElement
    let screens = [];
    let activeScreen = null;   // الكائن الذي يشير إلى الشاشة الحالية (editable)
    let caretPos = 0;          // موضع المؤشر في شاشة الإدخال الحالية
    let currentExpr = '';      // التعبير الجاري إدخاله في الشاشة الحالية

    // إنشاء عناصر DOM لزر الحاسبة والأرشيف والآلة الحاسبة
    const calcTab = document.createElement('div');
    calcTab.className = 'calc-tab';
    calcTab.id = 'calcTab';
    calcTab.innerHTML = '<i class="fas fa-calculator"></i>';
    // نضبط موقع زر الحاسبة الابتدائي
    calcTab.style.left = '20px';
    calcTab.style.bottom = '20px';
    calcTab.style.position = 'fixed';
    calcTab.style.zIndex = '1000'; // أعلى من الأوفرلاي

    const historyPanel = document.createElement('div');
    historyPanel.className = 'history-panel';
    historyPanel.id = 'historyPanel';
    historyPanel.innerHTML = `
        <div class="history-header">
            <div class="history-title">الأرشيف (0)</div>
            <button class="history-clear" id="historyClear">
                <i class="fas fa-trash"></i>
            </button>
            <button class="history-close" id="historyClose">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="history-controls">
            <input type="text" id="historySearch" placeholder="بحث في الأرشيف...">
        </div>
        <div id="historyItems"></div>
    `;
    // نجعل الأرشيف فوق الحاسبة مباشرة
    historyPanel.style.zIndex = '1003';
    // نلغي أي انتقال لجعل الفتح فوريًّا
    historyPanel.style.transition = 'none';

    const calculatorContainer = document.createElement('div');
    calculatorContainer.className = 'calculator-container';
    calculatorContainer.id = 'calculatorContainer';
    calculatorContainer.style.zIndex = '1000'; // أقل من الزر حتى لا يحجب الأزرار
    // نلغي الانتقال الأولي حتى لا ينقرّ الحاوية أثناء التحميل
    calculatorContainer.style.transition = 'none';
    calculatorContainer.innerHTML = `
        <div class="calculator-header">
        <img src="png 2.png" class="result-logo1" alt="شعار المؤسسة">

            <!-- اسم المؤسسة بشكل مستقل -->
            <div class="result-inst1">
              مؤسسة بناء اليمن<br>
              لـــــحديـــــد الــتســلـيــح

          </div>
            <div class="calculator-title">الحاسبة</div>
            <button class="calculator-close" id="calculatorClose">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="calc-screens-container" id="calcScreensContainer">
            <!-- هنا ستظهر كل شاشات العمليات (السابق منها والحالي) -->
        </div>
        <div class="arrow-controls">
            <div class="arrow-row">
                <button class="arrow-btn right" onclick="moveCaret('right')">▶</button>
                <button class="arrow-btn left" onclick="moveCaret('left')">◀</button>
            </div>
            <div class="arrow-row">
                <button class="arrow-btn down" onclick="moveCaret('down')">▼</button>
                <button class="arrow-btn up" onclick="moveCaret('up')">▲</button>
            </div>
        </div>
        <div class="calculator-buttons">
            <!-- الصف الأول -->
            <button class="calc-button clear" onclick="clearCurrentExpr()">C</button>
            <button class="calc-button function" onclick="deleteLastChar()">⌫</button>
            <button class="calc-button" onclick="press('9')">9</button>
            <button class="calc-button" onclick="press('8')">8</button>
            <button class="calc-button" onclick="press('7')">7</button>
            <!-- الصف الثاني -->
            <button class="calc-button operator" onclick="press('/')">÷</button>
            <button class="calc-button operator" onclick="press('*')">×</button>
            <button class="calc-button" onclick="press('6')">6</button>
            <button class="calc-button" onclick="press('5')">5</button>
            <button class="calc-button" onclick="press('4')">4</button>
            <!-- الصف الثالث -->
            <button class="calc-button operator" onclick="press('-')">-</button>
            <button class="calc-button operator" onclick="press('+')">+</button>
            <button class="calc-button" onclick="press('3')">3</button>
            <button class="calc-button" onclick="press('2')">2</button>
            <button class="calc-button" onclick="press('1')">1</button>
            <!-- الصف الرابع -->
            <button class="calc-button equal" id="equalButton">=</button>
            <button class="calc-button function" onclick="insertAns()">Ans</button>
            <button class="calc-button" onclick="press('.')">.</button>
            <button class="calc-button" onclick="press('00')">00</button>
            <button class="calc-button" onclick="press('0')">0</button>
        </div>
        <!-- نافذة النسخة الاحتياطية -->
        <div id="backupModal" class="backup-modal">
          <h3>📋 النسخة الاحتياطية</h3>
          <textarea id="backupText"></textarea>
          <div class="modal-actions">
            <button id="copyBackupBtn">📎 نسخ</button>
            <button id="closeBackupBtn">✖ إغلاق</button>
          </div>
        </div>
    `;

    // إضافة العناصر إلى body
    document.body.appendChild(calcTab);
    document.body.appendChild(historyPanel);
    document.body.appendChild(calculatorContainer);

    // الوصول إلى عناصر DOM
    const calcScreensContainer = document.getElementById('calcScreensContainer');
    const equalButton = document.getElementById('equalButton');
    const calculatorClose = document.getElementById('calculatorClose');
    const historyItems = document.getElementById('historyItems');
    const historyClose = document.getElementById('historyClose');
    const historyClear = document.getElementById('historyClear');
    const historySearch = document.getElementById('historySearch');

    // بعد إضافة الحاوية للصفحة، نفعّل الانتقال السينمائي
    // (لأننا أوقفناه أثناء البناء، الآن نعيده حتى لا تكون هناك حركات متقطعة)
    requestAnimationFrame(() => {
        calculatorContainer.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
    });

    // إظهار شاشة تشغيل أولية وتحميل الأرشيف عند التحميل
    createNewScreen();
    loadHistory();
    setupScrollControls();

    // تجعل زر الحاسبة قابلاً للسحب
    calcTab.addEventListener('mousedown', startDrag);
    calcTab.addEventListener('touchstart', startDrag, { passive: false });

    function startDrag(e) {
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        startX = clientX;
        startY = clientY;
        offsetX = clientX - calcTab.getBoundingClientRect().left;
        offsetY = clientY - calcTab.getBoundingClientRect().top;
        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);
    }

    function drag(e) {
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        if (Math.abs(clientX - startX) > 5 || Math.abs(clientY - startY) > 5) {
            isDragging = true;
            // نستخدم top بدلاً من bottom أثناء السحب
            calcTab.style.left = (clientX - offsetX) + 'px';
            calcTab.style.top = (clientY - offsetY) + 'px';
            e.preventDefault();
        }
    }

    function endDrag(e) {
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('touchmove', drag);
        document.removeEventListener('mouseup', endDrag);
        document.removeEventListener('touchend', endDrag);
        if (!isDragging && e.cancelable) {
            e.preventDefault();
            toggleCalculator();
        }
        setTimeout(() => { isDragging = false; }, 100);
    }

    // دالة الفتح/الإغلاق مع انبثاق من داخل زر الحاسبة، لكن بعد الانبثاق تبقى الحاوية في موقعها الأصلي
    function toggleCalculator() {
        calculatorOpen = !calculatorOpen;
        if (calculatorOpen) {
            // ===== عند الفتح =====
            // 1) نحسب مركز زر الحاسبة
            const tabRect = calcTab.getBoundingClientRect();
            // 2) نحسب إحداثيات الحاوية
            const containerRect = calculatorContainer.getBoundingClientRect();
            // 3) نوجد نقطة الانبثاق (transform-origin) كنسبة مئوية داخل الحاوية
            const buttonCenterX = tabRect.left + tabRect.width / 2;
            const buttonCenterY = tabRect.top + tabRect.height / 2;
            const relX = buttonCenterX - containerRect.left;
            const relY = buttonCenterY - containerRect.top;
            const originX = (relX / containerRect.width) * 100;
            const originY = (relY / containerRect.height) * 100;
            calculatorContainer.style.transformOrigin = `${originX}% ${originY}%`;

            // 4) نضيف كلاس "open" ليتم التكبير من scale(0) إلى scale(1)
            calculatorContainer.classList.add('open');

            // 5) نضيف الأوفرلاي لمنع التفاعل بالخلفية
            createOverlay();

            // 6) علامة أن الحاسبة مفتوحة إذا احتجنا
            document.querySelector('.container')?.classList.add('calculator-open');
        } else {
            // ===== عند الإغلاق =====
            // 1) نحسب مركز زر الحاسبة الآن (لأن المستخدم قد يكون حركه)
            const tabRect = calcTab.getBoundingClientRect();
            const containerRect = calculatorContainer.getBoundingClientRect();
            const buttonCenterX = tabRect.left + tabRect.width / 2;
            const buttonCenterY = tabRect.top + tabRect.height / 2;
            const relX = buttonCenterX - containerRect.left;
            const relY = buttonCenterY - containerRect.top;
            const originX = (relX / containerRect.width) * 100;
            const originY = (relY / containerRect.height) * 100;
            // 2) نحدّث transform-origin بحيث يعود التكبير إلى داخل الزر
            calculatorContainer.style.transformOrigin = `${originX}% ${originY}%`;

            // 3) نزيل كلاس "open" فتبدأ الحاوية بالتصغير (scale 0) والشفافية إلى 0
            calculatorContainer.classList.remove('open');

            // 4) نزيل الأوفرلاي بعد بدء الحركة
            removeOverlay();

            // 5) نزيل أي علامة إضافية
            document.querySelector('.container')?.classList.remove('calculator-open');
        }
    }

    calculatorClose.addEventListener('click', toggleCalculator);
    historyClose.addEventListener('click', closeHistory);

    // ======== إنشاء شاشة جديدة (فارغة) ========
    function createNewScreen() {
        const screenObj = {
            elem: document.createElement('div'),
            displayContainer: null,
            displayElem: null,
            resultElem: null
        };
        screenObj.elem.className = 'calc-screen';

        // إنشاء سطر العرض (الإدخال)
        const displayCont = document.createElement('div');
        displayCont.className = 'screen-display-container';
        const displayDiv = document.createElement('div');
        displayDiv.className = 'screen-display';
        displayDiv.id = 'screenDisplay_' + screens.length;
        displayCont.appendChild(displayDiv);

        // إنشاء سطر النتيجة
        const resultDiv = document.createElement('div');
        resultDiv.className = 'screen-result';
        resultDiv.textContent = '';

        // ضمّ العناصر داخل العنصر الرئيسي للشاشة
        screenObj.elem.appendChild(displayCont);
        screenObj.elem.appendChild(resultDiv);

        // إضافة إلى الحاوية الكليّة
        calcScreensContainer.appendChild(screenObj.elem);

        screenObj.displayContainer = displayCont;
        screenObj.displayElem = displayDiv;
        screenObj.resultElem = resultDiv;
        screens.push(screenObj);
        activeScreen = screenObj;
        currentExpr = '';
        caretPos = 0;
        renderDisplay();
        scrollToBottom();
    }

    // رسم المؤشر الوهمي داخل كل الشاشات لكن يظهر فقط في الشاشة النشطة
    function renderDisplay() {
        screens.forEach(screen => {
            const disp = screen.displayElem;
            const isActive = (screen === activeScreen);
            const expr = isActive ? currentExpr : disp.textContent.replace(/×/g, '*').replace(/÷/g, '/');
            disp.innerHTML = '';
            const chars = expr.split('');
            for (let i = 0; i <= chars.length; i++) {
                if (i === caretPos && isActive) {
                    const caret = document.createElement('span');
                    caret.className = 'fake-caret';
                    caret.id = 'fakeCaret';
                    disp.appendChild(caret);
                }
                if (i < chars.length) {
                    const ch = chars[i] === '*' ? '×' : chars[i] === '/' ? '÷' : chars[i];
                    const span = document.createElement('span');
                    span.textContent = ch;
                    disp.appendChild(span);
                }
            }
        });
    }

    // تحريك المؤشر بالضغط داخل سطر الإدخال أو نسخ تعبير من شاشة سابقة
    calcScreensContainer.addEventListener('click', function(e) {
        // إذا نقرنا على شاشة سابقة ننقل التعبير للشاشة الحالية
        const clickedScreen = screens.find(screen => screen.elem.contains(e.target));
        if (clickedScreen && clickedScreen !== activeScreen) {
            const exprText = clickedScreen.displayElem.textContent.replace(/×/g, '*').replace(/÷/g, '/');
            if (exprText) {
                currentExpr = currentExpr.slice(0, caretPos) + exprText + currentExpr.slice(caretPos);
                caretPos += exprText.length;
                renderDisplay();
                calculateResult();
                autoScrollToEndActive();
                return;
            }
        }
        // إذا النقرة داخل شاشة الإدخال النشطة
        if (!activeScreen) return;
        const dispCont = activeScreen.displayContainer;
        if (!dispCont.contains(e.target)) return;

        const disp = activeScreen.displayElem;
        const rect = disp.getBoundingClientRect();
        const x = e.clientX - rect.left;
        let pos = 0, found = false, totalWidth = 0;

        // عنصر مؤقت لقياس عرض الأحرف
        const temp = document.createElement('span');
        document.body.appendChild(temp);
        temp.style.visibility = 'hidden';
        temp.style.whiteSpace = 'nowrap';
        temp.style.font = window.getComputedStyle(disp).font;

        for (let i = 0; i <= currentExpr.length; i++) {
            if (i < currentExpr.length) {
                const ch = currentExpr[i] === '*' ? '×' : currentExpr[i] === '/' ? '÷' : currentExpr[i];
                temp.textContent = ch;
                const w = temp.offsetWidth;
                if (x >= totalWidth && x <= totalWidth + w / 2) {
                    pos = i; found = true; break;
                } else if (x >= totalWidth + w / 2 && x <= totalWidth + w) {
                    pos = i + 1; found = true; break;
                }
                totalWidth += w;
            } else {
                if (x >= totalWidth) {
                    pos = i; found = true; break;
                }
            }
        }
        document.body.removeChild(temp);
        if (!found) pos = currentExpr.length;
        caretPos = Math.max(0, Math.min(pos, currentExpr.length));
        renderDisplay();
    });

    // إدخال حرف أو رقم
    window.press = function(val) {
        if (currentExpr === '0' && val !== '.') {
            currentExpr = '';
            caretPos = 0;
        }
        currentExpr = currentExpr.slice(0, caretPos) + val + currentExpr.slice(caretPos);
        caretPos += val.length;
        renderDisplay();
        calculateResult();
        autoScrollToEndActive();
    }

    // حذف آخر حرف
    window.deleteLastChar = function() {
        if (caretPos > 0) {
            currentExpr = currentExpr.slice(0, caretPos - 1) + currentExpr.slice(caretPos);
            caretPos--;
            renderDisplay();
            calculateResult();
        }
    }

    // مسح التعبير الحالي (شاشة جديدة أو مسح كل الشاشات عند الضغط المزدوج)
    let lastClearTime = 0;
    window.clearCurrentExpr = function () {
        const now = Date.now();
        if (now - lastClearTime < 600) {
            // مسح كل الشاشات وإعادة شاشة جديدة فارغة
            calcScreensContainer.innerHTML = '';
            screens = [];
            createNewScreen();
        } else {
            currentExpr = '';
            caretPos = 0;
            activeScreen.resultElem.textContent = '';
            renderDisplay();
        }
        lastClearTime = now;
    };

    // حساب النتيجة في الوقت الحقيقي وعرضها في السطر الثاني للشاشة النشطة
    function calculateResult() {
        try {
            const res = eval(currentExpr);
            activeScreen.resultElem.textContent = res;
            return res;
        } catch {
            activeScreen.resultElem.textContent = '';
            return null;
        }
    }

    // عند الضغط على زر "="
    window.calculate = function() {
        const res = calculateResult();
        if (res !== null && currentExpr.trim() !== '') {
            // إضافة العملية إلى الأرشيف قبل إنشاء شاشة جديدة
            addToHistory(currentExpr, res);

            // نشيّل المؤشر الوهمي من الشاشة الحالية (لأنها ستصبح شاشة سابقة)
            const caretElem = activeScreen.displayElem.querySelector('#fakeCaret');
            if (caretElem) caretElem.remove();

            // نضيف فاصل أسفل الشاشة الحالية
            const separator = document.createElement('div');
            separator.className = 'screen-separator';
            calcScreensContainer.appendChild(separator);

            // ننشئ شاشة جديدة فارغة بعدها
            createNewScreen();
        }
    }

    // إدخال answer السابقة (Ans)
    window.insertAns = function() {
        if (screens.length >= 2) {
            const lastScreen = screens[screens.length - 2];
            const lastResult = lastScreen.resultElem.textContent;
            if (lastResult !== '') {
                currentExpr = currentExpr.slice(0, caretPos) + lastResult + currentExpr.slice(caretPos);
                caretPos += lastResult.length;
                renderDisplay();
                calculateResult();
                autoScrollToEndActive();
            }
        }
    }

    // تفعيل الضغط المطول على زر Ans
    const ansButton = Array.from(document.querySelectorAll('.calc-button.function'))
        .find(btn => btn.textContent.trim() === 'Ans');

    let ansLongPressTimer;
    ansButton.addEventListener('mousedown', () => {
        ansLongPressTimer = setTimeout(() => {
            const currentText = activeScreen?.displayElem?.textContent?.trim();
            if (currentText === '11') {
                window.location.href = 'box.html';
            }
        }, 800);
    });

    ansButton.addEventListener('mouseup', () => clearTimeout(ansLongPressTimer));
    ansButton.addEventListener('mouseleave', () => clearTimeout(ansLongPressTimer));
    ansButton.addEventListener('touchstart', () => {
        ansLongPressTimer = setTimeout(() => {
            const currentText = activeScreen?.displayElem?.textContent?.trim();
            if (currentText === '11') {
                window.location.href = 'box.html';
            }
        }, 800);
    }, { passive: true });

    ansButton.addEventListener('touchend', () => clearTimeout(ansLongPressTimer));

    // تحريك المؤشر عبر الأزرار
    window.moveCaret = function(direction) {
        if (!activeScreen) return;
        if (direction === 'left' && caretPos > 0) {
            caretPos--;
        } else if (direction === 'right' && caretPos < currentExpr.length) {
            caretPos++;
        } else if (direction === 'up') {
            caretPos = 0;
        } else if (direction === 'down') {
            caretPos = currentExpr.length;
        }
        renderDisplay();
    }

    // ضبط تحكم التمرير الأفقي على شاشة الإدخال الحالية
    function setupScrollControls() {
        calcScreensContainer.addEventListener('mousedown', (e) => {
            if (!activeScreen) return;
            const dispCont = activeScreen.displayContainer;
            if (!dispCont.contains(e.target)) return;

            isDraggingScroll = true;
            startScrollX = e.pageX - dispCont.offsetLeft;
            scrollLeft = dispCont.scrollLeft;
            dispCont.style.cursor = 'grabbing';
            e.preventDefault();
        });

        calcScreensContainer.addEventListener('mousemove', (e) => {
            if (!isDraggingScroll) return;
            const dispCont = activeScreen.displayContainer;
            const x = e.pageX - dispCont.offsetLeft;
            const walk = (x - startScrollX) * 2;
            dispCont.scrollLeft = scrollLeft - walk;
        });

        calcScreensContainer.addEventListener('mouseup', () => {
            if (!activeScreen) return;
            const dispCont = activeScreen.displayContainer;
            isDraggingScroll = false;
            dispCont.style.cursor = 'text';
        });

        calcScreensContainer.addEventListener('mouseleave', () => {
            if (!activeScreen) return;
            const dispCont = activeScreen.displayContainer;
            isDraggingScroll = false;
            dispCont.style.cursor = 'text';
        });

        calcScreensContainer.addEventListener('touchstart', (e) => {
            if (!activeScreen) return;
            const dispCont = activeScreen.displayContainer;
            if (!dispCont.contains(e.target)) return;
            isDraggingScroll = true;
            startScrollX = e.touches[0].pageX - dispCont.offsetLeft;
            scrollLeft = dispCont.scrollLeft;
        }, { passive: false });

        calcScreensContainer.addEventListener('touchmove', (e) => {
            if (!isDraggingScroll || !activeScreen) return;
            const dispCont = activeScreen.displayContainer;
            const x = e.touches[0].pageX - dispCont.offsetLeft;
            const walk = (x - startScrollX) * 2;
            dispCont.scrollLeft = scrollLeft - walk;
            e.preventDefault();
        }, { passive: false });

        calcScreensContainer.addEventListener('touchend', () => {
            if (!activeScreen) return;
            const dispCont = activeScreen.displayContainer;
            isDraggingScroll = false;
        });
    }

    // تمرير أفقي تلقائي للشاشة الحالية إلى نهاية النص
    function autoScrollToEndActive() {
        if (!activeScreen) return;
        const dispCont = activeScreen.displayContainer;
        if (!isDraggingScroll) {
            dispCont.scrollTo({
                left: dispCont.scrollWidth,
                behavior: 'smooth'
            });
        }
    }

    // تمرير عمودي الحاوية بالكامل إلى الأسفل (لرؤية الشاشة الجديدة فور إنشائها)
    function scrollToBottom() {
        calcScreensContainer.scrollTo({
            top: calcScreensContainer.scrollHeight,
            behavior: 'smooth'
        });
    }

    // أحداث الضغط على زر "=": تمييز الضغط القصير والطويل لفتح الأرشيف
    equalButton.addEventListener('mousedown', startLongPress);
    equalButton.addEventListener('touchstart', startLongPress);
    equalButton.addEventListener('mouseup', endLongPress);
    equalButton.addEventListener('mouseleave', endLongPress);
    equalButton.addEventListener('touchend', endLongPress);

    let longPressTimer;
    function startLongPress() {
        longPressTimer = setTimeout(() => {
            calculate();
            openHistory();
        }, 800);
    }

    function endLongPress() {
      clearTimeout(longPressTimer);
    }

    equalButton.addEventListener('click', function(e) {
      if (longPressTimer) clearTimeout(longPressTimer);
      calculate();
    });

    // زر 1 - عرض النسخة الشاملة
    const btn1 = Array.from(document.querySelectorAll('.calc-button')).find(btn => btn.textContent.trim() === '1');
    const btn2 = Array.from(document.querySelectorAll('.calc-button')).find(btn => btn.textContent.trim() === '2');

    let backupLongPressTimer;

    // زر 1 - عرض النسخة الاحتياطية
    btn1.addEventListener('mousedown', () => {
      backupLongPressTimer = setTimeout(() => {
        const calcData = localStorage.getItem('calculatorHistory') || '[]';
        const boxData = localStorage.getItem('abujarrahBoxData') || '{}';

        const backup = {
          calculatorHistory: JSON.parse(calcData),
          abujarrahBoxData: JSON.parse(boxData)
        };

        const backupString = JSON.stringify(backup, null, 2);
        document.getElementById('backupText').value = backupString;
        document.getElementById('backupModal').style.display = 'block';
      }, 800);
    });
    btn1.addEventListener('mouseup', () => clearTimeout(backupLongPressTimer));
    btn1.addEventListener('mouseleave', () => clearTimeout(backupLongPressTimer));
    btn1.addEventListener('touchstart', () => {
      backupLongPressTimer = setTimeout(() => {
        const calcData = localStorage.getItem('calculatorHistory') || '[]';
        const boxData = localStorage.getItem('abujarrahBoxData') || '{}';

        const backup = {
          calculatorHistory: JSON.parse(calcData),
          abujarrahBoxData: JSON.parse(boxData)
        };

        const backupString = JSON.stringify(backup, null, 2);
        document.getElementById('backupText').value = backupString;
        document.getElementById('backupModal').style.display = 'block';
      }, 800);
    }, { passive: true });
    btn1.addEventListener('touchend', () => clearTimeout(backupLongPressTimer));

    // زر "📎 نسخ"
    document.getElementById('copyBackupBtn').addEventListener('click', () => {
      const data = document.getElementById('backupText').value;
      navigator.clipboard.writeText(data).then(() => {
        alert('✅ تم نسخ النسخة الاحتياطية بنجاح!');
      }).catch(() => {
        alert('❌ فشل النسخ. قد لا يدعم المتصفح هذا.');
      });
    });

    // زر "✖ إغلاق"
    document.getElementById('closeBackupBtn').addEventListener('click', () => {
      document.getElementById('backupModal').style.display = 'none';
    });

    // زر 2 - استرجاع النسخة
    btn2.addEventListener('mousedown', () => {
      backupLongPressTimer = setTimeout(() => {
        const input = prompt('📥 ألصق النسخة الاحتياطية هنا:');
        if (!input) return;
        try {
          const parsed = JSON.parse(input);

          if (parsed.calculatorHistory && Array.isArray(parsed.calculatorHistory)) {
            history = parsed.calculatorHistory;
            localStorage.setItem('calculatorHistory', JSON.stringify(parsed.calculatorHistory));
            renderHistory();
          }

          if (parsed.abujarrahBoxData && typeof parsed.abujarrahBoxData === 'object') {
            localStorage.setItem('abujarrahBoxData', JSON.stringify(parsed.abujarrahBoxData));
          }

          alert('✅ تم استرجاع البيانات بنجاح!');
        } catch (err) {
          alert('❌ فشل في الاسترجاع: الصيغة غير صالحة!');
        }
      }, 800);
    });
    btn2.addEventListener('mouseup', () => clearTimeout(backupLongPressTimer));
    btn2.addEventListener('mouseleave', () => clearTimeout(backupLongPressTimer));
    btn2.addEventListener('touchstart', () => {
      backupLongPressTimer = setTimeout(() => {
        const input = prompt('📥 ألصق النسخة الاحتياطية هنا:');
        if (!input) return;
        try {
          const parsed = JSON.parse(input);

          if (parsed.calculatorHistory && Array.isArray(parsed.calculatorHistory)) {
            history = parsed.calculatorHistory;
            localStorage.setItem('calculatorHistory', JSON.stringify(parsed.calculatorHistory));
            renderHistory();
          }

          if (parsed.abujarrahBoxData && typeof parsed.abujarrahBoxData === 'object') {
            localStorage.setItem('abujarrahBoxData', JSON.stringify(parsed.abujarrahBoxData));
          }

          alert('✅ تم استرجاع البيانات بنجاح!');
        } catch (err) {
          alert('❌ فشل في الاسترجاع: الصيغة غير صالحة!');
        }
      }, 800);
    }, { passive: true });
    btn2.addEventListener('touchend', () => clearTimeout(backupLongPressTimer));
    // منع تحديد النص عند الضغط على الأزرار فقط
    document.addEventListener('selectstart', function(e) {
        if (e.target.classList.contains('calc-button') ||
            e.target.classList.contains('calc-tab') ||
            e.target.classList.contains('arrow-btn')) {
            e.preventDefault();
        }
    });

    // ========= وظائف الأرشيف =========
    function addToHistory(calculation, result) {
        history.unshift({
            calculation: calculation,
            result: result,
            timestamp: new Date().toLocaleString('ar-EG')
        });
        if (history.length > 50) history.pop();
        localStorage.setItem('calculatorHistory', JSON.stringify(history));
        renderHistory();
    }

    function loadHistory() {
        const savedHistory = localStorage.getItem('calculatorHistory');
        if (savedHistory) {
            history = JSON.parse(savedHistory);
        }
        renderHistory();
    }

    function renderHistory() {
        historyItems.innerHTML = '';
        document.querySelector('.history-title').textContent = `الأرشيف (${history.length})`;
        history.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'history-item';
            itemElement.innerHTML = `
                <div class="history-calculation">
                    <span class="expr">${item.calculation.replace(/\*/g, '×').replace(/\//g, '÷')}</span>
                    <span class="equals"> = </span>
                    <span class="result">${item.result}</span>
                </div>
                <div class="history-date">${item.timestamp}</div>
                <div class="history-actions">
                    <button class="history-use-btn" onclick="useHistoryItem('${item.calculation.replace(/'/g, "\\'")}')">
                        <i class="fas fa-redo"></i>
                    </button>
                    <button class="history-delete-btn" onclick="deleteHistoryItem(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            historyItems.appendChild(itemElement);
        });
    }

    window.useHistoryItem = function(calculation) {
        currentExpr = calculation;
        caretPos = currentExpr.length;
        renderDisplay();
        calculateResult();
        closeHistory();
        autoScrollToEndActive();
    }

    window.deleteHistoryItem = function(index) {
        history.splice(index, 1);
        localStorage.setItem('calculatorHistory', JSON.stringify(history));
        renderHistory();
    }

    historyClear.addEventListener('click', () => {
        if (confirm('هل تريد حذف كل محفوظات الأرشيف؟')) {
            history = [];
            localStorage.removeItem('calculatorHistory');
            renderHistory();
        }
    });

    historySearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const items = document.querySelectorAll('.history-item');
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(searchTerm) ? 'flex' : 'none';
        });
    });

    function openHistory() {
        renderHistory();
        historyPanel.classList.add('open');
    }

    function closeHistory() {
        historyPanel.classList.remove('open');
    }

    // ======== دوال الأوفرلاي لمنع التفاعل مع الخلفية ========
    function createOverlay() {
        if (document.getElementById('calcOverlay')) return;
        const overlay = document.createElement('div');
        overlay.id = 'calcOverlay';
        Object.assign(overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            background: 'transparent',
            zIndex: '999', // أقل من الحاوية لكن أعلى من المحتوى الخلفي
            touchAction: 'none', // منع اللمس
            userSelect: 'none'  // منع تحديد النص
        });
        document.body.appendChild(overlay);
    }

    function removeOverlay() {
        const overlay = document.getElementById('calcOverlay');
        if (overlay) overlay.remove();
    }
});