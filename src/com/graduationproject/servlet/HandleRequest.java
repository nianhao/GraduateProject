package com.graduationproject.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Enumeration;
import java.util.Map;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.servlet.http.HttpSessionContext;
import javax.xml.crypto.Data;

import com.graduation.common.CommonFunc;
import com.graduation.javaBean.TextMsg;
import com.graduationproject.server.WebSocktServer;

/**
 * Servlet implementation class HandleRequest
 */
@WebServlet("/HandleRequest")
public class HandleRequest extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public HandleRequest() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		doPost(request,response);
		//response.getWriter().append("Served at: ").append(request.getContextPath());
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		String type=request.getParameter("type");
		switch(type){
			case "getOnlineUser" : getOnlineUser(request,response);
								   break;
			case "TextMsg":transmitMsg(request,response);
								break;
		}
	}
	private void transmitMsg(HttpServletRequest request, HttpServletResponse response) {
		// TODO Auto-generated method stub
		/*
		 * 	
			data[fromUser]: me
			data[toUser]: 2
			data[time]: 2018-03-31 10:26:40.904
			data[message]: msgInfo
		 */
		//CommonFunc.PWLog(request.getParameter("data[fromUser]"));
		String type=request.getParameter("data[type]");
		String fromUser=request.getParameter("data[fromUser]");
		String toUser=request.getParameter("data[toUser]");
		String sendTime=request.getParameter("data[time]");
		String message="";
		if(type=="candidate"||type.equals("candidate")){
			CommonFunc.PWLog("接收到candidate信息，重新解析");
			String label=null;
			String id=null;
			String candidateString=null;
			
			message+="{"+
					"\"label\":"+"\""+request.getParameter("data[message][label]")+"\""+","+
					"\"id\":"+"\""+request.getParameter("data[message][id]")+"\""+","+
					"\"candidate\":"+"\""+request.getParameter("data[message][candidate]")+"\""+
					"}";
					
		}else{

			message=request.getParameter("data[message]");
		}
		String fromUserBrowserId=null;
		String toUserBrowserId=null;
		
		HttpSession session=request.getSession();
			
			
		fromUserBrowserId=session.getId();
		
		//这里没有考虑重名的问题，但是为了以后考虑重名，所有通过不同的session查找。
		for(Map.Entry<String, String> item:getUserNameServlet.sessionId_userName.entrySet()){
			CommonFunc.PWLog(item.getKey()+" : "+item.getValue());
			if(item.getValue().equals(toUser)){
				toUserBrowserId=item.getKey();
				CommonFunc.PWLog("查找到好友");
				break;
			}
		}
		TextMsg textMsg=new TextMsg(type, getUserNameServlet.sessionId_userName.get(fromUserBrowserId), toUser, sendTime, message, fromUserBrowserId, toUserBrowserId);
		CommonFunc.PWLog("服务器转发消息： "+textMsg.toString());
		WebSocktServer.TransmitTextMsg(textMsg, textMsg.getMessage());
	}

	private void getOnlineUser(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		//HttpSession session = new
		String jsonStr="{\"userName\" :[";
		for(Map.Entry<String, String> item:getUserNameServlet.sessionId_userName.entrySet()){
			jsonStr+="\""+item.getValue()+"\",";
		}
		jsonStr+="\"\"]}";
		CommonFunc.PWLog("HandleRequest>>getOnlinUser获得在线用户："+jsonStr);
		//返回在线人数
		response.setCharacterEncoding("UTF-8");
		PrintWriter pw=response.getWriter();
		pw.write(jsonStr);
	}

}
