

const dbPromise = idb.open('restaurants-db', 1, upgradeDB => {
	upgradeDB.createObjectStore('objs', {
		keyPath: 'id'
	});
});




/*let rests = function () {
	let xhr = new XMLHttpRequest();
	xhr.open('GET', DBHelper.DATABASE_URL);
	xhr.onload = function () {
		const abc = JSON.parse(xhr.responseText);
		console.log(abc);
	};
	xhr.send();
	return abc;
};

console.log(rests);*/




/*const rests = JSON.parse(DBHelper.DATABASE_URL);
console.log(rests);*/

dbPromise.then(function(db) {
  
  let xhr = new XMLHttpRequest();
  xhr.open('GET', DBHelper.DATABASE_URL);
  xhr.onload = function () {
	const rests = JSON.parse(xhr.responseText);
	/*console.log(rests);*/
	  const tx = db.transaction('objs', 'readwrite');
  	const store = tx.objectStore('objs')
  	rests.forEach(function(rest) {
    	store.put(rest);
  	});
  };
  xhr.send();

  /*const tx = db.transaction('objs', 'readwrite');
  const store = tx.objectStore('objs')
  rests.forEach(function(rest) {
    store.put(rest);
  });*/
  return tx.complete;
});


/*const rest = JSON.parse(xhr.responseText);
console.log(rest);


/*Object.keys(data/restaurants.json).forEach(function(restaurant){
	console.log(restaurant)
})
rest.forEach(function(restaurant) {
    	console.log(restaurant);
});*/

/*dbPromise.then(db => {
  const tx = db.transaction('objs', 'readwrite');
  tx.objectStore('objs').put({
  	restaurants.forEach(restaurant => {
    	store.put(restaurant);
    });
   });
    id: 123456,
    data: {foo: "bar"}
  return tx.complete;
});


/*var tx = db.transaction('restaurants', 'readwrite');
var store = tx.objectStore('restaurants');
messages.forEach(function(message){
	store.put(message);
})*/