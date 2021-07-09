var express = require('express');
const mongoose = require('mongoose');
const PairsDevice = require('../database/models/pairs_device');
const ThorDevice = require('../database/models/thor_device');
const Resident = require('../database/models/resident');
var authenticated = require('./authenticated');
var deviceUpdate = require('./device_update');
var router = express.Router();

router.post('/add', authenticated, async (req, res, next) => {

    console.log('resident data: ' + JSON.stringify(req.body));
    let data = req.body;

    let pairsDevice = await PairsDevice.findOne({ "name": data.pairsDeviceName });
    // let thorDevice = await ThorDevice.findOne({ "name": data.thorDeviceName });
    let thorDevices = await ThorDevice.find({ "name": { $in: data.thorDeviceNames } });
    
    data['pairsDevice'] = null;
    if (pairsDevice) {
        if (pairsDevice.resident == null) 
            data['pairsDevice'] = pairsDevice._id;
        else
            return res.status(403).end('Pairs device already bind'); 
    } else if (data.pairsDeviceName)
        return res.status(404).end('Pairs device not found'); 
    delete data['pairsDeviceName'];

    // data['thorDevice'] = null;
    // if (thorDevice) {
    //     if (thorDevice.resident == null) 
    //         data['thorDevice'] = thorDevice._id;
    //     else
    //         return res.status(403).end('Thor device already bind'); 
    // } else if (data.thorDeviceName)
    //     return res.status(404).end('Thor device not found');  
    // delete data['thorDeviceName'];

    data['thorDevices'] = []
    if (data.thorDeviceNames.length > 0 && thorDevices.length != data.thorDeviceNames.length) {
        for (var i = 0; i < thorDevices.length; ++i)
            data.thorDeviceNames.splice(data.thorDeviceNames.indexOf(thorDevices[i].name), 1);
        return res.status(404).end('Thor devices not found: ' + data.thorDeviceNames);
    }
    for (var i = 0; i < thorDevices.length; ++i) 
        if (thorDevices[i].resident != null)
            return res.status(403).end('Thor device already bind: ' + thorDevices[i].name);

    for (var i = 0; i < thorDevices.length; i++)
        data['thorDevices'].push(thorDevices[i]._id);
    delete data['thorDeviceNames'];

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

            // if (thorDevice) {
            //     thorDevice.resident = resident._id;
            //     thorDevice.save();
            //     sse.send(thorDevice.resident.toString(), 'BIND_THOR_DEVICE', thorDevice.address);
            // }
            
            for (var i = 0; i < thorDevices.length; i++) {
                console.log("Bind device: " + thorDevices[i].name);
                thorDevices[i].resident = resident._id;
                thorDevices[i].save();
                var message = {
                    name: thorDevices[i].name,
                    resident: {
                        info: {
                          name: resident.info.name
                        },
                        _id: resident._id,
                        bedNumber: resident.bedNumber
                      }
                }
                deviceUpdate.sse.send(message);
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
                ThorDevice.updateMany({ resident: req.params.id }, 
                    { $set: { resident: null } }, 
                    (err, result2) => {
                        if (err) {
                            console.log('Device updateMany err: ' + err);
                            next(err);
                        } else if (result2.n != 0) {
                            res.status(200).end();         
                        } else {
                            res.status(404).end('Device updateMany failed'); 
                        }
                    }); 
            } else {
                res.status(404).end();
            }
        }
    });
});

router.put('/update/:id', authenticated, async (req, res, next) => {
    let data = req.body;
    let resident = await Resident.findOne({ _id: req.params.id });

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
    if (newPairsDevice) {
        if (newPairsDevice.resident == null) {
            // Bind a new device.
            update['pairsDevice'] = newPairsDevice._id;
            newPairsDevice.resident = resident._id; 
            newPairsDevice.save();
            var message = {
                name: newPairsDevice.name,
                resident: {
                    info: {
                      name: resident.info.name
                    },
                    _id: resident._id,
                    bedNumber: resident.bedNumber
                  }
            }
            deviceUpdate.sse.send(message);
        } else if (newPairsDevice.resident.equals(resident._id)) {
            update['pairsDevice'] = newPairsDevice._id;
        } else {
            return res.status(403).end('Pairs device already bind');
        }
    } else if (data.pairsDeviceName) {
        return res.status(404).end('Pairs device not found');
    }
    
    if (resident.pairsDevice) {
        let oldPairsDevice = await PairsDevice.findOne({ _id: resident.pairsDevice });
        if (oldPairsDevice.name != data.pairsDeviceName) {
            // Unbind device
            oldPairsDevice.resident = null;
            oldPairsDevice.save();
            if (data.thorDeviceName == null) {
                var message = {
                    name: oldPairsDevice.name,
                    resident: null
                }
                deviceUpdate.sse.send(message);
            }
        }
    }

    // let newThorDevice = await ThorDevice.findOne({ name: data.thorDeviceName });
    // if (newThorDevice) {
    //     if (newThorDevice.resident == null) {
    //         // Bind a new device.
    //         update['thorDevice'] = newThorDevice._id;
    //         newThorDevice.resident = resident._id; 
    //         newThorDevice.save();
    //         sse.send(newThorDevice.resident.toString(), 'BIND_THOR_DEVICE', newThorDevice.address);
    //     } else if (newThorDevice.resident.equals(resident._id)) {
    //         update['thorDevice'] = newThorDevice._id;
    //     } else {
    //         return res.status(403).end('Thor device already bind');
    //     }
    // } else if (data.thorDeviceName) {
    //     return res.status(404).end('Thor device not found');
    // }
    
    // if (resident.thorDevice) {
    //     let oldThorDevice = await ThorDevice.findOne({ _id: resident.thorDevice });
    //     if (oldThorDeviceame != data.thorDeviceName) {
    //         // Unbind device
    //         oldThorDevice.resident = null;
    //         oldThorDevice.save();
    //         if (data.thorDeviceName == null)
    //             sse.send(null, 'UNBIND_THOR_DEVICE', oldThorDevice.address);
    //     }
    // }

    let newThorDevices = await ThorDevice.find({ name: { $in: data.thorDeviceNames } });
    update['thorDevices'] = [];
    if (data.thorDeviceNames.length > 0 && newThorDevices.length != data.thorDeviceNames.length) {
        for (var i = 0; i < newThorDevices.length; ++i)
            data.thorDeviceNames.splice(data.thorDeviceNames.indexOf(newThorDevices[i].name), 1);
        return res.status(404).end('Thor devices not found: ' + data.thorDeviceNames);
    }
    for (var i = 0; i < newThorDevices.length; ++i) 
        if (newThorDevices[i].resident != null && !newThorDevices[i].resident.equals(resident._id))
            return res.status(403).end('Thor device already bind: ' + newThorDevices[i].name);
  
    for (var i = 0; i < newThorDevices.length; ++i) {
        var newThorDevice = newThorDevices[i];
        if (newThorDevice.resident == null) {
            // Bind a new device.
            console.log("Bind device: " + newThorDevice.name);
            update['thorDevices'].push(newThorDevice._id);
            newThorDevice.resident = resident._id; 
            newThorDevice.save();
            var message = {
                name: newThorDevice.name,
                resident: {
                    info: {
                      name: resident.info.name
                    },
                    _id: resident._id,
                    bedNumber: resident.bedNumber
                  }
            }
            deviceUpdate.sse.send(message);
        } else if (newThorDevice.resident.equals(resident._id)) {
            update['thorDevices'].push(newThorDevice._id);
        }
    }

    let oldThorDevices = await ThorDevice.find({ _id: { $in: resident.thorDevices } });
    for (var i = 0; i < oldThorDevices.length; ++i) {
        var oldThorDevice = oldThorDevices[i];
        if (data.thorDeviceNames.indexOf(oldThorDevice.name) == -1) {
            console.log("Unbind device: " + oldThorDevice.name);
            oldThorDevice.resident = null;
            oldThorDevice.save();
            var message = {
                name: oldThorDevice.name,
                resident: null
            }
            deviceUpdate.sse.send(message);
        }
    }

    Resident.updateOne({ _id: req.params.id, 'info.idNumber': data.info.idNumber },
        { $set: update }, 
        (err, result) => {
            if (err) {
                console.log('Resident updateOne err: ' + err);
                next(err);
            } else if (result.n != 0) {
                res.status(200).end();         
            } else {
                res.status(404).end('Resident update failed'); 
            }
        }
    );  
});


router.get('/info/:id', authenticated, (req, res, next) => {
    Resident.findOne({ _id: req.params.id }, '-__v -sleepRecords -vitalSignsRecords')
        .populate('pairsDevice', 'name isConnected _id')
        // .populate('thorDevice', 'name isConnected _id')
        .populate('thorDevices', 'name isConnected _id')
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
        }
    );
});

router.get('/list', authenticated, (req, res, next) => {

    Resident.find({}, '-__v -sleepRecords -vitalSignsRecords')
        .populate('pairsDevice', 'name isConnected _id')
        // .populate('thorDevice', 'name isConnected _id')
        .populate('thorDevices', 'name isConnected vitalSigns _id')
        .exec((err, residents) => {
            if (err) {
                console.log('Resident findOne err: ' + err);
                next(err);
            } else if (residents) {
                console.log('Resident found: ' + residents);
                res.status(200).json(residents);         
            } else {
                console.log('Resident not found');
                res.status(404).end('Resident not found');
            }
        }
    );
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
        res.status(200).json([]);
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

    console.log("--------------" + JSON.stringify(req.body));
    
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