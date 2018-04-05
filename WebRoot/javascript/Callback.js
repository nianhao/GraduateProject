/*
 * 一些Ajsx请求成功之后的回调函数
 */

/*刷新在线用户命令发送后的回调函数。打印接收到的服务器信息。
 * 
 */
function refreshOnlineUserSuccess(result) {
	$('#userOnline').empty();
	var resJson;
	resJson=jsonFormat(result);
	var users = resJson.userName;
	console.log(users);
	//将在线人数添加上去
	for (var i = 0; i < users.length; i++) {
		$('#userOnline').append(
			"<div class='user'>" +
			"<ul id='" + users[i].toString() + "'>" +
			"<li class='name' id='" + users[i].toString() + "'>" + users[i].toString() + "</li>" +
			"<li class='sendText'><button class='sendTextBtn' userName='" + users[i].toString() + "'>发送消息</button></li>" +
			"<li class='videoCall'><button class='videoCallBtn'  userName='" + users[i].toString() + "'>呼叫</button></li>" +
			"</ul>" +
			"</div>")
	}
	//添加在线用户之后，绑定点击事件
	$(".sendTextBtn").click(function() {
		var userName = $(this).attr('userName');
		console.log(userName + "click me");
		Locallog("向" + userName + "发送文字信息");
		startSendText(userName);
	});
	$(".videoCallBtn").click(function() {
		var userName = $(this).attr('userName');
		console.log(userName + "click me to start a video call");
		Locallog("向" + userName + "发送通话呼叫");
		startVideoCall(userName);
	});
}

/************开启本地视频流的回调函数************************/
/*
 * 如果开启成功，则将localVideoOpen+1,表示开启了一个本地video，并设置window.localStream的值
 * 如果开启失败，则输出错误信息
*/
function setLocalStream(stream){
	Locallog("创建本地stream成功，"+stream+"并绑定到window.localStream");
	window.localStream=stream;
	localVideoOpen+=1;
	$('div.videoTalk#me div.videoArea video')[0].srcObject=stream;
	if(window.needStreamUserName!="noOne"){
		var userName=window.needStreamUserName;
		window.needStreamUserName="noOne";
		var pc=RTCPeerConnectionMap.get(userName);
		if(pc==null){
			pc=createRTCPeerConnection(userName);
		}	
		addLocalStream(userName);
	}
	if(window.waitVideoReady!="noOne"){
		var userName=window.waitVideoReady;
		window.waitVideoReady="noOne";
		doSendVideoReady(userName);
	}
}
function openLocalStreamError(err){
	Locallog("创建本地stream失败，"+err.toString());
}