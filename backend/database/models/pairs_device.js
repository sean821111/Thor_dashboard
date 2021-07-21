const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PairsDeviceSchema = new Schema({
    name: String,
    address: String,
    isConnected: Boolean,
    battery: Number,
    resident: { type: Schema.Types.ObjectId, ref: 'Resident' },
    rawData: [ Number ],
    sleepEvent: { 
        timestamp: Date,
        event: Number,
    }
});

module.exports = mongoose.model('PairsDevice', PairsDeviceSchema);