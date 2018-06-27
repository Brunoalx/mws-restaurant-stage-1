importScripts('idb/lib/idb.js');

self.addEventListener('install', function(event){
	event.waitUntil(
		caches.open('cacheRest').then(function(cache){
			return cache.addAll([
				'/',
				'/restaurant.html',
				/*'http://localhost:1337/restaurants',*/
				'css/styles.css',
				'img/1.webp',
				'img/2.webp',
				'img/3.webp',
				'img/4.webp',
				'img/5.webp',
				'img/6.webp',
				'img/7.webp',
				'img/8.webp',
				'img/9.webp',
				'img/10.webp',
				'img_mini/1.webp',
				'img_mini/2.webp',
				'img_mini/3.webp',
				'img_mini/4.webp',
				'img_mini/5.webp',
				'img_mini/6.webp',
				'img_mini/7.webp',
				'img_mini/8.webp',
				'img_mini/9.webp',
				'img_mini/10.webp',
				'img_half/1.webp',
				'img_half/2.webp',
				'img_half/3.webp',
				'img_half/4.webp',
				'img_half/5.webp',
				'img_half/6.webp',
				'img_half/7.webp',
				'img_half/8.webp',
				'img_half/9.webp',
				'img_half/10.webp',
				'js/dbhelper.js',
				'js/main.js',
				'js/restaurant_info.js',
				'idb/lib/idb.js',				
			]);
		})
	);	
});

self.addEventListener('fetch', function(event){
	event.respondWith(
		caches.match(event.request).then(function(response){
			return response || fetch(event.request);
		})
	);
});