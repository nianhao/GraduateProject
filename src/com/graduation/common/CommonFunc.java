package com.graduation.common;

import java.text.SimpleDateFormat;
import java.util.Date;

public class CommonFunc {

	public static void PWLog(String Msg){
		String logMsg=null;
		Date day=new Date();    

		SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"); 
		String nowTime=df.format(day);
		logMsg=nowTime+"  "+Msg;
		System.out.println(logMsg);
	}
	public static String getTime() {
		Date day=new Date();    

		SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"); 
		String nowTime=df.format(day);
		return nowTime;
	}
}
