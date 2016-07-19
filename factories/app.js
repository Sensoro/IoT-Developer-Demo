var crypto = require('crypto');
var config = require('config');

var error = new Error('Invalid signature');
error.status = 400;

var SECRET = config.sensoro.appSecret;

/**
 * 消息体签名检验是开发者与 SENSORO IoT 云平台相互请求的鉴权方式
 * see:  http://docs.sensoro.com/cloud/auth.html
 */
function verifySignatrue(req, callback) {
   var url = (req.headers['x-forwarded-proto'] || req.protocol) + '://' + req.get('host') + req.originalUrl;
  // 生成 ACCESS_NONCE，值为当前的 Unix 时间，单位为毫秒
  var ACCESS_NONCE = req.headers['x-access-nonce'];

  var BodyRaw = '';
  if (req.body && req.body instanceof Object) {
    try{
        BodyRaw = JSON.stringify(req.body);
    }catch(e) {
        console.error(e);
    }
  }

  var original = new Buffer(ACCESS_NONCE +
                    req.method.toUpperCase() +
                    url + BodyRaw);
  var secret = crypto.createHmac('SHA256', SECRET)
  .update(original).digest('base64');

  if (req.headers['x-access-signature'] !== secret) {
    return callback(error);
  }

  callback();
}

module.exports = function() {
    return function(req, res, next) {
        verifySignatrue(req, next);
    };
};