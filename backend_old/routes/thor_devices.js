var express = require('express');
const ThorDevice = require('../database/models/thor_device');
var authenticated = require('./authenticated');
var router = express.Router();

router.post('/add', authenticated, (req, res, next) => {
    console.log("device data: " + JSON.stringify(req.body));
    ThorDevice.findOne({ name: req.body.name }, (err, device) => {
        if (err) {
            return next(err);
        } else if (device) {
            res.status(403).end('Device already exists');
        } else {
            req.body['isConnected'] = false;
            req.body['vitalSigns'] = {
                temp: null,
                hr: null,
                spo2: null,
                pi: null
            };
            new ThorDevice(req.body).save();
            res.status(200).end();
        }
    });
    
});

router.delete('/:deviceName', authenticated, (req, res, next) => {
    console.log("name: " + req.params.deviceName);
    
    ThorDevice.deleteOne({ name: req.params.deviceName }, (err, result) => {
        if (err) {
            return res.status(404).json(error);
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

router.get('/list', authenticated, (req, res, next) => {
    ThorDevice.find({}, '-__v -_id')
        .populate('resident', 'info.name bedNumber _id')
        .exec((err, device) => {
            if (err) {
                next(err);
            } else if (device) {
                res.status(200).json(device);
            } else {
                res.status(404).json('Device not found');
            }
        });
});

router.put('/connection/state/:deviceName', authenticated, (req, res, next) => {
    ThorDevice.updateOne({ name: req.params.deviceName }, 
        { $set: { isConnected: req.body.isConnected } },
        (err, result) => {
            if (err) {
                return next(err);
            } else if (result.n != 0) {
                console.log(result);
                res.status(200).end();
            } else {
                res.status(404).end('Device not found');
            }
        });
});

router.put('/vital/signs/:deviceName', authenticated, (req, res, next) => {
    ThorDevice.updateOne({ name: req.params.deviceName }, 
        { $set: { vitalSigns: req.body.vitalSigns } },
        (err, result) => {
            if (err) {
                return next(err);
            } else if (result.n != 0) {
                console.log(result);
                res.status(200).end();
            } else {
                res.status(404).end('Device not found');
            }
        });
});

router.get('/vital/signs/:deviceName', authenticated, (req, res, next) => {
    ThorDevice.findOne({ name: req.params.deviceName }, 'isConnected vitalSigns -_id', (err, device) => {
        if (err) {
            return next(err);
        } else if (device) {
            res.status(200).json(device);
        } else {
            res.status(404).end('Device not found');
        }
    });
});

module.exports = router;