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
        // Clear history traces
        this.clearHistory();
    }

    clearHistory() {
        window.history.replaceState({}, '', '/');
        sessionStorage.clear();
    }

    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    async handleRequest() {
        const inputUrl = document.getElementById('searchInput').value;
        const resultDiv = document.getElementById('result');

        if (!inputUrl) {
            resultDiv.innerHTML = '<div class="error">Please enter a URL</div>';
            return;
        }

        // Ensure URL has protocol
        let targetUrl = inputUrl;
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            targetUrl = 'https://' + targetUrl;
        }

        if (!this.isValidUrl(targetUrl)) {
            resultDiv.innerHTML = '<div class="error">Invalid URL format</div>';
            return;
        }

        try {
            resultDiv.innerHTML = '<div class="loading">Establishing secure connection...</div>';
            
            const response = await fetch(`/proxy?url=${encodeURIComponent(targetUrl)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
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

            this.clearHistory();

        } catch (error) {
            resultDiv.innerHTML = `
                <div class="error">
                    Connection error: ${error.message}
                    <br><br>
                    <button onclick="location.reload()" style="padding: 0.5rem 1rem; background: var(--accent); color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Try Again
                    </button>
                </div>
            `;
        }
    }
}

// Initialize
new ReflexStealth();

// Additional security
window.addEventListener('beforeunload', () => {
    sessionStorage.clear();
});
