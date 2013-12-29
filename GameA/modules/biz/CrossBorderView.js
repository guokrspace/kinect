/**
 * Created by JetBrains WebStorm.
 * User: Administrator
 * Date: 12-2-28
 * Time: 上午9:46
 */
define(function (require, exports, module) {

    var root = this, state = false,isGetUI=false,
        log = require("core/Logger").getLog(),
        ActionEvent = require("core/Event").getInstance("ActionEvent"),
        ResourceLoader = require("node/ResourceLoader"),
	    MSEvent = require("core/Event").getInstance("MSEvent"),
	    AudioEvent = require("core/Event").getInstance("AudioEvent"),
        Timer=require("core/Timer"),
	    oTipBorder = {"left":false,"right":false,"front":false,"back":false},
	    viewCreate = false,center = new SFVec3f(0,0,0),DIR = new SFVec3f(0,1,0),
	    MyGroup,AreaTipSwi,AreaTipArrow,areaTipBorderSwi,moduleEnable = false;

	function createView(){
		if(!viewCreate){
			AreaTipSwi = SFNode.get("areaTipSwi");
			AreaTipArrow = SFNode.get("areaTipArrow");
			areaTipBorderSwi = SFNode.get("areaTipBorderSwi");
			center.setValue(0,-0.725,0);
			viewCreate = true;
		}
	}
//
    function bindEvent(bind){
        if(bind){
	        ActionEvent.bind("playerStateEnable",enabled);
            ActionEvent.bind("playerState",show);
	        MSEvent.bind("frameChange",frameChange);
        }else{
	        ActionEvent.bind("playerStateEnable",enabled);
            ActionEvent.unbind("playerState",show);
	        MSEvent.unbind("frameChange",frameChange);
        }
    }

	function LookAt(/*SFVec3f*/ CamPos, /*SFVec3f*/ ObjPos){
		var Dir= ObjPos.subtract(CamPos);
		var DirNull= new SFVec3f(0, 1,0);
		// first, we remove the elevation of our direction vector, but store it for later use.
		var Y= Dir.z;
		Dir.z= 0;
		// Dir is horizontal now and for this we can use the two-vector constructor of SFRotation.
		var OriHorz= new SFRotation(DirNull, Dir);
		// To elevate our camera up or down towards the object, we need to calculate an
		// apropriate SFRotation. We can calculate the elevation angle from the saved
		// Y coordinate of our direction vector, and the axis to rotate about is the X-axis of
		// the camera, which has already been rotated horizontal.
		var ElevAngle= Math.atan(Y / Dir.length());
		var ElevAxis= OriHorz.multVec(new SFVec3f(1, 0, 0));
		var OriElevation= new SFRotation(ElevAxis, ElevAngle);
		// Now we just need to compbine both orientations to one and have the desired
		// camera orientation.
		var CamOri= OriHorz.multiply(OriElevation);
		// NOTE: There's a pitfall. At least with VRML97, the standard did not specify
		// in which order two orientations have to be multiplied. So some VRML players
		// need the line var CamOri= OriElevation.multiply(OriHorz);
		// instead. :-(
		return CamOri;
	}
//
	var TimerId = -1;
	function frameChange(hipCenter, spine, shoulderCenter, head, leftShoulder, leftElbow, leftWrist, leftHand, rightShoulder, rightElbow, rightWrist, rightHand, leftHip, leftKnee, leftAnkle, leftFoot, rightHip, rightKnee, rightAnkle, rightFoot){
		if(moduleEnable){
			if(spine.z<2000){if(!oTipBorder.front){oTipBorder.front = true;AudioEvent.trigger("sound","beyondEdge");}
			}else if(spine.z>4000){if(!oTipBorder.back){oTipBorder.back = true;AudioEvent.trigger("sound","beyondEdge");}
			}else{if(oTipBorder.front){oTipBorder.front = false;}if(oTipBorder.back){oTipBorder.back = false;}}
			if(oTipBorder.left||oTipBorder.right||oTipBorder.front||oTipBorder.back){
				AreaTipArrow.translation.setValue(1.8*(spine.x-160)/320,-0.725+1.45*(3000-spine.z)/2000,0);
				AreaTipArrow.rotation.setValue(LookAt(AreaTipArrow.translation,center));
				if(AreaTipSwi.whichChoice!=-3){
					AreaTipSwi.whichChoice=-3;
					TimerId = Timer.bindFraction(0.5,function(){},function(){areaTipBorderSwi.whichChoice=areaTipBorderSwi.whichChoice==-1?-3:-1; return true});
				}
			}else{
				AreaTipSwi.whichChoice = -1;
				Timer.clear(TimerId);
			}
		}
	}

	function enabled(v){
		if(state){
			if(moduleEnable!=v){
				moduleEnable = v;
				if(!moduleEnable){
					AreaTipSwi.whichChoice = -1;
					Timer.clear(TimerId);
				}
			}
		}
	}

    function show(status){
	    if(state&&moduleEnable){
		    switch(status){
			    case "rIn": //右入界
				    oTipBorder.right = false;
				    break;
			    case "rOut": //右越界
				    AudioEvent.trigger("sound","beyondEdge");
				    oTipBorder.right = true;
				    break;
			    case "lIn":  //左入界
				    oTipBorder.left = false;
				    break;
			    case "lOut": //左越界
				    AudioEvent.trigger("sound","beyondEdge");
				    oTipBorder.left = true;
				    break;
			    case "leave": //离开
				    AreaTipSwi.whichChoice = -1;
				    Timer.clear(TimerId);
				    break;
			    case "enter": //进入
				    break;
		    }
	    }
    }

	exports.init = function () {
		if (!state) {
			state = true;
			createView();
			bindEvent(true);
		}
	};

    exports.destroy = function () {
        if (state) {
            bindEvent(false);
            state = false;
        }
    };
});