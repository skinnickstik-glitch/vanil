// Офлайн-кэш оболочки приложения. При изменении файлов увеличьте версию.
const V = "vanil-v1";
const ASSETS = ["./", "index.html", "styles.css", "config.js", "store.js", "app.js", "fonts/manrope-cyr.woff2", "fonts/manrope-lat.woff2", "fonts/manrope-latext.woff2", "img/hero.webp", "img/tiers.webp", "img/berry.webp", "img/desserts.webp", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.pathname.includes("/api/")) return;
  // сеть в приоритете (чтобы обновлённый прайс/конфиг подхватывался), кэш — если офлайн
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(V).then(x => x.put(e.request, c)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
});
