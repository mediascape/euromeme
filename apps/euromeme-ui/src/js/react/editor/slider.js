var React  = require('react'),
    linear = require('d3-scale').linear;

var TouchPane = require('./touch-pane');

module.exports = React.createClass({
  displayName: 'Editor:Slider',
  getInitialState: function () {
    return {
      prevX: 0,
      x: 0
    };
  },
  componentDidMount: function () {
    var $container = React.findDOMNode(this.refs.container),
        containerWidth = $container.getBoundingClientRect().width,
        $selection = React.findDOMNode(this.refs.selection),
        selectionWidth = $selection.getBoundingClientRect().width;

    this.scale = linear();
    this.scale.domain([0, containerWidth]);
    this.scale.rangeRound([0, this.props.max])

    this.setState({
      containerWidth,
      selectionWidth
    });
  },
  handleChange: function (evt) {
    var maxX = this.state.containerWidth - this.state.selectionWidth,
        x = this.state.prevX + evt.deltaX,
        state;

    console.log('handleChange', x, this.state.selectionWidth, this.state.containerWidth);

    if ( x < 0) {
      x = 0;
    }

    if ( x > maxX) {
      x = maxX;
    }

    // Snap to step
    var step = this.scale(x);
    console.log('step', step);

    if (evt.isFinal) {
      state = { x: x, prevX: x };
    } else {
      state = { x: x };
    }

    console.log('state', state);
    this.setState(state);

    this.props.onChange(step);
    //this.props.onChange(evt.target.value);
  },
  selectionWidthPercent: function () {
    var selectionSec   = this.props.step,
        trackSec       = this.props.max,
        selectionWidth = selectionSec / trackSec;

    return (selectionWidth * 100) + '%';
  },
  snapPixelToStep: function (px) {

  },
  pixelLocationToSecs: function () {

  },
  render: function() {
    var min = this.props.min,
        max = this.props.max,
        x = this.state.x,
        value = this.props.value;
        console.log('x', x);
    return (
      <div className="editor-slider-container">
        <div ref="container" className="editor-slider-track">
          <div
            ref="selection"
            className="editor-slider-selection"
            style={{
              width: this.selectionWidthPercent(),
              transform: 'translateX(' + x + 'px)'
            }}>
            <TouchPane
              className="editor-slider-selection-touch-pane"
              onPan={this.handleChange}>
            </TouchPane>
          </div>
        </div>
      </div>
    )
  }
});

/*
<input type="range"
        step="1"
        min={min}
        max={max}
        value={value}
        defaultValue={max}
        onChange={this.handleChange} />*/
