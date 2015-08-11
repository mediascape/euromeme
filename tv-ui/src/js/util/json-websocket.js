'use strict';

var $EventTarget = require('oo-eventtarget');

/**
 * A websocket client that automatically translates sent and received messages
 * to/from JSON format.
 *
 * @class
 *
 * @param {string} url The websocket URL to connect to.
 */

function JsonWebSocket(url) {
  $EventTarget(this);

  this._ws = new WebSocket(url);
  this._ws.addEventListener('open', this._handleOpen.bind(this));
  this._ws.addEventListener('error', this._handleError.bind(this));
  this._ws.addEventListener('message', this._handleMessage.bind(this));

  return this;
}

/**
 * Sends an object in JSON format over the websocket connection.
 *
 * @param obj The data to send.
 */

JsonWebSocket.prototype.send = function(obj) {
  var json = JSON.stringify(obj);

  if (json) {
    return this._ws.send(json);
  }
  else {
    console.error('JsonWebSocket.send, invalid object:', obj);
  }
};

/**
 * Received message handler. Decodes the message data as JSON and, if
 * successful, raises a <code>message</code> event with the decoded data.
 *
 * @private
 */

JsonWebSocket.prototype._handleMessage = function(evt) {
  if (!evt || !evt.data) {
    console.error('JsonWebSocket._handleMessage, unexpected event:', evt);
    return;
  }

  try {
    var data = JSON.parse(evt.data);
    this.dispatchEvent('message', data);
  }
  catch (e) {
    if (e instanceof SyntaxError) {
      console.error('JsonWebSocket._handleMessage, received invalid JSON:', evt.data);
    }
    else {
      throw e;
    }
  }
};

/**
 * Connection opened handler. Raises an <code>open</code> event.
 *
 * @private
 */

JsonWebSocket.prototype._handleOpen = function() {
  this.dispatchEvent('open');
};

/**
 * Error handler. Raises an <code>error</code> event with the error.
 *
 * @private
 */

JsonWebSocket.prototype._handleError = function(err) {
  this.dispatchEvent('error', err);
};

module.exports = JsonWebSocket;
