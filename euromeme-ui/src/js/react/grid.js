var React = require('react'),
    fill  = require('lodash/array/fill');

var LiveTile = require('./live-tile'),
    Clip = require('./clip');

module.exports = React.createClass({
  displayName: 'Grid',
  handleItemSelection: function (key) {
    if (this.props.onGridItemSelected) {
      this.props.onGridItemSelected(key);
    }
  },
  clips: function () {
    return this.props.clips.map((clip, index) => {
      var clipUrl = clip[this.props.format].replace('$size', 180);
      return <li key={index} onClick={this.handleItemSelection.bind(this, clip)} className="grid-item grid-item-clip">
        <Clip src={clipUrl} />
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
