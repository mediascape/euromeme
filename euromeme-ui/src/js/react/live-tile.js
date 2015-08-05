var React = require('react');

module.exports = React.createClass({
  handleTileSelection: function () {
    var $video = this.refs.video.getDOMNode();
    $video.paused ? $video.play() : $video.pause();
  },
  render: function() {
    return (
      <div className="live-tile">
        <i className="live-tile-icon"></i>
        <video ref="video" onClick={this.handleTileSelection} autoPlay src={this.props.src}> </video>
      </div>
    );
  }
});
