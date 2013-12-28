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
		oDepth = {},precision,oBasePixArea = {"width":80,"height":45,"spineZ":2500},
		vec = new SFVec3f();

	function changeSkeletonData(hipCenter, spine, shoulderCenter, head, leftShoulder, leftElbow, leftWrist, leftHand, rightShoulder, rightElbow, rightWrist, rightHand, leftHip, leftKnee, leftAnkle, leftFoot, rightHip, rightKnee, rightAnkle, rightFoot){
		if(state){
			//精确度，越远越大
//			precision = spine.z>=4096?1:(spine.z/4096);
			vec.x = (rightWrist.x-rightShoulder.x)/oBasePixArea.width;
			vec.y = (rightShoulder.y-rightWrist.y)/oBasePixArea.height;
			ActionEvent.trigger("mouse",vec);
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