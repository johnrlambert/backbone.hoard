'use strict';

var _ = require('underscore');
var Hoard = require('./backbone.hoard');
var Strategy = require('./strategy');

// A strategy for caching a successful response. Subclasses declare a sync method to adhere use
module.exports = Strategy.extend({
  // Cache the response.
  // If cacheOptions.generateKeyFromResponse is true,
  // cache using the key from the response, rather than the request
  sync: function (model, options) {
    // Don't consider the sync 'complete' until storage is also complete
    // This ensures that the cache is in sync with the server
    var storeComplete = Hoard.defer();
    var cacheOptions = _.extend({
      onStoreSuccess: storeComplete.resolve,
      onStoreError: storeComplete.reject
    }, options, this.cacheOptions(model, options));

    options.success = this._wrapSuccessWithCache(this.method, model, cacheOptions);
    var syncPromise = Hoard.sync(this.method, model, options);
    // if the store action is successful, we then return a promise
    // that will resolve with an array of all the arguments the orig
    // sync promise resolves with.
    return storeComplete.promise.then(_.bind(function () {
      return this._wrapSyncResponsePromise(syncPromise);
    }, this));
  },

  cacheOptions: function (model, options) {}
});
