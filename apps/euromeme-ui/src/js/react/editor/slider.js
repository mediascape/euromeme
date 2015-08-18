var React  = require('react');

module.exports = React.createClass({
  displayName: 'Editor:Slider',
  handleChange: function (evt) {
    this.props.onChange(evt.target.value);
  },
  render: function() {
    var min = 0,
        max = this.props.totalSteps,
        value = this.props.value;
    return (
      <div className="editor-slider-container">
        <input type="range"
                step="1"
                min={min}
                max={max}
                value={value}
                defaultValue={max}
                onChange={this.handleChange} />
      </div>
    )
  }
});
