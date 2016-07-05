var io;

function setupSocket(socket) {
  socket.on('disconnect', function() {
    console.log('on disconnect.');
  });

  socket.on('device', function (sn) {
    if (!sn) {
      return;
    }

    Log.find({
      sn: sn,
      events: 'sensor-update',
      updatedTime: {
        $gte: new Date().getTime() - 24 * 60 * 60 * 1000
      }
    },'sensor updatedTime', function(err, logs) {
        io.emit('initData', logs);
    });
  });
}

module.exports = function(app) {
  io = require('socket.io')(app.get('server'));
  io.set('transports', ['polling']);
  io.on('connection', function (socket) {
    console.log('on connection.');
    setupSocket(socket);
  });

  return function (req, res, next) {
    next(null, io);
  };
};
