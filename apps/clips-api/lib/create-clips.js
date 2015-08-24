var fs        = require('q-io/fs'),
    q         = require('q'),
    exec      = require('promised-exec'),
    tmpDir    = __dirname + '/../tmp/',
    mediaPath = process.env.MEDIA_PATH;

module.exports = function(params) {
  return validate(params)
    .then(nameClip)
    .then(createFolder)
    .then(createSubClip)
    .then(createGif)
    .then(moveToPublic)
    .then(null, console.warn);
};

function validate(params) {
  var validParams = {},
      reject = q.reject(new Error('Invalid Params'));

  params = params || {};

  if(typeof params != 'object') {
    return reject;
  }

  if(params.hasOwnProperty('start')) {
    validParams.start = new Date(Date.parse(params.start));
  } else {
    return reject;
  }

  if(params.hasOwnProperty('end')) {
    validParams.end = new Date(Date.parse(params.end));
  } else {
    return reject;
  }

  return q.resolve(validParams);
}

function nameClip(params) {
  params.name = Date.now() + '-gen';

  return q.resolve(params);
}

function createFolder(params) {
  var dirName = tmpDir + params.name + '/';

  params.tmpDir = dirName;

  return fs.makeTree(dirName).then(function(){ return params; });
}

function createSubClip(params) {
  var cmd = 'cd '+params.tmpDir;

  cmd += ' && touch '+params.name+'.mp4';

  return exec(cmd).then(function(output) { return params; });
}

function createGif(params) {
  var cmd = 'cd '+params.tmpDir;
  cmd += ' && touch '+params.name+'.gif';

  return exec(cmd).then(function(output) { return params; });
}

function moveToPublic(params) {
  var target = mediaPath + '/' + params.name + '/';

  return fs.move(params.tmpDir, target)
    .then(function() { return params; });
}
