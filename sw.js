// Service worker de Suivi Musculation : fait tourner l'appli hors-ligne
// et permet de proposer les mises à jour.
//
// POUR PUBLIER UNE MISE À JOUR : changer VERSION (et NOTES) ci-dessous,
// puis envoyer les fichiers modifiés sur GitHub. Sans changement de VERSION,
// les téléphones ne voient pas la nouvelle version.
const VERSION = "1.2.0";
const NOTES = "Une couleur par exercice, toutes les courbes avec filtre et tri";

const CACHE = "suivi-muscu-" + VERSION;
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(ASSETS.map((url) => new Request(url, { cache: "reload" })))
    )
  );
  // Pas de skipWaiting automatique : l'appli affiche « Mettre à jour » et c'est l'utilisateur qui valide.
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith("suivi-muscu-") && k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  if (req.mode === "navigate") {
    event.respondWith(
      caches.open(CACHE)
        .then((cache) => cache.match("./index.html"))
        .then((res) => res || fetch(req))
    );
    return;
  }
  event.respondWith(
    caches.open(CACHE)
      .then((cache) => cache.match(req, { ignoreSearch: true }))
      .then((res) => res || fetch(req))
  );
});

self.addEventListener("message", (event) => {
  const msg = event.data || {};
  if (msg.type === "SKIP_WAITING") self.skipWaiting();
  if (msg.type === "GET_VERSION" && event.ports && event.ports[0]) {
    event.ports[0].postMessage({ version: VERSION, notes: NOTES });
  }
});
