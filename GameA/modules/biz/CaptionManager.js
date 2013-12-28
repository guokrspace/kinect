/**
 * Created by JetBrains WebStorm.
 * User: Administrator
 * Date: 12-3-9
 * Time: ����4:12
 */
define(function (require, exports, module) {
    var root = this, state = false,
        log = require("core/Logger").getLog();
    var Pool=require("node/NodeCachePool"),
        Timer=require("core/Timer");
    var captionPath = "/resources/avatars/caption/";
    var caption,captionInstance,captionTrans;        //��������
    var startPos=new SFVec3f(0.7,-0.5,0);
    var endPos=new SFVec3f(0.45,-0.5,0);
    var walkTime=2,turnTime=0.5;
    var startAngle=1.2,endAngle=0.4;

    exports.init = function (callback) {
        log.info("��ʼ��");
        if (!state) {
            loadRes(callback);
            state = true;
        }
    };

    function loadRes(callback){
        var template="Transform {translation 0.7 -0.5 0 scale 1 1 1 children[s%]}";
        caption=Pool.create("main.lyx",template,captionPath);
        GROUPMID.addChild(caption.node);    //���뻷����
        setTimeout(function(){
            captionInstance=SFNode.get("caption_bone_instance");
            captionTrans=SFNode.get("caption_trans");
//            captionTrans.rotation.angle=-1.2;
            callback&&callback();   //������ɺ�ִ�лص�
        },0.1);
    }
    /**
     * @param isIn:�жϽ������߽������߳�
     */
    exports.show=function(isIn){
        captionInstance.animCycle[0]="walk.caf";        //�ı䶯��
        if(isIn){   //�߽�
//            captionTrans.rotation.angle=startAngle;
            captionTrans.rotation=new SFRotation(0,-1,0,startAngle);
            var timerId1=Timer.bindFraction(walkTime+turnTime,function(f){
                var f0=walkTime/(walkTime+turnTime);
                if(f<=f0){  //����
                    var newF=f*((walkTime+turnTime)/walkTime);
                    caption.node.translation=startPos.slerp(endPos,newF);
                }else{  //ת��
                    var angle=endAngle-(endAngle-startAngle)*(1-f)/(1-f0);
//                    captionTrans.rotation.angle=angle;
                    captionTrans.rotation=new SFRotation(0,-1,0,angle);
                }
            },function(){   //����Ŀ�ĵ�
                captionInstance.animClear=["walk.caf",0.5];       //ֹͣ����
                captionInstance.animCycle[0]="standby.caf";        //�ı䶯��
                Timer.clear(timerId1);
            });
        }else{  //�߳�
//            captionTrans.rotation.angle=-startAngle;
            captionTrans.rotation=new SFRotation(0,-1,0,-1*startAngle);
            var timerId2=Timer.bindFraction(walkTime+turnTime,function(f){
                caption.node.translation.setValue(endPos.slerp(startPos,f));
            },function(){   //����Ŀ�ĵ�
                captionInstance.animClear=["walk.caf",0.5];       //ֹͣ����
                captionInstance.animCycle[0]="standby.caf";        //�ı䶯��
                Timer.clear(timerId2);
            });
        }
    };

    exports.destroy = function () {
        if (state) {
            Pool.remove(caption.id);
            GROUPMID.remove(caption.node);  //�л��������
            state = false;
        }
    };
});