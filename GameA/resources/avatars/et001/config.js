define(
	{
		"base":"resources/avatars/et001/",
		"bone":"waixingren_1_bone.csf",
		"meshSet":[
			{
				"name":"normal",
				"mesh":["waixingren_1_mesh.cmf","UFO_mesh.cmf"]
			}
		],
		"texture":"waixingren_01.jpg",
		"animation":{
            "fly":{"alias":"fly", "type":1, "name":"waixingren_1_ani.caf"},
            "faint":{"alias":"dead", "type":1, "name":"waixingren_2_ani.caf"},
            "dead":{"alias":"faint", "type":1, "name":"waixingren_3_ani.caf"}
        }
	}
);