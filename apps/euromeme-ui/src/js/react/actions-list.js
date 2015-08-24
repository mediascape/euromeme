var React  = require('react');

var CloseIcon = require('../../../static/icons/close.svg');

module.exports = React.createClass({
  displayName: 'ActionsList',
  propTypes: {
    children: React.PropTypes.node,
    onClose: React.PropTypes.func.isRequired
  },
  render: function() {
    return (
      <div className="actions-list">
        <button onTouchStart={this.props.onClose} onClick={this.props.onClose} className="actions-list-close-button">
          <CloseIcon alt="Close" />
          { this.props.children }
        </button>
      </div>
    );
  }
});
