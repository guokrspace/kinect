/**
 * Created by JetBrains WebStorm.
 * User: Administrator
 * Date: 13-3-25
 * Time: 下午6:14
 */
define(function (require, exports, module) {
    var root = this, state = false,
        log = require("core/Logger").getLog(),
        Timer=require("core/Timer");
    var globalBg;
    var camera;
    var movieNode=SFNode.get("__movieSceneTexture");
    //播放震动的特效
    var quakeNum=20,quakeTime=0.6;
    exports.play_quake=function(){
        if(!globalBg){globalBg = SFNode.get("globalBg");}
        if(!camera){camera=SFNode.get("__camera");}
        var uiObj={
            "nodeLoc":globalBg.position,
            "centerPos":new SFVec2f(0,0),
            "quakeRange":0.01,
            "oldLocation":new SFVec2f(0,0),
            "newLocation":new SFVec2f(0,0),
            "count":{     //震动的次数对象
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
            "nodeLoc":camera.position,
            "centerPos":new SFVec3f(0,0,0),
            "quakeRange":0.02,
            "oldLocation":new SFVec3f(0,0,0),
            "newLocation":new SFVec3f(0,0,0),
            "count":{     //震动的次数对象
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
//        var angle=Math.random()*Math.PI*2;
        var angleArray=[15,345,160,200,60,300,280,80,200,0];
        if(centerPos instanceof SFVec3f){
            for(var i in angleArray){
                angleArray[i]=360-angleArray[i];
            }
        }
        var angle=getRadian(angleArray[count%angleArray.length]);
        var vector=new SFVec2f(quakeRange*Math.cos(angle),quakeRange*Math.sin(angle));
        var dVector;
        if(centerPos instanceof SFVec2f){
            dVector = new SFVec2f(vector);
        }else if(centerPos instanceof SFVec3f){
            dVector=new SFVec3f(vector[0],vector[1],0);
        }
         return centerPos.add(dVector);
    }
    function getRadian(angle){
        return angle*Math.PI/180;
    }
});