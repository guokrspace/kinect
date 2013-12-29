/**
 * Created with JetBrains WebStorm.
 * User: zhangzd
 * Date: 13-1-22
 * Time: 上午10:50
 */

define(function (require, exports, module) {
	var root = this, state = false,
		log = require("core/Logger").getLog(),
		MSEvent = require("core/Event").getInstance("MSEvent"),
		ActionEvent = require("core/Event").getInstance("ActionEvent"),
		oDepth = {},len= 30,
		rHandPos = new SFVec3f(),lHandPos = new SFVec3f(),
		tempRHand = new SFVec3f(),tempLHand = new SFVec3f(),

		rHandState="fire",lHandState="fire",
		rTrac='',lTrac='',reg=/4{2,5}$/,
		rLastPos = new SFVec2f(0,0),rPos=new SFVec2f(0,0),
		lLastPos = new SFVec2f(0,0),lPos=new SFVec2f(0,0),
		max_time = 0.07,rLastTime= 0,lLastTime= 0,
		rFireTime=-1,lFireTime=-1,actionTime=1;

	function changeSkeletonData(hipCenter, spine, shoulderCenter, head, leftShoulder, leftElbow, leftWrist, leftHand, rightShoulder, rightElbow, rightWrist, rightHand, leftHip, leftKnee, leftAnkle, leftFoot, rightHip, rightKnee, rightAnkle, rightFoot){
		if(state){
			if(rHandState==="fire"){
				if((Date.now()-rFireTime>actionTime)&&(rightHand.y<shoulderCenter.y)){
					rHandState="ready";

				}else {
					if(lHandState==="fire"){
						if((Date.now()-lFireTime>actionTime)&&(leftHand.y<shoulderCenter.y)){
							lHandState="ready";
						}
					}else if(lHandState==="ready"){
						tempLHand.setValue(leftHand.x-oDepth.width/2,oDepth.height/2-leftHand.y,leftHand.z/1000/oDepth.ratioZ);
						lPos.setValue(leftHand.z/1000/oDepth.ratioZ,oDepth.height/2-leftHand.y);
						if(lLastPos.subtract(lPos).length()>len){
							//生成8方向链码
							lTrac += getOrientation(lLastPos,lPos);
							//停留超过一定时间时清除链码
							var now = Date.now();
							var diff = now-lLastTime;
							lLastTime = now;
							if(diff>max_time){
								lTrac = '';
							}
							//保存上一次的点位置
							lLastPos.setValue(lPos);
						}
						if(lTrac.match(reg)){
							lHandState="fire";
							lHandPos.setValue(oDepth.abspos.x+tempLHand.x*oDepth.ratioX,oDepth.abspos.y+tempLHand.y*oDepth.ratioY,oDepth.abspos.z);
							ActionEvent.trigger("throwResult",lHandPos);
							lFireTime=Date.now();
						}
					}
				}
			}else if(rHandState==="ready"){
				tempRHand.setValue(rightHand.x-oDepth.width/2,oDepth.height/2-rightHand.y,rightHand.z/1000/oDepth.ratioZ);
				rPos.setValue(rightHand.z/1000/oDepth.ratioZ,oDepth.height/2-rightHand.y);
				if(rLastPos.subtract(rPos).length()>len){
					//生成8方向链码
					rTrac += getOrientation(rLastPos,rPos);
					//停留超过一定时间时清除链码
					var now = Date.now();
					var diff = now-rLastTime;
					rLastTime = now;
					if(diff>max_time){
						rTrac = '';
					}
					//保存上一次的点位置
					rLastPos.setValue(rPos);
				}
				if(rTrac.match(reg)){
					rHandState="fire";
					rHandPos.setValue(oDepth.abspos.x+tempRHand.x*oDepth.ratioX,oDepth.abspos.y+tempRHand.y*oDepth.ratioY,oDepth.abspos.z);
					ActionEvent.trigger("throwResult",rHandPos);
					rFireTime=Date.now();

				}
			}
		}

	}
	function getOrientation(p1,p2){
		var s = p2.subtract(p1), //将p1和p2转换为相对坐标s
			PI = Math.PI,
			base = PI/8,
			angle = Math.atan(Math.abs(s[1])/Math.abs(s[0])),//计算p1到p2的外切线夹角
			or = '';

		//将夹角转换为0-2PI的值
		if(s.x>0&&-s.y>0){ angle = angle;}
		if(s.x<0&&-s.y>0){ angle = PI-angle;}
		if(s.x<0&&-s.y<0){ angle = PI+angle;}
		if(s.x>0&&-s.y<0){ angle = 2*PI-angle;}
		if(s.x==0){
			if(-s.y>0){ angle = PI/2;}
			if(-s.y<0){ angle = PI*3/2;}
		}
		if(s.y==0){
			if(s.x>0){ angle = 0;}
			if(s.x<0){ angle = PI;}
		}
		/*
		 * 根据夹角大小，生成链码基元
		 * 3   2    1
		 *   ↖↑↗
		 * 4 ←  → 0
		 *   ↙↓↘
		 * 5   6    7
		 */
		if(angle<base||angle>=15*base){ or = 0 };
		if(angle<3*base&&angle>=base){ or = 1 };
		if(angle<5*base&&angle>=3*base){ or = 2 };
		if(angle<7*base&&angle>=5*base){ or = 3 };
		if(angle<9*base&&angle>=7*base){ or = 4 };
		if(angle<11*base&&angle>=9*base){ or = 5 };
		if(angle<13*base&&angle>=11*base){ or = 6 };
		if(angle<15*base&&angle>=13*base){ or = 7 };

		return or;
	}
	exports.init = function (oParam) {
		if (!state) {
			oDepth = oParam;
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
