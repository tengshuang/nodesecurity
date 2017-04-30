var assert = require('assert');
var server = require('../../bin/www');
var request = require('supertest')(server);
var mongoose = require('mongoose');
var Directory = mongoose.model('Directory');


describe('chat privatesly', function() {
    beforeEach((done) => {
        mongoose.connection.dropDatabase(callback => {
            request
                .post("/api/users")
                .send({ username:"test1", password:"81dc9bdb52d04dc20036dbd8313ed055", photo:"23d1e10df85ef805b442a922b240ce25"})
                .end((err, res) => {
                    global.token = res.body.Users.token;
                    global.userId1 = res.body.Users.id;
                    global.public = res.body.Users.directories[1].toString();
                    global.anouncement = res.body.Users.directories[0].toString();
                    request
                        .post("/api/users")
                        .send({ username:"test2", password:"81dc9bdb52d04dc20036dbd8313ed055", photo:"23d1e10df85ef805b442a922b240ce25"})
                        .end((err, res) => {
                            global.token2 = res.body.Users.token;
                            global.userId2 = res.body.Users.id;
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
    it('should create a directory when POST /privateDirectory with valid token', function (done) {
        request
            .post('/api/privateDirectory')
            .send({ token:global.token, directoryname: "newDir", userList:[global.userId1,  global.userId2]})
            .expect(200)
            .end((err, res) => {
                Directory.findOne({name:"newDir"},function(err, dir){
                    assert.equal(dir._id, res.body.Directory.id);
                    done();
                });
            });
    });

    it('should create a directory when POST /privateDirectory with valid token', function (done) {
        request
            .post('/api/privateDirectory')
            .send({ token: "Wrongtoken", directoryname: "newDir", userList:[global.userId1,  global.userId2]})
            .expect(200)
            .end((err, res) => {
                assert.equal(res.body.Error.code, 401);
                done();
            });
    });

    it('should set a directory status when POST /directoryStatus with valid token', function (done) {
        request
            .post('/api/directoryStatus')
            .send({ token: global.token, dirId: global.public})
            .expect(200)
            .end((err, res) => {
                assert.equal(res.body.Directory[1].name, "public");
                assert.equal(res.body.Directory[1].hasBeenRead, true);
                done();
            });
    });

    it('should not set a directory status when POST /directoryStatus with valid token', function (done) {
        request
            .post('/api/directoryStatus')
            .send({ token: "WrongToken", dirId: global.public})
            .expect(200)
            .end((err, res) => {
                assert.equal(res.body.Error.code, 401);
                done();
            });
    });

    it('should not set a directory status when POST /directoryStatus with invalid directory id', function (done) {
        request
            .post('/api/directoryStatus')
            .send({ token: global.token, dirId: "Wrongid"})
            .expect(200)
            .end((err, res) => {
                assert.equal(res.body.Error.code, 404);
                done();
            });
    });

});