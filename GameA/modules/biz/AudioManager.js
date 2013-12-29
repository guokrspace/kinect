/**
 * Created with JetBrains WebStorm.
 * User: zhangzd
 * Date: 13-1-22
 * Time: ÉÏÎç11:09
 */

define(function (require, exports, module) {
	var root = this, state = false,eventBind = false,
		log = require("core/Logger").getLog(),
		AudioEvent = require("core/Event").getInstance("AudioEvent"),
		Audio = require("node/Audio"),
		Config = require("../config/AudioConfig"),
		UFOAudioConfig = require("../config/UFOAudioConfig");

	function bindEvents(v){
		if(v){
			if(!eventBind){
				AudioEvent.bind("ufoSound",ufoSound);
				AudioEvent.bind("sound",startSound);
				AudioEvent.bind("music",playMusic);
				eventBind = true;
			}
		}else{
			if(eventBind){
				AudioEvent.unbind("ufoSound",ufoSound);
				AudioEvent.unbind("sound",startSound);
				AudioEvent.unbind("music",playMusic);
				eventBind = false;
			}
		}
	}

	function playMusic(v,loop){
		if(state){
			if(Config.music[v]){
				Audio.playerMusic(v,loop);
			}
		}
	}

	function ufoSound(v){
		if(state){
			if(UFOAudioConfig[v]){
				var targets = UFOAudioConfig.public.concat(UFOAudioConfig[v]);
				var tSound = targets[Math.floor(Math.random()*targets.length)];
				startSound(tSound);
			}
		}
	}

	function startSound(v){
		if(state){
			if(Config.sound[v]){
				Audio.openSound(v);
			}
		}
	}

	exports.init = function () {
		if (!state) {
			Audio.init('./resources/audios/',Config);
			bindEvents(true);
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
