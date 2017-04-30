var assert = require('assert');
var controller = require('../../backend/controllers/index');
var UserCtrl = controller.user;
var MsgCtrl = controller.message;
var DirectoryCtrl = controller.directory;
var server = require('../../bin/www');
var mongoose = require('mongoose');

var User = mongoose.model('User'),
    Directory = mongoose.model('Directory');


describe('Users:',function(){
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

    it("Should not login with wrong password", function(done){
        UserCtrl.login("test1", "password1", function(res){
            //console.log(res);
            assert.equal(res.Error.code,401);
            done();
        });
    });

    it("Should not login with non-existed user", function(done){
        UserCtrl.login("test2", "password2", function(res){
            //console.log(res);
            assert.equal(res.Error.code,404);
            done();
        });
    });

    it("Should login with correct username and password, return User Object", function(done){
        UserCtrl.login("test1", "81dc9bdb52d04dc20036dbd8313ed055", function(res){
            //console.log(res);
            assert.equal(res.Users.name,"test1");
            assert.equal(res.Users.login,1);
            User.findOne({name:res.Users.name},'name passwd photo login', function(err,user){
                if(err) return handleError(err);
                assert.equal(user.name,"test1");
                assert.equal(user.login,1);
                done();
            });
        });
    });

    it("Should create new user in the db and return the new User", function(done){
        //test create new user with username, password, photo.
        UserCtrl.signup("newUser", "81dc9bdb52d04dc20036dbd8313ed055", "23d1e10df85ef805b442a922b240ce25", function(res){

            assert.equal(res.Users.name,"newUser");
            assert.equal(res.Users.login,1);
            assert.equal(res.Users.status,0);
            User.findOne({name:res.Users.name},'name passwd photo login status', function(err,user){
                if(err) return handleError(err);

                assert.equal(user.name,"newUser");
                assert.equal(user.passwd,"81dc9bdb52d04dc20036dbd8313ed055");
                assert.equal(user.photo,"23d1e10df85ef805b442a922b240ce25");
                assert.equal(user.login,1);
                assert.equal(user.status,0);
                done();
            });
        });
    });

    it("Should logout with valid token", function(done){
        UserCtrl.logout(global.token, function(result){
            //console.log(result);
            assert.equal(result.Result.code,200);
            User.findOne({name:"test1"},'name login', function(err,user){
                if(err) return handleError(err);
                ;
                assert.equal(user.name,"test1");
                assert.equal(user.login,0);
                done();
            });
        });
    });

    it("Should not logout with invalid token", function(done){
        UserCtrl.logout("wrongToken", function(res){

            assert.equal(res.Error.code,401);
            done();
        });
    });

    it("Should not get userList of dirId with invalid user token", function(done){
        Directory.findOne({name:"public"},'_id',function(err,dirId){

            UserCtrl.getUsersByDirId("wrongToken", dirId._id.toString(),function(res){

                assert.equal(res.Error.code,401);
                done();
            });
        });
    });

    it("Should not get userList of dirId with invalid dirId", function(done){
        UserCtrl.getUsersByDirId(global.token, '1',function(res){

            assert.equal(res.Error.code,404);
            done();
        });
    });

    it("Should get userList of dirId with valid user token", function(done){
        UserCtrl.getUsersByDirId(global.token, global.public,function(res){

            assert.equal(res.Users.length,3);
            assert.equal(res.Users[0].name, 'test1');
            assert.equal(res.Users[0].login,1);
            assert.equal(res.Users[0].status,0);
            assert.equal(res.Users[1].name, 'test4');
            assert.equal(res.Users[1].login,1);
            assert.equal(res.Users[1].status,0);
            assert.equal(res.Users[2].name, 'test3');
            assert.equal(res.Users[2].login,0);
            assert.equal(res.Users[2].status,2);
            done();
        });
    });

    it("Should not allow user to set status or location with invalid Token", function(done){
        var location;
        var status;
        UserCtrl.setStatus("wrongToken", location, status, function(res){
            assert.equal(res.Error.code,401);
            done();
        });
    });

    it("Should allow user to set status with valid Token", function(done){
        var location;
        var status = 1;
        UserCtrl.setStatus(global.token, location, status, function(res){
            assert.equal(res.Users.name,"test1");
            User.findOne({name:res.Users.name},"name status",function(err,res1){

                assert.equal(res1.name,"test1");
                assert.equal(res1.status,1);
                done();
            });
        });
    });

    it("Should allow user to set location with valid Token", function(done){
        var location = "test location";
        var status;
        UserCtrl.setStatus(global.token, location, status, function(res){
            assert.equal(res.Users.name,"test1");
            User.findOne({name:res.Users.name},"name location",function(err,res1){
                
                assert.equal(res1.name,"test1");
                assert.equal(res1.location,"test location");
                done();
            });
        });
    });

});
