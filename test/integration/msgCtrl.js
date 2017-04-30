var assert = require('assert');
var controller = require('../../backend/controllers/index');
var UserCtrl = controller.user;
var MsgCtrl = controller.message;
var DirectoryCtrl = controller.directory;

var server = require('../../bin/www');
var mongoose = require('mongoose');

var User = mongoose.model('User'),
    Directory = mongoose.model('Directory');

describe('Message:', function(){
    beforeEach((done) => {
        mongoose.connection.dropDatabase(callback => {
            //console.log("init mongo");
            UserCtrl.signup("test1", "81dc9bdb52d04dc20036dbd8313ed055", "23d1e10df85ef805b442a922b240ce25", function(res2){
                global.token = res2.Users.token;
                //console.log(res2);
                global.userId1 = res2.Users.id.toString();
                //console.log(global.token);
                UserCtrl.signup("test3", "81dc9bdb52d04dc20036dbd8313ed055", "d12b3daa9cc5470ce8d56cfa2f6673c5", function(res1){
                    global.token1 = res1.Users.token;
                    global.public = res1.Users.directories[1].toString();
                    global.anouncement = res1.Users.directories[0].toString();
                    global.userId2 = res1.Users.id.toString();
                    global.message = "hello";
                    var location = "mountain view";
                    var status = 2;
                    UserCtrl.setStatus(global.token1,location, status, function(res4){
                        MsgCtrl.postMsg(global.token1, global.public, message,function(res3){
                            MsgCtrl.postMsg(global.token, global.anouncement, message,function(res5){
                                UserCtrl.signup("test4", "81dc9bdb52d04dc20036dbd8313ed055", "d12b3daa9cc5470ce8d56cfa2f6673c5", function(res7){
                                    var directoryname1="testDirectory";
                                    global.userId3 = res7.Users.id.toString();
                                    global.token3 = res7.Users.token;
                                    var userList = [global.userId2,global.userId3];
                                    UserCtrl.logout(global.token1, function(result) {
                                        DirectoryCtrl.addDirectory(global.token3, directoryname1, userList, function (res6) {
                                            //console.log(res6);
                                            var directoryname2="testDirectory2";
                                            UserCtrl.setDirectoryStatus(global.token,global.public, function(res8) {
                                                var userList1 = [global.userId1,global.userId2];
                                                DirectoryCtrl.addDirectory(global.token, directoryname2, userList1, function (res7) {
                                                    global.directoryId = res7.Directory.id.toString();
                                                    MsgCtrl.postMsg(global.token, global.directoryId, message,function(res9){
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
            });
        });

    });

    after((done) => {
        mongoose.connection.dropDatabase(callback => {
            done();
            //mongoose.connection.close(done);
        });
    });

    it("Should not get messages for directory with invalid token", function(done){
        var dirId;
        MsgCtrl.getMsg("wrongToken", dirId, function(res){
            //console.log(result);
            assert.equal(res.Error.code,401);
            done();
        });
    });

    it("Should not get messages for directory with invalid dirId", function(done){
        var dirId = "wrongDirId";
        MsgCtrl.getMsg(global.token, dirId, function(res){
            //console.log(result);
            assert.equal(res.Error.code,404);
            done();
        });
    });

    it("Should get messages for directory with valid token and valid dirId", function(done){
        var dirId = global.public;
        MsgCtrl.getMsg(global.token, dirId, function(res){
            //console.log(res.Messages[0].creator.name);
            assert.equal(res.Messages.length,1);
            assert.equal(res.Messages[0].creator.name,"test3");
            assert.equal(res.Messages[0].content,"hello");
            assert.equal(res.Messages[0].location,"mountain view");
            assert.equal(res.Messages[0].status,2);
            done();
        });
    });

    it("Should not post messages to directory with invalid token", function(done){
        var dirId = global.public;
        var token = "wrongToken";
        var message = "Hello";

        MsgCtrl.postMsg(token, dirId, message,function(res){
            //console.log(res);
            assert.equal(res.Error.code,401);
            done();
        });
    });

    it("Should not post messages to directory with invalid dirId", function(done){
        var dirId = "wrongDirId";
        var token = global.token;
        var message = "hello";

        MsgCtrl.postMsg(token, dirId, message,function(res){
            //console.log(res);
            assert.equal(res.Error.code,404);
            done();
        });
    });

    it("Should post messages to directory with valid token and dirId but empty message", function(done){
        var dirId = global.public;
        var token = global.token;
        var message = "";

        MsgCtrl.postMsg(token, dirId, message,function(res){
            //console.log(res);
            assert.equal(res.Messages.content,"");
            assert.equal(res.Messages.creator.name,"test1");
            User.findOne({name:"test1"},'location status', function(err,res1){
                assert.equal(res1.location, res.Messages.location);
                assert.equal(res1.status, res.Messages.status);
                done();
            });
        });
    });

    it("Should not searchForPrivateMessages with invalid token", function(done){
        var token = global.token;
        var message = global.message;

        MsgCtrl.searchForPrivateMessages("wrong", message, 0, 10 ,function(res){
            assert.equal(res.Error.code,401);
            done();
        });
    });

    it("Should searchForPrivateMessages", function(done){
        var token = global.token;
        var message = global.message;

        MsgCtrl.searchForPrivateMessages(token, message, 0, 10 ,function(res){
            assert.equal(res.Messages[0].content, message);
            done();
        });
    });

    it("Should searchForMessages", function(done){
        var message = global.message;

        MsgCtrl.searchForMessages(3, message, 0, 10 ,function(res){
            assert.equal(res.Messages[0].content, message);
            done();
        });
    });

    it("Should searchForMessages", function(done){
        var message = global.message;

        MsgCtrl.searchForMessages(2, message, 0, 10 ,function(res){
            assert.equal(res.Messages[0].content, message);
            done();
        });
    });

});