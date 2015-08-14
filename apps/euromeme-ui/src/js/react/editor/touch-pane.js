var React  = require('react'),
    Hammer = require('react-hammerjs');

module.exports = React.createClass({
  displayName: 'Editor:TouchPane',
  handlePan: function (evt) {
    if (this.props.onPan) {
      this.props.onPan({ x: evt.deltaX });
    }
  },
  render: function() {
    var options = {
      // touchAction: true,
      recognizers: {
        pan: {
          direction: 6 /* DIRECTION_HORIZONTAL */
        }
      }
    };
    return (<Hammer
              onPan={this.handlePan}
              options={options}>
            Tap Me
          </Hammer>);
  }
});
