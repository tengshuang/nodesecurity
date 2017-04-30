/**
 * Created by tsh on 2017/4/04.
 */
var assert = require('assert');
var server = require('../../bin/www');
var mongoose = server.mongoose;
var personModel = require('../../backend/models/person');
var userModel = require('../../backend/models/user');
var Person = mongoose.model('Person');
var globalVar = require('../../backend/global');

var sinon = require('sinon');

describe('Person Model:',function(){
    beforeEach((done) => {
        mongoose.connection.dropDatabase(callback => {
            global.name = "test1";
            global.passwd = "81dc9bdb52d04dc20036dbd8313ed055";
            userModel.createUser({name: global.name, passwd: global.passwd}, function(res){
                global.userInfo = res;
                global.token = res.token;
                global.id = res._id;
                var person = {
                    "name":"testPerson",
                    "age":"22"
                };
                personModel.createPerson(person,{_id:global.id},function (person) {
                    global.person = person;
                    done();
                });
            });
        });
    });

    it("should not create missing person with invalid person type", function(done){
        var person = {
            "name":"missingPerson",
            "time":"1a"
        };
        personModel.createPerson(person, global.id, function(res){
            assert.equal(res.Error.code, globalVar.dbError);
            done();
        });
    });

    it("should create missing person with valid person type", function(done){
        var person = {
            "name":"missingPerson",
            "age":"19"
        };
        personModel.createPerson(person, global.userInfo, function(res){
            assert.equal(res.name,"missingPerson");
            assert.equal(res.age,"19");
            assert.equal(res.creator, global.id);
            assert.equal(res.status,0);
            assert.equal(res.find,0);
            Person.findOne({_id:res._id}, function(error, result){
                assert.equal(result.name,"missingPerson");
                assert.equal(result.age,"19");
                assert.equal(result.status,0);
                assert.equal(result.creator.toString(),global.id);
                assert.equal(result.find,0);
                done();
            });
        });
    });

    it("should find missing person with valid person Id", function(done){
        var personId = global.person._id;
        personModel.findPerson(personId,function(res){
            assert.equal(res.find, 1);
            Person.findOne({_id:personId}, function(error, result){
                assert.equal(result.name,"testPerson");
                assert.equal(result.age,"22");
                assert.equal(result.status,0);
                assert.equal(result.creator.toString(),global.id);
                assert.equal(result.find,1);
                done();
            });
        });
    });

    it("should not find missing person with invalid person Id", function(done){
        var personId = "wrongPersonId";
        personModel.findPerson(personId,function(res){
            assert.equal(res.Error.code, globalVar.dbError);
            done();
        });
    });

    it("should close missing person case with valid person Id and valid creator Id", function(done){
        var personId = global.person._id;
        personModel.closePerson(global.id,personId,function(res){
            assert.equal(res.status, 1);
            Person.findOne({_id:personId}, function(error, result){
                assert.equal(result.name,"testPerson");
                assert.equal(result.age,"22");
                assert.equal(result.status,1);
                assert.equal(result.creator.toString(),global.id);
                assert.equal(result.find,0);
                done();
            });
        });
    });

    it("should not close missing person with invalid person Id", function(done){
        var personId = "wrongPersonId";
        personModel.closePerson(global.id,personId,function(res){
            assert.equal(res.Error.code, globalVar.dbError);
            done();
        });
    });

    it("should not close missing person with invalid creator Id", function(done){
        var personId = global.person._id;
        var creatorId = "wrongCreatorId";
        personModel.closePerson(creatorId,personId,function(res){
            assert.equal(res.Error.code, globalVar.dbError);
            done();
        });
    });

    it("should return right format of person", function(done){
        var person = {
            "name":"missingPerson",
            "age":"11",
            "__v":0
        };
        personModel.formatPerson(person,function (res) {
            assert.equal(res.Person.__v, undefined);
            assert.equal(res.Person.name,"missingPerson");
            assert.equal(res.Person.age,"11");
            done();
        });
    });

    it("should search missing person list with valid content", function(done){
        var content = "2";
        personModel.search(content,function (res) {
            assert.equal(res[0].age, "22");
            assert.equal(res[0].name,"testPerson");
            assert.equal(res[0].status,0);
            assert.equal(res[0].find,0);
            assert.equal(res[0].creator.toString(),global.id);
            assert.equal(res[0]._id.toString(),global.person._id);
            done();
        });
    });

    it("should search empty missing person list with valid content", function(done){
        var content = "[";
        personModel.search(content,function (res) {
            assert.equal(res.length, 0);
            done();
        });
    });

    it("should not search missing person list with invalid content", function(done){
        var content = null;
        personModel.search(content,function (res) {
            assert.equal(res.Error.code, globalVar.dbError);
            done();
        });
    });

    it("should get all missing person cases with valid token", function (done) {
        var token = global.token;
        personModel.getAllMPCases(function (res) {
            assert.equal(res.Cases[0].name, global.person.name);
            assert.equal(res.Cases[0].age, global.person.age);
            done();
        });
    });

    it("should handle database exception for getting all missing person cases", function(done){
        var stub = sinon.stub(Person,"find");
        stub.yields(Error,null);
        personModel.getAllMPCases(function (res) {
            assert.equal(res.Error.code,globalVar.dbError);
            stub.restore();
            done();
        });
    });

});