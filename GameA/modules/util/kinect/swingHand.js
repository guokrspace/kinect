/**
 * ���ƣ�
 *  ��(��)��̧�������������ϵ�����
 * User: yaoxx
 * Date: 12-3-3
 * Time: ����5:40
 */
define(function (require, exports, module) {
    var root = this, state = false,
        log = require("core/Logger").getLog(),
        MSEvent = require("core/Event").getInstance("MSEvent"),
        ActionEvent = require("core/Event").getInstance("ActionEvent"),
        C=require("../alg/Space");      //�ռ��㷨ģ��
    var init=false; //�Ƿ��ʼ��
	var oDepth = {};  //����ת�����ع�������
    var unit=0;      //���������λ���������1/12Ϊ׼��
    var deta=2,num=4;  //�ռ�Ⱦ�������ݵĲ���
    var track={"leftHand":[],"rightHand":[]};       //�洢�ռ�Ⱦ��������
    var distance=0,count=0;
    function changeSkeletonData(hipCenter, spine, shoulderCenter, head, leftShoulder, leftElbow, leftWrist, leftHand, rightShoulder, rightElbow, rightWrist, rightHand, leftHip, leftKnee, leftAnkle, leftFoot, rightHip, rightKnee, rightAnkle, rightFoot){
	    if(state){
		    leftHand=getSkeletonPos(leftHand);      //ת��������ʹ�á�
		    rightHand=getSkeletonPos(rightHand);    //ת��������ʹ�á�
		    leftShoulder=getSkeletonPos(leftShoulder);  //ת��������ʹ�á�
		    rightShoulder=getSkeletonPos(rightShoulder);    //ת��������ʹ�á�
		    shoulderCenter=getSkeletonPos(shoulderCenter);  //ת��������ʹ�á�
            spine=getSkeletonPos(spine);           //ת��������ʹ�á�
            if(!init){  //��ʼ��
                unit=C.getVector(leftShoulder,rightShoulder).length()/12;
                if(unit>0){
                    init=true;
                }
            }else{  //��ɳ�ʼ��
                if(track.leftHand.length==0){
                    insert({"leftHand":leftHand,"rightHand":null});
                }else{
                    if(C.getVector(track.leftHand[track.leftHand.length-1],leftHand).length()>=deta*unit){
                        insert({"leftHand":leftHand,"rightHand":null});
                    }
                }
                if(track.rightHand.length==0){
                    insert({"leftHand":null,"rightHand":rightHand});
                }else{
                    if(C.getVector(track.rightHand[track.rightHand.length-1],rightHand).length()>=deta*unit){
                        insert({"leftHand":null,"rightHand":rightHand});
                    }
                }
                if(track.rightHand.length==num){    //��������
                    var result=dealData(track.rightHand,shoulderCenter.slerp(spine,0.3));
                }
                if(!result&&track.leftHand.length==num){
                    dealData(track.leftHand,shoulderCenter.slerp(spine,0.3));
                }
            }
        }
    }
	function getSkeletonPos(skeleton){
		var result=new SFVec3f();
		result.setValue(skeleton.x-oDepth.width/2,oDepth.height/2-skeleton.y,skeleton.z/2000/oDepth.ratioZ);
		return result;
	}

    /**
     * ����������صĹ�������
     * @param datas:����������,arg0����ʾ�Աȵı�׼
     */
    var gameStatus="off";
    function dealData(datas,arg0){
        for(var i=0;i<datas.length-1;i++){
            if(datas[i].y<arg0.y){  //���ھ���
                gameStatus="off";
                return false;
            }
            if(C.getVector(datas[i],datas[i+1]).y<0){  //�����µ�����
                gameStatus="off";
                return false;
            }
        }
	    //��պۼ�
        if(gameStatus=="off"){
//            track.leftHand=[];
//            track.rightHand=[];
            gameStatus="on";
            ActionEvent.trigger("swingHand");   //����
        }
        return true;
    }


    /**
     * ����������ݣ����ʺϱ�ģ�飩
     * @param skeData:�������ݶ���
     */
    function insert(skeData){
        if(!skeData||(!skeData.leftHand&&!skeData.rightHand)){    //����������Ч�����
	        log.debug("����������Ч");
            return false;
        }
        if(track.leftHand.length>=num){  //ɾ�����������
            track.leftHand.splice(0,track.leftHand.length-num+1);
        }
        if(track.rightHand.length>=num){  //ɾ�����������
            track.rightHand.splice(0,track.rightHand.length-num+1);
        }
        if(skeData.leftHand){   //�������ݲ�Ϊ��
            track.leftHand.push(new SFVec3f(skeData.leftHand));
        }
        if(skeData.rightHand){ //�������ݲ�Ϊ��
            track.rightHand.push(new SFVec3f(skeData.rightHand));
        }
        return true;
    }


    exports.init = function (oParam){
        if (!state) {
	        state = true;
            init=false;
	        oDepth = oParam;
            MSEvent.bind("frameChange",changeSkeletonData);
        }
    };

    exports.destroy = function () {
        if (state) {
            MSEvent.unbind("frameChange",changeSkeletonData);
            state = false;
        }
    };
});