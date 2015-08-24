var React = require('react');

var ErrorIcon = require('../../../static/icons/error.svg');

module.exports = React.createClass({
  displayName: 'LoaderView',
  propTypes: {
    isError: React.PropTypes.bool.isRequired,
    children: React.PropTypes.node.isRequired, // anything that can be rendered
    isActive: React.PropTypes.bool
  },
  getDefaultProps: function() {
    return {
      isActive: true
    }
  },
  render: function() {
    var className = 'fullscreen centered-view',
        errorIcon = this.props.isError ? <span className="centered-view-icon"><ErrorIcon /></span> : '',
        loaderIcon = this.props.isError ? '' : <span className="centered-view-inner loader">&hellip;</span>;
    className += this.props.isActive ? ' is-active' : ' is-inactive';
    className += this.props.isError  ? ' is-error'  : ' is-not-error';
    return (<div className={className}>
      {errorIcon}
      <span className="centered-view-message">{this.props.children}</span>
      {loaderIcon}
    </div>);
  }
});
