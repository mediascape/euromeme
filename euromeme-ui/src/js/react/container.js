var React = require('react');

var LoaderView = require('./loader-view'),
    Grid   = require('./grid'),
    configApi = require('../api/config'),
    clipsApi  = require('../api/clips');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      isLoading: true,
      videoUrl: null,
      clips: []
    };
  },
  initWithConfig: function (data) {
    var config = data[0],
        clips  = data[1];
    console.log('initWithConfig', config, clips);
    this.setState({
      isLoading: false,
      videoUrl: config.videoUrl,
      clips: clips
    });
  },
  componentDidMount: function () {
    console.log('Load clips from remote API');
    console.log('Load sync + video data from TV');
    configApi
      .config()
      .then(function (config) {
        var clips = clipsApi(config.frameStore).popular();
        return Promise.all([config, clips]);
      })
      .then(this.initWithConfig, function (err) { console.error(err); });
  },
  render: function() {
    var grid = '';
    if (!this.state.isLoading) {
      grid = <Grid
          videoUrl={this.state.videoUrl}
          clips={this.state.clips} />;
    }
    return (<div>
      <LoaderView isActive={this.state.isLoading} />
      { grid }
    </div>);
  }
});
