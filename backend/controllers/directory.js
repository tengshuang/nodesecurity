var userModel = require('../models/user');
var dirModel = require('../models/directory');
var globalVal = require("../global");

var dirCtrl = {};

// get user's all directory from user's token
dirCtrl.getDirectory = function(token, callback){
	userModel.getDirectory(token, function(result){
		if(result){
            dirModel.getDirectories(result, function (newlist) {
                callback({Directory: newlist});
                return;
            });
		}
		else return callback({Error: {code: globalVal.unauthorized}});
	});
};

// create new directory
dirCtrl.addDirectory = function(token, name, userList, callback){
	userModel.validate({token:token}, function (userInfo) {
		if(userInfo){
            var dir = {name: name, users: userList};
            dirModel.createDir(dir, function(retdirInfo){
            	// insert directory info into user information
				userModel.pushInfo({_id: {$in :userList}},{directories: {dirInfo:retdirInfo._id, bread:true}},function(result){
					if(result.n > 0) return callback({ Directory: {id: retdirInfo._id}});
					else return callback({Error:{code: globalVal.notfound}});
				});
			});
		}
		else return callback({Error: {code: globalVal.unauthorized}});
	});
};

module.exports = dirCtrl;
