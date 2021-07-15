const mongoose = require('mongoose');
var uri = "mongodb://localhost:27017/test";
if (process.env.NODE_ENV == "prod") {
    uri = "mongodb://mongo:27017/test";
}

mongoose.connect(uri, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
})
.then(() => console.log('DB Connected!'))
.catch(err => {
    console.log('Connection failed!')
});