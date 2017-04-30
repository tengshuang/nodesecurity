/**
 * Created by wang on 2017/4/1.
 */
var assert = require('assert');
var controller = require('../../backend/controllers/index');
var globalVal = require("../../backend/global");
var UserCtrl = controller.user;
var MsgCtrl = controller.message;
var DirectoryCtrl = controller.directory;
var SearchCtrl = controller.search;

var server = require('../../bin/www');
var mongoose = require('mongoose');

var User = mongoose.model('User'),
    Directory = mongoose.model('Directory');

describe('Message:', function() {
    beforeEach((done) => {
        mongoose.connection.dropDatabase(callback => {
            UserCtrl.signup("test1", "81dc9bdb52d04dc20036dbd8313ed055", "23d1e10df85ef805b442a922b240ce25", function (res2) {
                global.user1 = res2.Users;
                UserCtrl.signup("test2", "81dc9bdb52d04dc20036dbd8313ed055", "d12b3daa9cc5470ce8d56cfa2f6673c5", function (res1) {
                    global.user2 = res1.Users;
                    global.public = res1.Users.directories[1].toString();
                    global.anouncement = res1.Users.directories[0].toString();
                    global.announcementMsg = "announcement msg";
                    global.publicMsg = "public msg";
                    global.privateMsg = "private msg";
                    var location = "mountain view";
                    var status = 2;
                    UserCtrl.setStatus(global.user1.token, location, status, function (res4) {
                        MsgCtrl.postMsg(global.user1.token, global.public,global.publicMsg, function (res3) {
                            MsgCtrl.postMsg(global.user1.token, global.anouncement, global.announcementMsg, function (res5) {
                                UserCtrl.signup("test3", "81dc9bdb52d04dc20036dbd8313ed055", "d12b3daa9cc5470ce8d56cfa2f6673c5", function (res7) {
                                    var directoryname1 = "testDirectory";
                                    global.user3 = res7.Users;
                                    var userList = [global.user2.id, global.user3.id];
                                    DirectoryCtrl.addDirectory(global.user3.token, directoryname1, userList, function (res6) {
                                        MsgCtrl.postMsg(global.user3.token, res6.Directory.id, global.privateMsg, function(res7){
                                            done();
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    after((done) => {
        mongoose.connection.dropDatabase(callback => {
            done();
            //mongoose.connection.close(done);
        });
    });

    it("Should not search user with invalid token", function(done){
        SearchCtrl.search("wrongToken", 0, 1, 2, 'a', function(res){
            assert.equal(res.Error.code,globalVal.unauthorized);
            done();
        });
    });


    it("Should search username with valid token", function(done){
        SearchCtrl.search(global.user1.token, 0, 0, 0, 'test', function(res){
            assert.equal(res.Users[0].name, "test1");
            assert.equal(res.Users[1].name, "test2");
            assert.equal(res.Users[2].name, "test3");
            done();
        });
    });

    it("Should search username with valid token", function(done){
        SearchCtrl.search(global.user1.token, 0, 1, 0, 'test', function(res){
            assert.equal(res.Error.code, globalVal.notfound);
            done();
        });
    });

    it("Should search username with valid token", function(done){
        SearchCtrl.search(global.user1.token, 0, 0, 1, 'test', function(res){
            assert.equal(res.Error.code, globalVal.notfound);
            done();
        });
    });

    it("Should search status with valid token", function(done){
        SearchCtrl.search(global.user1.token, 1, 0, 0, '2', function(res){
            assert.equal(res.Users[0].name, "test1");
            done();
        });
    });

    it("Should not search with stop words", function(done){
        SearchCtrl.search(global.user1.token, 2, '0', '10', "an", function(res){
            assert.equal(res.Error.code, globalVal.forbidden);
            done();
        });
    });

    it("Should search announcement with valid token", function(done){
        SearchCtrl.search(global.user1.token, 2, '0', '10', 'msg', function(res){
            assert.equal(res.Messages[0].content, global.announcementMsg);
            done();
        });
    });

    it("Should search public with valid token", function(done){
        SearchCtrl.search(global.user1.token, 3, '0', '10', 'msg', function(res){
            assert.equal(res.Messages[0].content, global.publicMsg);
            done();
        });
    });

    it("Should search private with valid token", function(done){
        SearchCtrl.search(global.user3.token, 4, '0', '10', 'msg', function(res){
            assert.equal(res.Messages[0].content, global.privateMsg);
            done();
        });
    });

    it("Should not search public with valid token", function(done){
        SearchCtrl.search(global.user3.token, 4, null, 10, 'msg', function(res){
            assert.equal(res.Error.code, globalVal.notfound);
            done();
        });
    });

    it("Should not search public with valid token", function(done){
        SearchCtrl.search(global.user3.token, 4, 1, null, 'msg', function(res){
            assert.equal(res.Error.code, globalVal.notfound);
            done();
        });
    });



});
