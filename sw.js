var CACHE_NAME = 'my-site-cache-v2';
var urlsToCache = [
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://code.getmdl.io/1.3.0/material.indigo-pink.min.css',
    'https://code.getmdl.io/1.3.0/material.min.js',
    'https://cdn.jsdelivr.net/npm/riot@3.9.0/riot+compiler.js',
    'https://cdnjs.cloudflare.com/ajax/libs/fetch/2.0.3/fetch.min.js',
    'tags/pages.tag.html'
];

self.addEventListener('install', function(event) {
    // インストール処理
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(function(cache) {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
        .then(function(response) {
            // キャッシュがあったのでレスポンスを返す
            if (response) {
                return response;
            }

            // 重要：リクエストを clone する。リクエストは Stream なので
            // 一度しか処理できない。ここではキャッシュ用、fetch 用と2回
            // 必要なので、リクエストは clone しないといけない
            var fetchRequest = event.request.clone();

            return fetch(fetchRequest).then(
                function(response) {
                    // レスポンスが正しいかをチェック
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // 重要：レスポンスを clone する。レスポンスは Stream で
                    // ブラウザ用とキャッシュ用の2回必要。なので clone して
                    // 2つの Stream があるようにする
                    var responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then(function(cache) {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                }
            );
        })
    );
});