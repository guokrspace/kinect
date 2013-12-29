/**
 * Created by JetBrains WebStorm.
 * User: Administrator
 * Date: 12-2-22
 * Time: 上午11:02
 */
define({
    "story":{
        "texture":[     //游戏情节需要播放的图片
            "set:_file image:../STORY/1.jpg",
            "set:_file image:../STORY/2.jpg",
            "set:_file image:../STORY/3.jpg",
            "set:_file image:../STORY/4.jpg",
            "set:_file image:../STORY/5.jpg",
            "set:_file image:../STORY/6.jpg"
        ],
        "time":1.6,         //每张播放的时间
        "aniTime":2  //移动的时间
    },
    "train":{
        "texture":[     //游戏说明需要播放的贴图
            "set:_file image:../TRAIN/1.jpg",
            "set:_file image:../TRAIN/2.jpg",
            "set:_file image:../TRAIN/3.jpg",
            "set:_file image:../TRAIN/4.jpg"
        ],
        "time":3,       //每张播放的时间
        "aniTime":0.5   //移动的时间
    }
});