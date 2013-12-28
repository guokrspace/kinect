
define({
    "mode":"run",     //"debug"Ϊ����ģʽ,"run"Ϊ����ģʽ
    "fruits": [
        {"file":"001.lyx","name":"caomei","attackRoute":"linear","id":0},
        {"file":"002.lyx","name":"pingguo","attackRoute":"linear","id":1},
        {"file":"003.lyx","name":"huolongguo","attackRoute":"rotate","id":2},
        {"file":"005.lyx","name":"xiangjiao","attackRoute":"spiral","id":3},
        {"file":"006.lyx","name":"xigua","attackRoute":"spiral","id":4},
        {"file":"007.lyx","name":"boluo","attackRoute":"spiral","id":5},
        {"file":"008.lyx","name":"chengzi","attackRoute":"rotate","id":6},
        {"file":"009.lyx","name":"mihoutao","attackRoute":"rotate","id":7},
        {"file":"010.lyx","name":"li","attackRoute":"spiral","id":8},
        {"file":"011.lyx","name":"shiliu","attackRoute":"spiral","id":9}
    ],
    "tranUFO":{"file":"ufo/main.lyx","name":"����ɴ�","id":0},
    "area":{
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
            "visualFace":50
        },
        "distance":0,       //���ڻ�ȡ��������ͷĳһ����Ŀ�����
        "gap":2             //����Ŀɱ䷶Χ
    },
    "speed":{
        "goSpeed":{         //�н��ٶ�
            "v0":0.3,         //���ٶ�
            "v1":0.5,         //����ٶ�
            "a":0.01,            //���ٶ�
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
