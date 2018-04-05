//var WebSocketHost="127.0.0.1";
//var WebSocketHost="39.106.209.45";
var WebSocketHost="192.168.0.124";
var WebSocketEnterPoint="/GraduationProject/WebSocketServer";

var videoContains={
		audio:true,
		video:true
		
};
var PeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
var stunServer = {"iceServers" : [{"urls" : "stun:stun.l.google.com:19302"}]};