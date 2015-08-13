var React = require('react');

var Container = require('./react/container.js');

React.initializeTouchEvents(true);
React.render(<Container />, document.querySelector('#app-container'));
