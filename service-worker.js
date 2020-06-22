importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

workbox.setConfig({
  debug: true
});

//precache local resources and CDN resources
workbox.precaching.precacheAndRoute([
  {url: 'index.html', revision: null},
  {url: 'manifest.json', revision: null},
  {url: '/scripts/pokedex.js', revision: null},
  {url: '/scripts/idb.js', revision: null},
  {url: '/scripts/wrap-idb-value.js', revision: null},
  {url: '/styles/app.css', revision: null},
  {url: '/images/pokemon_logo_1024.png', revision: null},
  {url: '/images/simple_pokeball.gif', revision: null},
  {url: '/images/icon-128x128.png', revision: null},
  {url: '/images/icon-192x192.png', revision: null},
  {url: '/images/icon-256x256.png', revision: null},
  {url: '/images/icon-384x384.png', revision: null},
  {url: '/images/favicon-16x16.png', revision: null},
  {url: '/images/favicon-32x32.png', revision: null},
  {url: '/images/image-placeholder.png', revision: null},
  {url: 'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css', revision: null},
  {url: 'https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js', revision: null}
]);

// Demonstrates using default cache
workbox.routing.registerRoute(
    new RegExp('.*\\.(?:js)'),
    new workbox.StaleWhileRevalidate(),
);

// Demonstrates a custom cache name for a route.
workbox.routing.registerRoute(
    new RegExp('.*\\.(?:png|jpg|jpeg|svg|gif)'),
    new workbox.strategies.CacheFirst({
      cacheName: 'image-cache',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200]
        })
      ]
    })
);

workbox.routing.registerRoute(
  ({url}) => url.origin === 'https://pokeapi.co',
  new workbox.strategies.CacheFirst({
    cacheName: 'api-cache',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      })
    ]
  })
);
