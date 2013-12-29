/**
 * Created with JetBrains WebStorm.
 * User: zhangzd
 * Date: 13-1-23
 * Time: 上午9:25
 */

define(function (require, exports, module) {
	var root = this, state = false, eventBind = false,
		log = require("core/Logger").getLog(),
		GameEvent = require("core/Event").getInstance("GameEvent"),
		ActionEvent = require("core/Event").getInstance("ActionEvent"),
		SystemEvent = require("events/SystemEvent"),
		KeyCode = require("utils/Keycode"),
        Timer=require("core/Timer"),
        CollectSkeData=require("../CollectSkeData"),
        DBManager=require("../DBManager"),
		angle = 0,pos = new SFVec3f();


	function bindEvents(v){
		if(v&&!eventBind){
			SystemEvent.bind("keyUp",keyUp);
			SystemEvent.bind("keyDown",keyDown);
			SystemEvent.bind("position",mousePosition);
			eventBind = true;
		}else if(!v&&eventBind){
			SystemEvent.unBind("keyUp",keyUp);
			SystemEvent.unBind("keyDown",keyDown);
			SystemEvent.unBind("position",mousePosition);
			eventBind = false;
		}
	}

	var d3Vec = new SFVec3f();
	function mousePosition(v){
		ActionEvent.trigger("uiMouse",v);
		d3Vec.setValue(v.x-0.5, 0.5-v.y,0);
		ActionEvent.trigger("mouse",d3Vec);
	}

	function keyDown(v){
		switch(v){
			case KeyCode.NUM1:
				angle = 1;
				ActionEvent.trigger("holdResult",angle,pos,true);
				break;
			case KeyCode.NUM3:
				angle = 2;
				ActionEvent.trigger("holdResult",angle,pos,true);
				break;
			case KeyCode.NUM2:
				angle = 1.57;
				ActionEvent.trigger("holdResult",angle,pos,true);
				break;
		}
	}

	function keyUp(v){
		switch(v){
			case KeyCode.KEY1:
				ActionEvent.trigger("handsHold","on");
				break;
			case KeyCode.KEY2:
				ActionEvent.trigger("throwResult",new SFVec3f(0,0,0));
				break;
			case KeyCode.KEY3:
				ActionEvent.trigger("playerState","enter");
				break;
			case KeyCode.KEY4:
				ActionEvent.trigger("playerState","leave");
				break;
			case KeyCode.NUM1:
				ActionEvent.trigger("holdResult",angle,pos,false);
				break;
			case KeyCode.NUM3:
				ActionEvent.trigger("holdResult",angle,pos,false);
				break;
			case KeyCode.NUM2:
				ActionEvent.trigger("holdResult",angle,pos,false);
				break;
            case KeyCode.ENTER:
                Timer.bindFraction(80,function(f){
                    var data=[];
                    for(var i=0;i<61;i++){
                        data[i]=f;
                    }
                    require("core/Event").getInstance("MSEvent").trigger("rawData",data);
                },function(){});
                GameEvent.trigger("enableCollect",true); //开启收集数据的功能
                CollectSkeData.pause(false);
                break;
            case KeyCode.S:
                ActionEvent.trigger("swingHand");
                break;
			case KeyCode.ESC:
				Browser.command(32821);
				break;
		}
	}

	exports.init = function () {
		if (!state) {
			bindEvents(true);
            CollectSkeData.init();
			state = true;
		}
	};

	exports.destroy = function () {
		if (state) {
			bindEvents(false);
			state = false;
		}
	};
});
