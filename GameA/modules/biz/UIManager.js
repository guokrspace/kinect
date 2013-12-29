/**
 * Created with JetBrains WebStorm.
 * User: zhangzd
 * Date: 13-1-22
 * Time: 下午3:49
 */

define(function (require, exports, module) {
	var root = this, state = false,getNode = false,resLoaded = false,
		log = require("core/Logger").getLog(),
		ResourceLoader = require("node/ResourceLoader"),
		UFOUIConfig = require("../config/UFOUIConfig"),
		TimerEvent = require("core/Event").getInstance("Timer"),
		Timer = require("core/Timer"),TimerId = -1,
        Config=require("./fruit/Config3"),
        Pool=require("node/NodeCachePool"),
        targetBullets = [],     //用于存储加载的贴图资源的标识
		globalBg,       //UI背景
		indexWin,   //开始界面的按钮组
		keepOut,        //半透遮挡组
		popupWin,       //弹出窗口组
//		popupPause,     //暂停UI
		popupScore,     //游戏结果UI
		gameWin,        //游戏主界面
		GlobalTimeUI,   //游戏时间UI
		BulletsUI,      //弹药UI
		TargetUI,       //目标水果UI
		AniUI,          //加分UI
		ScoreUI,        //得分UI
		RightRatioUI,   //正确率UI
//		ResultUI,       //游戏结果
//		endWin,         //再玩一次或退出
		tempPauseUI,pauseUIBorder,
		totalNum = 5,useNum = 0,aniStartTime = Date.now(),aniScoreFlag = false,
		oType = {
			//只为保证程序正常运行,具体对应贴图需要UI
            "apple":{"texture":"set:FRUIT image:pingguo"},
            "banana":{"texture":"set:FRUIT image:xiangjiao"},
            "orange":{"texture":"set:FRUIT image:chengzi"},
            "grapes":{"texture":"set:FRUIT image:putao"},
            "tomato":{"texture":"set:FRUIT image:xihongshi"},
            "cucumber":{"texture":"set:FRUIT image:huanggua"},
            "coconut":{"texture":"set:FRUIT image:yezi"},
            "lemon":{"texture":"set:FRUIT image:ningmeng"},
            "carrot":{"texture":"set:FRUIT image:huluobo"},
            "strawberry":{"texture":"set:FRUIT image:caomei"},
            "watermelon":{"texture":"set:FRUIT image:xigua"},
            "pineapple":{"texture":"set:FRUIT image:boluo"}
		};
	function getNodes(){
		if(!getNode){
			globalBg = SFNode.get("globalBg");

			indexWin = SFNode.get("indexWin");

			popupWin = SFNode.get("popupWin");
//			popupPause = SFNode.get("popupPause");
			popupScore = SFNode.get("popupScore");
//			ResultUI = SFNode.get("showmsg");

			gameWin = SFNode.get("gameWin");
			BulletsUI = SFNode.get("bullets");
			ScoreUI = SFNode.get("score");
			RightRatioUI = SFNode.get("rightRatio");
			TargetUI = SFNode.get("targetBullet");
			GlobalTimeUI = SFNode.get("globalTime");
			AniUI = SFNode.get("aniUI");

			keepOut = SFNode.get("keepOut");
//			endWin=SFNode.get("endWin");

			tempPauseUI = SFNode.get("tempPauseUI");
			pauseUIBorder = tempPauseUI.children[0];
			getNode = true;
		}
	}
	var fraction= 0;
	function aniAddScore(t){
		if(aniScoreFlag){
			fraction = t-aniStartTime;
			if(fraction>0.8){
				AniUI.alpha = 0;
				AniUI.position[1] = 0;
				aniScoreFlag = false;
			}else{
				AniUI.alpha = 1-fraction;
				AniUI.position[1]=-0.4*fraction;
			}
		}
	}

	function loadUI(callback){
		ResourceLoader.load([
			{type:"ui", uri:"gameUI.cc6", depends:[{"set":"FRUIT","code":1},{"set":"Index","code":1},{"set":"Game","code":1},{"set":"UI","code":7}]}
		], function () {
			getNodes();
			callback&&callback();
		});
	}

	function delay(time,callback,args){
		var startTime = Date.now();
		var delay = function(t){
			if((t-startTime)>time){
				TimerEvent.unbind("time",delay);
				callback&&callback(args);
			}
		};
		TimerEvent.bind("time",delay);
	}

	exports.showIndex = function(callback){
		if(state){
			globalBg.properties[1] = "set:UI_index image:bg";
			indexWin.visible = true;
			popupWin.visible = false;
			gameWin.visible = false;
			keepOut.visible = false;
			callback&&callback();
		}
	};

	exports.showGame = function(callback){
		if(state){
			globalBg.properties[1] = "set:UI_game image:bg";
			indexWin.visible = false;
			gameWin.visible = true;
			popupWin.visible = false;
			keepOut.visible = false;
			callback&&callback();
		}
	};

	exports.showPause = function(v,callback){
		if(state){
			if(v){
				keepOut.visible = true;
//				popupPause.visible = true;
				popupScore.visible = false;
//				popupWin.visible = true;
				tempPauseUI.visible = true;
				TimerId = Timer.bindFraction(0.5,function(){},function(){pauseUIBorder.visible = !pauseUIBorder.visible;return true;})
			}else{
				keepOut.visible = false;
//				popupPause.visible = false;
				popupScore.visible = false;
//				popupWin.visible = false;
				tempPauseUI.visible = false;
				Timer.clear(TimerId);
			}
			callback&&callback();
		}
	};

	exports.showScore = function(v,data,callback){
		if(state){
			if(v){
//				ResultUI.text = '命中外星飞船 '+(data.hit)+' 次\n水果选择错误 '+(data.fine+data.common+data.fail)+' 次';
				var ratio = data.perfect/(data.perfect+data.fine+data.common+data.fail);
				ScoreUI.text = data.sumScore;
				RightRatioUI.text = Math.round(ratio*100)+"%";
				if(ratio>0.9){
					popupScore.properties[1] = "set:_file image:../Over/good.jpg";
				}else{
					popupScore.properties[1] = "set:_file image:../Over/normal.jpg";
				}
				Timer.bindFraction(0.5,function(f){
					popupScore.alpha = f;
				});
//				keepOut.visible = true;
//				popupPause.visible = false;
				popupScore.visible = true;
				popupWin.visible = true;
			}else{
//				keepOut.visible = false;
//				popupPause.visible = false;
				popupScore.visible = false;
				popupWin.visible = false;
				popupScore.alpha = 0;
			}
			callback&&callback();
		}
	};
	exports.scoreAni = function(score){
		if(state){
			AniUI.text = "+ "+score;
			AniUI.alpha = 1;
			aniScoreFlag = true;
			aniStartTime = Date.now();
		}
	};

	/**
	 * 改变成绩显示
	 * @param type
	 * @param text
	 */
	exports.changeText = function(score){
		if(state){
//			ScoreUI.text = "SCORE:"+score;
		}
	};

	exports.changeTime = function(second){
		if(state){
			var minute = Math.floor(second/60);
			minute = minute>9?minute:('0'+minute);
			var second = second%60;
			second = second>9?second:('0'+second);
			GlobalTimeUI.text = minute+":"+second;
		}
	};

	/**
	 * 填装子弹
	 * @param type
	 */
    var curType,fillBulletStartTime,fillBulletStartFlag=true;
	exports.fillBullet = function(type,callback){
		if(state){
			var success = false;
            curType=type;
			if(oType[type]){
				totalNum = BulletsUI.children.length;
				useNum = 0;
                fillBulletStartTime=Date.now();
                fillBulletStartFlag=true;
                TimerEvent.bind("time",play_se_fill_bullet);
				success = true;
				TargetUI.alpha = 1;
			}
			delay(2.5,callback,success);
		}
	};
    //填充弹药仓的特效
    var show_time=0.2,ani_time=0.5,ani_double_time=0.3,delay_time=0.25;
    var dump_delay_time=0.8,dump_duration_time=0.15,dump_time=0.3;
    var initSize=new SFVec2f(1,1);
    var haloSize=new SFVec2f(1,1);
    var fillBulletArray=[];
    function play_se_fill_bullet(t,dt){
        var len=BulletsUI.children.length;
        for(var i=0;i<len;i++){
            var item=BulletsUI.children[i];
            item.children[0].properties[1] = oType[curType].texture;
            if(fillBulletStartFlag){
                var obj={
                    "item":item,
                    "startTime": Date.now(),
                    "delay":[(len-i)*delay_time,(len-i)*dump_duration_time+dump_delay_time]
                };
                fillBulletArray[i]=obj;
            }
            show_bullet(t,fillBulletArray[i]);
            dump_bullet(t,fillBulletArray[i]);
        }
        fillBulletStartFlag=false;
        if(t-fillBulletStartTime>=2.3){
            TimerEvent.unbind("time",play_se_fill_bullet);
        }
    }
    function bindFraction(t,startTime,totalTime,oftenCallback,lastCallback){
        var dt=t-startTime;     //时间差
        var f=dt/totalTime;     //进程
        if(f>=1){
            f=1;
            lastCallback();     //只能执行一次
        }else{
            oftenCallback(f);
        }
    }
    //弹药出现的特效
    function show_bullet(t,obj,callback){
        if(fillBulletStartFlag){
            obj.item.children[0].size.setValue(0,0);
            obj.item.visible=true;
            obj.isShowFlag1=false;
            obj.isLast1=false;
        }
        var totalTime=obj.delay[0]+show_time+ani_time+ani_double_time;
        bindFraction(t,obj.startTime,totalTime,function(f){
//            log.info(delay+"==startTime="+startTime);
//            log.info(delay+"t="+t);
            var time = totalTime * f;   //转换成时间
            if(time<=obj.delay[0]){    //延迟时期
                //no-do
            }else if(time<=obj.delay[0]+show_time){    //水果由小变大显示
                var sizeRatio=getLineValue(f,[obj.delay[0]/totalTime,(obj.delay[0]+show_time)/totalTime],[0.5,1]);
                obj.item.children[0].size.setValue(new SFVec2f(sizeRatio*initSize.x,sizeRatio*initSize.y));
            }else if(time<=totalTime-ani_double_time){  //水果的光环扩大的效果
                if(!obj.isShowFlag1){  //显示
                    obj.item.children[1].visible=true;
                    obj.item.children[1].properties[1]="set:_file image:../FRUIT/halo.png";
                    obj.isShowFlag1=true;
                }else{
                    var haloSizeRatio=getLineValue(f,[(obj.delay[0]+show_time)/totalTime,(totalTime-ani_double_time)/totalTime],[1,4]);
                    var haloAlpha=getLineValue(haloSizeRatio,[1,4],[1,0]);
                    obj.item.children[1].size.setValue(new SFVec2f(haloSizeRatio*haloSize.x,haloSizeRatio*haloSize.y));
                    obj.item.children[1].alpha=haloAlpha;
                }
            }else if(time<totalTime){
                var haloDoubleSizeRatio=getLineValue(f,[(totalTime-ani_double_time)/totalTime,1],[1,3]);
                var haloDoubleAlpha=getLineValue(haloDoubleSizeRatio,[1,3],[0.3,0]);
                obj.item.children[1].size.setValue(new SFVec2f(haloDoubleSizeRatio*haloSize.x,haloDoubleSizeRatio*haloSize.y));
                obj.item.children[1].alpha=haloDoubleAlpha;
            }
        },function(){
            if(!obj.isLast1){
                obj.isLast1=true;
                obj.item.children[0].size.setValue(initSize);
                obj.item.children[1].visible=false;
                obj.item.children[1].properties[1]="set:UI image:color_blank";
                callback&&callback();
            }
        });
    }
    //弹药上弹的特效
    function dump_bullet(t,obj,callback){
        if(fillBulletStartFlag){
            obj.isLast2=false;
        }
        var totalTime=obj.delay[1]+dump_time;
        bindFraction(t,obj.startTime,totalTime,function(f){
            var time = totalTime * f;   //转换成时间
            if(time<=obj.delay[1]){    //延迟时间
                //no-do
            }else if(time<=totalTime){
                var heightRatio=getLineValue(f,[obj.delay[1]/totalTime,(obj.delay[1]+dump_time/2)/totalTime,1],[0,-0.3,0]);
                obj.item.children[0].position.setValue(0,heightRatio);
            }
        },function(){
            if(!obj.isLast2){
                obj.isLast2=true;
                obj.item.children[0].position.setValue(0,0);
                callback&&callback();
            }
        });
    }
    /**
     * 通过源值，源的变化范围，目标值的变化范围求出目标值
     * @param source:已知的源值
     * @param sRange:源的变化范围
     * @param tRange:目标的变化范围
     * 注意：保持sRange和tRange的长度相同，否则将取长度最小的为
     * 比较的范围的长度。sRange的数值必须呈递增趋势
     */
    function getLineValue(source,sRange,tRange){
        var minLen=Math.min(sRange.length,tRange.length);
        for(var i=0;i<minLen-1;i++){
            if(source>=sRange[i]&&source<=sRange[i+1]){ //原值是从sRange[i]变到sRange[i+1]
                //目标值就是从tRange[i]变到tRange[i+]
                return (source-sRange[i+1])*(tRange[i+1]-tRange[i])/(sRange[i+1]-sRange[i])+tRange[i+1];
            }
        }
        if(source<sRange[0]){
            return tRange[0];
        }else if(source>sRange[minLen-1]){
            return tRange[minLen-1]
        }else{
            return null;
        }
    }



	/**
	 * 显示目标水果
	 */
	exports.fillTarget = function(target,callback){
		if(state){
			if(oType[target]){
				TargetUI.alpha = 0.6;
                if(TargetUI.properties[1]!=resNodeName){
                    TargetUI.properties[1]=resNodeName;
                }
                var fileName=getFruitByFileName(target);
                if(fileName){
                    textureNode.scene.scale.setValue(fileName.scale,fileName.scale,fileName.scale);
                    var index = targetBullets.indexOf(target);
                    if(index!=-1){
                        targetSwi.whichChoice = index;
                    }else{
	                    textureNode.refresh = false;
                        var fruit=Pool.create(fileName.file,"Transform {children[s%]}",path);
                        if(fruit){
                            targetSwi.choice[targetBullets.length] = fruit.node;
                            targetSwi.whichChoice = targetSwi.choice.length-1;
                            targetBullets.push(target);
                        }else{
                            TargetUI.properties[1]="set:UI image:color_blank";
                        }
	                    setTimeout(function(){textureNode.refresh = true;},0.5);
                    }
                }else{
                    TargetUI.properties[1]="set:UI image:color_blank";
                }

			}
			delay(1,callback);
		}
	};

    //通过name获取水果节点
    function getFruitByFileName(fruitName){
        var fruits=Config.fruits;
        var fruit=null;
        for(var i=0;i<fruits.length;i++){
            fruit=fruits[i];
            if(fruit.name==fruitName){
                return fruit;
            }
        }
        return null;
    }

	/**
	 * 消耗一颗子弹,没有子弹时返回null
	 */
	exports.getBullet = function(){
		if(state){
			var flag;
			if(useNum<totalNum){
				BulletsUI.children[useNum].visible = false;
                BulletsUI.children[useNum].children[0].size.setValue(0,0);
				useNum++;
				flag = true;
			}
			return flag;
		}
	};

	exports.clear = function(){
		if(state){
			//globalBg.visible = false;
		}
	};

	exports.init = function (callback) {
		if (!state) {
			totalNum = 0;
			useNum = 0;
			aniScoreFlag = false;
			TimerEvent.bind("time",aniAddScore);
			state = true;
			loadRes();      //主要是为了添加贴图节点资源
			loadUI(callback);
		}
	};
    /**
     * 加载贴图资源
     */
    var resNodeName="bulletTexture";       //场景贴图节点的名字
    var path="/resources/models/fruits/";    //场景实体节点的路径
    var textureNode,targetSwi;
    function loadRes(){
        if(!resLoaded){
            var textureStr="Group {children [DEF "+resNodeName+" SceneTexture{refresh false backgroundColor 1 1 1 0 transparencyFunction ALPHA_BLEND scene  Transform {scale 2.5 2.5 2.5 children [Switch{choice[] whichChoice -1}]}}]}";
	        var node = new SFNode(textureStr);
            textureNode=node.children[0];
            targetSwi = textureNode.scene.children[0];
	        GROUPMID.addChild(node); //将贴图节点添加到环境中
            resLoaded = true;
        }
    }
	exports.destroy = function () {
		if (state) {
//			ScoreUI.text = "SCORE:0";
			GlobalTimeUI.text = "02:00";
			for(var i= 0,len = BulletsUI.children.length;i<len;i++){
				BulletsUI.children[i].children[0].properties[1] = "set:UI image:color_blank";
				BulletsUI.children[i].visible = false;
			}
			TargetUI.properties[1]="set:UI image:color_blank";
//            textureNode.refresh = false;    //刷新贴图
            targetSwi.whichChoice = -1;
			AniUI.text = "";
			TimerEvent.unbind("time",aniAddScore);
			state = false;
		}
	};
});