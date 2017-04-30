//here we can write some external lib to facilitate
var jwt = require('jwt-simple');



exports.createToken = function(name){
    time = new Date().getTime();
    var token = jwt.encode({
        iss: name,
        exp: time
    }, 'jwtTokenSecret');
    return token;
};