/**
 * Created by wang on 2017/3/30.
 */
var assert = require('assert');
var server = require('../../bin/www');
var mongoose = server.mongoose;
var userModel = require('../../backend/models/user');
var dirModel = require('../../backend/models/directory');
var msgModel = require('../../backend/models/message');
var User = mongoose.model('User');
var Directory = mongoose.model('Directory');
var globalVar = require('../../backend/global');

var sinon = require('sinon');
require('sinon-mongoose');

describe('Directory Model:',function() {
    beforeEach((done) => {
        mongoose.connection.dropDatabase(callback => {
            global.name = "test1";
            global.name2 = "test2";
            global.passwd = "81dc9bdb52d04dc20036dbd8313ed055";
            userModel.createUser({name: global.name, passwd: global.passwd}, function (res) {
                global.user = res;
                userModel.createUser({name: global.name2, passwd: global.passwd}, function (res1) {
                    done();
                });
            });
        });
    });

    it("Should be able to initalize directories", function (done) {
        dirModel.initializeDir(function (dir, announcement) {
            assert.equal(dir.name, "public");
            assert.equal(announcement.name, "announcement");
            Directory.findOne({name: "public"}, function (err, res1) {
                assert.equal(res1._id.toString(), dir._id.toString());
                Directory.findOne({name: "announcement"}, function(err, res2){
                    assert.equal(res2._id.toString(), announcement._id.toString());
                    done();
                });
            });
        });
    });

    describe('initializeDir',function(){
        beforeEach((done) => {
            dirModel.createDir({name: "public"}, function(ret){
                done();
            });
        });

        it("Should be able to initalize directories when public directory exists", function (done) {
            dirModel.initializeDir(function (dir, announcement) {
                assert.equal(dir.name, "public");
                assert.equal(announcement.name, "announcement");
                Directory.findOne({name: "public"}, function (err, res1) {
                    assert.equal(res1._id.toString(), dir._id.toString());
                    Directory.findOne({name: "announcement"}, function(err, res2){
                        assert.equal(res2._id.toString(), announcement._id.toString());
                        done();
                    });
                });
            });
        });
    });

    it("Should be able to post an announcement", function (done) {
        dirModel.createAnnouncement(function (announcement) {
            assert.equal(announcement.name, "announcement");
            Directory.findOne({name: "announcement"}, function(err, res2){
                assert.equal(res2._id.toString(), announcement._id.toString());
                done();
            });
        });
    });

    it("Should be able to create announcement directory", function (done) {
        dirModel.createDir({name: "announcement"}, function(dir){
            dirModel.createAnnouncement(function (announcement) {
                assert.equal(announcement.name, "announcement");
                assert.equal(announcement._id.toString(), dir._id.toString());
                done();
            });
        });
    });

    it("Should be able to create public directory", function (done) {
        dirModel.createDir({name: "public"}, function(dir){
            Directory.findOne({name: "public"}, function(err, res){
                assert.equal(dir.name, res.name);
                assert.equal(dir._id.toString(), res._id.toString());
                done();
            });
        });
    });


    describe('findDir',function(){
        beforeEach((done) => {
            dirModel.createDir({name: "public"}, function(ret){
                done();
            });
        });

        it("Should be able to find directory by name", function (done) {
            dirModel.findDir({name: "public"}, function(res){
                Directory.findOne({name: "public"},function(err, dir){
                    assert.equal(dir.name, res.name);
                    assert.equal(dir._id.toString(), res._id.toString());
                    done();
                });
            });
        });
    });

    describe('getMsg',function(){
        dirname = "a";
        msgid = "";
        beforeEach((done) => {
            dirModel.createDir({name: dirname}, function(dir){
                msgModel.createMessage({directory: dir._id},function(msg) {
                    msgid = msg._id.toString();
                    dirModel.addMessage(msg, function (dir1) {
                        done();
                    });
                });
            });
        });

        it("Should be able to get messages in directory", function (done) {
            dirModel.getMsg({name: dirname}, function (dirInfo) {
                assert.equal(dirInfo.msgs[0]._id.toString(), msgid);
                done();
            });
        });
    });

    it("Should be able to get the list of directories", function (done) {
        dirlist = [{dirInfo:{name: "public"},bread:true},{dirInfo:{name: "announcement"},bread:true},
            {dirInfo:{name: "b"},bread:false},{dirInfo:{name: "c"},bread:true}, {dirInfo:{name: "a"},bread:true}];
        dirModel.getDirectories(dirlist, function(dir){
            assert.equal(dir[0].name, "public");
            assert.equal(dir[1].name, "announcement");
            assert.equal(dir[2].name, "b");
            assert.equal(dir[3].name, "a");
            assert.equal(dir[4].name, "c");
            done();
        });
    });

    it("Should be able to sort directory list", function (done) {
        dirlist = [{name: "b",hasBeenRead:true},{name: "c",hasBeenRead:false}, {name: "a",hasBeenRead:true}];
        dirModel.sortDirectories(dirlist, function(dir){
            assert.equal(dir[0].name, "c");
            assert.equal(dir[1].name, "a");
            assert.equal(dir[2].name, "b");
            done();
        });
    });

    describe('getUser',function(){
        dirid = "";
        beforeEach((done) => {
            dirModel.createDir({name: "a"},function(dir) {
                dirModel.addUser({_id: dir._id}, global.user, function (dir1) {
                    dirid = dir._id;
                    done();
                });
            });
        });

        it("Should be able to get users in a directory", function (done) {
            dirModel.getUser(dirid,function(code, user){
                assert.equal(global.user.name,user[0].name);
                done();
            });
        });

        it("Error while get user", (done) => {
            var dirMock = sinon.mock(Directory);
            dirMock
                .expects('findOne')
                .chain('deepPopulate')
                .chain('exec')
                .yields('ERR', null);
            dirModel.getUser(dirid,function(code, user){
                dirMock.restore();
                assert.equal(code.Error.code, globalVar.dbError);
                done();
            });
        });
    });

    describe('addMessage',function(){
        var message;
        beforeEach((done) => {
            dirModel.createDir({name: "a"}, function(dir) {
                msgModel.createMessage({directory: dir._id}, function (msg) {
                    message = msg;
                    done();
                });
            });
        });
        it("Should be able to create a message in directory", function (done) {
            dirModel.addMessage(message, function(dir) {
                Directory.findOne({name: dir.name}, function (error, directory) {
                    assert.equal(directory.msgs[0].toString(), message._id.toString());
                    done();
                });
            });
        });
        it("Mongoose error while adding message", function (done) {
            var dirStub = sinon.stub(Directory, 'findOneAndUpdate').callsFake((arg0, arg1, callback) => {
                callback('ERROR', null);
            });
            dirModel.addMessage(message, function(dir) {
                dirStub.restore();
                assert.equal(dir.Error.code, globalVar.dbError);
                done();
            });
        });
    });

    describe('addUser',function(){
        beforeEach((done) => {
            dirModel.createDir({name: "a"}, function(dir) {
                done();
            });
        });

        it("Should be able to add a user to directory", function (done) {
            dirModel.addUser({name: "a"},global.user, function(dirInfo){
                Directory.findOne({name: "a"}, function(err, d){
                    d.users[0]._id = global.user._id;
                    done();
                });
            });
        });

        it("Mongoose error while adding user", function (done) {
            var dirStub = sinon.stub(Directory, 'findOneAndUpdate').callsFake((arg0, arg1, callback) => {
                callback('ERROR', null);
            });
            dirModel.addUser({name: "a"},global.user, function(dirInfo){
                dirStub.restore();
                assert.equal(dirInfo.Error.code, globalVar.dbError);
                done();
            });
        });
    });
});