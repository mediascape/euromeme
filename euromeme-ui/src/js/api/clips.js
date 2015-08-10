var fetch = require('../util/fetch'),
    config = require('./config'),
    Promise = require('es6-promise').Promise,
    times = require('lodash/utility/times'),
    partial = require('lodash/function/partial'),
    sample = require('lodash/collection/sample'),
    random = require('lodash/number/random');

function fakeClip(tmpl, clipNames, callCount) {
  var url = tmpl.replace(/\$name/g, sample(clipNames));
  return {
    poster: url.replace(/\$format/, 'jpg'),
    mp4: url.replace(/\$format/, 'mp4'),
    gif: url.replace(/\$format/, 'gif')
  };
}

function clips() {
  return config.config().then(function (c) {
    return c.randomClips;
  });
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
      return clips()
        .then(function (clipNames) {
          return Promise.resolve( times(8, partial(fakeClip, frameStoreTemplate, clipNames) ) );
        });
    }
  };
};
