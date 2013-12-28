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
        Config=require("./Config2"),                 //配置类
        Timer=require("core/Timer"),                //计时器
        TimerEvent=require("core/Event").getInstance("Timer"),     //时间事件
        GameEvent=require("core/Event").getInstance("GameEvent"),
        ActionEvent=require("core/Event").getInstance("ActionEvent"),
        C=require("./Calculate"),       //数学相关的算法
        ResourceLoader=require("node/ResourceLoader");
    /*外部配置*/
    var defaultArea=Config.area,
        defaultVisual=Config.visual,
        defaultSpeed=Config.speed;
    /*内部配置*/
    var ufoFruitGap=-1.2;
    /*业务逻辑*/
    var group,ammoGroup,timerFunc;
    var fruitArray=[];                                              //水果和运输飞船对象的数组
    var ammoArray=[];                                               //水果弹药的数组
    var selectFruitName;                                            //正确选择的水果名
    var rightHandLocation;                                          //右手的位置
    var pause=false;                                               //内部暂停游戏的标识符。
    var startTime=Date.now(),endTime=Date.now();                   //设置所有水果到达目标点的开始和结束时间
    var duration=10;

    exports.init = function (callback) {
        if (!state) {
            state = true;
            initView(callback);
            initData();
            enabledEvents(true);
        }
    };
    exports.pause=function(isPause){
        pause=isPause;
    }

    //定义一个时间驱动方法，其中参数dt为两次进入该方法的时间差
    function timerDriver(dt){
        //设置endTime的值
        endTime =endTime+dt;
        var fruitObj=null;
        for(var i=0;i<fruitArray.length;i++){
            fruitObj=fruitArray[i];
            if(fruitObj.status!="fight"){
               fruitObj.entity.sel.whichChoice=-1;
            }else{
                fruitObj.entity.sel.whichChoice=-3;
            }
            switch(fruitObj.status){
                case "create":      //创建状态
                    dealCreate(fruitObj,dt);
                    break;
                case "go":          //行进状态
                    dealGo(fruitObj,dt);
                    break;
                case "target":     //到达目标点的状态
                    dealTarget(fruitObj,dt);
                    break;
                case "yield":       //让步（放弃）状态
                    dealYield(fruitObj,dt);
                    break;
                case "fight":       //争夺状态
                    dealFight(fruitObj,dt);
                    break;
                case "flyback":     //快速回归的状态
                    dealFlyback(fruitObj,dt);
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
            startTime=Date.now();   //设置到达目标点的开始时间
            endTime=Date.now();     //设置水果到达目标点后的持续时间
            fruitObj.setStatus("target");
        }
    }
    function dealTarget(fruitObj,dt){
        if(endTime-startTime>=duration||fruitObj.previousStatus=="flyback"){    //超时后
            fruitObj.setStatus("escape");
        }
    }
    function dealFight(fruitObj,dt){
        if(endTime-startTime>=duration){    //超时后
            fruitObj.setStatus("flyback");
        }
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
                fruitObj.setStatus("win-success");
            }else{
                fruitObj.setStatus("win-fail");
            }
            GameEvent.trigger("getFruit",fruitObj.fruitName);
        }
    }
    function dealYield(fruitObj,dt){
        if(endTime-startTime>=duration){    //超时后
            fruitObj.setStatus("flyback");
        }
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
            fruitObj.setStatus("target");
        }
    }
    function dealFlyback(fruitObj,dt){
        var moveObj={   //注意source的顺序不可颠倒，source[0]为主题源
            "type":"linear",
            "source":[fruitObj.entity.fruit.node],      //移动的源
            "target": calFruitLocation(fruitObj.entity.ufo.node.translation),  //移动的目标，可以是位置或节点
            "speed":fruitObj.speed.flybackSpeed,
            "args":null,
            "startSpeed":defaultSpeed.flybackSpeed.v0,                    //初速度
            "maxSpeed":defaultSpeed.flybackSpeed.v1,                      //结束速度
            "eRange":defaultSpeed.flybackSpeed.e                       //误差范围
        };
        var isArrive=C.move(moveObj,dt);
        if(isArrive){
            fruitObj.setStatus("target");
        }
    }
    function dealWinSuccess(fruitObj,dt){
        for(var i=0;i<fruitArray.length;i++){
            if(fruitArray[i]==fruitObj){
                fruitObj.setStatus("escape");
            }else{
                fruitArray[i].setStatus("flyback");
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
            "source":[fruitObj.entity.ufo.node,fruitObj.entity.fruit.node],      //移动的源
            "target": fruitObj.entity.ufo.startLocation,  //移动的目标，可以是位置或节点
            "speed":fruitObj.speed.escapeSpeed,
            "args":null,
            "startSpeed":defaultSpeed.escapeSpeed.v0,                    //初速度
            "maxSpeed":defaultSpeed.escapeSpeed.v1,                      //结束速度
            "eRange":defaultSpeed.escapeSpeed.e                       //误差范围
        };
        var isArrive=C.move(moveObj,dt);
        if(isArrive){
            fruitObj.entity.group.whichChoice=-1;
            C.remove(fruitArray,fruitObj);
            if (fruitArray.length==0) {
                GameEvent.trigger("stateEvent", "fruitDisappear");
            }
        }
    }
    function dealHurl(ammoObj,dt){
        var moveObj={   //注意source的顺序不可颠倒，source[0]为主题源
            "type":ammoObj.shootRoute.type,
            "source":[ammoObj.ammo.node.choice[0]],      //移动的源
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
        ammoObj.ammo.node.whichChoice=-1;
        C.remove(ammoArray,ammoObj);
        //调用击中函数
        GameEvent.trigger("stateEvent", "hitting");
    }

    /*生成水果的部分*/
    exports.createFruit=function(fruitName){
        /*重新生成前，初始化*/
        for(var i=0;i<fruitArray.length;i++){
            var obj=fruitArray[i];
            obj.entity.group.whichChoice=-1;
            obj=null;
        }
        fruitArray=[];
        for(var i=0;i<ammoArray.length;i++){
            var obj=ammoArray[i];
            obj.ammo.node.whichChoice=-1;
            obj=null;
        }
        ammoArray=[];
        /*生成逻辑*/
        var obj=null;
        var fruitAreaIndex=C.getRandomIntNum(0,defaultArea.areaNum-1);    //获取名为fruitName的水果出现的区域
        var assignFruit=getFruitByFileName(fruitName);      //指定水果
        var secondFruitId=[];
        while(secondFruitId.length!=2){
            var index=C.getRandomIntNum(0,Config.fruits.length-1);
            if(secondFruitId.length==1){
                if(index!=assignFruit.id&&index!=secondFruitId[0]){
                    secondFruitId.push(index);
                }
            }else{
                if(index!=assignFruit.id){
                    secondFruitId.push(index);
                }
            }
        }
        for(var i=0;i<defaultArea.areaNum;i++){
            if(i==fruitAreaIndex){
                obj=getTranUFOAndFruit(assignFruit.id,i);
            }else{
                obj=getTranUFOAndFruit(secondFruitId.pop(),i);
            }
            fruitArray.push(obj);
            obj.entity.sel.whichChoice=-1;
            obj.entity.group.whichChoice=-3;
        }
        selectFruitName=fruitName;
    };
    function initView(callback){
        ResourceLoader.load([
            {type:"item",uri:"fruits/main.lyx"},{type:"item",uri:"fruits/ammo.lyx"}
        ],function(){
            group=SFNode.get("fruit_ufo_group");
            ammoGroup=SFNode.get("fruitAmmo");
            callback&&callback();
        });
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
    function getTranUFOAndFruit(id,areaIndex){
        /*水果和运输飞船的开始位置和飞出位置*/
        var ufoStartTran,fruitStartTran,ufoEndTran,fruitEndTran;
        switch(defaultArea.algorithm.name){
            case "Around2Center":
                defaultVisual.distance=defaultVisual.face.visualFace;
                ufoStartTran=getAreaPos(defaultArea,defaultVisual,areaIndex,true);
                ufoEndTran=getAreaPos(defaultArea,defaultVisual,areaIndex,false);
                fruitStartTran=calFruitLocation(ufoStartTran);      //通过飞船位置计算水果位置
                fruitEndTran=calFruitLocation(ufoEndTran);
                break;
        }
        var fruitObj=getFruitById(id);
        var tranUFONode,fruitNode,groupNode,selNode;
        groupNode=group.children[fruitObj.whichID];
        groupNode.whichChoice=-1;       //隐藏水果飞船组
        tranUFONode=groupNode.choice[1];
        selNode=tranUFONode.children[0].children[0];
        fruitNode=groupNode.choice[0];
        tranUFONode.translation.setValue(ufoStartTran);
        fruitNode.translation.setValue(fruitStartTran);

        /*组合成对象返回*/
        var fruitAndUFOObj={        //水果对象的格式
            "status":"create",          //水果对象的状态
            "previousStatus":null,     //水果对象的前一状态
            "fruitName":fruitObj.name,     //水果的名字
            "areaIndex":areaIndex,         //水果的所属的区域
            "entity":{
                "group":groupNode,           //组节点
                "fruit":{               //水果节点
                    "id":fruitObj.id,
                    "node":fruitNode,
                    "startLocation":fruitStartTran,
                    "endLocation":fruitEndTran
                },
                "ufo":{                 //飞船节点
                    "node":tranUFONode,
                    "startLocation":ufoStartTran,
                    "endLocation":ufoEndTran
                },
                "sel":selNode
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
                "flybackSpeed":{
                    "v":new SFVec3f(defaultSpeed.flybackSpeed.v0,0,0),
                    "a":defaultSpeed.flybackSpeed.a,
                    "af":defaultSpeed.flybackSpeed.af
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
        var template="DEF gg Transform { scale 0.5 0.5 0.5 children[s%]}";
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
        return {"node":fruitNode,"name":fruitObj.name,"id":fruitObj.id};
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
            case "Around2Center":
                if(isStartPos){
                    var startPos=getStartPos(areaIndex,areaObj.areaNum,area);
                    x=startPos.x;
                    y=startPos.y;
                }else{
                    var endPos=getEndPos(areaIndex,areaObj.areaNum,area);
                    x=endPos.x;
                    y=endPos.y;
                }
                return new SFVec3f(x,y,visualObj.camera.position.z-distance);
        }
    };
    function getStartPos(areaIndex,areaNum,face){
        var centerPos=new SFVec2f((face.rightTop.x+face.leftBottom.x)/2,(face.rightTop.y+face.leftBottom.y)/2);
        if(areaNum<=1){
            return new SFVec3f(centerPos.x,face.rightTop.y);
        }
        var angle0=Math.atan((face.rightTop.y-face.leftBottom.y)/(face.rightTop.x-face.leftBottom.y));
        var tA=Math.PI/(areaNum-1);
        var angle=areaIndex*tA;         //获取区域的角度
        var halfX=(face.rightTop.x-face.leftBottom.x)/2;
        var halfY=(face.rightTop.y-face.leftBottom.y)/2;
        var x,y;
        if(angle<=angle0){
            x=face.leftBottom.x;
            y=Math.tan(angle)*halfX+centerPos.y;
        }else if(angle<(Math.PI-angle0)){
            if(angle>=C.calRadian(88)&&angle<=C.calRadian(92)){
                x=centerPos.x;
            }else{
                x=centerPos.x-(halfY/Math.tan(angle));
            }
            y=face.rightTop.y;
        }else{
            x=face.rightTop.x;
            y=Math.tan(Math.PI-angle)*halfX+centerPos.y;
        }
        return new SFVec2f(x,y);
    }
    var radio=0.7;
    function getEndPos(areaIndex,areaNum,face){
        var centerPos=new SFVec2f((face.rightTop.x+face.leftBottom.x)/2,(face.rightTop.y+face.leftBottom.y)/2);
        var xL=face.rightTop.x-face.leftBottom.x;
        var gap=xL*(1-radio)/2
        var x1=face.leftBottom.x+gap;
        var x2=face.rightTop.x-gap;
        var leftX=C.getInterpolateNum(x1,x2,areaIndex/areaNum);
        var rightX=C.getInterpolateNum(x1,x2,(areaIndex+1)/areaNum);
        return new SFVec2f((leftX+rightX)/2,centerPos.y);
    }
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
                    case "target":
                    case "yield":
                    case "fight":
                        obj.setStatus("fight");
                        //由于只有一个物体处于争夺状态
                        for(var i=0;i<fruitArray.length;i++){
                            if(fruitArray[i]!=obj){
                                switch(fruitArray[i].status){
                                    case "fight":
                                        fruitArray[i].setStatus("yield");
                                        break;
                                }
                            }
                        }
                        break;
                    default:    //状态保持不变
                        break;
                }
            }else{
                tmp=null;
                for(var i=0;i<fruitArray.length;i++){
                    tmp=fruitArray[i];
                    switch(tmp.status){
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
        var assignFruit=getFruitByFileName(selectFruitName);      //指定水果
        var fruitAmmoSwi=ammoGroup.children[assignFruit.whichID-1];
        var fruitAmmoNode=fruitAmmoSwi.choice[0];
        fruitAmmoNode.translation = sourcePlace;
        fruitAmmoSwi.whichChoice=-3;
        var len=Config.attackRoute.length;
        var index=C.getRandomIntNum(0,len-1);
        var attackRouteType=Config.attackRoute[index];
        var obj={
            "status":"create",
            "previousStatus":null,
            "ammo":{
                "name":selectFruitName,
                "node":fruitAmmoSwi,
                "startLocation":sourcePlace
            },
            "target":targetNode,
            "speed":{
                "v":new SFVec3f(defaultSpeed.hurlSpeed.v0,0,0),
                "a":defaultSpeed.hurlSpeed.a,
                "af":defaultSpeed.hurlSpeed.af
            },
//            "shootRoute":configAttackRoute(fruitAmmoObj.attackRoute,sourcePlace,targetNode)
            "shootRoute":configAttackRoute(attackRouteType,sourcePlace,targetNode)
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
            obj.entity.group.whichChoice=-1;
            obj=null;
        }
        fruitArray=[];
        for(var i=0;i<ammoArray.length;i++){
            var obj=ammoArray[i];
            obj.ammo.node.whichChoice=-1;
            obj=null;
        }
        ammoArray=[];
        TimerEvent.unbind("time",timerFunc);
        enabledEvents(false);
    }
});