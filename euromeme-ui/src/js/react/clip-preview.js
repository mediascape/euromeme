var React = require('react');

var Clip = require('./clip'),
    CloseIcon = require('../../../static/icons/close.svg');

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
    var clipUrl = this.props.clip.mp4.replace('$size', 720);
    return (
      <div className="clip-preview">
        <div className="clip-preview-actions">
          <button onClick={this.handleClose} className="clip-preview-close-button">
            <CloseIcon alt="Close" />
          </button>
        </div>
        <Clip src={clipUrl} format="video" />
      </div>
    );
  }
});
