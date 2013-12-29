/**
 * Created with JetBrains WebStorm.
 * User: zhangzd
 * Date: 13-1-22
 * Time: ÉÏÎç10:50
 */

define(function (require, exports, module) {
	var root = this, state = false,
		log = require("core/Logger").getLog(),
		MSEvent = require("core/Event").getInstance("MSEvent"),
		ActionEvent = require("core/Event").getInstance("ActionEvent"),
		actionState = "off",readyTime,lastFrameTime,tId;

	function frameCheck(){
		if(Date.now()-lastFrameTime>0.5){
			if(actionState=="ready"){
				actionState = "off";
				ActionEvent.trigger("handsHold","off");
				clearTimeout(tId);
			}
		}else{
			tId=setTimeout(frameCheck,0.5);
		}
	}
	function changeSkeletonData(hipCenter, spine, shoulderCenter, head, leftShoulder, leftElbow, leftWrist, leftHand, rightShoulder, rightElbow, rightWrist, rightHand, leftHip, leftKnee, leftAnkle, leftFoot, rightHip, rightKnee, rightAnkle, rightFoot){
		if(state){
			lastFrameTime=Date.now();
			if(actionState=="off"){
				if(leftWrist.y<head.y&&rightWrist.y<head.y){
					actionState="ready";
					readyTime = Date.now();
					ActionEvent.trigger("handsHold","ready",spine);
					frameCheck();
				}
			}else if(actionState=="ready"){
				if((Date.now()-readyTime)<1){
					if(leftWrist.y>head.y||rightWrist.y>head.y){
						actionState = "off";
						ActionEvent.trigger("handsHold","off",spine);
						clearTimeout(tId);
					}
				}else{
					actionState = "on";
					ActionEvent.trigger("handsHold","on",spine);
					clearTimeout(tId);
				}
			}else{
				if(leftWrist.y>spine.y||rightWrist.y>spine.y){
					actionState = "off";
					ActionEvent.trigger("handsHold","off",spine);
					clearTimeout(tId);
				}
			}
		}
	}

	exports.init = function (oParam){
		if (!state) {
			MSEvent.bind("frameChange",changeSkeletonData);
			state = true;
		}
	};

	exports.destroy = function () {
		if (state) {
			MSEvent.unbind("frameChange",changeSkeletonData);
			state = false;
		}
	};
});