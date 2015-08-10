var configApi = require('./config');

/*
  Returns dummy IP address and port from config API
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

module.exports = {
  /*
    discover()
    Discover available devices on the local network

    Returns: <Promise>
      Resolves: <Array> of items representing discovered devices
        name: display name of device
        ip  : IP address of device
        port: port API is available on
  */
  discover: function () {
    return configIpAndHost()
      .then(function (info) {
        return [
          {
            host: 'Kitchen TV',
            address: info.address,
            port: info.port,
            serviceName: "Kitchen TV._mediascape-ws._tcp.local",
            serviceType: "_mediascape-ws._tcp.local"
          }
        ];
      });
  }
};
