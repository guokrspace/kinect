/**
 * Created by JetBrains WebStorm.
 * User: Administrator
 * Date: 13-3-25
 * Time: ����6:14
 */
define(function (require, exports, module) {
    var root = this, state = false,
        log = require("core/Logger").getLog(),
        Timer=require("core/Timer");
    var globalBg;
    var camera;
    var movieNode=SFNode.get("__movieSceneTexture");
    //�����𶯵���Ч
    var quakeNum=10,quakeTime=0.4;
    exports.play_quake=function(){
        if(!globalBg){globalBg = SFNode.get("globalBg");}
        if(!camera){camera=SFNode.get("__camera");}
        /**
         * UIȡ0.02������ͷȡ0.6���ԴﵽUI������ͷͬ����Ч����
         * ����ʱ��Ҫ������
         */
        var uiObj={
            "nodeLoc":globalBg.position,
            "centerPos":new SFVec2f(0,0),
            "quakeRange":0.02,
            "oldLocation":new SFVec2f(0,0),
            "newLocation":new SFVec2f(0,0),
            "count":{     //�𶯵Ĵ�������
                "val":0,
                "isChange":false,
                "setVal":function(newVal){
                    var oldVal=this.val;
                    if(newVal==oldVal){
                        this.isChange=false;
                    }else{
                        this.val=newVal;
                        this.isChange=true;
                    }
                }
            }
        };
        var cameraObj={
            "nodeLoc":camera.orientation,
            "centerPos":new SFRotation(0,0,1,0),
            "quakeRange":getRadian(0.6),
            "oldLocation":new SFRotation(0,0,1,0),
            "newLocation":new SFRotation(0,0,1,0),
            "count":{     //�𶯵Ĵ�������
                "val":0,
                "isChange":false,
                "setVal":function(newVal){
                    var oldVal=this.val;
                    if(newVal==oldVal){
                        this.isChange=false;
                    }else{
                        this.val=newVal;
                        this.isChange=true;
                    }
                }
            }
        };
        movieNode.refresh=false;
        var timerId=Timer.bindFraction(quakeTime,function(f){
            quakeCore(uiObj,f);
            quakeCore(cameraObj,f);
        },function(){
            movieNode.refresh=true;
        });
    };
    function quakeCore(obj,f){
        obj.count.setVal(Math.floor(quakeNum*f));
        var newF=quakeNum*f-obj.count.val;
        if(obj.count.isChange){
            obj.oldLocation.setValue(obj.newLocation);
            obj.newLocation.setValue(getQuakeLocation(obj.centerPos,obj.quakeRange,obj.count.val));
//            globalBg.position.setValue(newLocation);
        }
        obj.nodeLoc.setValue(obj.oldLocation.slerp(obj.newLocation,newF));
        if(f==1){
            obj.nodeLoc.setValue(obj.centerPos);
        }
    }
    function getQuakeLocation(centerPos,quakeRange,count){
//        var angleArray=[180,0,180,0,180,0,180,0,180,0];   //������
        var angleArray=[45,225,45,225,45,225,45,225,45,225];
//        var angleArray=[315,225,45,135,180,270,90,0,180,0];
        var angle=getRadian(angleArray[count%angleArray.length]);
        var vector=new SFVec2f(quakeRange*Math.cos(angle),quakeRange*Math.sin(angle));
        if(centerPos instanceof SFVec2f){
            return centerPos.add(vector);
        }else if(centerPos instanceof SFRotation){
            vector=new SFVec3f(vector[0],vector[1],0);
            return getOrientation(vector,quakeRange);
        }
    }
    function getOrientation(vector,dAngle){
        var rotation=new SFRotation(0,0,1,1.57);
        var axis=rotation.multVec(vector);
        axis=axis.normalize();      //������λ��
        return new SFRotation(axis,dAngle);
    }
    function getRadian(angle){
        return angle*Math.PI/180;
    }
});