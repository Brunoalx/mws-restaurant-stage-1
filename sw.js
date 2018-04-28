self.addEventListener('install', function(event){
	event.waitUntil(
		caches.open('cacheRest').then(function(cache){
			return cache.addAll([
				'/',
				'data/restaurants.json',
				'css/styles.css',
				'img/.jpg',
				'img_mini/.jpg',
				'img_half/.jpg',
				'js/.js'
			]);
		})
	);	
});

self.addEventListener('fetch', function(event){
	event.respondWith(
		caches.match(event.request).then(function(response){
			if (response) return response;
			return fetch(event.request);
		})
	);
});

/*self.addEventListener('fetch', function(event) {
  if (event.request.url.indexOf('https://maps.googleapi.com/js') == 0) {
    event.respondWith(
      // Handle Maps API requests in a generic fashion,
      // by returning a Promise that resolves to a Response.
    );
  } else {
    event.respondWith(
      // Some default handling.
    );
  }
}*/