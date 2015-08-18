var React = require('react'),
    reduce = require('lodash/collection/reduce'),
    range  = require('lodash/utility/range');

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

module.exports = React.createClass({
  displayName: 'Editor',
  componentDidMount: function () {
    // Preload last 30 seconds
    this.preloadImageRange(
      dateMaths(this.props.endTime, -30),
      this.props.endTime
    );
  },
  getInitialState: function () {
    return {
      dragDistance: 0,
      isDragging: false,
      currentTime: this.props.endTime
    };
  },
  getDefaultProps: function () {
    return {
      startTime: new Date('2015-05-23T23:28:00Z'),
      endTime: new Date('2015-05-23T23:58:00Z')
    };
  },
  durationSecs: function (start, end) {
    return ( end.getTime() - start.getTime() ) / 1000;
  },
  // /$size/$year/$month/$date/$hour/$min/$sec/$frame.jpg
  frameForTime: function (date, size, tmpl) {
    var tokens = {
      '$size' : size,
      '$frame': '1',
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
  preloadImage: function (url) {
    var img = new Image();
    img.src = url;
  },
  preloadImageRange: function (startTime, endTime) {
    var timeRangeSecs = range( dateInSec(startTime), dateInSec(endTime) );
    timeRangeSecs.forEach( (r) => {
      this.preloadImage(
        this.frameForTime( new Date(r * 1000), '720', this.props.frameTemplate )
      );
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
      currentSliderValue: secsFromStartTime,
      currentTime: currentTime
    });
  },
  render: function() {
    var className = 'editor container' + (this.state.isDragging ? ' is-dragging ' : ''),
        currentFrameSrc = this.frameForTime(this.state.currentTime, '720', this.props.frameTemplate),
        steps = this.durationSecs(this.props.startTime, this.props.endTime);
    return (<div className={ className }>
      <TouchPane
        className="editor-touch-container"
        onPan={this.handlePan}>
        <Frame
          src={currentFrameSrc} />
      </TouchPane>
      <Slider
        totalSteps={steps}
        value={this.state.currentSliderValue}
        onChange={this.handleSliderChange} />
    </div>);
  }
});
