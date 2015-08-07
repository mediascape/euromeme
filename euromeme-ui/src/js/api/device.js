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
    return {
      ip: info.ip,
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
              videoUrl: json.videoUrl
            };
          });
      }
    };
  }
};
