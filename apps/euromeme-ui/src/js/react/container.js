var React = require('react'),
    ReactCSSTransitionGroup = require('react/addons').addons.CSSTransitionGroup;

var LoaderView = require('./loader-view'),
    DeviceList = require('./device-list'),
    Grid   = require('./grid'),
    ClipPreview = require('./clip-preview'),
    configApi = require('../api/config'),
    clipsApi  = require('../api/clips'),
    discoveryApi = require('../api/discovery'),
    deviceApi = require('../api/device'),
    fullscreen= require('../util/fullscreen');

module.exports = React.createClass({
  displayName: 'Container',
  views: {
    'init'       : 'init',
    'discovering': 'discovering',
    'tvs'        : 'tvs',
    'connecting' : 'connecting',
    'grid'       : 'grid',
    'preview'    : 'preview',
    'error'      : 'error'
  },
  getInitialState: function() {
    return {
      viewName: this.views.init,
      videoUrl: null,
      clipFormat: 'poster', // gif, poster, mp4
      clips: []
    };
  },
  createErrorHandlerWithMessage: function (msg) {
    return (err) => {
      var e = new Error(msg);
      e.original = err;
      this.initErrorView(e);
    };
  },
  initView: function (viewName) {
    this.setState({ viewName: viewName });
  },
  initWithConfig: function (config) {
    console.log('initWithConfig', config);
    this.setState({ config: config });
    this.initView(this.views.discovering);
    discoveryApi
      .discover()
      .then(this.initWithTvList, function (err) { console.error(err); });
  },
  initWithTvList: function (list) {
    console.log('initWithTvList', list);
    this.setState({
      devices: list
    });
    this.initView(this.views.tvs);
  },
  initWithDeviceStatus: function (deviceStatus) {
    console.log('initWithDeviceStatus', deviceStatus);
    clipsApi(
      this.state.config.clipsApiEndpoint,
      this.state.config.mediaStoreUrlTemplate
    )
      .recent()
      .then(function (clips) {
        console.log(' clips', clips);
        this.setState({
          videoUrl: deviceStatus.videoUrl,
          sync: {
            msvName: deviceStatus.msvName,
            appId: deviceStatus.appId
          },
          clips: clips
        });
        this.initView(this.views.grid);
      }.bind(this))
      .catch(function (err) { console.error(err); });
  },
  initErrorView: function (err) {
    this.setState({
      viewName: this.views.error,
      error: err
    });
  },
  connectToDevice: function (info) {
    console.log('connectToDevice', info);
    var device = deviceApi.connect({ address: info.address, port: info.port, name: info.host });
    this.setState({
      device: device
    });
    this.initView(this.views.connecting);
    device
      .status()
      .then(
        this.initWithDeviceStatus,
        this.createErrorHandlerWithMessage('Error connecting to ' + info.host)
      );
  },
  componentDidMount: function () {
    // Instance variables for doubletaps
    this.tapCount = 0;
    this.tapInterval = null;

    configApi
      .config()
      .then(this.initWithConfig, function (err) { console.error(err); });
  },
  handleViewSelection: function () {
    console.log('Container.handleViewSelection');
    fullscreen.enter();
  },
  handleGridItemSelected: function (item) {
    console.log('Container.handleGridItemSelected', item);
    this.setState({ previewItem: item });
    this.initView(this.views.preview);
  },
  handleClipPreviewClose: function () {
    console.log('Container.handleClipPreviewClose');
    this.setState({ previewItem: null });
    this.initView(this.views.grid);
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
    var loadingMessage,
        view;

    switch(this.state.viewName) {
      case this.views.init:
        loadingMessage = 'Initialising';
        break;
      case this.views.discovering:
        loadingMessage = 'Discovering TVs on the network';
        break;
      case this.views.connecting:
        loadingMessage = 'Connecting to ' + this.state.device.name;
        break;
      case this.views.error:
        loadingMessage = this.state.error.message;
        break;
    }

    if (loadingMessage) {
      console.log('view: loader', loadingMessage);
      view = (
        <LoaderView key="loader" isActive='true' isError={!!this.state.error}>
          {loadingMessage}
        </LoaderView>
      );
    } else {
      console.log('view', this.state.viewName);
      switch (this.state.viewName) {
        case this.views.tvs:
          view = <DeviceList key={this.views.tvs} devices={this.state.devices} onDeviceSelected={this.connectToDevice}/>;
          break;
        case this.views.grid:
          view = <Grid sync={this.state.sync} key={this.views.grid} videoUrl={this.state.videoUrl} format={this.state.clipFormat} clips={this.state.clips} onGridItemSelected={this.handleGridItemSelected} />;
          break;
        case this.views.preview:
          view = <ClipPreview key={this.views.preview} onClose={this.handleClipPreviewClose} clip={this.state.previewItem} />;
          break;
        default:
          view = <div key='error'>Error</div>;
          console.log('view: error');
      }
    }

    return (
      <div onTouchStart={this.captureTap} onDoubleClick={this.handleViewSelection}>
      <ReactCSSTransitionGroup transitionName="view" component="div" className="container">
      { view }
      </ReactCSSTransitionGroup>
    </div>);
  }
});
