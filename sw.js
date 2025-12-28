// On change le nom de version pour forcer la mise à jour immédiate
const CACHE_NAME = 'dahomey-train-v2';
const DYNAMIC_CACHE = 'dahomey-map-tiles'; // Nouveau cache dédié à la carte

// Liste exacte des fichiers à garder en mémoire (Statique)
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  // Images (J'ai ajouté la version mobile vue dans votre HTML pour éviter l'écran noir sur tel)
  'assets/img/Petit_train.jpg',
  'assets/img/Petit_train_mobile.jpg', 
  'assets/img/Dahomey_Discovery_Logo.jpg',
  'assets/img/favicon.png',
  // Styles externes
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap',
  'https://unpkg.com/leaflet/dist/leaflet.css',
  'https://unpkg.com/leaflet/dist/leaflet.js',
  // Vos fichiers audio
  'assets/audio/depart_2.mp3',
  'assets/audio/mur_patrimoine_2.mp3',
  'assets/audio/Monuments_aux_devoues.mp3',
  'assets/audio/place_souvenir_2.mp3',
  'assets/audio/bio_guerra_2.mp3',
  'assets/audio/sofitel_2.mp3',
  'assets/audio/fin_trajet_2.mp3'
];

// 1. Installation : On met en cache les fichiers vitaux
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Mise en cache des fichiers statiques');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// 2. Activation : On nettoie les vieux caches (v1)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        // On supprime tout ce qui n'est pas le cache actuel ou le cache de map
        if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
          console.log('[Service Worker] Suppression vieux cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

// 3. Utilisation : La partie INTELLIGENTE pour la carte
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // CAS A : C'est une tuile de carte (OpenStreetMap)
  if (requestUrl.hostname.includes('openstreetmap.org')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        // Si on a déjà l'image de la carte, on la donne
        if (cachedResponse) return cachedResponse;
        
        // Sinon, on la télécharge ET on la sauvegarde pour la prochaine fois
        return fetch(event.request).then((networkResponse) => {
          return caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }).catch(() => {
            // Si pas d'internet et pas de cache, tant pis (case grise)
        });
      })
    );
  }
  // CAS B : C'est un de vos fichiers (HTML, Audio, CSS)
  else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).catch(() => {
           // Optionnel : page d'erreur si tout échoue
        });
      })
    );
  }
});