import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

// Iowa-optimized proxy pool
const IOWA_PROXIES = [
    '208.108.118.42:3128', '216.164.58.134:8080', 
    '97.88.83.206:3128', '104.139.118.78:8080'
];

const STEALTH_USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
];

// URL validation
const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

app.use(express.static('public'));

// Main page - Google-like interface
app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/public/index.html');
});

// Proxy endpoint - FIXED for full URL handling
app.get('/browse', async (req, res) => {
    try {
        let targetUrl = req.query.url;
        
        if (!targetUrl) {
            return res.redirect('/');
        }

        // Add https:// if missing
        if (!targetUrl.startsWith('http')) {
            targetUrl = 'https://' + targetUrl;
        }

        if (!isValidUrl(targetUrl)) {
            return res.redirect('/');
        }

        const proxyConfig = {
            method: 'GET',
            headers: {
                'User-Agent': STEALTH_USER_AGENTS[Math.floor(Math.random() * STEALTH_USER_AGENTS.length)],
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'X-Forwarded-For': IOWA_PROXIES[Math.floor(Math.random() * IOWA_PROXIES.length)].split(':')[0],
                'X-Real-IP': IOWA_PROXIES[Math.floor(Math.random() * IOWA_PROXIES.length)].split(':')[0]
            },
            timeout: 10000
        };

        const response = await fetch(targetUrl, proxyConfig);
        const data = await response.text();
        
        // Send as full page response
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Reflex Browser - ${targetUrl}</title>
                <style>
                    body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
                    iframe { width: 100%; height: 100vh; border: none; }
                    .back-btn { 
                        position: fixed; 
                        top: 10px; 
                        left: 10px; 
                        z-index: 1000; 
                        background: rgba(0,0,0,0.7); 
                        color: white; 
                        padding: 10px; 
                        border-radius: 5px; 
                        text-decoration: none;
                    }
                </style>
            </head>
            <body>
                <a href="/" class="back-btn">← Back to Reflex</a>
                <script>
                    document.write(atob('${Buffer.from(data).toString('base64')}'));
                </script>
            </body>
            </html>
        `);

    } catch (error) {
        res.redirect('/?error=Connection failed');
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Reflex Browser running on port ${PORT}`);
});
