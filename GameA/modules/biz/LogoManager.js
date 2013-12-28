/**
 * ������Ϸ����LOG.
 * User: yaoxx
 * Date: 12-3-3
 * Time: ����10:42
 */
define(function (require, exports, module) {
    var root = this, state = false,
        log = require("core/Logger").getLog();
    var Timer=require("core/Timer"),
        ResourceLoader = require("node/ResourceLoader"),
        GameEvent=require("core/Event").getInstance("GameEvent");
    var isGain=false;   //�Ƿ��ȡ��UI��Դ
    var logoUI;           //LOG��UI�ڵ�
    var resName="set:_file image:../LOGO/logo.jpg";   //LOG����Դ
    var showTime=4,aniTime=1;        //����LOG���¼�

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
     * ��ʾLOGͼƬ
     */
    exports.show=function(){
        var isStartNext=false;
        logoUI.visible=true; //��ʾLOG
        var timerId=Timer.bindFraction(showTime+aniTime,function(f){
            var radio=showTime/(showTime+aniTime);
            if(f<=radio){
                logoUI.alpha=1;
            }else{
                if(!isStartNext){
                    GameEvent.trigger("gameState","story");  //ִ����Ϸ���̵���һ��״̬
                    isStartNext=true;
                }
                var newF=(f-1)/(1-radio)+1;
                logoUI.alpha=1-newF;
            }
        },function(){   //��ɺ���Ҫ���Ĺ���
            logoUI.visible=false;    //������ʾ
            logoUI.alpha=1;           //����͸����Ϊ1
            Timer.clear(timerId);     //��ռ�ʱ��
//            GameEvent.trigger("gameState","plot");  //ִ����Ϸ���̵���һ��״̬
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