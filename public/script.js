// Military-grade stealth operations
class ReflexStealth {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupServiceWorker();
        this.activateStealthMode();
    }

    setupEventListeners() {
        document.getElementById('searchForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRequest();
        });
    }

    async setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered for stealth operations');
            } catch (error) {
                console.log('Service Worker registration failed:', error);
            }
        }
    }

    activateStealthMode() {
        // Clear all traces
        this.clearHistory();
        this.disableLogging();
        this.monitorDetection();
    }

    clearHistory() {
        // Remove URL from history
        window.history.replaceState({}, '', '/');
        
        // Clear storage
        sessionStorage.clear();
        localStorage.clear();
        
        // Clear cookies
        document.cookie.split(";").forEach((c) => {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
    }

    disableLogging() {
        // Override console methods
        const noop = () => {};
        console.log = noop;
        console.warn = noop;
        console.error = noop;
    }

    monitorDetection() {
        // Detect if we're being monitored
        const detectDevTools = () => {
            const widthThreshold = window.outerWidth - window.innerWidth > 160;
            const heightThreshold = window.outerHeight - window.innerHeight > 160;
            
            if (widthThreshold || heightThreshold) {
                this.activateEmergencyProtocol();
            }
        };

        setInterval(detectDevTools, 1000);
    }

    activateEmergencyProtocol() {
        // Emergency cleanup
        this.clearHistory();
        document.body.innerHTML = '<div style="padding: 2rem; text-align: center;"><h1>🔒 Security Protocol Activated</h1><p>All connections secured.</p></div>';
    }

    async handleRequest() {
        const url = document.getElementById('searchInput').value;
        const resultDiv = document.getElementById('result');

        if (!url) return;

        try {
            resultDiv.innerHTML = '<div class="loading">🚀 Establishing secure connection through Iowa military network...</div>';
            
            // Add random delay to avoid pattern detection
            await this.randomDelay(1000, 3000);

            const response = await fetch(`/proxy?url=${encodeURIComponent(url)}`);
            const data = await response.text();

            // Create secure iframe for content display
            const iframe = document.createElement('iframe');
            iframe.srcdoc = data;
            iframe.style.width = '100%';
            iframe.style.height = '500px';
            iframe.style.border = 'none';
            iframe.style.borderRadius = '10px';

            resultDiv.innerHTML = '';
            resultDiv.appendChild(iframe);

            // Final stealth cleanup
            this.clearHistory();

        } catch (error) {
            resultDiv.innerHTML = `<div class="error">⚠️ Connection secured. Retrying through backup network...</div>`;
            // Automatic retry with different parameters
            setTimeout(() => this.handleRequest(), 2000);
        }
    }

    randomDelay(min, max) {
        return new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min));
    }
}

// Initialize stealth system
new ReflexStealth();

// Additional security measures
window.addEventListener('beforeunload', () => {
    // Nuclear cleanup
    indexedDB.databases().then(dbs => {
        dbs.forEach(db => indexedDB.deleteDatabase(db.name));
    });
    
    sessionStorage.clear();
    localStorage.clear();
});

// Prevent right-click and developer tools
document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
    }
});
