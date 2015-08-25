var fetch = require('../util/fetch');

const TIMEOUT_MS = 10 * 1000;

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
        var ws = new WebSocket('ws://' + info.address + ':' + info.port + '/');
        var statPromise = new Promise(function(resolve, reject) {
          ws.addEventListener('error', function (err) {
            console.log('Device - connection error');
            reject(err);
          });

          ws.addEventListener('open', function () {
            console.log('Device - connected');
            resolve();
          });
        });
        var statusTimeoutId;

        return statPromise
          .then(function() {
            return new Promise(function(resolve, reject) {
              ws.send(JSON.stringify({topic: 'status'}));

              statusTimeoutId = setTimeout(() => {
                console.log('Device - status() timeout');
                reject(new Error('Device - status() timeout'));
              }, TIMEOUT_MS);

              ws.addEventListener('message', function (evt) {
                console.log('Device - data', evt.data);

                clearTimeout(statusTimeoutId);
                statusTimeoutId = null;

                try {
                  var data = JSON.parse(evt.data);
                  resolve(data);
                } catch(err) {
                  resolve(evt.data);
                }
              });
            });
          })
          .then(function (json) {
            return {
              msvName: json.msvName,
              appId: json.appId,
              videoUrl: json.videoUrl,
              broadcastStartDate: json.broadcastStartDate
            };
          });
      }
    };
  }
};
