<%@ page language="java" import="java.util.*" pageEncoding="utf-8"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
		<meta charset="utf-8"/>
		<title>test</title>
		<link rel="stylesheet" href="./css/main.css" type="text/css" />
		<script type="text/javascript" src="./javascript/jquery-3.3.1-min.js"></script>
		<script type="text/javascript" src="./javascript/common.js"></script>
		<script type="text/javascript" src="./javascript/config.js"></script> 
	</head>
	<body>
	<div class='users'>
		<div class='user'>
			<ul id='小明'>
				<li class='name' >小明</li>
				<li class='sendText'><button class='sendTextBtn'  userName='小明 '>发送消息</button></li>
				<li class='videoCall'><button id='videoCallBtn'>呼叫</button></li>
			</ul>
		</div>
		<div class='user'>
			<ul id='小红'>
				<li class='name' >小红</li>
				<li class='sendText'><button class='sendTextBtn' userName='小红'>发送消息</button></li>
				<li class='videoCall'><button id='videoCallBtn'>呼叫</button></li>
			</ul>
		</div>
		<div class='user'>
			<ul  id='小军'>
				<li class='name'>小军</li>
				<li class='sendText'><button  class='sendTextBtn' userName='小军'>发送消息</button></li>
				<li class='videoCall'><button id='videoCallBtn'>呼叫</button></li>
			</ul>
		</div>
	</div>
	<video id="myvideo" autoplay><div>显示很多字</div></div></video>
	<textarea rows="3" cols="20">test</textarea>
	</body>
	<script type="text/javascript">
		$(".sendTextBtn").click(function(){
			console.log("click me");
			var userName=$(this).attr('userName');
	console.log(userName);
		});
		
navigator.mediaDevices.getUserMedia(videoContains).then(setLocalStream).catch(openLocalStreamError);
function start(){
	navigator.mediaDevices.getUserMedia(videoContains).then(setLocalStream).catch(openLocalStreamError);
}
function setLocalStream(stream){
	Locallog("创建本地stream成功，"+stream);
	window.localStream=stream;
	$('video#myvideo').src=stream;
}
function openLocalStreamError(err){
	Locallog("创建本地stream失败，"+err);
}
	
	</script>
</html>
