define(function(y,n){function p(c,g){c[g>>5]|=128<<g%32;c[(g+64>>>9<<4)+14]=g;for(var a=1732584193,b=-271733879,d=-1732584194,e=271733878,f=0;f<c.length;f+=16)var m=a,n=b,p=d,r=e,a=j(a,b,d,e,c[f+0],7,-680876936),e=j(e,a,b,d,c[f+1],12,-389564586),d=j(d,e,a,b,c[f+2],17,606105819),b=j(b,d,e,a,c[f+3],22,-1044525330),a=j(a,b,d,e,c[f+4],7,-176418897),e=j(e,a,b,d,c[f+5],12,1200080426),d=j(d,e,a,b,c[f+6],17,-1473231341),b=j(b,d,e,a,c[f+7],22,-45705983),a=j(a,b,d,e,c[f+8],7,1770035416),e=j(e,a,b,d,c[f+9],
12,-1958414417),d=j(d,e,a,b,c[f+10],17,-42063),b=j(b,d,e,a,c[f+11],22,-1990404162),a=j(a,b,d,e,c[f+12],7,1804603682),e=j(e,a,b,d,c[f+13],12,-40341101),d=j(d,e,a,b,c[f+14],17,-1502002290),b=j(b,d,e,a,c[f+15],22,1236535329),a=k(a,b,d,e,c[f+1],5,-165796510),e=k(e,a,b,d,c[f+6],9,-1069501632),d=k(d,e,a,b,c[f+11],14,643717713),b=k(b,d,e,a,c[f+0],20,-373897302),a=k(a,b,d,e,c[f+5],5,-701558691),e=k(e,a,b,d,c[f+10],9,38016083),d=k(d,e,a,b,c[f+15],14,-660478335),b=k(b,d,e,a,c[f+4],20,-405537848),a=k(a,b,d,
e,c[f+9],5,568446438),e=k(e,a,b,d,c[f+14],9,-1019803690),d=k(d,e,a,b,c[f+3],14,-187363961),b=k(b,d,e,a,c[f+8],20,1163531501),a=k(a,b,d,e,c[f+13],5,-1444681467),e=k(e,a,b,d,c[f+2],9,-51403784),d=k(d,e,a,b,c[f+7],14,1735328473),b=k(b,d,e,a,c[f+12],20,-1926607734),a=h(b^d^e,a,b,c[f+5],4,-378558),e=h(a^b^d,e,a,c[f+8],11,-2022574463),d=h(e^a^b,d,e,c[f+11],16,1839030562),b=h(d^e^a,b,d,c[f+14],23,-35309556),a=h(b^d^e,a,b,c[f+1],4,-1530992060),e=h(a^b^d,e,a,c[f+4],11,1272893353),d=h(e^a^b,d,e,c[f+7],16,-155497632),
b=h(d^e^a,b,d,c[f+10],23,-1094730640),a=h(b^d^e,a,b,c[f+13],4,681279174),e=h(a^b^d,e,a,c[f+0],11,-358537222),d=h(e^a^b,d,e,c[f+3],16,-722521979),b=h(d^e^a,b,d,c[f+6],23,76029189),a=h(b^d^e,a,b,c[f+9],4,-640364487),e=h(a^b^d,e,a,c[f+12],11,-421815835),d=h(e^a^b,d,e,c[f+15],16,530742520),b=h(d^e^a,b,d,c[f+2],23,-995338651),a=l(a,b,d,e,c[f+0],6,-198630844),e=l(e,a,b,d,c[f+7],10,1126891415),d=l(d,e,a,b,c[f+14],15,-1416354905),b=l(b,d,e,a,c[f+5],21,-57434055),a=l(a,b,d,e,c[f+12],6,1700485571),e=l(e,a,
b,d,c[f+3],10,-1894986606),d=l(d,e,a,b,c[f+10],15,-1051523),b=l(b,d,e,a,c[f+1],21,-2054922799),a=l(a,b,d,e,c[f+8],6,1873313359),e=l(e,a,b,d,c[f+15],10,-30611744),d=l(d,e,a,b,c[f+6],15,-1560198380),b=l(b,d,e,a,c[f+13],21,1309151649),a=l(a,b,d,e,c[f+4],6,-145523070),e=l(e,a,b,d,c[f+11],10,-1120210379),d=l(d,e,a,b,c[f+2],15,718787259),b=l(b,d,e,a,c[f+9],21,-343485551),a=q(a,m),b=q(b,n),d=q(d,p),e=q(e,r);return[a,b,d,e]}function h(c,g,a,b,d,e){c=q(q(g,c),q(b,e));return q(c<<d|c>>>32-d,a)}function j(c,
g,a,b,d,e,f){return h(g&a|~g&b,c,g,d,e,f)}function k(c,g,a,b,d,e,f){return h(g&b|a&~b,c,g,d,e,f)}function l(c,g,a,b,d,e,f){return h(a^(g|~b),c,g,d,e,f)}function s(c,g){var a=r(c);16<a.length&&(a=p(a,c.length*m));for(var b=Array(16),d=Array(16),e=0;16>e;e++)b[e]=a[e]^909522486,d[e]=a[e]^1549556828;a=p(b.concat(r(g)),512+g.length*m);return p(d.concat(a),640)}function q(c,g){var a=(c&65535)+(g&65535);return(c>>16)+(g>>16)+(a>>16)<<16|a&65535}function r(c){for(var g=[],a=(1<<m)-1,b=0;b<c.length*m;b+=
m)g[b>>5]|=(c.charCodeAt(b/m)&a)<<b%32;return g}function t(c){for(var g="",a=(1<<m)-1,b=0;b<32*c.length;b+=m)g+=String.fromCharCode(c[b>>5]>>>b%32&a);return g}function u(c){for(var g=w?"0123456789ABCDEF":"0123456789abcdef",a="",b=0;b<4*c.length;b++)a+=g.charAt(c[b>>2]>>8*(b%4)+4&15)+g.charAt(c[b>>2]>>8*(b%4)&15);return a}function v(c){for(var g="",a=0;a<4*c.length;a+=3)for(var b=(c[a>>2]>>8*(a%4)&255)<<16|(c[a+1>>2]>>8*((a+1)%4)&255)<<8|c[a+2>>2]>>8*((a+2)%4)&255,d=0;4>d;d++)g=8*a+6*d>32*c.length?
g+x:g+"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(b>>6*(3-d)&63);return g}var w=0,x="",m=8;n.hex_md5=function(c){return u(p(r(c),c.length*m))};n.b64_md5=function(c){return v(p(r(c),c.length*m))};n.str_md5=function(c){return t(p(r(c),c.length*m))};n.hex_hmac_md5=function(c,g){return u(s(c,g))};n.b64_hmac_md5=function(c,g){return v(s(c,g))};n.str_hmac_md5=function(c,g){return t(s(c,g))}});
