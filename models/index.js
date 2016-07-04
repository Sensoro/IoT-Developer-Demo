var models = require('require-directory')(module);
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var config = require('config');
var lingo = require('lingo');

var mongodbConnString = 'mongodb://' + config.mongodb.host + '/' + config.mongodb.database;

if (config.mongodb.replsets && config.mongodb.replsets.length) {
  mongodbConnString = 'mongodb://' + config.mongodb.host;
  config.mongodb.replsets.forEach(function(replset) {
    mongodbConnString += (',' + 'mongodb://' + replset.host);
  });

  mongodbConnString += '/' + config.mongodb.database;
}

if (config.mongodb.username && config.mongodb.password) {
  mongoose.connect(mongodbConnString, {
    user: config.mongodb.username,
    pass:config.mongodb.password,
    db: {
      readPreference: 'secondaryPreferred'
    }
  });
} else {
  mongoose.connect(mongodbConnString);
}

var self = module.exports = {};

Object.keys(models).forEach(function(key) {
  if (key !== 'index') {
    var modelName = lingo.capitalize(key);
    self[modelName] = mongoose.model(modelName, models[key]);
  }
});

self.DB = mongoose;