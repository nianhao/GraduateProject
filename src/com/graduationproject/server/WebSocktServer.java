package com.graduationproject.server;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.websocket.OnClose;
import javax.websocket.OnOpen;
import javax.websocket.OnMessage;
import javax.websocket.Session;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;

import org.apache.taglibs.standard.tag.common.core.CatchTag;

import com.graduation.common.CommonFunc;
import com.graduation.javaBean.TextMsg;
import com.graduationproject.servlet.getUserNameServlet;


@ServerEndpoint("/WebSocketServer/{browserSessionId}")
public class WebSocktServer {
	
	// 最大通话数量
		private static final int MAX_COUNT = 20;
		private static final long MAX_TIME_OUT = 2 * 60 * 1000;
		//browserSessionId 与websocket session 映射
		private static Map<String,Session> BSId_WS=Collections.synchronizedMap(new HashMap<String,Session>());
	/**
	 * 打开websocket
	 * @param session websocket的session
	 * @param uid 打开用户的UID
	 */
	@OnOpen
	public void onOpen(Session session, @PathParam("browserSessionId")String bid) {
		session.setMaxIdleTimeout(MAX_TIME_OUT);
		//检查是否是重复注册
		/*if(BSId_WS.containsKey(bid)){
			Session temp=BSId_WS.get(bid);
			CommonFunc.PWLog("之前的session："+temp.toString()+"\n现在的session："+session.toString());
			CommonFunc.PWLog(bid+"重复提交了连接");
			//Close(session,bid);
		}*/
		BSId_WS.put(bid, session);
		CommonFunc.PWLog(bid+"注册了websocket服务器："+session.toString());
		//群发消息，让浏览器刷新在线人数
		MassCommandMessage("refresh");
		
	}
	
	private void MassCommandMessage(String command) {
		// TODO Auto-generated method stub
		switch(command){
			case "refresh": massRefresh();
		}
		
	}

	private void massRefresh() {
		// TODO Auto-generated method stub
		String message="{"
				+"\"type\":"+"\"refresh\","
				+"\"message\":"+"\"nothing\""
				+ "}";
		Session tempSession=null;
		for(Map.Entry<String, Session> item:BSId_WS.entrySet()){
			tempSession=item.getValue();
			tempSession.getAsyncRemote().sendText(message);
			CommonFunc.PWLog("向 "+tempSession.toString()+"发送了刷新在线用户命令");
		}
	}

	private void Close(Session session, String bid) {
		// TODO Auto-generated method stub
		try {
			if(session != null && session.isOpen()) session.close(); // 关闭session
			CommonFunc.PWLog(bid+"因为重复注册被关闭了连接");
		} catch (IOException e) {
			e.printStackTrace();
		}
	
	}

	@OnMessage
	public void onMessage(String message,Session session,@PathParam("browserSession")String sid){
		
	
	}
	/***
	 * websock连接关闭。删除bid和session的映射。后面添加了通话之后应该对通话表进行操作
	 * @param session
	 * @param bid
	 */
	@OnClose
	public void onClose(Session session, @PathParam("browserSessionId")String bid){
		BSId_WS.remove(bid);
		try {
			if(session != null && session.isOpen()) session.close(); // 关闭session
			CommonFunc.PWLog(bid+"关闭了和websockt服务器:"+session.toString()+" 之间的连接");
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	public static void TransmitTextMsg(TextMsg textMsg,String msg){
		Session toUserWebSocktSession=null;
		toUserWebSocktSession=BSId_WS.get(textMsg.getToUserBrowserId());
		try{
			if(toUserWebSocktSession!=null){
				if(!toUserWebSocktSession.isOpen()){
					CommonFunc.PWLog(toUserWebSocktSession.toString()+" 已经关闭连接");
					return;
				}else{
					handlTextMsg(textMsg,toUserWebSocktSession);
				}
			}else{
				CommonFunc.PWLog(textMsg.getToUser()+";"+textMsg.getToUserBrowserId()+"没有注册过websocket服务器");
			}
		}catch (Exception e) {
			// TODO: handle exception
			CommonFunc.PWLog(e.getMessage());
		}
	}

	private static void handlTextMsg(TextMsg textMsg,Session toUserWebSocktSession) {
		// TODO Auto-generated method stub
		String type=textMsg.getType();
		switch (type) {
			case "lacnchVideoCall":
			case "candidate":
			case "text":
				TextMsg sendTextMsg=new TextMsg(textMsg,textMsg.getMessage());
				try{
					toUserWebSocktSession.getAsyncRemote().sendText(sendTextMsg.toString());
				}catch (Exception e) {
					// TODO: handle exception
					CommonFunc.PWLog(e.getMessage());
				}
			
			break;

		default:
			break;
		}
		
		
	}
}
