/**
 * Created with JetBrains WebStorm.
 * User: sunfg
 * Date: 13-2-27
 * Time: 下午3:41
 * To change this template use File | Settings | File Templates.
 */
define(function(require,exports,module){
	var root=this,
		log=require("core/Logger").getLog(),
		camera=require("./Config").camera,
		Screen=require("./Screen");
	/**
	 * UFO构造方法
	 */
	function UFO(node,id,type,resType,configPath,worth,config){
		this.node=node;//节点对象
		this.id=id;      //节点对象在缓冲池中的id
		this.type=type;
		this.resType=resType;
		this.configPath=configPath;
		this.state="fly"; //状态，初始默认为“fly”;
		this.worth=worth;   //价值
		var start=getStart();
		this.start=new SFVec3f(start[0],start[1],start[2]);   //外星人起始点
		this.target=new SFVec3f();  // 飞向的目标点
		this.config=config;
		this.curBlood = this.config.blood;
		this.node.translation.setValue(this.start);
		this.translation=this.node.translation;
		this.node.scale.setValue(1,1,1);
		this.dts=0;
	}

	/**
	 *计算UFO起始点
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
	 * 获取UFO实例
	 * @param obj
	 * @param model
	 */
	exports.getInstance = function(obj,model){
		return new UFO(obj.node,obj.id,model.type,model.resType,model.configPath,model.worth,model.config);
	};
});
