var models = require('require-directory')(module);
var mongoose = require('mongoose');
var config = require('config');
var lingo = require('lingo');

mongoose.connect('mongodb://' + config.mongodb.host + '/' + config.mongodb.database);

var self = module.exports = {};

Object.keys(models).forEach(function(key) {
  if (key !== 'index') {
    var modelName = lingo.capitalize(key);
    self[modelName] = mongoose.model(modelName, models[key]);
  }
});

self.DB = mongoose;