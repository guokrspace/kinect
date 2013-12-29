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
    var track={      //�����켣����
        "type":"sameDistance",      //����"sameDistance"��ʾ�Ⱦ�켣��"sameTime"��ʾ��ʱ�켣
        "limitTime":1000,
        "limitDistance":1.5,
        "length":5,
        "leftHand":{    //���ֵĹ����켣����
            "preStatus":"init", //���ڱ���ǰһ״̬
            "status":"init", //����״̬
            "datas":[]        //���ƹ켣
        },
        "rightHand":{   //���ֵĹ����켣����
            "preStatus":"init",
            "status":"init",
            "datas":[]
        }
    };
    track.setStatus=function(name,status){
        track[name].preStatus=track[name].status;
        track[name].status=status;
    };
    function changeSkeletonData(hipCenter, spine, shoulderCenter, head, leftShoulder, leftElbow, leftWrist, leftHand, rightShoulder, rightElbow, rightWrist, rightHand, leftHip, leftKnee, leftAnkle, leftFoot, rightHip, rightKnee, rightAnkle, rightFoot){
	    if(state){
            leftHand=getSkeletonPos(leftHand);      //ת��������ʹ�á�
            rightHand=getSkeletonPos(rightHand);    //ת��������ʹ�á�
            leftShoulder=getSkeletonPos(leftShoulder);  //ת��������ʹ�á�
            rightShoulder=getSkeletonPos(rightShoulder);    //ת��������ʹ�á�
            shoulderCenter=getSkeletonPos(shoulderCenter);
            spine=getSkeletonPos(spine);
            if(!init){  //��ʼ��
                unit=C.getVector(leftShoulder,rightShoulder).length()/12;
                if(unit>0){
                    init=true;
                }
            }else{  //��ɳ�ʼ��
                //��ȡ�����ֵĹ켣
                changeTrack("leftHand",leftHand);
                changeTrack("rightHand",rightHand);
                //��ʼ�����߼�
                dealData(leftHand,rightHand,shoulderCenter,spine);
            }
        }
    }
	function getSkeletonPos(skeleton){
		var result=new SFVec3f();
		result.setValue(skeleton.x-oDepth.width/2,oDepth.height/2-skeleton.y,skeleton.z/2000/oDepth.ratioZ);
		return result;
	}

    /**
     * �ı�켣�ĺ���
     * @param name:�켣�ı�ʶ
     * @param position:�켣��
     */
    function changeTrack(name,position){
        switch(track.type){
            case "sameDistance":   //�Ⱦ�켣
                var skeDataLen=track[name].datas.length;   //��ȡ�켣�ĳ���
                var skeData=null;
                if(!track[name].datas||skeDataLen==0){    //�켣����Ϊ��
                    clearTrace(name,position);
                }else{
                    var lastTracePos=track[name].datas[skeDataLen-1];
                    if(lastTracePos.distance>=track.limitDistance*unit){
                        skeData={
                            "position":position,
                            "count":0,
                            "distance":0
                        };
                        track[name].datas.push(skeData);
                    }else{
                        lastTracePos.count=lastTracePos.count+1;    //������1
                        if(lastTracePos.count>track.limitTime){    //��ʱ�Ĺ켣��
                            clearTrace(name,position);
                        }else{
                            var preTracePos=track[name].datas[skeDataLen-2];
                            lastTracePos.position=position;
                            lastTracePos.distance=lastTracePos.subtract(preTracePos).length();
                        }
                    }
                }
                skeDataLen=track[name].datas.length;   //��ȡ�켣�ĳ���
                if(skeDataLen>track.length){
                    track[name].datas.splice(0,skeDataLen-track.length);
                }
                break;
            case "sameTime":       //��ʱ�켣
                break;
        }
    }

    /**
     * ��չ켣���ʼ���켣
     * @param name
     * @param position
     */
    function clearTrace(name,position){
        track[name].datas=[];                  //��չ켣��
        var skeData={
            "position":position,
            "count":0,
            "distance":track.limitDistance
        };
        track[name].datas.push(skeData);   //��ӳ�ʼ��
    }


    /**
     * ����������صĹ�������
     */
    function dealData(leftHand,rightHand,shoulderCenter,spine){
        var pos=shoulderCenter.slerp(spine,0.3);    //��ȡ�Աȵĵ�
        var vectorLen=track.length-1;              //�����ĸ���
        //��������
        var result=dealDataCore("rightHand",pos);
        if(result&&result.invalid==0&&result.forward==vectorLen&&result.down==vectorLen){   //Ͷ��
            if(track["rightHand"].status!="throw"){
                track.setStatus("rightHand","throw");
                clearTrace("rightHand",rightHand);
                clearTrace("leftHand",leftHand);
                ActionEvent.trigger("throwResult",rightHand);
                return false;
            }
        }else if(result&&(result.invalid==vectorLen||result.forward==(-1)*vectorLen)){  //����
            track.setStatus("rightHand","back");
        }
        //��������
        result=dealDataCore("leftHand",pos);
        if(result&&result.invalid==0&&result.forward==vectorLen&&result.down==vectorLen){   //Ͷ��
            if(track["leftHand"].status!="throw"){
                track.setStatus("leftHand","throw");
                clearTrace("leftHand",leftHand);
                ActionEvent.trigger("throwResult",leftHand);
            }
        }else if(result&&(result.invalid==vectorLen||result.forward==(-1)*vectorLen)){  //����
            track.setStatus("leftHand","back");
        }
    }
    function dealDataCore(name,pos){
        var len=track[name].datas.length;
        if(len!=track.length||(len==track.length&&track[name].datas[len-1].distance<track.limitDistance*unit)){
            return null;
        }
        var forward=0;
        var down=0;
        var invalid=0;
        for(var i=0;i<track[name].datas.length-1;i++){
            var data1=track[name].datas[i];
            var data2=track[name].datas[i+1];
            var vector=data2.subtract(data1);
            if(data.y<pos.y){   //���ھ����·�����
                invalid++;
            }
            if(vector.y>0){
                down++;
            }else{
                down--;
            }
            if(vector.z<0){
                forward++;
            }else{
                forward--;
            }
        }
        return {"invalid":invalid,"down":down,"forward":forward};
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