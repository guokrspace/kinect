/**
 * Created by JetBrains WebStorm.
 * User: sungf
 * Date: 13-1-21
 * Time: 下午8:29
 * To change this template use File | Settings | File Templates.
 */
define({
	"global" : {
		"initNum" : 2,//游戏开始时UFO显示个数
		targetCycle : 4,//UFO出现间隔时间
		intoNum:5, //游戏失败临界值
		"modelBasePath":"resources/models/"
	},
	"camera":{
		position:new SFVec3f(0,0,0),//相机位置
		width:9,//屏幕宽高比例
		height:16,//屏幕宽高比例
		far:-150,//远平面Z值
		near:-10//近平面Z值
	},
	"select":{
		"selectLimit":[-11,-100],//可选择的视角上的Z值范围
		"selectCycle":2,//循环选择周期
		"selectNum":2//选择时在最前面的几个中选择
	},
	"ufos":[
		{
			"template":"Transform{children[Transform{translation 0 -1.5 0 children[s%]}]}",
			"lyxName": "/avatars/et001",//资源所在包名及资源名称
			"type":"et001",
			"configPath":"../../../resources/avatars/et001/config",
			"resType":2,                    //1:模型，2：骨骼
			"worth":20,
			"startSpeed":8,
			"hitSpeed":0.5,
			"config":{
				"translation":new SFVec3f(0, -0.2, 0),
				"scale":new SFVec3f(3,3,3),
				"blood":1
			}
		},
		{
			"template":"Transform{children[Transform{translation 0 -1.1 0 children[s%]}]}",
			"lyxName": "/avatars/et002",
			"configPath":"../../../resources/avatars/et002/config",
			"type":"et002",
			"resType":2,                    //1:模型，2：骨骼
			"worth":20,
			"startSpeed":8,
			"hitSpeed":0.5,
			"config":{
				"translation":new SFVec3f(0, 0, 0),
				"scale":new SFVec3f(1,1,1),
				"blood":1

			}
		},
		{
			"template":"Transform{children[Transform{translation 0 -1.2 0 children[s%]}]}",
			"lyxName": "/avatars/et003",
			"configPath":"../../../resources/avatars/et003/config",
			"type":"et003",
			"resType":2,                    //1:模型，2：骨骼
			"worth":10,
			"startSpeed":8,
			"hitSpeed":0.5,
			"config":{
				"translation":new SFVec3f(0, -0.4, 0),
				"scale":new SFVec3f(2.1,2.1,2.1),
				"blood":1
			}
		},
		{
			"template":"Transform{children[Transform{translation 0 -0.3 0 children[s%]}]}",
			"lyxName": "/avatars/et004",
			"configPath":"../../../resources/avatars/et004/config",
			"type":"et004",
			"resType":2,                    //1:模型，2：骨骼
			"worth":20,
			"startSpeed":8,
			"hitSpeed":0.5,
			"config":{
				"translation":new SFVec3f(0, 0.3, 0),
				"scale":new SFVec3f(1.5,1.5,1.5),
				"blood":1
			}
		},
		{
			"template":"Transform{children[Transform{translation 0 -0.7 0 children[s%]}]}",
			"lyxName": "ufo002/main.lyx",
			"type":"ufo002",
			"resType":1,                    //1:模型，2：骨骼
			"worth":50,
			"startSpeed":6,
			"hitSpeed":0.5,
			"config":{
				"translation":new SFVec3f(0, -0.2, 0),
				"scale":new SFVec3f(1.5,1.5,1.5),
				"blood":2
			}
		}
	]
});