const mongoClient = require('../utils/db');

const documentSchema = new mongoClient.client.Schema({
  conversationId: {
    type: mongoClient.client.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
  sender: {
    type: String,
    enum: ["user", "bot"],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Message = mongoClient.client.model("Message", messageSchema);

module.exports = Message;