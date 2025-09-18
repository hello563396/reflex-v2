// ELITE STEALTH SYSTEM
class ReflexStealth {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.activateStealthMode();
        this.applyAdvancedCloaking();
        this.monitorSystem();
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

    applyAdvancedCloaking() {
        // Prevent DevTools Inspection
        this.preventInspection();
        
        // Real-time Monitoring
        this.monitorDetection();
    }

    monitorSystem() {
        // Continuous System Monitoring
        setInterval(() => {
            this.maintainStealth();
        }, 1000);
    }

    cloakTab() {
        // Change tab title and favicon to Google Classroom
        const originalTitle = document.title;
        document.title = "Google Classroom";
        
        // Change favicon to Google's
        let favicon = document.querySelector('link[rel="icon"]');
        if (!favicon) {
            favicon = document.createElement('link');
            favicon.rel = 'icon';
            document.head.appendChild(favicon);
        }
        favicon.href = 'https://www.google.com/favicon.ico';
        
        // Store original for restoration if needed
        this.originalTitle = originalTitle;
    }

    manipulateHistory() {
        // Replace history state to hide real URL
        window.history.replaceState({}, '', '/');
        
        // Monitor and maintain history state
        let lastUrl = location.href;
        this.historyInterval = setInterval(() => {
            if (location.href !== lastUrl) {
                window.history.replaceState({}, '', '/');
                lastUrl = location.href;
            }
        }, 100);
    }

    cleanSession() {
        // Clear all storage mechanisms
        sessionStorage.clear();
        localStorage.clear();
        
        // Clear cookies aggressively
        document.cookie.split(";").forEach((c) => {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/;domain=" + window.location.hostname);
        });
        
        // Clear IndexedDB
        if (window.indexedDB) {
            indexedDB.databases().then(dbs => {
                dbs.forEach(db => {
                    indexedDB.deleteDatabase(db.name);
                });
            }).catch(() => {});
        }
    }

    preventInspection() {
        // Anti-dev tools protection
        const devTools = /./;
        devTools.toString = function() {
            return 'Google Classroom Security Console';
        };
        
        // Prevent right-click
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });
        
        // Prevent keyboard shortcuts for dev tools
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.shiftKey && e.key === 'C') ||
                (e.ctrlKey && e.shiftKey && e.key === 'J') ||
                (e.ctrlKey && e.key === 'U')) {
                e.preventDefault();
                return false;
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

        this.detectionInterval = setInterval(detectDevTools, 1000);
    }

    maintainStealth() {
        // Continuous stealth maintenance
        this.cloakTab();
        this.cleanSession();
    }

    activateEmergencyProtocol() {
        // Nuclear cleanup and obfuscation
        this.cleanSession();
        document.body.innerHTML = `
            <div style="padding: 3rem; text-align: center; font-family: Arial, sans-serif;">
                <h1 style="color: #8ab4f8; margin-bottom: 1rem;">🔒 Google Classroom</h1>
                <p style="color: #9aa0a6;">Secure educational environment active.</p>
            </div>
        `;
        
        // Clear all intervals
        clearInterval(this.historyInterval);
        clearInterval(this.detectionInterval);
    }

    async handleRequest() {
        const input = document.getElementById('searchInput').value.trim();
        const resultDiv = document.getElementById('result');
        const errorDiv = document.getElementById('error');

        if (!input) return;

        let targetUrl = input;
        if (!targetUrl.startsWith('http')) {
            // Check if it's a search query or URL
            if (targetUrl.includes(' ') || !targetUrl.includes('.')) {
                targetUrl = 'https://www.google.com/search?q=' + encodeURIComponent(targetUrl);
            } else {
                targetUrl = 'https://' + targetUrl;
            }
        }

        try {
            resultDiv.innerHTML = '<div class="loading">🚀 Establishing secure Iowa connection...</div>';
            errorDiv.textContent = '';

            const response = await fetch(`/browse?url=${encodeURIComponent(targetUrl)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.text();

            // Create secure iframe for content display
            const iframe = document.createElement('iframe');
            iframe.srcdoc = data;
            iframe.style.width = '100%';
            iframe.style.height = '600px';
            iframe.style.border = 'none';
            iframe.style.borderRadius = '12px';
            iframe.style.marginTop = '1rem';

            resultDiv.innerHTML = '';
            resultDiv.appendChild(iframe);

            // Reapply cloaking for the new content
            this.activateStealthMode();

        } catch (error) {
            resultDiv.innerHTML = '';
            errorDiv.textContent = `Access failed: ${error.message}`;
            console.error('Request error:', error);
        }
    }
}

// Initialize Elite Stealth System
const reflexSystem = new ReflexStealth();

// Nuclear cleanup on exit
window.addEventListener('beforeunload', () => {
    reflexSystem.cleanSession();
    reflexSystem.activateEmergencyProtocol();
});

// Additional protection against browser features
Object.defineProperty(navigator, 'webdriver', {
    get: () => false,
});

Object.defineProperty(navigator, 'languages', {
    get: () => ['en-US', 'en'],
});

Object.defineProperty(navigator, 'plugins', {
    get: () => [1, 2, 3, 4, 5],
});
