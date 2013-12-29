/**
 * Created with JetBrains WebStorm.
 * User: sungf
 * Date: 13-2-25
 * Time: 下午5:59
 * To change this template use File | Settings | File Templates.
 */
define(function(require,exports,module){
	var state=false,
		log=require("core/Logger").getLog(),
		Config=require("./Config"),
		nearOrFar=Config.global.targetZ,
		targets=[],
		select=[],
		areas=[];
	function getLookHeight(z){
		return (Config.camera.position[2]-z)*Math.tan(0.15)*2;
	}
	function getLookWidth(z){
		return getLookHeight(z)*4/3;
	}
	function setTarget(){
		var w=getLookWidth(nearOrFar),
			h=getLookHeight(nearOrFar);
		var leftTopPos=new SFVec3f(-1*w/2,h/2,nearOrFar);
		var h2=h*3/4;

		for(var i=0;i<3;i++){//行
			for(var j=0;j<3;j++){//列
				var target=new SFVec3f(leftTopPos.x+(w/3)+j*(w/6),leftTopPos.y-(h2/3)-(i*h2/4),nearOrFar);
				targets.push(target);
			}
		}
	}

	//从0~8中选出5~9个不重复的数
	var fingers,num;
	function getSelect(){
		select = [];
		fingers = [0,1,2,3,4,5,6,7,8];
		num = 5+Math.floor(Math.random()*5);
		for(var i=0;i<num;i++){
			var index = Math.floor(Math.random()*fingers.length);
			select.push(fingers[index]);
			fingers.splice(index,1);
		}
	}
	function createAreas(){
		areas = [];
		for(var i= 0,len=select.length;i<len;i++){
			var area=new SFVec3f();
			area.setValue(targets[select[i]]);
			areas.push(area);
		}
	}
	exports.getR =function(){
		return 0.9*getLookHeight(nearOrFar)/8;
	};
	exports.getAreas=function(){
		getSelect();
		createAreas();
		return areas;
	};
	exports.init=function(){
		if(!state){
			state=true;
			setTarget();
		}
	};
	exports.destroy=function(){
		if(state){
			state=false;
		}
	};
});