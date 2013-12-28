
define({
    "mode":"run",     //"debug"为调试模式,"run"为运行模式
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
    "tranUFO":{"file":"ufo/main.lyx","name":"运输飞船","id":0},
    "area":{
        "areaNum":3,        //可视域的区域数
        "areas":[           //区域的范围
            {"minAngle":10,"maxAngle":80},
            {"minAngle":85,"maxAngle":95},
            {"minAngle":100,"maxAngle":170}
        ],
        "algorithm":{
            "name":"Down2Top",  //选取指定区域位置的算法
            "args":[]            //算法的参数
        }
    },
    "visual":{
        "camera":{      //摄像头
            "aspectRatio":4/3,                                           //摄像头的横纵比
            "heightAngle":0.3,                                      //摄像机的垂直视角
            "position":new SFVec3f(0,0,0),                                 //摄像头的位置
            "orientation":new SFRotation(0,0,-1,0)                        //摄像头的方向，忽略
        },
        "face":{
            "visualNear":50,
            "visualFar":70,
            "visualFace":50
        },
        "distance":0,       //用于获取距离摄像头某一距离的可视域
        "gap":2             //距离的可变范围
    },
    "speed":{
        "goSpeed":{         //行进速度
            "v0":0.3,         //初速度
            "v1":0.5,         //最大速度
            "a":0.01,            //加速度
            "af":0,           //加速度的增加速度
            "e":0.1           //误差
        },
        "fightSpeed":{     //吸引水果速度
            "v0":10,
            "v1":30,
            "a":12,
            "af":0,
            "e":0.5
        },
        "yieldSpeed":{    //水果被吸回的速度
            "v0":20,
            "v1":30,
            "a":4,
            "af":0,
            "e":0.5
        },
        "escapeSpeed":{   //逃逸速度
            "v0":15,
            "v1":40,
            "a":10,
            "af":0,
            "e":0.5
        },
        "hurlSpeed":{    //水果攻击速度
            "v0":10,
            "v1":100,
            "a":25,
            "af":0,
            "e":1.2
        }
    }
});
