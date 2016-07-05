# IoT Devloper Demo API

> SENSORO IoT 云平台为软件开发者提供 IoT 传感器数据实时推送, 通过 Webhook(自定义回调URL) 和 MQTT 两种方式将消息推送给开发者，当终端设备数据发生变化时，开发者能够接收到实时通知。

> 目前提供 Node.js 版本 Demo，对接 Webhook 回调请求的传感器数据，存储至 MongoDB 数据库，使用 Socket.IO 推送 Demo 前端动态展示。

# Links

* [IoT official websites](https://iot.sensoro.com/manage/developer)	
* [IoT developer Docs](http://http://docs.sensoro.com/cloud/index.html)
* [API 权限校验](http://docs.sensoro.com/cloud/auth.html)

## Quick Start

### Installation
 	
 	$ git clone https://github.com/Sensoro/IoT-Devloper-Demo
 	$ npm install
 	$ cp config/_sample.json config/developer.json && vim config/developer.json 
 	
### Usage

1. 下载后，将开发者信息 AppId, AppSecret, AppKey 填写至 config 配置文件。
2. npm start 后，服务能够外网访问，将服务中接收 Webhook 回调请求的 URL 填写到 IoT 云平台 - [开发者](https://iot.sensoro.com/manage/developer) - API 地址栏, 此 Demo 的路由地址为 `http://YOUR_DOMAIN/sensoro/webhooks`
3. 当有数据推送时查看是否正确接收数据。

### FAQ

1. 签名不正确?

	检查配置文件 AppId, AppSecret, AppKey 是否填写正确，配置文件需与 NODE_ENV 环境变量对应。

    factories/app.js 检查 req.headers['x-forwarded-proto'] 是否正确，不同的反向代理配置会对此字段哟影响， 如果是 Nginx 反向代理，请配置 `proxy_set_header X-Forwarded-Proto $scheme;`
 2. pm2 start 多个实例
    
    socket.io 不支持在相同端口 pm2 start 多个实例。
