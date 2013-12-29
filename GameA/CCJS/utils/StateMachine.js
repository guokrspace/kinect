(function(m){var d={VERSION:"2.1.0",Result:{SUCCEEDED:1,NOTRANSITION:2,CANCELLED:3,ASYNC:4},Error:{INVALID_TRANSITION:100,PENDING_TRANSITION:200,INVALID_CALLBACK:300},WILDCARD:"*",ASYNC:"async",create:function(a,f){var b="string"==typeof a.initial?{state:a.initial}:a.initial,c=f||a.target||{},e=a.events||[],h=a.callbacks||{},g={},l=function(a){var c=a.from instanceof Array?a.from:a.from?[a.from]:[d.WILDCARD];g[a.name]=g[a.name]||{};for(var b=0;b<c.length;b++)g[a.name][c[b]]=a.to||c[b]};b&&(b.event=
b.event||"startup",l({name:b.event,from:"none",to:b.state}));for(var k=0;k<e.length;k++)l(e[k]);for(var j in g)g.hasOwnProperty(j)&&(c[j]=d.buildEvent(j,g[j]));for(j in h)h.hasOwnProperty(j)&&(c[j]=h[j]);c.current="none";c.is=function(a){return this.current==a};c.can=function(a){return!this.transition&&(g[a].hasOwnProperty(this.current)||g[a].hasOwnProperty(d.WILDCARD))};c.cannot=function(a){return!this.can(a)};c.error=a.error||function(a,b,c,d,e,f,g){throw g||f;};if(b&&!b.defer)c[b.event]();return c},
doCallback:function(a,f,b,c,e,h){if(f)try{return f.apply(a,[b,c,e].concat(h))}catch(g){return a.error(b,c,e,h,d.Error.INVALID_CALLBACK,"an exception occurred in a caller-provided callback function",g)}},beforeEvent:function(a,f,b,c,e){return d.doCallback(a,a["onbefore"+f],f,b,c,e)},afterEvent:function(a,f,b,c,e){return d.doCallback(a,a["onafter"+f]||a["on"+f],f,b,c,e)},leaveState:function(a,f,b,c,e){return d.doCallback(a,a["onleave"+b],f,b,c,e)},enterState:function(a,f,b,c,e){return d.doCallback(a,
a["onenter"+c]||a["on"+c],f,b,c,e)},changeState:function(a,f,b,c,e){return d.doCallback(a,a.onchangestate,f,b,c,e)},buildEvent:function(a,f){return function(){var b=this.current,c=f[b]||f[d.WILDCARD]||b,e=Array.prototype.slice.call(arguments);if(this.transition)return this.error(a,b,c,e,d.Error.PENDING_TRANSITION,"event "+a+" inappropriate because previous transition did not complete");if(this.cannot(a))return this.error(a,b,c,e,d.Error.INVALID_TRANSITION,"event "+a+" inappropriate in current state "+
this.current);if(!1===d.beforeEvent(this,a,b,c,e))return d.CANCELLED;if(b===c)return d.afterEvent(this,a,b,c,e),d.NOTRANSITION;var h=this;this.transition=function(){h.transition=null;h.current=c;d.enterState(h,a,b,c,e);d.changeState(h,a,b,c,e);d.afterEvent(h,a,b,c,e)};var g=d.leaveState(this,a,b,c,e);if(!1===g)return this.transition=null,d.CANCELLED;if("async"===g)return d.ASYNC;this.transition&&this.transition();return d.SUCCEEDED}}};"function"===typeof define?define(function(){return d}):m.StateMachine=
d})(this);