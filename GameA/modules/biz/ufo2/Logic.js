/**
 * Created with JetBrains WebStorm.
 * User: sungf
 * Date: 13-2-27
 * Time: 下午3:41
 * To change this template use File | Settings | File Templates.
 */
define(function(require,exports,module){
	var root=this,state=false,getNode=false,
		log=require("core/Logger").getLog(),
		TimerEvent = require("core/Event").getInstance("Timer"),
		GameEvent = require("core/Event").getInstance("GameEvent"),
		ActionEvent=require("core/Event").getInstance("ActionEvent"),
		UFO=require("./Ufo"),
		Area=require("./Area"),
		Screen=require("./Screen"),
		ProtoLoader = require("node/ProtoLoader"),
		ModelPool=require("node/NodeCachePool"),
		BonePool = require("node/BoneCachePool"),
		Config=require("./Config"),
		camera=Config.camera,
		global=Config.global,
		ufos=Config.ufos,
		selection=Config.select,
		MyGroup,MyGroup2,Group,aimNode,starNode,
		canSelect = false,select,UFOMap = {},toRemove = [],
		aimLastTime,ufoFlagObj = {"l":false,"m":false,"s":false},
		MODEL= 1,BONE= 2;

	function getNodes(){
		if(!getNode){
			createGroup();
			createAim();
			createStar();
			getNode=true;
		}
	}
	function createGroup(){
		Group = new SFNode("ShadowGroup{quality	1 children[ DEF ufoTrans Transform{}  Transform{}]}");
		MyGroup = Group.children[0];
		MyGroup2=Group.children[1];
		GROUPMID.addChild(Group);
	}
	function createAim(){
		var nodeName = ProtoLoader.load(RS.protos.Aim);
		//创建时外层会自动套层group
		aimNode = new SFNode("Switch { choice [ Transform { children ["+nodeName+"{}] }] whichChoice -1 }").children[0];
		aimTrans=aimNode.choice[0].translation;
		aimChildren=aimNode.choice[0].children[0];
		MyGroup2.addChild(aimNode);
	}
	function createStar(){
		var url="\"resources/images/star/star2.png\" ";
		var str="Transform{ children [   Switch {  choice ["+
			"    ImageTexture{url "+url+"}"+
			" IndexedFaceSet {"+
			"     coord Coordinate { point ["+
			"               -.9  -.8999  0,"+
			"               .9  -.8999  0,"+
			"                .9  .8999  0,"+
			"                -.9  .8999  0]"+
			"       }   coordIndex [0 1 2 3]  } ]whichChoice -1 }] }";
		starNode=new SFNode(str);
		starNode.scale.setValue(starNode.scale.multiply(0.01));
		MyGroup2.addChild(starNode);
	}
	function bindTimer(v){
		if(v){
			TimerEvent.bind("time",timer);
		}else{
			TimerEvent.unbind("time",timer);
		}
	}
	function timer(t,dt){
		if(state){
			processUFOState(dt);
			processAim(t);
		}
	}
	function processUFOState(dt){
		var curUFO;
		for(var ufoK in UFOMap){
			curUFO = UFOMap[ufoK];
			switch(curUFO.state){
				case "fly":             //飞
					flyState(curUFO,dt);
					break;
//				case "idle":
//
//					break;
//				case "selected":
//
//					break;
				case "deading":
					deadingState(curUFO,dt);
					break;
				case "backing":
					backingState(curUFO,dt);
					break;
//				case "free":
//
//  					break;
			}
		}
		remove();
	}
	function remove(){
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
	}
	function flying(instance,dt){
		if(instance.dts<global.flyTimes){
			instance.dts+=dt;
			if(instance.dts>global.flyTimes){
				instance.dts=global.flyTimes;
			}
			instance.f=instance.dts/global.flyTimes;
		}
		instance.translation.setValue(instance.start.slerp(instance.target,instance.f));
	}
	function flyState(instance,dt){
		flying(instance,dt);
		if(instance.translation.z>=global.targetZ){
			instance.state = "idle";
			canSelect = true;
			instance.dts=0;
			instance.f=0;
		}
	}
	function backingState(instance,dt){
		flying(instance,dt);
		if(instance.translation.z<=camera.far){
			instance.state = "free";
			toRemove.push(instance.id);
			instance.dts=0;
			instance.f=0;
		}
	}
	function deadingState(instance,dt){
		if(instance.resType==MODEL){
			if(!instance.deadingFun){
				var vec = instance.target.subtract(instance.start);
				var st = Date.now()+1;
				var flag=true, durt, value;
				var ufoTrans=instance.translation,
					ufoScale=instance.node.scale,
					star=starNode.children[0];

				instance.deadingFun = function(t){
					durt=t-st;
					if(durt>0){
						if(durt<=1){//模型动画的死亡处理过程：
							ufoTrans.setValue(instance.start.add(vec.multiply(durt)));
							value=1.01 - durt;
							ufoScale.setValue(value, value, value);
						}else if(durt>1.005&&durt<=1.5){
							if(flag){
								flag=false;
								instance.state = "free";
								toRemove.push(instance.id);
								starNode.translation=ufoTrans;
							}
							value=2*(durt-1);
							starNode.scale.setValue(value,value,value);
							if( star.whichChoice==-1){
								star.whichChoice=-3;
							}
						}else if(durt<2){
							value=1.01-(durt-1.5)*2;
							starNode.scale.setValue(value,value,value);
						}else {
							if(star.whichChoice==-3){
								star.whichChoice=-1;
							}
							TimerEvent.unbind("time",instance.deadingFun);
						}
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
			instance.start.setValue(instance.translation);
			instance.target.setValue(setNewTarget(instance));
		}else{//骨骼死亡死亡后播放动画
			boneAnimation(instance.node.children[0].children[1],require(instance.configPath).animation.dead.name);
		}
	}

	/**
	 * 骨骼动画播放
	 * @param boneInstance 骨骼实例
	 * @param actionName    动作名称
	 */
	function boneAnimation(boneInstance,actionName){
//      boneInstance.animClear=new MFString(boneInstance.animCycle[0],'0.3');
		boneInstance.animation=new MFString(actionName,'0.1','0.1');
	}
	function setNewTarget(instance){
		var x, z, y;
		var	r=3+Math.floor(Math.random()*3);
		var	lookWidth=Screen.getLookWidth(global.targetZ);
		if(instance.translation.x<camera.position[0]){
			x=-lookWidth*1/r;
		}else{
			x=lookWidth*1/r;
		}
		return new SFVec3f(x,instance.translation.y,instance.translation.z);
	}
	function processAim(t){
		if(!aimLastTime||t-aimLastTime>selection.selectCycle){
			if(canSelect){
				selectFun();
			}
			aimLastTime = t;
		}
	};
	function selectFun(){
		var listSelect = [];
		var len;
		for(var key in UFOMap){
			var ufo=UFOMap[key];
			if(ufo.state=="idle"){
				listSelect.push(ufo);
			}
		}
		len=listSelect.length;
		if(len!=0){
			var n=Math.floor(Math.random()*len);
			select = listSelect[n];
			changeAimTarget(select);
		}
	}
	/**
	 * 为UFO添加准星
	 * @param select 被选中的UFO对象
	 */
	var aimTrans,aimChildren;
	function changeAimTarget(select){
			//1.准星位置和大小调整
		aimTrans.setValue(select.node.translation);
		aimChildren.translation.setValue(select.config.translation);
		aimChildren.scale.setValue(select.config.scale);
			//2.血量调整
		aimChildren.life1State=0;
		if(select.config.blood==2){
			aimChildren.life=-3;
			if(select.curBlood==1){
				aimChildren.life2State=1;
			}else if(select.curBlood==2){
				aimChildren.life2State=0;
			}
		}else if(select.config.blood==1){
			aimChildren.life=0;
		}
		if(aimNode.whichChoice==-1){
			aimNode.whichChoice=-3;
		}
	};
	/**
	 * 创建一个UFO对象
	 * @param target
	 */
	function createOneUFO(target){
		var r = Math.floor(Math.random()*ufos.length);
		var config=ufos[r];
		var obj;
		var ufo;
		switch(config.resType){
			case MODEL:
				obj=ModelPool.create(config.lyxName,config.template,global.modelBasePath);
				break;
			case BONE:
				obj= BonePool.create(config.lyxName,config.template);
				break;
		}
		setUFOFlagObj(config);
		createUFO(obj,config,target);
	}
	function createUFO(obj,config,target){
		var ufo = UFO.getInstance(obj,config);
		ufo.target.setValue(target);
		UFOMap[obj.id] = ufo;
		MyGroup.addChild(obj.node);
	}

	function resetUFOFlagObj(){
		ufoFlagObj.l = false;
		ufoFlagObj.m = false;
		ufoFlagObj.s = false;
	}

	function setUFOFlagObj(conf){
		if(conf.type=="ufo006"&&!ufoFlagObj.l){ufoFlagObj.l = true;}
		if(conf.type=="ufo007"&&!ufoFlagObj.m){ufoFlagObj.m = true;}
		if(conf.type=="ufo008"&&!ufoFlagObj.s){ufoFlagObj.s = true;}
	}

	exports.startCreate=function(callback){
		if(state){
			resetUFOFlagObj();
			var area=Area.getAreas();
			for(var i= 0,len=area.length;i<len;i++){
				createOneUFO(area[i]);
			}
			callback&&callback(ufoFlagObj);
		}
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

	exports.getTarget=function(){
		if(state){
			var retObj;
			if(select){
				retObj = select.node;
				canSelect = false;
				select.state="selected";
			}
			return retObj;
		}
	};
	exports.hit=function(){
		if(state){
			var obj;
			if(select){
				select.isHit = true;
				select.curBlood--;
				if(select.curBlood==1){
					aimChildren.life2State=1;
					obj = {"score":0,"type":select.type,"pos":select.node.translation};
					select.state = "selected";
					aimLastTime=Date.now();
					canSelect=true;
				}else if(select.curBlood==0){
					aimChildren.life1State=1;
					obj = {"score":select.worth,"type":select.type,"pos":select.node.translation};

					select.state = "deading";
					isDeading(select);
					select = null;
					aimLastTime=null;
					canSelect=true;
				}
			}
			return obj;
		}
	};
	exports.clearUFO=function(){
		if(state){
			var curUFO;
			for(var ufoK in UFOMap){
				curUFO = UFOMap[ufoK];
				if(curUFO.state=="idle"||curUFO.state=="selected"){
					curUFO.state="backing";
					curUFO.target.setValue(curUFO.start);
					curUFO.start.setValue(curUFO.node.translation);
				}
			}
			aimNode.whichChoice = -1;
			select=null;
			canSelect = false;
		}
	};
	exports.init=function(){
		if(!state){
			Area.init();
			bindTimer(true);
			getNodes();
			canSelect = false;
			state=true;
		}
	};
	exports.destroy=function(){
		if(state){
			select=null;
			UFOMap = {};
			toRemove = [];
			aimNode.whichChoice = -1;
			MyGroup.removeChild();
			bindTimer(false);
			Area.destroy();
			state=false;
		}
	};

});
