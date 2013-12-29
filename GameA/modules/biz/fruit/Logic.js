/**
 * Created by JetBrains WebStorm.
 * User: Administrator
 * Date: 12-1-31
 * Time: 下午3:26
 */
define(function (require, exports, module) {
    var root = this, state = false,
        log = require("core/Logger").getLog();
    var Pool=require("node/NodeCachePool"),
        Config=require("./Config"),                 //配置类
        Timer=require("core/Timer"),                //计时器
        TimerEvent=require("core/Event").getInstance("Timer"),     //时间事件
        GameEvent=require("core/Event").getInstance("GameEvent"),
        ActionEvent=require("core/Event").getInstance("ActionEvent"),
        C=require("./Calculate");       //数学相关的算法
    var fruitResPath = "/resources/models/fruits/",
        tranUFOResPath="/resources/models/tranUFO/";              //资源的文件名和路径
    /*外部配置*/
    var defaultArea=Config.area,
        defaultVisual=Config.visual,
        defaultSpeed=Config.speed;
    /*内部配置*/
    var ufoFruitGap=-1.2;
    /*业务逻辑*/
    var group,timerFunc;
    var fruitArray=[];                                              //水果和运输飞船对象的数组
    var ammoArray=[];                                               //水果弹药的数组
    var selectFruitName;                                            //正确选择的水果名
    var rightHandLocation;                                          //右手的位置
    var pause=false;                                               //内部暂停游戏的标识符。
    /*测试用*/
    var debug=(Config.mode=="debug")?true:false;                  //测试模式
    var testRightHand=new SFVec3f(0,0,-10);
    var SystemEvent=require('events/SystemEvent');
    var Keycode=require("utils/Keycode");
    var targetNode;                                                 //测试用的目标节点
    function test(){
        SystemEvent.bind("keyUp",function(v){
            if(v==Keycode.NUM1){
                getFruit(C.calRadian(66),testRightHand,true);
            }else if(v==Keycode.NUM2){
                getFruit(C.calRadian(82),testRightHand,true);
            }else if(v==Keycode.NUM3){
                getFruit(C.calRadian(90),testRightHand,true);
            }else if(v==Keycode.NUM4){
                getFruit(C.calRadian(98),testRightHand,true);
            }else if(v==Keycode.NUM5){
                getFruit(C.calRadian(135),testRightHand,true);
            }else if(v==Keycode.NUM6){
                getFruit(C.calRadian(90),testRightHand,false);
            }else if(v==Keycode.NUM0){
                selectFruitName = Config.fruits[Math.floor(Math.random()*Config.fruits.length)].name;
                exports.hurlUFO(testRightHand,targetNode);
            }else if(v==Keycode.S){
                var holdTarget = Config.fruits[C.getRandomIntNum(0,Config.fruits.length-1)].name;
                exports.createFruit(holdTarget);
            }else if(v==Keycode.R){
                //重新初始化
                exports.destroy();
                exports.init();
            }else if(v==Keycode.P){
                exports.pause(!pause);
            }
        });
    }
    //测试用
    function simulateUFO(){
        var nodeStr="Transform {translation -8 0 -55 children[Material{diffuseColor 1 0 0} Box{size 0.6 0.6 0.6}]}";
        targetNode=new SFNode(nodeStr);
        group.children[0].addChild(targetNode);
        Timer.bindFraction(8,function(f){
            if(f<=0.5){
                targetNode.translation=new SFVec3f(32*(f-0.5)+8,0,-75);
            }else{
                targetNode.translation=new SFVec3f(32*(1-f)-8,0,-75);
            }
        },function(){
            return true;
        });
    }

    exports.init = function () {
        if (!state) {
            state = true;
            initView();
            initData();
            enabledEvents(true);
            if(debug){
                exports.createFruit("pingguo");
                test();
                simulateUFO();
            }
        }
    };
    exports.pause=function(isPause){
        pause=isPause;
    }

    //定义一个时间驱动方法，其中参数dt为两次进入该方法的时间差
    function timerDriver(dt){
        var fruitObj=null;
        for(var i=0;i<fruitArray.length;i++){
            fruitObj=fruitArray[i];
            switch(fruitObj.status){
                case "create":      //创建状态
                    dealCreate(fruitObj,dt);
                    break;
                case "go":          //行进状态
                    dealGo(fruitObj,dt);
                    break;
                case "quickGo":     //快速行进状态
                    dealQuickGo(fruitObj,dt);
                    break;
                case "simmer":      //一触即发的状态
                    dealSimmer(fruitObj,dt);
                    break;
                case "yield":       //让步（放弃）状态
                    dealYield(fruitObj,dt);
                    break;
                case "fight":       //争夺状态
                    dealFight(fruitObj,dt);
                    break;
                case "win-success": //正确获取状态
                    dealWinSuccess(fruitObj,dt);
                    break;
                case "win-fail":    //错误获取状态
                    dealWinFail(fruitObj,dt);
                    break;
                case "escape":      //逃逸状态
                    dealEscape(fruitObj,dt);
                    break;
                case "leave":       //离开状态
                    dealLeave(fruitObj,dt);
                    break;
            }
        }
        var ammoObj=null;
        for(var i=0;i<ammoArray.length;i++){
            ammoObj=ammoArray[i];
            switch(ammoObj.status){
                case "create":
                    ammoObj.setStatus("hurl");
                    break;
                case "hurl":
                    dealHurl(ammoObj,dt);
                    break;
                case "hit":
                    dealHit(ammoObj,dt);
                    break;
            }

        }
    }
    /*状态支配行为*/
    function dealCreate(fruitObj,dt){
        fruitObj.setStatus("go");
    }
    function dealGo(fruitObj,dt){
        //获取moveObj
        var moveObj={   //注意source的顺序不可颠倒，source[0]为主题源
            "type":"linear",
            "source":[fruitObj.entity.ufo.node,fruitObj.entity.fruit.node],      //移动的源
            "target":fruitObj.entity.ufo.endLocation,      //移动的目标，可以是位置或节点
            "speed":fruitObj.speed.goSpeed,
            "args":null,
            "startSpeed":defaultSpeed.goSpeed.v0,                    //初速度
            "maxSpeed":defaultSpeed.goSpeed.v1,                      //结束速度
            "eRange":defaultSpeed.goSpeed.e                       //误差范围
        };
        var isArrive=C.move(moveObj,dt);
        if(isArrive){   //到达
            fruitObj.setStatus("leave");
        }
    }
    function dealQuickGo(fruitObj,dt){
        //获取moveObj
        var moveObj={   //注意source的顺序不可颠倒，source[0]为主题源
            "type":"linear",
            "source":[fruitObj.entity.ufo.node,fruitObj.entity.fruit.node],      //移动的源
            "target":fruitObj.entity.ufo.endLocation,      //移动的目标，可以是位置或节点
            "speed":{
                "v":new SFVec3f(0,0,8*defaultSpeed.goSpeed.v1),
                "a":0,
                "af":0
            },
            "args":null,
            "startSpeed":8*defaultSpeed.goSpeed.v1,                    //初速度
            "maxSpeed":8*defaultSpeed.goSpeed.v1,                      //结束速度
            "eRange":defaultSpeed.goSpeed.e                       //误差范围
        };
        var isArrive=C.move(moveObj,dt);
        if(isArrive){   //到达
            fruitObj.setStatus("leave");
        }
    }
    function dealLeave(fruitObj,dt){
        //将obj中groupNode从group中删除
        group.children[0].removeChild(fruitObj.entity.group);
        Pool.remove(fruitObj.entity.fruit.id);
        Pool.remove(fruitObj.entity.ufo.id);
        //将obj从FruitArray中删除
        C.remove(fruitArray,fruitObj);
        //log.info("现在还剩"+fruitArray.length);
        if (fruitArray.length==0) {
            //log.info("完结了");
            GameEvent.trigger("stateEvent", "fruitDisappear");
        }
    }
    function dealSimmer(fruitObj,dt){
        //TO-DO
    }
    function dealFight(fruitObj,dt){
        if(fruitObj.previousStatus!="fight"){   //前一次状态不是争斗状态
            fruitObj.speed.fightSpeed={
                "v":new SFVec3f(defaultSpeed.fightSpeed.v0,0,0),
                "a":defaultSpeed.fightSpeed.a,
                "af":defaultSpeed.fightSpeed.af
            };
        }
        fruitObj.setStatus("fight");
        //获取moveObj
        var moveObj={   //注意source的顺序不可颠倒，source[0]为主题源
            "type":"linear",
            "source":[fruitObj.entity.fruit.node],      //移动的源
            "target":rightHandLocation,                   //移动的目标，可以是位置或节点
            "speed":fruitObj.speed.fightSpeed,
            "args":null,
            "startSpeed":defaultSpeed.fightSpeed.v0,                //初速度
            "maxSpeed":defaultSpeed.fightSpeed.v1,                  //结束速度
            "eRange":defaultSpeed.fightSpeed.e                       //误差范围
        };
        var isArrive=C.move(moveObj,dt);
        if(isArrive){   //到达
            fruitObj.entity.group.whichChoice=0;     //隐藏水果
            if(fruitObj.fruitName==selectFruitName){
                //log.info("正确获取");
                fruitObj.setStatus("win-success");
            }else{
                fruitObj.setStatus("win-fail");
                //log.info("错误获取");
            }
            GameEvent.trigger("getFruit",fruitObj.fruitName);
        }

    }
    function dealYield(fruitObj,dt){
        if(fruitObj.previousStatus!="yield"){
            fruitObj.speed.yieldSpeed={
                "v":new SFVec3f(defaultSpeed.yieldSpeed.v0,0,0),
                "a":defaultSpeed.yieldSpeed.a,
                "af":defaultSpeed.yieldSpeed.af
            };
        }
        fruitObj.setStatus("yield");
        //获取moveObj
        var moveObj={   //注意source的顺序不可颠倒，source[0]为主题源
            "type":"linear",
            "source":[fruitObj.entity.fruit.node],      //移动的源
            "target": calFruitLocation(fruitObj.entity.ufo.node.translation),  //移动的目标，可以是位置或节点
            "speed":fruitObj.speed.yieldSpeed,
            "args":null,
            "startSpeed":defaultSpeed.yieldSpeed.v0,                    //初速度
            "maxSpeed":defaultSpeed.yieldSpeed.v1,                      //结束速度
            "eRange":defaultSpeed.yieldSpeed.e                       //误差范围
        };
        var isArrive=C.move(moveObj,dt);
        if(isArrive){
            fruitObj.setStatus("go");
        }
    }
    function dealWinSuccess(fruitObj,dt){
        for(var i=0;i<fruitArray.length;i++){
            if(fruitArray[i]==fruitObj){
                fruitObj.setStatus("escape");
            }else{
                fruitArray[i].setStatus("quickGo");
            }
        }
    }
    function dealWinFail(fruitObj,dt){
        fruitObj.setStatus("escape");
    }
    function dealEscape(fruitObj,dt){
        //获取moveObj
        var moveObj={   //注意source的顺序不可颠倒，source[0]为主题源
            "type":"linear",
            "source":[fruitObj.entity.ufo.node],      //移动的源
            "target": fruitObj.entity.ufo.startLocation,  //移动的目标，可以是位置或节点
            "speed":fruitObj.speed.escapeSpeed,
            "args":null,
            "startSpeed":defaultSpeed.escapeSpeed.v0,                    //初速度
            "maxSpeed":defaultSpeed.escapeSpeed.v1,                      //结束速度
            "eRange":defaultSpeed.escapeSpeed.e                       //误差范围
        };
        var isArrive=C.move(moveObj,dt);
        if(isArrive){
            //将obj中groupNode从group中删除
            group.children[0].removeChild(fruitObj.entity.group);
            Pool.remove(fruitObj.entity.fruit.id);
            Pool.remove(fruitObj.entity.ufo.id);
            //将obj从FruitArray中删除
            C.remove(fruitArray,fruitObj);
            //log.info("##现在还剩"+fruitArray.length);
            if (fruitArray.length==0) {
                //log.info("##完结了");
                GameEvent.trigger("stateEvent", "fruitDisappear");
            }
        }
    }
    function dealHurl(ammoObj,dt){
        var moveObj={   //注意source的顺序不可颠倒，source[0]为主题源
            "type":ammoObj.shootRoute.type,
            "source":[ammoObj.ammo.node],      //移动的源
            "target":ammoObj.target,          //移动的目标，可以是位置或节点
            "speed":ammoObj.speed,
            "args":ammoObj.shootRoute.args,
            "startLocation":ammoObj.ammo.startLocation,
            "startSpeed":defaultSpeed.hurlSpeed.v0,                    //初速度
            "maxSpeed":defaultSpeed.hurlSpeed.v1,                      //结束速度
            "eRange":defaultSpeed.hurlSpeed.e                          //误差范围
        };
        ammoObj.setStatus("hurl");
        var isArrive=C.move(moveObj,dt);
        if(isArrive){
            ammoObj.setStatus("hit");
        }
    }
    function dealHit(ammoObj,dt){
        group.children[0].removeChild(ammoObj.ammo.node);
        Pool.remove(ammoObj.ammo.id);
        C.remove(ammoArray,ammoObj);
        //调用击中函数
        GameEvent.trigger("stateEvent", "hitting");
    }

    /*生成水果的部分*/
    exports.createFruit=function(fruitName){
        /*重新生成前，初始化*/
        for(var i=0;i<fruitArray.length;i++){
            var obj=fruitArray[i];
            group.children[0].removeChild(obj.entity.group);
            Pool.remove(obj.entity.fruit.id);
            Pool.remove(obj.entity.ufo.id);
        }
        fruitArray=[];
        for(var i=0;i<ammoArray.length;i++){
            var obj=ammoArray[i];
            group.children[0].removeChild(obj.ammo.node);
            Pool.remove(obj.ammo.id);
        }
        ammoArray=[];
        /*生成逻辑*/
        var obj=null;
        var fruitAreaIndex=C.getRandomIntNum(0,defaultArea.areaNum-1);    //获取名为fruitName的水果出现的区域
        for(var i=0;i<defaultArea.areaNum;i++){
            if(i==fruitAreaIndex){
                obj=getTranUFOAndFruit(fruitName,i,1);
            }else{
                obj=getTranUFOAndFruit(fruitName,i,0);
            }
            fruitArray.push(obj);
            group.children[0].addChild(obj.entity.group);      //显示
        }
        selectFruitName=fruitName;
    };
    function initView(){
        var groupStr='DEF fruitGroup Transform {translation 0 0 0 children [Group {children [TransparencyType{value DELAYED_BLEND}]}]}';
        group=new SFNode(groupStr);
        GROUPMID.addChild(group);
    }
    function initData(){
        timerFunc=function(t,dt){
            if(!pause){
                timerDriver(dt);
            }
        };
        TimerEvent.bind("time",timerFunc);
    }
    //获得运输UFO和水果的对象,其中参数precise表示生成名为fruitName水果的精确度。
    //precise>=1表示一定生成这种水果，precise<=0表示一定不生成这种水果。precise为其他值表示任何情况
    function getTranUFOAndFruit(fruitName,areaIndex,precise){
        /*水果和运输飞船的开始位置和飞出位置*/
        var ufoStartTran,fruitStartTran,ufoEndTran,fruitEndTran;
        switch(defaultArea.algorithm.name){
            case "Far2Near":
                defaultVisual.distance=defaultVisual.face.visualFar;
                ufoStartTran=getAreaPos(defaultArea,defaultVisual,areaIndex,true);
                defaultVisual.distance=defaultVisual.face.visualNear;
                ufoEndTran=getAreaPos(defaultArea,defaultVisual,areaIndex,false);
                fruitStartTran=calFruitLocation(ufoStartTran);      //通过飞船位置计算水果位置
                fruitEndTran=calFruitLocation(ufoEndTran);
                break;
            case "Down2Top":
            case "Left2Right":
                defaultVisual.distance=defaultVisual.face.visualFace;
                ufoStartTran=getAreaPos(defaultArea,defaultVisual,areaIndex,true);
                ufoEndTran=getAreaPos(defaultArea,defaultVisual,areaIndex,false);
                fruitStartTran=calFruitLocation(ufoStartTran);      //通过飞船位置计算水果位置
                fruitEndTran=calFruitLocation(ufoEndTran);
                break;
        }
        /*创建水果和运输飞船的节点*/
        var tranUFONode,fruitNode,groupNode;
        tranUFONode=getTranUFONode();
        tranUFONode.node.translation.setValue(ufoStartTran);      //运输飞船的位置
        var fruitNodeObj=getFruitNode(fruitName,precise);
        fruitNode=fruitNodeObj.node;
        fruitNode.node.translation.setValue(fruitStartTran);     //水果弹药的位置
        var groupNodeStr="Switch{choice [] whichChoice -3}";
        groupNode=new SFNode(groupNodeStr).children[0];
        groupNode.choice[0]=tranUFONode.node;
        groupNode.choice[1]=fruitNode.node;
        /*组合成对象返回*/
        var fruitAndUFOObj={        //水果对象的格式
            "status":"create",          //水果对象的状态
            "previousStatus":null,     //水果对象的前一状态
            "fruitName":fruitNodeObj.name,     //水果的名字
            "areaIndex":areaIndex,             //水果的所属的区域
            "entity":{
                "group":groupNode,           //组节点
                "fruit":{               //水果节点
                    "id":fruitNode.id,
                    "node":fruitNode.node,
                    "startLocation":fruitStartTran,
                    "endLocation":fruitEndTran
                },
                "ufo":{                 //飞船节点
                    "id":tranUFONode.id,
                    "node":tranUFONode.node,
                    "startLocation":ufoStartTran,
                    "endLocation":ufoEndTran
                }
            },
            "speed":{           //速度，初始速度和最大速度从配置文件中获取
                "goSpeed":{
                    "v":C.getALVector(ufoStartTran,ufoEndTran,defaultSpeed.goSpeed.v0),
                    "a":defaultSpeed.goSpeed.a,
                    "af":defaultSpeed.goSpeed.af
                },
                "fightSpeed":{
                    "v":new SFVec3f(defaultSpeed.fightSpeed.v0,0,0),
                    "a":defaultSpeed.fightSpeed.a,
                    "af":defaultSpeed.fightSpeed.af
                },
                "yieldSpeed":{
                    "v":new SFVec3f(defaultSpeed.yieldSpeed.v0,0,0),
                    "a":defaultSpeed.yieldSpeed.a,
                    "af":defaultSpeed.yieldSpeed.af
                },
                "escapeSpeed":{
                    "v":new SFVec3f(defaultSpeed.escapeSpeed.v0,0,0),
                    "a":defaultSpeed.escapeSpeed.a,
                    "af":defaultSpeed.escapeSpeed.af
                }
            }   //物体初始是静止的
        };
        fruitAndUFOObj.setStatus=function(status){
            this.previousStatus=this.status;
            this.status=status;
        };
        return fruitAndUFOObj;
    }
    //通过tranUFOName获取运输飞船的节点
    function getTranUFONode(){
        var tranUFO=Config.tranUFO;
        var template="Transform { scale 0.5 0.5 0.5 children[s%]}";
        var tranUFONode=Pool.create(tranUFO.file,template,tranUFOResPath);
        return tranUFONode;
    }
    //通过fruitName获取水果节点
    function getFruitNode(fruitName,precise){
        var assignFruit=getFruitByFileName(fruitName);      //指定水果
        if(!assignFruit){
            //log.debug("#Logic.getFruitNode#不存在"+fruitName+".");
            return null;
        }
        var fruitObj=null;
        var fruitNum=Config.fruits.length;
        if(precise>=1){
            fruitObj=assignFruit;
        }else if(precise<=0){
            do{
                fruitObj=getFruitById(C.getRandomIntNum(0,fruitNum-1));
            }while(fruitObj.id==assignFruit.id);
        }else{
            fruitObj=getFruitById(C.getRandomIntNum(0,fruitNum-1));
        }
        var template="Transform {children[s%]}";
        var fruitNode=Pool.create(fruitObj.file,template,fruitResPath);
        return {"node":fruitNode,"name":fruitObj.name,"attackRoute":fruitObj.attackRoute,"id":fruitObj.id};
    }
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
    //通过id获取水果节点
    function getFruitById(id){
        var fruits=Config.fruits;
        var fruit=null;
        for(var i=0;i<fruits.length;i++){
            fruit=fruits[i];
            if(fruit.id==id){
                return fruit;
            }
        }
        return null;
    }
    //获取水果的位置
    function calFruitLocation(tranUFOPos){
        return new SFVec3f(tranUFOPos.x,tranUFOPos.y-ufoFruitGap,tranUFOPos.z);
    }
    //获取摄像头
    var areaObj={             //分区相关的对象
        "areaNum":3,        //可视域的区域数
        "areas":[           //区域的范围
            {"minAngle":10,"maxAngle":80},
            {"minAngle":85,"maxAngle":95},
            {"minAngle":100,"maxAngle":170}
        ],
        "algorithm":{
            "name":"Down2Top",  //选取指定区域位置的算法
            "args":[]            //算法的参数
        }
    };
    var visualObj={            //用于分区的范围
        "camera":null,      //摄像头
        "face":{
            "visualNear":50,
            "visualFar":70,
            "visualFace":50
        },
        "distance":0,       //用于获取距离摄像头某一距离的可视域
        "gap":0             //距离的可变范围
    };
    function getAreaPos(areaObj,visualObj,areaIndex,isStartPos){
        if(areaIndex>=areaObj.areaNum-1)areaIndex=areaObj.areaNum-1;
        if(areaIndex<0)areaIndex=0;
        var distance=C.getRandomNum(visualObj.distance-visualObj.gap,visualObj.distance+visualObj.gap);
        var area=C.getVisualArea(distance,visualObj.camera);
        var tx=(area.rightTop.x-area.leftBottom.x)/areaObj.areaNum;
        var ty=(area.rightTop.y-area.leftBottom.y)/areaObj.areaNum;
        var x,y;
        switch(areaObj.algorithm.name){
            case "Left2Right":
                if(isStartPos){
                    if(areaIndex==0){
                        x=C.getInterpolateNum(area.leftBottom.x,area.rightTop.x,0.2);
                    }else{
                        x=area.leftBottom.x;
                    }
//                    y=C.getRandomNum(area.leftBottom.y+areaIndex*ty,area.leftBottom.y+(areaIndex+1)*ty);
                }else{
                    x=area.rightTop.x;
//                    y=C.getRandomNum(area.leftBottom.y+areaIndex*ty,area.leftBottom.y+(areaIndex+1)*ty);
                }
                if(areaIndex==areaObj.areaNum-1){
                    y=C.getRandomNum(area.leftBottom.y+areaIndex*ty,area.leftBottom.y+(areaIndex+1)*ty-1.2);
                }else{
                    y=C.getRandomNum(area.leftBottom.y+areaIndex*ty,area.leftBottom.y+(areaIndex+1)*ty);
                }
                return new SFVec3f(x,y,visualObj.camera.position.z-distance);
            case "Down2Top":
                if(isStartPos){
                    x=C.getRandomNum(area.leftBottom.x+areaIndex*tx,area.leftBottom.x+(areaIndex+1)*tx);
                    if(areaIndex==0){
                        y=C.getInterpolateNum(area.leftBottom.y,area.rightTop.y,0.2);
                    }else{
                        y=area.leftBottom.y;
                    }
                }else{
                    x=C.getRandomNum(area.leftBottom.x+areaIndex*tx,area.leftBottom.x+(areaIndex+1)*tx);
                    y=area.rightTop.y;
                }
                return new SFVec3f(x,y,visualObj.camera.position.z-distance);
            case "Far2Near":
                if(isStartPos){  //起始点
                    x=C.getRandomNum(area.leftBottom.x+areaIndex*tx,area.leftBottom.x+(areaIndex+1)*tx);
                    y=C.getInterpolateNum(area.leftBottom.y,area.rightTop.y,C.getRandomNum(areaObj.algorithm.args[0],areaObj.algorithm.args[1]));
                }else{          //终止点
                    if(areaIndex==0){
                        if(Math.random()>=0.6){
                            //向上消失
                            x=C.getRandomNum(area.leftBottom.x+areaIndex*tx,area.leftBottom.x+(areaIndex+1)*tx);
                            y=C.getInterpolateNum(area.leftBottom.y,area.rightTop.y,areaObj.algorithm.args[3]);
                        }else{
                            //向左消失
                            if(areaObj.length<=4){
                                x=C.getInterpolateNum(area.leftBottom.x,area.rightTop.x,0);
                            }else{
                                x=C.getInterpolateNum(area.leftBottom.x,area.rightTop.x,areaObj.algorithm.args[4]);
                            }
                            y=C.getInterpolateNum(area.leftBottom.y,area.rightTop.y,C.getRandomNum(areaObj.algorithm.args[2],areaObj.algorithm.args[3]));
                        }
                    }else if(areaIndex==areaNum-1){
                        if(Math.random()>=0.6){
                            //向上消失
                            x=C.getRandomNum(area.leftBottom.x+areaIndex*tx,area.leftBottom.x+(areaIndex+1)*tx);
                            y=C.getInterpolateNum(area.leftBottom.y,area.rightTop.y,areaObj.algorithm.args[3]);
                        }else{
                            //向右消失
                            if(areaObj.length<=4){
                                x=C.getInterpolateNum(area.leftBottom.x,area.rightTop.x,1);
                            }else{
                                x=C.getInterpolateNum(area.leftBottom.x,area.rightTop.x,areaObj.algorithm.args[5]);
                            }
                            y=C.getInterpolateNum(area.leftBottom.y,area.rightTop.y,C.getRandomNum(areaObj.algorithm.args[2],areaObj.algorithm.args[3]));
                        }
                    }else{
                        x=C.getRandomNum(area.leftBottom.x+areaIndex*tx,area.leftBottom.x+(areaIndex+1)*tx);
                        y=C.getInterpolateNum(area.leftBottom.y,area.rightTop.y,areaObj.algorithm.args[3]);
                    }
                }
                return new SFVec3f(x,y,visualObj.camera.position.z-distance);
        }
    };
    //获取某个区域的角度范围
    function getAreaAngle(areaIndex){
        var obj=defaultArea.areas[areaIndex];
        return obj;
    }
    /*获取水果部分*/
    //初始化激活或解除绑定
    function enabledEvents(b){  //绑定接口
        if(b){
            ActionEvent.bind('holdResult',getFruit);
        }else{
            ActionEvent.unbind('holdResult',getFruit);
        }
    }
    function getFruit(angle,rightHand,isActive){
        rightHandLocation=rightHand;        //设置右手的位置
        var obj=null,tmp=null;
        if(isActive){   //可以获取水果
            obj=isFindFruitAmmo(angle);    //搜索水果
            if(obj){    //搜索到
                switch(obj.status){
                    case "go":
                        obj.setStatus("simmer");
                        //由于只有一个物体处于对峙状态
                        for(var i=0;i<fruitArray.length;i++){
                            if(fruitArray[i]!=obj){
                                switch(fruitArray[i].status){
                                    case "simmer":
                                        fruitArray[i].setStatus("yield");
                                        break;
                                    case "fight":
                                        fruitArray[i].setStatus("yield");
                                        break;
                                }
                            }
                        }
                        break;
                    case "simmer":
                        obj.setStatus("fight");
                        //由于只有一个物体处于争夺状态
                        for(var i=0;i<fruitArray.length;i++){
                            if(fruitArray[i]!=obj){
                                switch(fruitArray[i].status){
                                    case "simmer":
                                        fruitArray[i].setStatus("yield");
                                        break;
                                    case "fight":
                                        fruitArray[i].setStatus("yield");
                                        break;
                                }
                            }
                        }
                        break;
                    case "yield":
                        obj.setStatus("simmer");
                        break;
                    case "fight":
                        obj.setStatus("fight");
                        break;
                    default:    //状态保持不变
                        break;
                }
            }else{
                tmp=null;
                for(var i=0;i<fruitArray.length;i++){
                    tmp=fruitArray[i];
                    switch(tmp.status){
                        case "simmer":
                            tmp.setStatus("yield");
                            break;
                        case "fight":
                            tmp.setStatus("yield");
                            break;
                        default:    //其他状态保持不变
                            break;
                    }
                }
            }
        }else{  //不能获取水果
            tmp=null;
            for(var i=0;i<fruitArray.length;i++){
                tmp=fruitArray[i];
                switch(tmp.status){
                    case "simmer":
                        tmp.setStatus("yield");
                        break;
                    case "fight":
                        tmp.setStatus("yield");
                        break;
                    default:    //其他状态保持不变
                        break;
                }
            }
        }
        return obj;
    }
    //判断是否搜索到水果弹药的接口,传入的角度为弧度
    function isFindFruitAmmo(angle){
        var areaIndex,range;
        for(var i=0;i<fruitArray.length;i++){
            areaIndex=fruitArray[i].areaIndex;
            range=getAreaAngle(areaIndex);
            if(angle>=C.calRadian(range.minAngle)&&angle<=C.calRadian(range.maxAngle)){
                return fruitArray[i];
            }
        }
        return null;
    }
    /*投掷水果部分*/
    exports.hurlUFO=function(sourcePlace,targetNode){
        var fruitAmmoObj=getFruitNode(selectFruitName,1);
        var fruitAmmoNode = fruitAmmoObj.node;    //获取某水果节点
        fruitAmmoNode.node.translation = sourcePlace;
        group.children[0].addChild(fruitAmmoNode.node);      //显示
        var obj={
            "status":"create",
            "previousStatus":null,
            "ammo":{
                "id":fruitAmmoNode.id,
                "name":selectFruitName,
                "node":fruitAmmoNode.node,
                "startLocation":sourcePlace
            },
            "target":targetNode,
            "speed":{
                "v":new SFVec3f(defaultSpeed.hurlSpeed.v0,0,0),
                "a":defaultSpeed.hurlSpeed.a,
                "af":defaultSpeed.hurlSpeed.af
            },
            "shootRoute":configAttackRoute(fruitAmmoObj.attackRoute,sourcePlace,targetNode)
        };
        obj.setStatus=function(status){
            this.previousStatus=this.status;
            this.status=status;
        };
        ammoArray.push(obj);
    };
    function configAttackRoute(type,sourcePlace,targetNode){
        var shootRoute=null;
        switch(type){
            case "linear":
                shootRoute={
                    "type":"linear",
                    "args":null
                };
                break;
            case "spiral":
                var angle=C.getRandomNum(0,1)*2*Math.PI;
                shootRoute={
                    "type":"spiral",        //攻击路线的形式
                    "args":{
                        "distance":[C.getVector(sourcePlace,targetNode.translation).length()], //存放开始时距离终点的距离
                        "angle":[C.calRadian(8)],       //螺旋的角度
                        "axis":[new SFVec3f(Math.cos(angle),Math.sin(angle),0)] //旋转轴
                    }
                };
                break;
            case "rotate":
                shootRoute={
                    "type":"rotate",
                    "args":{
                        "distance":[1/3,0.8,0.95],   //分成4段，第一段为离心运动，第二段为绕心运动，第三阶段为向心运动，第四阶段为跟踪运动
                        "speed":[5,20,3]       //这些速度都为离心运动阶段的初角速度，最终角速度和离心速度
                    }
                };
                break;
            default:
                shootRoute={
                    "type":"linear",
                    "args":null
                };
                break;
        }
        return shootRoute;
    }
    exports.destroy = function () {
        if (state) {
            state = false;
            exit();
        }
    };
    function exit(){
        for(var i=0;i<fruitArray.length;i++){
            var obj=fruitArray[i];
            Pool.remove(obj.entity.fruit.id);
            Pool.remove(obj.entity.ufo.id);
        }
        fruitArray=[];
        for(var i=0;i<ammoArray.length;i++){
            var obj=ammoArray[i];
            Pool.remove(obj.ammo.id);
        }
        ammoArray=[];
        TimerEvent.unbind("time",timerFunc);
        GROUPMID.removeChild(group);
        enabledEvents(false);
        if(debug){
            SystemEvent.unBind("keyUp",null);
        }
    }
});