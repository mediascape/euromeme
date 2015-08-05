var React = require('react'),
    times = require('lodash/utility/times'),
    identity = require('lodash/utility/identity'),
    fetch;

// For fetch
require('es6-promise').polyfill();
fetch = require('isomorphic-fetch');

var Loader = require('./loader'),
    Grid   = require('./grid');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      isLoading: true,
      videoUrl: null,
      clips: []
    };
  },
  fetchVideoUrl: function () {
    return fetch('/config.json')
      .then(function (response) {
        if (response.status >= 400) {
          throw new Error('Config not found');
        } else {
          return response.json();
        }
      });
  },
  initWithConfig: function (config) {
    console.log('initWithConfig', config);
    this.setState({
      isLoading: false,
      videoUrl: config.videoUrl,
      clips: times(5, identity)
    });
  },
  componentDidMount: function () {
    console.log('Load clips from remote API');
    console.log('Load sync + video data from TV');
    this.fetchVideoUrl()
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
      <Loader isActive={this.state.isLoading} />
      { grid }
    </div>);
  }
});
