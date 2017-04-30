//here we can write some functions related to socket.io
var Ctrl = require('./controllers');

var io = require('socket.io');

var clients = {};

initServer = function(server) {

	exports.io = io = io.listen(server);

	this.user = '';
	
	io.sockets.on('connection', function (socket) {
		socket.on('logInB', function(user){
            Ctrl.user.getUserInfo({name: user}, function (userinfo) {
            	clients[userinfo._id] = socket;
            	socket.username = user;
            });
			socket.broadcast.emit('logInF',user);
			socket.emit('logInF',user);
		});

		socket.on('disconnect', function() {
			Ctrl.user.logoutByName(socket.username,function(code){});
			socket.broadcast.emit('logOutF', socket.username);
		});
	}); 
};

exports.initServer = initServer;
exports.sendMessage = function(userid, msg) {
    if(clients[userid]) {
        clients[userid].emit('message', msg);
    }
};

exports.sendIncident = function(userid,incident){
    if(clients[userid]) {
        clients[userid].broadcast.emit('incident', incident);
    }
};

exports.newIncidentState = function(userid){
    if(clients[userid]) {
        clients[userid].broadcast.emit('newIncidentState');
    }
};
exports.logout = function(userid){
	if(clients[userid]) {
        clients[userid].broadcast.emit('logOutF');
        clients[userid].emit('logOutF');
        clients[userid] = undefined;
	}
};
exports.newUserStatus = function(userid){
    if(clients[userid]) {
        clients[userid].broadcast.emit('newUserStatus');
        clients[userid].emit('newUserStatus');
    }
};
