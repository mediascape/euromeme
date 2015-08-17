var React  = require('react'),
    Hammer = require('react-hammerjs');

module.exports = React.createClass({
  displayName: 'Editor:TouchPane',
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
              onPan={this.props.onPan}
              options={options}>
            Tap Me
          </Hammer>);
  }
});
