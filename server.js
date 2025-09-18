import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

// Scrapestack API Configuration
const SCRAPESTACK_KEY = process.env.SCRAPESTACK_KEY || '0a2d06e890cbfedaf9eb1a7dc481d879';
const SCRAPESTACK_URL = 'https://api.scrapestack.com/scrape';

// Iowa-Optimized Settings
const IOWA_PROXY_CONFIG = {
    proxy_location: 'us',
    premium_proxy: 'true',
    render_js: 'true',
    keep_headers: 'true'
};

app.use(express.static('public'));

// URL Validation
const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

// Main Route
app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/public/index.html');
});

// Elite Proxy Route
app.get('/browse', async (req, res) => {
    try {
        let targetUrl = req.query.url;
        if (!targetUrl) return res.redirect('/');

        // Decode and validate URL
        try {
            targetUrl = decodeURIComponent(targetUrl);
            if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;
            if (!isValidUrl(targetUrl)) throw new Error('Invalid URL');
        } catch {
            return res.redirect('/');
        }

        // Scrapestack API Call
        const params = new URLSearchParams({
            access_key: SCRAPESTACK_KEY,
            url: targetUrl,
            ...IOWA_PROXY_CONFIG
        });

        const response = await fetch(`${SCRAPESTACK_URL}?${params}`);
        
        if (response.status === 401) {
            throw new Error('Scrapestack API authentication failed. Check your API key.');
        }

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.text();
        
        // Send response with cloaking
        res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Google Classroom</title>
    <link rel="icon" href="https://www.google.com/favicon.ico">
    <base href="${targetUrl}">
    <style>
        body { margin: 0; padding: 0; }
        .reflex-bar {
            position: fixed; top: 0; left: 0; right: 0;
            background: rgba(0,0,0,0.95); color: white;
            padding: 12px; z-index: 10000;
            display: flex; align-items: center;
            font-family: Arial, sans-serif;
        }
        .reflex-url {
            background: rgba(255,255,255,0.1);
            padding: 8px 12px; border-radius: 4px;
            margin: 0 12px; flex: 1;
            font-size: 14px; overflow: hidden;
            text-overflow: ellipsis; white-space: nowrap;
        }
        .reflex-back {
            background: #8ab4f8; color: black;
            padding: 8px 16px; border-radius: 4px;
            text-decoration: none; font-weight: bold;
            margin-right: 10px;
        }
    </style>
</head>
<body>
    <div class="reflex-bar">
        <a href="/" class="reflex-back">← Classroom</a>
        <div class="reflex-url">${targetUrl}</div>
    </div>
    <div style="margin-top: 60px;">${data}</div>
</body>
</html>
        `);

    } catch (error) {
        res.redirect('/?error=' + encodeURIComponent(error.message));
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Reflex Elite Browser active on port ${PORT}`);
});
