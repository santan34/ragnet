const mongoClient = require('../utils/db');

const conversationSchema = new mongoClient.client.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  botId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bot",
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "ended"],
    default: "active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Conversation = mongoClient.client.model("Conversation", conversationSchema);

module.exports = Conversation;