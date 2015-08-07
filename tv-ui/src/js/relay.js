var ws = new WebSocket('ws://localhost:5001/relay');

ws.addEventListener('open',    function ()    { console.log('Websocket open'); });
ws.addEventListener('message', function (evt) { console.info('message', evt); });
ws.addEventListener('error',   function (err) { console.error('Websocket error', err.stack); });

module.exports = ws;