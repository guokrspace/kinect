/**
 * Created with JetBrains WebStorm.
 * User: sungf
 * Date: 13-3-26
 * Time: ÉÏÎç10:04
 * To change this template use File | Settings | File Templates.
 */
define(function(require,exports,module){
	var root=this,state=false,getNode=false,
		log = require("core/Logger").getLog(),
		ResourceLoader = require("node/ResourceLoader"),
		TimerEvent = require("core/Event").getInstance("Timer"),
		glint={"startSize":new SFVec2f(),"targetSize":new SFVec2f()},
		glintUI;

	function getNodes(){
		if(!getNode){
			glintUI= SFNode.get("glintUI");
			glint.startSize.setValue(glintUI.size);
			glint.targetSize.setValue(glint.startSize.multiply(15));
			getNode=true;
		}
	}
	function loadUI(callBack){
		ResourceLoader.load([
			{type:"ui", uri:"hit.cc6",depends:[{"set":"UI","code":1}]}
		], function () {
			getNodes();
			callBack&&callBack();
		});
	}
	exports.playAnimation=function(posV3,callBack){
		if(state){
//			glintUI.position.setValue(posV3[0]/16,posV3[1]*(-1/12));
			glintUI.alpha=0;
			glintUI.visible=true;
			TimerEvent.bind("time",fun);
			var st=Date.now();
			function fun(t,dt){
				var ft=(t-st)*10;
				if(ft<=1){
					glintUI.size.setValue(glint.startSize.slerp(glint.targetSize,ft));
					if(ft<=0.5){
						glintUI.alpha=ft*2;
					}else{
						glintUI.alpha=2-ft*2;
					}
				}else{
					TimerEvent.unbind("time",fun);
					glintUI.visible=false;
					glintUI.size.setValue(glint.startSize);
					callBack&&callBack();
				}
			}
		}
	};
	exports.stopAnimation=function(){
		if(state){
			glintUI.visible=false;
			glintUI.alpha=0;
			glintUI.size.setValue(glint.startSize);
		}
	};
	exports.init=function(callBack){
		if(!state){
			loadUI(callBack);
			state=true;
		}
	};
	exports.destroy=function(){
		if(state){

			state=false;
		}
	};


});