var express = require('express');
const PairsDevice = require('../database/models/pairs_device');
var authenticated = require('./authenticated');
var router = express.Router();

router.post('/add', authenticated, (req, res, next) => {
    console.log("device data: " + JSON.stringify(req.body));
    PairsDevice.findOne({ name: req.body.name }, (err, device) => {
        if (err) {
            return next(err);
        } else if (device) {
            res.status(403).end('Device already exists');
        } else {
            req.body['isConnected'] = false;
            new PairsDevice(req.body).save();
            res.status(200).end();
        }
    });
    
});

router.delete('/:deviceName', authenticated, (req, res, next) => {
    console.log("name: " + req.params.deviceName);
    
    PairsDevice.deleteOne({ name: req.params.deviceName }, (err, result) => {
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
    PairsDevice.find({}, 'name isConnected -_id')
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
    PairsDevice.updateOne({ name: req.params.deviceName }, 
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

router.put('/raw/data/:deviceName', authenticated, (req, res, next) => {
    let deviceName = req.params.deviceName;
    let rawData = req.body.rawData;
    console.log(rawData);
    PairsDevice.updateOne({ name: deviceName }, 
        { $set: { rawData: rawData } },
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

router.get('/raw/data/:deviceName', authenticated, (req, res, next) => {
    let deviceName = req.params.deviceName;
    PairsDevice.findOne({ name: deviceName }, (err, device) => {
        if (err) {
            return next(err);
        } else if (device) {
            res.status(200).json(device.rawData);
        } else {
            res.status(404).end('Device not found');
        }
    });
});

module.exports = router;