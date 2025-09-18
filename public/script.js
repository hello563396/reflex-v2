class ReflexStealth {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.activateStealthMode();
        this.applyAdvancedCloaking();
    }

    setupEventListeners() {
        document.getElementById('searchForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRequest();
        });
    }

    activateStealthMode() {
        // Tab cloaking
        document.title = "Google Classroom";
        
        // Advanced history manipulation
        this.manipulateHistory();
        
        // Session cleaning
        this.cleanSession();
    }

    applyAdvancedCloaking() {
        // Prevent dev tools
        this.preventInspection();
        
        // Real-time monitoring
        this.monitorDetection();
    }

    manipulateHistory() {
        // Replace history state
        window.history.replaceState({}, '', '/');
        
        // Continuous monitoring
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
            return 'Security Console';
        };
        
        // Prevent right-click and F12
        document.addEventListener('contextmenu', (e) => e.preventDefault());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
                e.preventDefault();
            }
        });
    }

    monitorDetection() {
        // Detect monitoring attempts
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
        // Nuclear cleanup
        this.cleanSession();
        document.body.innerHTML = '<div style="padding: 2rem; text-align: center;"><h1>🔒 Security Protocol Activated</h1><p>All connections secured.</p></div>';
    }

    async handleRequest() {
        const input = document.getElementById('searchInput').value;
        const resultDiv = document.getElementById('result');
        const errorDiv = document.getElementById('error');

        if (!input) return;

        let targetUrl = input;
        if (!targetUrl.startsWith('http')) {
            targetUrl = 'https://' + targetUrl;
        }

        try {
            resultDiv.innerHTML = '<div class="loading">🚀 Establishing secure Iowa connection...</div>';
            errorDiv.textContent = '';

            const response = await fetch(`/browse?url=${encodeURIComponent(targetUrl)}`);
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

// Nuclear cleanup on exit
window.addEventListener('beforeunload', () => {
    indexedDB.databases().then(dbs => {
        dbs.forEach(db => indexedDB.deleteDatabase(db.name));
    });
    sessionStorage.clear();
    localStorage.clear();
});
