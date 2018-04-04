package com.graduation.javaBean;

import com.graduation.common.CommonFunc;

public class TextMsg {
	String type=null;
	String fromUser=null;
	String toUser=null;
	String sendTime=null;
	String message=null;
	String fromUserBrowserId=null;
	String toUserBrowserId=null;
	
	public TextMsg(String type,String fromUser,String toUser,String sendTime,String message,String fromUserBrowserId,String toUserBrowserId){
		this.type=type;
		this.fromUser=fromUser;
		this.toUser=toUser;
		this.sendTime=sendTime;
		this.message=message;
		this.fromUserBrowserId=fromUserBrowserId;
		this.toUserBrowserId=toUserBrowserId;
	}
	public TextMsg(TextMsg textMsg,String message) {
		setType(textMsg.getType());
		setFromUser(textMsg.getFromUser());
		setToUser(textMsg.getToUser());
		setSendTime(CommonFunc.getTime());
		setMessage(message);
		setFromUserBrowserId(textMsg.getFromUserBrowserId());
		setToUserBrowserId(textMsg.getToUserBrowserId());
	}
	public String toString(){
		if(this.type=="candidate"||this.type.equals("candidate")
				||this.type=="offer"||this.type.equals("offer")
				||this.type=="answer"||this.type.equals("answer")){
			return "{"
					
				+" \"type\":"+"\""+this.type+"\""+","
				+"\"fromUser\":"+"\""+this.fromUser+"\""+","
				+"\"toUser\":"+"\""+this.toUser+"\""+","
				+"\"sendTime\":"+"\""+this.sendTime+"\""+","
				+"\"message\":"+this.message
				+ "}";			
		}else{
			return "{"
		
				+" \"type\":"+"\""+this.type+"\""+","
				+"\"fromUser\":"+"\""+this.fromUser+"\""+","
				+"\"toUser\":"+"\""+this.toUser+"\""+","
				+"\"sendTime\":"+"\""+this.sendTime+"\""+","
				+"\"message\":"+"\""+this.message+"\""
				+ "}";
		}
	}
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public String getFromUser() {
		return fromUser;
	}
	public void setFromUser(String fromUser) {
		this.fromUser = fromUser;
	}
	public String getToUser() {
		return toUser;
	}
	public void setToUser(String toUser) {
		this.toUser = toUser;
	}
	public String getSendTime() {
		return sendTime;
	}
	public void setSendTime(String sendTime) {
		this.sendTime = sendTime;
	}
	public String getMessage() {
		return message;
	}
	public void setMessage(String message) {
		this.message = message;
	}
	public String getFromUserBrowserId() {
		return fromUserBrowserId;
	}
	public void setFromUserBrowserId(String fromUserBrowserId) {
		this.fromUserBrowserId = fromUserBrowserId;
	}
	public String getToUserBrowserId() {
		return toUserBrowserId;
	}
	public void setToUserBrowserId(String toUserBrowserId) {
		this.toUserBrowserId = toUserBrowserId;
	}


}
