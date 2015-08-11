var React = require('react'),
    fill  = require('lodash/array/fill');

var LiveTile = require('./live-tile'),
    Clip = require('./clip');

module.exports = React.createClass({
  displayName: 'Grid',
  clips: function () {
    return this.props.clips.map((clip, index) => {
      return <li key={index} className="grid-item grid-item-clip">
        <Clip src={clip[this.props.format]} />
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
