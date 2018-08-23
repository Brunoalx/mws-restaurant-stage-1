/*DB open*/
const dbPromise = idb.open('restaurants-db', 2, upgradeDB => {
  switch (upgradeDB.oldVersion) {
    case 0:
      upgradeDB.createObjectStore('objs', {
        keyPath: 'id'
      });
    case 1:
      const reviewsDB = upgradeDB.createObjectStore('revs', {
        keyPath: 'id'
      });
      reviewsDB.createIndex('restaurantRev', 'restaurant_id')
      reviewsDB.createIndex('offlineDB', 'offline', {unique: false});
  }
});


/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/`;
  }

  static fetchReviews (id, callback){
    dbPromise.then(db => {
      const tx = db.transaction('revs', 'readonly');
      const store = tx.objectStore('revs');
      const index = store.index('restaurantRev');
      var myId = parseInt(id);
      return index.count(myId)
      }).then(rev => {
        
        
        if (navigator.onLine === true ){//(rev === 0) { //Faz de conta que está sempre vazia. Reverter para === depois.
          

          let xhr = new XMLHttpRequest();
          xhr.open('GET', DBHelper.DATABASE_URL+"reviews/?restaurant_id="+id); //   /?restaurant_id="+id
          xhr.onload = () => {
            if (xhr.status === 200) { // Got a success response from server!
              const reviews = JSON.parse(xhr.responseText);
              /*DB add data*/
              dbPromise.then(function(db) {
                const tx = db.transaction('revs', 'readwrite');
                const store = tx.objectStore('revs')
                reviews.forEach(function(review) {
                  store.put(review);
                });
              return tx.complete;
              }); 
              //console.log(reviews);
              callback(null, reviews);
            } else { // Oops!. Got an error from server.
              const error = (`Request failed. Returned status of ${xhr.status}`);
              callback(error, null);
            }
          };
          xhr.send();
        } else {
          
          dbPromise.then(function(db){
            const tx = db.transaction('revs', 'readonly');
            const store = tx.objectStore('revs');
            return store.getAll().then(reviews => {callback(null, reviews)});  //???
          });
        };
      })

  };

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    dbPromise.then(db => {
      const tx = db.transaction('objs', 'readonly');
      const store = tx.objectStore('objs');
      return store.count()
      }).then(obj => {
        
        if (obj === 0) { 
          

          let xhr = new XMLHttpRequest();
          xhr.open('GET', DBHelper.DATABASE_URL +"restaurants/");
          xhr.onload = () => {
            if (xhr.status === 200) { // Got a success response from server!
              const restaurants = JSON.parse(xhr.responseText);

              /*DB add data*/
              dbPromise.then(function(db) {
                const tx = db.transaction('objs', 'readwrite');
                const store = tx.objectStore('objs')
                restaurants.forEach(function(restaurant) {
                  store.put(restaurant);
                });
                return tx.complete;

              }); 
              
              callback(null, restaurants);
            } else { // Oops!. Got an error from server.
              const error = (`Request failed. Returned status of ${xhr.status}`);
              callback(error, null);
            }
          };
          xhr.send();
        } else {
          
          dbPromise.then(function(db){
            const tx = db.transaction('objs', 'readonly');
            const store = tx.objectStore('objs');
            return store.getAll().then(restaurants => {callback(null, restaurants)});  
          });
        };
      })
  }

    /**
   * Fetch a reviews by Rest ID.
   */
  static fetchReviewsByRestId(id, callback) {
    //console.log(id);
    // fetch all reviews with proper error handling.
    DBHelper.fetchReviews(id, (error, reviews) => {
      if (error) {
        callback(error, null);
      } else {
        const review = reviews.filter(r => r.restaurant_id == id);
        
        if (review) { // Got the review
          //console.log(review);
          callback(null, review);
        } else { // Restaurant does not exist in the database
          callback('No Reviews', null);
        }
      }
    });
  }

  
  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          //console.log(restaurant);
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.id}.webp`);
  }
  static imageUrlForRestMini(restaurant) {
    return (`/img_mini/${restaurant.id}.webp`);
  }

  static imageUrlForRestHalf(restaurant) {
    return (`/img_half/${restaurant.id}.webp`);
  }
  
  static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  } 
    
}