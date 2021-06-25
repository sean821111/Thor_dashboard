var express = require('express');
const mongoose = require('mongoose');
const PairsDevice = require('../database/models/pairs_device');
const ThorDevice = require('../database/models/thor_device');
const Resident = require('../database/models/resident');
var authenticated = require('./authenticated');
var router = express.Router();

router.post('/add', authenticated, async (req, res, next) => {

    console.log('resident data: ' + JSON.stringify(req.body));
    let data = req.body;

    let pairsDevice = await PairsDevice.findOne({ "name": data.pairsDeviceName });
    let thorDevice = await ThorDevice.findOne({ "name": data.thorDeviceName });

    if (pairsDevice == null && thorDevice == null)
        return res.status(404).end('Device not found');   

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
            res.status(403).json('Resident already exists');         
        } else {
            resident = new Resident(data);
            resident.save();

            if (pairsDevice) {
                pairsDevice.resident = resident._id;
                pairsDevice.save();
            }
            if (thorDevice) {
                thorDevice.resident = resident._id;
                thorDevice.save();
            }
            res.status(200).end();
        }
    });    

    // Device.findOne({ name: req.body.deviceName }, (err, device) => {
    //     if (err) {
    //         console.log('Device findOne err: ' + err);
    //         next(err);
    //     } else if (device) {
    //         console.log('Device found: ' + device);
    //         let data = {
    //             info: req.body.info,
    //             health: req.body.health,
    //             bedNumber: req.body.bedNumber,
    //             device: device._id,
    //             remark: req.body.remark
    //         };
    //         Resident.findOne({ 'info.idNumber': data.info.idNumber }, (err, resident) => {
    //             if (err) {
    //                 console.log('Resident findOne err: ' + err);
    //                 next(err);
    //             } else if (resident) {
    //                 console.log('Resident found: ' + resident);
    //                 res.status(403).json('Resident already exists');         
    //             } else {
    //                 resident = new Resident(data);
    //                 resident.save();
    //                 device.resident = resident._id;
    //                 device.save();
    //                 res.status(200).end();
    //             }
    //         });      
    //     } else {
    //         console.log('Device not found');
    //         res.status(404).json('Device not found');
    //     }
    // });
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

    let pairsDevice = await PairsDevice.findOne({ "name": data.pairsDeviceName });
    let thorDevice = await ThorDevice.findOne({ "name": data.thorDeviceName });

    if (pairsDevice == null && thorDevice == null)
        return res.status(404).json('Device not found');   
    
    let update = { 
        info: data.info, 
        health: data.health, 
        bedNumber: data.bedNumber, 
        remark: data.remark 
    }
    
    if (pairsDevice)
        update['pairsDevice'] = pairsDevice._id;

    if (thorDevice)
        update['thorDevice'] = thorDevice._id;

    console.log(update)
    Resident.findOneAndUpdate({ _id: req.params.id }, 
        { $set: update },
        (err, resident) => {
            if (err) {
                console.log('Resident findOne err: ' + err);
                next(err);
            } else if (resident) {
                if (pairsDevice) {
                    pairsDevice.resident = resident._id;
                    pairsDevice.save();
                }
                if (thorDevice) {
                    thorDevice.resident = resident._id;
                    thorDevice.save();
                }
                res.status(200).end();         
            } else {
                console.log('Resident found: ' + resident);
                res.status(404).end('Resident not found'); 
            }
        });  
    // Device.findOne({ name: req.body.deviceName }, (err, device) => {
    //     if (err) {
    //         console.log('Device findOne err: ' + err);
    //         next(err);
    //     } else if (device) {
    //         console.log('Device found: ' + device);
    //         let data = {
    //             info: req.body.info,
    //             health: req.body.health,
    //             bedNumber: req.body.bedNumber,
    //             device: device._id,
    //             remark: req.body.remark
    //         };
    //         Resident.findOneAndUpdate({ _id: req.params.id }, 
    //             { $set: { 
    //                 info: data.info, health: data.health, bedNumber: data.bedNumber, 
    //                 device: data.device, remark: data.remark 
    //             } },
    //             (err, resident) => {
    //                 if (err) {
    //                     console.log('Resident findOne err: ' + err);
    //                     next(err);
    //                 } else if (resident) {
    //                     device.resident = resident._id;
    //                     device.save();
    //                     res.status(200).end();         
    //                 } else {
    //                     console.log('Resident found: ' + resident);
    //                     res.status(404).end('Resident not found'); 
    //                 }
    //             });      
    //     } else {
    //         console.log('Device not found');
    //         res.status(404).json('Device not found');
    //     }
    // });
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
                res.status(404).json('Resident not found');
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
            res.status(404).json('Device not found');
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

router.put('/vital/signs/record/:deviceName', (req, res, next) => {
    let timestamp = new Date(req.body.timestamp * 1000);
    let today = new Date(Date.UTC(timestamp.getUTCFullYear(), timestamp.getUTCMonth(), timestamp.getUTCDate()));

    ThorDevice.findOne({ name: req.params.deviceName }, (err, device) => {
        if (err) {
            next(err);
        } else if (device) {
            console.log(device)
            if (device._id)
            {
                Resident.updateOne({ thorDevice: device._id, 'vitalSignsRecords.day': { "$ne": today } }, 
                    { $push: { vitalSignsRecords: {day: today} } },
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

                Resident.updateOne({ thorDevice: device._id, 'vitalSignsRecords.day': today }, 
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
                            res.status(404).end(); 
                        }
                    }
                );
            } else {
                res.status(404).end("Device not bind resident"); 
            }
        } else {
            res.status(404).json('Device not found');
        }
    });
});

router.get('/vital/signs/record/:id', authenticated, async (req, res, next) => {
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