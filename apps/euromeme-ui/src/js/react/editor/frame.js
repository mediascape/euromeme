var React  = require('react');

module.exports = React.createClass({
  displayName: 'Editor:Frame',
  render: function() {
    return (
      <div className="editor-frame-container">
        <img src={this.props.src} />
      </div>
    )
  }
});
