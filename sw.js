// Scran offline support: keeps the app and its built-in photos available without a connection.
const V='scran-v3';
const SHELL=['./','index.html','data.js','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin)return; // recipe services and their photos go straight to the network
  e.respondWith(caches.open(V).then(async c=>{
    const hit=await c.match(e.request,{ignoreSearch:true});
    if(hit&&u.pathname.includes('/img/'))return hit;
    const net=fetch(e.request).then(r=>{if(r.ok)c.put(e.request,r.clone());return r});
    if(hit){e.waitUntil(net.catch(()=>{}));return hit}
    return net;
  }));
});
