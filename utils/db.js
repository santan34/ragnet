const mongoose = require('mongoose')

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 27017;
const dbName = process.env.DB_NAME || 'test';
mongoose.connect(`mongodb://${host}:${port}/${dbName}`)
.then(() => {
        console.log('Connected to the database');
}).catch(err => {
    console.log('Error connecting to the database ', err);
});


module.exports = mongoose;