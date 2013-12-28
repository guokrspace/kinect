/**
 * Created with JetBrains WebStorm.
 * User: sungf
 * Date: 13-2-27
 * Time: 下午3:42
 * To change this template use File | Settings | File Templates.
 */
define({
	"global" : {
		"modelBasePath":"resources/models/",
		"targetZ":-40,
		"flyTimes":2
	},
	"camera":{
		position:new SFVec3f(0,0,0),//相机位置
		screenRatio:4/3,//屏幕宽高比例
		far:-150,//远平面Z值
		near:-10//近平面Z值
	},
	"select":{
		"selectCycle":2//循环选择周期
	},
	"ufos":[
		{
			"template":"Transform{children[Transform{translation 0 -0.7 0 children[s%]}]}",
			"lyxName": "ufo006/main.lyx",
			"type":"ufo006",
			"resType":1,                    //1:模型，2：骨骼
			"worth":50,
			"config":{
				"translation":new SFVec3f(0, 0, 0),
				"scale":new SFVec3f(2.3,2.3,2.3),
				"blood":2
			}
		},
		{
			"template":"Transform{children[Transform{translation 0 -0.6 0 children[s%]}]}",
			"lyxName": "ufo007/main.lyx",
			"type":"ufo007",
			"resType":1,                    //1:模型，2：骨骼
			"worth":30,
			"config":{
				"translation":new SFVec3f(0, 0, 0),
				"scale":new SFVec3f(2.1,2.1,2.1),
				"blood":1
			}
		},
		{
			"template":"Transform{children[Transform{translation 0 -0.7 0 children[s%]}]}",
			"lyxName": "ufo008/main.lyx",
			"type":"ufo008",
			"resType":1,                    //1:模型，2：骨骼
			"worth":10,
			"config":{
				"translation":new SFVec3f(0, 0, 0),
				"scale":new SFVec3f(1.7,1.7,1.7),
				"blood":1
			}
		}
	]
});
