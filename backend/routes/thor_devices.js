var express = require('express');
const ThorDevice = require('../database/models/thor_device');
const Resident = require('../database/models/resident');
var authenticated = require('./authenticated');
var deviceUpdate = require('./device_update');
var router = express.Router();

router.post('/add', async (req, res, next) => {
    console.log("device data: " + JSON.stringify(req.body));
    ThorDevice.findOne({ name: req.body.name }, (err, device) => {
        if (err) {
            next(err);
        } else if (device) {
            res.status(403).end('Device already exists');
        } else {
            req.body['isConnected'] = false;
            req.body['vitalSigns'] = {
                temp: null,
                hr: null,
                spo2: null,
                pi: null,
            };
            req.body['resident'] = null;
            new ThorDevice(req.body).save();
            res.status(200).end();
        }
    });
    
});

router.delete('/:deviceName', async (req, res, next) => {
    console.log("name: " + req.params.deviceName);
    
    ThorDevice.findOneAndDelete({ name: req.params.deviceName }, (err, device) => {
        if (err) {
            next(err);
        } else {
            if (device) {
                if (device.resident) {
                    Resident.findOne({ _id: device.resident }, (err, resident) => {
                        if (err) {
                            return res.status(500).json(error);
                        } else if (resident) {
                            resident.thorDevice = null;
                            resident.save();
                            res.status(200).end();
                        }
                    });
                } else {
                    res.status(200).end();
                }
               
            } else {
                res.status(404).end("Device not found");
            }
        }
    });
});

router.get('/list', async (req, res, next) => {
    ThorDevice.find({}, '-__v -_id')
        .populate('resident', 'info.name bedNumber _id')
        .exec((err, device) => {
            if (err) {
                next(err);
            } else if (device) {
                res.status(200).json(device);
            } else {
                res.status(404).end('Device not found');
            }
        });
});

router.put('/connection/state/:deviceName', (req, res, next) => {
    ThorDevice.updateOne({ name: req.params.deviceName }, 
        { $set: { isConnected: req.body.isConnected } },
        (err, result) => {
            if (err) {
                next(err);
            } else if (result.n != 0) {
                console.log(result);
                var message = {
                    name: req.params.deviceName,
                    isConnected: req.body.isConnected
                }
                deviceUpdate.sse.send(message);
                res.status(200).end();
            } else {
                res.status(404).end('Device not found');
            }
        });
});

router.put('/vital/signs/:deviceName', (req, res, next) => {
    ThorDevice.updateOne({ name: req.params.deviceName }, 
        { $set: { vitalSigns: req.body.vitalSigns } },
        (err, result) => {
            if (err) {
                next(err);
            } else if (result.n != 0) {
                console.log(result);
                var message = {
                    name: req.params.deviceName,
                    vitalSigns: req.body.vitalSigns
                }
                deviceUpdate.sse.send(message);
                res.status(200).end();
            } else {
                res.status(404).end('Device not found');
            }
        });
});

router.get('/vital/signs/:deviceName', authenticated, (req, res, next) => {
    ThorDevice.findOne({ name: req.params.deviceName }, 'isConnected vitalSigns -_id', (err, device) => {
        if (err) {
            next(err);
        } else if (device) {
            res.status(200).json(device);
        } else {
            res.status(404).end('Device not found');
        }
    });
});

module.exports = router;