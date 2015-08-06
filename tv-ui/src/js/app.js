var configApi = require('./api/config.js');
var ws = require('./relay.js');

configApi
  .config()
  .then(function(config) {
    console.log("config:", config);
  });
