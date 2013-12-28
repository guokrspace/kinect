/**
 * Created with JetBrains WebStorm.
 * User: zhangzd
 * Date: 13-1-22
 * Time: ÉÏÎç10:20
 */

define(function (require, exports, module) {
	var root = this, state = false,
		log = require("core/Logger").getLog(),
		ResourceLoader = require("node/ResourceLoader"),
		curScene;

	exports.loadScene = function(scene,callback){
		if(state){
			if(curScene!=scene){
				
				ResourceLoader.render({
					"loadList":[
						{"type":"scene","uri":RS.scenes[scene]}
					]
				},function(){
					callback&&callback();
				},true);
			}
		}
	};

	exports.init = function () {
		if (!state) {
			state = true;
		}
	};

	exports.destroy = function () {
		if (state) {
			state = false;
		}
	};
});
