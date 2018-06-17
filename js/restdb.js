var dbPromise = idb.open('test-db', 1, function(upgradeDb){
	var keyValStore = upgradeDb.createObjectStore('kayval');
	keyValStore.put('world', 'hello');
});