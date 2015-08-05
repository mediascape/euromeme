var React = require('react');

module.exports = React.createClass({
  handleTileSelection: function () {
    var $video = React.findDOMNode(this);
    $video.paused ? $video.play() : $video.pause();
  },
  render: function() {
    return <video onClick={this.handleTileSelection} autoPlay src={this.props.src}> </video>;
  }
});
