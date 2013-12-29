/**
 * Created with JetBrains WebStorm.
 * User: sungf
 * Date: 13-2-27
 * Time: ����3:42
 * To change this template use File | Settings | File Templates.
 */
define(function(require,exports,module){
	var camera=require("./Config").camera;
	/**
	 * �������ƽ���
	 * @param nearOrFar ��ƽ���Զƽ��Z
	 */
	exports.getLookHeight=function(nearOrFar){
		return (camera.position[2]-nearOrFar)*Math.tan(0.15)*2;
	};
	/**
	 * �������ƽ���
	 */
	exports.getLookWidth=function(nearOrFar){
		return exports.getLookHeight(nearOrFar)*camera.screenRatio;
	};

});
