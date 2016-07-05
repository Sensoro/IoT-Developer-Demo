var express = require('express');

var app = module.exports = express();

var moment = require('moment');
/**
 * 列表
    data = [{
      sn: 123456,
      sensorData: {
        light: 1,
        temperature: 2,
        lonlat: [116,137],
        humidity: 11
      }
    }, {
      sn: 6543221,
      sensorData: {
        light: 312,
        temperature: 212,
        lonlat: [116,137],
        humidity: 113
      }
    }];
 */

app.get('/', function (req, res) {
  var pageRenderParams = {
    page: Number(req.query.page) || 1,
    count: Number(req.query.count) || 20,
    total_count: 0,
    data: [],
    err_code: -1
  };

  var queryCount = Device.count({});
  var query = Device.find({});

  if (req.query.sn) {
    query.and({
      sn: req.query.sn
    });
    queryCount.and({
      sn: req.query.sn
    });
  }

  if (req.query.count && req.query.page) {
    query.skip(Number(req.query.count) * (Number(req.query.page) - 1 ));
    query.limit(Number(req.query.count));
  } else {
    query.skip(0);
    query.limit(Number(req.query.count) || 20);
  }

  query.exec(function(err, data) {
    if (err) {
      return res.render('index', pageRenderParams);
    }

    data = data.map(function(item) {
      item = item.toJSON();
      item.updatedTime = item.updatedTime && moment(item.updatedTime).format('YYYY-MM-DD HH:mm:ss');
      return item;
    });

    queryCount.exec(function(err, count) {
      if (err) {
        return res.render('index', pageRenderParams);
      }

      pageRenderParams.err_code = 0;
      pageRenderParams.total_count = count;
      pageRenderParams.data = data;

      res.render('index', pageRenderParams);
    });
  });
});

/**
 * 当天设备的数据详情
 */
app.get('/details', function(req, res) {
  if (!req.query.sn) {
    return res.redirect('/views');
  }

  var pageRenderParams = {
    logs: {},
    err_code: -1
  };

  Log.findOne({
    sn: req.query.sn,
    events: 'sensor-update',
    updatedTime: {
      $gte: new Date(moment().startOf('day')).getTime()
    }
  }, 'sensor').sort('updatedTime').exec(function(err, logs) {
    if (err) {
      res.render('detail', pageRenderParams);
    }

    pageRenderParams.err_code = 0;
    pageRenderParams.logs = logs;
    res.render('detail', pageRenderParams);
  });
});