const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ThorDeviceSchema = new Schema({
    name: String,
    address: String,
    vitalSigns: {
        temp: Number,
        hr: Number,
        spo2: Number,
        pi: Number,
        sbp: Number,
        dbp: Number
    },
    isConnected: Boolean,
    resident: { type: Schema.Types.ObjectId, ref: 'Resident' }
});

module.exports = mongoose.model('ThorDevice', ThorDeviceSchema);