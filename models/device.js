/**
 * 终端设备
 */

var mongoose = require('mongoose');

var PROPERTIES = ['lonlat', 'light', 'temperature', 'humidity', 'customer', 'battery'];

var schema = module.exports = new mongoose.Schema({
  sn: { type: String, unique: true },
  sensorData: {
    light: Number,
    temperature: Number,
    lonlat: { type: [Number], index: '2d', default: [0, 0] },
    humidity: Number,
    battery: Number,
    customer:String //自定义数据
  },
  createTime: { type: Date, default: Date.now },
  updatedTime: Date
});

schema.index({sn: -1 });

schema.statics.PROPERTIES = PROPERTIES;

schema.pre('save', function(next) {
  this.updatedTime = this.updatedTime || new Date();
  next();
});

if (!schema.options.toJSON) {
  schema.options.toJSON = {};
}
schema.options.toJSON.transform = function (doc, ret) {
  ret.createTime = ret.createTime && ret.createTime.valueOf();
  ret.updatedTime = ret.updatedTime && ret.updatedTime.valueOf();
  if (ret.sensorData) {
    if (ret.sensorData.light) {
      ret.sensorData.light = parseFloat(ret.sensorData.light.toFixed(2));
    }

    if (ret.sensorData.temperature) {
      ret.sensorData.temperature = parseFloat(ret.sensorData.temperature.toFixed(2));
    }

    if (ret.sensorData.humidity) {
      ret.sensorData.humidity = parseFloat(ret.sensorData.humidity.toFixed(2));
    }
  }

  delete ret._id;
};