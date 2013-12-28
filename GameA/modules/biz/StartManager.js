/**
 * Created with JetBrains WebStorm.
 * User: zhangzd
 * Date: 13-2-25
 * Time: ÉÏÎç9:54
 */

define(function (require, exports, module) {
	var root = this, state = false,getNode = false,eventBind = false,
		log = require("core/Logger").getLog(),
		ActionEvent = require("core/Event").getInstance("ActionEvent"),
		Timer = require("core/Timer"),timerId = -1,
		Clip;

	function bindEvents(v){
		if(v&&!eventBind){
			eventBind = true;
			ActionEvent.bind("handsHold",processStart);
		}else if(!v&&eventBind){
			eventBind = false;
			ActionEvent.unbind("handsHold",processStart);
		}
	}

	function getNodes(){
		if(!getNode){
			Clip = SFNode.get("start_clip");
			getNode = true;
		}
	}

	function processStart(hState,vec){
		if(hState=="ready"){
			timerId = Timer.bindFraction(3,function(f){
				Clip.plane[3] = -0.09+f*(-1);
			});
		}else if(hState=="off"){
			Timer.clear(timerId);
			Clip.plane[3] = 0.09;
		}else if(hState=="on"){
			Timer.clear(timerId);
			Clip.plane[3] = 0.09;
		}
	}

	exports.init = function () {
		if (!state) {
			bindEvents(true);
			getNodes();
			state = true;
		}
	};

	exports.destroy = function () {
		if (state) {
			bindEvents(false);
			state = false;
		}
	};
});
