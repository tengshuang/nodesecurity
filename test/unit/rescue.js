var assert = require('assert');
var server = require('../../bin/www');
var mongoose = server.mongoose;
var userModel = require('../../backend/models/user');
var dirModel = require('../../backend/models/directory');
var rescueModel = require('../../backend/models/rescue');
var User = mongoose.model('User');
var Rescue = mongoose.model('Rescue');
var globalVar = require('../../backend/global');
var sinon = require('sinon');
require('sinon-mongoose');

describe('Rescue Model:', function() {
  beforeEach((done) => {
    mongoose.connection.dropDatabase(callback => {
      global.name = "test1";
      global.passwd = "81dc9bdb52d04dc20036dbd8313ed055";
      userModel.createUser({
        name: global.name,
        passwd: global.passwd
      }, function(res) {
        global.token = res.token;
        global.user = res;

        var rescueSchema = Rescue.schema;

        rescueSchema.index({
          location: '2dsphere'
        });

        var rescueT = new Rescue({
          creator: global.user,
          location: {
            type: "Point",
            coordinates: [-121.9816318, 37.352996]
          }
        });

        rescueT.save(function(error, res) {
          done();
        });

      });
    });
  });


  it("should search two sotrted rescue teams", function(done) {
    var rescueT = new Rescue({
      creator: global.user,
      location: {
        type: "Point",
        coordinates: [-121.98163, 37.3529]
      }
    });

    rescueT.save(function(error, res) {
      rescueModel.getRescueTeam(-122.093028, 37.3812126, 430000, function(rescue) {

        assert.equal(rescue.length, 2);
        done();
      });
    });

  });

  it("should report error for finding resuce team in range", function(done) {

    var resMock = sinon.mock(Rescue);
    resMock
        .expects('find')
        .chain('populate')
        .chain('exec')
        .yields('ERROR', null);

    rescueModel.getRescueTeam(-122.093028, 37.3812126, 430000, function(rescue) {
      resMock.restore();
      assert.equal(rescue.Error.code, globalVar.dbError);
      done();
    });
  });

  it("should search none of  the rescue teams", function(done) {

      rescueModel.getRescueTeam(-122.093028, 37.3812126, 1, function(rescue) {
        assert.equal(rescue.length, 0);
        done();
      });

  });


  it("should report error for find all", function(done) {

    var resMock = sinon.mock(Rescue);
    resMock
        .expects('find')
        .chain('populate')
        .chain('exec')
        .yields('ERROR', null);

    rescueModel.getRescueTeam(-122.093028, 37.3812126, 6000000, function(rescue) {
      resMock.restore();
      assert.equal(rescue.Error.code, globalVar.dbError);
      done();
    });
  });

  it("should search all rescue teams", function(done) {
    rescueModel.getRescueTeam(-122.093028, 37.3812126, 6000000, function(rescue) {
      assert.equal(rescue.length, 1);
      done();
    });
  });



  it("should have the same rescue's length to 1", function(done) {
    var rescueList = [];
    var rescue = {
      "creator": {
        "name": 'jinliang11',
        "passwd": '81dc9bdb52d04dc20036dbd8313ed055',
        "photo": '37856d34aa623f71678b159c03afc561'
      },
      "location": {
        "coordinates": [-122.093028, 37.3812126],
        "type": 'Point'
      }
    };
    rescueList.push(rescue);
    rescueModel.formateRescue(rescueList, -122.0941618, 37.3897202, function(res) {

      assert.equal(res.Rescue.length, rescueList.length);
      done();
    });
  });


  it("should have the same first user's name", function(done) {
    var rescueList = [];
    var rescue = {
      "creator": {
        "name": 'jinliang11',
        "passwd": '81dc9bdb52d04dc20036dbd8313ed055',
        "photo": '37856d34aa623f71678b159c03afc561'
      },
      "location": {
        "coordinates": [-122.093028, 37.3812126],
        "type": 'Point'
      }
    };
    rescueList.push(rescue);
    rescueModel.formateRescue(rescueList, -122.0941618, 37.3897202, function(res) {
      assert.equal(res.Rescue[0].name, rescueList[0].creator.name);
      done();
    });
  });


  it("shoule have the same length 0", function(done) {
    var rescueList = [];
    rescueModel.formateRescue(rescueList, -122.0941618, 37.3897202, function(res) {
      assert.equal(res.Rescue.length, 0);
      done();
    });
  });

  it("shoule insert the data successfully and the two have the same name ", function(done) {

    rescueModel.joinRescue(global.user, -122.0941618, 37.3897202, function(res) {
      assert.equal(res.creator.name, global.name);
      done();
    });
  });

  it("shoule have the same length 0", function(done) {
    var rescueList = [];
    rescueModel.formateRescue(rescueList, -122.0941618, 37.3897202, function(res) {
      assert.equal(res.Rescue.length, 0);
      done();
    });
  });

  it("should be the same place ", function(done) {
      assert.equal(rescueModel.calDistance(0,0,0,0), 0);
      done();
  });




});
