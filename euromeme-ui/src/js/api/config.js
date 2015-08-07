var fetch = require('../util/fetch');

module.exports = {
  /*
    config()
    Fetches application config from a remote endpoint.
    The endpoint is /config.json
    Returns <Promise>
      Resolves: Parsed JSON object from server
      Rejects: Error message
  */
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
