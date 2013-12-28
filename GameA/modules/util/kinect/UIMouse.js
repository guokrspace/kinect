/**
 * Created with JetBrains WebStorm.
 * User: zhangzd
 * Date: 13-1-22
 * Time: 上午10:50
 */

define(function (require, exports, module) {
	var root = this, state = false,
		log = require("core/Logger").getLog(),
		MSEvent = require("core/Event").getInstance("MSEvent"),
		ActionEvent = require("core/Event").getInstance("ActionEvent"),
		Transformation = require("utils/Transformation"),
		oDepth = {},precision,oBasePixArea = {"width":60,"height":45,"spineZ":2500},
		vec = new SFVec2f();

	function changeSkeletonData(hipCenter, spine, shoulderCenter, head, leftShoulder, leftElbow, leftWrist, leftHand, rightShoulder, rightElbow, rightWrist, rightHand, leftHip, leftKnee, leftAnkle, leftFoot, rightHip, rightKnee, rightAnkle, rightFoot){
		if(state){
			//精确度，越远越大
			precision = spine.z>=4096?1:(spine.z/4096);
			vec.x = (rightHand.x-(leftShoulder.x+2*(spine.x-leftShoulder.x)))/(oBasePixArea.width/precision)+0.5;
			vec.y = (rightHand.y-leftShoulder.y)/(oBasePixArea.height/precision)+0.5;
			ActionEvent.trigger("uiMouse",vec);
		}
	}

	exports.init = function (oParam){
		if (!state) {
			oDepth = oParam;
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