// node make.js 가 생성 — 직접 고치지 말 것
const CACHE = 'kongstar-b0d2a1cfd5';
const CORE = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png', './games/common.js', './games/achv.html', './games/bake.html', './games/basket.html', './games/bowl.html', './games/brick.html', './games/bubble.html', './games/claw.html', './games/cross.html', './games/cups.html', './games/curl.html', './games/deliver.html', './games/dig.html', './games/fish.html', './games/flower.html', './games/hoop.html', './games/index.html', './games/jump.html', './games/parade.html', './games/pinball.html', './games/pipe.html', './games/pour.html', './games/puzzle.html', './games/quiz.html', './games/race.html', './games/rank.html', './games/rhythm.html', './games/rope.html', './games/run.html', './games/seek.html', './games/shoot.html', './games/shop.html', './games/sleep.html', './games/socks.html', './games/spot.html', './games/stack.html', './games/stairs.html', './games/stamp.html', './games/stone.html', './games/throw.html', './games/toys.html', './games/tug.html'];

self.addEventListener('install', e => {
  // HTTP 캐시(GitHub Pages 10분)를 거치지 않고 새로 받아 새 캐시에 넣는다
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('kongstar-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    // 화면은 새 버전 우선(3초 안에 응답 없으면 저장본) — 인터넷이 없어도 열린다. 미니게임 화면(games/…)은 제 주소로 따로 저장한다 (일상 화면 저장본을 덮어쓰지 않게)
    const gm = new URL(req.url).pathname.match(/\/games\/([a-z0-9-]+\.html)?$/), KEY = gm ? './games/' + (gm[1] || 'index.html') : './index.html';
    e.respondWith(new Promise(resolve => {
      let done = false;
      const fallback = () => caches.match(KEY).then(r => { if (!done && r) { done = true; resolve(r); } });
      const t = setTimeout(fallback, 3000);
      fetch(req, { cache: 'no-cache' }).then(r => {   // 매번 ETag 로 재검증 (바뀐 게 없으면 304)
        clearTimeout(t);
        if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(KEY, copy)); }
        if (!done) { done = true; resolve(r); }
      }).catch(() => { clearTimeout(t); caches.match(KEY).then(r => { if (!done) { done = true; resolve(r || Response.error()); } }); });
    }));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return r;
  })));
});
