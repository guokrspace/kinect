/**
 * Created by JetBrains WebStorm.
 * User: sungf
 * Date: 13-1-21
 * Time: ����8:29
 * To change this template use File | Settings | File Templates.
 */
define({
	"global" : {
		"initNum" : 2,//��Ϸ��ʼʱUFO��ʾ����
		targetCycle : 4,//UFO���ּ��ʱ��
		intoNum:5, //��Ϸʧ���ٽ�ֵ
		"modelBasePath":"resources/models/"
	},
	"camera":{
		position:new SFVec3f(0,0,0),//���λ��
		width:9,//��Ļ��߱���
		height:16,//��Ļ��߱���
		far:-150,//Զƽ��Zֵ
		near:-10//��ƽ��Zֵ
	},
	"select":{
		"selectLimit":[-11,-100],//��ѡ����ӽ��ϵ�Zֵ��Χ
		"selectCycle":2,//ѭ��ѡ������
		"selectNum":2//ѡ��ʱ����ǰ��ļ�����ѡ��
	},
	"ufos":[
		{
			"template":"Transform{children[Transform{translation 0 -1.5 0 children[s%]}]}",
			"lyxName": "/avatars/et001",//��Դ���ڰ�������Դ����
			"type":"et001",
			"configPath":"../../../resources/avatars/et001/config",
			"resType":2,                    //1:ģ�ͣ�2������
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
			"resType":2,                    //1:ģ�ͣ�2������
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
			"resType":2,                    //1:ģ�ͣ�2������
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
			"resType":2,                    //1:ģ�ͣ�2������
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
			"resType":1,                    //1:ģ�ͣ�2������
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