// Elite Stealth System
class ReflexStealth {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.activateStealthMode();
    }

    setupEventListeners() {
        document.getElementById('searchForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRequest();
        });
    }

    activateStealthMode() {
        // Tab Cloaking
        document.title = "Google Classroom";
        
        // History Manipulation
        this.manipulateHistory();
        
        // Session Cleaning
        this.cleanSession();
    }

    manipulateHistory() {
        // Replace history state
        window.history.replaceState({}, '', '/');
        
        // Monitor history changes
        let lastUrl = location.href;
        setInterval(() => {
            if (location.href !== lastUrl) {
                window.history.replaceState({}, '', '/');
                lastUrl = location.href;
            }
        }, 100);
    }

    cleanSession() {
        // Clear all storage
        sessionStorage.clear();
        localStorage.clear();
    }

    async handleRequest() {
        const input = document.getElementById('searchInput').value;
        const resultDiv = document.getElementById('result');
        const errorDiv = document.getElementById('error');

        if (!input) return;

        let targetUrl = input;
        if (!targetUrl.startsWith('http')) {
            if (targetUrl.includes(' ') || !targetUrl.includes('.')) {
                targetUrl = 'https://www.google.com/search?q=' + encodeURIComponent(input);
            } else {
                targetUrl = 'https://' + targetUrl;
            }
        }

        try {
            resultDiv.innerHTML = '<div class="loading">🚀 Establishing secure connection...</div>';
            errorDiv.textContent = '';

            const response = await fetch(`/browse?url=${encodeURIComponent(targetUrl)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.text();

            const iframe = document.createElement('iframe');
            iframe.srcdoc = data;
            iframe.style.width = '100%';
            iframe.style.height = '500px';
            iframe.style.border = 'none';
            iframe.style.borderRadius = '8px';

            resultDiv.innerHTML = '';
            resultDiv.appendChild(iframe);

            // Reapply cloaking
            this.activateStealthMode();

        } catch (error) {
            resultDiv.innerHTML = '';
            errorDiv.textContent = `Access failed: ${error.message}`;
        }
    }
}

// Initialize
new ReflexStealth();

// Cleanup on exit
window.addEventListener('beforeunload', () => {
    sessionStorage.clear();
    localStorage.clear();
});
