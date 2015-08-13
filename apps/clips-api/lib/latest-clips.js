var _ = require('lodash');

module.exports = function(clips, count) {
  return _(clips).reverse().slice(0,count).map(function(c) {
    var path = '/clips/'+c+'/'+c+'.$size';

    return  {
      poster: path + '.jpg',
      mp4: path + '.mp4',
      gif: path + '.gif',
    };
  });
};
