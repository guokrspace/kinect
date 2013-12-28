/**
 * Created by JetBrains WebStorm.
 * User: Administrator
 * Date: 12-1-31
 * Time: ����3:26
 */
define(function (require, exports, module) {
    var root = this, state = false,
        log = require("core/Logger").getLog();
    var Pool=require("node/NodeCachePool"),
        Config=require("./Config2"),                 //������
        Timer=require("core/Timer"),                //��ʱ��
        TimerEvent=require("core/Event").getInstance("Timer"),     //ʱ���¼�
        GameEvent=require("core/Event").getInstance("GameEvent"),
        ActionEvent=require("core/Event").getInstance("ActionEvent"),
        C=require("./Calculate"),       //��ѧ��ص��㷨
        ResourceLoader=require("node/ResourceLoader");
    /*�ⲿ����*/
    var defaultArea=Config.area,
        defaultVisual=Config.visual,
        defaultSpeed=Config.speed;
    /*�ڲ�����*/
    var ufoFruitGap=-1.2;
    /*ҵ���߼�*/
    var group,ammoGroup,timerFunc;
    var fruitArray=[];                                              //ˮ��������ɴ����������
    var ammoArray=[];                                               //ˮ����ҩ������
    var selectFruitName;                                            //��ȷѡ���ˮ����
    var rightHandLocation;                                          //���ֵ�λ��
    var pause=false;                                               //�ڲ���ͣ��Ϸ�ı�ʶ����
    var startTime=Date.now(),endTime=Date.now();                   //��������ˮ������Ŀ���Ŀ�ʼ�ͽ���ʱ��
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

    //����һ��ʱ���������������в���dtΪ���ν���÷�����ʱ���
    function timerDriver(dt){
        //����endTime��ֵ
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
                case "create":      //����״̬
                    dealCreate(fruitObj,dt);
                    break;
                case "go":          //�н�״̬
                    dealGo(fruitObj,dt);
                    break;
                case "target":     //����Ŀ����״̬
                    dealTarget(fruitObj,dt);
                    break;
                case "yield":       //�ò���������״̬
                    dealYield(fruitObj,dt);
                    break;
                case "fight":       //����״̬
                    dealFight(fruitObj,dt);
                    break;
                case "flyback":     //���ٻع��״̬
                    dealFlyback(fruitObj,dt);
                    break;
                case "win-success": //��ȷ��ȡ״̬
                    dealWinSuccess(fruitObj,dt);
                    break;
                case "win-fail":    //�����ȡ״̬
                    dealWinFail(fruitObj,dt);
                    break;
                case "escape":      //����״̬
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
    /*״̬֧����Ϊ*/
    function dealCreate(fruitObj,dt){
        fruitObj.setStatus("go");
    }
    function dealGo(fruitObj,dt){
        var moveObj={   //ע��source��˳�򲻿ɵߵ���source[0]Ϊ����Դ
            "type":"linear",
            "source":[fruitObj.entity.ufo.node,fruitObj.entity.fruit.node],      //�ƶ���Դ
            "target":fruitObj.entity.ufo.endLocation,      //�ƶ���Ŀ�꣬������λ�û�ڵ�
            "speed":fruitObj.speed.goSpeed,
            "args":null,
            "startSpeed":defaultSpeed.goSpeed.v0,                    //���ٶ�
            "maxSpeed":defaultSpeed.goSpeed.v1,                      //�����ٶ�
            "eRange":defaultSpeed.goSpeed.e                       //��Χ
        };
        var isArrive=C.move(moveObj,dt);
        if(isArrive){   //����
            startTime=Date.now();   //���õ���Ŀ���Ŀ�ʼʱ��
            endTime=Date.now();     //����ˮ������Ŀ����ĳ���ʱ��
            fruitObj.setStatus("target");
        }
    }
    function dealTarget(fruitObj,dt){
        if(endTime-startTime>=duration||fruitObj.previousStatus=="flyback"){    //��ʱ��
            fruitObj.setStatus("escape");
        }
    }
    function dealFight(fruitObj,dt){
        if(endTime-startTime>=duration){    //��ʱ��
            fruitObj.setStatus("flyback");
        }
        if(fruitObj.previousStatus!="fight"){   //ǰһ��״̬��������״̬
            fruitObj.speed.fightSpeed={
                "v":new SFVec3f(defaultSpeed.fightSpeed.v0,0,0),
                "a":defaultSpeed.fightSpeed.a,
                "af":defaultSpeed.fightSpeed.af
            };
        }
        fruitObj.setStatus("fight");
        //��ȡmoveObj
        var moveObj={   //ע��source��˳�򲻿ɵߵ���source[0]Ϊ����Դ
            "type":"linear",
            "source":[fruitObj.entity.fruit.node],      //�ƶ���Դ
            "target":rightHandLocation,                   //�ƶ���Ŀ�꣬������λ�û�ڵ�
            "speed":fruitObj.speed.fightSpeed,
            "args":null,
            "startSpeed":defaultSpeed.fightSpeed.v0,                //���ٶ�
            "maxSpeed":defaultSpeed.fightSpeed.v1,                  //�����ٶ�
            "eRange":defaultSpeed.fightSpeed.e                       //��Χ
        };
        var isArrive=C.move(moveObj,dt);
        if(isArrive){   //����
            fruitObj.entity.group.whichChoice=0;     //����ˮ��
            if(fruitObj.fruitName==selectFruitName){
                fruitObj.setStatus("win-success");
            }else{
                fruitObj.setStatus("win-fail");
            }
            GameEvent.trigger("getFruit",fruitObj.fruitName);
        }
    }
    function dealYield(fruitObj,dt){
        if(endTime-startTime>=duration){    //��ʱ��
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
        //��ȡmoveObj
        var moveObj={   //ע��source��˳�򲻿ɵߵ���source[0]Ϊ����Դ
            "type":"linear",
            "source":[fruitObj.entity.fruit.node],      //�ƶ���Դ
            "target": calFruitLocation(fruitObj.entity.ufo.node.translation),  //�ƶ���Ŀ�꣬������λ�û�ڵ�
            "speed":fruitObj.speed.yieldSpeed,
            "args":null,
            "startSpeed":defaultSpeed.yieldSpeed.v0,                    //���ٶ�
            "maxSpeed":defaultSpeed.yieldSpeed.v1,                      //�����ٶ�
            "eRange":defaultSpeed.yieldSpeed.e                       //��Χ
        };
        var isArrive=C.move(moveObj,dt);
        if(isArrive){
            fruitObj.setStatus("target");
        }
    }
    function dealFlyback(fruitObj,dt){
        var moveObj={   //ע��source��˳�򲻿ɵߵ���source[0]Ϊ����Դ
            "type":"linear",
            "source":[fruitObj.entity.fruit.node],      //�ƶ���Դ
            "target": calFruitLocation(fruitObj.entity.ufo.node.translation),  //�ƶ���Ŀ�꣬������λ�û�ڵ�
            "speed":fruitObj.speed.flybackSpeed,
            "args":null,
            "startSpeed":defaultSpeed.flybackSpeed.v0,                    //���ٶ�
            "maxSpeed":defaultSpeed.flybackSpeed.v1,                      //�����ٶ�
            "eRange":defaultSpeed.flybackSpeed.e                       //��Χ
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
        //��ȡmoveObj
        var moveObj={   //ע��source��˳�򲻿ɵߵ���source[0]Ϊ����Դ
            "type":"linear",
            "source":[fruitObj.entity.ufo.node,fruitObj.entity.fruit.node],      //�ƶ���Դ
            "target": fruitObj.entity.ufo.startLocation,  //�ƶ���Ŀ�꣬������λ�û�ڵ�
            "speed":fruitObj.speed.escapeSpeed,
            "args":null,
            "startSpeed":defaultSpeed.escapeSpeed.v0,                    //���ٶ�
            "maxSpeed":defaultSpeed.escapeSpeed.v1,                      //�����ٶ�
            "eRange":defaultSpeed.escapeSpeed.e                       //��Χ
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
        var moveObj={   //ע��source��˳�򲻿ɵߵ���source[0]Ϊ����Դ
            "type":ammoObj.shootRoute.type,
            "source":[ammoObj.ammo.node.choice[0]],      //�ƶ���Դ
            "target":ammoObj.target,          //�ƶ���Ŀ�꣬������λ�û�ڵ�
            "speed":ammoObj.speed,
            "args":ammoObj.shootRoute.args,
            "startLocation":ammoObj.ammo.startLocation,
            "startSpeed":defaultSpeed.hurlSpeed.v0,                    //���ٶ�
            "maxSpeed":defaultSpeed.hurlSpeed.v1,                      //�����ٶ�
            "eRange":defaultSpeed.hurlSpeed.e                          //��Χ
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
        //���û��к���
        GameEvent.trigger("stateEvent", "hitting");
    }

    /*����ˮ���Ĳ���*/
    exports.createFruit=function(fruitName){
        /*��������ǰ����ʼ��*/
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
        /*�����߼�*/
        var obj=null;
        var fruitAreaIndex=C.getRandomIntNum(0,defaultArea.areaNum-1);    //��ȡ��ΪfruitName��ˮ�����ֵ�����
        var assignFruit=getFruitByFileName(fruitName);      //ָ��ˮ��
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
    //�������UFO��ˮ���Ķ���,���в���precise��ʾ������ΪfruitNameˮ���ľ�ȷ�ȡ�
    //precise>=1��ʾһ����������ˮ����precise<=0��ʾһ������������ˮ����preciseΪ����ֵ��ʾ�κ����
    function getTranUFOAndFruit(id,areaIndex){
        /*ˮ��������ɴ��Ŀ�ʼλ�úͷɳ�λ��*/
        var ufoStartTran,fruitStartTran,ufoEndTran,fruitEndTran;
        switch(defaultArea.algorithm.name){
            case "Around2Center":
                defaultVisual.distance=defaultVisual.face.visualFace;
                ufoStartTran=getAreaPos(defaultArea,defaultVisual,areaIndex,true);
                ufoEndTran=getAreaPos(defaultArea,defaultVisual,areaIndex,false);
                fruitStartTran=calFruitLocation(ufoStartTran);      //ͨ���ɴ�λ�ü���ˮ��λ��
                fruitEndTran=calFruitLocation(ufoEndTran);
                break;
        }
        var fruitObj=getFruitById(id);
        var tranUFONode,fruitNode,groupNode,selNode;
        groupNode=group.children[fruitObj.whichID];
        groupNode.whichChoice=-1;       //����ˮ���ɴ���
        tranUFONode=groupNode.choice[1];
        selNode=tranUFONode.children[0].children[0];
        fruitNode=groupNode.choice[0];
        tranUFONode.translation.setValue(ufoStartTran);
        fruitNode.translation.setValue(fruitStartTran);

        /*��ϳɶ��󷵻�*/
        var fruitAndUFOObj={        //ˮ������ĸ�ʽ
            "status":"create",          //ˮ�������״̬
            "previousStatus":null,     //ˮ�������ǰһ״̬
            "fruitName":fruitObj.name,     //ˮ��������
            "areaIndex":areaIndex,         //ˮ��������������
            "entity":{
                "group":groupNode,           //��ڵ�
                "fruit":{               //ˮ���ڵ�
                    "id":fruitObj.id,
                    "node":fruitNode,
                    "startLocation":fruitStartTran,
                    "endLocation":fruitEndTran
                },
                "ufo":{                 //�ɴ��ڵ�
                    "node":tranUFONode,
                    "startLocation":ufoStartTran,
                    "endLocation":ufoEndTran
                },
                "sel":selNode
            },
            "speed":{           //�ٶȣ���ʼ�ٶȺ�����ٶȴ������ļ��л�ȡ
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
            }   //�����ʼ�Ǿ�ֹ��
        };
        fruitAndUFOObj.setStatus=function(status){
            this.previousStatus=this.status;
            this.status=status;
        };
        return fruitAndUFOObj;
    }
    //ͨ��tranUFOName��ȡ����ɴ��Ľڵ�
    function getTranUFONode(){
        var tranUFO=Config.tranUFO;
        var template="DEF gg Transform { scale 0.5 0.5 0.5 children[s%]}";
        var tranUFONode=Pool.create(tranUFO.file,template,tranUFOResPath);
        return tranUFONode;
    }
    //ͨ��fruitName��ȡˮ���ڵ�
    function getFruitNode(fruitName,precise){
        var assignFruit=getFruitByFileName(fruitName);      //ָ��ˮ��
        if(!assignFruit){
            //log.debug("#Logic.getFruitNode#������"+fruitName+".");
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
    //ͨ��name��ȡˮ���ڵ�
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
    //ͨ��id��ȡˮ���ڵ�
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
    //��ȡˮ����λ��
    function calFruitLocation(tranUFOPos){
        return new SFVec3f(tranUFOPos.x,tranUFOPos.y-ufoFruitGap,tranUFOPos.z);
    }
    //��ȡ����ͷ
    var areaObj={             //������صĶ���
        "areaNum":3,        //�������������
        "areas":[           //����ķ�Χ
            {"minAngle":10,"maxAngle":80},
            {"minAngle":85,"maxAngle":95},
            {"minAngle":100,"maxAngle":170}
        ],
        "algorithm":{
            "name":"Down2Top",  //ѡȡָ������λ�õ��㷨
            "args":[]            //�㷨�Ĳ���
        }
    };
    var visualObj={            //���ڷ����ķ�Χ
        "camera":null,      //����ͷ
        "face":{
            "visualNear":50,
            "visualFar":70,
            "visualFace":50
        },
        "distance":0,       //���ڻ�ȡ��������ͷĳһ����Ŀ�����
        "gap":0             //����Ŀɱ䷶Χ
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
        var angle=areaIndex*tA;         //��ȡ����ĽǶ�
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
    //��ȡĳ������ĽǶȷ�Χ
    function getAreaAngle(areaIndex){
        var obj=defaultArea.areas[areaIndex];
        return obj;
    }
    /*��ȡˮ������*/
    //��ʼ�����������
    function enabledEvents(b){  //�󶨽ӿ�
        if(b){
            ActionEvent.bind('holdResult',getFruit);
        }else{
            ActionEvent.unbind('holdResult',getFruit);
        }
    }
    function getFruit(angle,rightHand,isActive){
        rightHandLocation=rightHand;        //�������ֵ�λ��
        var obj=null,tmp=null;
        if(isActive){   //���Ի�ȡˮ��
            obj=isFindFruitAmmo(angle);    //����ˮ��
            if(obj){    //������
                switch(obj.status){
                    case "target":
                    case "yield":
                    case "fight":
                        obj.setStatus("fight");
                        //����ֻ��һ�����崦������״̬
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
                    default:    //״̬���ֲ���
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
                        default:    //����״̬���ֲ���
                            break;
                    }
                }
            }
        }else{  //���ܻ�ȡˮ��
            tmp=null;
            for(var i=0;i<fruitArray.length;i++){
                tmp=fruitArray[i];
                switch(tmp.status){
                    case "fight":
                        tmp.setStatus("yield");
                        break;
                    default:    //����״̬���ֲ���
                        break;
                }
            }
        }
        return obj;
    }
    //�ж��Ƿ�������ˮ����ҩ�Ľӿ�,����ĽǶ�Ϊ����
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
    /*Ͷ��ˮ������*/
    exports.hurlUFO=function(sourcePlace,targetNode){
        var assignFruit=getFruitByFileName(selectFruitName);      //ָ��ˮ��
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
                    "type":"spiral",        //����·�ߵ���ʽ
                    "args":{
                        "distance":[C.getVector(sourcePlace,targetNode.translation).length()], //��ſ�ʼʱ�����յ�ľ���
                        "angle":[C.calRadian(8)],       //�����ĽǶ�
                        "axis":[new SFVec3f(Math.cos(angle),Math.sin(angle),0)] //��ת��
                    }
                };
                break;
            case "rotate":
                shootRoute={
                    "type":"rotate",
                    "args":{
                        "distance":[1/3,0.8,0.95],   //�ֳ�4�Σ���һ��Ϊ�����˶����ڶ���Ϊ�����˶��������׶�Ϊ�����˶������Ľ׶�Ϊ�����˶�
                        "speed":[5,20,3]       //��Щ�ٶȶ�Ϊ�����˶��׶εĳ����ٶȣ����ս��ٶȺ������ٶ�
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