const express = require('express');
const wechat = require('wechat');
const port = 3000;

const app = express();

const config = {
    token: 'testwebot',  // tokenを書き換える
    appid: 'wxb65c62fdc1b55881'   // appidを書き換える
}

app.use(express.query());
app.use('/webot', wechat(config, function (req, res, next) {
    var message = req.weixin;    // チャットボットに話しかけた内容を受け取る
    console.log(message);
    res.reply('Hello world!');               // チャットボットの返答内容を取得する
}));

app.listen(port, () => console.log(`listening on port ${port}!`));