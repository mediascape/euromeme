var fetch = require('../util/fetch'),
    reduce = require('lodash/collection/reduce');

/*
  constructor
  Creates an instance that connects to the Clips API.

  Params:
    frameStoreTemplate <String> Template to retrieve a single image
*/
module.exports = function (clipsApiEndpoint, mediaStoreUrlTemplate, imageSize) {

  /*
    Prefix each value in object with mediaStoreEndpoint
  */
  function addEndpointToObject(o) {
    return reduce(o, function (result, value, key) {
      var pathForSize = value.replace('$size', imageSize);
      result[key] = mediaStoreUrlTemplate.replace('$mediaPath', pathForSize);
      return result;
    }, {});
  }

  return {
    /*
      recent()
      Retrieves the most recent clips from the clip server

      Returns: <Promise>
        Resolves: array of clips
    */
    recent: function () {
      var url = clipsApiEndpoint + '/clips/latest';
      return fetch(url)
        .then(function (response) {
          return response.json();
        }, function () { throw new Error('Error fetching recent clips from API')})
        .then(function (clips) {
          return clips.map(addEndpointToObject);
        })
        .catch(function () {
          throw new Error('Error parsing recent clips from API');
        });
    }
  };
};
