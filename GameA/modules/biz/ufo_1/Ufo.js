/**
 * Created by JetBrains WebStorm.
 * User: sungf
 * Date: 13-1-21
 * Time: ����8:30
 * To change this template use File | Settings | File Templates.
 */
define(function(require,exports,module){
    var root=this,
        log=require("core/Logger").getLog(),
        Config=require("./Config");
    /**
     * UFO���췽��
     */
    function UFO(node,id,type,resType,configPath,worth,startSpeed,hitSpeed,config){
        this.node=node;//�ڵ����
        this.id=id;      //�ڵ�����ڻ�����е�id
        this.type=type;
        this.resType=resType;
        this.configPath=configPath;
        this.state="fly"; //״̬���С�fly���͡�faint����"deading"���֣�Ĭ��Ϊ��fly��;
        this.worth=worth;   //��ֵ
        this.startSpeed=startSpeed;   //������ʼ�ٶ�
        this.flySpeed=startSpeed;   //���й����ٶ�
        var start=getStart();
        this.start=new SFVec3f(start[0],start[1],start[2]);   //��������ʼ��
        this.target=new SFVec3f();  // �����Ŀ���
        this.config=config;
        this.curBlood = this.config.blood;
        this.node.translation.setValue(this.start);
        this.node.scale.setValue(1,1,1);
	    this.selectState = "free";
    }
    /**
     * �������ƽ���
     * @param nearOrFar ��ƽ���Զƽ��Z
     */
    exports.getLookHeight=function(nearOrFar){
        return (Config.camera.position[2]-nearOrFar)*Math.tan(0.15)*2;
    };
    /**
     * �������ƽ���
     */
    exports.getLookWidth=function(nearOrFar){
        return exports.getLookHeight(nearOrFar)*16/9;
    };
    /**
     *����UFO��ʼ��
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
     * ��ȡUFOʵ��
     * @param obj
     * @param model
     */
    exports.getInstance = function(obj,model){
        return new UFO(obj.node,obj.id,model.type,model.resType,model.configPath,model.worth,model.startSpeed,model.hitSpeed,model.config);
    };
});
