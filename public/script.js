// Elite History Cloaking System
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
        // Tab Cloaking - Disguise as Google Classroom
        this.cloakTab();
        
        // History Manipulation
        this.manipulateHistory();
        
        // Session Cleaning
        this.cleanSession();
    }

    cloakTab() {
        // Change tab title and favicon
        document.title = "Google Classroom";
        
        // Change favicon to Google's
        const favicon = document.querySelector('link[rel="icon"]') || document.createElement('link');
        favicon.rel = 'icon';
        favicon.href = 'https://www.google.com/favicon.ico';
        document.head.appendChild(favicon);
        
        // Prevent inspection
        this.preventInspection();
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
        
        // Clear cookies
        document.cookie.split(";").forEach((c) => {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
    }

    preventInspection() {
        // Anti-dev tools protection
        const devTools = /./;
        devTools.toString = function() {
            return 'Reflex Security Active';
        };
        console.log('%c', devTools);
        
        // Prevent right-click
        document.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Prevent F12, Ctrl+Shift+I, etc.
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
                e.preventDefault();
            }
        });
    }

    async handleRequest() {
        const inputUrl = document.getElementById('searchInput').value;
        const resultDiv = document.getElementById('result');

        if (!inputUrl) return;

        let targetUrl = inputUrl;
        if (!targetUrl.startsWith('http')) {
            targetUrl = 'https://' + targetUrl;
        }

        try {
            resultDiv.innerHTML = '<div class="loading">🚀 Establishing secure connection...</div>';
            
            const response = await fetch(`/browse?url=${encodeURIComponent(targetUrl)}`);
            const data = await response.text();

            // Create secure iframe
            const iframe = document.createElement('iframe');
            iframe.srcdoc = data;
            iframe.style.width = '100%';
            iframe.style.height = '500px';
            iframe.style.border = 'none';

            resultDiv.innerHTML = '';
            resultDiv.appendChild(iframe);

            // Reapply cloaking
            this.cloakTab();

        } catch (error) {
            resultDiv.innerHTML = `<div class="error">Elite access failed: ${error.message}</div>`;
        }
    }
}

// Initialize
new ReflexStealth();

// Nuclear cleanup on exit
window.addEventListener('beforeunload', () => {
    indexedDB.databases().then(dbs => {
        dbs.forEach(db => indexedDB.deleteDatabase(db.name));
    });
    sessionStorage.clear();
    localStorage.clear();
});
