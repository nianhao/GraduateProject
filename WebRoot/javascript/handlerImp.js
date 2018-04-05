/*
 * 具体实现对命令的响应
 */

/*************************************************公共部分**********************************************************************/


/*响应接收到文字信息。做法是打开文字信息窗口，然后填写文字信息
 * @msgJson
 */
function handleTextMsg(msgJson){
	var fromUser=msgJson.fromUser;
		openTextMsgWindow(msgJson.fromUser);
		var textHis=$("#textSendWindows .textSendWindow#"+msgJson.fromUser +" .textAreaHis").val();
		textHis=textHis+'\n'+msgJson.fromUser+getTime()+'\n'+msgInfo;
		$("#textSendWindows .textSendWindow#"+msgJson.fromUser +" .textAreaHis").val(textHis);
		//break;
}

/*	读取在线用户，弹出一个用户列表，显示用户名，请求发送成功后回调函数刷新在线用户
 * 
 */
function handleRefresh(){
	var data={"type":"getOnlineUser"};
	$.post("HandleRequest",data,refreshOnlineUserSuccess);
}
/**********************************************主动发起通话的一方******************************************************************/
/*
 * 处理acceptVideoCall命令。因为是发起通话者接受的命令，所以本地视频流已经开启。执行创建RTCPeerConnection函数
 * 
 */
function handleAcceptVideoCall(msgJson){
	var fromUser=msgJson.fromUser;
	var toUser=msgJson.toUser;
	Locallog(fromUser+"接受了通话请求，正在连接");
	createRTCPeerConnection(fromUser);
	
}
function handleVideoReady(msgJson){
	Locallog("远程视频准备就绪，开始进入通话连接");
	var fromUser=msgJson.fromUser;
	var toUser=msgJson.toUser;
	//开始执行通话连接的过程
	doConnectionRound(fromUser);
}
/**********************************************被动接受通话的一方******************************************************************/
/*
 * 处理lanchVideoCall命令。弹出确认窗口。如果是同意，则执行同意通话函数。拒绝则执行拒绝通话函数
 */
function handleVideoCall(msgJson){
	console.log("处理通话请求："+JSON.stringify(msgJson));
	var fromUser=msgJson.fromUser;
	var toUser=msgJson.toUser;
	if(window.confirm("是否接收来自"+fromUser+"的通话请求")){
		//在同意通话邀请之后,开始打开视频流
		
		createRTCPeerConnection(fromUser);
		acceptVideoCall(fromUser);
	}else{
		rejectVideoCall(fromUser);
	}
}

