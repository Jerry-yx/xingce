// 最简单的sw.js，只为了触发安装提示，不做复杂缓存
self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open("my-cache").then(function (cache) {
      return cache.addAll([
        "/",
        "/xing.html",
        "/shen.html",
        "/manifest.json", // 改成你实际的js文件名
      ]);
    }),
  );
});
// 安装Service Worker时预缓存文件
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log("缓存已打开，开始预缓存文件");
      return cache.addAll(urlsToCache);
    }),
  );
});

// 拦截网络请求，优先从缓存中读取
self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      // 如果缓存中有，直接返回缓存；否则去网络上请求
      return response || fetch(event.request);
    }),
  );
});

// 激活时清理旧版本缓存（避免用户手机存了旧文件）
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log("删除旧缓存:", cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});
