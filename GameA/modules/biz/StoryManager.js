/**
 * Created by JetBrains WebStorm.
 * User: Administrator
 * Date: 12-3-3
 * Time: ����7:16
 */
define(function (require, exports, module) {
    var root = this, state = false,getNode = false,
        log = require("core/Logger").getLog(),
        ResourceLoader = require("node/ResourceLoader"),
        Timer=require("core/Timer"),
        Config=require("../config/PictureConfig"),
        GameEvent=require("core/Event").getInstance("GameEvent");

    var plotUI;     //UI�ڵ����
    var isSkip=false;   //�Ƿ�����
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
    /*˳�򲥷���Ϸ˵����ͼ*/
    exports.show=function(){
        if(state){
            var textureObj=Config.story;    //��ȷ��ȡ������Դ
            var isStartNext=false;
            var len=textureObj.texture.length;          //��ͼ������
            var count=len;                          //��¼��Ҫ���ŵ���ͼ��
            /*��ʼ��*/
            plotUI.properties[1]=textureObj.texture[0];
            plotUI.alpha=0;           //����͸����Ϊ0
            plotUI.visible=true;       //��ʾ��ʾ
            timerId=Timer.bindFraction(textureObj.time+textureObj.aniTime,function(f){
                if (!isSkip) {
                    var time = (textureObj.time + textureObj.aniTime) * f;   //ת����ʱ��
                    if(time<=textureObj.aniTime/2){    //����
                        var alpha_show=getLineValue(f,[0,(textureObj.aniTime/2)/(textureObj.time+textureObj.aniTime)],[0,1]);
                        plotUI.alpha=initAlpha*alpha_show;
                    }else if(time>=textureObj.time + textureObj.aniTime-textureObj.aniTime/2){    //����
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
                    plotUI.visible=false;    //������ʾ
                    plotUI.alpha=initAlpha;           //����͸����Ϊ0.8
                    Timer.clear(timerId);   //������Ϸ˵������
                }
            },function(){
                var currentIndex=len-count;
                plotUI.properties[1]=textureObj.texture[currentIndex+1];
                count--;                //��Ҫ���ŵļ�¼���Զ���1
                if(count<=0){           //��ʾ����
                    plotUI.visible=false;    //������ʾ
                    plotUI.alpha=initAlpha;           //����͸����Ϊ1
                    Timer.clear(timerId);     //��ռ�ʱ��
                    return false;
                }else{
                    return true;
                }
            });
        }
    };
    /**
     * ͨ��Դֵ��Դ�ı仯��Χ��Ŀ��ֵ�ı仯��Χ���Ŀ��ֵ
     * @param source:��֪��Դֵ
     * @param sRange:Դ�ı仯��Χ
     * @param tRange:Ŀ��ı仯��Χ
     * ע�⣺����sRange��tRange�ĳ�����ͬ������ȡ������С��Ϊ
     * �Ƚϵķ�Χ�ĳ��ȡ�sRange����ֵ����ʵ�������
     */
    function getLineValue(source,sRange,tRange){
        var minLen=Math.min(sRange.length,tRange.length);
        for(var i=0;i<minLen-1;i++){
            if(source>=sRange[i]&&source<=sRange[i+1]){ //ԭֵ�Ǵ�sRange[i]�䵽sRange[i+1]
                //Ŀ��ֵ���Ǵ�tRange[i]�䵽tRange[i+]
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

    //������Ϸ˵������
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
            plotUI.visible=false;    //������ʾ
            plotUI.alpha=initAlpha;           //����͸����Ϊ1
            getNode = false;
            state = false;
        }
    };
});