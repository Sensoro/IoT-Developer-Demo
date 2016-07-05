(function (window) {
  'use strict';

  /**
   * 1.建立 socket 连接, 向服务端发送设备 SN, 得到最近一天的初始化化数据(对象数组)
   * 2.从socket 推送中的到新数据（object）
   * 数据在前端统一处理
   */

  var socket;
  var sn = window.location.search.replace('?sn=','').split('&')[0];
  var data = [];

  function setupSocketIO() {
    socket = io();

    socket.on('connect', function() {
      console.log('connect success');
    });
    socket.on('disconnect', function() {
      console.log('connect disconnect');
    });
  }

  function getData(callback) {
    socket.emit('device', sn);
    socket.on('initData', function(logs) {
      logs.forEach(function(log) {
        data.push(formatEchartsData(log));
      });
      callback();
    });
  }

  function subData() {
    socket.on('sensor-update', function(log) {
      if (typeof log === 'string') {
        log = JSON.parse(log);
      }

      if (log.sn === sn) {
        data.shift();
        data.push(formatEchartsData(log));
      }
    });
  }

  /**
   * {
   *  sensor: {
   *    humidity: 30,
   *    light: 30,
   *    lonlat: [],
   *    temperature: 24
   *  },
   *  updatedTime: 1467687930608
   * }
   */

  function formatEchartsData(obj) {
    return {
      name: new Date(obj.updatedTime),
      value: [
        obj.updatedTime,
        obj.sensor && obj.sensor.temperature
      ]
    };
  }

  // 基于准备好的dom，初始化echarts实例
  var myChart = echarts.init(document.getElementById('echarts'));
  var option = {
      title: {
          text: '温度实时数据'
      },
      tooltip: {
          trigger: 'axis',
          show: true,
          formatter: function (params) {
              params = params[0];
              var date = new Date(params.name);
              return date.getFullYear() + '-' +(date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() +
              ':' + date.getMinutes() + ':'+ date.getSeconds() + '  温度: '  + params.value[1];
          },
          axisPointer: {
              animation: false
          }
      },
      xAxis: {
          type: 'time',
          splitLine: {
              show: false
          }
      },
      yAxis: {
          type: 'value',
          boundaryGap: [0, '100%'],
          splitLine: {
              show: false
          }
      },
      series: [{
          name: '模拟数据',
          type: 'line',
          showSymbol: true,
          hoverAnimation: true,
          data: data
      }]
  };

  //start ....
  setupSocketIO();
  getData(function() {
    subData();
    myChart.setOption(option);
  });
})(window);