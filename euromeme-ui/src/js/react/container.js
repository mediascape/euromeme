var React = require('react'),
    times = require('lodash/utility/times'),
    identity = require('lodash/utility/identity');

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
  componentDidMount: function () {
    console.log('Load clips from remote API');
    console.log('Load sync + video data from TV');
    setTimeout(function () {
      this.setState({
        isLoading: false,
        videoUrl: 'https://vm-1276-user.virt.ch.bbc.co.uk/eurovision-2015.mp4?k=lolz',
        clips: times(12, identity)
      });
    }.bind(this), 1000);
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
