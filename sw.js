const CACHE_NAME = 'dahomey-train-v1';

// Liste exacte des fichiers à garder en mémoire
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  // Les styles et cartes externes (nécessitent internet la 1ère fois)
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap',
  'https://unpkg.com/leaflet/dist/leaflet.css',
  'https://unpkg.com/leaflet/dist/leaflet.js',
  // Vos images
  'assets/img/Petit_train.jpg',
  'assets/img/Dahomey_Discovery_Logo.jpg',
  // Vos fichiers audio (d'après votre capture d'écran)
  'assets/audio/depart_2.mp3',
  'assets/audio/mur_patrimoine_2.mp3',
  'assets/audio/avenue_jean_paul_2.mp3',
  'assets/audio/place_souvenir_2.mp3',
  'assets/audio/bio_guerra_2.mp3',
  'assets/audio/sofitel_2.mp3',
  'assets/audio/fin_trajet_2.mp3'
];

// 1. Installation : On met en cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Mise en cache des fichiers');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// 2. Activation : On nettoie les vieux caches si besoin
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
});

// 3. Utilisation : On sert le cache si pas d'internet
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si trouvé dans le cache, on le rend, sinon on va sur internet
        return response || fetch(event.request);
      })
  );
});