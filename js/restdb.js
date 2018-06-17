const dbPromise = idb.open('restaurants-db', 1, upgradeDb => {
	upgradeDb.createObjectStore('restaurants', {
		keyPath: 'id'
	});
});

var tx = db.transaction('restaurants', 'readwrite');
var store = tx.objectStore('restaurants');
messages.forEach(function(message){
	store.put(message);
})