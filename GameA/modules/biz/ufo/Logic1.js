/**
 * Created by JetBrains WebStorm.
 * User: sungf
 * Date: 13-1-29
 * Time: 下午2:48
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
	 * 处理所有已生成的UFO的状态
	 * @param dt
	 */
	function processUFOState(dt){
		var curUFO;
		for(var ufoK in UFOMap){
			curUFO = UFOMap[ufoK];
			switch(curUFO.state){
				case "fly":             //飞
					flyState(curUFO,dt);
					break;
				case "faint":           //晕
					faintState(curUFO,dt);
					break;
				case "deading":        //正在死亡
					deadingState(curUFO,dt);
					break;
				case "free":           //待用,死亡后置为空闲状态
					break;
			}
		}

		//删除空闲资源，遍历完再删除
		toRemove.forEach(function(key){
			//从渲染组中删除
			if(UFOMap[key]){
				MyGroup.removeChild(UFOMap[key].node);
				//从池中删除
				if(UFOMap[key].resType==MODEL){
					ModelPool.remove(key);
				}else if(UFOMap[key].resType==BONE){
					BonePool.remove(key);
				}
			}
			//从本地数据组中删除
			delete UFOMap[key];
		});
		if(toRemove.length>0){toRemove = [];}
	};

	/**
	 * 处于飞行状态的UFO逻辑处理
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
		//计算位置
		positionCalculate(instance,dt);
		//飞出屏幕
		ifIsOutScreen(instance);
	}

	/**
	 * 处于眩晕状态的UFO逻辑处理
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
		//飞出屏幕
		ifIsOutScreen(instance);
	};

	/**
	 * 处于死亡动画状态的UFO逻辑处理
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
					if(durt<=1){//模型动画的死亡处理过程：
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
	 * 正在死亡
	 * @param instance UFO对象实例
	 */
	function isDeading(instance){
		if(instance.resType==MODEL){//模型飞船死亡后重新设置起始点和目标点
			instance.start.setValue(instance.node.translation);
			instance.target.setValue(setNewTarget(instance));
		}else{//骨骼死亡死亡后播放动画
			boneAnimation(instance.node.children[0].children[1],require(instance.configPath).animation.dead.name);
		}
	};
	/**
	 * 当外星人出屏以后
	 * @param instance UFO对象实例
	 */
	function ifIsOutScreen(instance){
		if(instance.node.translation.z>camera.near){
			instance.state = "free";
			toRemove.push(instance.id);
		}
	};
	/**
	 * 外星人飞行时的位置计算处理
	 *      1.此时外星人所处的状态可能有两种：fly和faint
	 *      2.速度处理为不断衰减状态，计算方式如下：
	 *          当前速度=（当前位置-目标点位置).length() / (起始点位置-目标点位置).length()*起始速度
	 * @param instance UFO对象实例
	 * @param dt 时间片
	 */
	function positionCalculate(instance,dt){
		//计算位置
		var vec = instance.target.subtract(instance.start);
		instance.node.translation.setValue(instance.node.translation.add(vec.normalize().multiply(instance.flySpeed+0.2).multiply(dt)));
		instance.flySpeed=instance.node.translation.subtract(instance.target).length()/vec.length()*instance.startSpeed;
	};
	/**
	 * 骨骼动画播放
	 * @param boneInstance 骨骼实例
	 * @param actionName    动作名称
	 */
	function boneAnimation(boneInstance,actionName){
//        boneInstance.animClear=new MFString(boneInstance.animCycle[0],'0.3');
		boneInstance.animation=new MFString(actionName,'0.1','0.1');
	};
	/**
	 * 创建准星节点
	 */
	function createAim(){
		var nodeName = ProtoLoader.load(RS.protos.Aim);
		//创建时外层会自动套层group
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
	 * 根据当前时间显示或隐藏准星
	 *  准星添加到哪个UFO上的计算流程：
	 *      1.选择可视范围内的对象放入listSelect数组
	 *      2.若该数组的length!=0,对该数组进行从大到小的排序
	 *      3.然后在listSelect随机选择，选择算法为
	 *          var n=Math.floor(Math.random()*(Math.min(len,Config.select.selectNum)))；
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
		if(select){//准星的位置驱动
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
	 * 为UFO添加准星
	 * @param select 被选中的UFO对象
	 */
	function changeAimTarget(select){
		if(select.state=="fly"||select.state=="faint"){
			//1.准星位置和大小调整
			aimNode.choice[0].children[0].translation.setValue(select.config.translation);
			aimNode.choice[0].children[0].scale.setValue(select.config.scale);
			//2.血量调整
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
	 * 根据当前时间，生成UFO
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
	 * 创建骨骼UFO
	 */
	function createBoneUFO(config){
		var obj = BonePool.create(config.lyxName,config.template);
		createUFO(obj,config);
	};

	/**
	 * 创建模型UFO
	 */
	function createModelUFO(config){
		var obj=ModelPool.create(config.lyxName,config.template,global.modelBasePath);
		createUFO(obj,config);
	};

	/**
	 * 创建UFO对象，加入到集合对象UFOMap中，并加入到GROUP组中
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
	 * 重新设置目标
	 *  新目标计算流程：
	 *      １.若飞船在相机左边则让飞船往左逃跑
	 *         若飞船在相机右边则让飞船往右逃跑
	 * @param instance UFO对象
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
	 *暂停接口，当v为true时暂停
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
	 * 开始选择打击目标
	 */
	exports.startSelect = function(){
		if(state){
			canSelect = true;
			aimLastTime = null;
		}
	};

	/**
	 * 获取打击目标
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
	 * 击中瞬间
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
