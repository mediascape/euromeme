var React  = require('react');

module.exports = React.createClass({
  displayName: 'Editor:Slider',
  render: function() {
    return (
      <div className="editor-slider-container">
        <input type="range" min="0" max="10" step="1" />
      </div>
    )
  }
});
