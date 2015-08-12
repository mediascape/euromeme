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
    var clipUrl = this.props.clip.poster.replace('$size', 720);
    return (
      <div className="clip-preview">
        <div className="clip-preview-actions">
          <button onClick={this.handleClose} className="close-button">Close</button>
        </div>
        <Clip src={clipUrl} />
      </div>
    );
  }
});
