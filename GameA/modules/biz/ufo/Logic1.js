/**
 * Created by JetBrains WebStorm.
 * User: sungf
 * Date: 13-1-29
 * Time: ����2:48
 * To change this template use File | Settings | File Templates.
 */
define(function(require,exports,module){
	var root=this,state=false,isPause=false,
		log=require("core/Logger").getLog(),
		TimerEvent = require("core/Event").getInstance("Timer"),
		UFO=require("./Ufo"),
		ProtoLoader = require("node/ProtoLoader"),
		ModelPool=require("node/NodeCachePool"),
		BonePool = require("node/BoneCachePool"),
		Config=require("./Config"),
		camera=Config.camera,
		selection=Config.select,
		global=Config.global,
		ufos=Config.ufos,
		MyGroup,Group,aimNode,starNode,
		canSelect = false,select,UFOMap = {},toRemove = [],
		lastCreateTime,aimLastTime,lastPauseTime,flagPause,
		MODEL= 1,BONE=2;

	function timer(t,dt){
		if(state){
			if(!isPause){
				processUFOState(dt);
				processAim(t);
				processUFOCreate(t);
			}
			pause(t);
		}
	};
	/**
	 * �������������ɵ�UFO��״̬
	 * @param dt
	 */
	function processUFOState(dt){
		var curUFO;
		for(var ufoK in UFOMap){
			curUFO = UFOMap[ufoK];
			switch(curUFO.state){
				case "fly":             //��
					flyState(curUFO,dt);
					break;
				case "faint":           //��
					faintState(curUFO,dt);
					break;
				case "deading":        //��������
					deadingState(curUFO,dt);
					break;
				case "free":           //����,��������Ϊ����״̬
					break;
			}
		}

		//ɾ��������Դ����������ɾ��
		toRemove.forEach(function(key){
			//����Ⱦ����ɾ��
			if(UFOMap[key]){
				MyGroup.removeChild(UFOMap[key].node);
				//�ӳ���ɾ��
				if(UFOMap[key].resType==MODEL){
					ModelPool.remove(key);
				}else if(UFOMap[key].resType==BONE){
					BonePool.remove(key);
				}
			}
			//�ӱ�����������ɾ��
			delete UFOMap[key];
		});
		if(toRemove.length>0){toRemove = [];}
	};

	/**
	 * ���ڷ���״̬��UFO�߼�����
	 * @param dt
	 */
	function flyState(instance,dt){
		if(instance.isHit){
			if(instance.curBlood>0){
				instance.state = "faint";
				if(instance.resType==BONE){
					boneAnimation(instance.node.children[0].children[1],require(instance.configPath).animation.faint.name);
				}
			}else{
				instance.state = "deading";
				isDeading(instance);
			}
			instance.isHit = false;
		}
		//����λ��
		positionCalculate(instance,dt);
		//�ɳ���Ļ
		ifIsOutScreen(instance);
	}

	/**
	 * ����ѣ��״̬��UFO�߼�����
	 * @param instance
	 * @param dt
	 */
	function faintState(instance,dt){
		if(instance.isHit){
			instance.state = "deading";
			isDeading(instance);
			instance.isHit = false;
		}
		positionCalculate(instance,dt);
		//�ɳ���Ļ
		ifIsOutScreen(instance);
	};

	/**
	 * ������������״̬��UFO�߼�����
	 * @param instance
	 * @param dt
	 */
	function deadingState(instance,dt){
		if(instance.resType==MODEL){
			if(!instance.deadingFun){
				var vec = instance.target.subtract(instance.start);
				var st = Date.now();
				var flag=true;
				var durt;
				var value;
				instance.deadingFun = function(t){
					durt=t-st;
					if(durt<=1){//ģ�Ͷ���������������̣�
						instance.node.translation.setValue(instance.start.add(vec.multiply(durt)));
						value=1.01 - durt;
						instance.node.scale.setValue(value, value, value);
						instance.node.children[0].transparency = durt;
					}else if(durt>1.005&&durt<=1.5){
						if(flag){
							flag=false;
							instance.state = "free";
							toRemove.push(instance.id);
							starNode.translation=instance.node.translation;
						}
						if(starNode.children[0].whichChoice ===-1){
							starNode.children[0].whichChoice=-3;
						}
						value=2*(durt-1);
						starNode.scale.setValue(value,value,value);
					}else if(durt<2){
						value=1.01-(durt-1.5)*2;
						starNode.scale.setValue(value,value,value);
					}else {
						if(starNode.children[0].whichChoice ===-3){
							starNode.children[0].whichChoice=-1;
						}
						TimerEvent.unbind("time",instance.deadingFun);
					}
				};
				TimerEvent.bind("time",instance.deadingFun);
			}
		}else if(instance.resType==BONE){
			if(!instance.deadingFun){
				var st = Date.now();
				var durt;
				instance.deadingFun = function (t) {
					durt = t - st;
					if (durt >= 0.8) {
						instance.state = "free";
						toRemove.push(instance.id);
						//.......
						TimerEvent.unbind("time", instance.deadingFun);
					}
				}
				TimerEvent.bind("time", instance.deadingFun);
			}
		}
	};
	/**
	 * ��������
	 * @param instance UFO����ʵ��
	 */
	function isDeading(instance){
		if(instance.resType==MODEL){//ģ�ͷɴ�����������������ʼ���Ŀ���
			instance.start.setValue(instance.node.translation);
			instance.target.setValue(setNewTarget(instance));
		}else{//�������������󲥷Ŷ���
			boneAnimation(instance.node.children[0].children[1],require(instance.configPath).animation.dead.name);
		}
	};
	/**
	 * �������˳����Ժ�
	 * @param instance UFO����ʵ��
	 */
	function ifIsOutScreen(instance){
		if(instance.node.translation.z>camera.near){
			instance.state = "free";
			toRemove.push(instance.id);
		}
	};
	/**
	 * �����˷���ʱ��λ�ü��㴦��
	 *      1.��ʱ������������״̬���������֣�fly��faint
	 *      2.�ٶȴ���Ϊ����˥��״̬�����㷽ʽ���£�
	 *          ��ǰ�ٶ�=����ǰλ��-Ŀ���λ��).length() / (��ʼ��λ��-Ŀ���λ��).length()*��ʼ�ٶ�
	 * @param instance UFO����ʵ��
	 * @param dt ʱ��Ƭ
	 */
	function positionCalculate(instance,dt){
		//����λ��
		var vec = instance.target.subtract(instance.start);
		instance.node.translation.setValue(instance.node.translation.add(vec.normalize().multiply(instance.flySpeed+0.2).multiply(dt)));
		instance.flySpeed=instance.node.translation.subtract(instance.target).length()/vec.length()*instance.startSpeed;
	};
	/**
	 * ������������
	 * @param boneInstance ����ʵ��
	 * @param actionName    ��������
	 */
	function boneAnimation(boneInstance,actionName){
//        boneInstance.animClear=new MFString(boneInstance.animCycle[0],'0.3');
		boneInstance.animation=new MFString(actionName,'0.1','0.1');
	};
	/**
	 * ����׼�ǽڵ�
	 */
	function createAim(){
		var nodeName = ProtoLoader.load(RS.protos.Aim);
		//����ʱ�����Զ��ײ�group
		aimNode = new SFNode("Switch { choice [ Transform { children ["+nodeName+"{aimState -3} ] }] whichChoice -1 }").children[0];
		MyGroup.addChild(aimNode);
	};
	function createStar(){
		var url="\"resources/images/star/star2.png\" ";
		var str="Transform{ "+
			" children [ "+
			"  Switch {"+
			"  choice ["+
			"    ImageTexture{url "+url+"}"+
			" IndexedFaceSet {"+
			"     coord Coordinate {"+
			"         point ["+
			"               -.9  -.8999  0,"+
			"               .9  -.8999  0,"+
			"                .9  .8999  0,"+
			"                -.9  .8999  0]"+
			"       }"+
			"        coordIndex [0 1 2 3]"+
			"    }"+
			" ]whichChoice -1"+
			" }] }";
		starNode=new SFNode(str);
		starNode.scale.setValue(starNode.scale.multiply(0.01));
		MyGroup.addChild(starNode);
	}

	/**
	 * ���ݵ�ǰʱ����ʾ������׼��
	 *  ׼����ӵ��ĸ�UFO�ϵļ������̣�
	 *      1.ѡ����ӷ�Χ�ڵĶ������listSelect����
	 *      2.���������length!=0,�Ը�������дӴ�С������
	 *      3.Ȼ����listSelect���ѡ��ѡ���㷨Ϊ
	 *          var n=Math.floor(Math.random()*(Math.min(len,Config.select.selectNum)))��
	 *          select = listSelect[n];
	 * @param t
	 */
	function processAim(t){
		if(!aimLastTime||t-aimLastTime>selection.selectCycle){
//	        if(!aimLastTime)aimLastTime = Date.now();
			if(canSelect){
				selectFun();
			}
			aimLastTime = t;
		}
		if(select){//׼�ǵ�λ������
			aimNode.choice[0].translation.setValue(select.node.translation);
		}
	};
	function selectFun(){
		var listSelect = [];
		var len;
		for(var key in UFOMap){
			var ufo=UFOMap[key];
			var ufoZ=ufo.node.translation.z;
			if((ufo.state=="fly"||ufo.state=="faint")&&ufoZ<selection.selectLimit[0]&&ufoZ>selection.selectLimit[1]){
				listSelect.push(ufo);
			}
		}
		len=listSelect.length;
		if(len!=0){
			listSelect.sort(function(a,b){
				return b.node.translation.z-a.node.translation.z;
			});
			var n=Math.floor(Math.random()*(Math.min(len,selection.selectNum)));
			select = listSelect[n];
			changeAimTarget(select);
		}
	}
	/**
	 * ΪUFO���׼��
	 * @param select ��ѡ�е�UFO����
	 */
	function changeAimTarget(select){
		if(select.state=="fly"||select.state=="faint"){
			//1.׼��λ�úʹ�С����
			aimNode.choice[0].children[0].translation.setValue(select.config.translation);
			aimNode.choice[0].children[0].scale.setValue(select.config.scale);
			//2.Ѫ������
			aimNode.choice[0].children[0].life1State=0;
			if(select.config.blood==2){
				aimNode.choice[0].children[0].life=-3;
				if(select.curBlood==1){
					aimNode.choice[0].children[0].life2State=1;
				}else if(select.curBlood==2){
					aimNode.choice[0].children[0].life2State=0;
				}
			}else if(select.config.blood==1){
				aimNode.choice[0].children[0].life=0;
			}
			if(aimNode.whichChoice==-1){
				aimNode.whichChoice=-3;
			}
		}
	};

	/**
	 * ���ݵ�ǰʱ�䣬����UFO
	 * @param t
	 */
	function processUFOCreate(t,force){
		if(force||!lastCreateTime||t-lastCreateTime>global.targetCycle){
			var r = Math.floor(Math.random()*ufos.length);
			switch(ufos[r].resType){
				case MODEL:
					createModelUFO(ufos[r]);
					break;
				case BONE:
					createBoneUFO(ufos[r]);
					break;
			}
			lastCreateTime = t;
		}
	};

	function bindTimer(v){
		if(v){
			TimerEvent.bind("time",timer);
		}else{
			TimerEvent.unbind("time",timer);
		}
	};

	/**
	 * ��������UFO
	 */
	function createBoneUFO(config){
		var obj = BonePool.create(config.lyxName,config.template);
		createUFO(obj,config);
	};

	/**
	 * ����ģ��UFO
	 */
	function createModelUFO(config){
		var obj=ModelPool.create(config.lyxName,config.template,global.modelBasePath);
		createUFO(obj,config);
	};

	/**
	 * ����UFO���󣬼��뵽���϶���UFOMap�У������뵽GROUP����
	 * @param obj
	 * @param config
	 */
	function createUFO(obj,config){
		var ufo = UFO.getInstance(obj,config);
		UFOMap[obj.id] = ufo;
//		log.info("ufo.node="+ufo.node);

		MyGroup.addChild(obj.node);
	};

	/**
	 * ��������Ŀ��
	 *  ��Ŀ��������̣�
	 *      ��.���ɴ������������÷ɴ���������
	 *         ���ɴ�������ұ����÷ɴ���������
	 * @param instance UFO����
	 */
	function setNewTarget(instance){
		var x, z, y,
			lookWidth=UFO.getLookWidth(instance.node.translation.z),
			nearHeight=UFO.getLookHeight(camera.near);
		if(instance.node.translation.x<camera.position[0]){
			x=-lookWidth*1/5;
		}else{
			x=lookWidth*1/5;
		}
		if(Math.abs(x-instance.node.translation.x)<1){
			z=instance.node.translation.z-5;
		}else{
			z=instance.node.translation.z;
		}
		if(nearHeight-instance.node.translation.y<0.9){
			y=instance.node.translation.y-1;
		}else if(nearHeight-instance.node.translation.y<1.3){
			y=instance.node.translation.y-0.5;
		}else{
			y=instance.node.translation.y
		}
		return new SFVec3f(x,y,z);
	};
	function pause(t){
		if(flagPause){
			if(!lastPauseTime){lastPauseTime=Date.now();}
			var durt=t-lastPauseTime;
				if(isPause){
					if(durt<=1){
						Group.children[0].transparency=durt;
					}else{
						Group.children[0].transparency=1;
						flagPause=false;
						lastPauseTime=null;
					}
				}else{
					if(durt<=1){
						Group.children[0].transparency=1-durt;
					}else{
						Group.children[0].transparency=0;
						flagPause=false;
						lastPauseTime=null;
				}
			}
		}
	}
	/**
	 *��ͣ�ӿڣ���vΪtrueʱ��ͣ
	 * @param v bool
	 */
	exports.pauseUFO = function(v){
		if(v){
			isPause=true;
		}else{
			isPause=false;
		}
		flagPause=true;
	};
	/**
	 * ��ʼѡ����Ŀ��
	 */
	exports.startSelect = function(){
		if(state){
			canSelect = true;
			aimLastTime = null;
		}
	};

	/**
	 * ��ȡ���Ŀ��
	 */
	exports.getTarget = function(){
		if(state){
			var retObj;
			if(select){
				retObj = select.node;
				canSelect = false;
			}
			return retObj;
		}
	};

	/**
	 * ����˲��
	 */
	exports.hit = function(){
		if(state){
			var obj;
			if(select){
				select.isHit = true;
				select.curBlood--;
				if(select.curBlood==1){
					aimNode.choice[0].children[0].life2State=1;
				}else if(select.curBlood==0){
					aimNode.choice[0].children[0].life1State=1;
				}
				obj = select.curBlood==0?{"score":select.worth,"type":select.type}:{"score":0,"type":select.type};
				select = null;
				aimNode.whichChoice = -1;
			}
			return obj;
		}
		return null;
	};
	exports.init = function(){
		if(!state){
			aimLastTime = null;
			canSelect = false;
			Group = new SFNode("ShadowGroup{quality	1 children[Material{diffuseColor 1 1 1 emissiveColor 0.3 0.3 0.3 specularColor .77 .76 .76 ambientIntensity .14 shininess .9} DEF ufoTrans Transform{}]}");
			MyGroup = Group.children[1];
			GROUPMID.addChild(Group);
			createAim();
			createStar();
			bindTimer(true);
			for(var i=0;i<global.initNum;i++){
				processUFOCreate(null,true);
			}
			state=true;
		}
	};
	exports.destroy = function(){
		if(state){
			bindTimer(false);
			select=null;
			aimNode.whichChoice = -1;
			UFOMap = {};
			toRemove = [];
			MyGroup.removeChild();
			Group.removeChild();
			GROUPMID.removeChild(Group);
			state = false;
		}
	};
});
