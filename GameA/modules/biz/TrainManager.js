/**
 * Created by JetBrains WebStorm.
 * User: Administrator
 * Date: 12-2-22
 * Time: 上午10:43
 */
define(function (require, exports, module) {
    var root = this, state = false,getNode = false,
        log = require("core/Logger").getLog(),
        ResourceLoader = require("node/ResourceLoader"),
        Timer=require("core/Timer"),
        Config=require("../config/PictureConfig"),
        GameEvent=require("core/Event").getInstance("GameEvent"),
	    AudioEvent = require("core/Event").getInstance("AudioEvent");
    var picUI,pic_window1,pic_window2;     //UI节点对象
//    var showTexture,nextTexture;           //展现的贴图和后续的贴图
    var isSkip=false;   //是否跳过
    var timerId=-1;
	var initAlpha=1;  //透明度初始值

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
            picUI = SFNode.get("picUI");
            pic_window1 = SFNode.get("pic_window1");
            pic_window2 = SFNode.get("pic_window2");
            getNode = true;
        }
    }
    /*顺序播放游戏说明贴图*/
    exports.show=function(){
        if(state){
            var textureObj=Config.train;    //正确获取播放资源
            var isStartNext=false;
            var len=textureObj.texture.length;          //贴图的总数
            var count=len;                          //记录需要播放的贴图数
            /*初始化*/
            picUI.visible=true;       //显示演示
            picUI.alpha=initAlpha;           //设置透明度为1
            var showTexture=pic_window1;    //当前显示的GUIWindow节点对象
            var nextTexture=pic_window2;    //下一步显示的GUIWindow节点对象
            showTexture.properties[1]=textureObj.texture[0];
            nextTexture.properties[1]=textureObj.texture[1];
	        AudioEvent.trigger("sound","startLearn");
	        var audioCount = 0;
            timerId=Timer.bindFraction(textureObj.time+textureObj.aniTime,function(f){
                if (!isSkip) {
                    var time = (textureObj.time + textureObj.aniTime) * f;   //转换成时间
                    if (time >= textureObj.time) {  //开始移动(或播放其他动画)
                        if (count == 1) {   //最后一张贴图为渐隐消失
                            var alphaF = (textureObj.time + textureObj.aniTime - time) / textureObj.aniTime;
                            picUI.alpha = initAlpha*alphaF;
                            if (!isStartNext) {
                                GameEvent.trigger("gameState", "index");
                                isStartNext = true;
                            }
                        } else {  //其他贴图都为移动消失
                            var moveF = 1 - (textureObj.time + textureObj.aniTime - time) / textureObj.aniTime;
                            showTexture.position=new SFVec2f(-1*moveF,0);
                            nextTexture.position=new SFVec2f(1-moveF,0);
                        }
                    }
                }else{
                    GameEvent.trigger("gameState", "index");
                    picUI.visible=false;    //隐藏演示
                    picUI.alpha=initAlpha;           //设置透明度为1
                    Timer.clear(timerId);   //跳过游戏说名部分
                }
            },function(){
				audioCount++;
	            if(audioCount==1){
					AudioEvent.trigger("sound","learnGetAndThrow");
	            }else if(audioCount==3){
		            AudioEvent.trigger("sound","learnScore");
	            }
                if(count==1){
                    //no-do
                }else{  //移动的情况
                    var temp=showTexture;   //交换
                    showTexture=nextTexture;
                    nextTexture=temp;
                    nextTexture.position=new SFVec2f(1,0);  //调整第二章贴图的位置
                }
                var currentIndex=len-count;
                if(currentIndex==len-1){         //播放的为最后一张贴图
                    showTexture.properties[1]="set:UI image:color_blank";
                    nextTexture.properties[1]="set:UI image:color_blank";
                }else if(currentIndex==len-2){  //播放的是倒数第二章图
                    nextTexture.properties[1]="set:UI image:color_blank";
                }else{  //其他情况
                    nextTexture.properties[1]=textureObj.texture[currentIndex+2];
                }
                count--;                //需要播放的记录数自动减1
                if(count<=0){           //演示结束
                    picUI.visible=false;    //隐藏演示
                    picUI.alpha=initAlpha;           //设置透明度为1
                    Timer.clear(timerId);     //清空计时器
                    return false;
                }else{
                    return true;
                }
            });
        }
    };

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
            picUI.visible=false;    //隐藏演示
            picUI.alpha=initAlpha;           //设置透明度为1
            getNode = false;
            state = false;
        }
    };
});