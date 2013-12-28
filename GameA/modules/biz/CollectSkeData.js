/**
 * 用于收集骨骼数据
 * User: Administrator
 * Date: 12-3-1
 * Time: 下午3:43
 */
define(function (require, exports, module) {
    var root = this, state = false,
        log = require("core/Logger").getLog(),
        MSEvent = require("core/Event").getInstance("MSEvent"),
        GameEvent =require("core/Event").getInstance("GameEvent");
    var isCollect,pause;      //是否收集骨骼数据
    var datas=[];          //保存的骨骼数据
    exports.init = function () {
        if (!state) {
            isCollect=false;    //禁止收集骨骼数据
            bindEvents(true);
            state = true;
        }
    };
    /**
     * @param v:是否暂停收集数据
     */
    exports.pause=function(v){
        if(!v){
        }else{
        }
        pause=v;
    };
    /**
     * 获取骨骼数据(用于保存到文件中)
     */
    exports.getSkeData=function(){
        if(isCollect&&pause){ //只能在没有收集骨骼数据时，才可以获取骨骼数据
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
     * 收集骨骼数据的使能方法
     * @param isCollect:判断是否可以收集骨骼数据，true表示可以收集骨骼数据了。
     */
    function enableCollect(enable){
        isCollect=enable;
        pause=false;
    };
    /**
     * 收集骨骼数据
     * @param data
     */
    function collectData(data){
        if(isCollect&&!pause){  //开始收集
            datas.push(data);
        }
    }

    exports.destroy = function () {
        if (state) {
            isCollect=false;    //禁止收集骨骼数据
            bindEvents(false);
            state = false;
        }
    };
});