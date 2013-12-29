/**
 * Created with JetBrains WebStorm.
 * User: zhangzd
 * Date: 13-1-22
 * Time: ����10:50
 */

define(function (require, exports, module) {
	var root = this, state = false,
		log = require("core/Logger").getLog(),
		MSEvent = require("core/Event").getInstance("MSEvent"),
		ActionEvent = require("core/Event").getInstance("ActionEvent"),
		Transformation = require("utils/Transformation"),
		oDepth = {},
		tempHand = new SFVec3f(),handPos = new SFVec3f(),
		tempRWaist = new SFVec3f(),tempRElbow = new SFVec3f(),tempRShoulder = new SFVec3f(),
		tempLWaist = new SFVec3f(),tempLElbow = new SFVec3f(),tempLShoulder = new SFVec3f(),
		shoulderVec = new SFVec3f(-1,0,0),minusYVec = new SFVec3f(0,-1,0),
		armVec = new SFVec3f(),
		angleArm_Y,angleArm_Shoulder,
		lHandState = "down",rHandState = "down";


	function changeSkeletonData(hipCenter, spine, shoulderCenter, head, leftShoulder, leftElbow, leftWrist, leftHand, rightShoulder, rightElbow, rightWrist, rightHand, leftHip, leftKnee, leftAnkle, leftFoot, rightHip, rightKnee, rightAnkle, rightFoot){
		if(state){
			//������������ת��ţ����
			tempRWaist.setValue(rightWrist.x-oDepth.width/2,oDepth.height/2-rightWrist.y,rightWrist.z/2000/oDepth.ratioZ);
			tempRElbow.setValue(rightElbow.x-oDepth.width/2,oDepth.height/2-rightElbow.y,rightElbow.z/2000/oDepth.ratioZ);
			tempRShoulder.setValue(rightShoulder.x-oDepth.width/2,oDepth.height/2-rightShoulder.y,rightShoulder.z/2000/oDepth.ratioZ);
			//��������
			armVec.setValue(tempRWaist.subtract(tempRShoulder));
			//�Ҹ첲��-Y����н�
			angleArm_Y = Transformation.getAngle(minusYVec,armVec,true);
			//���ֵ�λ��
			tempHand.setValue(rightHand.x-oDepth.width/2,oDepth.height/2-rightHand.y,rightHand.z/2000/oDepth.ratioZ);
			//�ж�ʹ���ĸ��ֲ���
			if(rHandState=="down"){
				if(angleArm_Y>((Math.PI)/2)&&shoulderCenter.z-rightHand.z>300){//����̧��
					rHandState = "up";
				}else{
					//������������ת��ţ����
					tempLWaist.setValue(leftWrist.x-oDepth.width/2,oDepth.height/2-leftWrist.y,leftWrist.z/2000/oDepth.ratioZ);
					tempLElbow.setValue(leftElbow.x-oDepth.width/2,oDepth.height/2-leftElbow.y,leftElbow.z/2000/oDepth.ratioZ);
					tempLShoulder.setValue(leftShoulder.x-oDepth.width/2,oDepth.height/2-leftShoulder.y,leftShoulder.z/2000/oDepth.ratioZ);
					//��������
					armVec.setValue(tempLWaist.subtract(tempLShoulder));
					//��첲��-Y����н�
					angleArm_Y = Transformation.getAngle(minusYVec,armVec,true);
					//���ֵ�λ��
					tempHand.setValue(leftHand.x-oDepth.width/2,oDepth.height/2-leftHand.y,leftHand.z/2000/oDepth.ratioZ);
					if(lHandState=="down"){
						if(angleArm_Y>((Math.PI)/2)&&shoulderCenter.z-leftHand.z>300){//����̧��
							lHandState = "up";
						}
					}else if(lHandState=="up"){
						if(angleArm_Y<((Math.PI)/3)&&shoulderCenter.z-leftHand.z<300){//��������
							lHandState = "down";
							ActionEvent.trigger("holdResult",angleArm_Shoulder,handPos,false);
						}else{
							angleArm_Shoulder = Transformation.getAngle(shoulderVec, armVec, true);
							handPos.setValue(oDepth.abspos.x+tempHand.x*oDepth.ratioX,oDepth.abspos.y+tempHand.y*oDepth.ratioY,oDepth.abspos.z);
							ActionEvent.trigger("holdResult",angleArm_Shoulder,handPos,true);
						}
					}
				}
			}else if(rHandState=="up"){
				if(angleArm_Y<((Math.PI)/3)&&shoulderCenter.z-rightHand.z<300){//��������
					rHandState = "down";
					ActionEvent.trigger("holdResult",angleArm_Shoulder,handPos,false);
				}else{
					angleArm_Shoulder = Transformation.getAngle(shoulderVec, armVec, true);
					handPos.setValue(oDepth.abspos.x+tempHand.x*oDepth.ratioX,oDepth.abspos.y+tempHand.y*oDepth.ratioY,oDepth.abspos.z);
					ActionEvent.trigger("holdResult",angleArm_Shoulder,handPos,true);
				}
			}
		}
	}

	exports.init = function (oParam){
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