import { createApp } from './app.js';
const host = process.env.HOST || '127.0.0.1';
if (!['127.0.0.1', 'localhost', '::1'].includes(host) && !process.env.POLYGLOT_ACCESS_TOKEN) {
    throw new Error(
        'Set POLYGLOT_ACCESS_TOKEN before exposing the server beyond localhost. Use HTTPS at your host.'
    );
}
const port = Number(process.env.PORT || 3000);
createApp().listen(port, host, () => console.info(`PolyGlot: http://${host}:${port}`));
