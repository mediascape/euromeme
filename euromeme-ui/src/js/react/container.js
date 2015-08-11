var React = require('react');

var LoaderView = require('./loader-view'),
    DeviceList = require('./device-list'),
    Grid   = require('./grid'),
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
    'grid'       : 'grid'
  },
  getInitialState: function() {
    return {
      viewName: this.views.init,
      videoUrl: null,
      clipFormat: 'gif', // gif, poster, mp4
      clips: []
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
      this.state.config.mediaStoreUrlTemplate,
      '180'
    )
      .recent()
      .then(function (clips) {
        console.log(' clips', clips);
        this.setState({
          videoUrl: deviceStatus.videoUrl,
          clips: clips
        });
        this.initView(this.views.grid);
      }.bind(this))
      .catch(function (err) { console.error(err); });
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
      .then(this.initWithDeviceStatus, function (err) { console.error(err); });
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
    }

    if (loadingMessage) {
      console.log('view: loader', loadingMessage);
      view = (
        <LoaderView isActive='true'>
          {loadingMessage}
        </LoaderView>
      );
    } else if (this.state.viewName === this.views.tvs) {
      console.log('view: device list view');
      view = <DeviceList devices={this.state.devices} onDeviceSelected={this.connectToDevice}/>;
    } else {
      console.log('view: grid');
      view = <Grid videoUrl={this.state.videoUrl} format={this.state.clipFormat} clips={this.state.clips} />;
    }
    return (
      <div onTouchStart={this.captureTap} onDoubleClick={this.handleViewSelection}>
      { view }
    </div>);
  }
});
