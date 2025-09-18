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
    '97.88.83.206:3128', '104.139.118.78:8080',
    '192.159.117.42:3128', '208.108.118.43:3128',
    '216.164.58.135:8080', '97.88.83.207:3128'
];

// Advanced Stealth User Agents
const STEALTH_USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
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

        // Scrapestack Elite Configuration
        const scrapestackParams = new URLSearchParams({
            access_key: SCRAPESTACK_KEY,
            url: targetUrl,
            premium_proxy: 'true',
            render_js: 'true',
            proxy_location: 'us',
            keep_headers: 'true',
            autoparse: 'true'
        });

        // Military-Grade Request Headers
        const proxyConfig = {
            method: 'GET',
            headers: {
                'User-Agent': STEALTH_USER_AGENTS[Math.floor(Math.random() * STEALTH_USER_AGENTS.length)],
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'X-Forwarded-For': IOWA_ELITE_PROXIES[Math.floor(Math.random() * IOWA_ELITE_PROXIES.length)].split(':')[0],
                'X-Real-IP': IOWA_ELITE_PROXIES[Math.floor(Math.random() * IOWA_ELITE_PROXIES.length)].split(':')[0],
                'Referer': 'https://www.google.com/',
                'Origin': 'https://www.google.com'
            },
            timeout: 45000
        };

        const response = await fetch(`${SCRAPESTACK_URL}?${scrapestackParams}`, proxyConfig);
        
        if (response.status === 401) {
            throw new Error('Scrapestack API authentication failed. Verify your API key in Vercel environment variables.');
        }

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type') || '';
        
        if (contentType.includes('text/html')) {
            const html = await response.text();
            const $ = cheerio.load(html);
            
            // ELITE URL REWRITING - PREVENTS ALL REDIRECTS
            $('a[href]').each((_, el) => {
                let href = $(el).attr('href');
                if (href && !href.startsWith('javascript:')) {
                    try {
                        const absoluteUrl = new URL(href, targetUrl).href;
                        $(el).attr('href', `/browse?url=${encodeURIComponent(absoluteUrl)}`);
                    } catch (error) {
                        console.log('URL rewrite error:', error);
                    }
                }
            });

            // COMPREHENSIVE ASSET REWRITING
            $('img[src], script[src], link[href], source[src], iframe[src], video[src], audio[src]').each((_, el) => {
                const src = $(el).attr('src') || $(el).attr('href');
                if (src && !src.startsWith('data:') && !src.startsWith('blob:') && !src.startsWith('javascript:')) {
                    try {
                        const absoluteUrl = new URL(src, targetUrl).href;
                        if ($(el).is('img') || $(el).is('source') || $(el).is('video') || $(el).is('audio')) {
                            $(el).attr('src', `/proxy-asset?url=${encodeURIComponent(absoluteUrl)}`);
                        } else if ($(el).is('script') || $(el).is('iframe')) {
                            $(el).attr('src', `/proxy-asset?url=${encodeURIComponent(absoluteUrl)}`);
                        } else if ($(el).is('link')) {
                            $(el).attr('href', `/proxy-asset?url=${encodeURIComponent(absoluteUrl)}`);
                        }
                    } catch (error) {
                        console.log('Asset rewrite error:', error);
                    }
                }
            });

            // FORM INTERCEPTION
            $('form[action]').each((_, el) => {
                const action = $(el).attr('action');
                if (action) {
                    try {
                        const absoluteUrl = new URL(action, targetUrl).href;
                        $(el).attr('action', `/browse?url=${encodeURIComponent(absoluteUrl)}`);
                        $(el).attr('method', 'get');
                    } catch (error) {
                        console.log('Form rewrite error:', error);
                    }
                }
            });

            // SECURITY HEADER REMOVAL
            $('meta[http-equiv="refresh"]').remove();
            $('meta[content*="url="]').remove();
            $('meta[content*="URL="]').remove();

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
            backdrop-filter: blur(10px);
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
            margin-right: 10px; transition: all 0.3s;
        }
        .reflex-back:hover { background: #a8c7fa; transform: translateY(-1px); }
    </style>
</head>
<body>
    <div class="reflex-bar">
        <a href="/" class="reflex-back">← Classroom</a>
        <div class="reflex-url">${targetUrl}</div>
    </div>
    <div style="margin-top: 60px;">${modifiedHtml}</div>
    <script>
        // MILITARY-GRADE NAVIGATION INTERCEPTION
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href) {
                e.preventDefault();
                window.location.href = '/browse?url=' + encodeURIComponent(link.href);
            }
        });

        // FORM INTERCEPTION
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form && form.action) {
                e.preventDefault();
                const formData = new FormData(form);
                const params = new URLSearchParams(formData);
                window.location.href = '/browse?url=' + encodeURIComponent(form.action + '?' + params.toString());
            }
        });

        // ADVANCED IMAGE RECOVERY SYSTEM
        setInterval(() => {
            document.querySelectorAll('img, video, audio').forEach(media => {
                if (media.complete && media.naturalHeight === 0) {
                    const currentSrc = media.src;
                    if (!currentSrc.includes('/proxy-asset')) {
                        media.src = '/proxy-asset?url=' + encodeURIComponent(currentSrc);
                    }
                }
            });
        }, 1000);
    </script>
</body>
</html>
            `);
        } else {
            const buffer = await response.arrayBuffer();
            res.set('Content-Type', contentType);
            res.send(Buffer.from(buffer));
        }

    } catch (error) {
        console.error('Proxy error:', error);
        res.redirect('/?error=' + encodeURIComponent(error.message));
    }
});

// ELITE ASSET PROXY
app.get('/proxy-asset', async (req, res) => {
    try {
        let targetUrl = req.query.url;
        if (!targetUrl) return res.status(400).send('Invalid URL');

        targetUrl = decodeUrl(targetUrl);

        const proxyConfig = {
            method: 'GET',
            headers: {
                'User-Agent': STEALTH_USER_AGENTS[Math.floor(Math.random() * STEALTH_USER_AGENTS.length)],
                'Accept': '*/*',
                'Referer': 'https://www.google.com/',
                'Origin': 'https://www.google.com',
                'X-Forwarded-For': IOWA_ELITE_PROXIES[Math.floor(Math.random() * IOWA_ELITE_PROXIES.length)].split(':')[0]
            },
            timeout: 30000
        };

        const response = await fetch(targetUrl, proxyConfig);
        const buffer = await response.arrayBuffer();
        
        // PRECISE CONTENT TYPE HANDLING
        let contentType = response.headers.get('content-type') || 'application/octet-stream';
        if (targetUrl.includes('.css')) contentType = 'text/css';
        if (targetUrl.includes('.js')) contentType = 'application/javascript';
        if (targetUrl.match(/\.(png|jpg|jpeg|gif|webp|avif|svg|ico)/i)) {
            contentType = response.headers.get('content-type') || 'image/' + targetUrl.split('.').pop();
        }
        if (targetUrl.match(/\.(mp4|webm|ogg|mov)/i)) contentType = 'video/mp4';
        if (targetUrl.match(/\.(mp3|wav|ogg)/i)) contentType = 'audio/mpeg';
        
        res.set('Content-Type', contentType);
        res.send(Buffer.from(buffer));

    } catch (error) {
        res.status(500).send('Asset load failed');
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Reflex Elite Browser active on port ${PORT}`);
    console.log(`🔒 Scrapestack API: ${SCRAPESTACK_KEY ? 'Integrated' : 'Not configured'}`);
    console.log(`🌐 Iowa Optimization: Active`);
    console.log(`🛡️  Military Grade: Operational`);
});
