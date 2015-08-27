var fetch = require('../util/fetch'),
    isEqual = require('lodash/lang/isEqual'),
    reduce = require('lodash/collection/reduce'),
    EventEmitter = require('events').EventEmitter;

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
  var instance = {};
  /*
    Prefix each value in object with mediaStoreEndpoint
  */
  function addEndpointToObject(o) {
    return reduce(o, function (result, value, key) {
      result[key] = mediaStoreUrlTemplate.replace('$mediaPath', value);
      return result;
    }, {});
  }

  /*
    recent()
    Retrieves the most recent clips from the clip server

    Returns: <Promise>
      Resolves: array of clips
  */
  instance.recent = function () {
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
  };

  /*
    recentStream()
    Returns an EventEmitter that emits with a complete
    list if clips from the clips API
  */
  instance.recentStream = function () {
    var emitter = new EventEmitter(),
        cachedClips = [],
        intervalSec = 5 * 1000;

    function makeRequestAndCache() {
      instance.recent()
        .then(function (clips) {
          if ( !isEqual(cachedClips, clips) ) {
            cachedClips = clips;
            emitter.emit('data', cachedClips);
          }
        })
        .then(function () {
          setTimeout(makeRequestAndCache, intervalSec);
        })
        .catch(function () {
          console.error('Error fetching clips/latest');
          setTimeout(makeRequestAndCache, intervalSec);
        });
    }

    makeRequestAndCache();

    return emitter;
  };

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
  instance.create = function (clipStartTime, clipEndTime, broadcastStartTime) {
    console.log('Clip.create: ', clipStartTime, clipEndTime, broadcastStartTime);
    var start = clipStartTime.toISOString();
    return fetch(clipsApiEndpoint + '/clips', {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ start: start })
    });
  };

  return instance;
};
