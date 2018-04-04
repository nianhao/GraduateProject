
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
/*
 * @Msg 通过websocket发送的信息。在Msg.data中有在websocketserver中构造的文字信息。
 */
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
  			case("lanchVideoCall"):
  				handleVideoCall(msgJson);
  				break;
  			case("acceptVideoCall"):
  				handleAcceptVideoCall(msgJson);
  				break;
  			case("rejectVideoCall"):
  				handleRejectVideoCall(msgJson);
  				break;
  			case ("candidate"):
  				handleCandidate(msgJson);
  				break;
  			case("offer"):
  				handleOffer(msgJson);
  				break;
  			case("answer"):
  				handleAnswer(msgJson);
  				break;
  		}
  	}
function handleAcceptVideoCall(msgJson){
	var fromUser=msgJson.fromUser;
	var toUser=msgJson.toUser;
	Locallog(fromUser+"接受了通话请求，正在连接");
	createRTCPeerConnection(fromUser);
	addLocalStream(fromUser);
	doConnectionRound(fromUser);
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
	Locallog("接收到"+fromUser+" 发送的desc"+JSON.stringify(msgJson.message));
	pc.setRemoteDescription(new RTCSessionDescription(desc));
	createAnswer(fromUser);
}
function handleAnswer(msgJson){
	var fromUser=msgJson.fromUser;
	var toUser=msgJson.toUser;
	var pc=RTCPeerConnectionMap.get(fromUser);
	var desc=msgJson.message;
	Locallog("接收到"+fromUser+" 发送的desc"+JSON.stringify(msgJson.message));
	pc.setRemoteDescription(new RTCSessionDescription(desc));
}
function acceptVideoCall(userName){
	Locallog("接受"+userName+"通话邀请，发送接受信息，进入通话连接建立阶段");
	sendAcceptVideoCallMsg(userName);
	createRTCPeerConnection(userName);
	addLocalStream(userName);
	doConnectionRound(userName);
}
function doConnectionRound(userName){
	createOffer(userName);
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
	Locallog("本地desc设置成功，向"+userName+"发送desc");
	var offerCommand="offer";
	var message=desc;
	sendTexgMsg("me",userName,offerCommand,message);
}
function createOfferError(error,userName){
	Locallog("创建offer失败： "+error);
}
function createAnswerSuccess(desc,userName){
	Locallog("创建answer成功，准备向"+userName+"发送answer信息 ");
	var pc=RTCPeerConnectionMap.get(userName);
	pc.setLocalDescription(desc);
	Locallog("本地desc设置成功，向"+userName+"发送desc");
	var offerCommand="answer";
	var message=desc;
	sendTexgMsg("me",userName,offerCommand,message);
}
function createAnswerError(error,userName){
	Locallog("创建answer失败： "+error);
}
function createRTCPeerConnection(userName){
	openLocalVideoWindow();
	var pc = new PeerConnection(stunServer);	
	pc.onicecandidate = function(event){onIceCandidate(event,userName);};
	pc.onconnecting = onSessionConnecting;
	pc.onopen = onSessionOpened;
	//pc.onaddstream = onRemoteStreamAdded;,修改为新的加载方式
	pc.ontrack=onRemoteStreamAdded;
	pc.onremovestream = onRemoteStreamRemoved;
	//添加到通讯映射里。这里应该放到服务器更安全。但是我实在想不出来可以把js变量放到服务器的方法。
	//为了安全可以在服务器中也建立一个映射，并生成一个时间码。如果不能匹配则拒绝信息的交换。防止
	//通话信息泄露
	Locallog("创建了本地与"+userName+"连接的RTCPeerConnector:"+pc);
	RTCPeerConnectionMap.set(userName,pc);
}
function addLocalStream(userName){
	var pc=RTCPeerConnectionMap.get(userName);
	window.localStream.getTracks().forEach(
			function(track){
				pc.addTrack(
					track,
					localStream
				);
			}
		);
}
function rejectVideoCall(fromUser){
	Locallog("拒绝"+fromUser+"通话邀请，发送拒绝信息。");
	sendRejectVideoCallMsg(fromUser);	
}
function sendAcceptVideoCallMsg(userName){
	var message="nothing";
	var acceptVideoCallCommand="acceptVideoCall";
	sendTexgMsg("me",userName,acceptVideoCallCommand,message);
}
function sendRejectVideoCallMsg(userName){
	var message="nothing";
	var rejectVideoCallCommand="rejectVideoCall";
	sendTexgMsg("me",userName,rejectVideoCallCommand,message);
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
/*如果localVideoOpen=false,说明本地视频没有打开。则打开本地视频流，设置全局变量window.localstream
 *否则什么都不敢，进入呼叫过程
 * @userName 建立与userName的通话窗口
 */
function openLocalVideoWindow(){	
	if(localVideoOpen==0){
		openLocalVideo();
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
	localVideoOpen+=1;
	$('div.videoTalk#me div.videoArea video')[0].srcObject=stream;
}
function openLocalStreamError(err){
	Locallog("创建本地stream失败，"+err);
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
	if(event.candidate.candidate!=null){
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
	
}
function onSessionOpened(){
	
}
function onRemoteStreamAdded(event,userName){
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
	var stream=event.streams[0];
	$('div.videoTalk#me div.videoArea video')[0].srcObject=stream;
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























