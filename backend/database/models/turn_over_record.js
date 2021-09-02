const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TurnOverRecordSchema = new Schema({
    day: Date,
    // record data format { timestamp: Date, rawDataRecords: [[] * 21]}
    // the rawDataRecords is 10 sec before and after turning over data.
    records: []  
});

module.exports = mongoose.model('TurnOverRecord', TurnOverRecordSchema);