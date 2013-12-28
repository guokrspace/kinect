define(function(P,s,t){(function(){function u(a,c,d){if(a===c)return 0!==a||1/a==1/c;if(null==a||null==c)return a===c;a._chain&&(a=a._wrapped);c._chain&&(c=c._wrapped);if(a.isEqual&&b.isFunction(a.isEqual))return a.isEqual(c);if(c.isEqual&&b.isFunction(c.isEqual))return c.isEqual(a);var e=h.call(a);if(e!=h.call(c))return!1;switch(e){case "[object String]":return a==String(c);case "[object Number]":return a!=+a?c!=+c:0==a?1/a==1/c:a==+c;case "[object Date]":case "[object Boolean]":return+a==+c;case "[object RegExp]":return a.source==
c.source&&a.global==c.global&&a.multiline==c.multiline&&a.ignoreCase==c.ignoreCase}if("object"!=typeof a||"object"!=typeof c)return!1;for(var g=d.length;g--;)if(d[g]==a)return!0;d.push(a);var g=0,f=!0;if("[object Array]"==e){if(g=a.length,f=g==c.length)for(;g--&&(f=g in a==g in c&&u(a[g],c[g],d)););}else{if("constructor"in a!="constructor"in c||a.constructor!=c.constructor)return!1;for(var j in a)if(b.has(a,j)&&(g++,!(f=b.has(c,j)&&u(a[j],c[j],d))))break;if(f){for(j in c)if(b.has(c,j)&&!g--)break;
f=!g}}d.pop();return f}var v=this,K=v._,p={},m=Array.prototype,q=Object.prototype,k=m.slice,L=m.unshift,h=q.toString,M=q.hasOwnProperty,A=m.forEach,B=m.map,C=m.reduce,D=m.reduceRight,E=m.filter,F=m.every,G=m.some,r=m.indexOf,H=m.lastIndexOf,q=Array.isArray,N=Object.keys,w=Function.prototype.bind,b=function(a){return new n(a)};"undefined"!==typeof s?("undefined"!==typeof t&&t.exports&&(s=t.exports=b),s._=b):v._=b;b.VERSION="1.3.1";var l=b.each=b.forEach=function(a,c,d){if(null!=a)if(A&&a.forEach===
A)a.forEach(c,d);else if(a.length===+a.length)for(var e=0,g=a.length;e<g&&!(e in a&&c.call(d,a[e],e,a)===p);e++);else for(e in a)if(b.has(a,e)&&c.call(d,a[e],e,a)===p)break};b.map=b.collect=function(a,c,b){var e=[];if(null==a)return e;if(B&&a.map===B)return a.map(c,b);l(a,function(a,f,j){e[e.length]=c.call(b,a,f,j)});a.length===+a.length&&(e.length=a.length);return e};b.reduce=b.foldl=b.inject=function(a,c,d,e){var g=2<arguments.length;null==a&&(a=[]);if(C&&a.reduce===C)return e&&(c=b.bind(c,e)),
g?a.reduce(c,d):a.reduce(c);l(a,function(a,b,h){g?d=c.call(e,d,a,b,h):(d=a,g=!0)});if(!g)throw new TypeError("Reduce of empty array with no initial value");return d};b.reduceRight=b.foldr=function(a,c,d,e){var g=2<arguments.length;null==a&&(a=[]);if(D&&a.reduceRight===D)return e&&(c=b.bind(c,e)),g?a.reduceRight(c,d):a.reduceRight(c);var f=b.toArray(a).reverse();e&&!g&&(c=b.bind(c,e));return g?b.reduce(f,c,d,e):b.reduce(f,c)};b.find=b.detect=function(a,c,b){var e;I(a,function(a,f,j){if(c.call(b,a,
f,j))return e=a,!0});return e};b.filter=b.select=function(a,c,b){var e=[];if(null==a)return e;if(E&&a.filter===E)return a.filter(c,b);l(a,function(a,f,j){c.call(b,a,f,j)&&(e[e.length]=a)});return e};b.reject=function(a,c,b){var e=[];if(null==a)return e;l(a,function(a,f,j){c.call(b,a,f,j)||(e[e.length]=a)});return e};b.every=b.all=function(a,c,b){var e=!0;if(null==a)return e;if(F&&a.every===F)return a.every(c,b);l(a,function(a,f,j){if(!(e=e&&c.call(b,a,f,j)))return p});return!!e};var I=b.some=b.any=
function(a,c,d){c||(c=b.identity);var e=!1;if(null==a)return e;if(G&&a.some===G)return a.some(c,d);l(a,function(a,b,j){if(e||(e=c.call(d,a,b,j)))return p});return!!e};b.include=b.contains=function(a,b){var d=!1;return null==a?d:r&&a.indexOf===r?-1!=a.indexOf(b):d=I(a,function(a){return a===b})};b.invoke=function(a,c){var d=k.call(arguments,2);return b.map(a,function(a){return(b.isFunction(c)?c||a:a[c]).apply(a,d)})};b.pluck=function(a,c){return b.map(a,function(a){return a[c]})};b.max=function(a,
c,d){if(!c&&b.isArray(a)&&a[0]===+a[0])return Math.max.apply(Math,a);if(!c&&b.isEmpty(a))return-Infinity;var e={computed:-Infinity};l(a,function(a,b,j){b=c?c.call(d,a,b,j):a;b>=e.computed&&(e={value:a,computed:b})});return e.value};b.min=function(a,c,d){if(!c&&b.isArray(a)&&a[0]===+a[0])return Math.min.apply(Math,a);if(!c&&b.isEmpty(a))return Infinity;var e={computed:Infinity};l(a,function(a,b,j){b=c?c.call(d,a,b,j):a;b<e.computed&&(e={value:a,computed:b})});return e.value};b.shuffle=function(a){var b=
[],d;l(a,function(a,g){0==g?b[0]=a:(d=Math.floor(Math.random()*(g+1)),b[g]=b[d],b[d]=a)});return b};b.sortBy=function(a,c,d){return b.pluck(b.map(a,function(a,b,f){return{value:a,criteria:c.call(d,a,b,f)}}).sort(function(a,b){var c=a.criteria,d=b.criteria;return c<d?-1:c>d?1:0}),"value")};b.groupBy=function(a,c){var d={},e=b.isFunction(c)?c:function(a){return a[c]};l(a,function(a,b){var c=e(a,b);(d[c]||(d[c]=[])).push(a)});return d};b.sortedIndex=function(a,c,d){d||(d=b.identity);for(var e=0,g=a.length;e<
g;){var f=e+g>>1;d(a[f])<d(c)?e=f+1:g=f}return e};b.toArray=function(a){return!a?[]:a.toArray?a.toArray():b.isArray(a)||b.isArguments(a)?k.call(a):b.values(a)};b.size=function(a){return b.toArray(a).length};b.first=b.head=function(a,b,d){return null!=b&&!d?k.call(a,0,b):a[0]};b.initial=function(a,b,d){return k.call(a,0,a.length-(null==b||d?1:b))};b.last=function(a,b,d){return null!=b&&!d?k.call(a,Math.max(a.length-b,0)):a[a.length-1]};b.rest=b.tail=function(a,b,d){return k.call(a,null==b||d?1:b)};
b.compact=function(a){return b.filter(a,function(a){return!!a})};b.flatten=function(a,c){return b.reduce(a,function(a,e){if(b.isArray(e))return a.concat(c?e:b.flatten(e));a[a.length]=e;return a},[])};b.without=function(a){return b.difference(a,k.call(arguments,1))};b.uniq=b.unique=function(a,c,d){d=d?b.map(a,d):a;var e=[];3>a.length&&(c=!0);b.reduce(d,function(d,f,j){if(c?b.last(d)!==f||!d.length:!b.include(d,f))d.push(f),e.push(a[j]);return d},[]);return e};b.union=function(){return b.uniq(b.flatten(arguments,
!0))};b.intersection=b.intersect=function(a){var c=k.call(arguments,1);return b.filter(b.uniq(a),function(a){return b.every(c,function(c){return 0<=b.indexOf(c,a)})})};b.difference=function(a){var c=b.flatten(k.call(arguments,1),!0);return b.filter(a,function(a){return!b.include(c,a)})};b.zip=function(){for(var a=k.call(arguments),c=b.max(b.pluck(a,"length")),d=Array(c),e=0;e<c;e++)d[e]=b.pluck(a,""+e);return d};b.indexOf=function(a,c,d){if(null==a)return-1;var e;if(d)return d=b.sortedIndex(a,c),
a[d]===c?d:-1;if(r&&a.indexOf===r)return a.indexOf(c);d=0;for(e=a.length;d<e;d++)if(d in a&&a[d]===c)return d;return-1};b.lastIndexOf=function(a,b){if(null==a)return-1;if(H&&a.lastIndexOf===H)return a.lastIndexOf(b);for(var d=a.length;d--;)if(d in a&&a[d]===b)return d;return-1};b.range=function(a,b,d){1>=arguments.length&&(b=a||0,a=0);d=arguments[2]||1;for(var e=Math.max(Math.ceil((b-a)/d),0),g=0,f=Array(e);g<e;)f[g++]=a,a+=d;return f};var J=function(){};b.bind=function(a,c){var d,e;if(a.bind===w&&
w)return w.apply(a,k.call(arguments,1));if(!b.isFunction(a))throw new TypeError;e=k.call(arguments,2);return d=function(){if(!(this instanceof d))return a.apply(c,e.concat(k.call(arguments)));J.prototype=a.prototype;var b=new J,f=a.apply(b,e.concat(k.call(arguments)));return Object(f)===f?f:b}};b.bindAll=function(a){var c=k.call(arguments,1);0==c.length&&(c=b.functions(a));l(c,function(c){a[c]=b.bind(a[c],a)});return a};b.memoize=function(a,c){var d={};c||(c=b.identity);return function(){var e=c.apply(this,
arguments);return b.has(d,e)?d[e]:d[e]=a.apply(this,arguments)}};b.delay=function(a,b){var d=k.call(arguments,2);return setTimeout(function(){return a.apply(a,d)},b)};b.defer=function(a){return b.delay.apply(b,[a,0.0010].concat(k.call(arguments,1)))};b.throttle=function(a,c){var d,e,g,f,j,h=b.debounce(function(){j=f=!1},c);return function(){d=this;e=arguments;g||(g=setTimeout(function(){g=null;j&&a.apply(d,e);h()},c));f?j=!0:a.apply(d,e);h();f=!0}};b.debounce=function(a,b,d){var e;return function(){var g=
this,f=arguments;d&&!e&&a.apply(g,f);clearTimeout(e);e=setTimeout(function(){e=null;d||a.apply(g,f)},b)}};b.once=function(a){var b=!1,d;return function(){if(b)return d;b=!0;return d=a.apply(this,arguments)}};b.wrap=function(a,b){return function(){var d=[a].concat(k.call(arguments,0));return b.apply(this,d)}};b.compose=function(){var a=arguments;return function(){for(var b=arguments,d=a.length-1;0<=d;d--)b=[a[d].apply(this,b)];return b[0]}};b.after=function(a,b){return 0>=a?b():function(){if(1>--a)return b.apply(this,
arguments)}};b.keys=N||function(a){if(a!==Object(a))throw new TypeError("Invalid object");var c=[],d;for(d in a)b.has(a,d)&&(c[c.length]=d);return c};b.values=function(a){return b.map(a,b.identity)};b.functions=b.methods=function(a){var c=[],d;for(d in a)b.isFunction(a[d])&&c.push(d);return c.sort()};b.extend=function(a){l(k.call(arguments,1),function(b){for(var d in b)a[d]=b[d]});return a};b.defaults=function(a){l(k.call(arguments,1),function(b){for(var d in b)null==a[d]&&(a[d]=b[d])});return a};
b.clone=function(a){return!b.isObject(a)?a:b.isArray(a)?a.slice():b.extend({},a)};b.tap=function(a,b){b(a);return a};b.isEqual=function(a,b){return u(a,b,[])};b.isEmpty=function(a){if(null==a)return!0;if(b.isArray(a)||b.isString(a))return 0===a.length;for(var c in a)if(b.has(a,c))return!1;return!0};b.isElement=function(a){return!!(a&&1==a.nodeType)};b.isArray=q||function(a){return"[object Array]"==h.call(a)};b.isObject=function(a){return a===Object(a)};b.isArguments=function(a){return"[object Arguments]"==
h.call(a)};b.isArguments(arguments)||(b.isArguments=function(a){return!(!a||!b.has(a,"callee"))});b.isFunction=function(a){return"[object Function]"==h.call(a)};b.isString=function(a){return"[object String]"==h.call(a)};b.isNumber=function(a){return"[object Number]"==h.call(a)};b.isNaN=function(a){return a!==a};b.isBoolean=function(a){return!0===a||!1===a||"[object Boolean]"==h.call(a)};b.isDate=function(a){return"[object Date]"==h.call(a)};b.isRegExp=function(a){return"[object RegExp]"==h.call(a)};
b.isNull=function(a){return null===a};b.isUndefined=function(a){return void 0===a};b.isSFRotation=function(a){return"[object SFRotation]"==h.call(a)};b.isSFVec2f=function(a){return"[object SFVec2f]"==h.call(a)};b.isSFVec3f=function(a){return"[object SFVec3f]"==h.call(a)};b.isSFColor=function(a){return"[object SFColor]"==h.call(a)};b.isSFNode=function(a){return"[object SFNode]"==h.call(a)};b.isSFMatrix=function(a){return"[object SFMatrix]"==h.call(a)};b.isMFColor=function(a){return"[object MFColor]"==
h.call(a)};b.isMFFloat=function(a){return"[object MFFloat]"==h.call(a)};b.isMFInt32=function(a){return"[object MFInt32]"==h.call(a)};b.isMFNode=function(a){return"[object MFNode]"==h.call(a)};b.isMFRotation=function(a){return"[object MFRotation]"==h.call(a)};b.isMFString=function(a){return"[object MFString]"==h.call(a)};b.isMFTime=function(a){return"[object MFTime]"==h.call(a)};b.isMFVec2f=function(a){return"[object MFVec2f]"==h.call(a)};b.isMFVec3f=function(a){return"[object MFVec3f]"==h.call(a)};
b.has=function(a,b){return M.call(a,b)};b.noConflict=function(){v._=K;return this};b.identity=function(a){return a};b.times=function(a,b,d){for(var e=0;e<a;e++)b.call(d,e)};b.escape=function(a){return(""+a).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;")};b.mixin=function(a){l(b.functions(a),function(c){var d=b[c]=a[c];n.prototype[c]=function(){var a=k.call(arguments);L.call(a,this._wrapped);return x(d.apply(b,a),
this._chain)}})};var O=0;b.uniqueId=function(a){var b=O++;return a?a+b:b};b.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var y=/.^/,z=function(a){return a.replace(/\\\\/g,"\\").replace(/\\'/g,"'")};b.template=function(a,c){var d=b.templateSettings,d="var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('"+a.replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(d.escape||y,function(a,b){return"',_.escape("+z(b)+"),'"}).replace(d.interpolate||
y,function(a,b){return"',"+z(b)+",'"}).replace(d.evaluate||y,function(a,b){return"');"+z(b).replace(/[\r\n\t]/g," ")+";__p.push('"}).replace(/\r/g,"\\r").replace(/\n/g,"\\n").replace(/\t/g,"\\t")+"');}return __p.join('');",e=new Function("obj","_",d);return c?e(c,b):function(a){return e.call(this,a,b)}};b.chain=function(a){return b(a).chain()};var n=function(a){this._wrapped=a};b.prototype=n.prototype;var x=function(a,c){return c?b(a).chain():a};b.mixin(b);l("pop push reverse shift sort splice unshift".split(" "),
function(a){var b=m[a];n.prototype[a]=function(){var d=this._wrapped;b.apply(d,arguments);var e=d.length;("shift"==a||"splice"==a)&&0===e&&delete d[0];return x(d,this._chain)}});l(["concat","join","slice"],function(a){var b=m[a];n.prototype[a]=function(){return x(b.apply(this._wrapped,arguments),this._chain)}});n.prototype.chain=function(){this._chain=!0;return this};n.prototype.value=function(){return this._wrapped}}).call(this)});
