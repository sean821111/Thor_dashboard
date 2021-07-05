var express = require('express');
const mongoose = require('mongoose');
const PairsDevice = require('../database/models/pairs_device');
const ThorDevice = require('../database/models/thor_device');
const Resident = require('../database/models/resident');
var authenticated = require('./authenticated');
var sseExpress = require('sse-express');
var SSE = require('express-sse');
var sse = new SSE(["initial"]);
var router = express.Router();

router.get('/bind/device', sse.init);

router.post('/add', authenticated, async (req, res, next) => {

    console.log('resident data: ' + JSON.stringify(req.body));
    let data = req.body;

    let pairsDevice = await PairsDevice.findOne({ "name": data.pairsDeviceName });
    let thorDevice = await ThorDevice.findOne({ "name": data.thorDeviceName });
   

    if (pairsDevice) {
        delete data['pairsDeviceName']
        data['pairsDevice'] = pairsDevice._id;
    }
    if (thorDevice) {
        delete data['thorDeviceName']
        data['thorDevice'] = thorDevice._id;
    }

    Resident.findOne({ 'info.idNumber': data.info.idNumber }, (err, resident) => {
        if (err) {
            console.log('Resident findOne err: ' + err);
            next(err);
        } else if (resident) {
            console.log('Resident found: ' + resident);
            res.status(403).end('Resident already exists');         
        } else {
            resident = new Resident(data);
            resident.save();

            if (pairsDevice) {
                pairsDevice.resident = resident._id;
                pairsDevice.save();
                sse.send(pairsDevice.resident.toString(), 'BIND_PAIRS_DEVICE', pairsDevice.address);
            }
            if (thorDevice) {
                thorDevice.resident = resident._id;
                thorDevice.save();
                sse.send(thorDevice.resident.toString(), 'BIND_THOR_DEVICE', thorDevice.address);
            }
            res.status(200).end();
        }
    });    
});

router.delete('/:id', authenticated, (req, res, next) => {
    Resident.deleteOne({ _id: req.params.id }, (err, result) => {
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

router.put('/update/:id', authenticated, async (req, res, next) => {
    let data = req.body;
    let resident = await Resident.findOne({ '_id': req.params.id });

    if (resident == null)
        return res.status(404).end('Resident not found');  

    if (resident.info.idNumber != data.info.idNumber) {
        let checkIdNumber = await Resident.findOne({ 'info.idNumber': data.info.idNumber });
        if (checkIdNumber)
            return res.status(403).end('Resident id number already exists'); 
    }

    //console.log("resident " + JSON.stringify(resident));
    let update = { 
        info: data.info, 
        health: data.health, 
        bedNumber: data.bedNumber, 
        remark: data.remark,
        pairsDevice: data.pairsDevice,
        thorDevice: data.thorDevice
    }

    let newPairsDevice = await PairsDevice.findOne({ name: data.pairsDeviceName });
    let isBindNewDevice = false;
    if (newPairsDevice) {
        if (newPairsDevice.resident == null) {
            // Bind a new device.
            update['pairsDevice'] = newPairsDevice._id;
            newPairsDevice.resident = resident._id; 
            newPairsDevice.save();
            isBindNewDevice = true;
            sse.send(newPairsDevice.resident.toString(), 'BIND_PAIRS_DEVICE', newPairsDevice.address);
        } else if (newPairsDevice.resident.equals(resident._id)) {
            update['pairsDevice'] = newPairsDevice._id;
        } else {
            return res.status(403).end('Pairs device already bind');
        }
    } else if (data.pairsDeviceName) {
        return res.status(404).end('Pairs device not found');
    }
    
    if (resident.pairsDevice) {
        if (data.pairsDeviceName == null || isBindNewDevice) {
            // Unbind device or bind another device
            let oldPairsDevice = await PairsDevice.findOne({ _id: resident.pairsDevice });
            oldPairsDevice.resident = null;
            oldPairsDevice.save();
        }
    }

    let newThorDevice = await ThorDevice.findOne({ name: data.thorDeviceName });
    isBindNewDevice = false;
    if (newThorDevice) {
        if (newThorDevice.resident == null) {
            // Bind a new device.
            update['thorDevice'] = newThorDevice._id;
            newThorDevice.resident = resident._id; 
            newThorDevice.save();
            isBindNewDevice = true;
            sse.send(newThorDevice.resident.toString(), 'BIND_THOR_DEVICE', newThorDevice.address);
        } else if (newThorDevice.resident.equals(resident._id)) {
            update['thorDevice'] = newThorDevice._id;
        } else {
            return res.status(403).end('Thor device already bind');
        }
    } else if (data.thorDeviceName) {
        return res.status(404).end('Thor device not found');
    }
    
    if (resident.thorDevice) {
        if (data.thorDeviceName == null || isBindNewDevice) {
            // Unbind device or bind another device
            let oldThorDevice = await ThorDevice.findOne({ _id: resident.thorDevice });
            if (data.thorDeviceName == null)
                sse.send(null, 'UNBIND_THOR_DEVICE', oldThorDevice.address);
            oldThorDevice.resident = null;
            oldThorDevice.save();
            
        }
    }

    Resident.updateOne({ _id: req.params.id, 'info.idNumber': data.info.idNumber }, { $set: update }, (err, result) => {
        if (err) {
            console.log('Resident updateOne err: ' + err);
            next(err);
        } else if (result.n != 0) {
            res.status(200).end();         
        } else {
            res.status(404).end('Resident update failed'); 
        }
    });  
});


router.get('/info/:id', authenticated, (req, res, next) => {
    Resident.findOne({ _id: req.params.id }, '-__v -sleepRecords -vitalSignsRecords' )
        .populate('pairsDevice', 'name isConnected _id')
        .populate('thorDevice', 'name isConnected _id')
        .exec((err, resident) => {
            if (err) {
                console.log('Resident findOne err: ' + err);
                next(err);
            } else if (resident) {
                console.log('Resident found: ' + resident);
                res.status(200).json(resident);         
            } else {
                console.log('Resident not found');
                res.status(404).end('Resident not found');
            }
        });
});


router.put('/sleep/record/:deviceName', (req, res, next) => {
    let timestamp = new Date(req.body.timestamp * 1000);
    let today = new Date(Date.UTC(timestamp.getUTCFullYear(), timestamp.getUTCMonth(), timestamp.getUTCDate()));

    PairsDevice.findOne({ name: req.params.deviceName }, (err, device) => {
        if (err) {
            next(err);
        } else if (device) {
            console.log(device)
            if (device._id)
            {
                Resident.updateOne({ pairsDevice: device._id, 'sleepRecords.day': { "$ne": today } }, 
                    { $push: { sleepRecords: {day: today} } },
                    (err, result) => {
                        if (err) {
                            console.log('Resident updateOne err: ' + err);
                            return next(err);   
                        } else if (result.n != 0) {
                            console.log("Resident update result: ", result);
                        }
                        else {
                            console.log("Resident update failed: ", result);
                            // return res.status(404).end(); 
                        }
                    }
                );

                Resident.updateOne({ pairsDevice: device._id, 'sleepRecords.day': today }, 
                    {
                        $push: { 'sleepRecords.$.records': { timestamp: timestamp, event: req.body.event } }
                    },
                    (err, result) => {
                        if (err) {
                            console.log('Resident update err: ' + err);
                            next(err);   
                        } else if (result.n != 0) {
                            console.log("Resident2 update result: ", result);
                            res.status(200).end();   
                        }
                        else {
                            console.log("Residen2 update failed: ", result);
                            res.status(404).end(); 
                        }
                    }
                );
            } else {
                res.status(404).end("Device not bind resident"); 
            }
        } else {
            res.status(404).end('Device not found');
        }
    });
});

router.get('/sleep/record/:id', authenticated, async (req, res, next) => {
    let id = mongoose.Types.ObjectId(req.params.id);
    // let start = new Date(req.body.start*1000);
    // let end  = new Date(req.body.end*1000);
    let start = new Date(req.body.start);
    let end = new Date(req.body.end);
    
    let startDay = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
    
    let endDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
    

    console.log("id: "+ id);
    console.log("start: "+ start.toISOString());
    console.log("end: "+ end.toISOString());
    console.log("startDay: "+ startDay.toISOString());
    console.log("endDay: "+ endDay.toISOString());

    let filtered = await Resident.aggregate([
        { $match:  { _id: id } },
        { $project: {
            "sleepRecords": {
                "$filter": {
                    "input": "$sleepRecords",
                    "cond": {
                    "$and": [
                        { "$gte": [ "$$this.day", startDay ] },
                        { "$lte": [ "$$this.day", endDay ] }
                    ]}
                }
            }
        }},
        { $project: {
            "sleepRecords": {
                "$map": {
                    "input": "$sleepRecords",
                    "as": "a1",
                    "in": {
                        "records": {
                            "$filter": {
                                "input": "$$a1.records",
                                "cond": {
                                "$and": [
                                    { "$gte": [ "$$this.timestamp", start ] },
                                    { "$lte": [ "$$this.timestamp", end ] }
                                ]}
                            }
                                
                        }
                    }
                }
            }
        }},
        {
            $unwind: "$sleepRecords"
        },
        {
            $unwind: "$sleepRecords.records"
        },
        {
            $group: {
                "_id": null,
                "output": { "$push" : "$sleepRecords.records" }
              }
        }
        ]);
        
    if (filtered.length > 0) {
        res.status(200).json(filtered[0].output);  
    } else {
        res.status(404).end('Sleep record not found');  
    }
});

router.put('/vital/signs/record/:id', (req, res, next) => {
    console.log("put vital/signs/record");
    let timestamp = new Date(req.body.timestamp * 1000);
    let today = new Date(Date.UTC(timestamp.getUTCFullYear(), timestamp.getUTCMonth(), timestamp.getUTCDate()));

    // Create today record array if not exist.
    Resident.updateOne({ _id: req.params.id, 'vitalSignsRecords.day': { "$ne": today } }, 
    { $push: { vitalSignsRecords: {day: today} } },
        (err, result) => {
            if (err) {
                console.log('Resident updateOne err: ' + err);
                return next(err);   
            } else if (result.n != 0) {
                console.log("Resident update result: ", result);
            } else {
                console.log("Resident update failed: ", result);
                // return res.status(404).end(); 
            }
        }
    );

    // Insert record object in today record array.
    Resident.updateOne({ _id: req.params.id, 'vitalSignsRecords.day': today }, 
        {
            $push: { 'vitalSignsRecords.$.records': { timestamp: timestamp, vitalSigns: req.body.vitalSigns } }
        },
        (err, result) => {
            if (err) {
                console.log('Resident update err: ' + err);
                next(err);   
            } else if (result.n != 0) {
                console.log("Resident2 update result: ", result);
                res.status(200).end();   
            }
            else {
                console.log("Residen2 update failed: ", result);
                res.status(404).end('Resident not found'); 
            }
        }
    );
});

router.get('/vital/signs/record/:id/:start/:end', async (req, res, next) => {
    let id = mongoose.Types.ObjectId(req.params.id);
    let start = new Date(parseInt(req.params.start));
    let end = new Date(parseInt(req.params.end));
    let startDay = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
    let endDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));

    console.log("id: "+ id);
    console.log("start: "+ start.toISOString());
    console.log("end: "+ end.toISOString());
    console.log("startDay: "+ startDay.toISOString());
    console.log("endDay: "+ endDay.toISOString());

    let filtered = await Resident.aggregate([
        { $match:  { _id: id } },
        { $project: {
            "vitalSignsRecords": {
                "$filter": {
                    "input": "$vitalSignsRecords",
                    "cond": {
                    "$and": [
                        { "$gte": [ "$$this.day", startDay ] },
                        { "$lte": [ "$$this.day", endDay ] }
                    ]}
                }
            }
        }},
        { $project: {
            "vitalSignsRecords": {
                "$map": {
                    "input": "$vitalSignsRecords",
                    "as": "a1",
                    "in": {
                        "records": {
                            "$filter": {
                                "input": "$$a1.records",
                                "cond": {
                                "$and": [
                                    { "$gte": [ "$$this.timestamp", start ] },
                                    { "$lte": [ "$$this.timestamp", end ] }
                                ]}
                            }
                                
                        }
                    }
                }
            }
        }},
        {
            $unwind: "$vitalSignsRecords"
        },
        {
            $unwind: "$vitalSignsRecords.records"
        },
        {
            $group: {
                "_id": null,
                "output": { "$push" : "$vitalSignsRecords.records" }
              }
            
        }
        ]);
        
    if (filtered.length > 0) {
        res.status(200).json(filtered[0].output);  
    } else {
        res.status(404).end('Vital signs record not found');  
    }
});

router.get('/vital/signs/record/:id', async (req, res, next) => {
    let id = mongoose.Types.ObjectId(req.params.id);
    // let start = new Date(req.body.start*1000);
    // let end  = new Date(req.body.end*1000);
    let start = new Date(req.body.start);
    let end = new Date(req.body.end);
    
    let startDay = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
    let endDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));

    console.log("id: "+ id);
    console.log("start: "+ start.toISOString());
    console.log("end: "+ end.toISOString());
    console.log("startDay: "+ startDay.toISOString());
    console.log("endDay: "+ endDay.toISOString());

    let filtered = await Resident.aggregate([
        { $match:  { _id: id } },
        { $project: {
            "vitalSignsRecords": {
                "$filter": {
                    "input": "$vitalSignsRecords",
                    "cond": {
                    "$and": [
                        { "$gte": [ "$$this.day", startDay ] },
                        { "$lte": [ "$$this.day", endDay ] }
                    ]}
                }
            }
        }},
        { $project: {
            "vitalSignsRecords": {
                "$map": {
                    "input": "$vitalSignsRecords",
                    "as": "a1",
                    "in": {
                        "records": {
                            "$filter": {
                                "input": "$$a1.records",
                                "cond": {
                                "$and": [
                                    { "$gte": [ "$$this.timestamp", start ] },
                                    { "$lte": [ "$$this.timestamp", end ] }
                                ]}
                            }
                                
                        }
                    }
                }
            }
        }},
        {
            $unwind: "$vitalSignsRecords"
        },
        {
            $unwind: "$vitalSignsRecords.records"
        },
        {
            $group: {
                "_id": null,
                "output": { "$push" : "$vitalSignsRecords.records" }
              }
            
        }
        ]);
        
    if (filtered.length > 0) {
        res.status(200).json(filtered[0].output);  
    } else {
        res.status(404).end('Vital signs record not found');  
    }
});

module.exports = router;