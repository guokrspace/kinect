/**
 * Created by JetBrains WebStorm.
 * User: zhangzd
 * Date: 12-4-9
 * Time: 下午4:20
 * @description 和dll通讯，将从dll接收到的原生骨骼数据以事件形式trigger出去.
 */

define(function (require, exports, module) {
	var root = this,state = false,stateCode = 0,
		log = require("core/Logger").getLog(),
		oCode = {
			"607":{state:false, bit:1}, //没有任何骨骼数据
			"608":{state:true, bit:1},  //得到到骨骼数据
			"609":{state:false, bit:2}, //未超出左边界
			"610":{state:true, bit:2},  //超出左边界
			"611":{state:false, bit:4}, //未超出右边界
			"612":{state:true, bit:4},  //超出右边界
			"613":{state:false, bit:8}, //未超出上边界
			"614":{state:true, bit:8},  //超出上边界
			"615":{state:false, bit:16},//未超出下边界
			"616":{state:true, bit:16}  //超出下边界
		},data,
		head = new SFVec3f(), spine = new SFVec3f(),
		leftWrist = new SFVec3f(), rightWrist = new SFVec3f(),
		leftHand = new SFVec3f(), rightHand = new SFVec3f(),
		leftElbow = new SFVec3f(), rightElbow = new SFVec3f(),
		shoulderCenter = new SFVec3f(), leftShoulder = new SFVec3f(), rightShoulder = new SFVec3f(),
		hipCenter = new SFVec3f(), leftHip = new SFVec3f(), rightHip = new SFVec3f(),
		leftKnee = new SFVec3f(), rightKnee = new SFVec3f(),
		leftAnkle = new SFVec3f(), rightAnkle = new SFVec3f(),
		leftFoot = new SFVec3f(), rightFoot = new SFVec3f(),
		MSEvent = require("core/Event").getInstance("MSEvent"),
	//是否忽略后来者
		excludeLater = false,
	//标识当前操作者的相关变量,
	// 原则：1.同时有两个人时，取第一个识别到的人的骨骼数据,
	// 原则：2.只有一个人时，取这个人的骨骼数据
	// 原则：3.没有人时，没有任何骨骼数据需要处理，所有变量恢复至初始值
		oFlag = {
			//标识当前活动者的骨骼id,是否应该被exclude的判断依据。值可能是0,1,2,3,4,5,-1.
			'activeGuyId':-1,
			//当前骨骼数，可能是0,1,2
			num:0,
			//标识0~6号骨骼各自所处的状态,可能是true(有数据),false(没数据)
			'0':false,'1':false,'2':false,'3':false,'4':false,'5':false,
			//标识第一个被捕捉到的人的骨骼id
			'first':-1,
			//标识第二个被捕捉到的人的骨骼id
			'second':-1,
			//退出者的骨骼id
			'exitGuyId':-1
		},arg0;


	function checkLyinuxState(){
		var st = activeLyinux();
		var frameRate = Browser.getCurrentFrameRate(false);
		if(!st){
			log.debug('['+Date.now()+']:'+frameRate+','+st);
		}else{
			log.debug('['+Date.now()+']:'+frameRate+','+st);
		}
		setTimeout(checkLyinuxState,1);
	}

	function initFlag(){
		oFlag.activeGuyId = -1;
		oFlag.num = 0;
		oFlag[0] = oFlag[1] = oFlag[2] = oFlag[3] = oFlag[4] = oFlag[5] = false;
		oFlag.first = oFlag.second = oFlag.exitGuyId = -1;

		log.debug("initFlag................");
	}

	/**
	 * 排除其它骨骼对操作者的影响，如果需要的话
	 */
	function doExclude(){
		if(excludeLater){
			if(arg0 == -1){//有人出摄像头范围
				oFlag.exitGuyId = data[1];
				if(oFlag[data[1]] === true){//当前退出者是在摄像头范围内
					oFlag[data[1]] = false;
					if(oFlag.num===2){//退出时摄像头内总共有两个人
						if(data[1]===oFlag.first){
							oFlag.first = -1;
							oFlag.activeGuyId = oFlag.second;
							log.debug("第一个人退出，使用候选人的骨骼数据。。。。。。。。。");
						}else if(data[1]===oFlag.second){
							oFlag.second = -1;
							log.debug("候选人退出，仍使用当前操作者的骨骼数据。。。。。。。。。");
						}
						oFlag.num = 1;
					}else if(oFlag.num===1){//退出时摄像头内只有自己
						initFlag();
						log.debug("摄像头范围内没有人了，没有任何骨骼数据可以使用了");
					}
				}
			}else{//摄像头范围内有骨骼数据,arg0表示活动者的骨骼id
				if(oFlag[arg0]===false){//有新玩家进入
					if(oFlag.num==0){//当前摄像头内还没有玩家
						oFlag.first = arg0;
						oFlag.activeGuyId = arg0;
						oFlag[arg0] = true;
						oFlag.num = 1;
						log.debug("第一个人进入，只有一个人，被设置为操作者。。。。。。。。。");
					}else if(oFlag.num==1){//当前摄像头内已经有一个人
						if(oFlag.first===-1){//第一个进来的人已经离开，摄像头范围内的人是第二个进来的人
							oFlag.first = arg0;
							oFlag[arg0] = true;
							log.debug("有人进入摄像头范围,使用上次留在摄像头范围内的人的骨骼数据。。。。。。。。。");
						}else if(oFlag.second===-1){//第一个人已经在摄像头范围内，第二个人进入。
							oFlag.second = arg0;
							oFlag[arg0] = true;
							log.debug("有人进入摄像头范围，看作候选人，当前操作者不变。。。。。。。。。");
						}
						oFlag.num = 2;
					}
				}
			}
		}
	}

	/**
	 * 将骷髅数据组装成Vec3f的值,再trigger出去
	 */
	function packageToVec3f(){
		if(arg0!==-1){
			hipCenter.setValue(data[1], data[2], data[3]);
			spine.setValue(data[4], data[5], data[6]);
			shoulderCenter.setValue(data[7], data[8], data[9]);
			head.setValue(data[10], data[11], data[12]);
			leftShoulder.setValue(data[13], data[14], data[15]);
			leftElbow.setValue(data[16], data[17], data[18]);
			leftWrist.setValue(data[19], data[20], data[21]);
			leftHand.setValue(data[22], data[23], data[24]);
			rightShoulder.setValue(data[25], data[26], data[27]);
			rightElbow.setValue(data[28], data[29], data[30]);
			rightWrist.setValue(data[31], data[32], data[33]);
			rightHand.setValue(data[34], data[35], data[36]);
			leftHip.setValue(data[37], data[38], data[39]);
			leftKnee.setValue(data[40], data[41], data[42]);
			leftAnkle.setValue(data[43], data[44], data[45]);
			leftFoot.setValue(data[46], data[47], data[48]);
			rightHip.setValue(data[49], data[50], data[51]);
			rightKnee.setValue(data[52], data[53], data[54]);
			rightAnkle.setValue(data[55], data[56], data[57]);
			rightFoot.setValue(data[58], data[59], data[60]);
			if(!excludeLater||(excludeLater&&oFlag.activeGuyId==data[0])){
				MSEvent.trigger("frameChange",
					hipCenter, spine, shoulderCenter, head,
					leftShoulder, leftElbow, leftWrist, leftHand,
					rightShoulder, rightElbow, rightWrist, rightHand,
					leftHip, leftKnee, leftAnkle, leftFoot,
					rightHip, rightKnee, rightAnkle, rightFoot
				);
			}
		}
	}

	/**
	 * 刷新骨骼帧数据
	 */
	function update(args) {
		if(!state||!args)return;
		data = args;
		arg0 = data[0];
		//滤出数据
		doExclude();
		//数据组装
		packageToVec3f();
		MSEvent.trigger("rawData",data);

	}

	/**
	 * 获取所有传入的状态
	 * @param v
	 */
	function setState(v) {
		if(v==607){initFlag();}
		if (oCode[v] && oCode[v].state) {//赋予状态
			if ((stateCode & oCode[v].bit) != oCode[v].bit) {
				stateCode |= oCode[v].bit;
				MSEvent.trigger("msState", stateCode);
			}
		} else if (oCode[v] && !oCode[v].state) {//删除状态
			if ((stateCode & oCode[v].bit) == oCode[v].bit) {
				stateCode &= ~oCode[v].bit;
				MSEvent.trigger("msState", stateCode);
			}
		}
	}

	/**
	 * 模块初始化方法
	 */
	exports.init = function (el,dbg) {
		if (!state) {
			try {
				if(!root.setState){
					root.setState = function(v){
						setState(v);
					};
				}
				if(!root.skeDepthChange){
					var sdc;
					root.skeDepthChange =function(){
						sdc = arguments;
						update(sdc);
					}
				}
				//向dll注册当前的script脚本
//				regiest(0, 100);
//				regiest(103, 100);
			} catch (e) {
				log.warn("初始化体感识别接口不存在 : "+e);
			}
			state = true;
			excludeLater = el;
			if(dbg){checkLyinuxState();}
		}
	};

	/**
	 * 模块销毁方法
	 */
	exports.destory = function () {
		if(state){
			state = false;
		}
	};

	/**
	 * 只支持一个人操作
	 */
	exports.onlyOne = function(v){
		if(state){
			if(excludeLater!==v){
				excludeLater = v;
			}
		}
	}
});