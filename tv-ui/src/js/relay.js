'use strict';

var JsonWebSocket = require('./util/json-websocket'),
    Promise = require('es6-promise').Promise;

module.exports.create = function(config) {
  var ws, uri, ready, instance = {};

  uri = config.relayURI || 'ws://localhost:5001/relay';
  ws  = new JsonWebSocket(uri);

  ready = new Promise(function(resolve, reject) {
    ws.addEventListener('open', function() {
      console.log('Websocket open');
      resolve();
    });

    ws.addEventListener('error', function(err) {
      console.error('Websocket error', err.stack);
      reject(err);
    });
  });

  ws.addEventListener('message', function(evt) {
    console.info('message', evt);
    instance.handleMessage(evt.data);
  });

  instance.send = function(topic, data) {
    return ready.then(function() {
      data = data || {};

      data.topic = topic;

      return ws.send(data);
    });
  };

  instance.handleMessage = function(msg) {
    msg = msg || {};

    switch(msg.topic) {
      case 'status':
        instance.send('status', config);
        break;
      default:
        console.warn('Unknown topic ' + msg.topic);
    }
  };

  return instance;
};
