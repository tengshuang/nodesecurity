var assert = require('assert');
var sinon = require('sinon');
var controller = require('../../backend/controllers/index');
var UserCtrl = controller.user;
var server = require('../../bin/www');
var request = require('supertest')(server);
var mongoose = require('mongoose');

describe('Join Community', function() {


    beforeEach((done) => {
        mongoose.connection.dropDatabase(callback => {
            UserCtrl.signup("test1", "81dc9bdb52d04dc20036dbd8313ed055", "23d1e10df85ef805b442a922b240ce25", function(res1){
                global.token1 = res1.Users.token;
                UserCtrl.signup("test2", "81dc9bdb52d04dc20036dbd8313ed055", "d12b3daa9cc5470ce8d56cfa2f6673c5", function(res2){
                    global.token2 = res2.Users.token;
                    global.public = res2.Users.directories[1].toString();
                    global.anouncement = res2.Users.directories[0].toString();
                    global.userId2 = res2.Users.id.toString();
                    done();
                });
            });
        });
    });
    after((done) => {
        mongoose.connection.dropDatabase(error => {
            done();
            //mongoose.connection.close(done);
        });
    });
    it('should get directory info when GET /directory with token', function (done) {
        request
            .get('/api/directory?token='+token1)
            .expect(200)
            .end((err, res) => {
                assert.equal(res.body.Directory[0].name, "announcement");
                assert.equal(res.body.Directory[1].name, "public");
                done();
            });
    });

    it('should not get directory info when GET /directory with invalid token', function (done) {
        request
            .get('/api/directory?token=wrong')
            .expect(200)
            .end((err, res) => {
                assert.equal(res.body.Error.code, 401);
                done();
            });
    });

    it('should get user info when GET /users with valid token', function (done) {
        request
            .get('/api/users?token='+token1+"&dirId="+global.public)
            .expect(200)
            .end((err, res) => {
                assert.equal(res.body.Users[0].name, "test1");
                assert.equal(res.body.Users[1].name, "test2");
                done();
            });
    });

    it('should not get user info when GET /users with invalid token', function (done) {
        request
            .get('/api/users?token=wrong'+"&dirId="+global.public)
            .expect(200)
            .end((err, res) => {
                assert.equal(res.body.Error.code, 401);
                done();
            });
    });

    it('should not get user info when GET /users with invalid dirId', function (done) {
        request
            .get('/api/users?token='+token1+"&dirId=wrong")
            .expect(200)
            .end((err, res) => {
                assert.equal(res.body.Error.code, 404);
                done();
            });
    });

    it('should create user when POST /users', function (done) {
        request
            .post("/api/users")
            .send({ username:"newUser", password:"81dc9bdb52d04dc20036dbd8313ed055", photo:"23d1e10df85ef805b442a922b240ce25"})
            .expect(200)
            .end((err, res) => {
                assert.equal(res.body.Users.name, "newUser");
                done();
            });
    });

    it('should login When POST /logIn', function(done){
        request
            .post("/api/logIn")
            .send({ username:"test1", password:"81dc9bdb52d04dc20036dbd8313ed055"})
            .expect(200)
            .end((err, res) => {
                assert.equal(res.body.Users.name, "test1");
                done();
            });
    });

    it('should not login When POST /logIn with wrong password', function(done){
        request
            .post("/api/logIn")
            .send({ username:"test1", password:"wrong"})
            .expect(200)
            .end((err, res) => {
                assert.equal(res.body.Error.code, "401");
                done();
            });
    });


    it('should not login When POST /logIn when username not exist', function(done){
        request
            .post("/api/logIn")
            .send({ username:"test3", password:"81dc9bdb52d04dc20036dbd8313ed055"})
            .expect(200)
            .end((err, res) => {
                assert.equal(res.body.Error.code, "404");
                done();
            });
    });

    it('should logout When POST /logOut when token is valid', function(done){
        request
            .post("/api/logOut")
            .send({ token: global.token1})
            .expect(200)
            .end((err, res) => {
                assert.equal(res.body.Result.code, "200");
                done();
            });
    });

    it('should logout When POST /logOut when token is valid', function(done){
        request
            .post("/api/logOut")
            .send({ token: "Wrong"})
            .expect(200)
            .end((err, res) => {
                assert.equal(res.body.Error.code, "401");
                done();
            });
    });


});