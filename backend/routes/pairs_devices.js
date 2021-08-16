var express = require('express');
const PairsDevice = require('../database/models/pairs_device');
const Resident = require('../database/models/resident');
var authenticated = require('./authenticated');
var deviceUpdate = require('./device_update');
var router = express.Router();

router.post('/add', (req, res, next) => {
    console.log("device data: " + JSON.stringify(req.body));
    PairsDevice.findOne({ name: req.body.name }, (err, device) => {
        if (err) {
            next(err);
        } else if (device) {
            res.status(403).end('Device already exists');
        } else {
            req.body['isConnected'] = false;
            req.body['battery'] = -1;
            req.body['resident'] = null;
            req.body['rawData'] = Array(15).fill(-1);
            req.body['sleepEvent'] = {
                timestamp: new Date(0),
                event: -1,
            };
            new PairsDevice(req.body).save();
            res.status(200).end();
        }
    });

});

router.delete('/:deviceName', (req, res, next) => {
    console.log("name: " + req.params.deviceName);
    PairsDevice.deleteOne({ name: req.params.deviceName }, (err, result) => {

        if (err) {
            next(err);
        } else {
            if (device) {
                if (device.resident) {
                    Resident.updateOne({ _id: device.resident }, 
                        {
                            $set: { pairsDevice: null }
                        },
                        (err, result) => {
                            if (err) {
                                next(err);
                            } else if (result.n != 0) {
                                var message = {
                                    name: device.name,
                                    resident: null
                                }
                                deviceUpdate.sse.send(message);
                                res.status(200).end();
                            } else {
                                res.status(404).end("Resident not update failed");
                            }
                        }
                    );
                } else {
                    console.log("Device is not be bind yet");
                    res.status(200).end();
                }
               
            } else {
                res.status(404).end("Device not found");
            }
        }
    });
});

router.get('/list', (req, res, next) => {
    PairsDevice.find({}, '-__v -_id')
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
    let update = {
        isConnected: req.body.isConnected
    }
    if (!req.body.isConnected) {
        update['battery'] = -1;
        update['rawData'] = Array(15).fill(-1);
        update['sleepEvent'] = {
            timestamp: new Date(0),
            event: -1,
        }
    }
    PairsDevice.updateOne({ name: req.params.deviceName },
        { $set: update },
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

router.put('/battery/:deviceName', (req, res, next) => {
    PairsDevice.updateOne({ name: req.params.deviceName },
        { $set: { battery: req.body.battery } },
        (err, result) => {
            if (err) {
                next(err);
            } else if (result.n != 0) {
                console.log(result);
                var message = {
                    name: req.params.deviceName,
                    battery: req.body.battery
                }
                deviceUpdate.sse.send(message);
                res.status(200).end();
            } else {
                res.status(404).end('Device not found');
            }
        });
});

var cnt = 0;
router.put('/raw/data/:deviceName', (req, res, next) => {
    let deviceName = req.params.deviceName;
    console.log('deviceName ' + deviceName);
    console.log('Raw data ' + JSON.stringify(req.body));
    PairsDevice.updateOne({ name: deviceName },
        { $set: { rawData: req.body.rawData } },
        (err, result) => {
            if (err) {
                next(err);
            } else if (result.n != 0) {
                console.log('Raw data update ' + result);
                var message = {
                    name: req.params.deviceName,
                    rawData: req.body.rawData
                }
                deviceUpdate.sse.send(message);
                res.status(200).end();
            } else {
                res.status(404).end('Device not found');
            }
        });
});

router.get('/raw/data/:deviceName', (req, res, next) => {
    let deviceName = req.params.deviceName;
    PairsDevice.findOne({ name: deviceName }, (err, device) => {
        if (err) {
            next(err);
        } else if (device) {
            res.status(200).json(device.rawData);
        } else {
            res.status(404).end('Device not found');
        }
    });
});

router.put('/sleep/event/:deviceName', (req, res, next) => {
    let deviceName = req.params.deviceName;
    req.body.sleepEvent.timestamp = new Date(req.body.sleepEvent.timestamp * 1000);
    PairsDevice.updateOne({ name: deviceName },
        { $set: { sleepEvent: req.body.sleepEvent } },
        (err, result) => {
            if (err) {
                next(err);
            } else if (result.n != 0) {
                console.log(result);
                var message = {
                    name: req.params.deviceName,
                    sleepEvent: req.body.sleepEvent
                }
                deviceUpdate.sse.send(message);
                res.status(200).end();

            } else {
                res.status(404).end('Device not found');
            }
        });
});

router.get('/sleep/event/:deviceName', (req, res, next) => {
    let deviceName = req.params.deviceName;
    PairsDevice.findOne({ name: deviceName }, (err, device) => {
        if (err) {
            next(err);
        } else if (device) {
            res.status(200).json(device.sleepEvent);
        } else {
            res.status(404).end('Device not found');
        }
    });
});

module.exports = router;