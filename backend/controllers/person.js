'use strict';
var userModel = require('../models/user');
var personModel = require('../models/person');
var globalVal = require("../global");
var nodemailer = require('nodemailer');

var personCtrl = {};

personCtrl.createPerson = function(token,person,callback) {
	userModel.validate({token:token}, function (userInfo) {
		if(userInfo){
			personModel.createPerson(person,userInfo,function(res){
			    if(res.Error){
                    return callback(res);
                }
                else{
                    personModel.formatPerson(res, function (formatRes) {
                        callback(formatRes);
                    });
                }
			});
		}
		else return callback({Error:{code: globalVal.unauthorized}});
	});
};

personCtrl.findPerson = function(token,personId,callback) {
    userModel.validate({token:token}, function (userInfo) {
        if(userInfo){
            personModel.findPerson(personId,function(res){
                if(res.Error)
                    return callback(res);
                if(res.contactEmail) {
                    var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'cmu.fse.s17.sv6@gmail.com',
                            pass: 'love@fse'
                        }
                    });
                    var mailOptions = {
                        from: 'ESN Notification<cmu.fse.s17.sv6@gmail.com>',
                        to: res.contactEmail,
                        subject: userInfo.name + " has found " + res.name + "!",
                        text: userInfo.name + " just reported that " + res.name + " has been found!",
                        html: userInfo.name + " just reported that " + res.name + " has been found!"
                    };
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error)
                            return console.log(error);
                        console.log("Email sent.");
                    });
                }
                personModel.formatPerson(res, function (formatRes) {
                    callback(formatRes);
                });
            });
        }
        else return callback({Error:{code: globalVal.unauthorized}});
    });
};

personCtrl.closePerson = function(token,personId,callback) {
    userModel.validate({token:token}, function (userInfo) {
        if(userInfo){
            personModel.closePerson(userInfo._id,personId,function(res){
                if(res.Error){
                    return callback(res);
                }
                else{
                    personModel.formatPerson(res,function (formatRes) {
                        callback(formatRes);
                    });
                }
            });
        }
        else return callback({Error:{code: globalVal.unauthorized}});
    });
};

personCtrl.getAllMPCases = function(token, callback) {
    userModel.validate({token:token}, function (userInfo) {
        if(userInfo){
            personModel.getAllMPCases(function(caseList){
                callback(caseList);
            });
        }
        else return callback({Error:{code: globalVal.unauthorized}});
    });
};


module.exports = personCtrl;