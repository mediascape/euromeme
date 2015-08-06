var configApi = require('./api/config.js');
var Sync      = require('./sync.js');
var ws        = require('./relay.js');

function initVideoSync(config) {
  var video = document.getElementById('video');
  video.src = config.videoUrl;

  return Sync.init(video, config.appId, config.msvName, { debug: true });
}

configApi
  .config()
  .then(initVideoSync)
  .then(function(sync) {
    console.log(sync);
    // Start video from the beginning.
    sync.restart();
  },
  function(error) {
    console.error(error);
  });
