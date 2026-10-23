import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname } from 'node:path';
import { timingSafeEqual } from 'node:crypto';
import {
    DEFAULT_MODEL,
    requestBody,
    validateInput,
    parseCompletion,
    providerError
} from '../js/prompts.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const json = (res, code, body) => {
    res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(body));
};
const sameToken = (a, b) => {
    const left = Buffer.from(a);
    const right = Buffer.from(b);
    return left.length === right.length && timingSafeEqual(left, right);
};
export function createApp({
    apiKey = process.env.OPENAI_API_KEY,
    model = process.env.OPENAI_MODEL || DEFAULT_MODEL,
    token = process.env.POLYGLOT_ACCESS_TOKEN || '',
    fetchImpl = fetch,
    limit = 30
} = {}) {
    const requests = new Map();
    return http.createServer(async (req, res) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Referrer-Policy', 'no-referrer');
        res.setHeader(
            'Content-Security-Policy',
            "default-src 'self'; connect-src 'self' https://api.openai.com; style-src 'self'; script-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
        );
        try {
            const path = new URL(req.url, 'http://localhost').pathname;
            const host = new URL(`http://${req.headers.host}`).hostname;
            if (!token && !['localhost', '127.0.0.1', '[::1]'].includes(host)) {
                return json(res, 403, {
                    error: 'Use localhost or configure a server access token.'
                });
            }
            if (path === '/api/health' && req.method === 'GET')
                return json(res, 200, { configured: !!apiKey, model, requiresToken: !!token });
            if (path === '/api/translate') {
                if (req.method !== 'POST') return json(res, 405, { error: 'Use POST.' });
                if (req.headers.origin && new URL(req.headers.origin).host !== req.headers.host)
                    return json(res, 403, { error: 'Cross-origin requests are not allowed.' });
                if (token && !sameToken(req.headers.authorization || '', `Bearer ${token}`))
                    return json(res, 401, {
                        error: 'Enter the server access token in Connection settings.'
                    });
                if (!apiKey)
                    return json(res, 503, {
                        error: 'Set OPENAI_API_KEY in the server .env file and restart.'
                    });
                if (!req.headers['content-type']?.startsWith('application/json'))
                    return json(res, 415, { error: 'Send JSON.' });
                const now = Date.now();
                for (const [ip, entry] of requests) if (entry.until <= now) requests.delete(ip);
                const ip = req.socket.remoteAddress;
                const entry = requests.get(ip) || { count: 0, until: now + 60000 };
                requests.set(ip, entry);
                if (++entry.count > limit)
                    return json(res, 429, { error: 'Too many requests. Wait a minute.' });
                const chunks = [];
                let bytes = 0;
                for await (const chunk of req) {
                    bytes += chunk.length;
                    if (bytes > 96000) {
                        json(res, 413, { error: 'Request too large.' });
                        return;
                    }
                    chunks.push(chunk);
                }
                const body = Buffer.concat(chunks).toString('utf8');
                let input;
                try {
                    input = validateInput(JSON.parse(body));
                } catch (error) {
                    return json(res, 400, { error: error.message });
                }
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), 45000);
                res.on('close', () => {
                    if (!res.writableEnded) controller.abort();
                });
                try {
                    const upstream = await fetchImpl('https://api.openai.com/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${apiKey}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(requestBody(input, model)),
                        signal: controller.signal
                    });
                    if (!upstream.ok)
                        return json(res, upstream.status === 429 ? 429 : 502, {
                            error: providerError(upstream.status)
                        });
                    const result = parseCompletion(await upstream.json());
                    return json(res, 200, { ...result, model });
                } catch (error) {
                    return json(res, 502, {
                        error:
                            error.name === 'AbortError'
                                ? 'Translation timed out. Please retry.'
                                : 'Translation failed or returned an invalid response. Please retry.'
                    });
                } finally {
                    clearTimeout(timer);
                }
            }
            // Allow only application assets. Never expose .env, git, tests or server source.
            if (!['GET', 'HEAD'].includes(req.method))
                return json(res, 405, { error: 'Method not allowed.' });
            const asset = path === '/' ? '/index.html' : path;
            if (
                !/^\/(index\.html|main\.js|sw\.js|js\/[A-Za-z]+\.js|css\/[a-z-]+\.css)$/.test(asset)
            )
                return json(res, 404, { error: 'Not found.' });
            try {
                const body = await readFile(resolve(root, `.${asset}`));
                res.writeHead(200, {
                    'Content-Type':
                        { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }[
                            extname(asset)
                        ] + '; charset=utf-8',
                    'Cache-Control': 'no-cache'
                });
                res.end(req.method === 'HEAD' ? undefined : body);
            } catch {
                json(res, 404, { error: 'Not found.' });
            }
        } catch {
            if (!res.headersSent) json(res, 400, { error: 'Invalid request.' });
            else res.end();
        }
    });
}
