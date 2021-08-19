var express = require('express');
const mongoose = require('mongoose');
const PairsDevice = require('../database/models/pairs_device');
const ThorDevice = require('../database/models/thor_device');
const Resident = require('../database/models/resident');
var authenticated = require('./authenticated');
var deviceUpdate = require('./device_update');
var router = express.Router();

router.post('/add', authenticated, async (req, res, next) => {
    console.log('Resident add: ' + JSON.stringify(req.body));
    let data = req.body;

    let thorDevices = null, pairsDevice = null;
    try {
        thorDevices = await ThorDevice.find({ "name": { $in: data.thorDeviceNames } });
        pairsDevice = await PairsDevice.findOne({ "name": data.pairsDeviceName });
    } catch (err) {
        console.log('Device find err: ' + err);
        return next(err);
    }

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

    data['pairsDevice'] = null;
    if (pairsDevice) {
        if (pairsDevice.resident == null)
            data['pairsDevice'] = pairsDevice._id;
        else
            return res.status(403).end('Pairs device already bind');
    } else if (data.pairsDeviceName)
        return res.status(404).end('Pairs device not found');
    delete data['pairsDeviceName'];

    Resident.findOne({ 'info.idNumber': data.info.idNumber }, (err, resident) => {
        if (err) {
            console.log('Resident findOne err: ' + err);
            next(err);
        } else if (resident) {
            console.log('Resident found: ' + resident);
            res.status(403).end('Resident id number already exists');
        } else {
            resident = new Resident(data);
            resident.save();

            for (var i = 0; i < thorDevices.length; i++) {
                console.log("Bind device: " + thorDevices[i].name);
                thorDevices[i].resident = resident._id;
                thorDevices[i].save();
                var message = {
                    name: thorDevices[i].name,
                    resident: {
                        _id: resident._id,
                    }
                }
                deviceUpdate.sse.send(message, "");
            }

            if (pairsDevice) {
                console.log("Bind device: " + pairsDevice.name);
                pairsDevice.resident = resident._id;
                pairsDevice.save();
                var message = {
                    name: pairsDevice.name,
                    resident: {
                        _id: resident._id,
                    }
                }
                deviceUpdate.sse.send(message);
            }

            res.status(200).end();
        }
    });
});

router.delete('/:id', authenticated, (req, res, next) => {
    console.log('Resident delete: ' + req.params.id);
    Resident.deleteOne({ _id: req.params.id }, (err, result) => {
        if (err) {
            next(err);
        } else {
            if (result.n != 0) {
                console.log(result); // Success
                ThorDevice.updateMany({ resident: req.params.id },
                    { $set: { resident: null } },
                    (err, result) => {
                        console.log(result);
                        if (err) {
                            console.log('ThorDevice updateMany err: ' + err);
                            next(err);
                        } else if (result.ok) {
                            PairsDevice.updateOne({ resident: req.params.id },
                                { $set: { resident: null } },
                                (err, result) => {
                                    console.log(result);
                                    if (err) {
                                        console.log('PairsDevice updateOne err: ' + err);
                                        next(err);
                                    } else if (result.ok) {
                                        res.status(200).end();
                                    }
                                });
                        }
                    });


            } else {
                res.status(404).end("Resident not found");
            }
        }
    });
});

router.put('/update/:id', authenticated, async (req, res, next) => {
    let data = req.body;
    let resident = null;
    try {
        resident = await Resident.findOne({ _id: req.params.id });

        if (resident == null)
            return res.status(404).end('Resident not found');

        if (resident.info.idNumber != data.info.idNumber) {
            let checkIdNumber = await Resident.findOne({ 'info.idNumber': data.info.idNumber });
            if (checkIdNumber)
                return res.status(403).end('Resident id number already exists');
        }
    } catch (err) {
        console.log('Resident find err: ' + err);
        return next(err);
    }

    let thorDevices = null, pairsDevice = null;
    try {
        thorDevices = await ThorDevice.find({ name: { $in: data.thorDeviceNames } });
        pairsDevice = await PairsDevice.findOne({ name: data.pairsDeviceName });
    } catch (err) {
        console.log('Device find err: ' + err);
        return next(err);
    }

    data['thorDevices'] = [];
    if (data.thorDeviceNames.length > 0 && thorDevices.length != data.thorDeviceNames.length) {
        for (var i = 0; i < thorDevices.length; ++i)
            data.thorDeviceNames.splice(data.thorDeviceNames.indexOf(thorDevices[i].name), 1);
        return res.status(404).end('Thor devices not found: ' + data.thorDeviceNames);
    }
    for (var i = 0; i < thorDevices.length; ++i) {
        if (thorDevices[i].resident == null || thorDevices[i].resident.equals(resident._id)) {
            data['thorDevices'].push(thorDevices[i]._id);
        } else {
            return res.status(403).end('Thor device already bind: ' + thorDevices[i].name);
        }

    }

    data['pairsDevice'] = null;
    if (pairsDevice) {
        if (pairsDevice.resident == null || pairsDevice.resident.equals(resident._id))
            data['pairsDevice'] = pairsDevice._id;
        else
            return res.status(403).end('Pairs device already bind');
    } else if (data.pairsDeviceName)
        return res.status(404).end('Pairs device not found');

    try {
        let bindThorDevices = await ThorDevice.find({ _id: { $in: resident.thorDevices } });
        for (var i = 0; i < bindThorDevices.length; ++i) {
            let index = data.thorDeviceNames.indexOf(bindThorDevices[i].name);
            if (index == -1) {
                console.log("Unbind device: " + bindThorDevices[i].name);
                bindThorDevices[i].resident = null;
                bindThorDevices[i].save();
                var message = {
                    name: bindThorDevices[i].name,
                    resident: null
                }
                deviceUpdate.sse.send(message);
            } else {
                thorDevices = thorDevices.filter(device => device.name !== data.thorDeviceNames[index]);
            }
        }
        for (var i = 0; i < thorDevices.length; i++) {
            console.log("Bind device: " + thorDevices[i].name);
            thorDevices[i].resident = resident._id;
            thorDevices[i].save();
            var message = {
                name: thorDevices[i].name,
                resident: {
                    _id: resident._id,
                }
            }
            deviceUpdate.sse.send(message);
        }

        if (resident.pairsDevice) {
            let bindPairsDevice = await PairsDevice.findOne({ _id: resident.pairsDevice });
            if (data.pairsDeviceName !== bindPairsDevice.name) {
                console.log("Unbind device: " + bindPairsDevice.name);
                bindPairsDevice.resident = null;
                bindPairsDevice.save();
                var message = {
                    name: bindPairsDevice.name,
                    resident: null
                }
                deviceUpdate.sse.send(message);
            } else {
                pairsDevice = null;
            }
        }
        if (pairsDevice) {
            console.log("Bind device: " + pairsDevice.name);
            pairsDevice.resident = resident._id;
            pairsDevice.save();
            var message = {
                name: pairsDevice.name,
                resident: {
                    _id: resident._id,
                }
            }
            deviceUpdate.sse.send(message);
        }
    } catch (err) {
        console.log('bind device find err: ' + err);
        return next(err);
    }

    delete data['thorDeviceNames'];
    delete data['pairsDeviceName'];
    resident.set(data);
    resident.save();
    res.status(200).end();
});


router.get('/info/:id', authenticated, (req, res, next) => {
    Resident.findOne({ _id: req.params.id }, '-__v -vitalSignsRecords -rawDataRecords -sleepRecords')
        .populate('thorDevices', '-__v')
        .populate('pairsDevice', '-__v')
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

    Resident.find({}, '-__v -vitalSignsRecords -rawDataRecords -sleepRecords')
        .populate('thorDevices', '-__v')
        .populate('pairsDevice', '-__v')
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

router.put('/raw/data/record/:id', (req, res, next) => {
    let timestamp = new Date(req.body.timestamp * 1000);
    let today = new Date(Date.UTC(timestamp.getUTCFullYear(), timestamp.getUTCMonth(), timestamp.getUTCDate()));

    // Create today record array if not exist.
    Resident.updateOne({ _id: req.params.id, 'rawDataRecords.day': { "$ne": today } },
        { $push: { rawDataRecords: { day: today } } },
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
    Resident.updateOne({ _id: req.params.id, 'rawDataRecords.day': today },
        {
            $push: { 'rawDataRecords.$.records': { timestamp: timestamp, rawData: req.body.rawData } }
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

router.put('/offline/raw/data/record/:id', (req, res, next) => {
    let date = new Date(req.body.date * 1000);
    let records = req.body.records;

    for (var i in records) {
        records[i].timestamp = new Date(records[i].timestamp * 1000);
    }

    // Create today record array if not exist.
    Resident.updateOne({ _id: req.params.id, 'rawDataRecords.day': { "$ne": date } },
        { $push: { rawDataRecords: { day: date } } },
        (err, result) => {
            if (err) {
                console.log('Resident updateOne err: ' + err);
                next(err);
            } else if (result.ok != 0) {
                // Insert record object in today record array.
                Resident.updateOne({ _id: req.params.id, 'rawDataRecords.day': date },
                    {
                        $push: { 'rawDataRecords.$.records': { $each: records } }
                    },
                    (err, result) => {
                        if (err) {
                            console.log('Resident update err: ' + err);
                            next(err);
                        } else if (result.n != 0) {
                            console.log("Resident update result: ", result);
                            res.status(200).json({ length: records.length });
                        }
                        else {
                            console.log("Residen update failed: ", result);
                            res.status(404).end('Resident not found');
                        }
                    }
                );
            }
        }
    );


});


router.put('/sleep/record/:id', (req, res, next) => {
    let timestamp = new Date(req.body.timestamp * 1000);
    let today = new Date(Date.UTC(timestamp.getUTCFullYear(), timestamp.getUTCMonth(), timestamp.getUTCDate()));

    // Create today record array if not exist.
    Resident.updateOne({ _id: req.params.id, 'sleepRecords.day': { "$ne": today } },
        { $push: { sleepRecords: { day: today } } },
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
    Resident.updateOne({ _id: req.params.id, 'sleepRecords.day': today },
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
                res.status(404).end('Resident not found');
            }
        }
    );
});

router.put('/offline/sleep/record/:id', (req, res, next) => {
    let date = new Date(req.body.date * 1000);
    let records = req.body.records;
    console.log("event date " + date);

    for (var i in records) {
        records[i].timestamp = new Date(records[i].timestamp * 1000);
    }

    // Create today record array if not exist.
    Resident.updateOne({ _id: req.params.id, 'sleepRecords.day': { "$ne": date } },
        { $push: { sleepRecords: { day: date } } },
        (err, result) => {
            if (err) {
                console.log('Resident updateOne err: ' + err);
                next(err);
            } else if (result.ok != 0) {
                // Insert record object in today record array.
                Resident.updateOne({ _id: req.params.id, 'sleepRecords.day': date },
                    { $push: { 'sleepRecords.$.records': { $each: records } } },
                    (err, result) => {
                        if (err) {
                            console.log('Resident update err: ' + err);
                            next(err);
                        } else if (result.n != 0) {
                            console.log("Resident update result: ", result);
                            res.status(200).json({ length: records.length });
                        } else {
                            console.log("Resident update failed: ", result);
                            res.status(404).end('Resident not found');
                        }
                    }
                );
            }
        }
    );

});

router.get('/raw/data/record/:id', /*authenticated,*/ async (req, res, next) => {
    let id = mongoose.Types.ObjectId(req.params.id);
    // let start = new Date(req.body.start*1000);
    // let end  = new Date(req.body.end*1000);
    let start = new Date(req.body.start);
    let end = new Date(req.body.end);

    let startDay = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));

    let endDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));


    console.log("id: " + id);
    console.log("start: " + start.toISOString());
    console.log("end: " + end.toISOString());
    console.log("startDay: " + startDay.toISOString());
    console.log("endDay: " + endDay.toISOString());

    let filtered = await Resident.aggregate([
        { $match: { _id: id } },
        {
            $project: {
                "rawDataRecords": {
                    "$filter": {
                        "input": "$rawDataRecords",
                        "cond": {
                            "$and": [
                                { "$gte": ["$$this.day", startDay] },
                                { "$lte": ["$$this.day", endDay] }
                            ]
                        }
                    }
                }
            }
        },
        {
            $project: {
                "rawDataRecords": {
                    "$map": {
                        "input": "$rawDataRecords",
                        "as": "a1",
                        "in": {
                            "records": {
                                "$filter": {
                                    "input": "$$a1.records",
                                    "cond": {
                                        "$and": [
                                            { "$gte": ["$$this.timestamp", start] },
                                            { "$lt": ["$$this.timestamp", end] }
                                        ]
                                    }
                                }

                            }
                        }
                    }
                }
            }
        },
        {
            $unwind: "$rawDataRecords"
        },
        {
            $unwind: "$rawDataRecords.records"
        },
        {
            $group: {
                "_id": null,
                "output": { "$push": "$rawDataRecords.records" }
            }

        }
    ]);

    if (filtered.length > 0) {
        res.status(200).json(filtered[0].output);
    } else {
        res.status(200).json([]);
    }
});

router.get('/raw/data/record/:id/:start/:end', /*authenticated,*/ async (req, res, next) => {
    let id = mongoose.Types.ObjectId(req.params.id);
    let start = new Date(parseInt(req.params.start));
    let end = new Date(parseInt(req.params.end));

    let startDay = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));

    let endDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));


    console.log("id: " + id);
    console.log("start: " + start.toISOString());
    console.log("end: " + end.toISOString());
    console.log("startDay: " + startDay.toISOString());
    console.log("endDay: " + endDay.toISOString());

    let filtered = await Resident.aggregate([
        { $match: { _id: id } },
        {
            $project: {
                "rawDataRecords": {
                    "$filter": {
                        "input": "$rawDataRecords",
                        "cond": {
                            "$and": [
                                { "$gte": ["$$this.day", startDay] },
                                { "$lte": ["$$this.day", endDay] }
                            ]
                        }
                    }
                }
            }
        },
        {
            $project: {
                "rawDataRecords": {
                    "$map": {
                        "input": "$rawDataRecords",
                        "as": "a1",
                        "in": {
                            "records": {
                                "$filter": {
                                    "input": "$$a1.records",
                                    "cond": {
                                        "$and": [
                                            { "$gte": ["$$this.timestamp", start] },
                                            { "$lt": ["$$this.timestamp", end] }
                                        ]
                                    }
                                }

                            }
                        }
                    }
                }
            }
        },
        {
            $unwind: "$rawDataRecords"
        },
        {
            $unwind: "$rawDataRecords.records"
        },
        {
            $group: {
                "_id": null,
                "output": { "$push": "$rawDataRecords.records" }
            }

        }
    ]);

    if (filtered.length > 0) {
        res.status(200).json(filtered[0].output);
    } else {
        res.status(200).json([]);
    }
});

router.get('/sleep/record/:id', /*authenticated,*/ async (req, res, next) => {
    let id = mongoose.Types.ObjectId(req.params.id);
    // let start = new Date(req.body.start*1000);
    // let end  = new Date(req.body.end*1000);
    let start = new Date(req.body.start);
    let end = new Date(req.body.end);

    let startDay = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));

    let endDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));


    console.log("id: " + id);
    console.log("start: " + start.toISOString());
    console.log("end: " + end.toISOString());
    console.log("startDay: " + startDay.toISOString());
    console.log("endDay: " + endDay.toISOString());

    let filtered = await Resident.aggregate([
        { $match: { _id: id } },
        {
            $project: {
                "sleepRecords": {
                    "$filter": {
                        "input": "$sleepRecords",
                        "cond": {
                            "$and": [
                                { "$gte": ["$$this.day", startDay] },
                                { "$lte": ["$$this.day", endDay] }
                            ]
                        }
                    }
                }
            }
        },
        {
            $project: {
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
                                            { "$gte": ["$$this.timestamp", start] },
                                            { "$lt": ["$$this.timestamp", end] }
                                        ]
                                    }
                                }

                            }
                        }
                    }
                }
            }
        },
        {
            $unwind: "$sleepRecords"
        },
        {
            $unwind: "$sleepRecords.records"
        },
        {
            $group: {
                "_id": null,
                "output": { "$push": "$sleepRecords.records" }
            }

        }
    ]);

    if (filtered.length > 0) {
        res.status(200).json(filtered[0].output);
    } else {
        res.status(200).json([]);
    }
});

router.get('/sleep/record/:id/:start/:end', /*authenticated,*/ async (req, res, next) => {
    let id = mongoose.Types.ObjectId(req.params.id);
    let start = new Date(parseInt(req.params.start));
    let end = new Date(parseInt(req.params.end));

    let startDay = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));

    let endDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));


    console.log("id: " + id);
    console.log("start: " + start.toISOString());
    console.log("end: " + end.toISOString());
    console.log("startDay: " + startDay.toISOString());
    console.log("endDay: " + endDay.toISOString());

    let filtered = await Resident.aggregate([
        { $match: { _id: id } },
        {
            $project: {
                "sleepRecords": {
                    "$filter": {
                        "input": "$sleepRecords",
                        "cond": {
                            "$and": [
                                { "$gte": ["$$this.day", startDay] },
                                { "$lte": ["$$this.day", endDay] }
                            ]
                        }
                    }
                }
            }
        },
        {
            $project: {
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
                                            { "$gte": ["$$this.timestamp", start] },
                                            { "$lt": ["$$this.timestamp", end] }
                                        ]
                                    }
                                }

                            }
                        }
                    }
                }
            }
        },
        {
            $unwind: "$sleepRecords"
        },
        {
            $unwind: "$sleepRecords.records"
        },
        {
            $group: {
                "_id": null,
                "output": { "$push": "$sleepRecords.records" }
            }

        }
    ]);

    if (filtered.length > 0) {
        res.status(200).json(filtered[0].output);
    } else {
        res.status(200).json([]);
    }
});

router.put('/vital/signs/record/:id', (req, res, next) => {
    console.log("put vital/signs/record");
    let timestamp = new Date(req.body.timestamp * 1000);
    console.log('timestamp: ' + timestamp);
    let today = new Date(Date.UTC(timestamp.getUTCFullYear(), timestamp.getUTCMonth(), timestamp.getUTCDate()));

    // Create today record array if not exist.
    Resident.updateOne({ _id: req.params.id, 'vitalSignsRecords.day': { "$ne": today } },
        { $push: { vitalSignsRecords: { day: today } } },
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

    console.log("id: " + id);
    console.log("start: " + start.toISOString());
    console.log("end: " + end.toISOString());
    console.log("startDay: " + startDay.toISOString());
    console.log("endDay: " + endDay.toISOString());

    let filtered = await Resident.aggregate([
        { $match: { _id: id } },
        {
            $project: {
                "vitalSignsRecords": {
                    "$filter": {
                        "input": "$vitalSignsRecords",
                        "cond": {
                            "$and": [
                                { "$gte": ["$$this.day", startDay] },
                                { "$lte": ["$$this.day", endDay] }
                            ]
                        }
                    }
                }
            }
        },
        {
            $project: {
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
                                            { "$gte": ["$$this.timestamp", start] },
                                            { "$lt": ["$$this.timestamp", end] }
                                        ]
                                    }
                                }

                            }
                        }
                    }
                }
            }
        },
        {
            $unwind: "$vitalSignsRecords"
        },
        {
            $unwind: "$vitalSignsRecords.records"
        },
        {
            $group: {
                "_id": null,
                "output": { "$push": "$vitalSignsRecords.records" }
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

    console.log("id: " + id);
    console.log("start: " + start.toISOString());
    console.log("end: " + end.toISOString());
    console.log("startDay: " + startDay.toISOString());
    console.log("endDay: " + endDay.toISOString());

    let filtered = await Resident.aggregate([
        { $match: { _id: id } },
        {
            $project: {
                "vitalSignsRecords": {
                    "$filter": {
                        "input": "$vitalSignsRecords",
                        "cond": {
                            "$and": [
                                { "$gte": ["$$this.day", startDay] },
                                { "$lte": ["$$this.day", endDay] }
                            ]
                        }
                    }
                }
            }
        },
        {
            $project: {
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
                                            { "$gte": ["$$this.timestamp", start] },
                                            { "$lt": ["$$this.timestamp", end] }
                                        ]
                                    }
                                }

                            }
                        }
                    }
                }
            }
        },
        {
            $unwind: "$vitalSignsRecords"
        },
        {
            $unwind: "$vitalSignsRecords.records"
        },
        {
            $group: {
                "_id": null,
                "output": { "$push": "$vitalSignsRecords.records" }
            }

        }
    ]);

    if (filtered.length > 0) {
        res.status(200).json(filtered[0].output);
    } else {
        res.status(200).end([]);
    }
});

var schedule = require('node-schedule');

function scheduleCronstyle() {
    schedule.scheduleJob('0 0 0 * * *', () => {
        console.log('scheduleCronstyle:' + new Date());
        expireTime = new Date() - 3 * 365 * 24 * 60 * 60 * 1000;  // 3 years
        Resident.updateMany({ 'vitalSignsRecords.0': { $exists: true } },
            {
                $pull: { vitalSignsRecords: { day: { $lt: expireTime } } }
            }, (err, result) => {
                if (err)
                    console.log(err);
                else
                    console.log("Delete expired record result: ", result);
            });
        Resident.updateMany({ 'rawDataRecords.0': { $exists: true } },
            {
                $pull: { rawDataRecords: { day: { $lt: expireTime } } }
            }, (err, result) => {
                if (err)
                    console.log(err);
                else
                    console.log("Delete expired record result: ", result);
            });
        Resident.updateMany({ 'sleepRecords.0': { $exists: true } },
            {
                $pull: { sleepRecords: { day: { $lt: expireTime } } }
            }, (err, result) => {
                if (err)
                    console.log(err);
                else
                    console.log("Delete expired record result: ", result);
            });
    });
}

scheduleCronstyle();

module.exports = router;