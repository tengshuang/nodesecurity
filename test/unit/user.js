/**
 * Created by wang on 2017/3/29.
 */
var assert = require('assert');
var server = require('../../bin/www');
var mongoose = server.mongoose;
var userModel = require('../../backend/models/user');
var dirModel = require('../../backend/models/directory');
var User = mongoose.model('User');
var globalVar = require('../../backend/global');

var sinon = require('sinon');
require('sinon-mongoose');

describe('User Model:',function(){
    beforeEach((done) => {
        mongoose.connection.dropDatabase(callback => {
            global.name = "test1";
            global.name2 = "test2";
            global.passwd = "81dc9bdb52d04dc20036dbd8313ed055";
            userModel.createUser({name: global.name, passwd: global.passwd}, function(res){
                global.token = res.token;
                global.id = res._id;
                userModel.createUser({name: global.name2, passwd: global.passwd}, function (res1) {
                    global.id2 = res1._id;
                   done();
                });
            });
        });
    });

    describe("create user", function () {
        var resUser;
        beforeEach((done) => {
            userModel.createUser({name: "newTest"}, function(res){
                resUser = res;
                done();
            });
        });


        it("create user", function(done){
            assert.equal(resUser.name, "newTest");
            assert.equal(resUser.login, 1);
            User.findOne({name:resUser.name},"name login",function(err,res1) {
                assert.equal(res1.name, "newTest");
                assert.equal(res1.login, 1);
                done();
            });

        });
    });



    it("should findUser with correct name", function(done){
        userModel.findUser({name: global.name, passwd: global.passwd}, function(code, res){
            assert.equal(code, globalVar.success);
                done();
        });
    });

    it("should not findUser with incorrect password", function(done){
        userModel.findUser({name: global.name, passwd: "Wrong"}, function(code, res){
            assert.equal(code, globalVar.unauthorized);
            done();
        });
    });

    it("should not findUser with incorrect name", function(done){
        userModel.findUser({name: "user", passwd: global.passwd}, function(code, res){
            assert.equal(code, globalVar.notfound);
            done();
        });
    });

    it("Should format user list", function(done){
        var userList = [];
        userList.push({name: "test1"});
        userList.push({name: "test2"});
        userModel.formatUserLists(userList, function(res){
            assert.equal(res.Users.length, userList.length);
            done();
        });
    });

    it("Should format user object", function(done){
        var dirlist = [];
        dirlist.push({dirInfo: "aaa", bread: true});
        dirlist.push({dirInfo: "aaa", bread: false});
        userModel.formateUser({name: "test1", directories: dirlist}, function(res){
            assert.equal(res.Users.directories.length, dirlist.length);
            assert.equal(res.Users.name, "test1");
            done();
        });
    });

    it("Should push notification", function(done){
        var dir = {msgs: []};
        var announcementdir = {msgs:[]};
        var incident = {};
        userModel.notificationDirectory({name: "test1", directories:[]},dir,announcementdir,incident, function(res){
            assert.equal(res.directories[0].bread, true);
            assert.equal(res.directories[1].bread, true);
            done();
        });
    });

    it("Should not push notification", function(done){
        var dir = {msgs: ["msg"]};
        var announcementdir = {msgs:["msg"]};
        var incident = {};
        userModel.notificationDirectory({name: "test1", directories:[]},dir,announcementdir,incident, function(res){
            assert.equal(res.directories[0].bread, false);
            assert.equal(res.directories[1].bread, false);
            done();
        });
    });

    it("Should create token", function(done){
        var user = {name: global.name};
        userModel.createToken(user, function(code, res){
            assert.equal(res.login, 1);
            done();
        });
    });

    it("Should update information", function(done){
        var user = {name: global.name};
        userModel.updateInfo(user, {location: "Mountaion View"},function(res){
            assert.equal(res.name, global.name);
            User.findOne({name: res.name}, function(err,res1){
                assert.equal(res1.location,"Mountaion View");
                done();
            });
        });
    });

    it("Should update multiple users", function(done){
        userModel.updateMany({login: 1}, {login: 0},function(res){
            User.findOne({login: 1}, function(err,res1){
                assert.equal(res1, null);
                done();
            });
        });
    });

    describe("pushInfo", function () {
        var retDir;
        beforeEach((done) => {
            dirModel.createDir({users: [global.id, global.id2]}, function(ret){
                retDir = ret;
                done();
            });
        });

        it("Should push user info", function(done){

            userModel.pushInfo({login: 1}, {directories: {dirInfo: retDir._id, bread: true} },function(res){
                User.find({login: 1}, function(err,res1){
                    for(var i = 0; i < res1.length; i++){
                        assert.equal(res1[i].directories[0].dirInfo.toString(), retDir._id);
                    }
                    done();
                });
            });

        });


    });





    it("Should sort users", function(done){
        user = [{name: "a",login: 1},{name: "b",login: 1},{name: "c",login: 0},{name: "d",login: 1}];
        userModel.sortUsers(user, function(ret){
            assert.equal(ret[0].name, "a");
            assert.equal(ret[1].name, "b");
            assert.equal(ret[2].name, "d");
            assert.equal(ret[3].name, "c");
            done();
        });
    });

    it("Should set user logout status", function(done){
        userModel.setLogoutStatus(global.token, function(ret){
            User.findOne({name: ret.name}, function(err, res1){
               assert.equal(res1.token, '');
               assert.equal(res1.login, 0);
               done();
            });
        });
    });

    it("Should get user list with type 0", function(done){
        userModel.getUsersLists(0,"test", function(ret){
            assert.equal(ret[0].name,"test1");
            assert.equal(ret[1].name, "test2");
            userModel.getUsersLists(0, "a", function(ret1){
                assert.equal(ret1.toString(), [].toString());
                done();
            });
        });
    });

    it("Should get user list with type 1", function(done){
        userModel.getUsersLists(1, 0, function(ret){
            assert.equal(ret[0].name,"test1");
            assert.equal(ret[1].name, "test2");
            userModel.getUsersLists(1, 1, function(ret1){
                assert.equal(ret1.toString(), [].toString());
                done();
            });
        });
    });

    it("Should not get user list with type 3", function(done){
        userModel.getUsersLists(3, 0, function(ret){
            assert.equal(ret, null);
            done();
        });
    });

    it("Should set logout status by user name", function(done){
        userModel.setLogoutByName(global.name, function(ret){
            assert.equal(ret, globalVar.success);
            User.findOne({name: global.name}, function(err, res1){
                assert.equal(res1.token, '');
                assert.equal(res1.login, 0);
                done();
            });
        });
    });

    it("Should not set logout status by wrong user name", function(done){
        userModel.setLogoutByName("Wrong", function(ret){
            assert.equal(ret, globalVar.unauthorized);
            done();
        });
    });

    it("Should validate a user with token", function(done){
        userModel.validate({token: global.token}, function(ret){
            assert.equal(ret.name, global.name);
            done();
        });
    });

    it("Should not get directories with wrong token", function(done){
        userModel.getDirectory("Wrong", function(ret){
            assert.equal(ret,null );
            done();
        });
    });


    describe("getDirectory", function () {
        var retDir;
        beforeEach((done) => {
            dirModel.createDir({users: [global.id, global.id2]}, function(ret){
                retDir = ret;
                userModel.pushInfo({token: global.token}, {directories: {dirInfo: ret._id, bread: true} },function(res) {
                    done();
                });
            });


        });


        it("Should get directories with token", function(done){

            userModel.getDirectory(global.token, function (ret1) {
                assert.equal(ret1[0].dirInfo._id.toString(), retDir._id.toString());
                done();
            });

        });


        it("Should report error when failed to get directories", function(done){
            var userMock = sinon.mock(User);
            userMock
                .expects('findOne')
                .chain('deepPopulate')
                .chain('exec')
                .yields('ERROR', null);
            userModel.getDirectory(global.token, function (ret1) {
                userMock.restore();
                assert.equal(ret1.Error.code, globalVar.dbError);
                done();
            });

        });

    });





});