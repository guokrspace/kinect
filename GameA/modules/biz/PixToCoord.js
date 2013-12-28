/**
 * Created with JetBrains WebStorm.
 * User: zhangzd
 * Date: 13-1-23
 * Time: ÏÂÎç4:21
 */

define(function (require, exports, module) {
	var root = this, state = false,
		log = require("core/Logger").getLog(),
		translateFlag,MoviePiece,MovieTrans,obj;

	exports.translate = function(){
		if(!translateFlag){
			MoviePiece = SFNode.get("moviePiece");
			MovieTrans = SFNode.get("__depthTrans");
			translateFlag = true;
		}
		if(!obj){
			var MPoint = MoviePiece.coord.point;
			obj = {"width":320,"height":240,abspos:new SFVec3f(MovieTrans.translation)};
			obj.ratioX = (MPoint[1][0] - MPoint[0][0]) / obj.width;
			obj.ratioY = (MPoint[3][1] - MPoint[0][1]) / obj.height;
			obj.ratioZ = obj.ratioX>obj.ratioY?obj.ratioX:obj.ratioY;
		}
		return obj;
	};
});