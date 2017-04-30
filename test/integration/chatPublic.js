var assert = require('assert');
var controller = require('../../backend/controllers/index');
var UserCtrl = controller.user;
var server = require('../../bin/www');
var request = require('supertest')(server);
var mongoose = require('mongoose');


describe('chat publicly', function() {
    beforeEach((done) => {
        mongoose.connection.dropDatabase(callback => {
            request
                .post("/api/users")
                .send({ username:"test1", password:"81dc9bdb52d04dc20036dbd8313ed055", photo:"23d1e10df85ef805b442a922b240ce25"})
                .end((err, res) => {
                    global.token = res.body.Users.token;
                    global.public = res.body.Users.directories[1].toString();
                    global.anouncement = res.body.Users.directories[0].toString();
                    done();
            });
        });
    });
    after((done) => {
        mongoose.connection.dropDatabase(error => {
            done();
            //mongoose.connection.close(done);
        });
    });
    it('should post message when POST /message with valid token', function (done) {
        var newMsg = "newMessage";
        request
            .post('/api/message')
            .send({ token:global.token, dirId:global.public, message: newMsg})
            .expect(200)
            .end((err, res) => {
                assert.equal(res.body.Messages.creator.name, "test1");
                assert.equal(res.body.Messages.content,newMsg);
                done();
            });
    });

    it('should not post message when POST /message with invalid token', function (done) {
        var newMsg = "newMessage";
        request
            .post('/api/message')
            .send({ token:"wrong", dirId:global.public, message: newMsg})
            .expect(200)
            .end((err, res) => {
                assert.equal(res.body.Error.code, 401);
                done();
            });
    });

    it('should not post message when POST /message with invalid directory', function (done) {
        var newMsg = "newMessage";
        request
            .post('/api/message')
            .send({ token:token, dirId:"WrongDirectory", message: newMsg})
            .expect(200)
            .end((err, res) => {
                assert.equal(res.body.Error.code, 404);
                done();
            });
    });

    it('should get message when GET /message with valid token', function (done) {
        request
            .post("/api/message")
            .send({token:  global.token, dirId: global.public, message: "newMessage"})
            .end((err,res) => {
                request
                    .get('/api/message?token='+token+"&dirId="+global.public)
                    .expect(200)
                    .end((err1, res1) => {
                        assert.equal(res1.body.Messages[0].creator.name, "test1");
                        assert.equal(res1.body.Messages[0].content, "newMessage");
                        done();
                    });
            });
    });

    describe('GET /message', function() {
        beforeEach((done) => {
            request
                .post("/api/message")
                .send({token:  global.token, dirId: global.public, message: "newMessage"})
                .end((err,res) => {done();});
        });
        it('should not get message when GET /message with invalid token', function (done) {

            request
                .get('/api/message?token=Wrong'+"&dirId="+global.public)
                .expect(200)
                .end((err1, res1) => {
                    assert.equal(res1.body.Error.code, 401);
                    done();
                });
        });

        it('should not get message when GET /message with invalid dirId', function (done) {
            request
                .get('/api/message?token='+token+"&dirId=Wrong")
                .expect(200)
                .end((err1, res1) => {
                    assert.equal(res1.body.Error.code, 404);
                    done();
                });
        });
    });


});