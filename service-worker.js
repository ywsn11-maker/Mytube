const CACHE = "mytube-shell-v1";
const SHELL_FILES = ["./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Only cache-serve the app shell itself. Everything else (YouTube API calls,
// the YouTube embed player, etc.) always goes straight to the network.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isShell = SHELL_FILES.some((f) => url.pathname.endsWith(f.replace("./", "")));
  if (!isShell) return;

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
