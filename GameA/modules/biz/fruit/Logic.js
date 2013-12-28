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
        Config=require("./Config"),                 //������
        Timer=require("core/Timer"),                //��ʱ��
        TimerEvent=require("core/Event").getInstance("Timer"),     //ʱ���¼�
        GameEvent=require("core/Event").getInstance("GameEvent"),
        ActionEvent=require("core/Event").getInstance("ActionEvent"),
        C=require("./Calculate");       //��ѧ��ص��㷨
    var fruitResPath = "/resources/models/fruits/",
        tranUFOResPath="/resources/models/tranUFO/";              //��Դ���ļ�����·��
    /*�ⲿ����*/
    var defaultArea=Config.area,
        defaultVisual=Config.visual,
        defaultSpeed=Config.speed;
    /*�ڲ�����*/
    var ufoFruitGap=-1.2;
    /*ҵ���߼�*/
    var group,timerFunc;
    var fruitArray=[];                                              //ˮ��������ɴ����������
    var ammoArray=[];                                               //ˮ����ҩ������
    var selectFruitName;                                            //��ȷѡ���ˮ����
    var rightHandLocation;                                          //���ֵ�λ��
    var pause=false;                                               //�ڲ���ͣ��Ϸ�ı�ʶ����
    /*������*/
    var debug=(Config.mode=="debug")?true:false;                  //����ģʽ
    var testRightHand=new SFVec3f(0,0,-10);
    var SystemEvent=require('events/SystemEvent');
    var Keycode=require("utils/Keycode");
    var targetNode;                                                 //�����õ�Ŀ��ڵ�
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
                //���³�ʼ��
                exports.destroy();
                exports.init();
            }else if(v==Keycode.P){
                exports.pause(!pause);
            }
        });
    }
    //������
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

    //����һ��ʱ���������������в���dtΪ���ν���÷�����ʱ���
    function timerDriver(dt){
        var fruitObj=null;
        for(var i=0;i<fruitArray.length;i++){
            fruitObj=fruitArray[i];
            switch(fruitObj.status){
                case "create":      //����״̬
                    dealCreate(fruitObj,dt);
                    break;
                case "go":          //�н�״̬
                    dealGo(fruitObj,dt);
                    break;
                case "quickGo":     //�����н�״̬
                    dealQuickGo(fruitObj,dt);
                    break;
                case "simmer":      //һ��������״̬
                    dealSimmer(fruitObj,dt);
                    break;
                case "yield":       //�ò���������״̬
                    dealYield(fruitObj,dt);
                    break;
                case "fight":       //����״̬
                    dealFight(fruitObj,dt);
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
                case "leave":       //�뿪״̬
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
    /*״̬֧����Ϊ*/
    function dealCreate(fruitObj,dt){
        fruitObj.setStatus("go");
    }
    function dealGo(fruitObj,dt){
        //��ȡmoveObj
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
            fruitObj.setStatus("leave");
        }
    }
    function dealQuickGo(fruitObj,dt){
        //��ȡmoveObj
        var moveObj={   //ע��source��˳�򲻿ɵߵ���source[0]Ϊ����Դ
            "type":"linear",
            "source":[fruitObj.entity.ufo.node,fruitObj.entity.fruit.node],      //�ƶ���Դ
            "target":fruitObj.entity.ufo.endLocation,      //�ƶ���Ŀ�꣬������λ�û�ڵ�
            "speed":{
                "v":new SFVec3f(0,0,8*defaultSpeed.goSpeed.v1),
                "a":0,
                "af":0
            },
            "args":null,
            "startSpeed":8*defaultSpeed.goSpeed.v1,                    //���ٶ�
            "maxSpeed":8*defaultSpeed.goSpeed.v1,                      //�����ٶ�
            "eRange":defaultSpeed.goSpeed.e                       //��Χ
        };
        var isArrive=C.move(moveObj,dt);
        if(isArrive){   //����
            fruitObj.setStatus("leave");
        }
    }
    function dealLeave(fruitObj,dt){
        //��obj��groupNode��group��ɾ��
        group.children[0].removeChild(fruitObj.entity.group);
        Pool.remove(fruitObj.entity.fruit.id);
        Pool.remove(fruitObj.entity.ufo.id);
        //��obj��FruitArray��ɾ��
        C.remove(fruitArray,fruitObj);
        //log.info("���ڻ�ʣ"+fruitArray.length);
        if (fruitArray.length==0) {
            //log.info("�����");
            GameEvent.trigger("stateEvent", "fruitDisappear");
        }
    }
    function dealSimmer(fruitObj,dt){
        //TO-DO
    }
    function dealFight(fruitObj,dt){
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
                //log.info("��ȷ��ȡ");
                fruitObj.setStatus("win-success");
            }else{
                fruitObj.setStatus("win-fail");
                //log.info("�����ȡ");
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
        //��ȡmoveObj
        var moveObj={   //ע��source��˳�򲻿ɵߵ���source[0]Ϊ����Դ
            "type":"linear",
            "source":[fruitObj.entity.ufo.node],      //�ƶ���Դ
            "target": fruitObj.entity.ufo.startLocation,  //�ƶ���Ŀ�꣬������λ�û�ڵ�
            "speed":fruitObj.speed.escapeSpeed,
            "args":null,
            "startSpeed":defaultSpeed.escapeSpeed.v0,                    //���ٶ�
            "maxSpeed":defaultSpeed.escapeSpeed.v1,                      //�����ٶ�
            "eRange":defaultSpeed.escapeSpeed.e                       //��Χ
        };
        var isArrive=C.move(moveObj,dt);
        if(isArrive){
            //��obj��groupNode��group��ɾ��
            group.children[0].removeChild(fruitObj.entity.group);
            Pool.remove(fruitObj.entity.fruit.id);
            Pool.remove(fruitObj.entity.ufo.id);
            //��obj��FruitArray��ɾ��
            C.remove(fruitArray,fruitObj);
            //log.info("##���ڻ�ʣ"+fruitArray.length);
            if (fruitArray.length==0) {
                //log.info("##�����");
                GameEvent.trigger("stateEvent", "fruitDisappear");
            }
        }
    }
    function dealHurl(ammoObj,dt){
        var moveObj={   //ע��source��˳�򲻿ɵߵ���source[0]Ϊ����Դ
            "type":ammoObj.shootRoute.type,
            "source":[ammoObj.ammo.node],      //�ƶ���Դ
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
        group.children[0].removeChild(ammoObj.ammo.node);
        Pool.remove(ammoObj.ammo.id);
        C.remove(ammoArray,ammoObj);
        //���û��к���
        GameEvent.trigger("stateEvent", "hitting");
    }

    /*����ˮ���Ĳ���*/
    exports.createFruit=function(fruitName){
        /*��������ǰ����ʼ��*/
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
        /*�����߼�*/
        var obj=null;
        var fruitAreaIndex=C.getRandomIntNum(0,defaultArea.areaNum-1);    //��ȡ��ΪfruitName��ˮ�����ֵ�����
        for(var i=0;i<defaultArea.areaNum;i++){
            if(i==fruitAreaIndex){
                obj=getTranUFOAndFruit(fruitName,i,1);
            }else{
                obj=getTranUFOAndFruit(fruitName,i,0);
            }
            fruitArray.push(obj);
            group.children[0].addChild(obj.entity.group);      //��ʾ
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
    //�������UFO��ˮ���Ķ���,���в���precise��ʾ������ΪfruitNameˮ���ľ�ȷ�ȡ�
    //precise>=1��ʾһ����������ˮ����precise<=0��ʾһ������������ˮ����preciseΪ����ֵ��ʾ�κ����
    function getTranUFOAndFruit(fruitName,areaIndex,precise){
        /*ˮ��������ɴ��Ŀ�ʼλ�úͷɳ�λ��*/
        var ufoStartTran,fruitStartTran,ufoEndTran,fruitEndTran;
        switch(defaultArea.algorithm.name){
            case "Far2Near":
                defaultVisual.distance=defaultVisual.face.visualFar;
                ufoStartTran=getAreaPos(defaultArea,defaultVisual,areaIndex,true);
                defaultVisual.distance=defaultVisual.face.visualNear;
                ufoEndTran=getAreaPos(defaultArea,defaultVisual,areaIndex,false);
                fruitStartTran=calFruitLocation(ufoStartTran);      //ͨ���ɴ�λ�ü���ˮ��λ��
                fruitEndTran=calFruitLocation(ufoEndTran);
                break;
            case "Down2Top":
            case "Left2Right":
                defaultVisual.distance=defaultVisual.face.visualFace;
                ufoStartTran=getAreaPos(defaultArea,defaultVisual,areaIndex,true);
                ufoEndTran=getAreaPos(defaultArea,defaultVisual,areaIndex,false);
                fruitStartTran=calFruitLocation(ufoStartTran);      //ͨ���ɴ�λ�ü���ˮ��λ��
                fruitEndTran=calFruitLocation(ufoEndTran);
                break;
        }
        /*����ˮ��������ɴ��Ľڵ�*/
        var tranUFONode,fruitNode,groupNode;
        tranUFONode=getTranUFONode();
        tranUFONode.node.translation.setValue(ufoStartTran);      //����ɴ���λ��
        var fruitNodeObj=getFruitNode(fruitName,precise);
        fruitNode=fruitNodeObj.node;
        fruitNode.node.translation.setValue(fruitStartTran);     //ˮ����ҩ��λ��
        var groupNodeStr="Switch{choice [] whichChoice -3}";
        groupNode=new SFNode(groupNodeStr).children[0];
        groupNode.choice[0]=tranUFONode.node;
        groupNode.choice[1]=fruitNode.node;
        /*��ϳɶ��󷵻�*/
        var fruitAndUFOObj={        //ˮ������ĸ�ʽ
            "status":"create",          //ˮ�������״̬
            "previousStatus":null,     //ˮ�������ǰһ״̬
            "fruitName":fruitNodeObj.name,     //ˮ��������
            "areaIndex":areaIndex,             //ˮ��������������
            "entity":{
                "group":groupNode,           //��ڵ�
                "fruit":{               //ˮ���ڵ�
                    "id":fruitNode.id,
                    "node":fruitNode.node,
                    "startLocation":fruitStartTran,
                    "endLocation":fruitEndTran
                },
                "ufo":{                 //�ɴ��ڵ�
                    "id":tranUFONode.id,
                    "node":tranUFONode.node,
                    "startLocation":ufoStartTran,
                    "endLocation":ufoEndTran
                }
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
        var template="Transform { scale 0.5 0.5 0.5 children[s%]}";
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
        return {"node":fruitNode,"name":fruitObj.name,"attackRoute":fruitObj.attackRoute,"id":fruitObj.id};
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
                if(isStartPos){  //��ʼ��
                    x=C.getRandomNum(area.leftBottom.x+areaIndex*tx,area.leftBottom.x+(areaIndex+1)*tx);
                    y=C.getInterpolateNum(area.leftBottom.y,area.rightTop.y,C.getRandomNum(areaObj.algorithm.args[0],areaObj.algorithm.args[1]));
                }else{          //��ֹ��
                    if(areaIndex==0){
                        if(Math.random()>=0.6){
                            //������ʧ
                            x=C.getRandomNum(area.leftBottom.x+areaIndex*tx,area.leftBottom.x+(areaIndex+1)*tx);
                            y=C.getInterpolateNum(area.leftBottom.y,area.rightTop.y,areaObj.algorithm.args[3]);
                        }else{
                            //������ʧ
                            if(areaObj.length<=4){
                                x=C.getInterpolateNum(area.leftBottom.x,area.rightTop.x,0);
                            }else{
                                x=C.getInterpolateNum(area.leftBottom.x,area.rightTop.x,areaObj.algorithm.args[4]);
                            }
                            y=C.getInterpolateNum(area.leftBottom.y,area.rightTop.y,C.getRandomNum(areaObj.algorithm.args[2],areaObj.algorithm.args[3]));
                        }
                    }else if(areaIndex==areaNum-1){
                        if(Math.random()>=0.6){
                            //������ʧ
                            x=C.getRandomNum(area.leftBottom.x+areaIndex*tx,area.leftBottom.x+(areaIndex+1)*tx);
                            y=C.getInterpolateNum(area.leftBottom.y,area.rightTop.y,areaObj.algorithm.args[3]);
                        }else{
                            //������ʧ
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
                    case "go":
                        obj.setStatus("simmer");
                        //����ֻ��һ�����崦�ڶ���״̬
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
                        //����ֻ��һ�����崦������״̬
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
                    default:    //״̬���ֲ���
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
                    case "simmer":
                        tmp.setStatus("yield");
                        break;
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
        var fruitAmmoObj=getFruitNode(selectFruitName,1);
        var fruitAmmoNode = fruitAmmoObj.node;    //��ȡĳˮ���ڵ�
        fruitAmmoNode.node.translation = sourcePlace;
        group.children[0].addChild(fruitAmmoNode.node);      //��ʾ
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