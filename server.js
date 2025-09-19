import express from 'express';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const app = express();
const PORT = process.env.PORT || 3000;

// Scrapestack API Configuration
const SCRAPESTACK_KEY = process.env.SCRAPESTACK_KEY || '0a2d06e890cbfedaf9eb1a7dc481d879';
const SCRAPESTACK_URL = 'https://api.scrapestack.com/scrape';

// Iowa Military-Grade Proxy Network
const IOWA_ELITE_PROXIES = [
    '208.108.118.42:3128', '216.164.58.134:8080', 
    '97.88.83.206:3128', '104.139.118.78:8080'
];

const STEALTH_USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

app.use(express.static('public'));

// Elite URL Processing
const decodeUrl = (url) => {
    try {
        return decodeURIComponent(url);
    } catch {
        return url;
    }
};

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

// Military-Grade Proxy Handler
app.get('/browse', async (req, res) => {
    try {
        let targetUrl = req.query.url;
        if (!targetUrl) return res.redirect('/');

        // Elite URL processing
        targetUrl = decodeUrl(targetUrl);
        if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;
        if (!isValidUrl(targetUrl)) return res.redirect('/');

        // Scrapestack API Call with PROPER authentication
        const params = new URLSearchParams({
            access_key: SCRAPESTACK_KEY,
            url: targetUrl,
            premium_proxy: 'true',
            render_js: 'true',
            proxy_location: 'us',
            keep_headers: 'true'
        });

        const response = await fetch(`${SCRAPESTACK_URL}?${params}`, {
            headers: {
                'User-Agent': STEALTH_USER_AGENTS[Math.floor(Math.random() * STEALTH_USER_AGENTS.length)]
            },
            timeout: 30000
        });
        
        if (response.status === 401) {
            throw new Error('Scrapestack API authentication failed. Check your API key in Vercel environment variables.');
        }

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.text();
        const $ = cheerio.load(data);
        
        // Fix ALL URLs to prevent redirects
        $('a[href]').each((_, el) => {
            const href = $(el).attr('href');
            if (href) {
                try {
                    const absoluteUrl = new URL(href, targetUrl).href;
                    $(el).attr('href', `/browse?url=${encodeURIComponent(absoluteUrl)}`);
                } catch (error) {
                    // Keep original href if URL construction fails
                }
            }
        });

        // Fix ALL assets
        $('img[src], script[src], link[href], iframe[src]').each((_, el) => {
            const src = $(el).attr('src') || $(el).attr('href');
            if (src && !src.startsWith('data:') && !src.startsWith('blob:')) {
                try {
                    const absoluteUrl = new URL(src, targetUrl).href;
                    if ($(el).is('img')) {
                        $(el).attr('src', `/proxy-asset?url=${encodeURIComponent(absoluteUrl)}`);
                    } else if ($(el).is('script') || $(el).is('iframe')) {
                        $(el).attr('src', `/proxy-asset?url=${encodeURIComponent(absoluteUrl)}`);
                    } else if ($(el).is('link')) {
                        $(el).attr('href', `/proxy-asset?url=${encodeURIComponent(absoluteUrl)}`);
                    }
                } catch (error) {
                    // Keep original src/href if URL construction fails
                }
            }
        });

        const modifiedHtml = $.html();
        
        res.set('Content-Type', 'text/html');
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
    <div style="margin-top: 60px;">${modifiedHtml}</div>
    <script>
        // Intercept all navigation
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href) {
                e.preventDefault();
                window.location.href = '/browse?url=' + encodeURIComponent(link.href);
            }
        });
    </script>
</body>
</html>
        `);

    } catch (error) {
        res.redirect('/?error=' + encodeURIComponent(error.message));
    }
});

// Asset Proxy
app.get('/proxy-asset', async (req, res) => {
    try {
        let targetUrl = req.query.url;
        if (!targetUrl) return res.status(400).send('Invalid URL');

        targetUrl = decodeUrl(targetUrl);

        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': STEALTH_USER_AGENTS[Math.floor(Math.random() * STEALTH_USER_AGENTS.length)],
                'Referer': 'https://www.google.com/'
            },
            timeout: 20000
        });

        const buffer = await response.arrayBuffer();
        let contentType = response.headers.get('content-type') || 'application/octet-stream';
        
        res.set('Content-Type', contentType);
        res.send(Buffer.from(buffer));

    } catch (error) {
        res.status(500).send('Asset load failed');
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Reflex Elite Browser active on port ${PORT}`);
});
