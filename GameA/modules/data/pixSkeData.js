/**
 * Created by JetBrains WebStorm.
 * User: zhangzd
 * Date: 12-4-9
 * Time: ����4:20
 * @description ��dllͨѶ������dll���յ���ԭ�������������¼���ʽtrigger��ȥ.
 */

define(function (require, exports, module) {
	var root = this,state = false,stateCode = 0,
		log = require("core/Logger").getLog(),
		oCode = {
			"607":{state:false, bit:1}, //û���κι�������
			"608":{state:true, bit:1},  //�õ�����������
			"609":{state:false, bit:2}, //δ������߽�
			"610":{state:true, bit:2},  //������߽�
			"611":{state:false, bit:4}, //δ�����ұ߽�
			"612":{state:true, bit:4},  //�����ұ߽�
			"613":{state:false, bit:8}, //δ�����ϱ߽�
			"614":{state:true, bit:8},  //�����ϱ߽�
			"615":{state:false, bit:16},//δ�����±߽�
			"616":{state:true, bit:16}  //�����±߽�
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
	//�Ƿ���Ժ�����
		excludeLater = false,
	//��ʶ��ǰ�����ߵ���ر���,
	// ԭ��1.ͬʱ��������ʱ��ȡ��һ��ʶ�𵽵��˵Ĺ�������,
	// ԭ��2.ֻ��һ����ʱ��ȡ����˵Ĺ�������
	// ԭ��3.û����ʱ��û���κι���������Ҫ�������б����ָ�����ʼֵ
		oFlag = {
			//��ʶ��ǰ��ߵĹ���id,�Ƿ�Ӧ�ñ�exclude���ж����ݡ�ֵ������0,1,2,3,4,5,-1.
			'activeGuyId':-1,
			//��ǰ��������������0,1,2
			num:0,
			//��ʶ0~6�Ź�������������״̬,������true(������),false(û����)
			'0':false,'1':false,'2':false,'3':false,'4':false,'5':false,
			//��ʶ��һ������׽�����˵Ĺ���id
			'first':-1,
			//��ʶ�ڶ�������׽�����˵Ĺ���id
			'second':-1,
			//�˳��ߵĹ���id
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
	 * �ų����������Բ����ߵ�Ӱ�죬�����Ҫ�Ļ�
	 */
	function doExclude(){
		if(excludeLater){
			if(arg0 == -1){//���˳�����ͷ��Χ
				oFlag.exitGuyId = data[1];
				if(oFlag[data[1]] === true){//��ǰ�˳�����������ͷ��Χ��
					oFlag[data[1]] = false;
					if(oFlag.num===2){//�˳�ʱ����ͷ���ܹ���������
						if(data[1]===oFlag.first){
							oFlag.first = -1;
							oFlag.activeGuyId = oFlag.second;
							log.debug("��һ�����˳���ʹ�ú�ѡ�˵Ĺ������ݡ�����������������");
						}else if(data[1]===oFlag.second){
							oFlag.second = -1;
							log.debug("��ѡ���˳�����ʹ�õ�ǰ�����ߵĹ������ݡ�����������������");
						}
						oFlag.num = 1;
					}else if(oFlag.num===1){//�˳�ʱ����ͷ��ֻ���Լ�
						initFlag();
						log.debug("����ͷ��Χ��û�����ˣ�û���κι������ݿ���ʹ����");
					}
				}
			}else{//����ͷ��Χ���й�������,arg0��ʾ��ߵĹ���id
				if(oFlag[arg0]===false){//������ҽ���
					if(oFlag.num==0){//��ǰ����ͷ�ڻ�û�����
						oFlag.first = arg0;
						oFlag.activeGuyId = arg0;
						oFlag[arg0] = true;
						oFlag.num = 1;
						log.debug("��һ���˽��룬ֻ��һ���ˣ�������Ϊ�����ߡ�����������������");
					}else if(oFlag.num==1){//��ǰ����ͷ���Ѿ���һ����
						if(oFlag.first===-1){//��һ�����������Ѿ��뿪������ͷ��Χ�ڵ����ǵڶ�����������
							oFlag.first = arg0;
							oFlag[arg0] = true;
							log.debug("���˽�������ͷ��Χ,ʹ���ϴ���������ͷ��Χ�ڵ��˵Ĺ������ݡ�����������������");
						}else if(oFlag.second===-1){//��һ�����Ѿ�������ͷ��Χ�ڣ��ڶ����˽��롣
							oFlag.second = arg0;
							oFlag[arg0] = true;
							log.debug("���˽�������ͷ��Χ��������ѡ�ˣ���ǰ�����߲��䡣����������������");
						}
						oFlag.num = 2;
					}
				}
			}
		}
	}

	/**
	 * ������������װ��Vec3f��ֵ,��trigger��ȥ
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
	 * ˢ�¹���֡����
	 */
	function update(args) {
		if(!state||!args)return;
		data = args;
		arg0 = data[0];
		//�˳�����
		doExclude();
		//������װ
		packageToVec3f();
		MSEvent.trigger("rawData",data);

	}

	/**
	 * ��ȡ���д����״̬
	 * @param v
	 */
	function setState(v) {
		if(v==607){initFlag();}
		if (oCode[v] && oCode[v].state) {//����״̬
			if ((stateCode & oCode[v].bit) != oCode[v].bit) {
				stateCode |= oCode[v].bit;
				MSEvent.trigger("msState", stateCode);
			}
		} else if (oCode[v] && !oCode[v].state) {//ɾ��״̬
			if ((stateCode & oCode[v].bit) == oCode[v].bit) {
				stateCode &= ~oCode[v].bit;
				MSEvent.trigger("msState", stateCode);
			}
		}
	}

	/**
	 * ģ���ʼ������
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
				//��dllע�ᵱǰ��script�ű�
//				regiest(0, 100);
//				regiest(103, 100);
			} catch (e) {
				log.warn("��ʼ�����ʶ��ӿڲ����� : "+e);
			}
			state = true;
			excludeLater = el;
			if(dbg){checkLyinuxState();}
		}
	};

	/**
	 * ģ�����ٷ���
	 */
	exports.destory = function () {
		if(state){
			state = false;
		}
	};

	/**
	 * ֻ֧��һ���˲���
	 */
	exports.onlyOne = function(v){
		if(state){
			if(excludeLater!==v){
				excludeLater = v;
			}
		}
	}
});