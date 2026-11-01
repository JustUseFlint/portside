const C='portside-v2';const A=['./','index.html','styles.css','data.js','app.js','views.js','ui.js','onboarding.js','fonts/Geist-Regular.woff2','fonts/Geist-Medium.woff2','fonts/Geist-SemiBold.woff2','fonts/GeistMono-Regular.woff2','fonts/GeistMono-Medium.woff2','fonts/GeistMono-SemiBold.woff2','icons/icon.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request)))});
