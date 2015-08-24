var React = require('react');

var Clip = require('./clip'),
    ActionsList  = require('./actions-list');

module.exports = React.createClass({
  displayName: 'ClipPreview',
  propTypes: {
    clip: React.PropTypes.shape({
      mp4: React.PropTypes.string
    }).isRequired,
    onClose: React.PropTypes.func
  },
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
        <ActionsList
          onClose={this.handleClose} />
        <Clip src={clipUrl} format="video" />
      </div>
    );
  }
});
