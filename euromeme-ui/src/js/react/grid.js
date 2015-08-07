var React = require('react'),
    fill  = require('lodash/array/fill');

var LiveTile = require('./live-tile'),
    ImageLoader = require('./image-loader');

module.exports = React.createClass({
  clips: function () {
    return this.props.clips.map(function (clip, index) {
      return <li key={index} className="grid-item grid-item-clip">
        <ImageLoader src={clip.poster} />
      </li>;
    });
  },
  render: function() {
    var live  = <li key='live' className="grid-item grid-item-live"><LiveTile src={this.props.videoUrl} /></li>,
        clips = this.clips().concat(live);

    return <div className="grid">
      <h2 className="grid-hd">Most recent clips</h2>
      <ul className="grid-list">
        { clips }
      </ul>
    </div>;
  }
});
