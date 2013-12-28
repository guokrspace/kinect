/**
 * Created with JetBrains WebStorm.
 * User: zhangzd
 * Date: 13-2-21
 * Time: ÏÂÎç3:15
 */

define(function (require, exports, module) {
	var root = this, state = false,getNode = false,eventBind = false,
		log = require("core/Logger").getLog(),
		ActionEvent = require("core/Event").getInstance("ActionEvent"),
		MSEvent = require("core/Event").getInstance("MSEvent"),
		Timer = require("core/Timer"),
		PixToCoord = require("./PixToCoord"),
		maskMovieUI,gSpine = new SFVec3f(),
		oDepth = {},screenBottom = 0,
		target = new SFVec2f(),oldPos = new SFVec2f(),frameTime = Date.now();

	function getNodes(){
		if(!getNode){
			maskMovieUI = SFNode.get("maskMovieUI");
			getNode = true;
		}
	}

	function changePiecePos(){
		Timer.bindFraction(1,function(f){
			maskMovieUI.position.setValue(oldPos.slerp(target,f));
		});
	}

	function changeSkeletonData(hipCenter, spine, shoulderCenter, head, leftShoulder, leftElbow, leftWrist, leftHand, rightShoulder, rightElbow, rightWrist, rightHand, leftHip, leftKnee, leftAnkle, leftFoot, rightHip, rightKnee, rightAnkle, rightFoot){
		gSpine.setValue(spine);
		frameTime = Date.now();
	}

	exports.reset = function(){
		if(state){
			oldPos.setValue(maskMovieUI.position);
			target.setValue(oldPos.x,0.4);
			changePiecePos();
		}
	};

	exports.check = function(need){
		if(state){
			getNodes();
			if(need&&gSpine&&typeof(gSpine.y=="number")&&(Date.now()-frameTime)<1){
				oldPos.setValue(maskMovieUI.position);
				var spineY = 1-(gSpine.y/oDepth.height)*0.75;
				target.setValue(oldPos.x,spineY);
				setTimeout(changePiecePos,2);
			}
		}
	};

	exports.init = function () {
		if (!state) {
			screenBottom = 1;
			oDepth = PixToCoord.translate();
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