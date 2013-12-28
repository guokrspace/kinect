/**
 * Created by CyberClassics.
 * User: Songbinbing
 * Date: 12-8-20
 * Time: 上午11:16
 */
define(function (require, exports, module) {
	var LOG = require("core/Logger").getLog(),
    	state = false,
        Fruit = require("./fruit/Logic");
    /**
     * 模块初始化方法
     */
    exports.init = function () {
        if (!state) {
            state = true;

			//加载应用场景
            require("node/ResourceLoader").render({
                "loadList":[{"type":"scene","uri":RS.scenes.TestScene}]
            },function(){
                Fruit.init();
            },true);

			//加载自定义原型并增加到场景中
//            var p = require("node/ProtoLoader").load(RS.protos.MyNode);
//            var node = new SFNode(p+"{}");
            CAMERA.position.setValue(0,3,20);
//            ROOTSCENE.addChild(node);
        }
    };

    /**
     * 模块销毁方法
     */
    exports.destory = function () {
        if (state) {
            state = false;
        }
    };
});