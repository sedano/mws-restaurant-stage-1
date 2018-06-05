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
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Initialize IDB object store
   */
  static openIDBDatabase() {
    return idb.open('mws-db', 1, upgradeDB => {
      upgradeDB.createObjectStore('mws-db', { keyPath: 'id' });
      //Initialize database (done here to avoid duplicated readwrite operations)
      fetch(DBHelper.DATABASE_URL)
        .then(res => res.json())
        .then(restaurants => {
          DBHelper.storeRestaurants(restaurants);
        })
        .catch(error => {
          console.log(error);
        });
    });
  }

  /**
   * Return cached restaurants from IDB
   */
  static getCachedRestaurants() {
    const dbPromise = DBHelper.openIDBDatabase();
    return dbPromise.then(db => {
      if (!db) return;

      const tx = db.transaction('mws-db');
      const store = tx.objectStore('mws-db');

      return store.getAll();
    })
  }

  /**
   * Return cached restaurant by ID from IDB
   */
  static getCachedRestaurantsById(id) {
    const dbPromise = DBHelper.openIDBDatabase();
    return dbPromise.then(db => {
      if (!db) return;

      const tx = db.transaction('mws-db');
      const store = tx.objectStore('mws-db');
      return store.get(id);
    });
  }

  /**
   * Store all restaurants into IDB
   */
  static storeRestaurants(restaurants) {
    const dbPromise = DBHelper.openIDBDatabase();
    return dbPromise.then(db => {
      if (!db) return;

      const tx = db.transaction('mws-db', 'readwrite');
      const store = tx.objectStore('mws-db');

      restaurants.forEach(restaurant => {
        console.log(`Put ${restaurant.name} into db`);
        store.put(restaurant);
      });
    })
  }

  /**
   * Store single restaurant into IDB
   */
  static storeRestaurant(restaurant) {
    const dbPromise = DBHelper.openIDBDatabase();
    return dbPromise.then(db => {
      if (!db) return;

      const tx = db.transaction('mws-db', 'readwrite');
      const store = tx.objectStore('mws-db');

      console.log(`Update ${restaurant.name} db entry`);
      store.put(restaurant);
    })
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    DBHelper.getCachedRestaurants().then(restaurants => {
      //Try to get from IDB and return cached restaurants
      if (restaurants.length > 0) {
        console.log('Got restaurants from db:', restaurants);
        callback(null, restaurants);
      }

      //Fetch newest data from server
      fetch(DBHelper.DATABASE_URL)
        .then(res => res.json())
        .then(restaurants => {
          callback(null, restaurants);
        })
        .catch(error => {
          callback(error, null);
        });
    });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    //Try to get from IDB by ID and return cached restaurant
    DBHelper.getCachedRestaurantsById(Number(id)).then(restaurant => {
      if (restaurant) {
        console.log('Got restaurant from db:', restaurant);
        callback(null, restaurant);
      }

      //Fetch from server and update restaurant entry in IDB
      fetch(`${DBHelper.DATABASE_URL}/${id}`)
        .then(res => res.json())
        .then(restaurant => {
          DBHelper.storeRestaurant(restaurant);
          callback(null, restaurant);
        })
        .catch(error => {
          callback('Restaurant does not exist', null);
        });
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
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
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
    // Image fallback
    if (restaurant.photograph === undefined)
      return ('/img/10.jpg');
    return (`/img/${restaurant.photograph}.jpg`);
  }

  /**
   * Responsive restaurant image URL.
   */
  static responsiveImageUrlForRestaurant(restaurant) {
    // Image fallback
    if (restaurant.photograph === undefined)
      return ('/img/10-small.jpg');
    return (`/img/${restaurant.photograph}-small.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: null //google.maps.Animation.DROP
    }
    );
    return marker;
  }

}

// Check that service workers are registered
if ('serviceWorker' in navigator) {
  // Use the window load event to keep the page load performant
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}