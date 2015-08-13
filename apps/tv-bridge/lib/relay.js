var WebSocket = require('faye-websocket'),
    http      = require('http'),
    reject    = require('lodash/collection/reject'),
    without   = require('lodash/array/without');

module.exports = function (config) {
  var server = http.createServer(),
      connections = [];

  // Send to everyone except sender
  function broadcastMessageFrom(sender, data) {
    var sockets = reject(connections, function (c) { return c === sender; });
    console.log('Broadcast to %s of %s connections', sockets.length, connections.length);
    sockets.forEach(function (s) {
      s.send(data);
    });
  }

  server.on('upgrade', function(request, socket, body) {
    if (WebSocket.isWebSocket(request)) {
      var ws = new WebSocket(request, socket, body);

      // Keep track of new WebSocket connection
      connections.push(ws);

      ws.on('message', function(event) {
        console.log('New message', event.data);
        broadcastMessageFrom(ws, event.data);
      });

      // Remove from connections
      ws.on('close', function(event) {
        console.log('close', event.code, event.reason);
        connections = without(connections, ws);
        ws = null;
      });
    }
  });

  console.log('Listening on port', config.port);
  server.listen(config.port);
}
