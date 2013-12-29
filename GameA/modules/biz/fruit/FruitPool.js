/**
 * ʹ������"��"�Ļ��Ƽ���ˮ����Դ
 * User: yaoxx
 * Date: 13-3-15
 * Time: ����12:15
 */
define(function (require, exports, module) {
    var root = this, state = false,
        log = require("core/Logger").getLog(),
        Hash = require('utils/Md5');
    var nodePool={};    //�ڵ��
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
     * ��ȡĳ����ĳ���ڵ�
     * @param nodeName����ȡ�ڵ������
     * @param nodePoolName����ȡ�ڵ������ص�����
     * @param groupNodeName������ʲô��ڵ�����
     * @param createNodeFunc���ص����������ڴ����ڵ�
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
        if(nodeName in nodePool[poolName]){     //�ڵ��Ѿ��������ڸ���(��)��
            var nodes=nodePool[poolName][nodeName].nodes;
            for(var i=0;i<nodes.length;i++){
                var node=nodes[i];
                var nodeId=poolName+"_"+nodeName+"_"+i;
                if(node[1]==0&&node[2]==nodeId){    //���ڿ��нڵ�
                    node[1]=1;      //����Ϊ�ǿ���״̬
                    node[0].whichChoice=-1; //���е�node�ڵ㶼��Switch�ڵ㣬���ظýڵ�
                    return {"id":node[2],"node":node[0]};
                }
            }
            return createNode(nodeName,nodePoolName,groupNodeName,createNodeFunc);
        }else{  //�ڵ㲻���ڸ���(��)��
            return createNode(nodeName,nodePoolName,groupNodeName,createNodeFunc);
        }
    };
    //Ϊĳ�鴴���ڵ�
    function createNode(nodeName,nodePoolName,groupNodeName,createNodeFunc){
        groupNodeName=groupNodeName||"Group";
        var poolName=nodePoolName+"_"+groupNodeName;
        var len=0;
        if(nodeName in nodePool[poolName]){ //ĳ���ֵĽڵ������
            len=nodePool[poolName][nodeName].nodes.length
        }else{
            len=0;
            nodePool[poolName][nodeName]={};
            nodePool[poolName][nodeName].nodes=[];
        }
        var nodeId=poolName+"_"+nodeName+"_"+len;
        var node=[createNodeFunc(nodeName,nodePoolName,groupNodeName),1,nodeId];
        nodePool[poolName][nodeName].nodes[len]=node;
        node[0].whichChoice=-1; //���ؽڵ�
        nodePool[poolName].node.addChild(node[0]);     //������ӵ�������
        return {'id':node[2],'node':node[0]};
    }
    /**
     * ��ĳID�Ľڵ���Ϊ����״̬
     * @param id
     */
    exports.remove=function(id){
        var nodeInfo = id.split('_');
        var poolName=nodeInfo[0]+"_"+nodeInfo[1];
        if(nodeInfo.length==4){     //��ĳ�����е�ĳ��id�Ľڵ���Ϊ����״̬
            var node=nodePool[poolName][nodeInfo[2]].nodes[nodeInfo[3]];
            node[1]=0;
            node[0].whichChoice=-1;
        }else if(nodeInfo.length==3){   //��ĳ�����е���ͬ���ֵĽڵ��鶼��Ϊ����״̬
            var nodes=nodePool[poolName][nodeInfo[2]].nodes;
            for(var i=0;i<nodes.length;i++){
                var node=nodes[i];
                node[1]=0;
                node[0].whichChoice=-1;
            }
        }else if(nodeInfo.length==2){   //��ĳ�����е����нڵ㶼��Ϊ����״̬
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