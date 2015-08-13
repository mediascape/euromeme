var React = require('react');

module.exports = React.createClass({
  displayName: 'DeviceList',
  createEventHandlerForItem: function (data) {
    return function () {
      console.log('Device selected', data);
      if (this.props.onDeviceSelected) {
        this.props.onDeviceSelected(data);
      }
    }.bind(this);
  },
  deviceList: function () {
    var self = this;
    return this.props.devices.map(function (device, index) {
      var handler = self.createEventHandlerForItem(device);
      return <li key={index} onClick={handler} className="device-list-item">{device.host}</li>;
    });
  },
  render: function() {
    return (
      <div className="device-list">
        <h2 className="device-list-hd">Connect to TV</h2>
        <ul className="device-list-list">
          {this.deviceList()}
        </ul>
      </div>
    );
  }
});
