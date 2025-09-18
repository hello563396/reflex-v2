import express from 'express';
import { WebSocketServer } from 'ws';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

// Military-grade Iowa proxy pool
const IOWA_PROXIES = [
    '208.108.118.42:3128', '216.164.58.134:8080', '97.88.83.206:3128',
    '104.139.118.78:8080', '192.159.117.42:3128', '208.108.118.43:3128'
];

const STEALTH_USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
];

// URL validation function
const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

app.use(express.static('public'));

// Fixed proxy middleware with URL validation
app.use('/proxy', async (req, res) => {
    try {
        const targetUrl = req.query.url;
        
        // Validate URL format
        if (!targetUrl || !isValidUrl(targetUrl)) {
            return res.status(400).send('Invalid URL format');
        }

        const proxyConfig = {
            method: 'GET',
            headers: {
                'User-Agent': STEALTH_USER_AGENTS[Math.floor(Math.random() * STEALTH_USER_AGENTS.length)],
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Cache-Control': 'max-age=0',
                'X-Forwarded-For': IOWA_PROXIES[Math.floor(Math.random() * IOWA_PROXIES.length)].split(':')[0],
                'X-Real-IP': IOWA_PROXIES[Math.floor(Math.random() * IOWA_PROXIES.length)].split(':')[0]
            },
            timeout: 10000
        };

        const response = await fetch(targetUrl, proxyConfig);
        const data = await response.text();
        
        res.set({
            'X-Proxy-Type': 'Elite-Military',
            'X-Proxy-Location': 'US-IA-LeClaire',
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache'
        });

        res.send(data);
    } catch (error) {
        res.status(500).send(`Proxy error: ${error.message}`);
    }
});

// WebSocket tunneling
const wss = new WebSocketServer({ noServer: true });
wss.on('connection', (ws, req) => {
    const targetUrl = req.url.replace('/ws/', '');
    if (isValidUrl(targetUrl)) {
        const targetWs = new WebSocket(targetUrl);
        ws.on('message', (data) => targetWs.send(data));
        targetWs.on('message', (data) => ws.send(data));
    }
});

const server = app.listen(PORT, () => {
    console.log(`🚀 Reflex V2 Military Edition active on port ${PORT}`);
});

server.on('upgrade', (request, socket, head) => {
    if (request.url.startsWith('/ws/')) {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
        });
    }
});
