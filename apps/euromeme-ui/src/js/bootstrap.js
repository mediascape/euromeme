var React = require('react');

var Application = require('./react/application.js');

React.initializeTouchEvents(true);
React.render(<Application />, document.querySelector('#app-container'));
