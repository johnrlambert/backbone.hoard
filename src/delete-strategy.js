'use strict';

var Hoard = require('./backbone.hoard');
var Strategy = require('./strategy');
var _ = require('underscore');

// The Delete Strategy aggressively clears a cached item
var Delete = Strategy.extend({
  method: 'delete',

  sync: function (model, options) {
    var key = this.policy.getKey(model, this.method);
    var invalidatePromise = this.invalidate(key, options);
    var syncPromise = Hoard.sync(this.method, model, options);
    // if the cache is successfully cleared, we then return a promise
    // that will resolve with an array of all the arguments the orig
    // sync promise resolves with.
    return invalidatePromise.then(_.bind(function () {
      return this._wrapSyncResponsePromise(syncPromise);
    }, this));
  }
});

module.exports = Delete;
