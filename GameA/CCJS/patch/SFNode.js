(function(){var c,a=0;SFNode._get=c=SFNode.get;var e=function(b){var d=c(b);if(d)return d;a++;5<a?(print("Error : 获取节点失败,请检查节点"+b+"是否存在"),a=0):e(b)};SFNode.get=e})(this);
