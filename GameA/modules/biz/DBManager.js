/**
 * 存取成绩信息的业务逻辑.
 * User: yaoxx
 * Date: 12-2-21
 * Time: 下午5:21
 */
define(function (require, exports, module) {
    var root = this, state = false,
        log = require("core/Logger").getLog();
    var path="earthDefend/db.js";   //保存成绩记录的文件路径
    var pathDir="earthDefend/test";    //保存骨骼文件的文件路径
    var limitNum=100;                   //保存成绩记录的数量
    var recordNum=5;                    //用于显示的记录的数量

    exports.init = function () {
        if (!state) {
            state = true;
        }
    };

	exports.dbExist = function(){
		if(state){
			return File.exists(path);
		}
	};

    exports.save=function(obj,func){
	    if(state){
		    var file = new File(path);
		    file.open();
		    var str = file.read();
		    var scoreArray = null;
		    if (!str) {   //文件为空
			    scoreArray = [];
		    } else {
                try{
                    scoreArray = JSON.parse(str);
                }catch(e1){ //尝试修复
                    var startIndex=str.indexOf("[");
                    var endIndex=str.indexOf("]");
                    if(startIndex!=-1&&endIndex!=-1){
                        str=str.substring(startIndex,endIndex+1);
                    }else if(startIndex!=-1&&endIndex==-1){
                        str=str+"]";
                        str=str.substring(startIndex);
                    }else if(startIndex==-1&&endIndex!=-1){
                        str="["+str;
                        str=str.substring(0,endIndex+2);
                    }else if(startIndex==-1&&endIndex==-1){
                        str="["+str+"]";
                    }
                    try{
                        scoreArray=JSON.parse(str);
                    }catch(e2){
                        log.error("文件内容被破坏！");
                        scoreArray=[];
                    }
                }
		    }
		    var index = getInsertIndex(obj, scoreArray);
		    if (index < limitNum) {  //将obj插入到数组中
			    scoreArray.splice(index, 0, obj);
			    if (scoreArray.length > limitNum) {  //长度大于100
//                scoreArray.length=limitNum; //去除索引大于等于100的记录
				    scoreArray.splice(limitNum, scoreArray.length - limitNum + 1);
			    }
		    }
		    var data = scoreArray.slice(0, recordNum); //抽取前5条记录，用于显示输出
		    file.close();
		    File.remove(path);
		    file = new File(path); //重新创建文件
		    file.open();
		    file.write(JSON.stringify(scoreArray));
		    file.close();
		    //回调函数
		    func(data);
	    }
    };
    /**
     * 用于保存骨骼数据到data.js文件中。
     * @param datas:骨骼数据数组
     */
    exports.saveSkeData=function(datas){
        if(!datas){
            log.debug("数据不存在！");
            return;
        }
        var fileName=pathDir+"/data"+Math.round(Date.now())+".js";  //生成(全限)文件名
        if(File.exists(fileName)){  //存在该文件时
            File.remove(fileName);  //删除文件
        }
        //新建文件
        var file = new File(fileName);
        file.open();
        var str=JSON.stringify(datas);
        file.write("define("+str+");");
        file.close();
    };

    //查找obj插入到array中的所属位置索引
    function getInsertIndex(obj,array){
        if(array.length==0){
            return 0;
        }
        var index=0;
        for(var i=0;i<array.length;i++){
            if(obj.sumScore>array[i].sumScore){
                index=i;
                break;
            }
        }
        if(i==array.length){
            index=array.length;
        }
        return index;
    }

    exports.destroy = function () {
        if (state) {
            state = false;
        }
    };
});