/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.0.0/workbox-sw.js");

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "android-chrome-192x192.png",
    "revision": "813ecaca6ff89acc81843c4ea44f286f"
  },
  {
    "url": "android-chrome-512x512.png",
    "revision": "1dcd16ab85236011eb97e453775ee476"
  },
  {
    "url": "apple-touch-icon.png",
    "revision": "fa2e339338ece77b6f87aa16c85e15ab"
  },
  {
    "url": "browserconfig.xml",
    "revision": "4af6927fc72cc490c5e73c88f322b579"
  },
  {
    "url": "css/styles.css",
    "revision": "824251d3c56da795190f85511e6360a7"
  },
  {
    "url": "data/restaurants.json",
    "revision": "500a3defff288a163f63f80b48025716"
  },
  {
    "url": "favicon-16x16.png",
    "revision": "61171c101789844bc8bc3d7c3d1a0ef4"
  },
  {
    "url": "favicon-32x32.png",
    "revision": "0a5865f84903dbdfc97525a2bb0913e8"
  },
  {
    "url": "favicon.ico",
    "revision": "a30339afc0a4d732375cb6461c2fb63b"
  },
  {
    "url": "img/1-small.jpg",
    "revision": "fb010021ce3e0b6e319612feb18deeab"
  },
  {
    "url": "img/1.jpg",
    "revision": "cc074688becddd2725114187fba9471c"
  },
  {
    "url": "img/10-small.jpg",
    "revision": "d4ea6bee369fb09326ef00a930351cf3"
  },
  {
    "url": "img/10.jpg",
    "revision": "2bd68efbe70c926de6609946e359faa2"
  },
  {
    "url": "img/2-small.jpg",
    "revision": "30a4a94f718ce08d3227e7cc28f199aa"
  },
  {
    "url": "img/2.jpg",
    "revision": "759b34e9a95647fbea0933207f8fc401"
  },
  {
    "url": "img/3-small.jpg",
    "revision": "0613a9d7d958a0e8ebfb1a4785ee1c79"
  },
  {
    "url": "img/3.jpg",
    "revision": "81ee36a32bcfeea00db09f9e08d56cd8"
  },
  {
    "url": "img/4-small.jpg",
    "revision": "1c251e358ed08c731f744edf1035b0f5"
  },
  {
    "url": "img/4.jpg",
    "revision": "23f21d5c53cbd8b0fb2a37af79d0d37f"
  },
  {
    "url": "img/5-small.jpg",
    "revision": "f4f89c346c22511763583b0cb41ff8e3"
  },
  {
    "url": "img/5.jpg",
    "revision": "0a166f0f4e10c36882f97327b3835aec"
  },
  {
    "url": "img/6-small.jpg",
    "revision": "1c102f34d309a9be3006881d142bbff7"
  },
  {
    "url": "img/6.jpg",
    "revision": "eaf1fec4ee66e121cadc608435fec72f"
  },
  {
    "url": "img/7-small.jpg",
    "revision": "276cec542b00ddeef905753eecd7dac8"
  },
  {
    "url": "img/7.jpg",
    "revision": "bd0ac197c58cf9853dc49b6d1d7581cd"
  },
  {
    "url": "img/8-small.jpg",
    "revision": "4daa6746697545ba2fa48044c28de0e3"
  },
  {
    "url": "img/8.jpg",
    "revision": "6e0e6fb335ba49a4a732591f79000bb4"
  },
  {
    "url": "img/9-small.jpg",
    "revision": "8b328c11946001d633628ac79365e9b5"
  },
  {
    "url": "img/9.jpg",
    "revision": "ba4260dee2806745957f4ac41a20fa72"
  },
  {
    "url": "index.html",
    "revision": "ae3e7709f7aa7f151198d7d292f3f602"
  },
  {
    "url": "js/dbhelper.js",
    "revision": "8d6c6aad32152671008c25705b882362"
  },
  {
    "url": "js/main.js",
    "revision": "7b1e37588f98b7bee4fa17d5964c55d8"
  },
  {
    "url": "js/restaurant_info.js",
    "revision": "8ad50d3d6e2488d447d49231ec3ff92b"
  },
  {
    "url": "mstile-150x150.png",
    "revision": "b47afa9b0ee1a0bd88a604d3f5e30a81"
  },
  {
    "url": "restaurant.html",
    "revision": "d682e0508f364bc3328c0d7bbe85dce7"
  },
  {
    "url": "site.webmanifest",
    "revision": "4e481efbe6bab0edb0b642aa97a2bdf0"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
