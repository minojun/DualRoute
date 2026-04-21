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

        if (!s1 || !s2 || !dest) return;

        // Update Display
        displayDest.textContent = dest;
        displayS1.textContent = s1;
        displayS2.textContent = s2;

        // Construct URLs
        // Google Maps Transit URL
        const gUrl1 = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(s1)}&destination=${encodeURIComponent(dest)}&travelmode=transit`;
        const gUrl2 = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(s2)}&destination=${encodeURIComponent(dest)}&travelmode=transit`;
        
        // Yahoo Transit URL
        const yUrl1 = `https://transit.yahoo.co.jp/search/result?from=${encodeURIComponent(s1)}&to=${encodeURIComponent(dest)}`;
        const yUrl2 = `https://transit.yahoo.co.jp/search/result?from=${encodeURIComponent(s2)}&to=${encodeURIComponent(dest)}`;

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
});
