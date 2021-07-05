const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ThorDeviceSchema = new Schema({
    name: String,
    vitalSigns: {
        temp: Number,
        hr: Number,
        spo2: Number,
        pi: Number
    },
    isConnected: Boolean,
    resident: { type: Schema.Types.ObjectId, ref: 'Resident' }
});

module.exports = mongoose.model('ThorDevice', ThorDeviceSchema);