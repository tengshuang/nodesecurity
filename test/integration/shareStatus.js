var assert = require('assert');
var controller = require('../../backend/controllers/index');
var UserCtrl = controller.user;
var server = require('../../bin/www');
var request = require('supertest')(server);
var mongoose = require('mongoose');

describe('share status', function() {
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
    it('should set status when POST /status with valid token', function (done) {
        request
            .post('/api/status')
            .send({token:global.token, location:"Mountain View", status: 2})
            .expect(200)
            .end((err, res) => {
                assert.equal(res.body.Users.name, "test1");
                done();
            });
    });

    it('should not set status when POST /status with inalid token', function (done) {
        request
            .post('/api/status')
            .send({ token:"WrongToken", location:"Mountain View", status: 2})
            .expect(200)
            .end((err, res) => {
                assert.equal(res.body.Error.code, "401");
                done();
            });
    });


});