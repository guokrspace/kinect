/**
 * 数学计算相关的函数或算法.
 * User: yaoxx
 * Date: 12-2-1
 * Time: 下午12:06
 */
define(function (require, exports, module) {
    var root = this,
        log = require("core/Logger").getLog();

    //获取[min,max)之间的随机数
    exports.getRandomNum=function(num1,num2){
        if(num1==num2){
            return num1;
        }
        var min=Math.min(num1,num2);
        var max=Math.max(num1,num2);
        return Math.random()*(max-min)+min;
    };
    //获取[min,max]之间的整数
    exports.getRandomIntNum=function(num1,num2){
        if(num1==num2){
            return Math.floor(num1);
        }
        var min=Math.min(num1,num2);
        var max=Math.max(num1,num2);
        return Math.floor(Math.random()*(max-min+1)+min);
    };
    //公式radio=(x-min)/(max-min)，获取x的值，即获取两值指定比率的值。
    exports.getInterpolateNum=function(startValue,endValue,radio){
        return radio*(endValue-startValue)+startValue;
    };
    exports.getInterpolatePoint=function(startPos,endPos,radio){
        if(radio>=1){
            return endPos;
        }
        if(radio<=0){
            return startPos;
        }
        return startPos.slerp(endPos,radio);
    };
    //获取两点的向量
    exports.getVector=function(startPos,endPos){
        if(!endPos||!startPos){
            log.debug("#Calculate.getVector#向量没有起始点或终止点");
            return new SFVec3f(0,0,0);
        }
        return new SFVec3f(endPos.x-startPos.x,endPos.y-startPos.y,endPos.z-startPos.z);
    };
    exports.getALVector=function(startPos,endPos,length){   //指定向量的长度
        if(!endPos||!startPos){
            log.debug("#Calculate.getVector#向量没有起始点或终止点");
            return new SFVec3f(0,0,0);
        }
        var vector=new SFVec3f(endPos.x-startPos.x,endPos.y-startPos.y,endPos.z-startPos.z);
        vector=vector.normalize();
        return vector.multiply(length);
    };
    exports.getSpeedVector=function(v,length){
        if(!v){
            return new SFVec3f(0,0,0);
        }
        var nV=v.normalize();
        return nV.multiply(length);
    };
    //获取点到线的距离,参数pos表示点，点start和end表示线。
    exports.analysisPos2Line=function(pos,start,end){
        var lineVector=exports.getVector(start,end);
        var vector=exports.getVector(start,pos);
        if(lineVector.length()==0){   //开始点和结束点重复
            return null;
        }
        if(vector.length()==0){ //点pos和start为同一点
            return {
                "dir":lineVector,
                "normal":new SFVec3f(1,0,0),
                "distance":0,
                "lamda":0,
                "v":new SFVec3f(0,0,0)
            };
        }
        var minDistance=(vector.cross(lineVector).length())/lineVector.length();
        var lamda=(Math.sqrt(vector.length()*vector.length()-minDistance*minDistance))/lineVector.length();
        var crossPos=exports.getInterpolatePoint(start,end,lamda);
        var normal=exports.getVector(crossPos,pos);
        var obj={
            "dir":lineVector,        //线的方向
            "normal":normal,        //线过某点的法线，定义向外的方向为正
            "distance":minDistance, //点到线的最短距离
            "lamda":lamda,          //现在所在的位置离终点的比率
            "v":lineVector.cross(normal).normalize()   //定义为点上围绕线作圆周运动的向量。
        };
        return obj;
    };
    //获取线过空间的某点的发现，方向向外为正。
    exports.getNormalVectorOfLine=function(pos,start,end){
        var lineVector=exports.getVector(start,end);
        var vector=exports.getVector(start,pos);
    };
    //获取摄像头的某一距离的平面区域，该方法忽略摄像头的方向，使用默认的[0 0 -1 0]
    var defaultCamera={
        "aspectRatio":16/9,                                           //摄像头的横纵比
        "heightAngle":Math.PI/4,                                      //摄像机的垂直视角
        "position":new SFVec3f(0,0,0),                                 //摄像头的位置
        "orientation":new SFRotation(0,0,-1,0)                        //摄像头的方向，忽略
    };   //默认摄像头对象
    exports.getVisualArea=function(distance,camera){
        if(!camera){ //如果没有设置camera参数则设置默认摄像头对象
            log.debug("#Calculate.getVisualArea#使用默认的camera");
            camera=defaultCamera;
        }
        var dir=new SFVec3f(0,0,-1);                  //摄像头方向
        var position=camera.position;                //获取设想头的位置
        var halfH=distance*Math.tan(camera.heightAngle/2);
        var halfW=halfH*camera.aspectRatio;
        var centerAreaPoint=position.add(dir.multiply(distance));
        var leftBottomPoint=new SFVec3f(centerAreaPoint.x-halfW,centerAreaPoint.y-halfH,centerAreaPoint.z);
        var rightTopPoint=new SFVec3f(centerAreaPoint.x+halfW,centerAreaPoint.y+halfH,centerAreaPoint.z);
        return {"leftBottom":leftBottomPoint,"rightTop":rightTopPoint};
    };
    //在角度和弧度之间换算
    exports.calRadian=function(angle){
        return (angle*Math.PI)/180;
    };
    exports.calAngle=function(radian){
        return (180*radian)/Math.PI;
    };
    //将obj从fruitArray中删除
    exports.remove=function(array,obj){
        for(var i=0;i<array.length;i++){
            if(array[i]==obj){
                return array.splice(i,1);
            }
        }
        return null;
    };
    //获取下一刻的速度向量
    var defaultVObj={       //默认的速度的相关信息对象，向z轴负方向的匀速运动
        "v":new SFVec3f(0,0,-1),              //速度向量
        "a":new SFVec3f(0,0,0),              //加速度向量
        "af":new SFVec3f(0,0,0)              //改变力向量
    };
    exports.getNextVObj=function(vobj,dt){      //v的方向是会变化的，方向决定于v,a,af.
        if(!vobj){
            vobj=defaultVObj;
        }
        var af=vobj.af;
        var nextA=vobj.a.add(af.multiply(dt));
        var nextV=vobj.v.add(vobj.a.multiply(dt));
        vobj.v=nextV;
        vobj.a=nextA;
        vobj.af=af;
        return vobj;
    };
    var defaultSpeed={
        "v":new SFVec3f(0,0,-1),
        "a":0,
        "af":0
    };
    exports.getNextSpeedObj=function(vobj,dt){   //v的方向是不会变化的，方向只决定于v.
        if(!vobj){
            vobj=defaultSpeed;
        }
        var af=vobj.af;
        var nextA=vobj.a+af*dt;
        var nV=vobj.v.normalize();      //速度的方向
        var nextV=vobj.v.add(nV.multiply(vobj.a*dt));
        vobj.v=nextV;
        vobj.a=nextA;
        vobj.af=af;
        return vobj;
    };
    exports.getNextPosition=function(s0,v,dt){
        var s1=s0.add(v.multiply(dt));
        return s1;
    };
    //移动物体到某地或跟踪某物体
    var  moveObj={      //移动对象的格式
        "type":"linear",
        "source":[],      //移动的源
        "target":null,      //移动的目标，可以是位置或节点
        "speed":{
            "v":new SFVec3f(0,0,0),        //初始速度向量
            "a":0,                          //加速度
            "af":0
        },
        "args":{                        //路径算法的配置参数
            "distance":[],              //距离相关的参数数组
            "angle":[],                 //角度相关的参数数组
            "axis":[]                   //旋转轴相关的参数数组
        },
        "startLocation":null,
        "startSpeed":0,                    //初速度
        "maxSpeed":0,                      //结束速度
        "eRange":0.1                       //误差范围
    };
    exports.move=function(moveObj,dt){
        if(!moveObj){
            return false;
        }
        var targetPos=null;
        if(moveObj.target instanceof SFNode){   //跟踪节点
            targetPos=moveObj.target.translation;
        }else{    //目标对象为一个点
            targetPos=moveObj.target;
        }
        //移动之前判断是否到达目标上
        var distance=exports.getVector(moveObj.source[0].translation,targetPos).length();
        if(distance<=moveObj.eRange){   //初始化判断，如果初始位置符合要求，则直接返回
            return true;
        }
        //移动之前调整速度方向
        moveObj.speed.v=adjustSpeed(moveObj);
        //多个源节点一起移动
        for(var i=0;i<moveObj.source.length;i++){
            moveObj.source[i].translation.setValue(exports.getNextPosition(moveObj.source[i].translation,moveObj.speed.v,dt));    //移动
        }
        moveObj.speed=exports.getNextSpeedObj(moveObj.speed,dt);        //以下获取下一次使用的moveObj
        //移动之后调整速度方向
        moveObj.speed.v=adjustSpeed(moveObj);
        //判断是否打中
        distance=exports.getVector(moveObj.source[0].translation,targetPos).length();
        if(distance<=moveObj.eRange){
            return true;
        }else{
            return false;
        }
    };
    //曲线攻击路线的算法     linear
    /*function getCurveSpeedVector(source,target ){

    }*/
    //调整速度对象
    function adjustSpeed(moveObj){
        var targetPos=null;
        if(moveObj.target instanceof SFNode){   //跟踪节点
            targetPos=moveObj.target.translation;
        }else{    //目标对象为一个点
            targetPos=moveObj.target;
        }
        var speedVector=nextSpeed({
            "type":moveObj.type,
            "sourcePos":moveObj.source[0].translation,
            "targetPos":targetPos,
            "startLocation":moveObj.startLocation,
            "args":moveObj.args,
            "speed":moveObj.speed.v.length(),
            "maxSpeed":moveObj.maxSpeed
        });
        return speedVector;
    }
    //根据射击路线类型获取下一个速度向量
    var shootRouteObj={     //射击路线对象的格式
        "type":"linear",           //射击路线类型
        "sourcePos":null,          //子弹位置
        "targetPos":null,          //目标位置
        "startLocation":null,     //开始位置
        "args":{
            "distance":[],              //距离相关的参数数组
            "angle":[],                 //角度相关的参数数组
            "axis":[],                 //旋转轴相关的参数数组
            "speed":[]
        },
        "speed":0,
        "maxSpeed":0
    };
    function nextSpeed(shootRouteObj){
        var speedVector=null;
        switch(shootRouteObj.type){
            case "linear":
                speedVector=exports.getVector(shootRouteObj.sourcePos,shootRouteObj.targetPos);
                var nV=speedVector.normalize();
                if(shootRouteObj.speed<shootRouteObj.maxSpeed){
                    return exports.getSpeedVector(nV,shootRouteObj.speed);
                }else{
                    return exports.getSpeedVector(nV,shootRouteObj.maxSpeed);
                }
            case "spiral":
                /**
                 * 参数的配置要求：
                 * distance[0]:弹药发射的位置到发射时目标的位置的距离。
                 * angle[0]:旋转的初始角
                 * axis[0]:旋转轴
                 */
                var beforeSpeed=exports.getVector(shootRouteObj.sourcePos,shootRouteObj.targetPos);
                var n=0;
                if(shootRouteObj.args.distance[0]>=65){ //不衰减
                    n=1;
                }else if(shootRouteObj.args.distance[0]>=35){
                    n=1/1.5;
                }else if(shootRouteObj.args.distance[0]>=25){
                    n=1/3;
                }else{
                    n=1/8;
                }
                var angle=Math.pow((beforeSpeed.length()/shootRouteObj.args.distance[0]),2)*(shootRouteObj.args.angle[0]*n);
                var rotate=new SFRotation(shootRouteObj.args.axis[0],angle);
                speedVector=rotate.multVec(beforeSpeed);
                var nV=speedVector.normalize();
                if(shootRouteObj.speed<shootRouteObj.maxSpeed){
                    return exports.getSpeedVector(nV,shootRouteObj.speed);
                }else{
                    return exports.getSpeedVector(nV,shootRouteObj.maxSpeed);
                }
            case "rotate":
                var obj=exports.analysisPos2Line(shootRouteObj.sourcePos,shootRouteObj.startLocation,shootRouteObj.targetPos);
                var dir;
                if(shootRouteObj.speed<shootRouteObj.maxSpeed){ //获取朝向目标前进的速度向量
                    dir=exports.getSpeedVector(obj.dir,shootRouteObj.speed);
                }else{
                    dir=exports.getSpeedVector(obj.dir,shootRouteObj.maxSpeed);
                }
                var normal=obj.normal;
                var nV;
                if(obj.lamda<=shootRouteObj.args.distance[0]){ //离心运动
                    normal=exports.getSpeedVector(normal,shootRouteObj.args.speed[2]);  //获取圆周运动的向心速度向量
                    nV=exports.getSpeedVector(obj.v,shootRouteObj.args.speed[0]+(shootRouteObj.args.speed[1]-shootRouteObj.args.speed[0])*obj.lamda);      //获取圆周运动的切向速度向量
                }else if(obj.lamda<=shootRouteObj.args.distance[1]){//即非离心又非向心
                    normal=new SFVec3f(0,0,0);
                    nV=exports.getSpeedVector(obj.v,shootRouteObj.args.speed[1]);      //获取圆周运动的切向速度向量
                }else if(obj.lamda<=shootRouteObj.args.distance[2]){   //向心运动
                    if(obj.distance<=1){
                        normal=new SFVec3f(0,0,0);
                        nV=new SFVec3f(0,0,0);              //获取圆周运动的切向速度向量
                    }else{
                        normal=exports.getSpeedVector(normal,2*shootRouteObj.args.speed[1]);  //获取圆周运动的向心速度向量
                        normal=normal.negate();
                        nV=exports.getSpeedVector(obj.v,shootRouteObj.args.speed[1]);      //获取圆周运动的切向速度向量
                    }
                }else{  //不再旋转
                    speedVector=exports.getVector(shootRouteObj.sourcePos,shootRouteObj.targetPos);
                    var nVector=speedVector.normalize();
                    if(shootRouteObj.speed<shootRouteObj.maxSpeed){
                        return exports.getSpeedVector(nVector,shootRouteObj.speed);
                    }else{
                        return exports.getSpeedVector(nVector,shootRouteObj.maxSpeed);
                    }
                }
                return dir.add(nV).add(normal);
        }
    }

});