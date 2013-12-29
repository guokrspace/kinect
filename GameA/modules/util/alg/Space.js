/**
 * �ռ���(��,��,��)�ļ���
 * User: yaoxx
 * Date: 12-2-8
 * Time: ����2:13
 */
define(function (require, exports, module) {
    var root = this, state = false,
        log = require("core/Logger").getLog();

    var Line={       //�ߵĶ����ʽ
        "start":new SFVec3f(0,0,0),     //�ߵĿ�ʼ��
        "dir":new SFVec3f(0,0,-1),      //�ߵķ���ʸ��
        "end":new SFVec3f(0,0,1)        //�ߵĽ����㣨��Χ��
    };
    var Face={      //��Ķ����ʽ
        "position":new SFVec3f(0,0,0),   //���ϵ�һ��
        "normal":new SFVec3f(0,1,0),   //��ķ���
        "area":{
            "shape":"circle",       //��ȡ"polygon","circle"
            "args":[]                //���ڶ���Σ�args������Ƕ���ΰ�˳ʱ�����ʱ��ĸ���,������Բ�����ǰ뾶
        }
    };

    /*��ȡ��Ķ���*/
    exports.getInterpolatePoint=function(startPos,endPos,radio){    //��ȡ����֮���ֵ��
        if(radio>=1){
            return endPos;
        }
        if(radio<=0){
            return startPos;
        }
        return startPos.slerp(endPos,radio);
    };
    /*��ȡ�ߵĶ���*/
    exports.getLine=function(startPos,endPos){
        var vector=exports.getVector(startPos,endPos);
        if(exports.isZeroVector(vector)){   //����������
            return null;
        }
        return {
            "start":startPos,
            "dir":vector.normalize(),
            "end":endPos
        };
    };
    /*��ȡ��Ķ���*/
    exports.getFace=function(pointList){       //��һϵ�е��ȡһ����,����ķ��������������������
        if(pointList.length<3){
            return null;
        }
        if(exports.isCoplanar(pointList)){      //����
            var p1=exports.getVector(pointList[0],pointList[1]);
            var p2=exports.getVector(pointList[1],pointList[2]);
            var verticalVector=p1.cross(p2);
            verticalVector=verticalVector.normalize();
            return {
                "position":p1,
                "normal":verticalVector,
                "area":{
                    "shape":"polygon",
                    "args":pointList
                }
            };
        }
        return null;
    };
    exports.getFace2=function(line1,line2){
        var verticalVector=line1.dir.cross(line2.dir);
        if(exports.isZeroVector(verticalVector)){
           return null;
        }
        verticalVector=verticalVector.normalize();
        return {
            "position":line1.start,
            "normal":verticalVector
        };
    };


    /*�㵽��Ĺ�ϵ*/
    exports.parseP2P=function(pos1,pos2){
        var vector=exports.getVector(pos1,pos2);
        if(exports.isZeroVector(vector)){       //�����������Ĵ���
            return {
                "distance":0
            };
        }
        var distance=vector.length();
        return {
            "distance":distance,                    //����ľ���
            "dir":vector.normalize(),                //����ĳ���
            "dirCos":new SFVec3f(vector.x/distance,vector.y/distance,vector.z/distance)     //����ķ�������
        };
    };
    /*�㵽�ߵĹ�ϵ*/
    exports.parseP2L=function(pos,line){
        var vector1=exports.getVector(line.start,pos);
        var referVector=exports.getVector(line.start,line.end);
        var decObj=exports.decomposition(vector1,referVector);      //�����ֽ���������
        var angle=exports.getAngle(line.dir,vector1);
        var sign=1;
        if(angle>Math.PI/2){   //ӳ������ߵ������ӳ�����
            sign=-1;
        }
        if(exports.isZeroVector(decObj.vertical)){  //����
            return {
                "distance":0,
                "mapPosRadio":sign*decObj.parallel.length()/referVector.length()
            };
        }else{  //������
            return {
                "distance":decObj.vertical.length(),
                "mapPosRadio":sign*decObj.parallel.length()/referVector.length(),
                "normal":decObj.vertical.normalize()
            };
        }

    };
    /*�㵽��Ĺ�ϵ*/
    exports.parseP2F=function(pos,face){
        var vector=exports.getVector(face.position,pos);
        var signDistance=vector.dot(face.normal);
        var tempVector=face.normal.multiply(signDistance);
        tempVector=vector.subtract(tempVector);
        return {
            "signDistance":signDistance,        //�з��ŵľ��룬Ϊ����ʾΪ����һ��ģ�Ϊ����ʾ������һ�࣬Ϊ��ʱ��ʾ������
            "mapPos":tempVector.add(face.position)
        };
    };
    /*�ߵ��ߵĹ�ϵ*/
    exports.parseL2L=function(line1,line2){
        var ss=exports.getVector(line1.start,line2.start);
        var deta=exports.getHybridProduct(ss,line1.dir,line2.dir);
        var angle=exports.getAngle(line1.dir,line2.dir);
        var angle2=exports.getAngle(line1.dir,ss);
        var distance,normal=null,type;
        if(deta!=0){        //����Ϊ����
            type=0;
            distance=Math.abs(deta)/(line1.dir.cross(line2.dir).length);
            normal=line1.dir.cross(line2.dir).normalize();
        }else if(angle!=0&&angle!=Math.PI){   //����Ϊ�ཻ
            type=1;
            distance=0;
            normal=line1.dir.cross(line2.dir).normalize();
        }else if((angle==0||angle==Math.PI)&&(angle2!=0&&angle2!=Math.PI)){ //����Ϊƽ��
            type=2;
            var decObj=exports.decomposition(ss,line1.dir);
            distance=decObj.vertical.length();
        }else{  //����Ϊ�غ�
            type=3;
            distance=0;
        }
        return {
            "type":type,
            "distance":distance,
            "angle":angle,
            "normal":normal
        };
    };
    /*�ߵ���Ĺ�ϵ*/
    exports.parseL2F=function(line,face){
        var lineVector=exports.getVector(line.start,line.end);
        var dotValue=face.normal.dot(line.dir);
        var decObj=exports.decomposition(lineVector,face.normal);
        var angle=Math.asin(Math.abs(face.normal.dot(line.dir)));
        return {
            "angle":angle,
            "map":decObj.vertical,
            "vertical":decObj.parallel
        };
    };
    /*�浽��Ĺ�ϵ*/
    exports.parseF2F=function(face1,face2){
        var angle=Math.acos(Math.abs(face1.normal.dot(face2.normal)));
        var crossLineDir=null;
        if(angle!=0){   //��ƽ���ཻ
            crossLineDir=face1.normal.cross(face2.normal).normalize();
        }
        return {
            "angle":angle,
            "crossLineDir":crossLineDir
        };
    };
    /*�жϵ��Ƿ�������*/
    exports.isBelongLine=function(pos,line){
        var side1=exports.getVector(line.start,pos).length();
        var side2=exports.getVector(line.end,pos).length();
        var side3=exports.getVector(line.start,line.end).length();
        if(side1+side2==side3){     //�ڴ��߶���
            return true;
        }else{
            return false;
        }
    };
    exports.isBelongFace=function(pos,face){
        var vector=exports.getVector(face.position,pos);
        if(vector.dot(face.normal)==0){ //����
            return true;
        }else{
            return false;
        }
    };

    /**
     * ������ص��㷨
     */
    //�ж�һ�����������0 0 0
    exports.isZeroVector=function(p){
      if(p.x==0&&p.y==0&&p.z==0){
          return true;
      }
      return false;
    };
    //��ȡ����
    exports.getVector=function(startPos,endPos){
        return new SFVec3f(endPos.x-startPos.x,endPos.y-startPos.y,endPos.z-startPos.z);
    };
    //��ȡ��ʸ���Ļ�ϻ�
    exports.getHybridProduct=function(a,b,c){
        return (a.cross(b)).dot(c);
    };
    //��ȡ��ʸ����˫�����
    exports.getDoubleOuterProduct=function(a,b,c){
        return (a.cross(b)).cross(c);
    };
    //��ȡ�������ļн�
    exports.getAngle=function(p1,p2){
        return Math.acos(p1.dot(p2)/(p1.length()*p2.length()));
    }
    //��ȡӳ������
    exports.decomposition=function(vector,referVector){
        var lamda=vector.dot(referVector)/(referVector.length()*referVector.length());
        var parallel=referVector.multiply(lamda);
        var vertical=vector.subtract(parallel);
        return {
            "parallel":parallel,
            "vertical":vertical
        };
    };
    //�ж�һϵ�е�(��ʸ��)�Ƿ���
    exports.isCoplanar=function(pointOrVectorSet,type){
        if(!type){  //Ĭ��ֵΪ
            type="point";
        }
        if(type=="vector"){
            var vectorArray=pointOrVectorSet;
            if(vectorArray.length<3){
                return true;
            }
            for(var i=0;i<vectorArray.length-2;i++){
                if(exports.getHybridProduct(vectorArray[i],vectorArray[i+1],vectorArray[i+2])!=0){
                    return false;
                }
            }
            return true;
        }else if(type=="point"){  //type="point"
            var pointSet=pointOrVectorSet;
            if(pointSet.length<=3){
                return true;
            }
            var vectorArray=[];
            for(var i=0;i<pointSet.length-1;i++){
                vectorArray[i]=exports.getVector(pointSet[i],pointSet[i+1]);
            }
            for(var i=0;i<vectorArray.length-2;i++){
                if(exports.getHybridProduct(vectorArray[i],vectorArray[i+1],vectorArray[i+2])!=0){
                    return false;
                }
            }
        }
    };
    //�ж��������Ƿ���
    exports.isCollinear=function(pointOrVectorSet,type){
        if(!type){
            type="point";
        }
        if(type=="vector"){
            var vectorArray=pointOrVectorSet;
            if(vectorArray<2){
                return true;
            }
            for(var i=0;i<vectorArray.length-1;i++){
                if(exports.isZeroVector(vectorArray[i].cross(vectorArray[i+1]))){
                    return false;
                }
            }
            return true;

        }else if(type=="point"){
            var pointSet=pointOrVectorSet;
            if(pointSet.length<=2){
                return true;
            }
            var vectorArray=[];
            for(var i=0;i<pointSet.length-1;i++){
                vectorArray[i]=exports.getVector(pointSet[i],pointSet[i+1]);
            }
            for(var i=0;i<vectorArray.length-1;i++){
                if(exports.isZeroVector(vectorArray[i].cross(vectorArray[i+1]))){
                    return false;
                }
            }
            return true;
        }
    }
});