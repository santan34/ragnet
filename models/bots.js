const mongoClient = require("../utils/db");

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
      ref: "Document",
    },
  ],
  botEmbeddings: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
  },
});

const Bot = mongoClient.model("Bot", botSchema);
module.exports = Bot;
