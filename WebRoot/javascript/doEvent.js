/*
 * 具体做事情的函数
 */


/*********************************************************公共部分**********************************************************/

/*如果localVideoOpen=false,说明本地视频没有打开。则打开本地视频流，设置全局变量window.localstream
 *否则什么都不敢，进入呼叫过程
 * @userName 建立与userName的通话窗口
 */
function openLocalVideoWindow(){	
	if(localVideoOpen==0){
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
		Locallog("尝试开始本地视频流");
		navigator.mediaDevices.getUserMedia(videoContains).then(setLocalStream).catch(openLocalStreamError);
	}
}
/*
 * 创建一个RTCPeerConnection,并且放到HashMap中备用
 */
function createRTCPeerConnection(userName){
	Locallog("创建与"+userName+"连接的RTCPeerConnector");
	if(RTCPeerConnectionMap.has(userName)) return;
	var pc = new PeerConnection(stunServer);	
	pc.onicecandidate = function(event){onIceCandidate(event,userName);};
	pc.onconnecting = onSessionConnecting;
	pc.onopen = onSessionOpened;
	//pc.onaddstream = onRemoteStreamAdded;,修改为新的加载方式
	pc.ontrack=function(event){onRemoteStreamAdded(event,userName);};
	pc.onremovestream = onRemoteStreamRemoved;
	//添加到通讯映射里。这里应该放到服务器更安全。但是我实在想不出来可以把js变量放到服务器的方法。
	//为了安全可以在服务器中也建立一个映射，并生成一个时间码。如果不能匹配则拒绝信息的交换。防止
	//通话信息泄露
	
	RTCPeerConnectionMap.set(userName,pc);
	
	Locallog("创建了本地与"+userName+"连接的RTCPeerConnector:"+pc);
	return pc;
}
/*
 * 将stream绑定到RTCPeerConnection上
 */
function addLocalStream(userName){
	Locallog("将本地视频流绑定到与"+userName+"连接的RTCPeerConnection中");
	var pc=RTCPeerConnectionMap.get(userName);
	if(!pc){
		Locallog("没有与"+userName+"相连接的pc");
		return "noPC";
	}
	if(!window.localStream){
		Locallog("没有找到本地视频流");
		return "noStream";
	}
	window.localStream.getTracks().forEach(
			function(track){
				pc.addTrack(
					track,
					localStream
				);
			}
		);
	Locallog("视频流绑定到与"+userName+"连接的RTCPeerConnection");
	return "success";
}

/**********************************************主动发起通话的一方******************************************************************/
//开始进行通话建立的过程
function doConnectionRound(userName){
	createOffer(userName);
}

/**********************************************被动接受通话的一方******************************************************************/
/*
 * 当用户确认接受通话之后，创建一个RTCPeerConnection-->打开本地视频流-->发送接受通话命令
 */
function acceptVideoCall(userName){
	Locallog("接受"+userName+"通话邀请，发送接受信息，进入通话连接建立阶段");
	openLocalVideoWindow();
	//设置变量，在创建本地视频流之后执行绑定流
	window.needStreamUserName=userName;
	//设置变量，在创建本地视频流之后发送ready信号
	window.waitVideoReady=userName;
	sendAcceptVideoCallMsg(userName);
}
/*
 * 当用户拒绝了通话申请，发送拒绝通话命令
 */
function rejectVideoCall(fromUser){
	Locallog("拒绝"+fromUser+"通话邀请，发送拒绝信息。");
	sendRejectVideoCallMsg(fromUser);	
}
/**************发送同意/拒绝通话命令*********************/
/*
 * 同意通话：acceptVideoCall  
 * 拒绝通话：rejectVideoCall
 */
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
/*
 * 本地视频流准备完成，发送 videoReady命令
 */
function doSendVideoReady(userName){
	sendTexgMsg("me",userName,"videoReady","nothing");
}