const mongoClient = require('../utils/db');
const bcrypt = require('bcrypt');

//create the user schema
const userSchema = new mongoClient.client.Schema({
    password :{
        type: String,
        required: true
    },
    email :{
        type: String,
        required: true
    }
})

userSchema.pre('save', async function(next) {
    if(!this.isModified(password)) {
        return next()
    }
    this.password = await bcrypt.hash(this.password, 12);
    next();
})


const User = mongoClient.model('User', userSchema);
module.exports = User;