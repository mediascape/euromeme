var React  = require('react');

module.exports = React.createClass({
  displayName: 'Editor:Frame',
  render: function() {
    return (
      <div>
        <img src={this.props.src} />
      </div>
    )
  }
});
