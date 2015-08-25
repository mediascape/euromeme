var configApi = require('./config');

/*
  Returns IP address and port of the discovery app from the config API
*/
function configIpAndHost() {
  return configApi
    .config()
    .then(function (c) {
      if (!c.discoveryIp || !c.discoveryPort) {
        throw new Error('discoveryIp or discoveryPort not set in config');
      }
      return {
        address: c.discoveryIp,
        port: c.discoveryPort
      };
    });
}

/*
  Creates a WebSocket connection to the discovery app
*/
function connectToDiscoveryApp (updateFunction) {
  var devices = [];

  function addDevice(device) {
    devices = devices.filter(function(d) {
      return d.host !== device.host &&
             d.port !== device.port;
    });

    devices.push(device);
  }

  function removeDevice(device) {
    devices = devices.filter(function(device) {
      return device.host === data.host &&
             device.port === data.port;
    });
  }

  return function connectToDiscoveryApp (info) {
    var url = 'ws://' + info.address + ':' + info.port + '/discovery';

    console.log("Connecting to discovery app at url: " + url);

    var ws = new WebSocket(url);

    ws.addEventListener('error', function (err) {
      console.error('Discovery - connection error');
    });

    ws.addEventListener('message', function (evt) {
      console.log('Discovery - data', evt.data);

      var data;

      try {
        data = JSON.parse(evt.data);
      }
      catch (err) {
        console.error(evt.data);
        return;
      }

      switch (data.status) {
        case 'found':
          addDevice(data);
          break;

        case 'lost':
          removeDevice(data);
          break;

        default:
          console.error("Invalid message:", data);
          break;
      }

      console.log('Devices:', devices);

      updateFunction(devices);
    });

    return devices;
  };
}

module.exports = {

  /*
    discover()
    Discover available devices on the local network

    Returns: <Promise>
      Resolves: <Array> of items representing discovered devices
        name: display name of device
        type: DNS-SD service type, e.g., _mediascape._tcp
        host: IP address of device
        port: port API is available on
  */
  discover: function (updateFunction) {
    return configIpAndHost()
      .then(connectToDiscoveryApp(updateFunction));
  }
};
