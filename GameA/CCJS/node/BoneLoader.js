define(function(j,l){j("core/Logger").getLog();var g={},d=null;l.cache=function(a){var b;b=fullpath("resources/"+a);b=b.replace(/\/|\.|:/g,"_");var k;d||(d=SFNode.get("__BoneGroup"),d=new SFNode("DEF __BoneGroup Group{}"),SFNode.get("lyinux->userscenegraphroot").children[0].addChild(d));k=d;var c=j("/resources/"+a+"/config");if(!(b in g)){a=""+("\nDEF "+b+" Bone {\n")+('\tbase "resources/'+a+'"\n');a+='\tskeleton "'+c.bone+'"\n';a+="\tmeshSet [\n";for(var e=0;e<c.meshSet.length;e++){a+='\t\t"'+c.meshSet[e].name+
'" ';for(var h=0;h<c.meshSet[e].mesh.length;h++)a+='"'+c.meshSet[e].mesh[h]+'" "x"';a+='""\n'}a+="\t]\n";a+="\tanimation [\n";for(var f in c.animation)a+='\t\t"'+c.animation[f].name+'"\n';a+="\t]\n";a+="}\n";f=new SFNode(a);k.addChild(f);g[b]={id:b,node:f,state:0}}return g[b]}});
