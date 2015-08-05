var React = require('react');

module.exports = React.createClass({
  render: function() {
    var className = 'fullscreen loader';
    className += this.props.isActive ? ' is-active' : ' is-inactive';
    return (<div className={className}>
      Loading &ellip;
    </div>);
  }
});
