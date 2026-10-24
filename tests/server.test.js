import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server/app.js';
const input = { text: 'Hello', source: 'en', target: 'vi' };
const result = { translation: 'Xin chào', detectedLanguage: 'en', notes: '' };
async function serve(t, options = {}) {
    const server = createApp(options);
    await new Promise(r => server.listen(0, '127.0.0.1', r));
    t.after(
        () =>
            new Promise(r => {
                server.close(r);
                server.closeAllConnections();
            })
    );
    const url = `http://127.0.0.1:${server.address().port}`;
    return {
        url,
        post: (body = input, headers = {}) =>
            fetch(`${url}/api/translate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...headers },
                body: JSON.stringify(body)
            })
    };
}
test('server forwards validated prompts, returns output and never exposes its key', async t => {
    let request;
    const { url, post } = await serve(t, {
        apiKey: 'test-secret',
        fetchImpl: async (_url, options) => {
            request = options;
            return Response.json({
                choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(result) } }]
            });
        }
    });
    const health = await (await fetch(`${url}/api/health`)).text();
    assert.ok(!health.includes('test-secret'));
    const response = await post();
    assert.equal(response.status, 200);
    assert.equal((await response.json()).translation, result.translation);
    assert.equal(request.headers.Authorization, 'Bearer test-secret');
    assert.equal(JSON.parse(request.body).messages.at(-1).role, 'user');
    for (const path of ['/.env', '/server/app.js', '/.git/config', '/package.json'])
        assert.equal((await fetch(`${url}${path}`)).status, 404);
    assert.equal((await fetch(`${url}/`)).status, 200);
});
test('missing configuration is explicit', async t => {
    const { post } = await serve(t, { apiKey: '' });
    assert.equal((await post()).status, 503);
});
test('access token, origin and input validation prevent unwanted provider calls', async t => {
    let calls = 0;
    const { post } = await serve(t, {
        apiKey: 'key',
        token: 'demo-token',
        fetchImpl: async () => {
            calls++;
            throw new Error('Unexpected call');
        }
    });
    assert.equal((await post()).status, 401);
    assert.equal(
        (await post(input, { Authorization: 'Bearer demo-token', Origin: 'https://other.example' }))
            .status,
        403
    );
    assert.equal(
        (await post({ ...input, text: '' }, { Authorization: 'Bearer demo-token' })).status,
        400
    );
    assert.equal(
        (await post({ ...input, text: 'x'.repeat(96001) }, { Authorization: 'Bearer demo-token' }))
            .status,
        413
    );
    assert.equal(calls, 0);
});
test('rate limiting and provider errors are actionable without leaking raw errors', async t => {
    const { post } = await serve(t, {
        apiKey: 'secret',
        limit: 1,
        fetchImpl: async () => new Response('private provider detail', { status: 429 })
    });
    const response = await post();
    assert.equal(response.status, 429);
    assert.match((await response.json()).error, /quota/);
    assert.equal((await post()).status, 429);
});
test('invalid completion is reported as failure', async t => {
    const { post } = await serve(t, {
        apiKey: 'key',
        fetchImpl: async () => Response.json({ choices: [] })
    });
    assert.equal((await post()).status, 502);
});

test('untrusted host names cannot reach the unauthenticated local API', async t => {
    const { post } = await serve(t, { apiKey: 'key' });
    assert.equal(
        (await post(input, { Host: 'attacker.example', Origin: 'http://attacker.example' })).status,
        403
    );
});

test('versioned browser assets resolve through the local server', async t => {
    const { url } = await serve(t);
    const html = await (await fetch(`${url}/`)).text();
    assert.match(html, /main\.js\?v=3/);
    for (const path of [
        '/main.js?v=2',
        '/js/ApiManager.js?v=2',
        '/js/prompts.js?v=2',
        '/css/app.css?v=2'
    ]) {
        assert.equal((await fetch(`${url}${path}`)).status, 200);
    }
});
