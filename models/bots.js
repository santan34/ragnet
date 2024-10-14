const mongoose = require('../utils/db');

const botSchema = new mongoose.Schema({
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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
    },
  ],
});

const Bot = mongoose.model('Bot', botSchema);
module.exports = Bot;
