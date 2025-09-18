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
                console.log('Service Worker registered for
