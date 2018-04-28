/*var staticCacheName ='testCache'*/



self.addEventListener('install', function(event){
	event.waitUntil(
		caches.open('testRest').then(function(cache){
			return cache.addAll([
				'/',
				'data/restaurants.json',
				'css/styles.css',
				'img_half/'
				'img/'
				'img_mini/'
				'js/'
			]);
		})
	);	
});

/*self.addEventListener('activate', function(event){
	event.waitUntil(
		caches.keys().then(function(cacheNames){
			return Promise.all(
			  cacheNames.filter(function(cacheName){
				return cacheName.startsWith('restCache_') &&
					   cacheName != staticCacheName;
			  }).map(function(cacheName){
				return cache.delete(cacheName);
			  })
			);  
		})
	);
});*/


self.addEventListener('fetch', function(event){
	event.respondWith(
		caches.match(event.request).then(function(response){
			if (response) return response;
			return fetch(event.request);
		})
	);
});