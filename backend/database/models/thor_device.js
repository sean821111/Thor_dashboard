const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ThorDeviceSchema = new Schema({
    name: String,
    address: String,
    isConnected: Boolean,
    battery: Number,
    resident: { type: Schema.Types.ObjectId, ref: 'Resident' },
    vitalSigns: {
        temp: Number,
        hr: Number,
        spo2: Number,
        pi: Number,
        sbp: Number,
        dbp: Number
    }
});

module.exports = mongoose.model('ThorDevice', ThorDeviceSchema);