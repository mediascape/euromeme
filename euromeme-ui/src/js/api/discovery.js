module.exports = {
  discover: function () {
    return Promise.resolve([
      { name: 'Living room TV', ip: '192.168.0.1', port: '5001' },
      { name: 'Kitchen TV', ip: '192.168.0.1', port: '5001' }
    ]);
  }
};
