/**
 * Created with JetBrains WebStorm.
 * User: zhangzd
 * Date: 13-2-28
 * Time: ÏÂÎç3:50
 */

define(function (require, exports, module) {
	var root = this, state = false,eventBind = false,timerEventBind = false,getNode = false,
		log = require("core/Logger").getLog(),
		Config = require("../config/UIAreaConfig"),
		TimerEvent = require("core/Event").getInstance("Timer"),
		UIImitateEvent = require("core/Event").getInstance("UIImitateEvent"),
		ActionEvent = require("core/Event").getInstance("ActionEvent"),
		cursorUI,cursorSize = new SFVec2f(),cursorActive = false,curInterface = "",oMenus = [],
		lastArea,isHonver = false,honverTime,fillOut,fillIn;

	function bindEvents(v){
		if(v){
			if(!timerEventBind){
				TimerEvent.bind("time",getTime);
				timerEventBind = true;
			}
			if(!eventBind){
				ActionEvent.bind("uiMouse",mouseMove);
				eventBind = true;
			}
		}else{
			if(timerEventBind){
				TimerEvent.unbind("time",getTime);
				timerEventBind = false;
			}
		}
	}

	function getNodes(){
		if(!getNode){
			cursorUI = SFNode.get("cursorUI");
			cursorSize.setValue(cursorUI.size);
			fillOut = cursorUI.children[0];
			fillIn = fillOut.children[0];
			getNode = true;
		}
	}

	function getTime(t,dt){
		if(isHonver){
			honverTime+=dt;
			fillOut.position[1] = 1-honverTime/3;
			fillIn.position[1] = -fillOut.position[1];
			if(honverTime>=3){
				honverTime = 0;
				fillOut.position[1] = 1;
				fillIn.position[1] = -1;
				UIImitateEvent.trigger("click",lastArea.fun);
			}
		}
	}

	var tempArea,checkPos= new SFVec2f();
	function mouseMove(v){
		if(cursorActive){
			cursorUI.position.setValue(v);
			for(var i=0;i<oMenus.length;i++){
				tempArea = oMenus[i];
				checkPos.setValue(v.x+cursorSize.x/2, v.y+cursorSize.y/2);
				if(checkPos.x>tempArea.l&&checkPos.x<tempArea.r&&checkPos.y>tempArea.t&&checkPos.y<tempArea.b){
					if(!lastArea||(lastArea.id!=tempArea.id)){
						lastArea = tempArea;
						honverTime = 0;
						isHonver = true;
						UIImitateEvent.trigger("honver",tempArea.fun,true);
					}
				}else{
					if(lastArea&&(lastArea.id==tempArea.id)){
						lastArea = null;
						fillOut.position[1] = 1;
						fillIn.position[1] = -1;
						isHonver = false;
						UIImitateEvent.trigger("honver",tempArea.fun,false);
					}
				}
			}
		}
	}

	exports.activeMouse = function(v,itf){
		if(state){
			cursorActive = v;
			cursorUI.visible = v;
			if(v){
				if(curInterface!=itf){
					curInterface = itf;
					oMenus = Config[curInterface];
				}
			}else{
				isHonver = false;
			}
		}
	};

	exports.init = function () {
		if (!state) {
			getNodes();
			bindEvents(true);
			state = true;
		}
	};

	exports.destroy = function () {
		if (state) {
			fillOut.position[1] = 1;
			fillIn.position[1] = -1;
			bindEvents(false);
			state = false;
		}
	};
});
