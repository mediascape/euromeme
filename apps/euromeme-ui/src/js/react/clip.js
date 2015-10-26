var React = require('react'),
    ImageLoader = require('react-imageloader'),
    ActionsList  = require('./actions-list');

module.exports = React.createClass({
  displayName: 'Clip',
  propTypes: {
    src: React.PropTypes.string.isRequired,
    type: React.PropTypes.oneOf(['image', 'video']).isRequired,
    fullScreen: React.PropTypes.bool,
    onClose: React.PropTypes.func
  },
  getInitialState: function () {
    return {
      className: 'pre-image-load'
    };
  },
  handleClose: function () {
    setTimeout(function () {
      this.setState({fullScreen: false});
      if (this.props.onClose) {
        this.props.onClose();
      }
    }.bind(this), 200);
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
  onClick: function() {
    setTimeout(function () {
      this.setState({fullScreen: true});
    }.bind(this), 200);
  },
  render: function() {
    if (!this.props.src) {
      return <span></span>
    } else if (this.props.type === 'video') {
      return <video src={this.props.src} autoPlay loop muted />;
    } else {
      if(this.state.fullScreen){
        return <div className="clip-preview">
<ActionsList onClose={this.handleClose} />
<form><textarea rows="2" cols="22">I'm sharing a clip from #eurovision</textarea>
<input type="image" src="images/twitter.png" />
<input type="image" src="images/facebook.png" />
<input type="image" src="images/tumblr.png" />
</form>
<br />
<ImageLoader className={this.state.className} src={this.props.src} preloader={this.preloader} onLoad={this.handleLoad} onError={this.handleError}>Clip load failed!</ImageLoader>;
</div>;
      }else{
        return <ImageLoader className={this.state.className} src={this.props.src} preloader={this.preloader} onLoad={this.handleLoad} onError={this.handleError} onClick={this.onClick}>Clip load failed!</ImageLoader>;
      }
    }
  }
});

