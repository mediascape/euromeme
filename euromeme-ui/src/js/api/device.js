var fetch = require('../util/fetch');

module.exports = {
  /*
    connect()
    Connects to a remote device.

    Params:
      info <Object>
      info.ip   <String> IP address of device
      info.port <String> Port of device
      info.name <String> Human-readable name of device
    Returns: <Object>
      instance of API object connect to remote device
  */
  connect: function (info) {
    if (!info.address || !info.port) {
      throw new Error('Cannot connect to device without address and ip');
    }

    var ws = new WebSocket('ws://' + info.address + ':' + info.port + '/');
    ws.addEventListener('error', function () {
      console.error('Device - connection error');
    });
    ws.addEventListener('connect', function () {
      console.log('Device - connected');
    });
    ws.addEventListener('data', function (evt) {
      console.log('Device - data', evt.data);
    });

    return {
      address: info.address,
      port: info.port,
      name: info.name,
      /*
        status()
        Get status of connected device.

        Returns: <Promise>
          Resolves <Object> status info
            status.videoUrl - current playing video URL
      */
      status: function () {
        return fetch('/config.json')
          .then(function (response) {
            return response.json();
          })
          .then(function (json) {
            return {
              msvName: json.msvName,
              appId: json.appId,
              videoUrl: json.videoUrl
            };
          });
      }
    };
  }
};
