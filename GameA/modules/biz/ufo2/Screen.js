/**
 * Created with JetBrains WebStorm.
 * User: sungf
 * Date: 13-2-27
 * Time: 下午3:42
 * To change this template use File | Settings | File Templates.
 */
define(function(require,exports,module){
	var camera=require("./Config").camera;
	/**
	 * 相机可视平面高
	 * @param nearOrFar 近平面或远平面Z
	 */
	exports.getLookHeight=function(nearOrFar){
		return (camera.position[2]-nearOrFar)*Math.tan(0.15)*2;
	};
	/**
	 * 相机可视平面宽
	 */
	exports.getLookWidth=function(nearOrFar){
		return exports.getLookHeight(nearOrFar)*camera.screenRatio;
	};

});
