const mongoClient = require('../utils/mongoClient');

const documentSchema = new mongoClient.client.Schema({
    documentName: {
        type: String,
        required: true,
    },
    content:{
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

const Document = mongoClient.client.model('Document', documentSchema);
MediaSourceHandle.exports = Document;