var userModel = require('../models/user');
var dirModel = require('../models/directory');
var msgModel = require('../models/message');
var io = require('../io');
var globalVal = require("../global");


var msgCtrl ={};

// post new message
msgCtrl.postMsg = function(token, dirId, message, callback){
	userModel.validate({token:token}, function(user){
		if(user) {
			var msg = {creator: user._id, directory: dirId, content: message,location: user.location, status: user.status};
			msgModel.createMessage(msg, function(ret_message){
				if(ret_message) {
					dirModel.addMessage(ret_message, function(ret){
						dirModel.findDir({_id: dirId}, function (dirInfo) {
							userModel.updateMany({_id: {$in :dirInfo.users},"directories.dirInfo":dirId}, {"directories.$.bread":false}, function(result){
                                msgModel.formatPostMessage(user,ret_message,dirId,function (msg) {
                                    for(var i = 0; i < dirInfo.users.length; i++){
                                        io.sendMessage(dirInfo.users[i],msg);
                                    }
                                	callback(msg);
									return;
								});
							});

						});
					});
				}
				else return callback({Error: {code: globalVal.notfound}});
			});
		}
		else return callback({Error: {code: globalVal.unauthorized}});
	});
};

msgCtrl.searchForMessages = function (type,content,fromIndex,toIndex, callback) {
	var dirName = globalVal.announcementDirName;
	var dirId;
	if(type === 3) dirName = globalVal.publicDirName;
    dirModel.findDir({name:dirName},function (res) {
        dirId = res._id;
        msgModel.searchMessage(dirId,content,fromIndex,toIndex,function (messages) {
            msgModel.formatMessage(messages,function (msglist) {
                callback(msglist);
            });
        });
    });
};

msgCtrl.searchForPrivateMessages = function (token,content,fromIndex,toIndex, callback) {
	msgModel.getMessages(token,function (res) {
        if (res) {
            msgModel.formatMessageIdList(res, function (messagesIdList) {
                msgModel.searchPrivateMessage(messagesIdList, content, fromIndex, toIndex, function (messages) {
                    msgModel.formatMessage(messages, function (msglist) {
                        callback(msglist);
                    });
                });
            });
        } else {
            return callback({Error: {code: globalVal.unauthorized}});
        }
    });
};

msgCtrl.getMsg = function(token, dirId, callback){
	userModel.validate({token:token}, function(user){
		if(user){
			dirModel.getMsg({_id: dirId}, function(dir){
				if(dir){
                    var l = dir.msgs;
                    msgModel.formatMessage(l,function (msglist) {
						callback(msglist);
                    });
				}
				else return callback({Error: {code: globalVal.notfound}});
			});
		}
		else return callback({Error: {code: globalVal.unauthorized}});
	});
};
			


module.exports = msgCtrl;
