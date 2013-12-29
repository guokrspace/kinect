/**
 * Created by JetBrains WebStorm.
 * User: Administrator
 * Date: 12-3-3
 * Time: 下午7:16
 */
define(function (require, exports, module) {
    var root = this, state = false,getNode = false,
        log = require("core/Logger").getLog(),
        ResourceLoader = require("node/ResourceLoader"),
        Timer=require("core/Timer"),
        Config=require("../config/PictureConfig"),
        GameEvent=require("core/Event").getInstance("GameEvent");

    var plotUI;     //UI节点对象
    var isSkip=false;   //是否跳过
    var timerId=-1;
	var initAlpha=1;

    function loadUI(callback){
        ResourceLoader.load([
            {type:"ui", uri:"picture.cc6", depends:[{"set":"UI","code":7}]}
        ], function () {
            getNodes();
            callback&&callback();
        });
    }
    function getNodes(){
        if(!getNode){
            plotUI = SFNode.get("plotUI");
            getNode = true;
        }
    }
    /*顺序播放游戏说明贴图*/
    exports.show=function(){
        if(state){
            var textureObj=Config.story;    //正确获取播放资源
            var isStartNext=false;
            var len=textureObj.texture.length;          //贴图的总数
            var count=len;                          //记录需要播放的贴图数
            /*初始化*/
            plotUI.properties[1]=textureObj.texture[0];
            plotUI.alpha=0;           //设置透明度为0
            plotUI.visible=true;       //显示演示
            timerId=Timer.bindFraction(textureObj.time+textureObj.aniTime,function(f){
                if (!isSkip) {
                    var time = (textureObj.time + textureObj.aniTime) * f;   //转换成时间
                    if(time<=textureObj.aniTime/2){    //渐现
                        var alpha_show=getLineValue(f,[0,(textureObj.aniTime/2)/(textureObj.time+textureObj.aniTime)],[0,1]);
                        plotUI.alpha=initAlpha*alpha_show;
                    }else if(time>=textureObj.time + textureObj.aniTime-textureObj.aniTime/2){    //渐隐
                        var alpha_hide=getLineValue(f,[(textureObj.time + textureObj.aniTime/2)/(textureObj.time+textureObj.aniTime),1],[1,0]);
                        plotUI.alpha=initAlpha*alpha_hide;
                        if(count==1&&alpha_hide==0){
                            if (!isStartNext) {
                                GameEvent.trigger("gameState", "train");
                                isStartNext = true;
                            }
                        }
                    }
                }else{
                    GameEvent.trigger("gameState", "train");
                    plotUI.visible=false;    //隐藏演示
                    plotUI.alpha=initAlpha;           //设置透明度为0.8
                    Timer.clear(timerId);   //跳过游戏说名部分
                }
            },function(){
                var currentIndex=len-count;
                plotUI.properties[1]=textureObj.texture[currentIndex+1];
                count--;                //需要播放的记录数自动减1
                if(count<=0){           //演示结束
                    plotUI.visible=false;    //隐藏演示
                    plotUI.alpha=initAlpha;           //设置透明度为1
                    Timer.clear(timerId);     //清空计时器
                    return false;
                }else{
                    return true;
                }
            });
        }
    };
    /**
     * 通过源值，源的变化范围，目标值的变化范围求出目标值
     * @param source:已知的源值
     * @param sRange:源的变化范围
     * @param tRange:目标的变化范围
     * 注意：保持sRange和tRange的长度相同，否则将取长度最小的为
     * 比较的范围的长度。sRange的数值必须呈递增趋势
     */
    function getLineValue(source,sRange,tRange){
        var minLen=Math.min(sRange.length,tRange.length);
        for(var i=0;i<minLen-1;i++){
            if(source>=sRange[i]&&source<=sRange[i+1]){ //原值是从sRange[i]变到sRange[i+1]
                //目标值就是从tRange[i]变到tRange[i+]
                return (source-sRange[i+1])*(tRange[i+1]-tRange[i])/(sRange[i+1]-sRange[i])+tRange[i+1];
            }
        }
        if(source<sRange[0]){
            return tRange[0];
        }else if(source>sRange[minLen-1]){
            return tRange[minLen-1]
        }else{
            return null;
        }
    }

    //跳过游戏说明部分
    exports.skip = function(){
	    if(!isSkip){
		    isSkip=true;
	    }
    };
    exports.init = function (callback) {
        if (!state) {
            state = true;
            loadUI(callback);
            isSkip=false;
        }
    };

    exports.destroy = function () {
        if (state) {
            plotUI.visible=false;    //隐藏演示
            plotUI.alpha=initAlpha;           //设置透明度为1
            getNode = false;
            state = false;
        }
    };
});