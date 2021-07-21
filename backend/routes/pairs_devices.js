var express = require('express');
const PairsDevice = require('../database/models/pairs_device');
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
            if (result.n != 0) {
                console.log(result); // Success 
                res.status(200).end();
            } else {
                res.status(404).end();
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

router.put('/raw/data/:deviceName', (req, res, next) => {
    let deviceName = req.params.deviceName;
    PairsDevice.updateOne({ name: deviceName }, 
        { $set: { rawData: req.body.rawData } },
        (err, result) => {
            if (err) {
                next(err);
            } else if (result.n != 0) {
                console.log(result);
                var message = {
                    name: req.params.deviceName,
                    rawData: req.body.vitalSigns
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