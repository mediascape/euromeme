module.exports = {
  connect: function (info) {
    return {
      ip: info.ip,
      port: info.port,
      name: info.name,
      status: function () {
        return Promise.resolve({});
      }
    };
  }
};
