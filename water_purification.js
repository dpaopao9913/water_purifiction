const Gpio                = require('onoff').Gpio;
const isWaterPurified_pin = new Gpio(4, 'in', 'rising');  // if water purification finished, raspi sends HIGH to this pin (default LOW)
const i2c                 = require('i2c-bus');
const ARDUINO_ADDR        = 0x8;
const I2C_DEVICE_NUMBER   = 1;

let isProgramStarted               = false;
let writeBuf                       = new Buffer.alloc(1);
let dt_start                       ;
let dt_finish                      ;
let formatted_dt_start             ;
let formatted_dt_finish            ;
let s_waterPurifiedNotificationMsg = '';

// monitor turbidity value
let i2c1              = i2c.openSync(I2C_DEVICE_NUMBER);  // i2c(1) bus is generally used
let readBuf           = new Buffer.alloc(1);              // 1 byte
const turbidity_thres = 70;                               // defined in Arduino
let g_turbidity       = -1;


// monitor water purification flag (0(default): not finished, 1: finished)
let g_isWaterPurified = false;
isWaterPurified_pin.watch( ( err, value ) => {
	if( err ) {
	  console.log( 'Error in isWaterPurified.watch()', err );
	}
	// log pin value (0 or 1)
	console.log( 'Water purification is finished. Pin value is ', value );
	g_isWaterPurified = value;

  dt_finish = new Date();

  s_waterPurifiedNotificationMsg = `\n\n\
最后净水信息:\n\
  开始时间： ${formatted_dt_start}\n\
  结束时间： ${formatted_dt_finish}\n\
  经过时间： ${((dt_finish - dt_start)/60/1000).toFixed(1)} 分钟\n\
  净水进度： ${(g_turbidity/turbidity_thres*100).toFixed(1)} % (浊度值 ${g_turbidity})\
`;

	isProgramStarted = false;
} );


function stopMonitorTurbidity() {
    clearInterval(monitor_turbidity_val);
}

const interval_time = 3000
let monitor_turbidity_val = setInterval(
    (err, val) => {
        if (err) {
            stopMonitorTurbidity();
            throw err;
        }
        i2c1.i2cReadSync(ARDUINO_ADDR, readBuf.length, readBuf);
		g_turbidity = parseInt(readBuf.toString("hex"), 16);
		console.log(`turbidity: ${g_turbidity}`);
    }, interval_time
);
/****************************************************************************/

const express = require('express');
const wechat  = require('wechat');
require('date-utils');
const port    = 3000;

const app = express();

const config = {
    debug: true,
    token: 'testwebot',           // tokenを書き換える
    appid: 'wxb65c62fdc1b55881'   // appidを書き換える
}

app.use(express.query());
// app.use('/webot', wechat(config, function (req, res, next) {
//     var message = req.weixin;    // チャットボットに話しかけた内容を受け取る
//     console.log(message);  
//     res.reply('Hello world!');   // チャットボットの返答内容を取得する
// }));
app.use('/webot', wechat(config, wechat.text(function (message, req, res, next) {
    // message为文本内容
    // { ToUserName: 'gh_d3e07d51b513',
    // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
    // CreateTime: '1359125035',
    // MsgType: 'text',
    // Content: 'http',
    // MsgId: '5837397576500011341' }

	//////////////////////////////////////////////////////////////////////////////
  if (message.Content == '净水开始') {
		if (isProgramStarted == false) {
			dt_start = new Date();
			formatted_dt_start = dt_start.toFormat("YYYY/MM/DD HH24:MI:SS");

			writeBuf[0] = 0x00;  // start water purification
			i2c1.i2cWriteSync(ARDUINO_ADDR, writeBuf.length, writeBuf);

			isProgramStarted  = true;
			g_isWaterPurified = false;

			res.reply(`自动净水系统正常开始了！\n开始时间： ${formatted_dt_start}`);
		}
		else{
			res.reply(`自动净水系统已经开始\n开始时间： ${formatted_dt_start}`);
		}
    }
	else if (message.Content == '净水结束'){ 
		if (isProgramStarted == true) {
			dt_finish = new Date();
			formatted_dt_finish = dt_finish.toFormat("YYYY/MM/DD HH24:MI:SS");

			writeBuf[0] = 0x01;  // forcely stop water purification
			i2c1.i2cWriteSync(ARDUINO_ADDR, writeBuf.length, writeBuf);

			isProgramStarted = false;

			res.reply(`\
自动净水系统正常结束了！\n\
结束时间： ${formatted_dt_finish} (已经过 ${((new Date()-dt_start)/60/1000).toFixed(1)} 分钟)\n\
净水进度： ${(g_turbidity/turbidity_thres*100).toFixed(1)} % (浊度值 ${g_turbidity})\
`);
		}
		else{
			res.reply(`自动净水系统还没开始\n请输入"净水开始"`);
		}
	}
	else if (message.Content == '净水状态'){
		if (isProgramStarted == false) {
			res.reply(`自动净水系统停止中${s_waterPurifiedNotificationMsg}`);
		}
		else{
			res.reply(`\
自动净水系统运行中\n\
开始时间： ${formatted_dt_start} (已经过 ${((new Date()-dt_start)/60/1000).toFixed(1)} 分钟)\n\
净水进度： ${(g_turbidity/turbidity_thres*100).toFixed(1)} % (浊度值 ${g_turbidity})\
`);
		}
	}
	else {
    	res.reply(`\
欢迎使用"自动净水系统"！\n\
\n\
★ 请输入"净水开始"，开始自动净水系统\n\
★ 请输入"净水结束"，强制结束自动净水系统\n\
★ 请输入"净水状态"，确认自动净水系统状态\
`);
    }
	//////////////////////////////////////////////////////////////////////////////
    
  }).image(function (message, req, res, next) {
    // message为图片内容
    // { ToUserName: 'gh_d3e07d51b513',
    // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
    // CreateTime: '1359124971',
    // MsgType: 'image',
    // PicUrl: 'http://mmsns.qpic.cn/mmsns/bfc815ygvIWcaaZlEXJV7NzhmA3Y2fc4eBOxLjpPI60Q1Q6ibYicwg/0',
    // MediaId: 'media_id',
    // MsgId: '5837397301622104395' }
    res.reply('This is image,\nplease send text.');
  }).voice(function (message, req, res, next) {
    // message为音频内容
    // { ToUserName: 'gh_d3e07d51b513',
    // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
    // CreateTime: '1359125022',
    // MsgType: 'voice',
    // MediaId: 'OMYnpghh8fRfzHL8obuboDN9rmLig4s0xdpoNT6a5BoFZWufbE6srbCKc_bxduzS',
    // Format: 'amr',
    // MsgId: '5837397520665436492' }
    res.reply('This is voice,\nplease send text.');
  }).video(function (message, req, res, next) {
    // message为视频内容
    // { ToUserName: 'gh_d3e07d51b513',
    // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
    // CreateTime: '1359125022',
    // MsgType: 'video',
    // MediaId: 'OMYnpghh8fRfzHL8obuboDN9rmLig4s0xdpoNT6a5BoFZWufbE6srbCKc_bxduzS',
    // ThumbMediaId: 'media_id',
    // MsgId: '5837397520665436492' }
    res.reply('This is video,\nplease send text.');
  }).shortvideo(function (message, req, res, next) {
    // message为短视频内容
    // { ToUserName: 'gh_d3e07d51b513',
    // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
    // CreateTime: '1359125022',
    // MsgType: 'shortvideo',
    // MediaId: 'OMYnpghh8fRfzHL8obuboDN9rmLig4s0xdpoNT6a5BoFZWufbE6srbCKc_bxduzS',
    // ThumbMediaId: 'media_id',
    // MsgId: '5837397520665436492' }
    res.reply('This is shortvideo,\nplease send text.');
  }).location(function (message, req, res, next) {
    // message为位置内容
    // { ToUserName: 'gh_d3e07d51b513',
    // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
    // CreateTime: '1359125311',
    // MsgType: 'location',
    // Location_X: '30.283950',
    // Location_Y: '120.063139',
    // Scale: '15',
    // Label: {},
    // MsgId: '5837398761910985062' }
    res.reply('This is location,\nplease send text.');
  }).link(function (message, req, res, next) {
    // message为链接内容
    // { ToUserName: 'gh_d3e07d51b513',
    // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
    // CreateTime: '1359125022',
    // MsgType: 'link',
    // Title: '公众平台官网链接',
    // Description: '公众平台官网链接',
    // Url: 'http://1024.com/',
    // MsgId: '5837397520665436492' }
    res.reply('This is link,\nplease send text.');
  }).event(function (message, req, res, next) {
    // message为事件内容
    // { ToUserName: 'gh_d3e07d51b513',
    // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
    // CreateTime: '1359125022',
    // MsgType: 'event',
    // Event: 'LOCATION',
    // Latitude: '23.137466',
    // Longitude: '113.352425',
    // Precision: '119.385040',
    // MsgId: '5837397520665436492' }
    res.reply('This is event,\nplease send text.');
  }).device_text(function (message, req, res, next) {
    // message为设备文本消息内容
    // { ToUserName: 'gh_d3e07d51b513',
    // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
    // CreateTime: '1359125022',
    // MsgType: 'device_text',
    // DeviceType: 'gh_d3e07d51b513'
    // DeviceID: 'dev1234abcd',
    // Content: 'd2hvc3lvdXJkYWRkeQ==',
    // SessionID: '9394',
    // MsgId: '5837397520665436492',
    // OpenID: 'oPKu7jgOibOA-De4u8J2RuNKpZRw' }
    res.reply('This is device_text,\nplease send text.');
  }).device_event(function (message, req, res, next) {
    // message为设备事件内容
    // { ToUserName: 'gh_d3e07d51b513',
    // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
    // CreateTime: '1359125022',
    // MsgType: 'device_event',
    // Event: 'bind'
    // DeviceType: 'gh_d3e07d51b513'
    // DeviceID: 'dev1234abcd',
    // OpType : 0, //Event为subscribe_status/unsubscribe_status时存在
    // Content: 'd2hvc3lvdXJkYWRkeQ==', //Event不为subscribe_status/unsubscribe_status时存在
    // SessionID: '9394',
    // MsgId: '5837397520665436492',
    // OpenID: 'oPKu7jgOibOA-De4u8J2RuNKpZRw' }
    res.reply('This is device_event,\nplease send text.');
  }))
);

app.listen(port, () => console.log(`listening on port ${port}!`));
