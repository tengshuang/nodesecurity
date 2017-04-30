'use strict';
var Rescue = require('../db/rescue');
var User = require('../db/user');
var globalVal = require("../global");

class RescueModel {


   calDistance(lat1, lon1, lat2, lon2) {
    var radlat1 = Math.PI * lat1 / 180;
    var radlat2 = Math.PI * lat2 / 180;
    var theta = lon1 - lon2;
    var radtheta = Math.PI * theta / 180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    dist = dist * 1.609344;
    return Math.round(dist);
  }



  getRescueTeam(lon, lat, distance, callback) {
    if(distance >= 5000000) {
      Rescue.find()
        .populate('creator')
        .exec((err, rescue) => {
          if (err) {

            return callback({
              Error: {
                code: globalVal.dbError
              }
            });
          }

          return callback(rescue);
        });
    } else {


          Rescue.find()
            .populate('creator')
            .exec((err, rescue) => {
              if (err) {
                return callback({
                  Error: {
                    code: globalVal.dbError
                  }
                });
              }
              var rst = [];
              for (var i = 0; i < rescue.length; i++) {
                if(this.calDistance(rescue[i].location.coordinates[1], rescue[i].location.coordinates[0], lat, lon) < distance){
                  rst.push(rescue[i]);
                }
              }

              return callback(rst);
            });

    }

  }

  formateRescue(rescue, lon, lat, callback) {
    var res = [];

    for (var i = 0; i < rescue.length; i++) {
      var dis = this.calDistance(rescue[i].location.coordinates[1], rescue[i].location.coordinates[0], lat, lon, "K");
      res.push({
        "name": rescue[i].creator.name,
        "location": rescue[i].creator.location,
        "login": rescue[i].creator.login,
        "photo": rescue[i].creator.photo,
        "dis": dis,
        "id": rescue[i].creator.id
      });
    }
    callback({
      Rescue: res
    });
  }




  joinRescue(user, lon, lat, callback) {
    var rescue = new Rescue({
      creator: user,
      location: {
        type: "Point",
        coordinates: [lon, lat]
      }
    });

    rescue.save(function(error, rescueSave) {
      return callback(rescueSave);
    });


  }

}

module.exports = new RescueModel();
