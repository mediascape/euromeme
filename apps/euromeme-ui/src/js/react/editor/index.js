var React = require('react');

var TouchPane = require('./touch-pane'),
    Frame = require('./frame'),
    Slider = require('./slider');

module.exports = React.createClass({
  displayName: 'Editor',
  getInitialState: function () {
    return {
      dragDistance: 0,
      isDragging: false,
      currentFrameSrc: null
    };
  },
  handlePan: function (evt) {
    console.log(evt.deltaX)
    if (evt.isFinal) {
      this.setState({ isDragging: false });
    } else {
      this.setState({ isDragging: true, dragDistance: evt.deltaX });
    }
  },
  handlePanMove: function (evt) {
    console.log('pan', evt);
  },
  render: function() {
    var className = 'editor container' + (this.state.isDragging ? ' is-dragging ' : '');
    return (<div className={ className }>
      <TouchPane
        className="editor-touch-container"
        onPan={this.handlePan}>
        <Frame
          src={this.state.currentFrameSrc} />
      </TouchPane>
      <Slider />
    </div>);
  }
});
