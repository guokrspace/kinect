/**
 * Created by CyberClassics.
 * User: Songbinbing
 * Date: 12-8-20
 * Time: ионГ11:11
 */
define(function (require, exports, module) {
	var LOG = require("core/Logger").getLog();
	exports.init = _.once(function () {
		LOG.debug("project start init");
		startShow();
	});

    function startShow(){
        LOG.debug("load test module!");
//        require("./biz/Test").init();
	    require("./biz/Main").init();
        require("./biz/public/EventTransfer").init();
        require("./data/pixSkeData").init();
//        require("./biz/UIManager").init();
    }
});