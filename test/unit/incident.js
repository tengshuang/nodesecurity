/**
 * Created by wang on 2017/4/17.
 */
var assert = require('assert');
var server = require('../../bin/www');
var mongoose = server.mongoose;
var userModel = require('../../backend/models/user');
var incidentModel = require('../../backend/models/incident');
var Incident = mongoose.model('Incident');
var globalVar = require('../../backend/global');
var sinon = require('sinon');
describe('Incident Model:',function() {
    beforeEach((done) => {
        mongoose.connection.dropDatabase(callback => {
            global.name = "test1";
            global.name2 = "test2";
            global.passwd = "81dc9bdb52d04dc20036dbd8313ed055";
            userModel.createUser({name: global.name, passwd: global.passwd}, function (res) {
                global.user = res;
                userModel.createUser({name: global.name2, passwd: global.passwd}, function (res1) {
                    incidentData = {
                        type: 1,
                        location: "mountain view",
                        severity: 1,
                        number: 10
                    }
                    incidentModel.createIncident(incidentData, function (ret) {
                        global.id = ret.Incident._id;
                        done();
                    });
                });
            });
        });
    });

    it("could create an incident", function (done) {
        incidentData = {
            type: 1,
            location: "mountain view",
            severity: 1,
            number: 10
        }
        incidentModel.createIncident(incidentData, function (ret) {
            assert.equal(ret.Incident.type, 1);
            assert.equal(ret.Incident.location, "mountain view");
            assert.equal(ret.Incident.severity, 1);
            assert.equal(ret.Incident.number, 10);
            Incident.findOne({_id: ret.Incident._id}, function(err, incident){
                assert.equal(incident.type, 1);
                assert.equal(incident.location, "mountain view");
                assert.equal(incident.number, 10);
                done();
            });
        });
    });

    it("Should report error when trying to save invalid data", function (done) {
        incidentData = {
            type: 1,
            location: "mountain view",
            severity: "WRONG SEVERITY",
            number: 10
        }
        incidentModel.createIncident(incidentData, function (ret) {
            assert.equal(ret.Error.code, globalVar.dbError);
            done();
        });
    });

    it("could get all incident", function (done) {
        incidentModel.getAllIncident(function (ret) {
            assert.equal(ret.Incident[0].type, 1);
            assert.equal(ret.Incident[0].location, "mountain view");
            assert.equal(ret.Incident[0].severity, 1);
            assert.equal(ret.Incident[0].number, 10);
            done();
        });
    });


    it("should return error with error", function (done) {
        var errorInfo = "error";
        var stub = sinon.stub(Incident, "find");
        stub.callsFake(function(criteria,callback){
            callback(errorInfo, null)
        });
        incidentModel.getAllIncident(function (ret) {
            assert.equal(ret.Error.code, globalVar.dbError);
            stub.restore();
            done();
        });
    });

    it("could set an incident's status", function (done) {
        incidentModel.setStatus({_id: global.id}, function (ret) {
            Incident.findOne({_id: global.id}, function(err, incident){
                assert.equal(incident.status,1);
                done();
            });
        });
    });


    it("should return findOneAndUpdate code with error", function (done) {
        var errorInfo = "error";
        var stub = sinon.stub(Incident, "findOneAndUpdate");
        stub.callsFake(function(criteria,data, callback){
            callback(errorInfo, null)
        });
        incidentModel.setStatus({_id: global.id}, function (ret) {
            console.log(ret);
            assert.equal(ret.Error.code, globalVar.dbError);
            stub.restore();
            done();
        });
    });
});