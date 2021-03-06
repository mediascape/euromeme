var React = require('react');
var Sync = require('../api/sync');
var configApi = require('../api/config');

module.exports = React.createClass({
  displayName: 'LiveTile',
  propTypes: {
    src     : React.PropTypes.string.isRequired,
    appId   : React.PropTypes.string.isRequired,
    msvName : React.PropTypes.string.isRequired,
    onSelect: React.PropTypes.func.isRequired
  },
  componentDidMount: function () {
    this.initSync()
      .then((sync) => {
        this.sync = sync;
      });
  },
  initSync: function (config) {
    var $video = this.refs.video.getDOMNode();
    $video.addEventListener('playing', function () {
      console.log('Event: video.playing');
    });
    return Sync.init($video, this.props.appId, this.props.msvName, { debug: true });
  },
  handleSelection: function (evt) {
    var pos = this.sync.position();
    console.log('handleSelection - pos', pos);
    this.props.onSelect(pos);
  },
  render: function() {
    return (
      <div className="live-tile">
        <i className="live-tile-icon"></i>
        <video ref="video" onClick={this.handleSelection} autoPlay preload muted src={this.props.src}> </video>
      </div>
    );
  }
});
