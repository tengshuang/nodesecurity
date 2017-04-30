'use strict';
var Person = require('../db/person');
var globalVal = require("../global");

class PersonModel {
    createPerson(person,userInfo,callback){
        var newPerson = new Person(person);
        newPerson.creator = userInfo._id;
        newPerson.save(function(error, person) {
            if(error){
                return callback({Error: {code: globalVal.dbError}});
            }
            else {
                return callback(person);
            }
        });
    }
    formatPerson(person,callback){
        person.__v = undefined;
        callback({Person:person});
    }

    findPerson(personId,callback){
        Person.findOneAndUpdate({_id:personId},
            { $set: { find: 1}},
            function(error, result){
                if(error){
                    return callback({Error: {code: globalVal.dbError}});
                }
                else {
                    result.find = 1;
                    callback(result);
                    return;
                }
            });
    }

    closePerson(creatorId,personId,callback){
        Person.findOneAndUpdate({_id:personId,creator:creatorId},
            { $set: { status: 1}},
            function(error, result){
                if(error){
                    return callback({Error: {code: globalVal.dbError}});
                }
                else {
                    result.status = 1;
                    callback(result);
                    return;
                }
            });
    }

    search(content,callback){
        var q = Person.find({$or:[
            {'name':{ $regex: content, $options: 'i' }},
            {'age':{ $regex: content, $options: 'i' }},
            {'gender':{ $regex: content, $options: 'i' }},
            {'telephone':{ $regex: content, $options: 'i' }},
            {'skinColor':{ $regex: content, $options: 'i' }},
            {'eyeColor':{ $regex: content, $options: 'i' }},
            {'hairColor':{ $regex: content, $options: 'i' }},
            {'race':{ $regex: content, $options: 'i' }},
            {'weight':{ $regex: content, $options: 'i' }},
            {'height':{ $regex: content, $options: 'i' }},
            {'clothing':{ $regex: content, $options: 'i' }},
            {'address':{ $regex: content, $options: 'i' }},
            {'association':{ $regex: content, $options: 'i' }},
            {'contactPhone':{ $regex: content, $options: 'i' }},
            {'contactEmail':{ $regex: content, $options: 'i' }}
            ]}).sort({'time': -1});
        q.exec(function (err,persons) {
            if(err){
                return callback({Error: {code: globalVal.dbError}});
            }
            else {
                return callback(persons);
            }
        });
    }

    getAllMPCases(callback){
        Person.find({},function (err,result) {
            if(err){
                return callback({Error: {code: globalVal.dbError}});
            }
            else{
                return callback({Cases:result});
            }
        }).sort({'time':-1});
    }


}

module.exports = new PersonModel();

