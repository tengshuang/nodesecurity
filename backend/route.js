
var controller = require('./controllers');

var mongoose = require('mongoose'),
	ObjectId = mongoose.Types.ObjectId;

var globalVal = require("./global");

var UserCtrl = controller.user;
var DirectoryCtrl = controller.directory;
var MsgCtrl = controller.message;
var searchCtrl = controller.search;
var PersonCtrl = controller.person;
var IncidentCtrl = controller.incident;

var express = require('express');

var router = express.Router();

var multer  = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '_' + file.originalname);
  }
});

var upload = multer({storage: storage});

var login = function(req, res){
	var param = req.body;
	var name = param.username,
		pass = param.password;
	UserCtrl.login(name, pass, function(result){
		return res.status(globalVal.success).json(result);
	});
};

var createUser = function(req, res){
	var param = req.body;
	var name = param.username,
		pass = param.password,
		photo = param.photo;
	UserCtrl.signup(name, pass,photo, function(result){
			return res.status(globalVal.success).json(result);
	});
};

router.get('/directory',function(req,res){
	var token = req.query.token;
	DirectoryCtrl.getDirectory(token, function(result){
		return res.status(globalVal.success).json(result);
	});
});


router.get('/users', function(req, res){
	var token = req.query.token;
	var dirId = req.query.dirId;
	UserCtrl.getUsersByDirId(token, dirId, function(result){
		return res.status(globalVal.success).json(result);
	});
});


router.post('/logOut', function(req, res){
	var token = req.body.token;
	UserCtrl.logout(token, function(result){
		return res.status(globalVal.success).json(result);
	});
});


router.post('/message', function(req, res){
	var token = req.body.token;
	var dirId = req.body.dirId;
	var message = req.body.message;
	MsgCtrl.postMsg(token, dirId, message, function(result){
		return res.status(globalVal.success).json(result);
	});

});

router.get('/message', function(req, res){
	var token = req.query.token,
		dirId = req.query.dirId;
	MsgCtrl.getMsg(token, dirId, function(result){
		return res.status(globalVal.success).json(result);
	});
});

router.post('/status',function(req,res){
    var token = req.body.token;
    var location = req.body.location;
	var status = req.body.status;
	UserCtrl.setStatus(token, location, status, function(result){
		return res.status(globalVal.success).json(result);
	});
});

router.post('/directoryStatus', function(req, res){
    var token = req.body.token;
    var dirId = req.body.dirId;
    UserCtrl.setDirectoryStatus(token, dirId, function(result){
        return res.status(globalVal.success).json(result);
	});
});

router.get('/search',function (req, res) {
    var token = req.query.token,
		type = req.query.type,
		fromIndex = req.query.fromIndex,
		toIndex = req.query.toIndex,
		content = req.query.content;

    searchCtrl.search(token, type, fromIndex, toIndex, content, function(result){
        return res.status(globalVal.success).json(result);
    });

});

router.post('/privateDirectory', function(req, res){
	var token = req.body.token;
	var directoryname = req.body.directoryname;
	var userList = req.body.userList;
	DirectoryCtrl.addDirectory(token, directoryname, userList, function(result){
		return res.status(globalVal.success).json(result);
	});
});

router.post('/createPerson', upload.single('photo'), function (req,res) {
	var person = JSON.parse(req.body.person);
	var token = req.body.token;
	person.photo = req.file.path;
	PersonCtrl.createPerson(token,person,function (result) {
		return res.status(globalVal.success).json(result);
    });
});

router.post('/findPerson',function (req,res) {
    var token = req.body.token;
    var personId = req.body.personId;
    PersonCtrl.findPerson(token,personId,function (result) {
        return res.status(globalVal.success).json(result);
    });
});

router.post('/closePerson',function (req,res) {
    var token = req.body.token;
    var personId = req.body.personId;
    PersonCtrl.closePerson(token,personId,function (result) {
    	return res.status(globalVal.success).json(result);
    });
});

router.post('/incident', function(req, res){
	var token = req.body.token;
	var type = req.body.type;
	var location = req.body.location;
	var severity = req.body.severity;
	var number = req.body.number;
    IncidentCtrl.createIncident(token, type, location, severity, number, function (result) {
    	return res.status(globalVal.success).json(result);
    });
});

router.get('/incident', function(req, res){
    var token = req.query.token;
    IncidentCtrl.getIncident(token, function(result){
    	return res.status(globalVal.success).json(result);
	});
});

router.post('/incidentStatus', function(req, res){
    var token = req.body.token;
    var id = req.body.incidentId;
    IncidentCtrl.setStatus(token, id, function (result) {
        return res.status(globalVal.success).json(result);
    });
});

router.get("/searchPerson",function (req,res) {
    var token = req.query.token;
    var content = req.query.content;
    searchCtrl.searchPerson(token, content, function (result) {
        return res.status(globalVal.success).json(result);
    });
});

router.get("/getAllMPCases", function(req,res){
    var token = req.query.token;
    PersonCtrl.getAllMPCases(token, function (result) {
        return res.status(globalVal.success).json(result);
    });
});

router.post('/users', createUser);

router.post('/logIn',login);

module.exports = router;

