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
    var track={      //骨骼轨迹对象
        "type":"sameDistance",      //其中"sameDistance"表示等距轨迹，"sameTime"表示等时轨迹
        "limitTime":1000,
        "limitDistance":1.5,
        "length":5,
        "leftHand":{    //左手的骨骼轨迹数据
            "preStatus":"init", //用于保存前一状态
            "status":"init", //手势状态
            "datas":[]        //手势轨迹
        },
        "rightHand":{   //右手的骨骼轨迹数据
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
            leftHand=getSkeletonPos(leftHand);      //转换后在再使用。
            rightHand=getSkeletonPos(rightHand);    //转换后在再使用。
            leftShoulder=getSkeletonPos(leftShoulder);  //转换后在再使用。
            rightShoulder=getSkeletonPos(rightShoulder);    //转换后在再使用。
            shoulderCenter=getSkeletonPos(shoulderCenter);
            spine=getSkeletonPos(spine);
            if(!init){  //初始化
                unit=C.getVector(leftShoulder,rightShoulder).length()/12;
                if(unit>0){
                    init=true;
                }
            }else{  //完成初始化
                //获取左右手的轨迹
                changeTrack("leftHand",leftHand);
                changeTrack("rightHand",rightHand);
                //初始数据逻辑
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
     * 改变轨迹的函数
     * @param name:轨迹的标识
     * @param position:轨迹点
     */
    function changeTrack(name,position){
        switch(track.type){
            case "sameDistance":   //等距轨迹
                var skeDataLen=track[name].datas.length;   //获取轨迹的长度
                var skeData=null;
                if(!track[name].datas||skeDataLen==0){    //轨迹数组为空
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
                        lastTracePos.count=lastTracePos.count+1;    //次数加1
                        if(lastTracePos.count>track.limitTime){    //超时的轨迹点
                            clearTrace(name,position);
                        }else{
                            var preTracePos=track[name].datas[skeDataLen-2];
                            lastTracePos.position=position;
                            lastTracePos.distance=lastTracePos.subtract(preTracePos).length();
                        }
                    }
                }
                skeDataLen=track[name].datas.length;   //获取轨迹的长度
                if(skeDataLen>track.length){
                    track[name].datas.splice(0,skeDataLen-track.length);
                }
                break;
            case "sameTime":       //等时轨迹
                break;
        }
    }

    /**
     * 清空轨迹或初始化轨迹
     * @param name
     * @param position
     */
    function clearTrace(name,position){
        track[name].datas=[];                  //清空轨迹点
        var skeData={
            "position":position,
            "count":0,
            "distance":track.limitDistance
        };
        track[name].datas.push(skeData);   //添加初始点
    }


    /**
     * 分析骨骼相关的骨骼数据
     */
    function dealData(leftHand,rightHand,shoulderCenter,spine){
        var pos=shoulderCenter.slerp(spine,0.3);    //获取对比的点
        var vectorLen=track.length-1;              //向量的个数
        //处理右手
        var result=dealDataCore("rightHand",pos);
        if(result&&result.invalid==0&&result.forward==vectorLen&&result.down==vectorLen){   //投掷
            if(track["rightHand"].status!="throw"){
                track.setStatus("rightHand","throw");
                clearTrace("rightHand",rightHand);
                clearTrace("leftHand",leftHand);
                ActionEvent.trigger("throwResult",rightHand);
                return false;
            }
        }else if(result&&(result.invalid==vectorLen||result.forward==(-1)*vectorLen)){  //回退
            track.setStatus("rightHand","back");
        }
        //处理左手
        result=dealDataCore("leftHand",pos);
        if(result&&result.invalid==0&&result.forward==vectorLen&&result.down==vectorLen){   //投掷
            if(track["leftHand"].status!="throw"){
                track.setStatus("leftHand","throw");
                clearTrace("leftHand",leftHand);
                ActionEvent.trigger("throwResult",leftHand);
            }
        }else if(result&&(result.invalid==vectorLen||result.forward==(-1)*vectorLen)){  //回退
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
            if(data.y<pos.y){   //低于颈部下方过多
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