var express = require('express'),
    fs      = require('q-io/fs'),
    cors    = require('cors'),
    bodyParser = require('body-parser'),
    latestClips = require('./lib/latest-clips'),
    createClips = require('./lib/create-clips'),
    app     = express(),
    port    = process.env.PORT || 5000,
    mediaPath = process.env.MEDIA_PATH;

if(typeof mediaPath === 'undefined') {
  console.error('MEDIA_PATH not found');
  process.exit(1);
}

app.use(cors());
app.use(bodyParser.json());

app.get('/clips/latest', function(req, res) {
  fs.listDirectoryTree(mediaPath).then(function(dirs) {
    // remove root directory
    var clips = dirs.slice(1);

    clips = clips.map(function(c) {
      return c.split('/').pop();
    });

    res.json(latestClips(clips, 8));
  }, function(err) {
    res.send(err);
  });
});

app.post('/clips', function(req, res) {
  createClips.validate(req.body).then(
    function(params) {
      res.sendStatus(200);
      createClips.create(params);
    },
    function(err) {
      res.sendStatus(400);
    }
  );
});

console.log('listening on '+port);
app.listen(port);
