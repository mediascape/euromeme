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
    return Promise.resolve([
      { name: 'Living room TV', ip: '192.168.0.1', port: '5001' },
      { name: 'Kitchen TV', ip: '192.168.0.1', port: '5001' }
    ]);
  }
};
