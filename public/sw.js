// 极简 sw.js，不缓存任何内容，只为了让浏览器“忘记”旧的缓存逻辑
const CACHE_NAME = 'my-pwa-v2'; // 版本号改成和之前不同的新值

// 安装时什么都不存
self.addEventListener('install', event => {
  self.skipWaiting(); // 立即激活
});

// 所有请求都直接走网络，不查缓存
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});

// 激活时删除所有旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => caches.delete(key)));
    })
  );
  self.clients.claim(); // 立即控制所有页面
});