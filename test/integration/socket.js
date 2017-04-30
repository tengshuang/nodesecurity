var assert = require('assert');
var controller = require('../../backend/controllers/index');
var UserCtrl = controller.user;
var MsgCtrl = controller.message;
var DirectoryCtrl = controller.directory;
var socketCtrl =  require('../../backend/io');

var server = require('../../bin/www');
var mongoose = require('mongoose');
var io = require('socket.io-client');

var User = mongoose.model('User'),
    Directory = mongoose.model('Directory');

describe('socket:', function(){
    beforeEach((done) => {
        socket = io.connect('http://localhost:3000', {
            'reconnection delay' : 0,
            'reopen delay' : 0,
            'force new connection' : true,
            transports: ['websocket']
        });
        mongoose.connection.dropDatabase(callback => {
            UserCtrl.signup("test1", "81dc9bdb52d04dc20036dbd8313ed055", "23d1e10df85ef805b442a922b240ce25", function(res2){
                global.user =res2.Users;
                global.token = res2.Users.token;
                global.userId1 = res2.Users.id.toString();
                UserCtrl.signup("test3", "81dc9bdb52d04dc20036dbd8313ed055", "d12b3daa9cc5470ce8d56cfa2f6673c5", function(res1){
                    global.user2 = res1.Users;
                    UserCtrl.signup("test3", "81dc9bdb52d04dc20036dbd8313ed055", "d12b3daa9cc5470ce8d56cfa2f6673c5", function(res1){
                        global.user3 = res1.Users;
                        done();
                    });
                });
            });
        });

    });

    afterEach((done) => {
        mongoose.connection.dropDatabase(callback => {
            if(socket.connected) {
                socket.disconnect();
            }
            done();
        });
    });

    it("Should get UserInfo with valid username", function(done){
        UserCtrl.getUserInfo({name:"test1"}, function(res){
            assert.equal(res.name,"test1");
            assert.equal(res.login,1);
            done();
        });
    });

    it("Should logOut with valid username", function(done){
        UserCtrl.logoutByName("test1", function(res){
            assert.equal(res.Result.code,200);
            User.findOne({name:"test1"},"name login",function(err,res1){
                assert.equal(res1.name, "test1");
                assert.equal(res1.login,0);
                done();
            });
        });
    });

    it("Should not logOut with invalid username", function(done){
        UserCtrl.logoutByName("test11", function(res){
            assert.equal(res.Error.code,401);
            done();
        });
    });

    it ("should receive login message and broadcast", function(done) {

        socket.on('logInF', function(data) {
            assert.equal(data,global.user.name);
            if(socket.connected) {
                socket.disconnect();
            }
            done();
        });
        socket.emit('logInB',global.user.name);
    });

    it ("should sendMessage", function(done) {
        var msg = "new message";
        socket.emit('logInB',global.user.name);
        socket.on('logInF', function(data) {
            User.findOne({name: global.user.name}, function(err, res){
                socketCtrl.sendMessage(res._id, msg);
            });
        });
        socket.on('message', function(data) {
            assert.equal(data,msg);
            done();
        });
    });


    it ("should logout", function(done) {

        socket.emit('logInB',global.user2.name);
        socket.on('logInF', function(data) {
            User.findOne({name: global.user2.name}, function(err, res){
                socketCtrl.logout(res._id);
            });
        });
        socket.on('logOutF', function(data) {
            done();
        });
    });

    it ("should newUserStatus", function(done) {
        socket.emit('logInB',global.user3.name);
        socket.on('logInF', function(data) {
            User.findOne({name: global.user3.name}, function(err, res){
                socketCtrl.newUserStatus(res._id);
            });
        });
        socket.on('newUserStatus', function(data) {
            done();
        });
    });

});