var _ = require('lodash');

module.exports = function(clips, count) {
  return _(clips).reverse().slice(0,count).map(function(clipId) {
    var path = '/clips/'+clipId+'/'+clipId+'.$size';

    return  {
      id: clipId,
      poster: path + '.jpg',
      mp4: path + '.mp4',
      gif: path + '.gif',
    };
  });
};
