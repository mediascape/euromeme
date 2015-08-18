var React = require('react'),
    reduce = require('lodash/collection/reduce'),
    flatten= require('lodash/array/flatten'),
    range  = require('lodash/utility/range'),
    times  = require('lodash/utility/times');

var TouchPane = require('./touch-pane'),
    Frame = require('./frame'),
    Slider = require('./slider');

var momentDateFormatTokens = {
  '$year' : 'YYYY',
  '$month': 'MM',
  '$date' : 'DD',
  '$hour' : 'HH',
  '$min'  : 'mm',
  '$sec'  : 'ss'
};

/*
  increment/decrement a date object by incrementSec
  seconds. Returns a new date.
*/
var dateMaths = function (date, incrementSec) {
  return new Date( date.getTime() + (incrementSec * 1000) );
};

var dateInSec = function (date) {
  return date.getTime() / 1000;
};

var timeRangeSecs = function (start, end) {
  return range( dateInSec(start), dateInSec(end) );
}

module.exports = React.createClass({
  displayName: 'Editor',
  draggingTimeout: null,
  componentDidMount: function () {
    // Preload last 30 seconds
    this.preloadImageRange(
      dateMaths(this.props.endTime, -30),
      this.props.endTime
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
      currentTime: this.props.endTime
    };
  },
  getDefaultProps: function () {
    return {
      startTime: new Date('2015-05-23T23:28:00Z'),
      endTime: dateMaths(new Date('2015-05-23T23:58:00Z'), -6)
    };
  },
  cancelDragging: function () {
    console.log('cancelDragging');
    this.setState({
      isDragging: false
    });
    this.draggingTimeout = null;
  },
  durationSecs: function (start, end) {
    return dateInSec(end) - dateInSec(start);
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
    var range = timeRangeSecs(start, end);
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
  preloadImageRange: function (startTime, endTime, shouldIncludeSubFrames=false) {
    var frames = this.framesForTime(startTime, endTime, '720', this.props.frameTemplate);
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
  handleSliderChange: function (secsFromStartTime) {
    var currentTime = dateMaths( this.props.startTime, secsFromStartTime );
    this.setState({
      isDragging: true,
      currentSliderValue: secsFromStartTime,
      currentTime: currentTime
    });
  },
  render: function() {
    var className = 'editor container' + (this.state.isDragging ? ' is-dragging ' : ''),
        frames = this.framesForTime(this.state.currentTime, dateMaths(this.state.currentTime, 6), '720', this.props.frameTemplate, 5 /* framesPerSec */),
        steps = this.durationSecs(this.props.startTime, this.props.endTime);

    return (<div className={ className }>
      <TouchPane
        className="editor-touch-container"
        onPan={this.handlePan}>
        <Frame
          frames={frames} />
      </TouchPane>
      <Slider
        totalSteps={steps}
        value={this.state.currentSliderValue}
        onChange={this.handleSliderChange} />
    </div>);
  }
});
