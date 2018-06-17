/**
 * Common database helper functions.
 */
class ReviewsHelper {

  /**
   * Database URL.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/reviews`;
  }

  /**
   * Initialize IDB object store
   */
  static openIDBDatabase() {
    return idb.open('mws-reviews', 1, upgradeDB => {
      upgradeDB.createObjectStore('mws-reviews', {
        keyPath: ['id']
      });
      //Initialize database (done here to avoid duplicated readwrite operations)
      fetch(ReviewsHelper.DATABASE_URL)
        .then(res => res.json())
        .then(reviews => {
          ReviewsHelper.storeReviews(reviews);
        })
        .catch(error => {
          console.log(error);
        });
    });
  }

  /**
   * Return cached reviews from IDB
   */
  static getCachedReviews() {
    const dbPromise = ReviewsHelper.openIDBDatabase();
    return dbPromise.then(db => {
      if (!db) return;

      const tx = db.transaction('mws-reviews');
      const store = tx.objectStore('mws-reviews');

      return store.getAll();
    })
  }

  /**
   * Return cached review by ID from IDB
   */
  static getCachedReviewById(id) {
    const dbPromise = ReviewsHelper.openIDBDatabase();
    return dbPromise.then(db => {
      if (!db) return;

      const tx = db.transaction('mws-reviews');
      const store = tx.objectStore('mws-reviews');
      return store.get(id);
    });
  }

  /**
   * Store all reviews into IDB
   */
  static storeReviews(reviews) {
    const dbPromise = ReviewsHelper.openIDBDatabase();
    return dbPromise.then(db => {
      if (!db) return;

      const tx = db.transaction('mws-reviews', 'readwrite');
      const store = tx.objectStore('mws-reviews');

      reviews.forEach(review => {
        console.log(`Put review ${review.id} from ${review.name} into db`);
        store.put(review);
      });
    })
  }

  /**
   * Store single review into IDB
   */
  static storeReview(review) {
    const dbPromise = ReviewsHelper.openIDBDatabase();
    return dbPromise.then(db => {
      if (!db) return;

      const tx = db.transaction('mws-reviews', 'readwrite');
      const store = tx.objectStore('mws-reviews');

      console.log(`Update review ${review.id} from ${review.name} db entry`);
      store.put(review);
    })
  }

  /**
   * Fetch all reviews.
   */
  static fetchReviews(callback) {
    ReviewsHelper.getCachedReviews().then(reviews => {
      //Try to get from IDB and return cached restaurants
      if (reviews.length > 0) {
        console.log('Got reviews from db:', reviews);
        callback(null, restaurants);
      }

      //Fetch newest data from server
      fetch(ReviewsHelper.DATABASE_URL)
        .then(res => res.json())
        .then(reviews => {
          callback(null, reviews);
        })
        .catch(error => {
          callback(error, null);
        });
    });
  }

  /**
   * Fetch a review by its ID.
   */
  static fetchReviewById(id, callback) {
    //Try to get from IDB by ID and return cached restaurant
    ReviewsHelper.getCachedReviewById(Number(id)).then(review => {
      if (review) {
        console.log('Got review from db:', review);
        callback(null, review);
      }

      //Fetch from server and update restaurant entry in IDB
      fetch(`${ReviewsHelper.DATABASE_URL}/${id}`)
        .then(res => res.json())
        .then(review => {
          ReviewsHelper.storeReview(review);
          callback(null, review);
        })
        .catch(error => {
          callback('Review does not exist', null);
        });
    });
  }

  /**
   * Fetch reviews by restaurant id with proper error handling.
   */
  static fetchReviewsByRestaurantId
    (restaurant_id, callback) {
      ReviewsHelper.getCachedReviews().then(reviews => {
        //Try to get from IDB and return cached restaurants
        if (reviews.length > 0) {
          const results = reviews.filter(r => r.restaurant_id == restaurant_id);
          console.log('Got reviews from db:', results);
          callback(null, results);
        }

        //Fetch newest data from server
        fetch(`${ReviewsHelper.DATABASE_URL}/?restaurant_id=${restaurant_id}`)
          .then(res => res.json())
          .then(reviews => {
            console.log('Got reviews from server:', reviews);
            callback(null, reviews);
          })
          .catch(error => {
            callback(error, null);
          });
      });
    }
}