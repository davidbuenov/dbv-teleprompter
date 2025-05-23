/*
 * DBV PWA Teleprompter
 * Copyright (c) 2025 David Bueno Vallejo
 * Desarrollado por David Bueno Vallejo con la asistencia de la IA de Google.
 *
 * Este software se distribuye bajo la Licencia MIT.
 * Consulta el archivo LICENSE para más detalles:
 * https://github.com/davidbuenov/DBVTeleprompter/blob/main/LICENSE
 */
const CACHE_NAME = 'teleprompter-cache-v1.2'; // Increment version if you change cached files
const urlsToCache = [
  '.', // Alias for index.html
  'index.html',
  'style.css',
  'script.js',
  'manifest.json',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png'
  // Add other essential assets if any (e.g., fonts if locally hosted)
];

// Install event: open cache and add core files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Activate new SW immediately
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of open clients
  );
});

// Fetch event: serve from cache if available, otherwise fetch from network
self.addEventListener('fetch', event => {
  // For navigation requests (HTML pages), try network first, then cache (Stale-While-Revalidate strategy might be better for HTML)
  // For this simple app, cache-first for everything is okay.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If network successful, cache it and return
          if (response) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
            return response;
          }
          // If network fails, try cache
          return caches.match(event.request);
        })
        .catch(() => {
          // If network fails and not in cache, return offline page or just fail
          return caches.match(event.request)
                 .then(cachedResponse => cachedResponse || caches.match('index.html')); // Fallback to cached index
        })
    );
    return;
  }

  // For other requests (CSS, JS, images), use cache-first
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Not in cache - fetch from network, then cache it
        return fetch(event.request).then(
          networkResponse => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse; // Don't cache opaque responses or errors
            }
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return networkResponse;
          }
        );
      })
  );
});