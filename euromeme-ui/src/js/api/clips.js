var fetch = require('../util/fetch'),
    Promise = require('es6-promise').Promise,
    times = require('lodash/utility/times'),
    partial = require('lodash/function/partial'),
    random = require('lodash/number/random');

function randMin() {
  return random(10, 59).toString();
}

function fakeClip(tmpl, callCount) {
  return {
    poster: tmpl.replace('$minute', randMin()).replace('$second', '00').replace('$frame', '1')
  };
}

module.exports = function (frameStoreTemplate) {
  return {
    popular: function () {
      return Promise.resolve( times(8, partial(fakeClip, frameStoreTemplate) ) );
    }
  };
};
