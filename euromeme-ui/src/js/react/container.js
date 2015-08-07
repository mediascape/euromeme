var React = require('react');

var LoaderView = require('./loader-view'),
    Grid   = require('./grid'),
    configApi = require('../api/config'),
    clipsApi  = require('../api/clips'),
    discoveryApi = require('../api/discovery'),
    fullscreen= require('../util/fullscreen');

module.exports = React.createClass({
  views: {
    'init': 'init',
    'grid': 'grid'
  },
  getInitialState: function() {
    return {
      viewName: this.views.init,
      videoUrl: null,
      clips: []
    };
  },
  initView: function (viewName) {
    this.setState({ viewName: viewName });
  },
  initWithConfig: function (data) {
    var config = data[0],
        clips  = data[1];
    console.log('initWithConfig', config, clips);
    this.setState({
      viewName: this.views.grid,
      videoUrl: config.videoUrl,
      clips: clips
    });
  },
  componentDidMount: function () {
    console.log('Load clips from remote API');
    console.log('Load sync + video data from TV');

    // Instance variables for doubletaps
    this.tapCount = 0;
    this.tapInterval = null;

    configApi
      .config()
      .then(function (config) {
        var clips = clipsApi(config.frameStore).popular();
        return Promise.all([config, clips]);
      })
      .then(this.initWithConfig, function (err) { console.error(err); });
  },
  handleViewSelection: function () {
    console.log('Container.handleViewSelection');
    fullscreen.enter();
  },
  captureTap: function () {
    this.tapCount++;
    if (this.tapCount === 2) {
      this.handleViewSelection();
      this.tapCount = 0;
      clearTimeout(this.tapInterval);
    } else {
      setTimeout(function () {
        this.tapCount = 0;
      }.bind(this), 500);
    }
  },
  render: function() {
    var grid = '',
        loadingMessage,
        view;

    switch(this.state.viewName) {
      case this.views.init:
        loadingMessage = 'Initialising';
        break;
    }

    if (loadingMessage) {
      view = (
        <LoaderView isActive='true'>
          {loadingMessage}
        </LoaderView>
      );
    } else {
      view = <Grid videoUrl={this.state.videoUrl} clips={this.state.clips} />;
    }

    return (
      <div onTouchStart={this.captureTap} onDoubleClick={this.handleViewSelection}>
      { view }
    </div>);
  }
});
