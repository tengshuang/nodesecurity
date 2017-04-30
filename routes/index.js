var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('layout');
});

router.get('/SignIn', function(req, res, next) {
    res.render('index');
});

router.get('/incident', function (req, res, next) {
    res.render('incident');
});

router.get('/community',function(req,res,next){
    res.render('community');
});

router.get('/welcome',function(req,res,next){
    res.render('welcome');
});

router.get('/status',function(req,res,next){
    res.render('status');
});

router.get('/userList',function(req,res,next){
    res.render('userList');
});
router.get('/groupList',function(req,res,next){
    res.render('groupList');
});

router.get('/chatWall',function(req,res,next){
    res.render('chatWall');
});

router.get('/createNewGroup',function(req,res,next){
    res.render('createNewGroup');
});

router.get('/announcement',function(req,res,next){
    res.render('announcement');
});

router.get('/showincident', function(req,res,next){
    res.render('showincident');
})
router.get('/incident', function(req,res,next){
    res.render('incident');
})
router.get('/search',function(req,res,next){
    res.render('search');
});

router.get('/bulletin',function(req,res,next){
    res.render('bulletin');
});

router.get('/createPrivateChat',function(req,res,next){
    res.render('createPrivateChat');
});


router.get('/test', (req, res, next) => {
    res.render('test');
});

router.get('/createPerson', (req, res, next) => {
    res.render('createPerson');
});

router.get('/personReport', (req, res, next) => {
    res.render('personReport');
});

module.exports = router;
