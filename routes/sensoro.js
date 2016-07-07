var express = require('express');

var app = module.exports = express();

var MsgCrypt = require('wechat-crypto');
var config = require('config');

/**
 * 过滤推送数据
 * 参加 http://docs.sensoro.com/cloud/webhook.html 推送数据格式。
 */

function purifyWebhooksData (data) {
  var results = {};
  Device.PROPERTIES.forEach(function(property) {
    if (data[property]) results[property] = data[property];
  });

  return results;
}

app.post('/webhooks', function(io, app, req, res) {
  console.log('Echo SENSORO POST Data :: ');
  console.log(req.body);

  if (!req.body.sn || (!req.body.data && !req.body.encryptData)) {
    return res.status(400).json({
      info: 'No sn or data.'
    });
  }

  res.status(200).json({
    message: 'success'
  });

  var data = {};
  if (req.body.data) {
    data = purifyWebhooksData(req.body.data);
  }

  if (req.body.encryptData) {
    var crypter = new MsgCrypt(config.appSecret, config.appKey, config.appId);
    var decryptData = crypter.decrypt(req.body.encryptData).message; //加密需要发送的数据部分
    if (!decryptData.id) {
      return console.warn('decrypt faild.');
    }

    try {
      data = purifyWebhooksData(JSON.parse(decryptData.message));
    } catch (e) {
      if (e) {
        return console.error(e);
      }
    }
  }

  Device.findOneAndUpdate({
    sn: req.body.sn
  }, {
    $set: {
      sensorData: data,
      updatedTime: new Date()
    }
  }, {
    upsert: true
  }).exec(function(err) {
    if (err) {
      console.error(err);
    }

    var newLog = new Log({
      sn: req.body.sn,
      events: 'sensor-update',
      sensor: data
    });

    newLog.save(function(err, log) {
       io.emit('sensor-update', log);
    });
  });
});
