var React = require('react');

var LoaderView = require('./loader-view');

module.exports = React.createClass({
  displayName: 'DeviceList',
  propTypes: {
    devices: React.PropTypes.array.isRequired,
    onDeviceSelected: React.PropTypes.func
  },
  createEventHandlerForItem: function (data) {
    return function () {
      console.log('Device selected', data);
      if (this.props.onDeviceSelected) {
        this.props.onDeviceSelected(data);
      }
    }.bind(this);
  },
  loadingMessage: function () {
    return (
      <LoaderView key="loader" isError={false}>
        Discovering TVs on the network
      </LoaderView>
    );
  },
  deviceList: function () {
    var self = this;
    return this.props.devices.map(function (device, index) {
      var handler = self.createEventHandlerForItem(device);
      return <li key={device.name} onClick={handler} className="device-list-item">{device.name}</li>;
    });
  },
  render: function() {
    var numDevices = this.props.devices.length,
        content = numDevices === 0
                    ? this.loadingMessage()
                    : <ul className="device-list-list">{this.deviceList()}</ul>;
    return (
      <div className="device-list">
        <h2 className="device-list-hd">Connect to TV</h2>
        <span>{numDevices} found</span>
        {content}
      </div>
    );
  }
});
