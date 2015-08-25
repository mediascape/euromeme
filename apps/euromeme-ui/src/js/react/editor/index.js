var React = require('react'),
    reduce = require('lodash/collection/reduce'),
    flatten= require('lodash/array/flatten'),
    range  = require('lodash/utility/range'),
    times  = require('lodash/utility/times');

var TouchPane = require('./touch-pane'),
    Frame = require('./frame'),
    Slider = require('./slider'),
    ActionsList  = require('../actions-list'),
    dates = require('../../util/dates');

module.exports = React.createClass({
  displayName: 'Editor',
  propTypes: {
    startDate: React.PropTypes.instanceOf(Date).isRequired,
    endDate  : React.PropTypes.instanceOf(Date).isRequired,
    frameTemplate: React.PropTypes.string.isRequired,
    onCreateClip: React.PropTypes.func.isRequired,
    onClose: React.PropTypes.func.isRequired
  },
  draggingTimeout: null,
  componentDidMount: function () {
    // Preload last 30 seconds
    this.preloadImageRange(
      dates.maths(this.props.endDate, -30),
      this.props.endDate
    );
  },
  componentWillUpdate: function (nextProps, nextState) {
    var draggingDidStart = nextState.isDragging === true;

    if (draggingDidStart) {
      if (this.draggingTimeout) {
        clearTimeout(this.draggingTimeout);
        this.draggingTimeout = null;
      }

      this.draggingTimeout = setTimeout(this.cancelDragging, 1000);
    }
  },
  getInitialState: function () {
    return {
      dragDistance: 0,
      draggingTimeout: null,
      isDragging: false,
      currentDate: this.props.endDate
    };
  },
  cancelDragging: function () {
    console.log('cancelDragging');
    this.setState({
      isDragging: false
    });
    this.draggingTimeout = null;
  },
  // /$size/$year/$month/$date/$hour/$min/$sec/$frame.jpg
  frameForTime: function (date, size, frame, tmpl) {
    var tokens = {
      '$size' : size.toString(),
      '$frame': frame.toString(),
      '$year' : date.getUTCFullYear(),
      '$month': date.getUTCMonth() + 1,
      '$date' : date.getUTCDate(),
      '$hour' : date.getUTCHours(),
      '$min'  : date.getUTCMinutes(),
      '$sec'  : date.getUTCSeconds()
    };
    var url = reduce(
                      tokens,
                      (acc, value, key) => {
                        var val = (typeof value !== 'string' && value < 10) ? '0' + value : value;
                        return acc.replace(key, val);
                      },
                      tmpl
                  );
    return url;
  },
  framesForTime: function (start, end, size, tmpl, framesPerSec=1) {
    var range = dates.rangeInSec(start, end);
    return flatten(
      range.map( (r) => {
        return times(framesPerSec, (count) => {
          return this.frameForTime( new Date(r * 1000), size, count + 1, tmpl );
        });
      })
    );
  },
  preloadImage: function (url) {
    var img = new Image();
    img.src = url;
  },
  preloadImageRange: function (startDate, endDate, shouldIncludeSubFrames=false) {
    var frames = this.framesForTime(startDate, endDate, '720', this.props.frameTemplate);
    frames.forEach( (r) => {
      this.preloadImage(r);
    });
  },
  handlePan: function (evt) {
    console.log(evt.deltaX);
    if (evt.isFinal) {
      this.setState({ isDragging: false });
    } else {
      this.setState({ isDragging: true, dragDistance: evt.deltaX });
    }
  },
  handleSliderChange: function (secsFromStartDate) {
    var currentDate = dates.maths( this.props.startDate, secsFromStartDate );
    this.setState({
      isDragging: true,
      currentSliderValue: secsFromStartDate,
      currentDate: currentDate
    });
  },
  handleCreateClip: function () {
    this.props.onCreateClip({
      startDate: this.state.currentDate,
      endDate: dates.maths(this.state.currentDate, 6)
    });
  },
  render: function() {
    var className = 'editor ' + (this.state.isDragging ? ' is-dragging ' : ''),
        frames = this.framesForTime(this.state.currentDate, dates.maths(this.state.currentDate, 6), '720', this.props.frameTemplate, 5 /* framesPerSec */),
        steps = dates.durationInSec(this.props.startDate, this.props.endDate),
        selectionSteps = 6 /* 6 seconds */;

    return (<div className={ className }>
      <TouchPane
        className="editor-touch-container"
        onPan={this.handlePan}>
        <Frame
          frames={frames} />
      </TouchPane>
      <Slider
        min={0}
        max={steps}
        step={1}
        sliderStepSize={selectionSteps}
        value={this.state.currentSliderValue}
        defaultValue={steps}
        onChange={this.handleSliderChange} />
      <ActionsList onClose={this.props.onClose}>
        <button
          className="editor-clip-button"
          onClick={this.handleCreateClip}>Share</button>
      </ActionsList>
    </div>);
  }
});
