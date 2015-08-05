var React = require('react');

module.exports = React.createClass({
  handleTileSelection: function () {
    var $video = React.findDOMNode(this);
    $video.paused ? $video.play() : $video.pause();
  },
  render: function() {
    return (
      <div className="live-tile">
        <i className="live-tile-icon"></i>
        <video onClick={this.handleTileSelection} autoPlay src={this.props.src}> </video>
      </div>
    );
  }
});
