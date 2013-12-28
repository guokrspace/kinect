/**
 * Created with JetBrains WebStorm.
 * User: sungf
 * Date: 13-3-26
 * Time: ÏÂÎç4:10
 * To change this template use File | Settings | File Templates.
 */
define(function(require,exports,module){
	var root=this,state=false,getNode=false,
		log = require("core/Logger").getLog(),
		ResourceLoader = require("node/ResourceLoader"),
		TimerEvent = require("core/Event").getInstance("Timer"),
		FireTrans,FireSwi,FireTexCoord,
		SmokeTrans,SmokeSwi,SmokeTexCoord,
		oSupport = {
			"fire":{"speed":0.04,"x":4,"y":4,"xunit":0.25,"yunit":0.25,"stepX":1,"stepY":1,"point":new MFVec2f(new SFVec2f(0,0),new SFVec2f(0,0),new SFVec2f(0,0),new SFVec2f(0,0))},
			"smoke":{"speed":0.04,"x":4,"y":4,"xunit":0.25,"yunit":0.25,"stepX":1,"stepY":1,"point":new MFVec2f(new SFVec2f(0,0),new SFVec2f(0,0),new SFVec2f(0,0),new SFVec2f(0,0))}
		},
		oTrans = {"fire":{},"smoke":{}},oSwi = {"fire":{},"smoke":{}},oTexCoord = {"fire":{},"smoke":{}};

	function getNodes(){
		if(!getNode){
			ResourceLoader.load([
				{type:"item",uri:"effects/fire.lyx"}
			],function(){
				FireTrans = SFNode.get("fireTrans");
				FireSwi = FireTrans.children[0];
				FireTexCoord = FireSwi.choice[1].texCoord;
				oTrans.fire = FireTrans;
				oSwi.fire = FireSwi;
				oTexCoord.fire = FireTexCoord;

				SmokeTrans = SFNode.get("smokeTrans");
				SmokeSwi = SmokeTrans.children[0];
				SmokeTexCoord = SmokeSwi.choice[1].texCoord;
				oTrans.smoke = SmokeTrans;
				oSwi.smoke = SmokeSwi;
				oTexCoord.smoke = SmokeTexCoord;
			});
			getNode=true;
		}
	}

	exports.playAnimation=function(posV3,type,callback){
		if(state){
			(function(v){
				var thisEffect = oSupport[v];
				if(thisEffect){
					var lastTime=Date.now();
					var count = 0;
					oTrans[v].translation.setValue(posV3.x,posV3.y,posV3.z+1.5);
					oSwi[v].whichChoice = -3;
					thisEffect.stepX = 1;
					thisEffect.stepY = 1;
					var fun = function(t,dt){
						if((t-lastTime)>=thisEffect.speed){
							count++;
							if(count<thisEffect.x*thisEffect.y){
								thisEffect.point[0].setValue(thisEffect.xunit*(thisEffect.stepX-1),(1-thisEffect.yunit*thisEffect.stepY));
								thisEffect.point[1].setValue(thisEffect.xunit*thisEffect.stepX,(1-thisEffect.yunit*thisEffect.stepY));
								thisEffect.point[2].setValue(thisEffect.xunit*thisEffect.stepX,(1-thisEffect.yunit*(thisEffect.stepY-1)));
								thisEffect.point[3].setValue(thisEffect.xunit*(thisEffect.stepX-1),(1-thisEffect.yunit*(thisEffect.stepY-1)));
								if((thisEffect.stepX+1)>thisEffect.x){
									thisEffect.stepX = 1;
									if((thisEffect.stepY+1)>thisEffect.y){
										thisEffect.stepY = 1;
									}else{
										thisEffect.stepY += 1;
									}
								}else{
									thisEffect.stepX += 1;
								}
								oTexCoord[v].point = thisEffect.point;
								lastTime = t;
							}else{
								oSwi[v].whichChoice = -1;
								callback&&callback();
								TimerEvent.unbind("time",fun);
							}
						}
					};
					TimerEvent.bind("time",fun);
				}else{
					callback&&callback();
				}
			})(type);
		}
	};

	exports.stopAnimation=function(){
		if(state){
			for(var key in oSwi){
				oSwi[key].whichChoice = -1;
			}
		}
	};

	exports.init=function(callBack){
		if(!state){
			getNodes();
			state=true;
		}
	};

	exports.destroy=function(){
		if(state){
			exports.stopAnimation();
			state=false;
		}
	};
});