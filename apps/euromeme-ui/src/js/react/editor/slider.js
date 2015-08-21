var React  = require('react'),
    linearScale = require('d3-scale').linear;

var TouchPane = require('./touch-pane');

module.exports = React.createClass({
  displayName: 'Editor:Slider',
  getInitialState: function () {
    return {
      x: 0
    };
  },
  componentDidMount: function () {
    var $container = React.findDOMNode(this.refs.container),
        containerWidth = $container.getBoundingClientRect().width,
        $selection = React.findDOMNode(this.refs.selection),
        selectionWidth = $selection.getBoundingClientRect().width;

    // Create a scale to translate between screen pixels
    // and step increments on the slider
    this.pxToSteps = linearScale();
    this.pxToSteps
      .domain([0, containerWidth - selectionWidth])
      .rangeRound([0, this.props.max])
      .clamp([true]);

    // Translate between step increments on the slider
    // and screen pixels
    this.stepsToPx = (step) => {
      return this.pxToSteps.invert(step);
    };

    // Trigger initial layout
    this.componentWillReceiveProps(this.props);
  },
  componentWillReceiveProps: function (nextProps) {
    var value = (nextProps.value != null) ? nextProps.value : nextProps.defaultValue,
        x = this.stepsToPx(value);

    this.setState({ x: x });
  },
  handleChange: function (evt) {
    var x    = evt.center.x,
        step = this.pxToSteps(x);

    this.props.onChange(step);
  },
  selectionWidthPercent: function () {
    var selectionSec   = this.props.sliderStepSize,
        trackSec       = this.props.max,
        selectionWidth = selectionSec / trackSec;

    return (selectionWidth * 100) + '%';
  },
  render: function() {
    var min = this.props.min,
        max = this.props.max,
        x = this.state.x,
        value = this.props.value;

    return (
      <div className="editor-slider-container">
        <div ref="container" className="editor-slider-track">
          <TouchPane
            className="editor-slider-selection-touch-pane"
            onPan={this.handleChange}>
            <div
              ref="selection"
              className="editor-slider-selection"
              style={{
                width: this.selectionWidthPercent(),
                transform: 'translateX(' + x + 'px)'
              }}>
            </div>
          </TouchPane>
        </div>
      </div>
    )
  }
});
