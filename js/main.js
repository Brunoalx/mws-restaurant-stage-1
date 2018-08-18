let restaurants,
  neighborhoods,
  cuisines
var map
var markers = []


/*const observer = lozad(); // lazy loads elements with default selector as '.lozad'
observer.observe();*/


/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  const image = document.createElement('img');
  image.className = 'restaurant-img lazyload';
  const v = DBHelper.imageUrlForRestMini(restaurant);
  image.setAttribute("data-src", 'http://localhost:8000/'+v);
  image.alt = restaurant.name;
  li.append(image);

  
  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);

  const is_favorite = document.createElement('button');
  favoriteRestChange(restaurant, is_favorite);
  is_favorite.onclick = () => {
    //let fav = !restaurant.is_favorite;
    restaurant.is_favorite = ! restaurant.is_favorite;
    changeFavoriteStatusInDbAndServer(restaurant.id, restaurant.is_favorite);
    //restaurant.is_favorite = ! restaurant.is_favorite;
    favoriteRestChange(restaurant, is_favorite);
  };
  li.append(is_favorite);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more)

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}

/**
 * Change Favorite status on server and indexedDb
 */
changeFavoriteStatusInDbAndServer = (restId, isFav) => {
  dbPromise.then(db => {
    const tx = db.transaction('objs', 'readwrite');
    const store = tx.objectStore('objs');//.delete(idOf);
    store.get(restId).then(rest => {
      rest.is_favorite = isFav;
      store.put(rest);
    })
  return tx.complete;
  });
  url = `http://localhost:1337/restaurants/${restId}/?is_favorite=${isFav}`
  fetch(url,{
    method: 'PUT'
  })
}

/**
 * Favorite change Button
 */
favoriteRestChange = (restaurant, is_favorite) => {
if (String(restaurant.is_favorite) === "true"){
    is_favorite.innerHTML = "&#x2605 Favorite";
    is_favorite.setAttribute('aria-label', 'unmark as favorite')
  } else {
    is_favorite.innerHTML = "&#x2605";
    is_favorite.setAttribute('aria-label', 'mark as favorite')
  }  
}