/**
 * Created with JetBrains WebStorm.
 * User: sungf
 * Date: 13-2-27
 * Time: ����3:42
 * To change this template use File | Settings | File Templates.
 */
define(function(require,exports,module){
	var state=false,hasSet=false,
		log=require("core/Logger").getLog(),
		nearOrFar=require("./Config").global.targetZ,
		Screen=require("./Screen"),
		targets=[];

	/**
	 * ���þŹ�����9�����ֵ
	 */
	function setTarget(){
		var w=Screen.getLookWidth(nearOrFar),
			h=Screen.getLookHeight(nearOrFar);
		var leftTopPos=new SFVec3f(-1*w*(7/24),h*1/4,nearOrFar);

		for(var i=0;i<3;i++){//��
			for(var j=0;j<3;j++){//��
				var target=new SFVec3f(leftTopPos.x+i*w*(7/24),leftTopPos.y-j*(h*5/24),nearOrFar);
				targets.push(target);
			}
		}
	}

	/**
	 * ��0~8��ѡ��5~9�����ظ�����
	 */
	var fingers,num;
	function selectTargets(){
		var areas = [];
		fingers = [0,1,2,3,4,5,6,7,8];
		num = 5+Math.floor(Math.random()*5);
		for(var i=0;i<num;i++){
			var index = Math.floor(Math.random()*fingers.length);
			//�˴�Ϊ������Ч�ʣ���push(target)ʱ��û��new SFVec3f()�����Ժ��ʹ���в��ܶ�areas�����ݽ��и�ֵ����
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