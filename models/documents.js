const mongoose = require('../utils/db');

const documentSchema = new mongoose.Schema({
    documentName: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    type:{
        type: String,
        required: true,
    },
    size:{
        type: Number,
        required: true,
    },
    path:{
        type: String,
        required: true,
    }
})

const Document = mongoose.model('Document', documentSchema);
module.exports = Document;