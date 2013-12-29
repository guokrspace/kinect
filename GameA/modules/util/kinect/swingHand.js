/**
 * 手势：
 *  右(左)手抬过颈部，有向上的趋势
 * User: yaoxx
 * Date: 12-3-3
 * Time: 下午5:40
 */
define(function (require, exports, module) {
    var root = this, state = false,
        log = require("core/Logger").getLog(),
        MSEvent = require("core/Event").getInstance("MSEvent"),
        ActionEvent = require("core/Event").getInstance("ActionEvent"),
        C=require("../alg/Space");      //空间算法模块
    var init=false; //是否初始化
	var oDepth = {};  //用于转化像素骨骼数据
    var unit=0;      //人体基本单位，以两肩的1/12为准。
    var deta=2,num=4;  //空间等距骨骼数据的参数
    var track={"leftHand":[],"rightHand":[]};       //存储空间等距骨骼数据
    var distance=0,count=0;
    function changeSkeletonData(hipCenter, spine, shoulderCenter, head, leftShoulder, leftElbow, leftWrist, leftHand, rightShoulder, rightElbow, rightWrist, rightHand, leftHip, leftKnee, leftAnkle, leftFoot, rightHip, rightKnee, rightAnkle, rightFoot){
	    if(state){
		    leftHand=getSkeletonPos(leftHand);      //转换后在再使用。
		    rightHand=getSkeletonPos(rightHand);    //转换后在再使用。
		    leftShoulder=getSkeletonPos(leftShoulder);  //转换后在再使用。
		    rightShoulder=getSkeletonPos(rightShoulder);    //转换后在再使用。
		    shoulderCenter=getSkeletonPos(shoulderCenter);  //转换后在再使用。
            spine=getSkeletonPos(spine);           //转换后在再使用。
            if(!init){  //初始化
                unit=C.getVector(leftShoulder,rightShoulder).length()/12;
                if(unit>0){
                    init=true;
                }
            }else{  //完成初始化
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
                if(track.rightHand.length==num){    //右手优先
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
     * 分析骨骼相关的骨骼数据
     * @param datas:分析的数据,arg0：表示对比的标准
     */
    var gameStatus="off";
    function dealData(datas,arg0){
        for(var i=0;i<datas.length-1;i++){
            if(datas[i].y<arg0.y){  //低于颈部
                gameStatus="off";
                return false;
            }
            if(C.getVector(datas[i],datas[i+1]).y<0){  //有向下的趋势
                gameStatus="off";
                return false;
            }
        }
	    //清空痕迹
        if(gameStatus=="off"){
//            track.leftHand=[];
//            track.rightHand=[];
            gameStatus="on";
            ActionEvent.trigger("swingHand");   //符合
        }
        return true;
    }


    /**
     * 插入骨骼数据（近适合本模块）
     * @param skeData:骨骼数据对象
     */
    function insert(skeData){
        if(!skeData||(!skeData.leftHand&&!skeData.rightHand)){    //处理数据无效的情况
	        log.debug("骨骼数据无效");
            return false;
        }
        if(track.leftHand.length>=num){  //删除多余的数据
            track.leftHand.splice(0,track.leftHand.length-num+1);
        }
        if(track.rightHand.length>=num){  //删除多余的数据
            track.rightHand.splice(0,track.rightHand.length-num+1);
        }
        if(skeData.leftHand){   //左手数据不为空
            track.leftHand.push(new SFVec3f(skeData.leftHand));
        }
        if(skeData.rightHand){ //右手数据不为空
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