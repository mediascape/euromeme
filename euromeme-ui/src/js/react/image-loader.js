var React = require('react'),
    ImageLoader = require('react-imageloader');

module.exports = React.createClass({
  getInitialState: function () {
    return {
      className: 'pre-image-load'
    };
  },
  preloader: function () {
    var loaderStyle = { fontSize: '3px' };
    return <span className="loader" style={loaderStyle}></span>;
  },
  handleLoad: function (evt) {
    // Clear pre-image-load class name
    // with a timeout to give CSS transition
    // time to fade the image in
    setTimeout(function () {
      this.setState({ className: '' });
    }.bind(this), 100);
  },
  handleError: function (evt) {
    console.log('error', evt, this);
  },
  render: function() {
    return <ImageLoader className={this.state.className} src={this.props.src} preloader={this.preloader} onLoad={this.handleLoad} onError={this.handleError}>Clip load failed!</ImageLoader>;
  }
});
