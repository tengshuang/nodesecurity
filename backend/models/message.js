'use strict';
var Message = require('../db/message');
var User = require('../db/user');
var globalVal = require('../global');

class MessageModel {

    createMessage(msg,callback){
    	var newMsg = new Message(msg);
    	newMsg.save(function(error,msg){
    		callback(msg);
    	});
    }

    formatMessage (l,callback) {
        var msglist = [];
        for( var i=0; i < l.length; i++ ) {
            msglist.push({creator: l[i].creator,
                content: l[i].content, time: l[i].time, location: l[i].location,
                status: l[i].status});
        }
        callback({Messages:msglist});
    }

    searchMessage(dirId,content,fromIndex,toIndex,callback){
        var contentList = content.split(" ");
        var searchArea = [];
        for (var i = 0; i < contentList.length; ++i)
            searchArea.push({"content":{ $regex: "\\b"+contentList[i]+"\\b", $options: 'i' }});

    	var q = Message.find({$and:searchArea,directory:dirId}).deepPopulate('creator').sort({'time': -1}).skip(parseInt(fromIndex,10)).limit(parseInt(toIndex-fromIndex + 1,10));
        q.exec(function (err,messages) {
            if(err){
                return callback({Error: {code: globalVal.dbError}});
            }
        	callback(messages);
        });
    }

    searchPrivateMessage(messageIdList,content,fromIndex,toIndex,callback){
        var contentList = content.split(" ");
        var searchArea = [];
        for (var i = 0; i < contentList.length; ++i)
            searchArea.push({"content":{ $regex: "\\b"+contentList[i]+"\\b", $options: 'i' }});
        //var q = Message.find({'content':{ $regex: content, $options: 'i' },'_id': {$in: messageIdList}}).deepPopulate('creator').sort({'time': -1}).skip(parseInt(fromIndex)).limit(parseInt(toIndex-fromIndex + 1));
        var q = Message.find({$and:searchArea,'_id': {$in: messageIdList}}).deepPopulate('creator').sort({'time': -1}).skip(parseInt(fromIndex,10)).limit(parseInt(toIndex-fromIndex + 1,10));
        q.exec(function (err,messages) {
            if(err){
                return callback({Error: {code: globalVal.dbError}});
            }
            callback(messages);
        });
    }

    formatPostMessage(user,ret_message,dirId,callback){
        var msg = {Messages: {creator: {_id: user._id, name: user.name, photo: user.photo},content: ret_message.content,
            time: ret_message.time, location: ret_message.location, status: ret_message.status, dirId: dirId}};
        callback(msg);
    }

    getMessages(token, callback){
        User.findOne({token: token})
            .deepPopulate('directories.dirInfo.msgs')
            .exec((err, user) => {
                if(err)
                    return callback({Error:{code:globalVal.dbError}});
                if(user)
                    return callback(user.directories);
                else
        			return callback(null);
    	});
    }

    formatMessageIdList(directories,callback){
    	var length = directories.length;
    	var res = [];
    	for (var i = 2; i < length; ++i){
    		var length1 = directories[i].dirInfo.msgs.length;
    		for(var j = 0; j < length1; ++j)
    			res.push(directories[i].dirInfo.msgs[j]);
    	}
    	callback(res);
    }

}

module.exports = new MessageModel();

