const CACHE_NAME = 'essence-studio-v2';
const ARCHIVOS_CASCARON = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ARCHIVOS_CASCARON))
  );
  self.skipWaiting();
});

// Borra cachés de versiones anteriores para que las actualizaciones
// se apliquen solas la próxima vez que se abra la app con internet.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(nombres =>
      Promise.all(
        nombres
          .filter(nombre => nombre !== CACHE_NAME)
          .map(nombre => caches.delete(nombre))
      )
    ).then(() => clients.claim())
  );
});

// Estrategia: "network-first" para el diseño (HTML/CSS/iconos).
// Siempre intenta traer la versión más nueva de GitHub primero;
// si no hay internet, usa la última copia guardada (offline).
// Las llamadas a Apps Script (datos reales) nunca se cachean.
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  if (url.includes('script.google.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(respuesta => {
        const clone = respuesta.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return respuesta;
      })
      .catch(() => caches.match(event.request))
  );
});
