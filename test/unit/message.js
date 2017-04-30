/**
 * Created by wang on 2017/3/30.
 */
var assert = require('assert');
var server = require('../../bin/www');
var mongoose = server.mongoose;
var userModel = require('../../backend/models/user');
var dirModel = require('../../backend/models/directory');
var msgModel = require('../../backend/models/message');
var Message = mongoose.model('Message');
var User = mongoose.model('User');
var globalVar = require('../../backend/global');
var controller = require('../../backend/controllers/index');
var UserCtrl = controller.user;
var MsgCtrl = controller.message;
var DirectoryCtrl = controller.directory;

var sinon = require('sinon');
require('sinon-mongoose');

describe('Message Model:',function() {
    beforeEach((done) => {
        mongoose.connection.dropDatabase(callback => {
            UserCtrl.signup("test1", "81dc9bdb52d04dc20036dbd8313ed055", "23d1e10df85ef805b442a922b240ce25", function (res2) {
                global.user = res2.Users;
                global.public = res2.Users.directories[1].toString();
                global.anouncement = res2.Users.directories[0].toString();
                userModel.createUser({name:"test2", passwd: "81dc9bdb52d04dc20036dbd8313ed055", photo:"d12b3daa9cc5470ce8d56cfa2f6673c5"}, function (res1) {
                    global.user2 = res1;
                    global.announcementMsg = "announcement msg";
                    global.publicMsg = "public msg";
                    global.privateMsg = "private msg";
                    var location = "mountain view";
                    var status = 2;
                    UserCtrl.setStatus(global.user.token, location, status, function (res4) {
                        MsgCtrl.postMsg(global.user.token, global.public, global.publicMsg, function (res3) {
                            MsgCtrl.postMsg(global.user.token, global.anouncement, global.announcementMsg, function (res5) {
                                UserCtrl.signup("test3", "81dc9bdb52d04dc20036dbd8313ed055", "d12b3daa9cc5470ce8d56cfa2f6673c5", function (res7) {
                                    var directoryname1 = "testDirectory";
                                    global.user3 = res7.Users;
                                    var userList = [global.user.id,global.user2._id, global.user3.id];
                                    DirectoryCtrl.addDirectory(global.user3.token, directoryname1, userList, function (res6) {
                                        privateDir = res6.Directory;
                                        MsgCtrl.postMsg(global.user3.token, res6.Directory.id, privateMsg, function (res7) {
                                            global.privateMsgInfo = res7;
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

    it("Should create a message", function (done) {
        msgModel.createMessage({content:'content'},function(msg){
            Message.findOne({content:'content'}, function(err, msg1){
               assert.equal(msg._id.toString(),msg1._id.toString());
               done();
            });
        });
    });

    it("Should format a message", function (done) {
        var msglist = [{creator: global.user.id, content: "new"},{create: global.user2._id}];
        msgModel.formatMessage(msglist,function(msg){
            assert.equal(msg.Messages[0].creator,global.user.id.toString());
            done();
        });
    });


    it("Should search message in directory", function (done) {
        msgModel.searchMessage(global.public,'msg',0, 10,function(msg){
            assert.equal(msg[0].content,publicMsg);
            done();
        });
    });

    it("Should report error when mongoose failed to search message", function (done) {
        var msgMock = sinon.mock(Message);
        msgMock
            .expects('find')
            .chain('deepPopulate')
            .chain('sort')
            .chain('skip')
            .chain('limit')
            .chain('exec')
            .yields('ERROR', null);
        msgModel.searchMessage(global.public,'msg',0, 10,function(msg){
            msgMock.restore();
            assert.equal(msg.Error.code, globalVar.dbError);
            done();
        });
    });

    describe("searchPrivateMessage",function(){
        var retMsgs;
        beforeEach((done) => {
            var msglist = [{creator: global.user.id, content: "new"},{create: global.user2._id}];
            msgModel.getMessages(user.token,function(dir){
                msgModel.formatMessageIdList(dir, function(ret){
                    retMsgs = ret;
                    done();
                });
            });
        });

        it("Should search a private message", function (done) {
            msgModel.searchPrivateMessage(retMsgs, 'msg',0,10,function(msg) {
                assert.equal(msg[0].content, privateMsg);
                done();
            });
        });

        it("Should report error when mongoose failed to perform search", function (done) {
            var msgMock = sinon.mock(Message);
            msgMock
                .expects('find')
                .chain('deepPopulate')
                .chain('sort')
                .chain('skip')
                .chain('limit')
                .chain('exec')
                .yields('ERROR', null);
            msgModel.searchPrivateMessage(retMsgs, 'msg',0,10,function(msg) {
                msgMock.restore();
                assert.equal(msg.Error.code, globalVar.dbError);
                done();
            });
        });
    });




    it("Should format a post message", function (done) {
        msg = {content: "new"};
        var newMsg = new Message(msg);
        newMsg.save(function(error,msg){
            msgModel.formatPostMessage(global.user2,msg, global.public, function(msg1){
                assert.equal(msg1.Messages.content,"new");
                assert.equal(msg1.Messages.creator.name, user2.name);
                done();
            });
        });
    });


    it("Should get all messages", function (done) {
        msgModel.getMessages(user.token,function(msg){
            assert.equal(msg[0].dirInfo._id.toString(), global.anouncement );
            assert.equal(msg[1].dirInfo._id.toString(), global.public );
            done();
        });
    });

    it("Should not get messages with wrong token", function (done) {
        msgModel.getMessages("WrongToken",function(msg){
            assert.equal(msg, null);
            done();
        });
    });

    it("Should report error when mongoose returns error", function (done) {
        var userMock = sinon.mock(User);
        userMock
            .expects('findOne')
            .chain('deepPopulate')
            .chain('exec')
            .yields('ERROR', null);
        msgModel.getMessages(user.token, function(msg) {
            userMock.restore();
            assert.equal(msg.Error.code, globalVar.dbError);
            done();
        });
    });

    describe("formatMessageIdList",function(){
        var retMsgs;
        beforeEach((done) => {
            msgModel.getMessages(user.token,function(dir){
                msgModel.formatMessageIdList(dir, function(ret){
                    retMsgs = ret;
                    done();
                });
            });
        });

        it("Should format id in message list", function (done) {
            assert.equal(retMsgs.length, 1);
            Message.findOne({_id: retMsgs[0]._id}, function(err, msg){
                assert.equal(msg.content, global.privateMsg);
                done();
            });
        });
    });



});

