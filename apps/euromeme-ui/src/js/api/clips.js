var fetch = require('../util/fetch'),
    reduce = require('lodash/collection/reduce');

/*
  constructor
  Creates an instance that connects to the Clips API.

  Params:
    clipsApiEndpoint      <String>  Endpoint for the clips API
    mediaStoreUrlTemplate <String>  Template to access the media asset store.
                                    Should contain the $mediaPath template tag
                                    that is replaced with the clip path.
*/
module.exports = function (clipsApiEndpoint, mediaStoreUrlTemplate) {

  /*
    Prefix each value in object with mediaStoreEndpoint
  */
  function addEndpointToObject(o) {
    return reduce(o, function (result, value, key) {
      result[key] = mediaStoreUrlTemplate.replace('$mediaPath', value);
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
    },
    /*
      create()
      Request a clip

      clipStartTime <Date> Clip start time
      clipEndTime   <Date> Clip end time
      broadcastStartTime <Date> Start time of broadcast

      Returns: <Promise>
        Resolves: on successful clip creation
        Rejects:  if API call fails
    */
    create: function (clipStartTime, clipEndTime, broadcastStartTime) {
      console.log('Clip.create: ', clipStartTime, clipEndTime, broadcastStartTime);
      return Promise.resolve();
    }
  };
};
