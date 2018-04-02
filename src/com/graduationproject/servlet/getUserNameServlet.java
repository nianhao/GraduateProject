package com.graduationproject.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.graduation.common.CommonFunc;

/**
 * Servlet implementation class getUserNameServlet
 */
@WebServlet("/getUserNameServlet")
public class getUserNameServlet extends HttpServlet {
	public static Map <String,String> sessionId_userName=Collections.synchronizedMap(new HashMap<String,String>());
	public static Map <String,String> userName_sessionId=Collections.synchronizedMap(new HashMap<String,String>());
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public getUserNameServlet() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		doPost(request,response);
		response.getWriter().append("Served at: ").append(request.getContextPath());
	}

	/**
	 * 把username(昵称)和sessionid绑定在一起
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		response.setCharacterEncoding("UTF-8");
		PrintWriter pw=response.getWriter();
		String userName=request.getParameter("username");
		HttpSession session=request.getSession();
		String sessionId=session.getId();
		if(checkRepeat(sessionId)){
			System.out.println(sessionId);
			sessionId_userName.put(sessionId, userName);
			//userName_sessionId.put(userName,sessionId);
			session.setAttribute("sessionId_userName", sessionId_userName);
			request.setAttribute("browserSessionId", sessionId);
			pw.write("{\"state\":\"success\",\"id\":\""+sessionId+"\"}");
		}else {
			CommonFunc.PWLog(sessionId+" 重复提交请求，予以拒绝");
			pw.write("{\"state\":\"error\",\"errInfo\":\""+"重复提交请求，予以拒绝\"}");
		}

		
	}
	protected boolean checkRepeat(String browserSessionId){
		return true;
		/*if(sessionId_userName.containsKey(browserSessionId)){
			return false;
		}else {
			return true;
		}*/
	}

}
