var mongoose = require('mongoose');



var schema = module.exports = new mongoose.Schema({
  sn: String,
  events: { type: String, enum: ['sensor-update'], default: 'sensor-update'},
  sensor: {
    light: Number,
    temperature: Number,
    lonlat: [Number],
    humidity: Number,
    customer: String
  },
  updatedTime: { type: Date, default: Date.now, expires: '48h' }
});

schema.index({sn: -1, events: -1, updatedTime: -1 });

if (!schema.options.toJSON) {
  schema.options.toJSON = {};
}

schema.options.toJSON.transform = function (doc, ret) {
  ret.updatedTime = ret.updatedTime && ret.updatedTime.valueOf();
  delete ret.events;
  delete ret._id;
};
