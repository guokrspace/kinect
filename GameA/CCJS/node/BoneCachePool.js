define(function(l,h){function n(a,d,e){var j=a in c?c[a].nodes.length:0,f=[],f=a+"_"+j+"_"+m.hex_md5(e);if(a in c)d=c[a].resourceid;else{var b=p.cache(d);d=b.id;c[a]=[];c[a].resourceid=b.id;c[a].nodes=[]}var g="",b=""+('\nImageTexture{ url "'+k.base+k.texture+'"}\n'),b=b+"\nBoneInstance {\n"+('\tclassname "'+d+'"\n'),b=b+('\tanimCycle ["'+k.animation.fly.name+'" "0.1" "0.1"]\n'),b=b+('\tmeshSet\t"'+k.meshSet[0].name+'"\n'),b=b+"}";e?g=e.replace("s%",b):(g=g+"Transform{ children ["+b,g+="]}");f=[new SFNode(g),
1,f];c[a].nodes[j]=f;return{id:f[2],node:f[0]}}var c={},m=l("utils/Md5"),p=l("node/BoneLoader"),k={};l("core/Logger").getLog();h.create=function(a,d){var e=m.hex_md5(a);d=d||"";k=l("/resources/"+a+"/config");if(e in c&&0<c[e].nodes.length){a:{for(var j=d,f=c[e].nodes,b=0,g=f.length;b<g;b++){var h=e+"_"+b+"_"+m.hex_md5(j);if(f[b][2]==h&&0==f[b][1]){f[b][1]=1;e={id:h,node:f[b][0]};break a}}e=n(e,a,j)}return e}return n(e,a,d)};h.remove=function(a){if(a){var d=a.split("_");c[d[0]].nodes[d[1]][1]=0}else for(d in c){a=
0;for(var e=c[d].nodes.length;a<e;a++)c[d].nodes[a][1]=0}};h.destory=function(){c={};p.destory()}});
