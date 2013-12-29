/**
 * Created by CyberClassics.
 * User: Songbinbing
 * Date: 12-8-20
 * Time: ����11:16
 */
define(function (require, exports, module) {
	var LOG = require("core/Logger").getLog(),
    	state = false,
        Fruit = require("./fruit/Logic");
    /**
     * ģ���ʼ������
     */
    exports.init = function () {
        if (!state) {
            state = true;

			//����Ӧ�ó���
            require("node/ResourceLoader").render({
                "loadList":[{"type":"scene","uri":RS.scenes.TestScene}]
            },function(){
                Fruit.init();
            },true);

			//�����Զ���ԭ�Ͳ����ӵ�������
//            var p = require("node/ProtoLoader").load(RS.protos.MyNode);
//            var node = new SFNode(p+"{}");
            CAMERA.position.setValue(0,3,20);
//            ROOTSCENE.addChild(node);
        }
    };

    /**
     * ģ�����ٷ���
     */
    exports.destory = function () {
        if (state) {
            state = false;
        }
    };
});