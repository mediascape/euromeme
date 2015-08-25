var React = require('react'),
    ReactCSSTransitionGroup = require('react/addons').addons.CSSTransitionGroup,
    merge = require('lodash/object/merge');

    // React UI Components
var LoaderView  = require('./loader-view'),
    DeviceList  = require('./device-list'),
    Grid        = require('./grid'),
    ClipPreview = require('./clip-preview'),
    Editor      = require('./editor'),

    // API libraries
    configApi    = require('../api/config'),
    clipsApi     = require('../api/clips'),
    discoveryApi = require('../api/discovery'),
    deviceApi    = require('../api/device'),

    // Utilities
    fullscreen = require('../util/fullscreen'),
    dates      = require('../util/dates');


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
    'editor'     : 'editor',
    'error'      : 'error'
  },
  getInitialState: function() {
    return {
      viewName: this.views.init,
      videoUrl: null,
      clipFormat: 'gif', // gif, poster, mp4
      clips: [],
      config: {}
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
        sync: { msvName: deviceStatus.msvName, appId: deviceStatus.appId },
        broadcast: { startDate: new Date(deviceStatus.broadcastStartDate) }
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
    Clip has been created
  */
  receiveClipCreation: function () {
    console.log('receiveClipCreation');
    this.transitionToViewWithState(this.views.grid, {});
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
    var clipsApiInstance = clipsApi(
      this.state.config.clipsApiEndpoint,
      this.state.config.mediaStoreUrlTemplate
    );

    this.setState({ clipsApi: clipsApiInstance });

    clipsApiInstance
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
    var state, data, broadcastDate, endDate, startDate;
    console.log('Container.handleGridItemSelection', item);
    console.log('broadcastStartDate', this.state.broadcast.startDate);

    if (item.type === 'live') {
      endDate = dates.maths(this.state.broadcast.startDate, item.timeSecs);
      startDate = dates.maths( endDate,  - (5 * 60));
      state = this.views.editor;
      data  = { startDate: startDate, endDate: endDate };
    } else {
      state = this.views.preview;
      data = { previewItem: item };
    }
    this.transitionToViewWithState(state, data);
  },
  handleClipPreviewClose: function () {
    console.log('Container.handleClipPreviewClose');
    this.transitionToViewWithState(
      this.views.grid,
      { previewItem: null }
    );
  },
  handleEditorClose: function () {
    console.log('Container.handleEditorClose');
    this.transitionToViewWithState(
      this.views.grid,
      { startDate: null, endDate: null }
    );
  },
  handleCreateClip: function (evt) {
    console.log('handleCreateClip', evt);
    this.state.clipsApi
      .create(evt.startDate, evt.endDate)
      .then(this.receiveClipCreation);
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
    var targetViewName = this.state.viewName,
        loadingMessage,
        view;

    // Feature flags allow overriding of application
    // flow to jump to a specific view
    // TODO: Consider using react-router to support this
    //       across the application
    if (window.location.hash === '#editor' && this.state.config.frameStoreTemplate) {
      targetViewName = this.views.editor;
    }

    switch(targetViewName) {
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
        <LoaderView key="loader" isError={!!this.state.error}>
          {loadingMessage}
        </LoaderView>
      );
    } else {
      console.log('view', targetViewName);
      switch (targetViewName) {
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
        case this.views.editor:
          view = <Editor
                   startDate={this.state.startDate}
                   endDate={this.state.endDate}
                   frameTemplate={this.state.config.frameStoreTemplate}
                   onCreateClip={this.handleCreateClip}
                   onClose={this.handleEditorClose} />;
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
