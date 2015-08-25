var fs         = require('q-io/fs'),
    q          = require('q'),
    exec       = require('promised-exec'),
    path       = require('path'),
    tmpDir     = path.join(__dirname, '..', 'tmp'),
    txTime     = new Date(2015, 4, 23, 20),
    imgSizes   = [720, 360, 180],
    sourceFile = process.env.SOURCE_FILE,
    mediaPath  = process.env.MEDIA_PATH;

console.log(txTime);

if(typeof sourceFile === 'undefined') {
  console.error('SOURCE_FILE not found');
  process.exit(1);
}

module.exports.validate = validate;

module.exports.create = function(params) {
  return nameClip(params)
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

  return q.resolve(validParams);
}

function nameClip(params) {
  params.name = Date.now() + '-gen';

  return q.resolve(params);
}

function createFolder(params) {
  var dirName = path.join(tmpDir, params.name);

  params.tmpDir = dirName;

  return fs.makeTree(dirName).then(function(){ return params; });
}

function createSubClip(params) {
  var cmd = ['cd '+params.tmpDir],
      start = '00:02:00';

  cmd.push(
    'ffmpeg -i '+sourceFile+' -vf scale=360:180 -ss '+start+
    ' -t 6 -an '+params.name
    +'.180.mp4 2>&1'
  );

  cmd.push(
    'ffmpeg -i '+sourceFile+' -vf scale=640:360 -ss '+start+
    ' -t 6 -an '+params.name
    +'.360.mp4 2>&1'
  );

  cmd.push(
    'ffmpeg -i '+sourceFile+' -ss '+start+
    ' -t 6 -an '+params.name
    +'.720.mp4 2>&1'
  );

  return exec(cmd.join(' && ')).then(function(output) { return params; });
}

function createGif(params) {
  var cmd = ['cd '+params.tmpDir],
      start = new Date(txTime.getTime() + 2*60000),
      images = imagesForTime(start);

  imgSizes.forEach(function(size) {
    cmd.push(
      'convert -delay 10 -loop 0 '+images[size]+' '+params.name+'.'+size+'.gif'
    );
  });

  return exec(cmd.join(' && ')).then(function(output) { return params; });
}

function moveToPublic(params) {
  var target = path.join(mediaPath, 'clips', params.name);

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
        wrapDigit(newDate.getFullYear()),
        wrapDigit(newDate.getMonth()+1),
        wrapDigit(newDate.getDate()),
        wrapDigit(newDate.getHours()),
        wrapDigit(newDate.getMinutes()),
        wrapDigit(newDate.getSeconds()),
        '*.jpg'
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
