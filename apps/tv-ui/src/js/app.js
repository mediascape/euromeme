'use strict';

var configApi = require('./api/config.js');
var Sync      = require('./sync.js');
var Relay     = require('./relay.js');

configApi
  .config()
  .then(initRelay)
  .then(initVideoSync)
  .then(function(sync) {
    console.log(sync);
    // Start video from the beginning.
    sync.restart();
  },
  function(error) {
    console.error(error);
  });

function initRelay(config) {
  var relay = Relay.create(config);

  return config;
}

function initVideoSync(config) {
  var video = document.getElementById('video');
  video.src = config.videoUrl;

  return Sync.init(video, config.appId, config.msvName, { debug: true });
}
