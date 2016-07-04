var express = require('express');

var app = module.exports = express();

/**
 * 过滤推送数据
 * 参加 http://docs.sensoro.com/cloud/webhook.html 推送数据格式。
 */

function purifyWebhooksData (data) {
  var results = {};
  Device.PROPERTIES.forEach(function(property) {
    results[property] = data[property];
  });

  return results;
}

app.post('/webhooks', function(app, req, res) {
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

  Device.findOneAndUpdate({
    sn: req.body.sn
  }, {
    $set: {
      sensorData: data
    }
  }, {
    upsert: true
  }).then(function(err) {
    if (err) {
      console.error(err);
    }

    Log.create({
      sn: req.body.sn,
      events: 'sensor-update',
      sensor: data
    }).then();
  });
});
