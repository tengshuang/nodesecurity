var assert = require('assert');
var controller = require('../../backend/controllers');

var UserCtrl = controller.user;
var DirectoryCtrl = controller.directory;
var MsgCtrl = controller.message;

var server = require('../../bin/www');
var mongoose = server.mongoose;

var User = mongoose.model('User'),
    Directory = mongoose.model('Directory');

describe('Directory:',function(){
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
                    var message = "hello";
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
                                                    //console.log(res6);
                                                    global.directoryId = res7.Directory.id.toString();
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

    after((done) => {
        mongoose.connection.dropDatabase(callback => {
            done();
            //mongoose.connection.close(done);
        });
    });

    it("Should not get directories for current user with invalid token", function(done){
        DirectoryCtrl.getDirectory("wrongToken", function(res){
            //console.log(result);
            assert.equal(res.Error.code,401);
            done();
        });
    });

    it("Should get directories for current user with valid token", function(done){

        var userList1 = [global.userId1,global.userId2];
        var directoryname1 = "testDirectory3";

        DirectoryCtrl.addDirectory(global.token, directoryname1, userList1, function (res1) {
            //console.log(res6);
            var dir1 = res1.Directory.id.toString();
            var message = "nihao";
            MsgCtrl.postMsg(global.token, dir1, message,function(res2){
                var userList2 = [global.userId1,global.userId3];
                var directoryname2 = "testDirectory4";
                DirectoryCtrl.addDirectory(global.token, directoryname2, userList2, function (res3) {
                    var dir2 = res3.Directory.id.toString();
                    var directoryname3 = "testDirectory5";
                    DirectoryCtrl.addDirectory(global.token, directoryname3, userList2, function (res5) {
                        var dir3 = res5.Directory.id.toString();
                        MsgCtrl.postMsg(global.token, dir3, message,function(res2){
                            DirectoryCtrl.getDirectory(global.token, function(res4){
                                assert("public" == res4.Directory[1].name);
                                assert("announcement" == res4.Directory[0].name);
                                assert.equal("testDirectory2",res4.Directory[5].name);
                                assert.equal(global.directoryId, res4.Directory[5].id.toString());
                                assert.equal("testDirectory3",res4.Directory[3].name);
                                assert.equal(dir1, res4.Directory[3].id.toString());
                                assert.equal("testDirectory4",res4.Directory[6].name);
                                assert.equal(dir2, res4.Directory[6].id.toString());
                                assert.equal("testDirectory5",res4.Directory[4].name);
                                assert.equal(dir3, res4.Directory[4].id.toString());
                                done();
                            });
                        });

                    });
                });
            });
        });
    });

    it("Should create directories for userList with valid token", function(done){

        var directoryname = "testDirectory";
        var userList = [];
        User.findOne({name:"test1"},'_id',function(error,res1){
            User.findOne({name:"test3"},'_id',function(error,res2){
                userList.push(res1._id);
                userList.push(res2._id);
                DirectoryCtrl.addDirectory(global.token,directoryname,userList,function(res){
                    //console.log(res.Directory.id);
                    var id = res.Directory.id;
                    Directory
                        .findOne({_id:id}, 'name users', function(err, dir) {
                            //assert.equal(res.Error.code,401);
                            //console.log(dir);

                            assert.equal(dir.name, directoryname);
                            assert(dir.users.indexOf(res1._id) >= 0);
                            assert(dir.users.indexOf(res2._id) >= 0);
                            done();
                        });
                });
            });

        });
    });

    it("Should not create directories for userList with invalid token", function(done){

        var directoryname = "testDirectory";
        var userList = [];
        User.findOne({name:"test1"},'_id',function(error,res1){
            User.findOne({name:"test3"},'_id',function(error,res2){
                userList.push(res1._id);
                userList.push(res2._id);
                //console.log(res1._id);
                //console.log(res2._id);
                DirectoryCtrl.addDirectory("wrongToken",directoryname,userList,function(res){
                    //console.log(res.Directory.id);
                    assert.equal(res.Error.code,401);
                    done();

                });
            });

        });
    });


    it("Should not create directories for userList with invalid userId", function(done){

        var directoryname = "testDirectory";
        var userList = [];
        userList.push("wrongUserId1");
        userList.push("wrongUserId2");
        DirectoryCtrl.addDirectory(global.token,directoryname,userList,function(res){
            //console.log(res.Directory.id);
            assert.equal(res.Error.code,404);
            done();

        });
    });


    it("Should not update the read status of directory with invalid token", function(done){
        UserCtrl.setDirectoryStatus("wrongToken", global.public, function(res){
            assert.equal(res.Error.code,401);
            done();
        });
    });

    it("Should not update the read status of directory with invalidDirId", function(done){
        UserCtrl.setDirectoryStatus(global.token,"wrongdirId", function(res){
            assert.equal(res.Error.code,404);
            done();
        });
    });

    it("Should update the read status of directory with valid token and dirId", function(done){
        UserCtrl.setDirectoryStatus(global.token,global.anouncement, function(res){
            for(var i = 0; i < res.Directory.length; ++i){

                if(res.Directory[i].id.toString() == global.anouncement){
                    assert.equal(res.Directory[i].hasBeenRead,true);
                }

                if(res.Directory[i].id.toString() == global.public){
                    assert.equal(res.Directory[i].hasBeenRead,true);
                }

            }
            done();
        });
    });
});