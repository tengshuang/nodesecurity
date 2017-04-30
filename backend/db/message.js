
var mongoose = require('mongoose'), 
	Schema = mongoose.Schema, 
	ObjectId = Schema.ObjectId;

var deepPopulate = require('mongoose-deep-populate')(mongoose);

MessageSchema = new Schema({
	creator: {type: ObjectId, ref: 'User'},
	directory: {type: ObjectId, ref: 'Directory'},
	content: String,
	//for future, file, picture....
	_type: {type: Number, default: 0},
	time: {	type: Date, default: Date.now},
	location: String,
	status: Number
});

MessageSchema.plugin(deepPopulate, {
    populate: {
        'creator': {
            select: '_id name photo'
        }
    }
});
Message = mongoose.model('Message', MessageSchema);

module.exports = Message;
