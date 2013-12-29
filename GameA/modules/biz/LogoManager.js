/**
 * 进入游戏播放LOG.
 * User: yaoxx
 * Date: 12-3-3
 * Time: 上午10:42
 */
define(function (require, exports, module) {
    var root = this, state = false,
        log = require("core/Logger").getLog();
    var Timer=require("core/Timer"),
        ResourceLoader = require("node/ResourceLoader"),
        GameEvent=require("core/Event").getInstance("GameEvent");
    var isGain=false;   //是否获取了UI资源
    var logoUI;           //LOG的UI节点
    var resName="set:_file image:../LOGO/logo.jpg";   //LOG的资源
    var showTime=4,aniTime=1;        //播放LOG的事件

    exports.init = function (callback) {
        if (!state) {
            loadUI(callback);
            state = true;
        }
    };
    function loadUI(callback){
        ResourceLoader.load([
            {type:"ui", uri:"logo.cc6", depends:[{"set":"UI","code":7}]}
        ], function () {
            getNodes();
            callback&&callback();
        });
    }
    function getNodes(){
        if(!isGain){
            logoUI = SFNode.get("logo");
            logoUI.properties[1]=resName;
            isGain = true;
        }
    }

    /**
     * 显示LOG图片
     */
    exports.show=function(){
        var isStartNext=false;
        logoUI.visible=true; //显示LOG
        var timerId=Timer.bindFraction(showTime+aniTime,function(f){
            var radio=showTime/(showTime+aniTime);
            if(f<=radio){
                logoUI.alpha=1;
            }else{
                if(!isStartNext){
                    GameEvent.trigger("gameState","story");  //执行游戏流程的下一个状态
                    isStartNext=true;
                }
                var newF=(f-1)/(1-radio)+1;
                logoUI.alpha=1-newF;
            }
        },function(){   //完成后需要作的工作
            logoUI.visible=false;    //隐藏演示
            logoUI.alpha=1;           //设置透明度为1
            Timer.clear(timerId);     //清空计时器
//            GameEvent.trigger("gameState","plot");  //执行游戏流程的下一个状态
        });
    };

    exports.destroy = function () {
        if (state) {
            logoUI.visible=false;
            logoUI.alpha=1;
            isGain=false;
            state = false;
        }
    };
});