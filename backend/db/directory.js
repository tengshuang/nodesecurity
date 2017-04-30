
var mongoose = require('mongoose'), 
	Schema = mongoose.Schema, 
	ObjectId = Schema.ObjectId;

var deepPopulate = require('mongoose-deep-populate')(mongoose);
DirectorySchema = new Schema({
	name: String,
	users: [{type: ObjectId, ref: 'User'}],
	msgs: [{type: ObjectId, ref: 'Message'}]
});
DirectorySchema.plugin(deepPopulate, {
	populate: {
	'users.directories': {
		select: '_id name'
		}
	}
});


DirectorySchema.plugin(deepPopulate, {
	populate: {
	'msgs.creator': {
		select: '_id name photo'
		}
	}
});


var Directory = mongoose.model('Directory', DirectorySchema);




module.exports = Directory;
