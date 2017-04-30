/**
 * Created by tsh on 27/03/2017.
 */
var userCtrl = require('../controllers/user');
var msgCtrl = require('../controllers/message');
var utils = require('../utils');
var stopwordService = utils.stopwordService;
var userModel = require('../models/user');
var personModel = require('../models/person');
var globalVal = require("../global");

var searchCtrl = {};

searchCtrl.search = function(token, type, fromIndex, toIndex, content, callback) {
    userModel.validate({token:token}, function(user) {
        type = parseInt(type,10);
        if (!user)
            return callback({Error: {code: globalVal.unauthorized}});
        if(type < 0 || type > 4 || 0 <= type && type <= 1 && (fromIndex || toIndex) || 2 <= type && type <= 4 && (!fromIndex || !toIndex))
                return callback({Error: {code: globalVal.notfound}});
        if (type === 1 || type === 0) {
            console.log(content);
            return userCtrl.searchForUserLists(type, content, function (res) {
                callback(res);
            });
        }
        return stopwordService.isValid(content, function (res) {
            if (!res) 
                return callback({Error: {code: globalVal.forbidden}});
            if(type === 2 || type === 3)
                msgCtrl.searchForMessages(type, content, fromIndex, toIndex, function (res) {
                    return callback(res);
                });
            else
                msgCtrl.searchForPrivateMessages(token,content, fromIndex, toIndex,function (res){
                    return callback(res);
                });
        });
    });
};

searchCtrl.searchPerson = function(token,content,callback){
    userModel.validate({token:token}, function(user) {
        if(user) {
            personModel.search(content, function (resList) {
                callback({Cases:resList});
                return;
            });
        }else return callback({Error:{code: globalVal.unauthorized}});
    });
};

module.exports = searchCtrl;