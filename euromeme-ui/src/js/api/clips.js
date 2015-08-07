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

/*
  constructor
  Creates an instance that connects to the Clips API.

  Params:
    frameStoreTemplate <String> Template to retrieve a single image
*/
module.exports = function (frameStoreTemplate) {
  return {
    /*
      recent()
      Retrieves the most recent clips from the clip server

      Returns: <Promise>
        Resolves: array of clips
    */
    recent: function () {
      return Promise.resolve( times(8, partial(fakeClip, frameStoreTemplate) ) );
    }
  };
};
