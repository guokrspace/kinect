define(function(h,q){var j=this,k=SFNode.get("__system"),f=h("../core/Event.js"),c=h("../core/Logger").getLog(),e=f.getInstance("systemEvent"),r=h("../utils/wrapper.js"),l={keyDown:{TYPE:"SFInt32",STE:"keydown",SCE:"system_keyDown",EXIST:!0},keyUp:{TYPE:"SFInt32",STE:"keyup",SCE:"system_keyUp",EXIST:!0},position:{TYPE:"SFVec2f",STE:"position",SCE:"system_position",EXIST:!0},wheel:{TYPE:"SFInt32",STE:"wheel",SCE:"system_wheel",EXIST:!0},gesture:{TYPE:"SFInt32",STE:"gesture",SCE:"system_gesture",EXIST:!0}},
m={},f=""+j,n={},p;for(p in l){var d=l[p];RegExp("eventIn\\s"+d.TYPE+"\\s"+d.SCE).test(f)?j[d.SCE]=function(b){return function(c){e.trigger(b,c);e.trigger(b+c,c)}}(p):(c.warn("SystemEvent模块 : Script脚本中，未找到正确配置 eventIn "+d.TYPE+" "+d.SCE+" 的 eventIn"),d.EXIST=!1)}q.bind=function(b,d,g){var a=l[b];a?k?a.EXIST?(m[a.STE]||(SFNode.createRoute(k,a.STE,j,a.SCE),m[a.STE]=!0),g?r(g).forEach(function(a){e.bind(b+a,d);n[b+a]=!0;c.debug('SystemEvent 绑定按键 "'+a+' "的" '+b+'" 事件成功')}):(e.bind(b,d),c.debug('SystemEvent 绑定"'+
b+'" 事件成功'))):c.warn('SystemEvent 绑定 "'+b+'" 事件时发生错误,未找到入事件eventIn "'+a.SCE+'" 的定义'):c.warn('SystemEvent 绑定 "'+b+'" 时发生错误,未找到名称为 __system 的System节点'):c.warn('SystemEvent暂不支持的系统事件类型: "'+b+'"')};q.unBind=function(b,d,g){var a=l[b];if(a)if(k){g?r(g).forEach(function(a){e.unbind(b+a,d);n[b+a]=!1}):e.unbind(b,d);g=e.getEventBinds(b);var h=!0,f;for(f in n)if(n[f]&&0!=e.getEventBinds(f)){h=!1;break}h&&(0==g&&m[a.STE])&&(SFNode.removeRoute(k,a.STE,j,a.SCE),m[a.STE]=!1,c.debug("eventIn "+a.TYPE+" "+a.SCE+
" 没有事件绑定,路由被删除!"))}else c.warn('解除绑定事件 "'+b+'" 时发生错误,未找到名称为 __system 的System结点 "');else c.warn('暂不支持的System事件类型 : "'+b+'"')}});
