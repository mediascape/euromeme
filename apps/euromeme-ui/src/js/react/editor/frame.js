var React  = require('react');

var interval = require('../../util/request-interval');

module.exports = React.createClass({
  displayName: 'Editor:Frame',
  getInitialState: function () {
    return {
      currentFrameIndex: 0
    };
  },
  componentDidMount: function () {
    interval.requestInterval(this.advanceFrame, 150);
  },
  advanceFrame: function () {
    var newIndex = (this.state.currentFrameIndex + 1) % this.props.frames.length;
    this.setState({ currentFrameIndex: newIndex });
  },
  render: function() {
    var frame = this.props.frames[this.state.currentFrameIndex];
    return (
      <div className="editor-frame-container">
        <img src={frame} />
      </div>
    )
  }
});
