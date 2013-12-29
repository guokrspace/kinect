/**
 * Created with JetBrains WebStorm.
 * User: zhangzd
 * Date: 12-11-27
 * Time: 下午3:26
 */

define(function (require, exports, module) {
	var root = this, state = false, eventBind = false,
		log = require("core/Logger").getLog(),
		CDEvent = require("core/Event").getInstance("CDEvent");

	function bindEvents(){
		if(!eventBind){
			CDEvent.bind("closeCard",function(){
				try{
					regiest(-1,1,1);
				}catch(e){
					log.error("关闭身份证信息监听接口不存在 : "+e);
				}
			});
			CDEvent.bind("openCard",function(){
				try{
					regiest(1,1,1);
				}catch(e){
					log.error("打开身份证信息监听接口不存在 : "+e);
				}
			});
			eventBind = true;
		}
	}

	function getFullData(cardId){
		if(File.exists(cardId)){
			var file = new File(cardId);
			var text = file.read();
			file.close();
			return JSON.parse(text);
		}
	}

	function setCard(args){
		if(state){
			var cardNumber ='';
			for(var key in args){
				cardNumber += args[key];
			}
			CDEvent.trigger("cardSwipe",cardNumber,getFullData(cardNumber));
		}
	}

	exports.init = function () {
		if (!state) {
			if(!root.setCard){
				var cardArg;
				root.setCard = function(){
					cardArg = arguments;
					setCard(cardArg);
				};
				try{
					regiest(0,1,1);
					regiest(1,1,1);
				}catch(e){
					log.error("初始化身份证信息监听接口不存在 : "+e);
				}
			}
			bindEvents();
			state = true;
		}
	};

	exports.destory = function () {
		if (state) {
			regiest(-1,1,1);
			state = false;
		}
	};
});


