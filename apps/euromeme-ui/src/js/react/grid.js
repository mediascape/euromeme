var React = require('react'),
    sortByOrder = require('lodash/collection/sortByOrder'),
    fill  = require('lodash/array/fill');

var lodash = require('lodash');

var LiveTile = require('./live-tile'),
    Clip = require('./clip');

module.exports = React.createClass({
  displayName: 'Grid',
  propTypes: {
    clips              : React.PropTypes.array.isRequired,
    numPlaceholderClips: React.PropTypes.number.isRequired,
    format             : React.PropTypes.string.isRequired,
    videoUrl           : React.PropTypes.string.isRequired,
    sync               : React.PropTypes.shape({
      msvName: React.PropTypes.string,
      appId  : React.PropTypes.string
    }).isRequired,
    onGridItemSelected : React.PropTypes.func
  },
  handleItemSelection: function (key) {
    if (this.props.onGridItemSelected) {
      this.props.onGridItemSelected(key);
    }
  },
  handleLiveTileSelection: function (time) {
    this.handleItemSelection({ type: 'live', timeSecs: time });
  },
  clips: function () {
    // Merge created and pending clips
    var clips = this.props.clips.concat(this.props.pendingClips);

    // Order by id, which puts the most recent at the top
    clips = sortByOrder(clips, ['id'], ['desc']);

    if (this.props.numPlaceholderClips) {
      // Ensure that we trim any extra clips
      clips = clips.slice(0, this.props.numPlaceholderClips);

      // Ensure there's a minimum number of clips
      // displayed whilst we wait for them to load
      clips = clips.concat(
        lodash
        .times(this.props.numPlaceholderClips - clips.length)
        .map(lodash.constant({}))
      );
    }
    return clips.map((clip, index) => {
      var key = clip.id || index,
          clipUrl,
          type,
          component;

      if (!clip.format && !clip[this.props.format]) {
        component = (<li key={key} className="grid-item grid-item-clip is-pending centered-view is-active"><span className="centered-view-message">Making your clip</span><span className="centered-view-inner loader">&hellip;</span></li>);
      } else {
        clipUrl = clip[this.props.format] ? clip[this.props.format].replace('$size', 180) : '';
        type = this.props.format === 'mp4' ? 'video' : 'image';
        component = (<li key={key} onTouchStart={this.handleItemSelection.bind(this, clip)} onClick={this.handleItemSelection.bind(this, clip)} className="grid-item grid-item-clip">
          <Clip src={clipUrl} type={type} />
        </li>);
      }

      return component;
    });
  },
  render: function() {
    var live  = (<li key='live' className="grid-item grid-item-live">
                    <LiveTile
                      src={this.props.videoUrl}
                      msvName={this.props.sync.msvName}
                      appId={this.props.sync.appId}
                      onSelect={this.handleLiveTileSelection} />
                  </li>),
        clips = this.clips().concat(live);

    return <div className="grid">
      <h2 className="grid-hd">Most recent clips</h2>
      <ul className="grid-list">
        { clips }
      </ul>
    </div>;
  }
});
