/**
 * �����ռ���������
 * User: Administrator
 * Date: 12-3-1
 * Time: ����3:43
 */
define(function (require, exports, module) {
    var root = this, state = false,
        log = require("core/Logger").getLog(),
        MSEvent = require("core/Event").getInstance("MSEvent"),
        GameEvent =require("core/Event").getInstance("GameEvent");
    var isCollect,pause;      //�Ƿ��ռ���������
    var datas=[];          //����Ĺ�������
    exports.init = function () {
        if (!state) {
            isCollect=false;    //��ֹ�ռ���������
            bindEvents(true);
            state = true;
        }
    };
    /**
     * @param v:�Ƿ���ͣ�ռ�����
     */
    exports.pause=function(v){
        if(!v){
        }else{
        }
        pause=v;
    };
    /**
     * ��ȡ��������(���ڱ��浽�ļ���)
     */
    exports.getSkeData=function(){
        if(isCollect&&pause){ //ֻ����û���ռ���������ʱ���ſ��Ի�ȡ��������
            return datas;
        }
    };
    function bindEvents(v){
        if(v){
            MSEvent.bind("rawData",collectData);
            GameEvent.bind("enableCollect",enableCollect);
        }else{
            MSEvent.unbind("rawData",collectData);
            GameEvent.unbind("enableCollect",enableCollect);
        }
    }
    /**
     * �ռ��������ݵ�ʹ�ܷ���
     * @param isCollect:�ж��Ƿ�����ռ��������ݣ�true��ʾ�����ռ����������ˡ�
     */
    function enableCollect(enable){
        isCollect=enable;
        pause=false;
    };
    /**
     * �ռ���������
     * @param data
     */
    function collectData(data){
        if(isCollect&&!pause){  //��ʼ�ռ�
            datas.push(data);
        }
    }

    exports.destroy = function () {
        if (state) {
            isCollect=false;    //��ֹ�ռ���������
            bindEvents(false);
            state = false;
        }
    };
});