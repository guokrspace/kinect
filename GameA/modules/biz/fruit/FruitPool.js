/**
 * 使用类似"池"的机制加载水果资源
 * User: yaoxx
 * Date: 13-3-15
 * Time: 下午12:15
 */
define(function (require, exports, module) {
    var root = this, state = false,
        log = require("core/Logger").getLog(),
        Hash = require('utils/Md5');
    var nodePool={};    //节点池
    var group,groupName="__FruitPoolGroup";
    exports.init = function () {
        if (!state) {
            initView();
            state = true;
        }
    };
    function initView(){
        group=new SFNode("DEF "+groupName+" Group{children[]}");
        GROUPMID.addChild(group);
    }

    /**
     * 获取某个组某个节点
     * @param nodeName：获取节点的名字
     * @param nodePoolName：获取节点所属池的名字
     * @param groupNodeName：池是什么组节点类型
     * @param createNodeFunc：回调函数，用于创建节点
     */
    exports.get=function(nodeName,nodePoolName,groupNodeName,createNodeFunc){
        groupNodeName=groupNodeName||"Group";
        var poolName=nodePoolName+"_"+groupNodeName;
        var existNodePool=(poolName in nodePool);
        if(!existNodePool){
            var poolNode=new SFNode("DEF "+nodePoolName+" "+groupNodeName+"{children[]}");
            nodePool[poolName]={"node":poolNode};
            group.addChild(poolNode);
        }
        if(nodeName in nodePool[poolName]){     //节点已经被创建在该组(池)中
            var nodes=nodePool[poolName][nodeName].nodes;
            for(var i=0;i<nodes.length;i++){
                var node=nodes[i];
                var nodeId=poolName+"_"+nodeName+"_"+i;
                if(node[1]==0&&node[2]==nodeId){    //存在空闲节点
                    node[1]=1;      //设置为非空闲状态
                    node[0].whichChoice=-1; //所有的node节点都是Switch节点，隐藏该节点
                    return {"id":node[2],"node":node[0]};
                }
            }
            return createNode(nodeName,nodePoolName,groupNodeName,createNodeFunc);
        }else{  //节点不存在该组(池)中
            return createNode(nodeName,nodePoolName,groupNodeName,createNodeFunc);
        }
    };
    //为某组创建节点
    function createNode(nodeName,nodePoolName,groupNodeName,createNodeFunc){
        groupNodeName=groupNodeName||"Group";
        var poolName=nodePoolName+"_"+groupNodeName;
        var len=0;
        if(nodeName in nodePool[poolName]){ //某名字的节点组存在
            len=nodePool[poolName][nodeName].nodes.length
        }else{
            len=0;
            nodePool[poolName][nodeName]={};
            nodePool[poolName][nodeName].nodes=[];
        }
        var nodeId=poolName+"_"+nodeName+"_"+len;
        var node=[createNodeFunc(nodeName,nodePoolName,groupNodeName),1,nodeId];
        nodePool[poolName][nodeName].nodes[len]=node;
        node[0].whichChoice=-1; //隐藏节点
        nodePool[poolName].node.addChild(node[0]);     //将其添加到环境中
        return {'id':node[2],'node':node[0]};
    }
    /**
     * 将某ID的节点置为空闲状态
     * @param id
     */
    exports.remove=function(id){
        var nodeInfo = id.split('_');
        var poolName=nodeInfo[0]+"_"+nodeInfo[1];
        if(nodeInfo.length==4){     //将某个池中的某个id的节点置为空闲状态
            var node=nodePool[poolName][nodeInfo[2]].nodes[nodeInfo[3]];
            node[1]=0;
            node[0].whichChoice=-1;
        }else if(nodeInfo.length==3){   //将某个池中的相同名字的节点组都置为空闲状态
            var nodes=nodePool[poolName][nodeInfo[2]].nodes;
            for(var i=0;i<nodes.length;i++){
                var node=nodes[i];
                node[1]=0;
                node[0].whichChoice=-1;
            }
        }else if(nodeInfo.length==2){   //将某个池中的所有节点都置为空闲状态
            var pool=nodePool[poolName];
            for(var name in pool){
                var nodes=pool[name].nodes;
                for(var i=0;i<nodes.length;i++){
                    var node=nodes[i];
                    node[1]=0;
                    node[0].whichChoice=-1;
                }
            }
        }
    };
    exports.destroy = function () {
        if (state) {
            GROUPMID.removeChild(group);
            nodePool={};
            state = false;
        }
    };
});