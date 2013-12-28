/**
 * Created with JetBrains WebStorm.
 * User: zhangzd
 * Date: 13-1-22
 * Time: ����10:06
 */

define(function (require, exports, module) {
	var root = this, state = false,eventBind = false,init=false,
		log = require("core/Logger").getLog(),
		Timer = require("core/Timer"),
		TimerEvent = require("core/Event").getInstance("Timer"),
		AudioEvent = require("core/Event").getInstance("AudioEvent"),
		GameEvent = require("core/Event").getInstance("GameEvent"),
		ActionEvent = require("core/Event").getInstance("ActionEvent"),

		SceneManager = require("./SceneManager"),
		AudioManager = require("./AudioManager"),
		ActionManager = require("./ActionManager"),
		UIManager = require("./UIManager"),
		ScoreManager = require("./ScoreManager"),
		DBManager=require("./DBManager"),
		TrainManager = require("./TrainManager"),
        StoryManager=require("./StoryManager"),
		PlayerImageManager = require("./PlayerImageManager"),
		CrossBorderView = require("./CrossBorderView"),
//        CollectSkeData=require("./CollectSkeData"),
        LogoManager=require("./LogoManager"),
        CaptionManager=require("./CaptionManager"),
        Quake=require("./special_effects/Quake2"),

		UFOManager = require("./ufo2/Logic"),
		FruitManager = require("./fruit/Logic3"),
		FruitConfig = require("./fruit/Config3"),
		glint,firework,//��Чģ��
		bulletOptState = "",holdTarget = "",
		fruits = FruitConfig.fruits,
		holdSuccess,isHitting = false,
		lastTime = Date.now(),startTime = Date.now(),
		gameTime = 120,passedTime = 0,totalPassed = 0,
		number=0,effectArray=["fire","smoke","glint"],
		fruitSTO = -1,
		oFlag = {"finish":true,"pause":false},
		timeOutID = -1,destroyTime=10,ufoCreateTime = -1,//UFO��ʼ������ʱ�䣬���ݴ�ʱ����������ʱ��
        gameState="logo";    //��Ϸ״̬

	/**
	 * �󶨱�Ҫ�¼�
	 */
	function bindEvents(){
		if(!eventBind){
			GameEvent.bind("stateEvent",getStateEvent);
			GameEvent.bind("getFruit",getFruit);
            GameEvent.bind("gameState",colGameState);
			ActionEvent.bind("throwResult",throwAction);
			ActionEvent.bind("playerState",playerState);
			ActionEvent.bind("pause",pauseAction);
            ActionEvent.bind("handsHold",exitBrowser);      //��˫���˳���Ϸ
			ActionEvent.bind("swingHand",skipFlow);
			eventBind = true;
		}
	}

	/**
	 * ������������
	 */
	function skipFlow(){
		if(gameState=="story"){
			AudioEvent.trigger("sound","raiseHand");
			StoryManager.skip();
		}else if(gameState=="train"){
			AudioEvent.trigger("sound","raiseHand");
			TrainManager.skip();
		}
	}

    /**
     * ��Ϸ״̬����
     * @param s:��Ϸ��ǰ״̬
     */
    function colGameState(s){
        if(!s){ //���û�д��������Ĭ��Ϊ��Ϸ��ʼ״̬
            s="logo";
        }
        switch(s){
            case "logo": //��ʾ��Ϸ���ƺ�logo,��ʼ��Ϸ
                gameState="logo";
                LogoManager.init(function(){
                    LogoManager.show();
                });
                break;
            case "story": //��ʾ������ڶ���
                gameState="story";
	            ActionManager.changeAction("swingHand");
                StoryManager.init(function(){
                    StoryManager.show();
	                AudioEvent.trigger("music","story",true);
                });
                break;
            case "train": //��ʾѵ��˵������
                gameState="train";
                TrainManager.init(function(){
                    TrainManager.show();
	                AudioEvent.trigger("music","train",true);
                });
                break;
            case "index":
                gameState="index";
	            UIManager.init(function(){
		            //��Чģ��UI��ʼ��
		            glint.init();
		            firework.init();

                    UIManager.showGame();
                    UFOManager.init();
                    FruitManager.init();
                    ScoreManager.init();
                    CaptionManager.init(function(){
                        CaptionManager.show(true);
                    });
                    enterGame();
                    Timer.bindTime(globalTimer);
                });
                break;
        }
    }

	function playerState(v){
		if(v=="leave"){
			gamePause(true);
		}else if(v=="enter"){
			gamePause(false);
		}
	}

	function pauseAction(v){
		switch(v){
			case "handsUp":         //��Ϸ��ͣ
				gamePause(true);
				break;
			case "lhandLeft":       //�������˵�
				break;
			case "rhandRight":      //������Ϸ
				gamePause(false);
				break;
		}
	}

	function gamePause(v){
		if(v&&!oFlag.pause&&!oFlag.finish){
			oFlag.pause = true;
			passedTime += Math.floor(Date.now()-startTime);
			UIManager.showPause(v,function(){});
			//��Ϸ��ͣʱ��ֹͣĿ��ˮ��������
			clearTimeout(fruitSTO);
		}else if(!v&&oFlag.pause&&!oFlag.finish){
			AudioEvent.trigger("sound","welcome");
			//��Ϸ����ʱ,���δץȡ����ȷĿ��ˮ��������Ŀ��ˮ������
			if(holdTarget&&!holdSuccess){
				clearTimeout(fruitSTO);
				fruitSTO = setTimeout(targetFruitSound.bind(holdTarget),2.5);
			}
			UIManager.showPause(v,function(){});
			//������Ϸ��ʼʱ��Ϊȡ����ͣ״̬��ʱ��,��֤��Ϸ����ʱ��ȷ
			startTime = Date.now();
			//��֤dTime������ȷ,
			lastTime = startTime;
			oFlag.pause =false;
		}
	}

	/**
	 * ��⵽�ӵĶ���
	 * @param pos
	 */
	function throwAction(pos){
		if (!oFlag.pause&&!oFlag.finish) {
			//��ȡĿ��ڵ�
			if (bulletOptState == "throw") {
				if(!isHitting){
					var node = UFOManager.getTarget();
					if (node) {
						//ˮ��ģ�齫ˮ���ӳ�
						isHitting = true;
                        //��ͣ¼������
//                        CollectSkeData.pause(true);
						FruitManager.hurlUFO(pos, node);
					}
					AudioEvent.trigger("sound","throwFruit");
				}else{
					var r = Math.random();
					if(r>0.5){
						AudioEvent.trigger("sound","slowdown1");
					}else{
						AudioEvent.trigger("sound","slowdown2");
					}
				}
			}
		}
	}

	/**
	 * ��ȡ��Ϸ�и�״̬�¼�
	 */
	function getStateEvent(v){
		if(state&&!oFlag.finish){
			switch(v){
				case "hitting":
					hitting();
					break;
				case "fruitDisappear":
					fruitDisappear();
					break;
			}
		}
	}

	/**
	 * �������һ����Ч
	 * @param pos
	 * @param callback
	 */
	function playEffect(pos,callback){
		var eff=effectArray[Math.floor(Math.random()*effectArray.length)];
		switch(eff){
			case "glint" :
				glint.playAnimation(pos,callback);
				break;
			case "fire" :
			case "smoke" :
				firework.playAnimation(pos,eff,callback);
				break;
		}

	}

	/**
	 * ����˲��
	 */
	function hitting(){
		if(isHitting){
			isHitting = false;
			//֪ͨ�ɴ���ײ��
			var obj = UFOManager.hit();
			if(obj){
				if(obj.score!=0){
					AudioEvent.trigger("ufoSound",curBullet);
					ScoreManager.UFOCatch();
					UIManager.scoreAni(obj.score);
				}
				ScoreManager.record(obj,function(oScore){
					UIManager.changeText(oScore.sumScore);
				});
				playEffect(obj.pos,function(){
					if(!UIManager.getBullet()){
						AudioEvent.trigger("sound","noBullet");
						//������ˮ��
						toHoldFruit();
						//���UFO
						UFOManager.clearUFO();
						isHitting = false;
					}
				})
			}
		}
	}

	/**
	 * ˮ����ʧ
	 */
	function fruitDisappear(){
		//ˮ����ȫ��ʧ��δ��ȷ��ȡˮ��������������ˮ��
		if(!holdSuccess){
			ScoreManager.fruitCount();
			ScoreManager.fruitCatch(0);
			FruitManager.createFruit(holdTarget);
		}else{
			//֪ͨ����UFO
			UFOManager.startCreate(function(obj){
				ufoCreateTime = Date.now();
				var targets = [];
				if(obj.l){targets.push("lUFOEnter")}
				if(obj.m){targets.push("mUFOEnter")}
				if(obj.s){targets.push("sUFOEnter")}
				AudioEvent.trigger("sound",targets[Math.floor(Math.random()*targets.length)]);
			});
		}
	}

	/**
	 * ץ��ˮ��
	 * @param fruit
	 */
	var curBullet = "";
	function getFruit(fruit){
		++number;
		if(fruit==holdTarget){
			ScoreManager.fruitCount();
			ScoreManager.fruitCatch(number);
			//��ʶ��ȷ��ȡ��ˮ��
			holdSuccess = true;
			//��Ŀ��ˮ���ÿ�
			curBullet = fruit;
			holdTarget = "";
			//�������Ŀ��ˮ�����ƵĶ�ʱ��
			clearTimeout(fruitSTO);
			AudioEvent.trigger("sound","chooseSuccess");
			ActionManager.clearAction();
			AudioEvent.trigger("sound","fillBullet");
			UIManager.fillBullet(fruit,function(v){
				if(v&&UIManager.getBullet()){
					setBulletOptState("throw");
					ActionManager.changeAction("throw");
					UFOManager.startSelect();
					//֪ͨ���Կ�ʼ¼��������
//					CollectSkeData.pause(false);
				}
			});
		}else{
			AudioEvent.trigger("sound","chooseFailed");
		}
	}

	/**
	 * ���õ�ҩ�Ĳ���״̬��Ͷ��("throw") �� ץȡ("get")
	 * @param s
	 */
	function setBulletOptState(s){
		if(bulletOptState!=s){
			bulletOptState = s;
		}
	}

	/**
	 * �����Ŀ��ˮ��
	 */
	function randomFruit(){
		holdTarget = fruits[Math.floor(Math.random()*fruits.length)].name;
	}

	/**
	 * ����Ŀ��ˮ����Ч,ÿ��5���ֲ���һ�Σ���ȷ��ȡˮ���󽫱�ֹͣ��
	 * @param target
	 */
	function targetFruitSound(target){
		AudioEvent.trigger("sound",holdTarget);
		clearTimeout(fruitSTO);
		fruitSTO = setTimeout(targetFruitSound.bind(target),4);
	}

	/**
	 * �����ȡˮ������Ϸ״̬
	 */
	function toHoldFruit(){
		//���Ŀ��ˮ��
		randomFruit();
		//��ʶδ��ȷ��ȡ��ˮ��
		holdSuccess = false;
		FruitManager.createFruit(holdTarget);
		number=0;
		setBulletOptState("hold");
		UIManager.fillTarget(holdTarget,function(){
			targetFruitSound(holdTarget);
			ActionManager.changeAction("hold");
		});
	}

	/**
	 * �˳���Ϸ
	 */
	function destroyGame(){
        UIManager.showScore(false,null,function(){});
		ScoreManager.destroy();
		UFOManager.destroy();
        PlayerImageManager.reset();
        UIManager.destroy();
		gameState="reStart";        //�޸���Ϸ״̬
		enterGame();
	}

	/**
	 * ȫ��ֻ��һ��Timer,������Ϸ��ͣ����ʵ��
	 */
	function globalTimer(t){
		if(state&&!oFlag.pause){
			if(!oFlag.finish){
				//��Ϸ��ʼ���������Ϸ��ͣ�����Ϊһ��С��,�Ѿ��ù���ʱ��=С��1+С��2+С��3+....С��n
				//��Ϸʣ��ʱ�� = ��ʱ��-((��ǰʱ��-��ʼʱ��)+�Ѿ��ù���ʱ��)
				if(ufoCreateTime!=-1&&(t-ufoCreateTime>1.5)){
					Quake.play_quake();
					ufoCreateTime = -1;
				}
				totalPassed = passedTime+Math.floor(t-startTime);
				UIManager.changeTime(gameTime-totalPassed);
				if (totalPassed >= gameTime) {
					gameState="score";
					oFlag.pause = false;
					oFlag.finish = true;
					//ֹͣ���������ʾ
					ActionManager.enabled(false);
					//���Ŀ��ˮ����Ч����ѭ���
					clearTimeout(fruitSTO);
					FruitManager.destroy();
					UFOManager.destroy();
					var sData = ScoreManager.getScore();
					DBManager.save(sData, function (data) {
						UIManager.showScore(true, sData);
                        timeOutID=setTimeout(destroyGame, destroyTime);
                        ActionManager.clearAction();    //�����Ϊ
                        ActionManager.changeAction("handsHold");    //�ı���Ϊ
					});
					AudioEvent.trigger("music","score",false);
//					CollectSkeData.pause(true);             //��ͣ¼������
//					var datas = CollectSkeData.getSkeData();  //��ȡ����
//					if (datas && datas.length > 0) {
//						DBManager.saveSkeData(datas);       //��������
//					}
				}
			}
			TimerEvent.trigger("time",t,(t-lastTime));
			lastTime = t;
		}
	}

    function exitBrowser(actionStatus,spine){
        if(actionStatus&&actionStatus=="on"){
            Browser.command(32821); //�˳�
        }
    }

	/**
	 * ������Ϸ����
	 */
	function enterGame(){
//		clearTimeout(timeOutID);
		gameState = "game";
		PlayerImageManager.check(true);
		SceneManager.loadScene("game",function(){
			//��Ϸ��ʼ��Ч
			AudioEvent.trigger("music","game",true);
			isHitting = false;
			oFlag.pause = false;
			oFlag.finish = false;
			passedTime = 0;
            if(gameState!="index"){
                UIManager.init();
                UIManager.showGame();
                UFOManager.init();
                FruitManager.init();
                ScoreManager.init();
            }
			toHoldFruit();
			startTime = Date.now();
			lastTime = startTime;
			ActionManager.enabled(true);
		},true);
	}

	exports.init = function () {
		if (!state) {
			state = true;
			SceneManager.init();
			AudioManager.init();
			DBManager.init();
			ActionManager.init();
			PlayerImageManager.init();
			CrossBorderView.init();
			glint=require("./special_effects/Glint");
			firework=require("./special_effects/firework");
//            CollectSkeData.init();      //�ռ�Ͷ���Ĺ�������ģ���ʼ��
			colGameState("logo");
			bindEvents();
		}
	};

	exports.destroy = function () {
		if (state) {
			ActionManager.destroy();
			SceneManager.destroy();
			AudioManager.destroy();
			PlayerImageManager.destroy();
            CrossBorderView.destroy();
//            CollectSkeData.destroy();      //�ռ�Ͷ���Ĺ�����������
            LogoManager.destroy();
            TrainManager.destroy();
            StoryManager.destory();
			state = false;
		}
	};
});