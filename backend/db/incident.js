/**
 * Created by wang on 2017/4/13.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

IncidentSchema = new Schema({
    type: {type: Number,default: 0},
    location: String,
    severity:  {type: Number,default: 0},
    number: {type: Number,default: 0},
    time: {	type: Date, default: Date.now},
    status: {type: Number, default:0}
});

Incident = mongoose.model('Incident', IncidentSchema);

module.exports = Incident;
