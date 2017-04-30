var mongoose = require('mongoose'), 
	Schema = mongoose.Schema, 
	ObjectId = Schema.ObjectId;


var deepPopulate = require('mongoose-deep-populate')(mongoose);

PersonSchema = new Schema({
	name: String,
	dob: String,
	gender: String,
	age: String,
    time: {	type: Date, default: Date.now},
	telephone: String,
	skinColor: String,
	eyeColor: String,
	hairColor: String,
	race: String,
	weight: String,
	height: String,
	clothing: String,
	address: String,
	association: String,
	contactPhone: String,
	contactEmail: String,
	find: {type: Number, default: 0},
	creator: {type: ObjectId, ref: 'User'},
	status: {type: Number, default: 0},
	photo: String
});

var Person = mongoose.model('Person', PersonSchema);

module.exports = Person;

