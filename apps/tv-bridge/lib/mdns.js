var mdns = require('mdns'),
    Promise = require('es6-promise').Promise;

module.exports = function (config) {

  var ad = mdns.createAdvertisement(
    mdns.tcp('mediascape'),
    parseInt(config.port, 10),
    { name: config.instanceName }
  );

  return {
    advertise: function advertise() {
      ad.start();
      return Promise.resolve();
    },
    goodbye: function () {
      ad.stop();
      return Promise.resolve();
    },
    destroy: function () {
      delete ad;
      return Promise.resolve();
    }
  };
};
