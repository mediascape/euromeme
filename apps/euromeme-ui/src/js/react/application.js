var React = require('react'),
    ReactCSSTransitionGroup = require('react/addons').addons.CSSTransitionGroup,
    merge = require('lodash/object/merge');

    // React UI Components
var LoaderView  = require('./loader-view'),
    DeviceList  = require('./device-list'),
    Grid        = require('./grid'),
    ClipPreview = require('./clip-preview'),

    // API libraries
    configApi    = require('../api/config'),
    clipsApi     = require('../api/clips'),
    discoveryApi = require('../api/discovery'),
    deviceApi    = require('../api/device'),

    // Utilities
    fullscreen = require('../util/fullscreen');


/*
  The base Application component for Euromeme.

  This component owns the state for the app and passes
  state data into sub-component via props.

   - React lifecycle events
   - fetches data       (connectToDevice, fetchClips)
   - processes new data (methods prefixed receive*)
   - view transitions   (calling transitionToViewWithState)
   - user interaction   (methods prefixed with handle*)

*/
module.exports = React.createClass({
  displayName: 'Application',
  /*
    Keys for each view the app can transition
    into. For ease of reference throughout app
      e.g. this.views.discovering
  */
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
  /*
    This kicks off the Application state
  */
  componentDidMount: function () {
    // Instance variables for doubletaps
    this.tapCount = 0;
    this.tapInterval = null;

    configApi
      .config()
      .then(
        this.receiveConfig,
        this.createErrorHandlerWithMessage('Error loading Euromeme')
      );
  },
  /*
    Returns a function that can be called with
    an error object to transition to an
    error view
  */
  createErrorHandlerWithMessage: function (msg) {
    return (err) => {
      var e = new Error(msg);
      e.original = err;
      console.error(e.original);
      this.transitionToErrorView(e);
    };
  },
  /*
    Transition to named view and update state
  */
  transitionToViewWithState: function (viewName, state) {
    this.setState( merge({ viewName: viewName }, state) );
  },
  /*
    Transition to error view with error message
  */
  transitionToErrorView: function (err) {
    this.setState({
      viewName: this.views.error,
      error: err
    });
  },
  /*
    Receive application config
  */
  receiveConfig: function (config) {
    console.log('receiveConfig', config);
    this.transitionToViewWithState( this.views.discovering, { config: config } );
    discoveryApi
      .discover()
      .then(
        this.receiveDiscoveryDeviceList,
        this.createErrorHandlerWithMessage('Error finding devices')
      );
  },
  /*
    Receive list of devices found on the network
  */
  receiveDiscoveryDeviceList: function (list) {
    console.log('receiveDiscoveryDeviceList', list);
    this.transitionToViewWithState( this.views.tvs, { devices: list } );
  },
  /*
    Receive status of selected device, what it's playing etc.
    We also retrice clips at this point in case we want to
    filter by the current programme.
  */
  receiveDeviceStatus: function (deviceStatus) {
    console.log('receiveDeviceStatus', deviceStatus);

    // Request clips from remote API
    this.fetchClips();

    this.transitionToViewWithState(
      this.views.grid,
      {
        videoUrl: deviceStatus.videoUrl,
        sync: { msvName: deviceStatus.msvName, appId: deviceStatus.appId }
      }
    );
  },
  /*
    Receive clip list from remote API
  */
  receiveClips: function (clips) {
    console.log('receiveClips', clips);
    this.setState({ clips: clips });
  },
  /*
    connect to a remove device and fetch status info
  */
  connectToDevice: function (info) {
    console.log('connectToDevice', info);
    var device = deviceApi.connect({ address: info.address, port: info.port, name: info.host });
    this.transitionToViewWithState(
      this.views.connecting,
      { device: device }
    );
    device
      .status()
      .then(
        this.receiveDeviceStatus,
        this.createErrorHandlerWithMessage('Error connecting to ' + info.host)
      );
  },
  /*
    Fetch clips from remote API
  */
  fetchClips: function () {
    clipsApi(
      this.state.config.clipsApiEndpoint,
      this.state.config.mediaStoreUrlTemplate
    )
      .recent()
      .then(
        this.receiveClips,
        this.createErrorHandlerWithMessage('There was a problem loading recent clips')
      );
  },
  /*
    Handle double tap on application
  */
  handleDoubleTap: function () {
    console.log('Container.handleDoubleTap');
    fullscreen.enter();
  },
  /*
    Handle grid item selection
  */
  handleGridItemSelection: function (item) {
    console.log('Container.handleGridItemSelection', item);
    this.transitionToViewWithState(
      this.views.preview,
      { previewItem: item }
    );
  },
  handleClipPreviewClose: function () {
    console.log('Container.handleClipPreviewClose');
    this.transitionToViewWithState(
      this.views.grid,
      { previewItem: null }
    );
  },
  /*
    Handler to be called on tap. Will call handleDoubleTap
    if tap event occurs twice within timeout
  */
  captureTap: function () {
    this.tapCount++;
    if (this.tapCount === 2) {
      this.handleDoubleTap();
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
          view = <DeviceList
                    key={this.views.tvs}
                    devices={this.state.devices}
                    onDeviceSelected={this.connectToDevice} />;
          break;
        case this.views.grid:
          view = <Grid
                    sync={this.state.sync}
                    key={this.views.grid}
                    videoUrl={this.state.videoUrl}
                    format={this.state.clipFormat}
                    clips={this.state.clips}
                    numPlaceholderClips={8}
                    onGridItemSelected={this.handleGridItemSelection} />;
          break;
        case this.views.preview:
          view = <ClipPreview
                  key={this.views.preview}
                  onClose={this.handleClipPreviewClose}
                  clip={this.state.previewItem} />;
          break;
        default:
          view = <div key='error'>Error</div>;
          console.log('view: error');
      }
    }

    return (
      <div
        onTouchStart={this.captureTap}
        onDoubleClick={this.handleDoubleTap}>
        <ReactCSSTransitionGroup transitionName="view" component="div" className="container">
          { view }
        </ReactCSSTransitionGroup>
      </div>
    );
  }
});
