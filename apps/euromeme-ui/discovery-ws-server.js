var mdns      = require('mdns'),
    lodash    = require('lodash'),
    WebSocket = require('faye-websocket');

module.exports.start = function (server) {
  var services    = [],
      connections = [];

  function broadcast(status, services, connections) {
    connections.forEach(function (connection) {
      services.forEach(function (service) {
        console.log('service', service);
        var obj = lodash.merge({ status: status }, {
                  host: service.host,
                  port: service.port,
                  name: service.name,
                  fullname: service.fullname
                }),
            msg = JSON.stringify(obj);
        console.log('Sending', msg);
        connection.send(msg);
      });
    });
  }

  var browser = mdns.createBrowser(mdns.tcp('mediascape'));
  server.on('upgrade', function (request, socket, body) {
    if (WebSocket.isWebSocket(request)) {
      var ws = new WebSocket(request, socket, body);

      connections.push(ws);
      console.log('There are now %s connections', connections.length);

      broadcast('found', services, [ws]);

      ws.on('close', function(event) {
        console.log('close', event.code, event.reason);
        connections = lodash.reject(connections, function (c) { c === ws; });
        console.log('There are now %s connections', connections.length);
        ws = null;
      });
    }
  });

  browser.on('serviceUp', function(service) {
    console.log('Service up:', services.length, service.fullname);
    services.push(service);
    console.log('There are now %s services', services.length);
    broadcast('found', [service], connections);
  });
  browser.on('serviceDown', function(service) {
    console.log('Service down:', services.length, service);
    services = lodash.reject(services, { name: service.name });
    console.log('There are now %s services', services.length);
    broadcast('lost', [service], connections);
  });
  browser.start();

}
