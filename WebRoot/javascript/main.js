
var submitUserNameBtn=document.querySelector('#submit');
var webSocketOpen=false;
var localVideoOpen=0;
var RTCPeerConnectionMap=new Map();
function getUserName(){
  		var userName=$('#userName').val();
  		if(userName==='' || userName===null){
  			return '';
  		}else{
  			 return userName;
  		}
  	}
  	
submitUserNameBtn.onclick=function(){
	var userName=getUserName();
	if(userName===''){
		alert('必须输入昵称');
		$('#userName').focus();
	 return;
	}
	var data={'username' :userName};
	$.post("getUserNameServlet",data,getIdState);
};
function getIdState(result){
	/*window.result=result;
	window.resString=result.toString();
	window.resString=result.toString();
	window.resJson= $.parseJSON( resString );*/
	var resJson=$.parseJSON(result.toString());
	if(resJson.state==='success'){
		Locallog("注册成功："+result.toString());
		handleGetIdSuccess(resJson.id);
	}else{
		handleGetIdError(resJson.errInfo);
	}
}

/*
	登陆成功。这里考虑到方便，把登陆验证省略成在服务器注册session，然后将之与之前设置的用户名绑定
*/
function handleGetIdSuccess(browserSessionId){
	window.browserSessionId=browserSessionId;
	//注册websockserver
	if(window.webSocket!=null) return;
	//Locallog("获取到id/${requestScope.browserSessionId}");
	registerWebSocketWebSocket(browserSessionId);

}
function registerWebSocketWebSocket(browserSessionId){
	window.socket = new WebSocket("wss://"+WebSocketHost+WebSocketEnterPoint+"/"+browserSessionId);
	window.socket.onopen = onChannelOpened;
	window.socket.onmessage = onChannelMessage;
	window.socket.onclose = onChannelClosed;
	window.socket.onerror = onChannelError;
}
function handleGetIdError(errInfo){
	Locallog('获取ID错误'+errInfo);
	refreshOnlineUser();
}

//websocket连接后的一系列操作
function onChannelOpened(){
	webSocketOpen=true;
	Locallog('open websockt');
	window.channelOpenTime=new Date();
	//读取在线用户
	refreshOnlineUser(); 
}
function onChannelMessage(message){
	Locallog("收到信息： "+message.data);
	handleMessage(message);
}
function onChannelError(err){
	Locallog("websockt 异常： "+err);
}
function onChannelClosed(){
	if(webSocketOpen){
		registerWebSocketWebSocket(window.browserSessionId);
		Locallog("因为长时间没有活动，关闭websocket,正在重新连接");
		return;
	}
	Locallog("websockt 关闭。。");
	window.channelCloseTime=new Date();
}

/*
	读取在线用户，弹出一个用户列表，显示用户名。
	
*/
function refreshOnlineUser(){
	var data={"type":"getOnlineUser"};
	$.post("HandleRequest",data,refreshOnlineUserSuccess);
}
function refreshOnlineUserSuccess(result){
	//{"userName" :["ss",""]}
	Locallog(result);
	showOnlineUser(result.toString());
}
function showOnlineUser(result){
	//删除全部子元素
	$('#userOnline').empty();
	var resJson;
	if(typeof(result)=="object" ){
		Locallog("接收到Json数据"+resJson.toString());
		resJson=result;
		
	}else{
		Locallog("接收到字符串数据"+result);
		resJson=$.parseJSON(result);
		
	}
	var users=resJson.userName;
	console.log(users);
	//将在线人数添加上去
	for(var i=0;i<users.length;i++){
		$('#userOnline').append(
		"<div class='user'>" +
			"<ul id='"+users[i].toString()+"'>" +
				"<li class='name' id='"+users[i].toString()+"'>"+users[i].toString()+"</li>" +
				"<li class='sendText'><button class='sendTextBtn' userName='"+users[i].toString()+"'>发送消息</button></li>" +
				"<li class='videoCall'><button class='videoCallBtn'  userName='"+users[i].toString()+"'>呼叫</button></li>" +
			"</ul>" +
		"</div>")
	}
	//添加在线用户之后，绑定点击事件
	$(".sendTextBtn").click(function(){
		var userName=$(this).attr('userName');
		console.log(userName+"click me");
		Locallog("向"+userName+"发送文字信息");
		startSendText(userName);
	});
	$(".videoCallBtn").click(function(){
		var userName=$(this).attr('userName');
		console.log(userName+"click me to start a video call");
		Locallog("向"+userName+"发送通话呼叫");
		startVideoCall(userName);
	});
}
function handleMessage(Msg){
  		var msgStr=Msg.data;
  		var msgJson;
  		if(typeof(msgStr)=="object"){
  			Locallog("handleMessage 接收到Json数据"+msgStr.toString());
  			msgJson=msgStr;
  		}else{
  			Locallog("handleMessage 接收到string 数据"+msgStr);
  			msgJson=$.parseJSON(msgStr);
  		}
  		
  		var type=msgJson.type;
  		console.log(type,typeof(type));
  		var msgInfo=msgJson.message;
  		switch(type){
  			case ("refresh"):
  				Locallog("有新的用户上线了");
  				refreshOnlineUser();
  				break;
  			case("text"):
  				Locallog("接收到消息"+msgInfo);
  				var fromUser=msgJson.fromUser;
  				openTextMsgWindow(msgJson.fromUser);
  				var textHis=$("#textSendWindows .textSendWindow#"+msgJson.fromUser +" .textAreaHis").val();
  				textHis=textHis+'\n'+msgJson.fromUser+getTime()+'\n'+msgInfo;
  				$("#textSendWindows .textSendWindow#"+msgJson.fromUser +" .textAreaHis").val(textHis);
  				break;
  			case("lacnchVideoCall"):
  				handleVideoCall(msgJson);
  			case ("candidate"):
  				break;
  		}
  	}
function handleVideoCall(msgJson){
	console.log("处理通话请求："+JSON.stringify(msgJson));
	var fromUser=msgJson.fromUser;
	var toUser=msgJson.toUser;
	if(window.confirm("是否接收来自"+fromUser+"的通话请求")){
		acceptVideoCall(fromUser);
	}else{
		rejectVideoCall(fromUser);
	}
}
function acceptVideoCall(fromUser){
	
}
function rejectVideoCall(fromUser){
	
}
var lanchVideoCallid;
function startSendText(userName){
	openTextMsgWindow(userName);
	var data={"type":"startSendText","toUser":userName,};
}
function startVideoCall(userName){
	openVideoCallWindow(userName);
	lanchVideoCall();
}
function lanchVideoCall(userName){
	lanchVideoCallid=setTimeout("lanchVideoCallState(userName)",1000);
	var message="nothing";
	sendTexgMsg("me",userName,"lacnchVideoCall",message);
	
}
function lanchVideoCallState(userName){
	Locallog("呼叫"+userName);
}
function openVideoCallWindow(userName){
	
	if(localVideoOpen==0){
		openLocalVideo();
	}else{
		addVideoSender(userName);
	}
	
	
}
function addVideoSender(userName){
	
	var pc=createPeerConnection();
	RTCPeerConnection.set(userName,pc);
}
function openLocalVideo(){
	$('#videoTalkWindows').append(
			"<div class='videoTalk' id='me'>" +
				"<div class='topic' id='me'>"+
					"<ul id='me'>"+
						"<li id='me'>本机视频</li>"+
						"<li class='videoHang'><button class='videoHangBtn'>关闭</button></li>"+
					"</ul>"+
				"</div>"+
				"<div class='videoArea'>"+
					"<video class='video' connect='me' autoplay></video>"+
				"</div>"+
			"</div>");
	navigator.mediaDevices.getUserMedia(videoContains).then(setLocalStream).catch(openLocalStreamError);
}
function start(){
	navigator.mediaDevices.getUserMedia(videoContains).then(setLocalStream).catch(openLocalStreamError);
}
function setLocalStream(stream){
	Locallog("创建本地stream成功，"+stream);
	window.localStream=stream;
	$('div.videoTalk#me div.videoArea video')[0].srcObject=stream;
}
function openLocalStreamError(err){
	Locallog("创建本地stream失败，"+err);
}
function createPeerConnection(toUserName) {
	var server = {"iceServers" : [{"url" : "stun:stun.l.google.com:19302"}]};
	
	var pc = new PeerConnection(server);
	
	pc.onicecandidate = function(event){onIceCandidate(event,toUserName);};
	pc.onconnecting = onSessionConnecting;
	pc.onopen = onSessionOpened;
	//pc.onaddstream = onRemoteStreamAdded;,修改为新的加载方式
	pc.ontrack=onRemoteStreamAdded;
	pc.onremovestream = onRemoteStreamRemoved;
	
	return pc;
}
function onIceCandidate(event,toUserName){
	if(event.candidate){
		var message={
				"label":event.candidate.sdpMLineIndex,
				"id":event.candidate.sdpMid,
				"candidate":event.candidate.candidate             
		};
		sendTexgMsg("me",toUserName,"candidate",message);
	}
}
function onSessionConnection(){
	
}
function onSessionOpened(){
	
}
function onRemoteStreamAdded(){
	$('#videoTalkWindows').append(
			"<div class='videoTalk' id='"+userName+"'>" +
				"<div class='topic' id='"+userName+"'>"+
					"<ul id='"+userName+"'>"+
						"<li id='"+userName+"'>"+userName+"</li>"+
						"<li class='videoHang'><button class='videoHangBtn'>挂断</button></li>"+
					"</ul>"+
				"</div>"+
				"<div class='videoArea'>"+
					"<video class='videoTalk' connect='"+userName+"'></video>"+
				"</div>");
}
function onRemoteStreamRemoved(){
	
}
function openTextMsgWindow(userName){
	Locallog('弹出一个对话窗口');
	if($("#textSendWindows .textSendWindow .topic ul #"+userName).length!=0){
		console.log('已经有与这个人对话');
		//这里应该将与这个人的对话框显示出来，然后将其他的对话框隐藏
		return;
	}
	//$('#textSendWindows').empty();
	$('#textSendWindows').append(
			"<div class='textSendWindow' id='"+userName+"'>" +
				"<div class='topic' >" +
					"<ul id='"+userName+"'>" +
						"<li id='"+userName+"'>"+userName+"</li>"+
						"<li class='videoCall'><button class='videoCallBtn'>呼叫</button></li>"+
					"</ul>"+
				"</div>"+
				"<div class='textArea'>"+
					"<ul>"+
						"<li class='textArea'><textarea class='textAreaHis' row='6' col='20'></textarea>"+
						"<li class='textArea'><textarea class='textAreaNow' row='3' col='20'></textarea>"+
						"<li class='sendTextNow'><button class='sendTextNowBtn'>发送</button></li>"+
						"<li class='cancelTextNow'><button class='cancelBtn'>关闭</button></li>"+
					"</ul>"+
				"</div>"+
			"</div>");
	$('.sendTextNowBtn').click(function(){
		Locallog('准备发送文字消息');
		sendTextTo(userName);
	});
}
function sendTextTo(userName){
	var textNow=$("#textSendWindows .textSendWindow#"+userName +" .textAreaNow").val();
	var textHis=$("#textSendWindows .textSendWindow#"+userName +" .textAreaHis").val();
	Locallog('发送消息'+textNow);
	textHis=textHis+'\n'+'我 '+getTime()+'\n'+textNow;
	Locallog(textHis);
	$('.textAreaNow').val('');
	$('.textAreaHis').val(textHis);//innerHTML=textHis;
	var data={
		"type":"TextMsg",
		"data":{
			"type":"text",
			"fromUser":"me",
			"toUser":userName,
			"time":getTime(),
			"message":textNow
		}

	};
	$.post("HandleRequest",data,sendTextMsgSuccess);
}
function sendTextMsgSuccess(result){
	
}
function sendTexgMsg(fromUserName,toUserName,type,message){
	var data={
			"type":"TextMsg",
			"data":{
				"type":type,
				"fromUserName":fromUserName,
				"toUserName":toUserName,
				"time":getTime(),
				"message":message
			}
	};
	Locallog("发送文字信息到服务器： "+JSON.stringify(data));
	$.post("HandleRequest",data,sendTextMsgSuccess);
}






















