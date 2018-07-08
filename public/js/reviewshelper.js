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
        keyPath: 'id'
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
   * Delete single review from IDB
   */
  static deleteReview(reviewId, element) {

    fetch(`${ReviewsHelper.DATABASE_URL}/${reviewId}`, {
        method: 'DELETE', // or 'PUT'
      }).then(res => res.json())
      .then((review) => {
        console.log(`Remove review ${review.id} from server`);
        const dbPromise = ReviewsHelper.openIDBDatabase();
        return dbPromise.then(db => {
          if (!db) return;

          const tx = db.transaction('mws-reviews', 'readwrite');
          const store = tx.objectStore('mws-reviews');

          element.remove();
          store.delete(review.id);
          console.log(`Remove review ${review.id} db entry`);
        })
      })
      .catch(error => console.error('Error:', error));
  }

  /**
   * Delete single offline review from IDB
   */
  static deleteOfflineReview(reviewId) {
    const dbPromise = ReviewsHelper.openIDBDatabase();
    return dbPromise.then(db => {
      if (!db) return;

      const tx = db.transaction('mws-reviews', 'readwrite');
      const store = tx.objectStore('mws-reviews');

      store.delete(reviewId);
      console.log(`Remove offline review ${reviewId} db entry`);
    }).catch(error => console.error('Error:', error));
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
          console.log('Got all reviews from db:', reviews);
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

  static setReviewSyncPending(review) {
    const syncPending = ReviewsHelper.getReviewsSyncPending();
    syncPending.push(review);
    localStorage.setItem('syncReviewsPending', JSON.stringify(syncPending));
  }

  static getReviewsSyncPending() {
    return JSON.parse(localStorage.getItem('syncReviewsPending')) || [];
  }

  static syncPendingReviews() {
    const pendingReviews = ReviewsHelper.getReviewsSyncPending();
    if (!pendingReviews || pendingReviews.length === 0)
      return;
    showToast('Syncing reviews...');
    Promise.all(pendingReviews.map(review => {
      const reviewId = review.id;
      delete review.id;
      return ReviewsHelper.postReview(review, (error, body) => {
        if (!error) {
          ReviewsHelper.deleteOfflineReview(reviewId);
          ReviewsHelper.storeReview(body);
        }
      });
    })).then(reviews => {
      console.log(`Synced ${reviews.length} review(s)`);
      localStorage.removeItem('syncReviewsPending');
      document.dispatchEvent(reviewsUpdatedEvent);
    }).catch(error => {
      console.log(error);
    })
  }

  static postReview(body, callback) {
    if (!navigator.onLine) {
      showToast('Review saved offline');
      body.id = Date.now();
      ReviewsHelper.setReviewSyncPending(body);
      callback(null, body);
    } else {
      fetch(ReviewsHelper.DATABASE_URL, {
          method: 'POST',
          body: JSON.stringify(body)
        })
        .then(res => res.json())
        .then(review => {
          callback(null, review);
        })
        .catch(error => {
          callback(error, null);
        });
    }
  }


}