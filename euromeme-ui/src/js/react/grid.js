var React = require('react'),
    fill  = require('lodash/array/fill');

var LiveTile = require('./live-tile');

module.exports = React.createClass({
  clips: function () {
    return this.props.clips.map(function (clip, index) {
      return <li key={index} className="grid-item grid-item-clip">{clip + 1}</li>;
    });
  },
  render: function() {
    var live  = <li key='live' className="grid-item grid-item-live"><LiveTile src={this.props.videoUrl} /></li>,
        clips = this.clips();

    clips.splice(clips.length - 1, 0, live);

    return <div className="grid">
      <h2 className="grid-hd">Most popular clips</h2>
      <ul className="grid-list">
        { clips }
      </ul>
    </div>;
  }
});
