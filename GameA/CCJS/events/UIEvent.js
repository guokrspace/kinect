define(function(f,p){var g=this,m=f("core/Event.js"),c=f("core/Logger").getLog(),q=f("utils/wrapper.js"),h=m.getInstance("uiEvent"),k={isOver:{TYPE:"SFBool",UIE:"isOver",SCE:"ui_over",EXIST:!0},click:{TYPE:"SFBool",UIE:"isLeftActive",SCE:"ui_click",EXIST:!0},leftActive:{TYPE:"SFBool",UIE:"isLeftActive",SCE:"ui_leftActive",EXIST:!0},rightActive:{TYPE:"SFBool",UIE:"isRightActive",SCE:"ui_rightActive",EXIST:!0},doubleClick:{TYPE:"SFBool",UIE:"isDoubleClick",SCE:"ui_doubleClick",EXIST:!0},value:{TYPE:"SFFloat",
UIE:"value",SCE:"ui_value",EXIST:!0},text:{TYPE:"SFString",UIE:"text",SCE:"ui_text",EXIST:!0},selected:{TYPE:"SFBool",UIE:"selected",SCE:"ui_selected",EXIST:!0},active:{TYPE:"SFBool",UIE:"active",SCE:"ui_active",EXIST:!0},keyUp:{TYPE:"SFInt32",UIE:"keyup",SCE:"ui_keyUp",EXIST:!0},keyDown:{TYPE:"SFInt32",UIE:"keydown",SCE:"ui_keyDown",EXIST:!0},size:{TYPE:"SFVec2f",UIE:"size",SCE:"ui_size",EXIST:!0},position:{TYPE:"SFVec2f",UIE:"position",SCE:"ui_position",EXIST:!0},selTab:{TYPE:"SFInt32",UIE:"selctedTab",
SCE:"ui_selTab",EXIST:!0}},l={},m=""+g,n;for(n in k){var b=k[n];RegExp("eventIn\\s"+b.TYPE+"\\s"+b.SCE).test(m)?(g[b.SCE]=function(r){return function(a){var c=getEmitter();h.trigger(c.getName()+":"+r,a,c)}}(n),g.ui_click=function(c){var a=getEmitter();!c&&a.active&&h.trigger(a.getName()+":click",c,a)}):(c.warn("加载UIEvent错误: Script脚本中，未找到正确配置 eventIn "+b.TYPE+" "+b.SCE+" 的 eventIn"),b.EXIST=!1)}p.bind=function(b,a,f){var d=k[a];d?q(b).forEach(function(j){var e=SFNode.get(j);e?d.EXIST?(l[e.getName()+
":"+d.SCE]||(SFNode.createRoute(e,d.UIE,g,d.SCE),l[e.getName()+":"+d.SCE]=!0),h.bind(j+":"+a,f),c.debug('UI结点 "'+j+'" 绑定事件 "'+a+'" 成功')):c.warn('UI结点 "'+j+'" 绑定事件 "'+a+'" 失败,未找到入事件 "'+d.SCE+'" 的定义'):c.warn('绑定事件 "'+a+'" 时发生错误,未找到UI结点 "'+j+'"')}):c.warn('不支持的ui事件类型: "'+a+'"')};p.unBind=function(b,a,f){var d=k[a];d?q(b).forEach(function(b){var e=SFNode.get(b);e?(h.unbind(b+":"+a,f),0==h.getEventBinds(a)&&l[e.getName()+":"+d.SCE]&&(SFNode.removeRoute(e,d.UIE,g,d.SCE),l[e.getName()+":"+d.SCE]=!1)):c.warn('解除绑定事件 "'+
a+'" 时发生错误,未找到UI结点 "'+b+'"')}):c.warn('不支持的ui事件类型: "'+a+'"')}});
