/**
 * ��ѧ������صĺ������㷨.
 * User: yaoxx
 * Date: 12-2-1
 * Time: ����12:06
 */
define(function (require, exports, module) {
    var root = this,
        log = require("core/Logger").getLog();

    //��ȡ[min,max)֮��������
    exports.getRandomNum=function(num1,num2){
        if(num1==num2){
            return num1;
        }
        var min=Math.min(num1,num2);
        var max=Math.max(num1,num2);
        return Math.random()*(max-min)+min;
    };
    //��ȡ[min,max]֮�������
    exports.getRandomIntNum=function(num1,num2){
        if(num1==num2){
            return Math.floor(num1);
        }
        var min=Math.min(num1,num2);
        var max=Math.max(num1,num2);
        return Math.floor(Math.random()*(max-min+1)+min);
    };
    //��ʽradio=(x-min)/(max-min)����ȡx��ֵ������ȡ��ֵָ�����ʵ�ֵ��
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
    //��ȡ���������
    exports.getVector=function(startPos,endPos){
        if(!endPos||!startPos){
            log.debug("#Calculate.getVector#����û����ʼ�����ֹ��");
            return new SFVec3f(0,0,0);
        }
        return new SFVec3f(endPos.x-startPos.x,endPos.y-startPos.y,endPos.z-startPos.z);
    };
    exports.getALVector=function(startPos,endPos,length){   //ָ�������ĳ���
        if(!endPos||!startPos){
            log.debug("#Calculate.getVector#����û����ʼ�����ֹ��");
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
    //��ȡ�㵽�ߵľ���,����pos��ʾ�㣬��start��end��ʾ�ߡ�
    exports.analysisPos2Line=function(pos,start,end){
        var lineVector=exports.getVector(start,end);
        var vector=exports.getVector(start,pos);
        if(lineVector.length()==0){   //��ʼ��ͽ������ظ�
            return null;
        }
        if(vector.length()==0){ //��pos��startΪͬһ��
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
            "dir":lineVector,        //�ߵķ���
            "normal":normal,        //�߹�ĳ��ķ��ߣ���������ķ���Ϊ��
            "distance":minDistance, //�㵽�ߵ���̾���
            "lamda":lamda,          //�������ڵ�λ�����յ�ı���
            "v":lineVector.cross(normal).normalize()   //����Ϊ����Χ������Բ���˶���������
        };
        return obj;
    };
    //��ȡ�߹��ռ��ĳ��ķ��֣���������Ϊ����
    exports.getNormalVectorOfLine=function(pos,start,end){
        var lineVector=exports.getVector(start,end);
        var vector=exports.getVector(start,pos);
    };
    //��ȡ����ͷ��ĳһ�����ƽ�����򣬸÷�����������ͷ�ķ���ʹ��Ĭ�ϵ�[0 0 -1 0]
    var defaultCamera={
        "aspectRatio":16/9,                                           //����ͷ�ĺ��ݱ�
        "heightAngle":Math.PI/4,                                      //������Ĵ�ֱ�ӽ�
        "position":new SFVec3f(0,0,0),                                 //����ͷ��λ��
        "orientation":new SFRotation(0,0,-1,0)                        //����ͷ�ķ��򣬺���
    };   //Ĭ������ͷ����
    exports.getVisualArea=function(distance,camera){
        if(!camera){ //���û������camera����������Ĭ������ͷ����
            log.debug("#Calculate.getVisualArea#ʹ��Ĭ�ϵ�camera");
            camera=defaultCamera;
        }
        var dir=new SFVec3f(0,0,-1);                  //����ͷ����
        var position=camera.position;                //��ȡ����ͷ��λ��
        var halfH=distance*Math.tan(camera.heightAngle/2);
        var halfW=halfH*camera.aspectRatio;
        var centerAreaPoint=position.add(dir.multiply(distance));
        var leftBottomPoint=new SFVec3f(centerAreaPoint.x-halfW,centerAreaPoint.y-halfH,centerAreaPoint.z);
        var rightTopPoint=new SFVec3f(centerAreaPoint.x+halfW,centerAreaPoint.y+halfH,centerAreaPoint.z);
        return {"leftBottom":leftBottomPoint,"rightTop":rightTopPoint};
    };
    //�ڽǶȺͻ���֮�任��
    exports.calRadian=function(angle){
        return (angle*Math.PI)/180;
    };
    exports.calAngle=function(radian){
        return (180*radian)/Math.PI;
    };
    //��obj��fruitArray��ɾ��
    exports.remove=function(array,obj){
        for(var i=0;i<array.length;i++){
            if(array[i]==obj){
                return array.splice(i,1);
            }
        }
        return null;
    };
    //��ȡ��һ�̵��ٶ�����
    var defaultVObj={       //Ĭ�ϵ��ٶȵ������Ϣ������z�Ḻ����������˶�
        "v":new SFVec3f(0,0,-1),              //�ٶ�����
        "a":new SFVec3f(0,0,0),              //���ٶ�����
        "af":new SFVec3f(0,0,0)              //�ı�������
    };
    exports.getNextVObj=function(vobj,dt){      //v�ķ����ǻ�仯�ģ����������v,a,af.
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
    exports.getNextSpeedObj=function(vobj,dt){   //v�ķ����ǲ���仯�ģ�����ֻ������v.
        if(!vobj){
            vobj=defaultSpeed;
        }
        var af=vobj.af;
        var nextA=vobj.a+af*dt;
        var nV=vobj.v.normalize();      //�ٶȵķ���
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
    //�ƶ����嵽ĳ�ػ����ĳ����
    var  moveObj={      //�ƶ�����ĸ�ʽ
        "type":"linear",
        "source":[],      //�ƶ���Դ
        "target":null,      //�ƶ���Ŀ�꣬������λ�û�ڵ�
        "speed":{
            "v":new SFVec3f(0,0,0),        //��ʼ�ٶ�����
            "a":0,                          //���ٶ�
            "af":0
        },
        "args":{                        //·���㷨�����ò���
            "distance":[],              //������صĲ�������
            "angle":[],                 //�Ƕ���صĲ�������
            "axis":[]                   //��ת����صĲ�������
        },
        "startLocation":null,
        "startSpeed":0,                    //���ٶ�
        "maxSpeed":0,                      //�����ٶ�
        "eRange":0.1                       //��Χ
    };
    exports.move=function(moveObj,dt){
        if(!moveObj){
            return false;
        }
        var targetPos=null;
        if(moveObj.target instanceof SFNode){   //���ٽڵ�
            targetPos=moveObj.target.translation;
        }else{    //Ŀ�����Ϊһ����
            targetPos=moveObj.target;
        }
        //�ƶ�֮ǰ�ж��Ƿ񵽴�Ŀ����
        var distance=exports.getVector(moveObj.source[0].translation,targetPos).length();
        if(distance<=moveObj.eRange){   //��ʼ���жϣ������ʼλ�÷���Ҫ����ֱ�ӷ���
            return true;
        }
        //�ƶ�֮ǰ�����ٶȷ���
        moveObj.speed.v=adjustSpeed(moveObj);
        //���Դ�ڵ�һ���ƶ�
        for(var i=0;i<moveObj.source.length;i++){
            moveObj.source[i].translation.setValue(exports.getNextPosition(moveObj.source[i].translation,moveObj.speed.v,dt));    //�ƶ�
        }
        moveObj.speed=exports.getNextSpeedObj(moveObj.speed,dt);        //���»�ȡ��һ��ʹ�õ�moveObj
        //�ƶ�֮������ٶȷ���
        moveObj.speed.v=adjustSpeed(moveObj);
        //�ж��Ƿ����
        distance=exports.getVector(moveObj.source[0].translation,targetPos).length();
        if(distance<=moveObj.eRange){
            return true;
        }else{
            return false;
        }
    };
    //���߹���·�ߵ��㷨     linear
    /*function getCurveSpeedVector(source,target ){

    }*/
    //�����ٶȶ���
    function adjustSpeed(moveObj){
        var targetPos=null;
        if(moveObj.target instanceof SFNode){   //���ٽڵ�
            targetPos=moveObj.target.translation;
        }else{    //Ŀ�����Ϊһ����
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
    //�������·�����ͻ�ȡ��һ���ٶ�����
    var shootRouteObj={     //���·�߶���ĸ�ʽ
        "type":"linear",           //���·������
        "sourcePos":null,          //�ӵ�λ��
        "targetPos":null,          //Ŀ��λ��
        "startLocation":null,     //��ʼλ��
        "args":{
            "distance":[],              //������صĲ�������
            "angle":[],                 //�Ƕ���صĲ�������
            "axis":[],                 //��ת����صĲ�������
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
                 * ����������Ҫ��
                 * distance[0]:��ҩ�����λ�õ�����ʱĿ���λ�õľ��롣
                 * angle[0]:��ת�ĳ�ʼ��
                 * axis[0]:��ת��
                 */
                var beforeSpeed=exports.getVector(shootRouteObj.sourcePos,shootRouteObj.targetPos);
                var n=0;
                if(shootRouteObj.args.distance[0]>=65){ //��˥��
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
                if(shootRouteObj.speed<shootRouteObj.maxSpeed){ //��ȡ����Ŀ��ǰ�����ٶ�����
                    dir=exports.getSpeedVector(obj.dir,shootRouteObj.speed);
                }else{
                    dir=exports.getSpeedVector(obj.dir,shootRouteObj.maxSpeed);
                }
                var normal=obj.normal;
                var nV;
                if(obj.lamda<=shootRouteObj.args.distance[0]){ //�����˶�
                    normal=exports.getSpeedVector(normal,shootRouteObj.args.speed[2]);  //��ȡԲ���˶��������ٶ�����
                    nV=exports.getSpeedVector(obj.v,shootRouteObj.args.speed[0]+(shootRouteObj.args.speed[1]-shootRouteObj.args.speed[0])*obj.lamda);      //��ȡԲ���˶��������ٶ�����
                }else if(obj.lamda<=shootRouteObj.args.distance[1]){//���������ַ�����
                    normal=new SFVec3f(0,0,0);
                    nV=exports.getSpeedVector(obj.v,shootRouteObj.args.speed[1]);      //��ȡԲ���˶��������ٶ�����
                }else if(obj.lamda<=shootRouteObj.args.distance[2]){   //�����˶�
                    if(obj.distance<=1){
                        normal=new SFVec3f(0,0,0);
                        nV=new SFVec3f(0,0,0);              //��ȡԲ���˶��������ٶ�����
                    }else{
                        normal=exports.getSpeedVector(normal,2*shootRouteObj.args.speed[1]);  //��ȡԲ���˶��������ٶ�����
                        normal=normal.negate();
                        nV=exports.getSpeedVector(obj.v,shootRouteObj.args.speed[1]);      //��ȡԲ���˶��������ٶ�����
                    }
                }else{  //������ת
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