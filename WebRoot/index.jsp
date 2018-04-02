<%@ page language="java" import="java.util.*" pageEncoding="utf-8"%>
<%
	String path = request.getContextPath();
	String basePath = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort()
			+ path + "/";
%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
<base href="<%=basePath%>">

	<title>My JSP 'index.jsp' starting page</title>
	<meta http-equiv="pragma" content="no-cache">
	<meta http-equiv="cache-control" content="no-cache">
	<meta http-equiv="expires" content="0">
	<meta http-equiv="keywords" content="keyword1,keyword2,keyword3">
	<meta http-equiv="description" content="This is my page">
	<link rel="stylesheet" href="./css/main.css" type="text/css" />
	<script type="text/javascript" src="./javascript/jquery-3.3.1-min.js"></script>
	<script type="text/javascript" src="./javascript/common.js"></script>
	<script type="text/javascript" src="./javascript/config.js"></script>  
	</head>
  
<body>
    正在生成id,请输入昵称： <br>
 <input type='text' id='userName' name='userName'><br>
 <button id='submit' name='submit'>确定</button>
 <div id="userOnline"></div>
 <div id="textSendWindows"></div>
 <div id="videoTalkWindows"></div>
 <script type='text/javascript' src="./javascript/main.js"></script>
</body>
</html>
