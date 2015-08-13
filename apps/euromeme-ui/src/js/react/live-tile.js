var React = require('react');
var Sync = require('../api/sync');
var configApi = require('../api/config');

module.exports = React.createClass({
  displayName: 'LiveTile',
  componentDidMount: function () {
    configApi
      .config()
      .then(this.initSync);
  },
  initSync: function (config) {
    var $video = this.refs.video.getDOMNode();
    $video.addEventListener('playing', function () {
      console.log('Event: video.playing');
    });
    console.log('props', this.props);
    return Sync.init($video, this.props.appId, this.props.msvName, { debug: true });
  },
  handleTileSelection: function () {
    var $video = this.refs.video.getDOMNode();
    $video.paused ? $video.play() : $video.pause();
  },
  render: function() {
    return (
      <div className="live-tile">
        <i className="live-tile-icon"></i>
        <video ref="video" onClick={this.handleTileSelection} autoPlay preload muted src={this.props.src}> </video>
      </div>
    );
  }
});
