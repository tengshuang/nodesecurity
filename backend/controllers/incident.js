'use strict';
var incidentModel = require('../models/incident');
var userModel = require('../models/user');
var globalVal = require("../global");
var io = require('../io');

// test circleci
class IncidentCtrl {
    createIncident(token, type, location, severity, number, callback){
        var incident = {type: type, location: location, severity: severity, number: number};
        userModel.validate({token:token}, function(user){
            if(user){
                incidentModel.createIncident(incident,function(ret){
                    if(ret.Incident !== null){
                        io.sendIncident(user._id,ret);
                    }
                    callback(ret);
                    return;
                });
            }
            else{
                callback({Error: {code: globalVal.unauthorized}});
                return;

            }
        });
    }

    getIncident(token, callback){
        userModel.validate({token:token}, function(user){
            if(user){
                incidentModel.getAllIncident(function(ret){
                    callback(ret);
                    return;
                });
            }
            else{
                callback({Error: {code: globalVal.unauthorized}});
                return;
            }
        });
    }

    setStatus(token,id, callback) {
        userModel.validate({token: token}, function (user) {
            if (user) {
                io.newIncidentState(user._id);
                incidentModel.setStatus({_id: id},function (ret) {
                    callback(ret);
                    return;
                });
            }
            else {
                callback({Error: {code: globalVal.unauthorized}});
                return;
            }
        });
    }
}

module.exports = new IncidentCtrl();
