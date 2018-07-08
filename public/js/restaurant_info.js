const reviewsUpdatedEvent = new Event('reviewsUpdated');
let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
loadRestaurant = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      const mapContainer = document.getElementById('map-container');
      mapContainer.style.backgroundImage = `url("https://maps.googleapis.com/maps/api/staticmap?center=${restaurant.latlng.lat},${restaurant.latlng.lng}&markers=${restaurant.latlng.lat},${restaurant.latlng.lng}&zoom=16&size=640x640&scale=2&format=jpg&maptype=roadmap&key=AIzaSyDFLEkTlKK34g2y6bk_f3XhCq-qgWbcmtw")`
      fillBreadcrumb();

      // if maps api library is not loading skip intialization
      if (!window.google)
        return;
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
      google.maps.event.addListener(self.map, "tilesloaded", () => {
        setTimeout(() => {
          Array.prototype.slice.call(document.querySelectorAll('#map *')).forEach(item => {
            item.setAttribute('tabindex', '-1');
          });
        }, 250);
      });
    }
  });
};


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
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      if (!restaurant) {
        console.error(error);
        return;
      }
      self.restaurant = restaurant;
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const checkbox = document.getElementById('restaurant-favorite');
  (restaurant.is_favorite === 'true') ? checkbox.setAttribute('checked', true): null;
  checkbox.addEventListener('change', (e) => {
    DBHelper.setFavoriteRestaurantById(restaurant.id, e.target.checked);
  });

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.setAttribute('alt', `Picture of the restaurant: ${restaurant.name}`);
  image.setAttribute('srcset', `${DBHelper.responsiveImageUrlForRestaurant(restaurant)} 400w, ${image.src} 800w`)


  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  ReviewsHelper.fetchReviewsByRestaurantId(restaurant.id, (error, reviews) => {
    if (!reviews) {
      console.error(error);
      return;
    }
    self.restaurant.reviews = reviews;
    fillReviewsHTML();
  });
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
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  const list = document.createElement('ul');

  title.innerHTML = 'Reviews';
  list.id = 'reviews-list'

  container.innerHTML = '';
  container.appendChild(title);
  container.appendChild(list);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.prepend(createReviewHTML(review));
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
  if (review.updatedAt)
    date.innerHTML = (new Date(review.updatedAt).toDateString());
  else date.innerHTML = 'Not yet published online'
  li.appendChild(date);

  const rating = createStarRating(review.rating);
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  // const deleteBtn = document.createElement('button');
  // deleteBtn.innerHTML = 'Delete';
  // deleteBtn.addEventListener('click', () => {
  //   ReviewsHelper.deleteReview(review.id, li)
  // });

  // li.prepend(deleteBtn);

  return li;
}

/**
 * Create a star rating
 */
createStarRating = (rating) => {
  const p = document.createElement('p');
  p.className = 'stars';
  for (let i = 0; i < 5; i++) {
    const span = document.createElement('span');
    if (i < rating) {
      span.className = 'checked';
    }
    span.innerHTML = String.fromCharCode('0x2605');
    p.appendChild(span);
  }
  return p;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  if (breadcrumb.childElementCount < 2) {
    breadcrumb.appendChild(li);
  }
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

/**
 * Post a review
 */
postReview = (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const id = Number(getParameterByName('id'));
  const body = {
    'restaurant_id': id,
    'name': formData.get('name'),
    'rating': Number(formData.get('rating')),
    'comments': formData.get('comments')
  }

  ReviewsHelper.postReview(body, (error, review) => {
    if (!error) {
      ReviewsHelper.storeReview(review);
      const ul = document.getElementById('reviews-list');
      ul.prepend(createReviewHTML(review));
      e.target.reset();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadRestaurant(); //Loads restaurant without interactive map
  const mapContainer = document.getElementById('map-container');
  const reviewForm = document.getElementById('review-form');

  reviewForm.addEventListener('submit', postReview);

  mapContainer.addEventListener('click', () => {
    document.getElementById('map').style.display = 'block';
    // This loads google maps api on demain, the callback must be defined manually and not on the url
    const script = document.createElement("script");
    script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyDFLEkTlKK34g2y6bk_f3XhCq-qgWbcmtw&amp;libraries=places"
    document.body.appendChild(script);
    script.onreadystatechange = loadRestaurant;
    script.onload = loadRestaurant;
  }, {
    once: true
  });
});

document.addEventListener('reviewsUpdated', () => {
  showToast('Reviews uploaded succesfully, reloading...');
  setTimeout(() => {
    location.reload();
  }, 1500);
});