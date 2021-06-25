const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PairsDeviceSchema = new Schema({
    name: String,
    rawData: [ Number ],
    isConnected: Boolean,
    resident: { type: Schema.Types.ObjectId, ref: 'Resident' }
});

module.exports = mongoose.model('PairsDevice', PairsDeviceSchema);