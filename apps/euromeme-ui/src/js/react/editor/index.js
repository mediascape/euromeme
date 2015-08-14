var React = require('react');

var TouchPane = require('./touch-pane');

module.exports = React.createClass({
  displayName: 'Editor',
  handlePan: function (evt) {
    console.log('pan', evt);
  },
  render: function() {
    return (<div className="editor container">
      <TouchPane onPan={this.handlePan} />
    </div>);
  }
});
