let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchReviewsByRestId(id, (error, review) => {

      self.review = review;
      console.log(review);
      if (!review) {
        console.error(error);
        return;
      }
      fillReviewsHTML();
    });  
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
    

      
      //callback(null, review)
    
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.alt = restaurant.name
  
  var wid = screen.width;
  if (wid > 834) {
    image.src = DBHelper.imageUrlForRestaurant(restaurant);
  } else { 
    image.src = DBHelper.imageUrlForRestHalf(restaurant);
  }
  
  window.onresize = function () {
    if (window.innerWidth > 834) {
        image.src = DBHelper.imageUrlForRestaurant(restaurant);
    } else {
        image.src = DBHelper.imageUrlForRestHalf(restaurant);
    }
}
  
  

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.review) => {
  console.log("Estou a ir ao fillReviewsHTML");
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  //Date = Date.getUnixTime(review.createdAt);
  var d = new Date(review.createdAt);
  var dia = d.getDate();
  
  var month = new Array();
    month[0] = "January";
    month[1] = "February";
    month[2] = "March";
    month[3] = "April";
    month[4] = "May";
    month[5] = "June";
    month[6] = "July";
    month[7] = "August";
    month[8] = "September";
    month[9] = "October";
    month[10] = "November";
    month[11] = "December";
  var mes = month[d.getMonth()];
  var ano = d.getFullYear();
  date.innerHTML = `${mes} ${dia}, ${ano}`; //alterar a data
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}



/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Get the modal
var modal = document.getElementById('myModal');

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];


// When the user clicks on the button, open the modal 
btn.onclick = function() {
  //document.getElementById('rating').value='';
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}



/**
 * Store new review
 */
function addReview() {
  let restaurant_id = parseInt(getParameterByName('id'));
  let name = document.getElementById('reviewer').value;
  let d = new Date();
  let createdAt = d.getTime();
  let updatedAt = d.getTime();
  let rating =  parseInt(document.getElementById('rating').value);
  let comments = document.getElementById('comments').value;
  
  dbPromise.then(db => {
    return db.transaction('revs')
    .objectStore('revs').count();
  }).then(num => numero = num+1000);
  console.log(numero);
  let offline = 1;
  const newReview = {id: numero, restaurant_id: restaurant_id, name: name, createdAt: createdAt, updatedAt: updatedAt, rating: rating, comments: comments, offline: offline};
  console.log(newReview);
  modal.style.display = "none";
  document.getElementById('reviewer').value='';
  document.getElementById('rating').value='';
  document.getElementById('comments').value='';
  checkIfOnline();
  getReviewToDb = (newReview) => {
    console.log("meto ou não meto");
    dbPromise.then(db => {
      const tx = db.transaction('revs', 'readwrite');
      tx.objectStore('revs').put(newReview);
      return tx.complete;
    });
  };
  getReviewToDb(newReview);
  location.reload();
  SendReviewToServer();
  
}



  function checkIfOnline() {
    if(navigator.onLine) { // true|false
      console.log('online');
    } else {
      console.log('offline');
      alert ("Not connected - The new review wont be sent to the server until the connection is re-established");
    }
  }

window.addEventListener("online", onFunction);


function onFunction() {
    alert ("Your browser is working online.");
    SendReviewToServer();
}


var url = DBHelper.DATABASE_URL+"reviews";

//SendReviewToServer();

function SendReviewToServer() {
  dbPromise.then(function(db){
    const tx = db.transaction('revs', 'readonly');
    const store = tx.objectStore('revs');
    const index = store.index('offlineDB');
    return index.getAll()}).then(reviews => reviews.forEach(function(x){
      var idOf = x.id;
      delete x.offline;
      delete x.id;
      fetch(url, {
        method: 'POST', // or 'PUT'
        body: JSON.stringify(x), // data can be `string` or {object}!
        headers:{
          'Content-Type': 'application/json'
        }
      }).then(response => { 
        if (response.ok) {
          response.json();
          console.log(idOf);
          dbPromise.then(db => {
            const tx = db.transaction('revs', 'readwrite');
            tx.objectStore('revs').delete(idOf);
          return tx.complete;

        });  
        } else {
          return Promise.reject('something went wrong!')
        }
      })
      .catch(error => console.error('Error:', error))
      .then(response => console.log('Success:', response));
  }));
}

