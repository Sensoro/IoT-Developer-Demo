var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var config = require('config');

var schema = module.exports = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  updatedTime: { type: Date },
  createdTime: { type: Date, default: Date.now }
});

schema.pre('save', function(next) {
  this.updatedTime = new Date();

  var self = this;
  if (!self.isModified('password')) return next();
  bcrypt.hash(self.password, config.bcrypt.rounds, function(err, hash) {
    if (err) return next(err);
    self.password = hash;
    next();
  });
});

schema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

if (!schema.options.toJSON) schema.options.toJSON = {};
schema.options.toJSON.transform = function (doc, ret) {
  delete ret.password;
  ret.id = ret._id;
  delete ret._id;
};
