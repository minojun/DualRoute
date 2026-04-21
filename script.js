document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    const resultsArea = document.getElementById('results-area');
    const displayDest = document.getElementById('display-dest');
    
    const s1Input = document.getElementById('station1');
    const s2Input = document.getElementById('station2');
    const destInput = document.getElementById('destination');

    const displayS1 = document.getElementById('display-station1');
    const displayS2 = document.getElementById('display-station2');

    const googleLink1 = document.getElementById('google-link-1');
    const yahooLink1 = document.getElementById('yahoo-link-1');
    const googleLink2 = document.getElementById('google-link-2');
    const yahooLink2 = document.getElementById('yahoo-link-2');

    const openAllBtn = document.getElementById('open-all');

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const s1 = s1Input.value.trim();
        const s2 = s2Input.value.trim();
        const dest = destInput.value.trim();
        const timeInput = document.getElementById('travel-time');

        if (!s1 || !s2 || !dest) return;

        // 履歴に保存
        saveHistory(s1);
        saveHistory(s2);
        saveHistory(dest);

        // Update Display
        displayDest.textContent = dest;
        displayS1.textContent = s1;
        displayS2.textContent = s2;

        // Construct URLs
        let yUrlExtra = '';
        if (timeInput && timeInput.value) {
            const now = new Date();
            const y = now.getFullYear();
            const m = String(now.getMonth() + 1).padStart(2, '0');
            const d = String(now.getDate()).padStart(2, '0');
            const [h, min] = timeInput.value.split(':');
            const m1 = min[0];
            const m2 = min[1];
            yUrlExtra = `&y=${y}&m=${m}&d=${d}&hh=${h}&m1=${m1}&m2=${m2}&type=1`;
        }

        // Google Maps Transit URL
        const gUrl1 = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(s1)}&destination=${encodeURIComponent(dest)}&travelmode=transit`;
        const gUrl2 = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(s2)}&destination=${encodeURIComponent(dest)}&travelmode=transit`;
        
        // Yahoo Transit URL
        const yUrl1 = `https://transit.yahoo.co.jp/search/result?from=${encodeURIComponent(s1)}&to=${encodeURIComponent(dest)}${yUrlExtra}`;
        const yUrl2 = `https://transit.yahoo.co.jp/search/result?from=${encodeURIComponent(s2)}&to=${encodeURIComponent(dest)}${yUrlExtra}`;

        // Set Links
        googleLink1.href = gUrl1;
        yahooLink1.href = yUrl1;
        googleLink2.href = gUrl2;
        yahooLink2.href = yUrl2;

        // Show Results Area with animation
        resultsArea.classList.remove('hidden');
        resultsArea.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Storage (Optional: Save for next time)
        localStorage.setItem('prev_s1', s1);
        localStorage.setItem('prev_s2', s2);
    });

    // Handle "Open All"
    openAllBtn.addEventListener('click', () => {
        const url1 = googleLink1.href;
        const url2 = googleLink2.href;
        
        if (url1 && url2) {
            window.open(url1, '_blank');
            // Small delay to prevent popup blocker in some browsers
            setTimeout(() => {
                window.open(url2, '_blank');
            }, 300);
        }
    });

    // Populate from storage
    const savedS1 = localStorage.getItem('prev_s1');
    const savedS2 = localStorage.getItem('prev_s2');
    if (savedS1) s1Input.value = savedS1;
    if (savedS2) s2Input.value = savedS2;

    // --- History Logic ---
    const HISTORY_KEY = 'w_station_history';

    function getHistory() {
        try {
            return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
        } catch {
            return [];
        }
    }

    function saveHistory(name) {
        if(!name) return;
        let history = getHistory();
        history = history.filter(item => item !== name);
        history.unshift(name);
        if(history.length > 5) history = history.slice(0, 5);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }

    function removeHistory(name) {
        let history = getHistory();
        history = history.filter(item => item !== name);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }

    function showHistoryForInput(inputEl, suggestionsEl) {
        const history = getHistory();
        if(history.length === 0) {
            suggestionsEl.innerHTML = '';
            suggestionsEl.classList.remove('active');
            return;
        }

        suggestionsEl.innerHTML = `
            <div class="suggestion-header">
                <span>最近の入力</span>
            </div>
        ` + history.map(name => `
            <div class="suggestion-item history-item" data-name="${name}">
                <div class="history-item-content">
                    <div>
                        <span style="color: var(--text-muted); margin-right: 8px;">🕒</span>
                        <span class="suggestion-name">${name}</span>
                    </div>
                    <button type="button" class="delete-history-btn" data-name="${name}" title="履歴から削除">×</button>
                </div>
            </div>
        `).join('');

        // 履歴クリック時の処理
        suggestionsEl.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.delete-history-btn')) return;
                inputEl.value = item.dataset.name;
                suggestionsEl.classList.remove('active');
                inputEl.blur(); // フォーカスを外す
            });
        });

        // 削除ボタンクリック時の処理
        suggestionsEl.querySelectorAll('.delete-history-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                removeHistory(btn.dataset.name);
                showHistoryForInput(inputEl, suggestionsEl); // 再描画
                inputEl.focus(); // 入力欄にフォーカスを維持
            });
        });

        suggestionsEl.classList.add('active');
    }

    // Setup input listeners
    const inputsConfig = [
        { input: s1Input, sugg: document.getElementById('suggestions-s1') },
        { input: s2Input, sugg: document.getElementById('suggestions-s2') },
        { input: destInput, sugg: document.getElementById('suggestions-dest') }
    ];

    inputsConfig.forEach(({input, sugg}) => {
        input.addEventListener('focus', () => {
            if (input.value.trim() === '') showHistoryForInput(input, sugg);
        });
        
        input.addEventListener('input', () => {
            if (input.value.trim() === '') {
                showHistoryForInput(input, sugg);
            } else {
                sugg.classList.remove('active'); // 検索テキストがある時は隠す
            }
        });
    });

    // 外部クリックで履歴を閉じる
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.input-field') && !e.target.closest('.dest-field')) {
            inputsConfig.forEach(({sugg}) => sugg.classList.remove('active'));
        }
    });
});
