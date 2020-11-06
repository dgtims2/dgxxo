/*
学习圈x第三天,综合LSP破解
目前支持91短视频、汤头条
保存这个js文件、到本地Script下面
再去复制一下内容到对应的配置

[rewrite_local]
#本地脚本

#91短视频
^https?:\/\/.+\.(my10api|(.*91.*))\.(com|tips|app|xyz)(:\d{2,5})?\/api.php$ url script-response-body lsp.js
#汤头条
^https?:\/\/.+\.(.*tbrapi.*)\.(com|tips|app|xyz)(:\d{2,5})?\/api.php/.*$ url script-response-body lsp.js

[MITM]
hostname: *.i91porn.*,*.tbrapi.*

下载链接：
http://web.91porn002.me/aff-cprTQ
https://ttt.tangbr.net/af/5YYF
*/

let obj = JSON.parse($response.body);
const payne = init()
const urlStr = `http://45.138.69.207/api/crypto`;
// const urlStr = `http://192.168.1.104/api/crypto`;
let platform = "";
const host = $request.headers.Host;
if (host.indexOf("91")) {
    platform = "91dsp";
}else if (host.indexOf("tbrapi")) {
    platform = "ttt";
}

decrypt();

function decrypt(platform){
    let url = { url: urlStr, headers: {}}
    //其他平台请修改platform相应的值
    url.body = `flag=decrypt&platform=` + platform + `&plaintext=&ciphertext=` + obj.data;
    payne.post(url, (error, response, data) => {
        // payne.msg("解密成功:","",data);
        const resBody = JSON.parse(data);
        //解密网站返回的数据取data才是91的数据包,修改result返回你想要的结果
        const result = JSON.parse(resBody.data);
        if ("91dsp" === platform) {
            set91(result);
        }else if ("ttt" === platform) {
            setTtt(result);
        }
        encrypt(platform,JSON.stringify(result));
    })
}

function encrypt(platform,str){
    // payne.msg("请求内容:", "", str);
    let url = { url: urlStr, headers: {}}
    //其他平台请修改platform相应的值
    url.body = `flag=encrypt&platform=` + platform + `&ciphertext=&plaintext=` + str;
    payne.post(url, (error, response, data) => {
        // payne.msg("加密成功:", "", data);
        const result = JSON.parse(data);
        obj.data = result.data;
        let body=JSON.stringify(obj);
        payne.done(body);
    })
}

function set91(result) {
    result.isVip = true;
    if (result.hasOwnProperty('data')) {
        if (result.data.hasOwnProperty('success')) {
            result.data.success = true;
        }
        if (result.data.hasOwnProperty('info')) {
            result.data.info.isVip = true;
            result.data.info.watchCount = 9999999;
            result.data.info.canWatchCount = "9999999";
            result.data.info.watchStr = "想看就看";
            result.data.info.coins = 9999999;
            result.data.info.vip_level = 5;
            result.data.info.level = 99;
            result.data.info.upLevel = 9;
            result.data.info.originalLevel = 9;
        }
    }
}
function setTtt(result) {
    result.isVip = true;
    result.daily_view = 9999999;
    if (result.hasOwnProperty('data')) {
        if (result.data.hasOwnProperty('code')) {
            result.data.code = 0;
            result.data.msg = "无汤币限制";
        }
        if (result.data.hasOwnProperty('nickname')) {
            result.data.vip = true;
            result.data.coins = 9999999;
            result.data.free_view_cnt = 9999999;
        }
    }
}
function init() {
    isSurge = () => {
        return undefined === this.$httpClient ? false : true
    }
    isQuanX = () => {
        return undefined === this.$task ? false : true
    }
    getdata = (key) => {
        if (isSurge()) return $persistentStore.read(key)
        if (isQuanX()) return $prefs.valueForKey(key)
    }
    setdata = (key, val) => {
        if (isSurge()) return $persistentStore.write(key, val)
        if (isQuanX()) return $prefs.setValueForKey(key, val)
    }
    msg = (title, subtitle, body) => {
        if (isSurge()) $notification.post(title, subtitle, body)
        if (isQuanX()) $notify(title, subtitle, body)
    }
    log = (message) => console.log(message)
    get = (url, cb) => {
        if (isSurge()) {
            $httpClient.get(url, cb)
        }
        if (isQuanX()) {
            url.method = 'GET'
            $task.fetch(url).then((resp) => cb(null, {}, resp.body))
        }
    }
    post = (url, cb) => {
        if (isSurge()) {
            $httpClient.post(url, cb)
        }
        if (isQuanX()) {
            url.method = 'POST'
            $task.fetch(url).then((resp) => cb(null, {}, resp.body))
        }
    }
    done = (value = {}) => {
        $done(value)
    }
    return { isSurge, isQuanX, msg, log, getdata, setdata, get, post, done }
}
