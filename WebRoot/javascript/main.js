
var submitUserNameBtn=document.querySelector('#submit');
var webSocketOpen=false;
var localVideoOpen=0;
var RTCPeerConnectionMap=new Map();
window.localStream=null;
window.needStreamUserName="noOne";
window.waitVideoReady="noOne";
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
	handleRefresh();
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



function handleCandidate(msgJson){
	var fromUser=msgJson.fromUser;
	var toUser=msgJson.toUser;
	var pc=RTCPeerConnectionMap.get(fromUser);
	var candidate = new RTCIceCandidate({
		sdpMLineIndex : msgJson.message.label,
		candidate : msgJson.message.candidate
	});
	Locallog("handleCandidate:接收并添加了candidate信息"+candidate);
	pc.addIceCandidate(candidate);
}
function handleOffer(msgJson){
	var fromUser=msgJson.fromUser;
	var toUser=msgJson.toUser;
	var pc=RTCPeerConnectionMap.get(fromUser);
	var desc=msgJson.message;
	Locallog("接收到"+fromUser+msgJson.type);
	pc.setRemoteDescription(new RTCSessionDescription(desc));
	createAnswer(fromUser);
}
function handleAnswer(msgJson){
	var fromUser=msgJson.fromUser;
	var toUser=msgJson.toUser;
	var pc=RTCPeerConnectionMap.get(fromUser);
	var desc=msgJson.message;
	Locallog("接收到"+fromUser+msgJson.type);
	pc.setRemoteDescription(new RTCSessionDescription(desc));
}

function createOffer(userName){
	var pc=RTCPeerConnectionMap.get(userName);
	if(pc==null||!pc){
		Locallog("没有对"+userName+"创建通信节点，后者通信节点保存失败");
		return;
	}
	pc.createOffer(
			function(desc){createOfferSuccess(desc,userName);},
			function(error){createOfferError(error,userName);});
}
function createAnswer(userName){
	var pc=RTCPeerConnectionMap.get(userName);
	if(pc==null||!pc){
		Locallog("没有对"+userName+"创建通信节点，后者通信节点保存失败");
		return;
	}
	pc.createAnswer(
			function(desc){createAnswerSuccess(desc,userName);},
			function(error){createAnswerError(error,userName);});
}
function createOfferSuccess(desc,userName){
	Locallog("创建offer成功，准备向"+userName+"发送offer信息 ");
	var pc=RTCPeerConnectionMap.get(userName);
	pc.setLocalDescription(desc);
	Locallog("本地desc设置成功，向"+userName+"发送offer");
	var offerCommand="offer";
	var message=desc;
	sendTexgMsg("me",userName,offerCommand,message);
}
function createOfferError(error,userName){
	Locallog("创建offer失败： "+error.toString());
}
function createAnswerSuccess(desc,userName){
	Locallog("创建answer成功，准备向"+userName+"发送answer信息 ");
	var pc=RTCPeerConnectionMap.get(userName);
	pc.setLocalDescription(desc);
	Locallog("本地desc设置成功，向"+userName+"发送answer");
	var offerCommand="answer";
	var message=desc;
	sendTexgMsg("me",userName,offerCommand,message);
}
function createAnswerError(error,userName){
	Locallog("创建answer失败： "+error.toString());
}





var lanchVideoCallid;
function startSendText(userName){
	openTextMsgWindow(userName);
	var data={"type":"startSendText","toUser":userName,};
}


/*视频通话的起点
 * @userName 向userName发起通话邀请，要求唯一
 * openVideoCallWindow 添加一个video元素
 * lanchVideoCall 发起以一个通话请求
 */
function startVideoCall(userName){
	Locallog("start a videoCall");
	//打开一个通话窗口，添加一个video元素，准备放置视频流
	openLocalVideoWindow();
	//发起通话请求，询问userNames是否接受通话请求
	lanchVideoCall(userName);
}
/*发送一个通话请求
 * 使用sendTextMsg(fromUser,toUserName,type,message)函数发送命令
 * @lanchVideoCallcommand="lanchVideoCall"
 * @userName 向userName发起通话邀请，要求唯一
 */
function lanchVideoCall(userName){
	
	Locallog("呼叫用户："+userName);
	//在通话请求被接收之前，每1s执行一次状态函数，表示正在进行通话
	//lanchVideoCallid=setTimeout("lanchVideoCallState("+userName+")",1000);
	var message="nothing";
	var lanchVideoCallcommand="lanchVideoCall";
	//发送文字命令，消息类型为lanchVideoCall
	sendTexgMsg("me",userName,lanchVideoCallcommand,message);
	
}
function lanchVideoCallState(userName){
	Locallog("呼叫"+userName);
}

function addVideoSender(userName){
	
	var pc=createPeerConnection();
	RTCPeerConnection.set(userName,pc);
}

function createPeerConnection(toUserName) {
	openLocalVideoWindow();
	var server = {"iceServers" : [{"url" : "stun:stun.l.google.com:19302"}]};
	
	var pc = new PeerConnection(server);
	
	pc.onicecandidate = function(event){onIceCandidate(event,toUserName);};
	pc.onconnecting = onSessionConnecting;
	pc.onopen = onSessionOpened;
	//pc.onaddstream = onRemoteStreamAdded;,修改为新的加载方式
	pc.ontrack=function(event){onRemoteStreamAdded(event,toUserName)};
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
	}else{
		Locallog("End of candidate");
	}
}
function onSessionConnecting(){
	Locallog("正在连接");
}
function onSessionOpened(){
	Locallog("新建节点");
}
function onRemoteStreamAdded(event,userName){
	Locallog("接收到远程的视频流，新建video元素，添加stream,来自"+userName);
	$('#videoTalkWindows').append(
			"<div class='videoTalk' id='"+userName+"'>" +
				"<div class='topic' id='"+userName+"'>"+
					"<ul id='"+userName+"'>"+
						"<li id='"+userName+"'>"+userName+"</li>"+
						"<li class='videoHang'><button class='videoHangBtn'>挂断</button></li>"+
					"</ul>"+
				"</div>"+
				"<div class='videoArea'>"+
					"<video class='videoTalk' autoplay connect='"+userName+"'></video>"+
				"</div>");
	var stream=event.streams[0];
	$('div.videoTalk#'+userName+' div.videoArea video')[0].srcObject=stream;
	Locallog('准备发送本机视频到'+userName);
	var delay=function(userName){
		if(window.localStream){
			callback(function(){addLocalStream(userName);})
			
			//doConnectionRound(userName);
			return;
		}else{
			setTimeout(function(){delay(userName)},500);
		}
	}
	
	
	//createRTCPeerConnection(userName);
	
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
var mydata;
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
	alert(data);
	$.post("HandleRequest",data,sendTextMsgSuccess);
}
function sendTextMsgSuccess(result){
	
}
