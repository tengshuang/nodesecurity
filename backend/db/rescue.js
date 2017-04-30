var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

var deepPopulate = require('mongoose-deep-populate')(mongoose);

RescueSchema = new Schema({
	creator: {type: ObjectId, ref: 'User'},
	location: { 'type': {type: String, enum: "Point", default: "Point"}, coordinates: { type: [Number],   default: [0,0]} }
});

RescueSchema.index({location: '2dsphere'});

Rescue = mongoose.model('Rescue', RescueSchema);

module.exports = Rescue;
