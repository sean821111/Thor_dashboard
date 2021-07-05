var mqtt = require('mqtt');
var Resident = require('../database/models/resident')
var opt = {
    port: 1883,
    clientId: 'backend'
}

var client = mqtt.connect('tcp://localhost', opt);

client.on('connect', function () {
    console.log('已連接至MQTT伺服器');
    client.subscribe("backend/test");
});



client.on('message', function (topic, msg) { 
    if (topic === 'backend/test') {
        data = JSON.parse(msg.toString());
        // new Data({
        //     turnOverTimes: data.turnOverTimes,
        //     getInBedTime: new Date(data.getInBedTime * 1000),
        //     getOutOffBedTime: new Date(data.getOutOffBedTime * 1000)
        // }).save();
    }
    console.log('收到 ' + topic + ' 主題，訊息：' + msg.toString());
});
