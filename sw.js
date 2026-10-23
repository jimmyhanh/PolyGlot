// Retire v1's cache-first worker, which cached obsolete entry points.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => {
    event.waitUntil(
        (async () => {
            for (const key of await caches.keys()) {
                if (key.startsWith('polyglot-')) await caches.delete(key);
            }
            await self.registration.unregister();
            await self.clients.claim();
        })()
    );
});
