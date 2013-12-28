/**
 * Created by JetBrains WebStorm.
 * User: zhangzd
 * Date: 12-4-9
 * Time: ����4:20
 * @description ��dllͨѶ������dll���յ���ԭ�������������¼���ʽtrigger��ȥ.
 */

define(function (require, exports, module) {
	var root = this, state = false,stateCode = 0,
		oCode = {
			"607":{state:false, bit:1},//û���κι�������
			"608":{state:true, bit:1}  //�õ�����������
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
		log = require("core/Logger").getLog(),
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
			hipCenter.setValue(data[1]/1000, data[2]/1000, data[3]/1000);
			spine.setValue(data[5]/1000, data[6]/1000, data[7]/1000);
			shoulderCenter.setValue(data[9]/1000, data[10]/1000, data[11]/1000);
			head.setValue(data[13]/1000, data[14]/1000, data[15]/1000);
			leftShoulder.setValue(data[17]/1000, data[18]/1000, data[19]/1000);
			leftElbow.setValue(data[21]/1000, data[22]/1000, data[23]/1000);
			leftWrist.setValue(data[25]/1000, data[26]/1000, data[27]/1000);
			leftHand.setValue(data[29]/1000, data[30]/1000, data[31]/1000);
			rightShoulder.setValue(data[33]/1000, data[34]/1000, data[35]/1000);
			rightElbow.setValue(data[37]/1000, data[38]/1000, data[39]/1000);
			rightWrist.setValue(data[41]/1000, data[42]/1000, data[43]/1000);
			rightHand.setValue(data[45]/1000, data[46]/1000, data[47]/1000);
			leftHip.setValue(data[49]/1000, data[50]/1000, data[51]/1000);
			leftKnee.setValue(data[53]/1000, data[54]/1000, data[55]/1000);
			leftAnkle.setValue(data[57]/1000, data[58]/1000, data[59]/1000);
			leftFoot.setValue(data[61]/1000, data[62]/1000, data[63]/1000);
			rightHip.setValue(data[65]/1000, data[66]/1000, data[67]/1000);
			rightKnee.setValue(data[69]/1000, data[70]/1000, data[71]/1000);
			rightAnkle.setValue(data[73]/1000, data[74]/1000, data[75]/1000);
			rightFoot.setValue(data[77]/1000, data[78]/1000, data[79]/1000);
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
		if (oCode[v] && oCode[v].state) {
			if ((stateCode & oCode[v].bit) != oCode[v].bit) {
				stateCode |= oCode[v].bit;
				MSEvent.trigger("msState", stateCode);
			}
		} else if (oCode[v] && !oCode[v].state) {
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
				if(!root.frameChange){
					var sdc;
					root.frameChange = function(){
						sdc = arguments;
						update(sdc);
					}
				}

				//��dllע�ᵱǰ��script�ű�
//				regiest(0, 100);
//				regiest(103,100);
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