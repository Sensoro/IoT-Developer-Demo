var express = require('express');
require('express-di');

var app = module.exports = express();

app.use(require('morgan')('dev'));

var bodyParser = require('body-parser');
app.use(bodyParser.json());

require('./factories')(app);
require('./routes')(app);
require('./models');

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/* jshint unused:false */
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      env: 'development',
      message: err.message,
      error: err
    });
  });
}

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});

if (app.get('env') !== 'test') {
  app.listen(process.env.PORT || 3000);
}