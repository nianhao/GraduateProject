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
	
	// ���ͨ������
		private static final int MAX_COUNT = 20;
		private static final long MAX_TIME_OUT = 2 * 60 * 1000;
		//browserSessionId ��websocket session ӳ��
		private static Map<String,Session> BSId_WS=Collections.synchronizedMap(new HashMap<String,Session>());
	/**
	 * ��websocket
	 * @param session websocket��session
	 * @param uid ���û���UID
	 */
	@OnOpen
	public void onOpen(Session session, @PathParam("browserSessionId")String bid) {
		session.setMaxIdleTimeout(MAX_TIME_OUT);
		//����Ƿ����ظ�ע��
		/*if(BSId_WS.containsKey(bid)){
			Session temp=BSId_WS.get(bid);
			CommonFunc.PWLog("֮ǰ��session��"+temp.toString()+"\n���ڵ�session��"+session.toString());
			CommonFunc.PWLog(bid+"�ظ��ύ������");
			//Close(session,bid);
		}*/
		BSId_WS.put(bid, session);
		CommonFunc.PWLog(bid+"ע����websocket��������"+session.toString());
		//Ⱥ����Ϣ���������ˢ����������
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
			CommonFunc.PWLog("�� "+tempSession.toString()+"������ˢ�������û�����");
		}
	}

	private void Close(Session session, String bid) {
		// TODO Auto-generated method stub
		try {
			if(session != null && session.isOpen()) session.close(); // �ر�session
			CommonFunc.PWLog(bid+"��Ϊ�ظ�ע�ᱻ�ر�������");
		} catch (IOException e) {
			e.printStackTrace();
		}
	
	}

	@OnMessage
	public void onMessage(String message,Session session,@PathParam("browserSession")String sid){
		
	
	}
	/***
	 * websock���ӹرա�ɾ��bid��session��ӳ�䡣���������ͨ��֮��Ӧ�ö�ͨ������в���
	 * @param session
	 * @param bid
	 */
	@OnClose
	public void onClose(Session session, @PathParam("browserSessionId")String bid){
		BSId_WS.remove(bid);
		try {
			if(session != null && session.isOpen()) session.close(); // �ر�session
			CommonFunc.PWLog(bid+"�ر��˺�websockt������:"+session.toString()+" ֮�������");
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
					CommonFunc.PWLog(toUserWebSocktSession.toString()+" �Ѿ��ر�����");
					return;
				}else{
					handlTextMsg(textMsg,toUserWebSocktSession);
				}
			}else{
				CommonFunc.PWLog(textMsg.getToUser()+";"+textMsg.getToUserBrowserId()+"û��ע���websocket������");
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
