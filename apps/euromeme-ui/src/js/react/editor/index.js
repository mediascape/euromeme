var React = require('react'),
    reduce = require('lodash/collection/reduce');

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

module.exports = React.createClass({
  displayName: 'Editor',
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
    console.log('tmpl', tmpl);
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

    console.log('url', url);
    return url;
  },
  handlePan: function (evt) {
    console.log(evt.deltaX)
    if (evt.isFinal) {
      this.setState({ isDragging: false });
    } else {
      this.setState({ isDragging: true, dragDistance: evt.deltaX });
    }
  },
  handleSliderChange: function (secsFromStartTime) {
    var msFromStartTime = secsFromStartTime * 1000;
    var currentTime = new Date(this.props.startTime.getTime() + msFromStartTime);
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
