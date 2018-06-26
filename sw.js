importScripts('idb/lib/idb.js');

self.addEventListener('install', function(event){
	event.waitUntil(
		caches.open('cacheRest').then(function(cache){
			return cache.addAll([
				'/',
				'/restaurant.html',
				/*'http://localhost:1337/restaurants',*/
				'css/styles.css',
				'img/1.jpg',
				'img/2.jpg',
				'img/3.jpg',
				'img/4.jpg',
				'img/5.jpg',
				'img/6.jpg',
				'img/7.jpg',
				'img/8.jpg',
				'img/9.jpg',
				'img/10.jpg',
				'img_mini/1.jpg',
				'img_mini/2.jpg',
				'img_mini/3.jpg',
				'img_mini/4.jpg',
				'img_mini/5.jpg',
				'img_mini/6.jpg',
				'img_mini/7.jpg',
				'img_mini/8.jpg',
				'img_mini/9.jpg',
				'img_mini/10.jpg',
				'img_half/1.jpg',
				'img_half/2.jpg',
				'img_half/3.jpg',
				'img_half/4.jpg',
				'img_half/5.jpg',
				'img_half/6.jpg',
				'img_half/7.jpg',
				'img_half/8.jpg',
				'img_half/9.jpg',
				'img_half/10.jpg',
				'js/dbhelper.js',
				'js/main.js',
				'js/restaurant_info.js',
				'js/restdb.js',
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

/*const dbPromise = idb.open('restaurants-db', 1, upgradeDB => {
	upgradeDB.createObjectStore('objs', {
		keyPath: 'id'
	});
});*/

//Fetch Event

/*self.addEventListener('fetch', (event) => {
const dbPromise = idb.open('restaurants-db', 1, upgradeDB => {
	upgradeDB.createObjectStore('objs', {
		keyPath: 'id'
	});
});
var requestUrl = new URL(event.request.url);

    if (requestUrl.origin !== location.origin) {
        //...

        if(event.request.url.endsWith('/restaurants')){
          event.respondWith(

              dbPromise.then((db) => {
                  var tx = db.transaction('objs', 'readonly');
                  var store = tx.objectStore('objs');
                  return store.getAll();
              }).then(function(items) {
                  return new Response(JSON.stringify(items),  { "status" : 200 , "statusText" : "MyCustomResponse!" })
              })

          )

        } 

        //...
    } else { 
    	event.respondWith(
		caches.match(event.request).then(function(response){
			return response;})
    	)
    }

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