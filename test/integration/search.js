/**
 * Created by wang on 2017/4/2.
 */
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
                .send({
                    username: "test1",
                    password: "81dc9bdb52d04dc20036dbd8313ed055",
                    photo: "23d1e10df85ef805b442a922b240ce25"
                })
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

    it('should search message when POST /search with valid token', function (done) {
        request
            .get('/api/search?token='+global.token+'&type=0&content=te')
            .expect(200)
            .end((err, res) => {
                console.log(res.body);
                assert.equal(res.body.Users[0].name, "test1");
                done();
            });
    });

    it('should not search message when POST /search with invalid token', function (done) {
        request
            .get('/api/search?token=wrong&type=0&content=te')
            .expect(200)
            .end((err, res) => {
                assert.equal(res.body.Error.code, 401);
                done();
            });
    });
    
});