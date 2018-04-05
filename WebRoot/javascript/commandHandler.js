/*
 * @Msg 通过websocket发送的信息。在Msg.data中有在websocketserver中构造的文字信息。
 */
function handleMessage(Msg){
  		var msgStr=Msg.data;
  		var msgJson;
  		if(typeof(msgStr)=="object"){
  			//Locallog("handleMessage 接收到Json数据"+msgStr.toString());
  			msgJson=msgStr;
  		}else{
  			//Locallog("handleMessage 接收到string 数据"+msgStr);
  			msgJson=$.parseJSON(msgStr);
  		}  		
  		var type=msgJson.type;
  		var msgInfo=msgJson.message;
  		switch(type){
  			case ("refresh"):
  				//Locallog("有新的用户上线了");
  				handleRefresh();
  				break;
  			case("text"):
  				//Locallog("接收到消息"+msgInfo);
  				handleTextMsg(msgJson);
  				break;
  			case("lanchVideoCall"):
  				handleVideoCall(msgJson);
  				break;
  			case("acceptVideoCall"):
  				handleAcceptVideoCall(msgJson);
  				break;
  			case("rejectVideoCall"):
  				handleRejectVideoCall(msgJson);
  				break;
  			case("videoReady"):
  				handleVideoReady(msgJson);
  				break;
  			case ("candidate"):
  				handleCandidate(msgJson);
  				break;
  			case("offer"):
  				handleOffer(msgJson);
  				break;
  			case("answer"):
  				handleAnswer(msgJson);
  				break;
  		}
  	}
