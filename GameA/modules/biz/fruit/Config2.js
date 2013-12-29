
define({
    "mode":"run",     //"debug"为调试模式,"run"为运行模式
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
    "tranUFO":{"file":"ufo/main.lyx","name":"运输飞船","id":0},
    "area":{
        "areaNum":3,        //可视域的区域数
        "areas":[           //区域的范围
            {"minAngle":10,"maxAngle":83},
            {"minAngle":84,"maxAngle":97},
            {"minAngle":98,"maxAngle":170}
        ],
        "algorithm":{
            "name":"Around2Center",  //选取指定区域位置的算法
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
            "visualFace":20
        },
        "distance":0,       //用于获取距离摄像头某一距离的可视域
        "gap":2             //距离的可变范围
    },
    "attackRoute":["linear","spiral","rotate"],
    "speed":{
        "goSpeed":{         //行进速度
            "v0":3,         //初速度
            "v1":3,         //最大速度
            "a":0,            //加速度
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
        "flybackSpeed":{
            "v0":40,
            "v1":60,
            "a":8,
            "af":0,
            "e":0.8
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
