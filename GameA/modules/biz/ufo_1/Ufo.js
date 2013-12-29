/**
 * Created by JetBrains WebStorm.
 * User: sungf
 * Date: 13-1-21
 * Time: 下午8:30
 * To change this template use File | Settings | File Templates.
 */
define(function(require,exports,module){
    var root=this,
        log=require("core/Logger").getLog(),
        Config=require("./Config");
    /**
     * UFO构造方法
     */
    function UFO(node,id,type,resType,configPath,worth,startSpeed,hitSpeed,config){
        this.node=node;//节点对象
        this.id=id;      //节点对象在缓冲池中的id
        this.type=type;
        this.resType=resType;
        this.configPath=configPath;
        this.state="fly"; //状态，有“fly”和“faint”，"deading"三种，默认为“fly”;
        this.worth=worth;   //价值
        this.startSpeed=startSpeed;   //飞行起始速度
        this.flySpeed=startSpeed;   //飞行过程速度
        var start=getStart();
        this.start=new SFVec3f(start[0],start[1],start[2]);   //外星人起始点
        this.target=new SFVec3f();  // 飞向的目标点
        this.config=config;
        this.curBlood = this.config.blood;
        this.node.translation.setValue(this.start);
        this.node.scale.setValue(1,1,1);
	    this.selectState = "free";
    }
    /**
     * 相机可视平面高
     * @param nearOrFar 近平面或远平面Z
     */
    exports.getLookHeight=function(nearOrFar){
        return (Config.camera.position[2]-nearOrFar)*Math.tan(0.15)*2;
    };
    /**
     * 相机可视平面宽
     */
    exports.getLookWidth=function(nearOrFar){
        return exports.getLookHeight(nearOrFar)*16/9;
    };
    /**
     *计算UFO起始点
     */
    function getStart(){
        var z=Config.camera.far;
        var h=exports.getLookHeight(Config.camera.far)*0.2;
        var w=exports.getLookWidth(Config.camera.far)*0.2;
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
        return new UFO(obj.node,obj.id,model.type,model.resType,model.configPath,model.worth,model.startSpeed,model.hitSpeed,model.config);
    };
});
