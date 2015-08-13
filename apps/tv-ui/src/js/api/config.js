var fetch = require('../util/fetch');

module.exports = {
  config: function () {
    return fetch('/config.json')
      .then(function (response) {
        if (response.status >= 400) {
          throw new Error('Config not found');
        } else {
          return response.json();
        }
      });
  }
};
