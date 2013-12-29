/**
 * Created with JetBrains WebStorm.
 * User: zhangzd
 * Date: 13-1-22
 * Time: 上午10:21
 */

define(function (require, exports, module) {
	var root = this, state = false,eventBind = false,
		log = require("core/Logger").getLog(),
		PixToCoord = require("./PixToCoord"),
		MSEvent = require("core/Event").getInstance("MSEvent"),
		ActionEvent = require("core/Event").getInstance("ActionEvent"),

		oEdge = {"left":"","right":"","top":"","bottom":""},
		oAction = {
			"hold":{},
			"throw":{},
			"handsHold":{},
			"mouse":{},
			"uiMouse":{},
            "swingHand":{}
		},curAction,moduleEnable = false,playerIn=false;

	function playerState(v){
		if((v&1)!=1){
			playerIn = false;
			ActionEvent.trigger("playerState","leave");
		}else{
			playerIn = true;
			ActionEvent.trigger("playerState","enter");
		}

		if((v&2)!=2){
			if(oEdge.left!="out"){
//				log.debug("超出左边界");
				ActionEvent.trigger("playerState","lOut");
				oEdge.left = "out";
			}
		}else{
			if(oEdge.left!="in"){
//				log.debug("未超出左边界");
				ActionEvent.trigger("playerState","lIn");
				oEdge.left = "in";
			}
		}

		if((v&4)!=4){
			if(oEdge.right!="out"){
//				log.debug("超出右边界");
				ActionEvent.trigger("playerState","rOut");
				oEdge.right = "out"
			}
		}else{
			if(oEdge.right!="in"){
//				log.debug("未超出右边界");
				ActionEvent.trigger("playerState","rIn");
				oEdge.right = "in";
			}
		}

		if((v&8)!=8){
			if(oEdge.top!="out"){
//				log.debug("超出上边界");
				ActionEvent.trigger("playerState","tOut");
				oEdge.top = "out";
			}
		}else{
			if(oEdge.top!="in"){
//				log.warn("未超出上边界");
				ActionEvent.trigger("playerState","tIn");
				oEdge.top = "in";
			}
		}

		if((v&16)!=16){
			if(oEdge.bottom!="out"){
//				log.debug("超出下边界");
				ActionEvent.trigger("playerState","bOut");
				oEdge.bottom = "out";
			}
		}else{
			if(oEdge.bottom!="in"){
//				log.warn("未超出下边界");
				ActionEvent.trigger("playerState","bIn");
				oEdge.bottom = "in";
			}
		}
	}

	function bindEvents(v){
		if(v){
			if(!eventBind){
				MSEvent.bind("msState",playerState);
				eventBind = true;
			}
		}else{
			if(eventBind){
				MSEvent.unbind("msState",playerState);
				eventBind = false;
			}
		}
	}

	function getAllActionModule(){
		oAction.hold = require("../util/kinect/Hold");
		oAction["throw"] = require("../util/kinect/Throw");
		oAction.handsHold = require("../util/kinect/handsHold");
		oAction.mouse = require("../util/kinect/Mouse");
		oAction.uiMouse = require("../util/kinect/uiMouse");
        oAction.swingHand=require("../util/kinect/swingHand");
	}

	exports.enabled = function(v){
		if(state){
			if(moduleEnable!=v){
				moduleEnable = v;
				ActionEvent.trigger("playerStateEnable",v);
				if(moduleEnable&&!playerIn){
					ActionEvent.trigger("playerState","leave");
				}
			}
		}
	};

	exports.clearAction = function(){
		if(state){
			if(curAction&&oAction[curAction]){
				oAction[curAction].destroy();
			}
		}
	};

	exports.changeAction = function(action){
		if(state){
			if(curAction!=action&&oAction[action]){
				if(curAction&&oAction[curAction]){oAction[curAction].destroy()}
				oAction[action].init(PixToCoord.translate());
				curAction = action;
			}
		}
	};

	exports.init = function () {
		if (!state) {
			state = true;
			getAllActionModule();
			try{
				regiest(0,1);
				regiest(103,1);
				regiest(1000,1);
			}catch(e){

			}
			bindEvents(true);
		}
	};

	exports.destroy = function () {
		if (state) {
			bindEvents(false);
			state = false;
		}
	};
});
