/**
 * Created with JetBrains WebStorm.
 * User: zhangzd
 * Date: 13-1-22
 * Time: 下午3:54
 */

define(function (require, exports, module) {
	var root = this, state = false,
		log = require("core/Logger").getLog(),
		scoreNode,scoreTextNode,
		oScore={"sumScore":0},
		result = {"sumScore":0,"hit":0,"count":0,"perfect":0,"fine":0,"common":0,"fail":0,"time":0.0},
		list=[],
		listName_E=["level","sumScore","hit","count","perfect","fine","common","fail"],
		listName=["名次","得分","击毁","水果","优秀","良好","及格","失败"];//与listName_E顺序必须对应
	/**
	 * 创建Switch组，存放成绩信息
	 */
	function createSwitchNode(){
		var scoreNodeStr='Switch {choice [] whichChoice -1}';
		scoreNode=new SFNode(scoreNodeStr);
		GROUPMID.addChild(scoreNode);
	}
    //绘制成绩
    function createTextNode(initScore){
        var scoreTextStr='Transform {translation 0 1.5 -15 children[BaseColor {rgb 0 1 0} Font{name "黑体" size 0.4} Text3 {string["成绩"] justification CENTER spacing 1.2}]}';
        scoreTextNode=new SFNode(scoreTextStr);
        scoreTextNode.children[2].string[1]=initScore;
	    scoreNode.children[0].choice[0]=scoreTextNode;
        //log.info("#scoreNode:"+scoreNode);
    }
	/**
	 * 绘制排行榜标题
	 */
	function createListTitle(){
		var title='Transform {translation -2.3 0.5 -15 children[BaseColor {rgb 1 1 1} Font{name "黑体" size 0.3} Text3 {string["排行榜"]}]}';
		var listTitle=new SFNode(title);
		scoreNode.children[0].choice[1]=listTitle;
	}
	/**
	 * 绘制排行榜信息
	 */
	function createList(){
		var listStr='Transform {translation -2.1 0.2 -15 children[BaseColor {rgb 1 1 1} Font{name "黑体" size 0.2} ] }';
		var listNode=new SFNode(listStr);
		var curX=0;
		for(var i= 0,len=listName.length;i<len;i++){
			var str='Transform { children[ Text3 {string[ "" ] justification CENTER spacing 1.2 }]}';
			var nameNode=new SFNode(str);
			nameNode.translation.x=curX;
			curX+=0.6;
			nameNode.children[0].string[0]=listName[i];
			list.push(nameNode);
			listNode.children[i+2]=nameNode;
		}
		scoreNode.children[0].choice[2]=listNode;
	}
	/**
	 * 绘制成绩排行信息
	 */
	function createScoreText(){
		createSwitchNode();
		createTextNode(0);
		createListTitle();
		createList();
	}
    //显示成绩单
    function showTextNode(isShow,data){
        if(isShow){
            scoreTextNode.children[2].string[1]=oScore.sumScore;
	        setScoreList(data);
            scoreNode.children[0].whichChoice=-3;
        }else{
            scoreNode.children[0].whichChoice=-1;
        }
    }
	//成绩排行
	function setScoreList(data){
		var curResult;
		for(var i= 0,len=data.length;i<len;i++){
			curResult=data[i];
			list[0].children[0].string[i+1]=i+1;
			for(var j= 1,length=list.length;j<length;j++){
				list[j].children[0].string[i+1]=curResult[listName_E[j]];
			}
		}
	}
	/**
	 * 水果获取状态
	 * 暂定如下：
	 *      1:perfect, 2:fine, 3:common, 0:fail
	 * @param number
	 */
	exports.fruitCatch =function(number){
		if(state){
			switch(number){
				case 0:
					result.fail+=1;
					break;
				case 1:
					result.perfect+=1;
					break;
				case 2:
					result.fine+=1;
					break;
				case 3:
					result.common+=1;
					break;
			}
		}
	};
	/**
	 *统计水果出现次数
	 */
	exports.fruitCount = function(){
		if(state){
			result.count++;
		}
	};
	/**
	 *统计被打死的飞船的数量
	 */
	exports.UFOCatch = function(){
		if(state){
			result.hit++;
		}
	};

	exports.record = function(obj,callback){
		if(state){
			if(obj){
				if(oScore[obj.type]){
					oScore[obj.type].score+=obj.score;
				}else{
					oScore[obj.type] = {"type":obj.type,"score":obj.score};
				}
				oScore.sumScore += obj.score;
				callback&&callback(oScore,obj.type);
			}else{
				callback&&callback();
			}
		}
	};
	/**
	 * 返回本次游戏记录
	 * @return {Object}
	 */
	exports.getScore = function(){
		if(state){
			result.time=Date.now();
			result.sumScore=oScore.sumScore;
			return result;
		}
	};

	/**
	 * 显示成绩
	 * @param v
	 */
	exports.showScore = function(isShow,data){
		if(state){
			if(!scoreNode){
				createScoreText();
			}
			showTextNode(isShow,data);
		}
	};

	exports.clear = function(){
		if(state){
			oScore = {"sumScore":0};
			result = {"sumScore":0,"hit":0,"count":0,"perfect":0,"fine":0,"common":0,"fail":0,"time":""};
			list=[];
		}
	};

	exports.init = function () {
		if (!state) {
			createScoreText();
			state = true;
		}
	};

	exports.destroy = function () {
		if (state) {
            if(scoreNode){
	            exports.clear();
                scoreNode.children[0].whichChoice=-1;
                GROUPMID.removeChild(scoreNode);
            }
			state = false;
		}
	};
});
