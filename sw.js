const CACHE_NAME = 'essence-studio-v3';
const ARCHIVOS_CASCARON = [
  './',
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

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  const method = event.request.method;

  // REGLA CLAVE: Ignorar peticiones que NO sean GET (como el POST de registro)
  // y cualquier comunicación con servidores de Google.
  if (method !== 'GET' || url.includes('google.com') || url.includes('googleusercontent.com')) {
    return; // Permite que el navegador maneje la petición directamente por red
  }

  event.respondWith(
    fetch(event.request)
      .then(respuesta => {
        if (respuesta.status === 200) {
          const clone = respuesta.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return respuesta;
      })
      .catch(() => caches.match(event.request))
  );
});
