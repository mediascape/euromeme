function enterFullScreenMethod() {
  return [
    'webkitRequestFullscreen',
    'webkitRequestFullScreen',
    'mozRequestFullScreen',
    'msRequestFullscreen',
    'requestFullscreen'
  ].reduce(function (last, current) {
    return (current in document.body) ? current : last;
  });
}

module.exports = {
  enter: function (el) {
    el = el || document.documentElement;
    var enterFullScreenMethodName = enterFullScreenMethod();
    el[enterFullScreenMethodName]();
  }
};
