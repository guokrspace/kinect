/**
 * Created with JetBrains WebStorm.
 * User: zhangzd
 * Date: 13-1-22
 * Time: 上午10:06
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
		glint,firework,//特效模块
		bulletOptState = "",holdTarget = "",
		fruits = FruitConfig.fruits,
		holdSuccess,isHitting = false,
		lastTime = Date.now(),startTime = Date.now(),
		gameTime = 120,passedTime = 0,totalPassed = 0,
		number=0,effectArray=["fire","smoke","glint"],
		fruitSTO = -1,
		oFlag = {"finish":true,"pause":false},
		timeOutID = -1,destroyTime=10,ufoCreateTime = -1,//UFO开始创建的时间，根据此时间决定画面何时振动
        gameState="logo";    //游戏状态

	/**
	 * 绑定必要事件
	 */
	function bindEvents(){
		if(!eventBind){
			GameEvent.bind("stateEvent",getStateEvent);
			GameEvent.bind("getFruit",getFruit);
            GameEvent.bind("gameState",colGameState);
			ActionEvent.bind("throwResult",throwAction);
			ActionEvent.bind("playerState",playerState);
			ActionEvent.bind("pause",pauseAction);
            ActionEvent.bind("handsHold",exitBrowser);      //举双手退出游戏
			ActionEvent.bind("swingHand",skipFlow);
			eventBind = true;
		}
	}

	/**
	 * 举手跳过流程
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
     * 游戏状态控制
     * @param s:游戏当前状态
     */
    function colGameState(s){
        if(!s){ //如果没有传入参数，默认为游戏开始状态
            s="logo";
        }
        switch(s){
            case "logo": //显示游戏名称和logo,开始游戏
                gameState="logo";
                LogoManager.init(function(){
                    LogoManager.show();
                });
                break;
            case "story": //显示故事情节动画
                gameState="story";
	            ActionManager.changeAction("swingHand");
                StoryManager.init(function(){
                    StoryManager.show();
	                AudioEvent.trigger("music","story",true);
                });
                break;
            case "train": //显示训练说明动画
                gameState="train";
                TrainManager.init(function(){
                    TrainManager.show();
	                AudioEvent.trigger("music","train",true);
                });
                break;
            case "index":
                gameState="index";
	            UIManager.init(function(){
		            //特效模块UI初始化
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
			case "handsUp":         //游戏暂停
				gamePause(true);
				break;
			case "lhandLeft":       //返回主菜单
				break;
			case "rhandRight":      //继续游戏
				gamePause(false);
				break;
		}
	}

	function gamePause(v){
		if(v&&!oFlag.pause&&!oFlag.finish){
			oFlag.pause = true;
			passedTime += Math.floor(Date.now()-startTime);
			UIManager.showPause(v,function(){});
			//游戏暂停时，停止目标水果的语音
			clearTimeout(fruitSTO);
		}else if(!v&&oFlag.pause&&!oFlag.finish){
			AudioEvent.trigger("sound","welcome");
			//游戏继续时,如果未抓取到正确目标水果，则开启目标水果语音
			if(holdTarget&&!holdSuccess){
				clearTimeout(fruitSTO);
				fruitSTO = setTimeout(targetFruitSound.bind(holdTarget),2.5);
			}
			UIManager.showPause(v,function(){});
			//设置游戏开始时间为取消暂停状态的时间,保证游戏倒计时正确
			startTime = Date.now();
			//保证dTime计算正确,
			lastTime = startTime;
			oFlag.pause =false;
		}
	}

	/**
	 * 监测到扔的动作
	 * @param pos
	 */
	function throwAction(pos){
		if (!oFlag.pause&&!oFlag.finish) {
			//获取目标节点
			if (bulletOptState == "throw") {
				if(!isHitting){
					var node = UFOManager.getTarget();
					if (node) {
						//水果模块将水果扔出
						isHitting = true;
                        //暂停录入数据
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
	 * 获取游戏中各状态事件
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
	 * 随机播放一种特效
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
	 * 击中瞬间
	 */
	function hitting(){
		if(isHitting){
			isHitting = false;
			//通知飞船被撞击
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
						//产生新水果
						toHoldFruit();
						//清除UFO
						UFOManager.clearUFO();
						isHitting = false;
					}
				})
			}
		}
	}

	/**
	 * 水果消失
	 */
	function fruitDisappear(){
		//水果完全消失，未正确获取水果，则重新生成水果
		if(!holdSuccess){
			ScoreManager.fruitCount();
			ScoreManager.fruitCatch(0);
			FruitManager.createFruit(holdTarget);
		}else{
			//通知创建UFO
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
	 * 抓到水果
	 * @param fruit
	 */
	var curBullet = "";
	function getFruit(fruit){
		++number;
		if(fruit==holdTarget){
			ScoreManager.fruitCount();
			ScoreManager.fruitCatch(number);
			//标识正确获取了水果
			holdSuccess = true;
			//将目标水果置空
			curBullet = fruit;
			holdTarget = "";
			//清除播放目标水果名称的定时器
			clearTimeout(fruitSTO);
			AudioEvent.trigger("sound","chooseSuccess");
			ActionManager.clearAction();
			AudioEvent.trigger("sound","fillBullet");
			UIManager.fillBullet(fruit,function(v){
				if(v&&UIManager.getBullet()){
					setBulletOptState("throw");
					ActionManager.changeAction("throw");
					UFOManager.startSelect();
					//通知可以开始录入数据了
//					CollectSkeData.pause(false);
				}
			});
		}else{
			AudioEvent.trigger("sound","chooseFailed");
		}
	}

	/**
	 * 设置弹药的操作状态，投掷("throw") 或 抓取("get")
	 * @param s
	 */
	function setBulletOptState(s){
		if(bulletOptState!=s){
			bulletOptState = s;
		}
	}

	/**
	 * 随机出目标水果
	 */
	function randomFruit(){
		holdTarget = fruits[Math.floor(Math.random()*fruits.length)].name;
	}

	/**
	 * 开启目标水果音效,每隔5秒种播放一次，正确获取水果后将被停止。
	 * @param target
	 */
	function targetFruitSound(target){
		AudioEvent.trigger("sound",holdTarget);
		clearTimeout(fruitSTO);
		fruitSTO = setTimeout(targetFruitSound.bind(target),4);
	}

	/**
	 * 进入获取水果的游戏状态
	 */
	function toHoldFruit(){
		//随机目标水果
		randomFruit();
		//标识未正确获取了水果
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
	 * 退出游戏
	 */
	function destroyGame(){
        UIManager.showScore(false,null,function(){});
		ScoreManager.destroy();
		UFOManager.destroy();
        PlayerImageManager.reset();
        UIManager.destroy();
		gameState="reStart";        //修改游戏状态
		enterGame();
	}

	/**
	 * 全局只有一个Timer,方便游戏暂停功能实现
	 */
	function globalTimer(t){
		if(state&&!oFlag.pause){
			if(!oFlag.finish){
				//游戏开始或继续至游戏暂停或结束为一个小段,已经用过的时间=小段1+小段2+小段3+....小段n
				//游戏剩余时间 = 总时间-((当前时间-开始时间)+已经用过的时间)
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
					//停止区域检测的提示
					ActionManager.enabled(false);
					//清除目标水果音效的轮循检测
					clearTimeout(fruitSTO);
					FruitManager.destroy();
					UFOManager.destroy();
					var sData = ScoreManager.getScore();
					DBManager.save(sData, function (data) {
						UIManager.showScore(true, sData);
                        timeOutID=setTimeout(destroyGame, destroyTime);
                        ActionManager.clearAction();    //清空行为
                        ActionManager.changeAction("handsHold");    //改变行为
					});
					AudioEvent.trigger("music","score",false);
//					CollectSkeData.pause(true);             //暂停录入数据
//					var datas = CollectSkeData.getSkeData();  //获取数据
//					if (datas && datas.length > 0) {
//						DBManager.saveSkeData(datas);       //保存数据
//					}
				}
			}
			TimerEvent.trigger("time",t,(t-lastTime));
			lastTime = t;
		}
	}

    function exitBrowser(actionStatus,spine){
        if(actionStatus&&actionStatus=="on"){
            Browser.command(32821); //退出
        }
    }

	/**
	 * 进入游戏流程
	 */
	function enterGame(){
//		clearTimeout(timeOutID);
		gameState = "game";
		PlayerImageManager.check(true);
		SceneManager.loadScene("game",function(){
			//游戏开始音效
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
//            CollectSkeData.init();      //收集投掷的骨骼数据模块初始化
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
//            CollectSkeData.destroy();      //收集投掷的骨骼数据销毁
            LogoManager.destroy();
            TrainManager.destroy();
            StoryManager.destory();
			state = false;
		}
	};
});