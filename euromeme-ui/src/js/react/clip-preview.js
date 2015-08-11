var React = require('react');

var Clip = require('./clip');

module.exports = React.createClass({
  displayName: 'ClipPreview',
  getInitialState: function () {
    return {};
  },
  handleClose: function () {
    if (this.props.onClose) {
      this.props.onClose();
    }
  },
  render: function() {
    var clipUrl = this.props.clip.gif.replace('$size', 720);
    return (
      <div className="clip-preview">
        <button onClick={this.handleClose} className="close-button">Close</button>
        <Clip src={clipUrl} />
      </div>
    );
  }
});
