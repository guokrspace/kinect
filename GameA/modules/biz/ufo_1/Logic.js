/**
 * Created by JetBrains WebStorm.
 * User: sungf
 * Date: 13-1-29
 * Time: ����2:48
 * To change this template use File | Settings | File Templates.
 */
define(function(require,exports,module){
	var root=this,state=false,
		log=require("core/Logger").getLog(),
		TimerEvent = require("core/Event").getInstance("Timer"),
		GameEvent = require("core/Event").getInstance("GameEvent"),
		UFO=require("./Ufo"),
		Area=require("./Area"),
		ProtoLoader = require("node/ProtoLoader"),
		ModelPool=require("node/NodeCachePool"),
		BonePool = require("node/BoneCachePool"),
		Config=require("./Config"),
		camera=Config.camera,
		global=Config.global,
		ufos=Config.ufos,
		MyGroup,Group,aimNode,starNode,
		canSelect = false,select,UFOMap = {},toRemove = [],
		MODEL= 1,BONE= 2,R=Area.getR();

	function timer(t,dt){
		if(state){
			processUFOState(dt);
			processSelect(t);
		}
	}
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
				case "stop":           //ԭ�ط��У�������Ŀ��㣩
//					stopState(curUFO,dt);
					break;
				case "deading":        //��������
					deadingState(curUFO,dt);
					break;
				case "free":           //����,��������Ϊ����״̬

					break;
				case "back":
					backState(curUFO,dt);
					break;
			}
		}
		remove();
	}

	function processSelect(t){
		if(select){
//			log.debug(select.id+"::::::selectState : "+select.selectState);
			if(select.selectState=="choose"){
				if(t-select.chooseTime>1.5){
//					log.debug(select.id+"choose--->lock");
					select.selectState = "lock";
					delete select.chooseTime;
					select.lockTime = Date.now();
					canSelect =false;
					changeAimTarget(select);
					GameEvent.trigger("ufoState","aimed");
				}
			}else if(select.selectState=="lock"){
				if(t-select.lockTime>5){
					canSelect = true;
					select.selectState = "free";
					GameEvent.trigger("ufoState","unAimed");
					aimNode.choice[0].children[0].translation.setValue(0,0,0);
				}
			}else if(select.selectState=="toBeHit"){

			}
		}
	}

	function remove(){
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
	}
	/**
	 * ���ڷ���״̬��UFO�߼�����
	 * @param t
	 */
	function flyState(instance,dt){
		//����λ��
		var vec = instance.target.subtract(instance.start);
		instance.node.translation.setValue(instance.node.translation.add(vec.normalize().multiply(instance.flySpeed).multiply(dt)));
		instance.flySpeed=150;
		if(instance.node.translation.z>=Config.global.targetZ){
//			log.debug("stop translation :::"+instance.node.translation+"target :::"+instance.target);
			instance.node.translation.setValue(instance.target);
//			log.debug("end translation :::"+instance.node.translation);
			instance.state = "stop";
			canSelect = true;
		}
	}

	/**
	 * ����ѣ��״̬��UFO�߼�����
	 * @param instance
	 * @param dt
	 */
	function stopState(instance,dt){
		if(instance.isHit){
			if(instance.curBlood==0){
				instance.state = "deading";
				isDeading(instance);
			}
			instance.isHit = false;
		}
	}

	function backState(instance,dt){
		if(!instance.aa){
//			log.debug(instance.id+" ::: "+instance.target);
			instance.aa = true;
		}
		var vec = instance.target.subtract(instance.start);
		instance.node.translation.setValue(instance.node.translation.add(vec.normalize().multiply(instance.flySpeed).multiply(dt)));
		instance.flySpeed = 150;
		if(instance.node.translation.z<=camera.far){
			instance.state = "free";
			toRemove.push(instance.id);
		}
	}

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
	}

	/**
	 * ������������
	 * @param boneInstance ����ʵ��
	 * @param actionName    ��������
	 */
	function boneAnimation(boneInstance,actionName){
//      boneInstance.animClear=new MFString(boneInstance.animCycle[0],'0.3');
		boneInstance.animation=new MFString(actionName,'0.1','0.1');
	}

	/**
	 * ����׼�ǽڵ�
	 */
	function createAim(){
		var nodeName = ProtoLoader.load(RS.protos.Aim);
		//����ʱ�����Զ��ײ�group
		aimNode = new SFNode("Switch { choice [ Transform { children ["+nodeName+"{}] }] whichChoice -1 }").children[0];
		MyGroup.addChild(aimNode);
	}

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
	 * ΪUFO���׼��
	 * @param select ��ѡ�е�UFO����
	 */
	function changeAimTarget(select){
		if(select.state=="stop"){
			aimNode.choice[0].translation.setValue(select.node.translation);
			aimNode.choice[0].children[0].aimState=-3;
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
	}

	/**
	 * ����UFO
	 */
	function UFOCreate(v3){
		var r = Math.floor(Math.random()*ufos.length);
		switch(ufos[r].resType){
			case MODEL:
				createModelUFO(ufos[r],v3);
				break;
			case BONE:
				createBoneUFO(ufos[r],v3);
				break;
		}
	}

	function bindTimer(v){
		if(v){
			TimerEvent.bind("time",timer);
		}else{
			TimerEvent.unbind("time",timer);
		}
	}

	/**
	 * ��������UFO
	 */
	function createBoneUFO(config,v3){
		var obj = BonePool.create(config.lyxName,config.template);
		createUFO(obj,config,v3);
	}

	/**
	 * ����ģ��UFO
	 */
	function createModelUFO(config,v3){
		var obj=ModelPool.create(config.lyxName,config.template,global.modelBasePath);
		createUFO(obj,config,v3);
	}

	/**
	 * ����UFO���󣬼��뵽���϶���UFOMap�У������뵽GROUP����
	 * @param obj
	 * @param config
	 */
	function createUFO(obj,config,v3){
		var ufo = UFO.getInstance(obj,config);
		ufo.target.setValue(v3);
		UFOMap[obj.id] = ufo;
		MyGroup.addChild(obj.node);
	}

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
			y=instance.node.translation.y;
		}
		return new SFVec3f(x,y,z);
	}
	function getDistance(v3_1,v3_2){
//		v3_1.z=0;v3_2.z=0;
//		return (v3_1.subtract(v3_2).length());
		return Math.sqrt(Math.pow(v3_1.x-v3_2.x,2)+Math.pow(v3_1.y-v3_2.y,2));
	}

	/**
	 * ��ȡ���Ŀ��
	 */
	exports.getTarget = function(){
		if(state){
			var retObj;
			if(select){
				retObj = select.node;
				canSelect = false;
				if(select.selectState=="lock"){
					select.selectState = "toBeHit";
				}
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
					obj = {"score":0,"type":select.type};
					select.selectState = "lock";
					select.lockTime = Date.now();
				}else if(select.curBlood==0){
					aimNode.choice[0].children[0].life1State=1;
					obj = {"score":select.worth,"type":select.type};
					select.state = "deading";
					isDeading(select);
					select = null;
					aimNode.whichChoice = -1;
					canSelect=true;
					GameEvent.trigger("ufoState","unAimed");
					aimNode.choice[0].children[0].translation.setValue(0,0,0);
					aimNode.choice[0].children[0].scale.setValue(1,1,1);
				}
			}
			return obj;
		}
		return null;
	};
	exports.startCreate =function(){
		if(state){
			var area=Area.getAreas();
//			log.debug("startCreate : "+JSON.stringify(area));
			for(var i=0,len=area.length;i<len;i++){
				UFOCreate(area[i]);
			}
		}
	};
	exports.clearUFO =function(){
		if(state){
			var curUFO;
			for(var ufoK in UFOMap){
				curUFO = UFOMap[ufoK];
				if(curUFO.state=="stop"){
					curUFO.state="back";
					curUFO.target.setValue(curUFO.start);
					curUFO.start.setValue(curUFO.node.translation);
				}
			}
			aimNode.whichChoice = -1;
			canSelect = false;
		}
	};
	var mouseVec = new SFVec3f(), X,Y;
	function aimSelect(v2){
		//׼�Ǹ������ƶ�����׼��λ����Ŀ���ľ���С�ڻ����Rʱ����������״̬
		if(state){
			if(canSelect){
				mouseVec.setValue(v2.x*X,v2.y*Y,Config.global.targetZ);
				aimNode.choice[0].translation.setValue(mouseVec);
				if(aimNode.whichChoice == -1){
					aimNode.whichChoice = -3;
					aimNode.choice[0].children[0].aimState=-1;
				}
				for(var ufoK in UFOMap){
					var curUFO = UFOMap[ufoK];
					startSelect(mouseVec,curUFO);
				}
			}
		}
	}

	function startSelect(v3,ufo){
		var distance = getDistance(v3,ufo.target);
		if(ufo.selectState=="free"){
			if(distance<=R){
				select = ufo;
				ufo.chooseTime = Date.now();
				ufo.selectState = "choose";
				aimNode.choice[0].children[0].scale.setValue(1,1,1);
			}
		}else if(ufo.selectState=="choose"){
			if(distance>R){
				select = null;
				delete ufo.chooseTime;
				ufo.selectState = "free";
				aimNode.choice[0].children[0].scale.setValue(1,1,1);
			}
		}
	}

	exports.init = function(){
		if(!state){
			require("core/Event").getInstance("ActionEvent").bind("mouse",aimSelect);
			X = UFO.getLookWidth(Config.global.targetZ)/2;
			Y = UFO.getLookHeight(Config.global.targetZ)/2;
			Area.init();
			canSelect = false;
			Group = new SFNode("ShadowGroup{quality	1 children[Material{diffuseColor 1 1 1 emissiveColor 0.3 0.3 0.3 specularColor .77 .76 .76 ambientIntensity .14 shininess .9} DEF ufoTrans Transform{}]}");
			MyGroup = Group.children[1];
			GROUPMID.addChild(Group);
			createAim();
			createStar();
			bindTimer(true);
			state=true;
		}
	};

	exports.destroy = function(){
		if(state){
			require("core/Event").getInstance("ActionEvent").unbind("mouse",aimSelect);
			bindTimer(false);
			select=null;
			aimNode.whichChoice = -1;
			UFOMap = {};
			toRemove = [];
			MyGroup.removeChild();
			Group.removeChild();
			GROUPMID.removeChild(Group);
			Area.destroy();
			state = false;
		}
	};
});
