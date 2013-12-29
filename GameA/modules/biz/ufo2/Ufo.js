/**
 * Created with JetBrains WebStorm.
 * User: sunfg
 * Date: 13-2-27
 * Time: ����3:41
 * To change this template use File | Settings | File Templates.
 */
define(function(require,exports,module){
	var root=this,
		log=require("core/Logger").getLog(),
		camera=require("./Config").camera,
		Screen=require("./Screen");
	/**
	 * UFO���췽��
	 */
	function UFO(node,id,type,resType,configPath,worth,config){
		this.node=node;//�ڵ����
		this.id=id;      //�ڵ�����ڻ�����е�id
		this.type=type;
		this.resType=resType;
		this.configPath=configPath;
		this.state="fly"; //״̬����ʼĬ��Ϊ��fly��;
		this.worth=worth;   //��ֵ
		var start=getStart();
		this.start=new SFVec3f(start[0],start[1],start[2]);   //��������ʼ��
		this.target=new SFVec3f();  // �����Ŀ���
		this.config=config;
		this.curBlood = this.config.blood;
		this.node.translation.setValue(this.start);
		this.translation=this.node.translation;
		this.node.scale.setValue(1,1,1);
		this.dts=0;
	}

	/**
	 *����UFO��ʼ��
	 */
	function getStart(){
		var z=camera.far;
		var h=Screen.getLookHeight(camera.far)*0.2;
		var w=Screen.getLookWidth(camera.far)*0.2;
		var x=-w/8+Math.random()*w/4;
		var y=-h/6+Math.random()*h/3;
		return [x,y,z];
	}
	/**
	 * ��ȡUFOʵ��
	 * @param obj
	 * @param model
	 */
	exports.getInstance = function(obj,model){
		return new UFO(obj.node,obj.id,model.type,model.resType,model.configPath,model.worth,model.config);
	};
});
