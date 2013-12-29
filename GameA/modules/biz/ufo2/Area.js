/**
 * Created with JetBrains WebStorm.
 * User: sungf
 * Date: 13-2-27
 * Time: 下午3:42
 * To change this template use File | Settings | File Templates.
 */
define(function(require,exports,module){
	var state=false,hasSet=false,
		log=require("core/Logger").getLog(),
		nearOrFar=require("./Config").global.targetZ,
		Screen=require("./Screen"),
		targets=[];

	/**
	 * 设置九宫格内9个点的值
	 */
	function setTarget(){
		var w=Screen.getLookWidth(nearOrFar),
			h=Screen.getLookHeight(nearOrFar);
		var leftTopPos=new SFVec3f(-1*w*(7/24),h*1/4,nearOrFar);

		for(var i=0;i<3;i++){//行
			for(var j=0;j<3;j++){//列
				var target=new SFVec3f(leftTopPos.x+i*w*(7/24),leftTopPos.y-j*(h*5/24),nearOrFar);
				targets.push(target);
			}
		}
	}

	/**
	 * 从0~8中选出5~9个不重复的数
	 */
	var fingers,num;
	function selectTargets(){
		var areas = [];
		fingers = [0,1,2,3,4,5,6,7,8];
		num = 5+Math.floor(Math.random()*5);
		for(var i=0;i<num;i++){
			var index = Math.floor(Math.random()*fingers.length);
			//此处为了增加效率，在push(target)时，没有new SFVec3f()，在以后的使用中不能对areas中数据进行赋值操作
			areas.push(targets[fingers[index]]);
			fingers.splice(index,1);
		}
		return areas;
	}
	exports.getAreas=function(){
		if(state){
			return 	selectTargets();
		}
	};
	exports.init=function(){
		if(!state){
			state=true;
			if(!hasSet){
				setTarget();
				hasSet=true;
			}
		}
	};
	exports.destroy=function(){
		if(state){
			state=false;
		}
	};
});