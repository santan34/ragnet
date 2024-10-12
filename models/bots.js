const e = require('express');
const mongoClient = require('../utils/db');

const botSchema = new mongoClient.client.Schema({
  botName: {
    type: String,
    required: true,
  },
  botDescription: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  botDocuments: [
    {
      type: mongoClient.client.Schema.Types.ObjectId,
      ref: 'Document',
    },
  ],
  //link to a collection of embeddings
  botEmbeddings: [embeddngSchema],
});

const Bot = mongoClient.client.model('Bot', botSchema);
module.exports = Bot;
