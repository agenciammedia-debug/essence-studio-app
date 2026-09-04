// ============================================================
// ESSENCE STUDIO - SERVICE WORKER
// Guarda solo el "cascarón" de la app (HTML, ícono, manifest)
// para que abra rápido. NUNCA guarda las respuestas de Google,
// así la lista de clientas siempre llega fresca.
//
// IMPORTANTE: cada vez que edites este archivo, sube el número
// de versión (essence-v3 -> essence-v4 -> essence-v5...).
// Si no lo cambias, el iPhone sigue usando la versión vieja.
// ============================================================

const CACHE = 'essence-v4';
const ARCHIVOS = ['./', './index.html', './manifest.json', './icon-192.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('script.google.com')) return;
  if (e.request.method !== 'GET') return;

  // El HTML: primero la red, el caché solo como respaldo sin señal
  if (e.request.mode === 'navigate' || e.request.destination === 'document') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const copia = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copia));
          return res;
        })
        .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
