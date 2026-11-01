/* AutoEntrepreneur 1M — offline-first PWA v3, gracefully handles missing assets */
const CACHE="ae1m-v3-20261101";
const CORE=["./","./index.html","./manifest.webmanifest","./assets/app.css","./assets/app.mjs","./icons/icon.svg"];
self.addEventListener("install",event=>{
 event.waitUntil(caches.open(CACHE).then(async cache=>{
   const results=await Promise.allSettled(CORE.map(async path=>{const response=await fetch(new Request(path,{cache:"reload"}));if(response.ok)await cache.put(path,response)}));
   if(results.some(x=>x.status==="rejected"))console.warn("Some PWA assets could not be cached",results);
 }).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>event.waitUntil((async()=>{
 const names=await caches.keys();
 await Promise.all(names.filter(n=>n!==CACHE).map(n=>caches.delete(n)));
 await self.clients.claim();
})()));
self.addEventListener("fetch",event=>{
 const req=event.request;
 if(req.method!=="GET"||new URL(req.url).origin!==self.location.origin)return;
 if(req.mode==="navigate"){
   event.respondWith(fetch(req).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put("./index.html",copy))}return response}).catch(async()=>(await caches.match("./index.html"))||new Response("Application hors ligne",{status:503})));
   return;
 }
 event.respondWith(caches.match(req).then(saved=>saved||fetch(req).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(req,copy))}return response})));
});