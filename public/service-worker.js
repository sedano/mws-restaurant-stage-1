'use strict';

const CACHE_NAME = 'mws-cache';
const CACHE_FILES = [
    'android-chrome-192x192.png',
    'android-chrome-512x512.png',
    'apple-touch-icon.png',
    'browserconfig.xml',
    'css/styles.css',
    'data/restaurants.json',
    'favicon-16x16.png',
    'favicon-32x32.png',
    'favicon.ico',
    'img/1-small.jpg',
    'img/1.jpg',
    'img/10-small.jpg',
    'img/10.jpg',
    'img/2-small.jpg',
    'img/2.jpg',
    'img/3-small.jpg',
    'img/3.jpg',
    'img/4-small.jpg',
    'img/4.jpg',
    'img/5-small.jpg',
    'img/5.jpg',
    'img/6-small.jpg',
    'img/6.jpg',
    'img/7-small.jpg',
    'img/7.jpg',
    'img/8-small.jpg',
    'img/8.jpg',
    'img/9-small.jpg',
    'img/9.jpg',
    'index.html',
    'js/idb.js',
    'js/dbhelper.js',
    'js/main.js',
    'js/restaurant_info.js',
    'mstile-150x150.png',
    'restaurant.html',
    'site.webmanifest']

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(CACHE_FILES);
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => {
                    return cacheName.startsWith('mws-') &&
                        cacheName != CACHE_NAME;
                }).map(cacheName => {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);

    if (requestUrl.origin === location.origin) {
        if (requestUrl.pathname === '/') {
            event.respondWith(caches.match('/index.html'));
            return;
        }
    }
    event.respondWith(
        caches.match(event.request, { ignoreSearch: true }).then(response => {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('message', event => {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});