'use strict';

var Promise = require('es6-promise').Promise;

/**
 * Simple wrapper for a MediaScape shared motion object (Media State Vector)
 * @class
 */

function Sync(msv) {
  this._msv = msv;
}

Sync.prototype.restart = function() {
  this._msv.update(0, 1);
};

Sync.prototype.play = function() {
  this._msv.update(null, 1);
};

Sync.prototype.pause = function() {
  this._msv.update(null, 0);
};

Sync.prototype.position = function(newPos) {
  if (typeof newPos === 'number') {
    this._msv.update(newPos, 1);
  } else {
    return this._msv.query().pos;
  }
};

/**
 * Initialises synchronisation between an HTML media element and a
 * MediaScape shared motion.
 *
 * @param {HTMLMediaElement} mediaElement A video or audio HTML element.
 * @param {string} appId Application ID, for accessing the MCorp APIs.
 * @param {string} msvName The name of the MediaScape shared motion to use.
 * @param {Object} options Optional options object.
 * @param {Boolean} options.debug If true, write debug output to the console.
 */

function init(mediaElement, appId, msvName, options) {
  options = options || {};

  return new Promise(function(resolve, reject) {
    var app = MCorp.app(appId, { anon: true });

    app.run = function() {
      var msv = app.msvs[msvName];
      var mediaSyncOptions = {
        remember: false
      };

      if (!msv) {
        reject(new Error('Sync initialisation failed, unknown MSV: ' + msvName));
        return;
      }

      if (options.debug === true) {
        mediaSyncOptions.debug = true;
      }

      app.sync = mediascape.mediaSync(mediaElement, msv, mediaSyncOptions);

      resolve(new Sync(msv));
    };

    app.init();
  });
}

module.exports = { init: init };
