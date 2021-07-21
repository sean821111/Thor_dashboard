const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ResidentSchema = new Schema({
    // Resident info
    info: {
        name: String,
        gender: String, // Male: "M", Female: "F"
        idNumber: String,
        height: Number,
        weight: Number,
        birthday: Date
    },
    // Resident health
    health: String,
    // Device info
    bedNumber: String,
    pairsDevice: { type: Schema.Types.ObjectId, ref: 'PairsDevice' },
    thorDevices: [ { type: Schema.Types.ObjectId, ref: 'ThorDevice' } ],
    // Remark
    remark: String,

    vitalSignsRecords: [ {
        day: Date,
        records: []  // record data format { date: Date, vitalSigns: Object }
    } ],

    rawDataRecords: [ { 
        day: Date,
        records: []    // record data format { date: Date, rawData: [] }
    }],

    sleepRecords: [ {
        day: Date,
        records: []    // record data format { date: Date, event: Number }
    } ]
});

module.exports = mongoose.model('Resident', ResidentSchema);