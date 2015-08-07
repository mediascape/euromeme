var fetch = require('../util/fetch');

module.exports = {
  connect: function (info) {
    return {
      ip: info.ip,
      port: info.port,
      name: info.name,
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
