var userModel = require('../models/user');
var dirModel = require('../models/directory');
var msgModel = require('../models/message');
var rescueModel = require('../models/rescue');
var io = require('../io');
var globalVal = require("../global");
var json = globalVal.Cities;

var rescueCtrl = {};

rescueCtrl.getRescueTeam = function(token, lon, lat, distance, callback) {
  userModel.validate({
    token: token
  }, function(user) {
    if (user) {
      rescueModel.getRescueTeam(lon, lat, distance, function(rescue) {
        if (rescue) {
          var cal = function calDistance(l1, l2, l3, l4) {
           var lat1 = 3.14159 * l1 / 180;
           var lat2 = 3.14159 * l3 / 180;
           var dist = Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(3.14159 * (l2-l4) / 180);
           dist = Math.acos(dist);
           dist = (dist * 180 / Math.PI)* 60 * 1.1515* 1.609344;
           return dist;
         };

          var sortFun = function compare(a,b) {
            var first = cal(a.location.coordinates[1], a.location.coordinates[0], lat,lon);
            var second = cal(b.location.coordinates[1], b.location.coordinates[0], lat, lon);
            return first - second;
          };

          rescue.sort(sortFun);

          rescueModel.formateRescue(rescue, lon, lat, function(ret) {
            callback(ret);
          });

        } else return callback({
          Error: {
            code: globalVal.notfound
          }
        });
      });
    } else {
      return callback({
        Error: {
          code: globalVal.unauthorized
        }
      });
    }
  });
};

rescueCtrl.getCities = function(token, callback) {
  userModel.validate({
    token: token
  }, function(user) {
    if (user) {
      if (json) {
        callback(json);
      } else return callback({
        Error: {
          code: globalVal.notfound
        }
      });
    } else {
      return callback({
        Error: {
          code: globalVal.unauthorized
        }
      });
    }
  });
};

rescueCtrl.joinRescue = function(token, lon, lat, callback) {
  userModel.validate({
    token: token
  }, function(user) {
    if (user) {
      rescueModel.joinRescue(user, lon, lat, function(rescue) {
        if (rescue) {
          callback(rescue);
          return;
        } else return callback({
          Error: {
            code: globalVal.notfound
          }
        });
      });
    } else {
      return callback({
        Error: {
          code: globalVal.unauthorized
        }
      });
    }
  });
};


module.exports = rescueCtrl;
