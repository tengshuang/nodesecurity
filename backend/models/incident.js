'use strict';

var Incident = require('../db/incident');
var globalVar = require('../global');


class IncidentModel {
    createIncident(incident,callback){
        var newIncident = new Incident(incident);
        newIncident.save(function(error,inci){
            if(error){
                callback({Error: {code: globalVar.dbError}});
                return;
            }
            else{
                callback({Incident:inci});
                return;
            }
        });
    }

    getAllIncident(callback){
        Incident.find({}, function(error, result){
            if(error){
                callback({Error: {code: globalVar.dbError}});
                return;
            }else{
                callback({Incident: result});
                return;
            }
        });
    }

    setStatus(info,callback){
        Incident.findOneAndUpdate(
            info,
            {$set: {status: 1}},function(error, result) {
                if(error){
                    callback({Error: {code: globalVar.dbError}});
                    return;
                }
                else{
                    callback({Incident: result});
                    return;
                }
        });
    }
}

module.exports = new IncidentModel();
