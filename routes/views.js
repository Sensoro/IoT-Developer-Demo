var express = require('express');

var app = module.exports = express();

var moment = require('moment');


//传感器数据列表数据数据
app.get('/sensors', function(req, res) {
  var results = {
    total: 0,
    rows: []
  };

  var queryCount = Device.count({});
  var query = Device.find({});

  if (req.query.search) {
    query.and({
      sn: {
        $regex: req.query.search,
        $options: 'i'
      }
    });
    queryCount.and({
       sn: {
        $regex: req.query.search,
        $options: 'i'
      }
    });
  }

  if (req.query.offset && req.query.limit) {
    query.skip(Number(req.query.offset));
    query.limit(Number(req.query.limit));
  } else {
    query.skip(0);
    query.limit(Number(req.query.count) || 20);
  }

  if (req.query.order) {
    if (req.query.order == 'desc') req.query.sort = '-' + req.query.sort;
  }

  query.sort(req.query.sort).exec(function(err, data) {
    if (err) {
      return results;
    }

    results.rows = data.map(function(item) {
      item = item.toJSON();
      item.sn = '<a href="/views/details?sn=' + item.sn + '" title="详情"><span>' + item.sn +'</span></a>';
      item.updatedTime = item.updatedTime && moment(item.updatedTime).format('YYYY-MM-DD HH:mm:ss');
      return item;
    });

    queryCount.exec(function(err, count) {
      if (err) {
        return results;
      }

      results.total = count;
      res.status(200).json(results);
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