
define({
    "mode":"run",     //"debug"Ϊ����ģʽ,"run"Ϊ����ģʽ
    "fruits": [
        {"file":"002.lyx","name":"apple","whichID":2,scale:"2.5","id":0},
        {"file":"005.lyx","name":"banana","whichID":5,scale:"2.5","id":1},
        {"file":"008.lyx","name":"orange","whichID":8,scale:"2.5","id":2},
        {"file":"017.lyx","name":"grapes","whichID":17,scale:"2.5","id":3},
        {"file":"016.lyx","name":"tomato","whichID":16,"scale":"2.5","id":4},
        {"file":"015.lyx","name":"cucumber","whichID":15,"scale":"1.8","id":5},
        {"file":"014.lyx","name":"coconut","whichID":14,"scale":"2.5","id":6},
        {"file":"013.lyx","name":"lemon","whichID":13,"scale":"2.5","id":7},
        {"file":"012.lyx","name":"carrot","whichID":12,"scale":"2.0","id":8},
        {"file":"001.lyx","name":"strawberry","whichID":1,scale:"3.7","id":9},
        {"file":"006.lyx","name":"watermelon","whichID":6,scale:"2.0","id":10},
        {"file":"007.lyx","name":"pineapple","whichID":7,scale:"2.0","id":11}
    ],
    "tranUFO":{"file":"ufo/main.lyx","name":"����ɴ�","id":0},
    "area":{
        "areaNum":3,        //�������������
        "areas":[           //����ķ�Χ
            {"minAngle":10,"maxAngle":83},
            {"minAngle":84,"maxAngle":97},
            {"minAngle":98,"maxAngle":170}
        ],
        "algorithm":{
            "name":"Around2Center",  //ѡȡָ������λ�õ��㷨
            "args":[]            //�㷨�Ĳ���
        }
    },
    "visual":{
        "camera":{      //����ͷ
            "aspectRatio":4/3,                                           //����ͷ�ĺ��ݱ�
            "heightAngle":0.3,                                      //������Ĵ�ֱ�ӽ�
            "position":new SFVec3f(0,0,0),                                 //����ͷ��λ��
            "orientation":new SFRotation(0,0,-1,0)                        //����ͷ�ķ��򣬺���
        },
        "face":{
            "visualNear":50,
            "visualFar":70,
            "visualFace":20
        },
        "distance":0,       //���ڻ�ȡ��������ͷĳһ����Ŀ�����
        "gap":2             //����Ŀɱ䷶Χ
    },
    "attackRoute":["linear","spiral","rotate"],
    "speed":{
        "goSpeed":{         //�н��ٶ�
            "v0":3,         //���ٶ�
            "v1":3,         //����ٶ�
            "a":0,            //���ٶ�
            "af":0,           //���ٶȵ������ٶ�
            "e":0.1           //���
        },
        "fightSpeed":{     //����ˮ���ٶ�
            "v0":10,
            "v1":30,
            "a":12,
            "af":0,
            "e":0.5
        },
        "yieldSpeed":{    //ˮ�������ص��ٶ�
            "v0":20,
            "v1":30,
            "a":4,
            "af":0,
            "e":0.5
        },
        "flybackSpeed":{
            "v0":40,
            "v1":60,
            "a":8,
            "af":0,
            "e":0.8
        },
        "escapeSpeed":{   //�����ٶ�
            "v0":15,
            "v1":40,
            "a":10,
            "af":0,
            "e":0.5
        },

        "hurlSpeed":{    //ˮ�������ٶ�
            "v0":10,
            "v1":100,
            "a":25,
            "af":0,
            "e":1.2
        }
    }
});
