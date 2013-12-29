/**
 * 空间量(点,线,面)的计算
 * User: yaoxx
 * Date: 12-2-8
 * Time: 下午2:13
 */
define(function (require, exports, module) {
    var root = this, state = false,
        log = require("core/Logger").getLog();

    var Line={       //线的对象格式
        "start":new SFVec3f(0,0,0),     //线的开始点
        "dir":new SFVec3f(0,0,-1),      //线的方向矢量
        "end":new SFVec3f(0,0,1)        //线的结束点（范围）
    };
    var Face={      //面的对象格式
        "position":new SFVec3f(0,0,0),   //面上的一点
        "normal":new SFVec3f(0,1,0),   //面的法线
        "area":{
            "shape":"circle",       //可取"polygon","circle"
            "args":[]                //对于多边形，args数组就是多边形按顺时针或逆时针的各点,而对于圆形则是半径
        }
    };

    /*获取点的对象*/
    exports.getInterpolatePoint=function(startPos,endPos,radio){    //获取两点之间插值点
        if(radio>=1){
            return endPos;
        }
        if(radio<=0){
            return startPos;
        }
        return startPos.slerp(endPos,radio);
    };
    /*获取线的对象*/
    exports.getLine=function(startPos,endPos){
        var vector=exports.getVector(startPos,endPos);
        if(exports.isZeroVector(vector)){   //对于零向量
            return null;
        }
        return {
            "start":startPos,
            "dir":vector.normalize(),
            "end":endPos
        };
    };
    /*获取面的对象*/
    exports.getFace=function(pointList){       //由一系列点获取一个面,方向的方向由右手螺旋定理决定
        if(pointList.length<3){
            return null;
        }
        if(exports.isCoplanar(pointList)){      //共面
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


    /*点到点的关系*/
    exports.parseP2P=function(pos1,pos2){
        var vector=exports.getVector(pos1,pos2);
        if(exports.isZeroVector(vector)){       //对于零向量的处理
            return {
                "distance":0
            };
        }
        var distance=vector.length();
        return {
            "distance":distance,                    //两点的距离
            "dir":vector.normalize(),                //两点的朝向
            "dirCos":new SFVec3f(vector.x/distance,vector.y/distance,vector.z/distance)     //两点的方向余弦
        };
    };
    /*点到线的关系*/
    exports.parseP2L=function(pos,line){
        var vector1=exports.getVector(line.start,pos);
        var referVector=exports.getVector(line.start,line.end);
        var decObj=exports.decomposition(vector1,referVector);      //向量分解后的向量组
        var angle=exports.getAngle(line.dir,vector1);
        var sign=1;
        if(angle>Math.PI/2){   //映射点在线的起点的延长线上
            sign=-1;
        }
        if(exports.isZeroVector(decObj.vertical)){  //共线
            return {
                "distance":0,
                "mapPosRadio":sign*decObj.parallel.length()/referVector.length()
            };
        }else{  //不共线
            return {
                "distance":decObj.vertical.length(),
                "mapPosRadio":sign*decObj.parallel.length()/referVector.length(),
                "normal":decObj.vertical.normalize()
            };
        }

    };
    /*点到面的关系*/
    exports.parseP2F=function(pos,face){
        var vector=exports.getVector(face.position,pos);
        var signDistance=vector.dot(face.normal);
        var tempVector=face.normal.multiply(signDistance);
        tempVector=vector.subtract(tempVector);
        return {
            "signDistance":signDistance,        //有符号的距离，为正表示为法线一侧的，为负表示法线另一侧，为零时表示在面上
            "mapPos":tempVector.add(face.position)
        };
    };
    /*线到线的关系*/
    exports.parseL2L=function(line1,line2){
        var ss=exports.getVector(line1.start,line2.start);
        var deta=exports.getHybridProduct(ss,line1.dir,line2.dir);
        var angle=exports.getAngle(line1.dir,line2.dir);
        var angle2=exports.getAngle(line1.dir,ss);
        var distance,normal=null,type;
        if(deta!=0){        //两线为异面
            type=0;
            distance=Math.abs(deta)/(line1.dir.cross(line2.dir).length);
            normal=line1.dir.cross(line2.dir).normalize();
        }else if(angle!=0&&angle!=Math.PI){   //两线为相交
            type=1;
            distance=0;
            normal=line1.dir.cross(line2.dir).normalize();
        }else if((angle==0||angle==Math.PI)&&(angle2!=0&&angle2!=Math.PI)){ //两线为平行
            type=2;
            var decObj=exports.decomposition(ss,line1.dir);
            distance=decObj.vertical.length();
        }else{  //两线为重合
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
    /*线到面的关系*/
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
    /*面到面的关系*/
    exports.parseF2F=function(face1,face2){
        var angle=Math.acos(Math.abs(face1.normal.dot(face2.normal)));
        var crossLineDir=null;
        if(angle!=0){   //两平面相交
            crossLineDir=face1.normal.cross(face2.normal).normalize();
        }
        return {
            "angle":angle,
            "crossLineDir":crossLineDir
        };
    };
    /*判断点是否在线上*/
    exports.isBelongLine=function(pos,line){
        var side1=exports.getVector(line.start,pos).length();
        var side2=exports.getVector(line.end,pos).length();
        var side3=exports.getVector(line.start,line.end).length();
        if(side1+side2==side3){     //在此线段上
            return true;
        }else{
            return false;
        }
    };
    exports.isBelongFace=function(pos,face){
        var vector=exports.getVector(face.position,pos);
        if(vector.dot(face.normal)==0){ //共面
            return true;
        }else{
            return false;
        }
    };

    /**
     * 向量相关的算法
     */
    //判断一个点或向量是0 0 0
    exports.isZeroVector=function(p){
      if(p.x==0&&p.y==0&&p.z==0){
          return true;
      }
      return false;
    };
    //获取向量
    exports.getVector=function(startPos,endPos){
        return new SFVec3f(endPos.x-startPos.x,endPos.y-startPos.y,endPos.z-startPos.z);
    };
    //获取三矢量的混合积
    exports.getHybridProduct=function(a,b,c){
        return (a.cross(b)).dot(c);
    };
    //获取三矢量的双重外积
    exports.getDoubleOuterProduct=function(a,b,c){
        return (a.cross(b)).cross(c);
    };
    //获取两向量的夹角
    exports.getAngle=function(p1,p2){
        return Math.acos(p1.dot(p2)/(p1.length()*p2.length()));
    }
    //获取映射向量
    exports.decomposition=function(vector,referVector){
        var lamda=vector.dot(referVector)/(referVector.length()*referVector.length());
        var parallel=referVector.multiply(lamda);
        var vertical=vector.subtract(parallel);
        return {
            "parallel":parallel,
            "vertical":vertical
        };
    };
    //判断一系列点(或矢量)是否共面
    exports.isCoplanar=function(pointOrVectorSet,type){
        if(!type){  //默认值为
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
    //判断两向量是否共线
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