var fs         = require('q-io/fs'),
    q          = require('q'),
    exec       = require('promised-exec'),
    path       = require('path'),
    tmpDir     = path.join(__dirname, '..', 'tmp'),
    txTime     = new Date(Date.UTC(2015, 4, 23, 20)),//UTC+1
    imgSizes   = [180],
    mediaPath  = process.env.MEDIA_PATH || '',
    sourceFile = path.join(mediaPath, 'eurovision-2015.120.720.mp4');

module.exports.validate = function(params) {
  return validate(params).then(nameClip);
};

module.exports.create = function(params) {
  return createFolder(params)
    .then(createSubClip)
    .then(createGif)
    .then(fetchPoster)
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

  return q.resolve(validParams);
}

function nameClip(params) {
  params.id = Date.now() + '-gen';

  return q.resolve(params);
}

function createFolder(params) {
  var dirName = path.join(tmpDir, params.id);

  params.tmpDir = dirName;

  return fs.makeTree(dirName).then(function(){ return params; });
}

function createSubClip(params) {
  var cmd = ['cd '+params.tmpDir],
      start = hhmmss(params.start);

/*
 * These are for the old, unused video sizes
 *
  cmd.push(
    'ffmpeg -i '+sourceFile+' -vf scale=360:180 -ss '+start+
    ' -t 6 -an '+params.id
    +'.180.mp4 2>&1'
  );

  cmd.push(
    'ffmpeg -i '+sourceFile+' -vf scale=640:360 -ss '+start+
    ' -t 6 -an '+params.id
    +'.360.mp4 2>&1'
  );

  cmd.push(
    'ffmpeg -i '+sourceFile+' -ss '+start+
    ' -c copy '+
    ' -t 6 -an '+params.id
    +'.720.mp4 2>&1'
  );

  cmd.push(
    'ffmpeg -ss '+start+
    ' -i '+sourceFile+
    ' -c copy '+
    ' -t 6 '+
    ' -an '+
    params.id+'.720.mp4 2>&1'
  );

  console.log(cmd);
*/
  return exec(cmd.join(' && ')).then(function(output) { return params; });
}

function createGif(params) {
  var cmd = ['cd '+params.tmpDir],
      images = imagesForTime(params.start);

  imgSizes.forEach(function(size) {
    cmd.push(
      'gifsicle --colors 256 --delay 10 --loopcount '+images[size]+' > '+params.id+'.'+size+'.gif'
    );
  });

  console.log(cmd.join(' && '));
  return exec(cmd.join(' && ')).then(function(output) { return params; });
}

function fetchPoster(params) {
  var cmd, poster;

  cmd = ['cd '+params.tmpDir];

  imgSizes.forEach(function(size) {
    poster = path.join(
      mediaPath,
      wrapDigit(size),
      wrapDigit(params.start.getUTCFullYear()),
      wrapDigit(params.start.getUTCMonth()+1),
      wrapDigit(params.start.getUTCDate()),
      wrapDigit(params.start.getUTCHours()),
      wrapDigit(params.start.getUTCMinutes()),
      wrapDigit(params.start.getUTCSeconds()),
      '1.gif'
    );

    cmd.push('cp '+poster+' '+params.id+'.'+size+'.poster.gif');
  });

  return exec(cmd.join(' && ')).then(function(output) { return params; });
}

function moveToPublic(params) {
  var target = path.join(mediaPath, 'clips', params.id);

  return fs.move(params.tmpDir, target)
    .then(function() { return params; });
}

function imagesForTime(time) {
  var images = {};

  imgSizes.forEach(function(size) {
    var tmpPath = [];

    for(i=0; i<6; i++) {
      var newDate = new Date(time.getTime() + i*1000);

      tmpPath.push(path.join(
        mediaPath,
        wrapDigit(size),
        wrapDigit(newDate.getUTCFullYear()),
        wrapDigit(newDate.getUTCMonth()+1),
        wrapDigit(newDate.getUTCDate()),
        wrapDigit(newDate.getUTCHours()),
        wrapDigit(newDate.getUTCMinutes()),
        wrapDigit(newDate.getUTCSeconds()),
        '*.gif'
      ));

      images[size] = tmpPath.join(' ');
    }
  });

  return images;
}

function wrapDigit(digit) {
  if(digit < 10) {
    digit = '0'+digit;
  }

  return String(digit);
}

function hhmmss(time) {
  var sep      = ':',
      totalSec = (time - txTime) / 1000,
      hours    = parseInt( totalSec / 3600 ) % 24,
      minutes  = parseInt( totalSec / 60 ) % 60,
      seconds  = totalSec % 60;

  return wrapDigit(hours) + sep +
    wrapDigit(minutes) + sep + wrapDigit(seconds);
}
