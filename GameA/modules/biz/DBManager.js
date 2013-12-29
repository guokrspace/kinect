/**
 * ��ȡ�ɼ���Ϣ��ҵ���߼�.
 * User: yaoxx
 * Date: 12-2-21
 * Time: ����5:21
 */
define(function (require, exports, module) {
    var root = this, state = false,
        log = require("core/Logger").getLog();
    var path="earthDefend/db.js";   //����ɼ���¼���ļ�·��
    var pathDir="earthDefend/test";    //��������ļ����ļ�·��
    var limitNum=100;                   //����ɼ���¼������
    var recordNum=5;                    //������ʾ�ļ�¼������

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
		    if (!str) {   //�ļ�Ϊ��
			    scoreArray = [];
		    } else {
                try{
                    scoreArray = JSON.parse(str);
                }catch(e1){ //�����޸�
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
                        log.error("�ļ����ݱ��ƻ���");
                        scoreArray=[];
                    }
                }
		    }
		    var index = getInsertIndex(obj, scoreArray);
		    if (index < limitNum) {  //��obj���뵽������
			    scoreArray.splice(index, 0, obj);
			    if (scoreArray.length > limitNum) {  //���ȴ���100
//                scoreArray.length=limitNum; //ȥ���������ڵ���100�ļ�¼
				    scoreArray.splice(limitNum, scoreArray.length - limitNum + 1);
			    }
		    }
		    var data = scoreArray.slice(0, recordNum); //��ȡǰ5����¼��������ʾ���
		    file.close();
		    File.remove(path);
		    file = new File(path); //���´����ļ�
		    file.open();
		    file.write(JSON.stringify(scoreArray));
		    file.close();
		    //�ص�����
		    func(data);
	    }
    };
    /**
     * ���ڱ���������ݵ�data.js�ļ��С�
     * @param datas:������������
     */
    exports.saveSkeData=function(datas){
        if(!datas){
            log.debug("���ݲ����ڣ�");
            return;
        }
        var fileName=pathDir+"/data"+Math.round(Date.now())+".js";  //����(ȫ��)�ļ���
        if(File.exists(fileName)){  //���ڸ��ļ�ʱ
            File.remove(fileName);  //ɾ���ļ�
        }
        //�½��ļ�
        var file = new File(fileName);
        file.open();
        var str=JSON.stringify(datas);
        file.write("define("+str+");");
        file.close();
    };

    //����obj���뵽array�е�����λ������
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