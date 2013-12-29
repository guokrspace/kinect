/**
 * Created by JetBrains WebStorm.
 * User: Administrator
 * Date: 12-2-22
 * Time: ����10:43
 */
define(function (require, exports, module) {
    var root = this, state = false,getNode = false,
        log = require("core/Logger").getLog(),
        ResourceLoader = require("node/ResourceLoader"),
        Timer=require("core/Timer"),
        Config=require("../config/PictureConfig"),
        GameEvent=require("core/Event").getInstance("GameEvent"),
	    AudioEvent = require("core/Event").getInstance("AudioEvent");
    var picUI,pic_window1,pic_window2;     //UI�ڵ����
//    var showTexture,nextTexture;           //չ�ֵ���ͼ�ͺ�������ͼ
    var isSkip=false;   //�Ƿ�����
    var timerId=-1;
	var initAlpha=1;  //͸���ȳ�ʼֵ

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
    /*˳�򲥷���Ϸ˵����ͼ*/
    exports.show=function(){
        if(state){
            var textureObj=Config.train;    //��ȷ��ȡ������Դ
            var isStartNext=false;
            var len=textureObj.texture.length;          //��ͼ������
            var count=len;                          //��¼��Ҫ���ŵ���ͼ��
            /*��ʼ��*/
            picUI.visible=true;       //��ʾ��ʾ
            picUI.alpha=initAlpha;           //����͸����Ϊ1
            var showTexture=pic_window1;    //��ǰ��ʾ��GUIWindow�ڵ����
            var nextTexture=pic_window2;    //��һ����ʾ��GUIWindow�ڵ����
            showTexture.properties[1]=textureObj.texture[0];
            nextTexture.properties[1]=textureObj.texture[1];
	        AudioEvent.trigger("sound","startLearn");
	        var audioCount = 0;
            timerId=Timer.bindFraction(textureObj.time+textureObj.aniTime,function(f){
                if (!isSkip) {
                    var time = (textureObj.time + textureObj.aniTime) * f;   //ת����ʱ��
                    if (time >= textureObj.time) {  //��ʼ�ƶ�(�򲥷���������)
                        if (count == 1) {   //���һ����ͼΪ������ʧ
                            var alphaF = (textureObj.time + textureObj.aniTime - time) / textureObj.aniTime;
                            picUI.alpha = initAlpha*alphaF;
                            if (!isStartNext) {
                                GameEvent.trigger("gameState", "index");
                                isStartNext = true;
                            }
                        } else {  //������ͼ��Ϊ�ƶ���ʧ
                            var moveF = 1 - (textureObj.time + textureObj.aniTime - time) / textureObj.aniTime;
                            showTexture.position=new SFVec2f(-1*moveF,0);
                            nextTexture.position=new SFVec2f(1-moveF,0);
                        }
                    }
                }else{
                    GameEvent.trigger("gameState", "index");
                    picUI.visible=false;    //������ʾ
                    picUI.alpha=initAlpha;           //����͸����Ϊ1
                    Timer.clear(timerId);   //������Ϸ˵������
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
                }else{  //�ƶ������
                    var temp=showTexture;   //����
                    showTexture=nextTexture;
                    nextTexture=temp;
                    nextTexture.position=new SFVec2f(1,0);  //�����ڶ�����ͼ��λ��
                }
                var currentIndex=len-count;
                if(currentIndex==len-1){         //���ŵ�Ϊ���һ����ͼ
                    showTexture.properties[1]="set:UI image:color_blank";
                    nextTexture.properties[1]="set:UI image:color_blank";
                }else if(currentIndex==len-2){  //���ŵ��ǵ����ڶ���ͼ
                    nextTexture.properties[1]="set:UI image:color_blank";
                }else{  //�������
                    nextTexture.properties[1]=textureObj.texture[currentIndex+2];
                }
                count--;                //��Ҫ���ŵļ�¼���Զ���1
                if(count<=0){           //��ʾ����
                    picUI.visible=false;    //������ʾ
                    picUI.alpha=initAlpha;           //����͸����Ϊ1
                    Timer.clear(timerId);     //��ռ�ʱ��
                    return false;
                }else{
                    return true;
                }
            });
        }
    };

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
            picUI.visible=false;    //������ʾ
            picUI.alpha=initAlpha;           //����͸����Ϊ1
            getNode = false;
            state = false;
        }
    };
});