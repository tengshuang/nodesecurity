var mongoose = require('mongoose'), 
	Schema = mongoose.Schema, 
	ObjectId = Schema.ObjectId;


var deepPopulate = require('mongoose-deep-populate')(mongoose);

UserSchema = new Schema({
	name: String,
	passwd: String,
	directories: [{	dirInfo:{type: ObjectId, ref: 'Directory'},bread: Boolean}],
	// 0: undefined, 1: ok, 2: help, 3: emergency
	status: {type: Number, default: 0},
	login: {type: Number, default:0},
	token: String,
	location: String,
	photo: String
});


UserSchema.plugin(deepPopulate, {
	populate: {
		'directories.dirInfo.users': {
		select: '_id name'
		},
		'directories.dirInfo.msgs':{
			select: '_id'
		}
	}
});


var User = mongoose.model('User', UserSchema);

module.exports = User;

