var userModel = require('../models/user');
var directoryModel = require('../models/directory');
var utils = require('../utils');
var instant = require('../io');
var dirControl = require('./directory');
var globalVal = require("../global");
var typeService = utils.typeService;

var userCtrl = {};

userCtrl.login = function(name, pass, callback) {
	var newUser = {name: name, passwd: pass};
	userModel.findUser(newUser, function(code, result){
		if (code === globalVal.success){
			userModel.createToken(result, function(result_code, user){
                userModel.formateUser(user,function (ret) {
					callback(ret);
                });
			});
		}
		else return callback({Error:{code:code}});
	});
};


userCtrl.logout = function(token, callback){
	userModel.setLogoutStatus(token, function(user){
		if (user){
            instant.logout(user._id);
			return callback({ Result: {code: globalVal.success}});
		}
		else return callback({ Error: {code:globalVal.unauthorized}});
	});
};


userCtrl.logoutByName = function(name, callback){
	userModel.setLogoutByName(name, function(code){
		if (code === globalVal.success) return callback({Result: {code: globalVal.success}});
		else return callback({Error: {code: globalVal.unauthorized}});
	});
};


userCtrl.signup = function(name, pass,photo, callback){
	var newUser = {name: name, passwd: pass, photo: photo, directories: []};
	userModel.findUser(newUser, function(ret_code,result){
		directoryModel.initializeDir(function(dir,announcementdir,incident) {
            userModel.notificationDirectory(newUser,dir,announcementdir,incident,function (res) {
                userModel.createUser(res, function(user){
                    directoryModel.addUser({_id: dir._id},user,function(){
                        directoryModel.addUser({_id:announcementdir._id}, user, function(){
                            directoryModel.addUser({_id:incident._id}, user, function(){
								userModel.formateUser(user,function (ret) {
                                    callback(ret);
                                });
                            });
                        });
                    });
                });
            });
		});
	});
};

userCtrl.getUsersByDirId = function(token, dirId, callback){
	userModel.getDirectory(token, function(result){
		if(result){
			var flag = false;
			for(var i = 0; i < result.length; i++)
				if(dirId === result[i].dirInfo._id.toString())
					flag = true;
			if(!flag) return callback({Error: {code: globalVal.notfound}});
            return directoryModel.getUser(dirId, function(ret_code, ret_result){
                userModel.formatUserLists(ret_result,function (userList) {
                    callback(userList);
                });
            });
		}
		else return callback({Error:{code: globalVal.unauthorized}});
	});

};

userCtrl.searchForUserLists = function (type,content,callback) {
    typeService.isValid(type,content,function (res) {
		if(res){
            userModel.getUsersLists(type,content,function(userLists) {
                if(userLists) {
                    userModel.sortUsers(userLists,function (users) {
                        userModel.formatUserLists(users,function (res) {
                            callback(res);
                        });
                    });
                }
                else return callback({Error:{code: globalVal.notfound}});
            });
		}
		else return callback({Error:{code: globalVal.notfound}});
    });
};

userCtrl.setStatus = function(token, location, status,callback){
	userInfo = {};
	if (location) userInfo.location = location;
	if(status) userInfo.status = status;
	// update status
	userModel.updateInfo({token:token},userInfo, function(user){
		if(user) {
            instant.newUserStatus(user._id);
            return callback({Users: {name: user.name, token: user.token, location: user.location, status: user.status}});
		}
		else return callback({Error:{code: globalVal.unauthorized}});
	});
};

// set directory to bread
userCtrl.setDirectoryStatus = function(token, dirId,callback) {
	userModel.validate({token:token}, function(user) {
		if(user){
			dirInfo = user.directories;
			var flag = false;
			for(var i = 0; i < dirInfo.length; i++){
				if(dirInfo[i].dirInfo.toString() === dirId){
					dirInfo[i].bread = true;
					flag = true;
					break;
				}
			}
			if(!flag){
                callback({Error:{code: globalVal.notfound}});
                return;
			}
			userModel.updateInfo({token:token}, {directories: dirInfo}, function(user){
				dirControl.getDirectory(token, function(dirList){
					callback(dirList);
				});
			});
		}
		else return callback({Error:{code: globalVal.unauthorized}});
	});
};

userCtrl.getUserInfo = function(userinfo, callback){
	userModel.validate(userinfo, function(user){
		callback(user);
	});
};

module.exports = userCtrl;