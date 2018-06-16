let restaurants,
  neighborhoods,
  cuisines
var map
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
  updateRestaurants();

  const mapContainer = document.getElementById('map-container')
  mapContainer.addEventListener('click', () => {
    document.getElementById('map').style.display = 'block';
    // This loads google maps api on demain, the callback must be defined manually and not on the url
    const script = document.createElement("script");
    script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyDFLEkTlKK34g2y6bk_f3XhCq-qgWbcmtw&amp;libraries=places"
    document.body.appendChild(script);
    script.onreadystatechange = initMap;
    script.onload = initMap;

  }, {
    once: true
  });

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
  google.maps.event.addListener(self.map, "tilesloaded", () => {
    setTimeout(() => {
      Array.prototype.slice.call(document.querySelectorAll('#map a, #map [role="button"], #map button, #map iframe, #map [tabindex="0"]')).forEach(item => {
        item.setAttribute('tabindex', '-1');
      });
    }, 200);
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
  lazyLoadImages();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  // const picture = document.createElement('picture');
  // const source = document.createElement('source');
  const image = document.createElement('img');
  // source.setAttribute('media', '(min-width:500)');
  // source.setAttribute('srcset', DBHelper.responsiveImageUrlForRestaurant(restaurant));
  const imageSrc = DBHelper.imageUrlForRestaurant(restaurant);
  image.className = 'restaurant-img lazy';
  image.src = 'img/placeholder.gif'
  image.setAttribute('data-src', imageSrc);
  image.setAttribute('alt', `Picture of the restaurant: ${restaurant.name}`);
  image.setAttribute('data-srcset', `${DBHelper.responsiveImageUrlForRestaurant(restaurant)} 400w, ${imageSrc} 800w`)
  // image.setAttribute('sizes', '(max-width: 400px) 360px, 800px')
  // picture.append(source);
  // picture.append(image);
  li.append(image);

  const checkbox = document.createElement('input');
  checkbox.className = 'star';
  checkbox.setAttribute('type', 'checkbox');
  (restaurant.is_favorite === 'true') ? checkbox.setAttribute('checked', true): null;
  checkbox.addEventListener('change', (e) => {
    DBHelper.setFavoriteRestaurantById(restaurant.id, e.target.checked);
  });

  const div = document.createElement('div');
  const name = document.createElement('h3');
  name.innerHTML = restaurant.name;
  div.append(name);
  div.append(checkbox);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  div.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  div.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  div.append(more);

  li.append(div);

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  let markerString = "";
  restaurants.forEach(restaurant => {
    // Add marker to the map if initialized
    if (self.map) {
      const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
      google.maps.event.addListener(marker, 'click', () => {
        window.location.href = marker.url
      });
      self.markers.push(marker);
    }
    markerString += getStaticMarkerString(restaurant);

  });
  if (markerString) {
    const zoom = window.innerWidth > 1023 ? 11 : 13;
    const scale = window.innerWidth > 1023 ? 2 : 1;
    const imageUrl = `url("https://maps.googleapis.com/maps/api/staticmap?center=40.7222216,-73.987501&zoom=${zoom}&size=640x640&scale=${scale}${markerString}&format=jpg&maptype=roadmap&key=AIzaSyDFLEkTlKK34g2y6bk_f3XhCq-qgWbcmtw")`
    document.getElementById('map-container').style.backgroundImage = imageUrl;

  }
}

getStaticMarkerString = (restaurant) => {
  return `&markers=color:red%7C${restaurant.latlng.lat},${restaurant.latlng.lng}`
};

/**
 * Lazy loading images using intersection observer
 * https://developers.google.com/web/fundamentals/performance/lazy-loading-guidance/images-and-video/
 */

lazyLoadImages = () => {
  const lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));

  if ("IntersectionObserver" in window) {
    let lazyImageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          let lazyImage = entry.target;
          lazyImage.src = lazyImage.dataset.src;
          lazyImage.srcset = lazyImage.dataset.srcset;
          lazyImage.classList.remove("lazy");
          lazyImageObserver.unobserve(lazyImage);
        }
      });
    });

    lazyImages.forEach(function (lazyImage) {
      lazyImageObserver.observe(lazyImage);
    });
  } else {
    // Possibly fall back to a more compatible method here
  }
}