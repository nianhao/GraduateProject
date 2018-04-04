
function Locallog( msg){
	var now  = new Date();
	var formatNow=now.Format("yyyy-MM-dd hh:mm:ss.S");
	console.log(formatNow+" "+msg);
}

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S") ==> 2006-7-2 8:9:4.18

Date.prototype.Format = function (fmt) { // author: meizz
    var o = {
        "M+": this.getMonth() + 1, // 月份
        "d+": this.getDate(), // 日
        "h+": this.getHours(), // 小时
        "m+": this.getMinutes(), // 分
        "s+": this.getSeconds(), // 秒
        "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
        "S": this.getMilliseconds() // 毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
}

function getTime(){
	
	return (new Date().Format("yyyy-MM-dd hh:mm:ss.S"));
}
/*将信息发送到服务器，有服务器分发信息；这里TextMsg用于区别file、music之类的信息
 * data.type:主要是浏览器接收到之后，根据type不同进行不同的行为。我更愿意称之为command
 * @fromUserName  消息发送者
 * @toUserName 消息接收者
 * @type 命令类型（命令名）
 * @message 具体内容。有的命令需要携带信息。比如offer/answer 需要携带 desc信息
 */
function sendTexgMsg(fromUserName,toUserName,type,message){
	if(typeof(message)!="string"||typeof(message)==="object")
		message=JSON.stringify(message);
	var data={
			"type":"TextMsg",
			"data":{
				"type":type,
				"fromUser":fromUserName,
				"toUser":toUserName,
				"time":getTime(),
				"message":message
			}
	};
	//console.log("**************"+data);
	//if(type==="offer") alert(data);
	Locallog("function sendTextMsg 发送文字信息到服务器： "+JSON.stringify(data));
	$.post("HandleRequest",data,sendTextMsgSuccess);
}
