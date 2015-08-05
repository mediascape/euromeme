var React = require('react');

module.exports = React.createClass({
  render: function() {
    var className = 'fullscreen centered-view';
    className += this.props.isActive ? ' is-active' : ' is-inactive';
    return (<div className={className}>
      <span className="centered-view-inner">Loading&hellip;</span>
    </div>);
  }
});
