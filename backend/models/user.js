'use strict';
var User = require('../db/user');
var Directory = require('../db/directory');
var utils = require('../utils');
var tokenService = utils.tokenService;
var globalVal = require("../global");

class UserModel {

	createUser(user, callback){
		var newUser = new User(user);
		newUser.token = tokenService.createToken(user.name);
		newUser.login = 1;

		newUser.save(function(error, user) {
			callback(user);
		});
	}

	findUser(user, callback){
		var criteria = {name: user.name};
		User.findOne(criteria, function(error, result){
				if (!result){
					callback(globalVal.notfound,null);
					return;
				}
				if (user.passwd === result.passwd) {
					callback(globalVal.success, result);
					return;
				}
				callback(globalVal.unauthorized, null);
		});
	}

	formatUserLists (userLists, callback) {
	    var res = [];
	    for(var i = 0; i < userLists.length; i++){
	        res.push({name: userLists[i].name, status: userLists[i].status,
	            location: userLists[i].location,login:userLists[i].login,
	            photo: userLists[i].photo, id: userLists[i]._id});
	    }
	    callback({Users: res});
	}

	formateUser (user,callback) {
	    var dirlist = [];
	    for(var i=0; i<user.directories.length; i++)
	        dirlist.push(user.directories[i].dirInfo);
	    var res = {Users:{name: user.name,token:user.token, photo: user.photo,
	        status:user.status,location:user.location,login:user.login,
	        directories:dirlist, id:user._id}};
	    callback(res);
	}

	notificationDirectory (newUser,dir,announcementdir,incident, callback) {
	    // if there are messages in the directory, there should be a notify
	    if(announcementdir.msgs.length > 0) {
	        newUser.directories.push({dirInfo:announcementdir._id, bread: false});
	    }
	    else {
	        // if there is no message in the directory, there should not  be a notify
	        newUser.directories.push({dirInfo:announcementdir._id, bread: true});
	    }
	    if(dir.msgs.length > 0)
	        newUser.directories.push({dirInfo: dir._id, bread: false});
	    else
	        newUser.directories.push({dirInfo: dir._id, bread: true});
	    newUser.directories.push({dirInfo: incident._id, bread: true});
	    callback(newUser);
	}

	createToken(user, callback){
		var token = tokenService.createToken(user.name);
		User.findOneAndUpdate({name:user.name}, 
				{ $set: { login: 1, token: token}},
				function(error, result){
					result.token = token;
					result.login = 1;
					callback(globalVal.success, result);
		});
	}

	updateInfo(info,data, callback){
		User.findOneAndUpdate(
			info,
			{$set: data},
			function(error, result){
				callback(result);
			});
	}

	updateMany(info, data, callback){
	    User.updateMany(
	        info,
	        {$set : data},
	        function (error, result) {
	            callback(result);
	        });
	}

	pushInfo(info,data, callback){
	    User.updateMany(
	        info,
	        {$push: data},
	        function(error, result){
	            callback(result);
	        });
	}

	sortUsers (users,callback) {
	    users.sort(function(a, b){
	        if (a.login < b.login)
	            return 1;
	        if (a.login > b.login)
	            return -1;
	        return a.name > b.name;
	    });
	    callback(users);
	}

	setLogoutStatus(token, callback){
		User.findOneAndUpdate(
				{ token: token}, 
				{ $set: { login: 0, token: ''}},
				function(error, result){
					callback(result);

		});
	}

	getUsersLists (type,content,callback) {
		if(type === 0){
			var name = content;
			User.find({'name':{ $regex: name, $options: 'i' }},function (error,users) {
				callback(users);
	        });
		}
		else if(type === 1){
	        User.find({'status':content},function (error,users) {
				callback(users);
	        });
		}
	    else
			return callback(null);
	}


	setLogoutByName(name, callback){
		User.findOneAndUpdate(
			{ name: name },
			{ $set: {login: 0, token: ''}},
			function(error, result){
				if(result)
					return callback(globalVal.success);
				else
					return callback(globalVal.unauthorized);
		});
	}


	validate(info, callback){
		User.findOne(info, function(error, result){
			callback(result);
		});
	}


	getDirectory(token, callback){
		User.findOne({token: token})
			.deepPopulate('directories.dirInfo.users')
			.exec((err, user) => {
				if(err) return callback({Error:{code:globalVal.dbError}});
				if(user)
					return callback(user.directories);
				else{
					return callback(null);
				}
			});
	}
}

module.exports = new UserModel();
