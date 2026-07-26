const CACHE_NAME = 'essence-studio-v1';
const ARCHIVOS_CASCARON = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Guarda el "cascarón" (diseño) la primera vez que se abre
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ARCHIVOS_CASCARON))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Estrategia: el diseño (HTML/CSS/iconos) sale del caché = abre instantáneo.
// Las llamadas a Google Apps Script (datos reales) SIEMPRE van a internet,
// nunca se cachean, para que la info de clientas/servicios esté actualizada.
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  if (url.includes('script.google.com')) {
    // Datos en vivo: no cachear
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
