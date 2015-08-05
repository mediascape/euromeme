var React = require('react'),
    ImageLoader = require('react-imageloader');

module.exports = React.createClass({
  preloader: function () {
    var loaderStyle = { fontSize: '3px' };
    return <span className="loader" style={loaderStyle}></span>;
  },
  handleLoad: function (evt) {
    console.log('load', evt, this);
  },
  handleError: function (evt) {
    console.log('error', evt, this);
  },
  render: function() {
    return <ImageLoader src={this.props.src} preloader={this.preloader} onLoad={this.handleLoad} onError={this.handleError}>Clip load failed!</ImageLoader>;
  }
});
