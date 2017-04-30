'use strict';
var Directory = require('../db/directory');
var userService = require('./user');

var publicDir;
var announcementDir;
var incidentDir;
var globalVal = require("../global");
class DirecotryModel {

    initializeDir(callback){
        var me = this;
        this.findDir({name: 'public'},function(dir) {
            if(dir){
                publicDir = dir;
                exports.publicDir = publicDir;
                me.createAnnouncement(function(announcementdir,incident) {
                    callback(dir,announcementdir,incident);
    			});
            }
            else {
                me.createDir({name:"public"},function(dir){
                    publicDir = dir;
                    exports.publicDir = publicDir;
                    me.createAnnouncement(function(announcementdir,incident){
                    	callback(dir,announcementdir,incident);
    				});
                });
            }
        });
    }

    createAnnouncement(callback){
        var me = this;
        this.findDir({name: "announcement"},function(dir) {
            if(dir){
                announcementDir = dir;
                exports.announcementDir = announcementDir;
                me.createIncidentDir(function(incidentDir) {
                    callback(dir,incidentDir);
                });
                return;
            }
            else {
                me.createDir({name:"announcement"},function(dir){
                    announcementDir = dir;
                    exports.announcementDir = announcementDir;
                    me.createIncidentDir(function (incidentDir) {
                        callback(dir, incidentDir);
                        return;
                    });
                });
            }
        });
    }

    createIncidentDir(callback){
        var me = this;
        this.findDir({name: "incident"},function(dir) {
            if(dir){
                exports.incidentDir = dir;
                callback(dir);
                return;
            }
            else {
                me.createDir({name:"incident"},function(dir){
                    incidentDir = dir;
                    exports.incidentDir = incidentDir;
                    callback(dir);
                    return;
                });
            }
        });
    }

    createDir(dirInfo, callback){
        var newDir = new Directory(dirInfo);
        newDir.save(function(error, dir){
    		callback(dir);
        });
    }

    findDir(criterion, callback){
    	Directory.findOne(criterion, function(error, dirInfo){
    		callback(dirInfo);
    	});
    }


    getMsg(criterion, callback){
    	Directory.findOne(criterion)
    		.deepPopulate('msgs.creator')
    		.sort('time')
    		.exec((error, result) => {
    			callback(result);
    		});
    }


    getDirectories (result,callback) {
        var retlist = [];
        var sortlist = [];
        for(var i = 0; i < result.length; i++){
            if(i > 2)
                sortlist.push({name: result[i].dirInfo.name, id: result[i].dirInfo._id, hasBeenRead: result[i].bread});
            else
                retlist.push({name: result[i].dirInfo.name, id: result[i].dirInfo._id, hasBeenRead: result[i].bread});
        }
        this.sortDirectories(sortlist,function (res) {
            callback(retlist.concat(res));
        });
    }

    sortDirectories (sortList,callback) {
        sortList.sort(function(a, b){
            var tmp = +a.hasBeenRead - +b.hasBeenRead;
            return tmp===0 ? a.name > b.name : tmp;
        });
        callback(sortList);
    }

    getUser(dirId, callback){
    	Directory.findOne({_id: dirId})
    		.deepPopulate('users.directories.dirInfo')
    		.exec((err, directory) => {
    	        if(err){
                    return callback({Error: {code: globalVal.dbError}});
                }
                else
    			{
    				var user = directory.users;
                    userService.sortUsers(user,function (res) {
                        callback(globalVal.success,res);
                    });
    			}
    		});
    }

    addMessage(msg, callback){
    	Directory.findOneAndUpdate({_id: msg.directory},
    			{$push: {msgs: msg._id}},
    			function(error, dir){
    	            if(error) return callback({Error: {code: globalVal.dbError}});
    				callback(dir);
    		});
    }

    addUser(criterion,user, callback){
        Directory.findOneAndUpdate(criterion,
            {$push: {users: user._id}}, function(err, dir){
                if(err){
                    return callback({Error:{code:globalVal.dbError}});
                }
        		callback(dir);
    		});
    }

}

module.exports = new DirecotryModel();

