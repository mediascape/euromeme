var express = require('express'),
    fs      = require('q-io/fs'),
    latestClips = require('./lib/latest-clips'),
    app     = express(),
    port    = process.env.PORT || 5000,
    mediaPath = process.env.MEDIA_PATH;

if(typeof mediaPath === 'undefined') {
  console.error('MEDIA_PATH not found');
  process.exit(1);
}

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

console.log('listening on '+port);
app.listen(port);
