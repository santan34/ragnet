const Conversation = require("../models/conversations");
const Message = require("../models/messages");
const Bot = require("../models/bots");

class ChatController {
  static async initiateChat(req, res) {
    const { userId, botId } = req.body;
    //??
    try {
      const bot = await Bot.findById(botId);
      if (!bot) {
        return res.status(404).json({ error: "Bot not found" });
      }
      const conversation = new Conversation({ userId, botId });
      await conversation.save();
      return res.status(200).json({ chatId: conversation._id, message: "Chat initiated successfully" });
    } catch (error) {
      return res.status(500).json({ error: `Internal server error: ${error}` });
    }
  }

  static async sendMessage(req, res) {
    const { chatId, message } = req.body;
    try {
      const conversation = await Conversation.findById(chatId);
      if (!conversation) {
        return res.status(404).json({ error: "Chat not found" });
      }
      const newMessage = new Message({ conversationId: chatId, sender: "user", message });
      await newMessage.save();
      // Here you would call your chatbot's response logic
      const botResponse = "This is a placeholder response from the bot.";
      const botMessage = new Message({ conversationId: chatId, sender: "bot", message: botResponse });
      await botMessage.save();
      return res.status(200).json({ message, response: botResponse });
    } catch (error) {
      return res.status(500).json({ error: `Internal server error: ${error}` });
    }
  }

  static async getChatHistory(req, res) {
    const { chatId } = req.query;
    try {
      const messages = await Message.find({ conversationId: chatId }).sort({ createdAt: 1 });
      return res.status(200).json({ messages });
    } catch (error) {
      return res.status(500).json({ error: `Internal server error: ${error}` });
    }
  }

  static async endChat(req, res) {
    const { chatId } = req.body;
    try {
      const conversation = await Conversation.findById(chatId);
      if (!conversation) {
        return res.status(404).json({ error: "Chat not found" });
      }
      conversation.status = "ended";
      await conversation.save();
      return res.status(200).json({ message: "Chat ended successfully" });
    } catch (error) {
      return res.status(500).json({ error: `Internal server error: ${error}` });
    }
  }
  static async getChatStatus(req, res) {
    const { chatId } = req.query;
    try {
      const conversation = await Conversation.findById(chatId);
      if (!conversation) {
        return res.status(404).json({ error: "Chat not found" });
      }
      return res.status(200).json({ status: conversation.status });
    } catch (error) {
      return res.status(500).json({ error: `Internal server error: ${error}` });
    }
  }

  static async getBotInfo(req, res) {
    const { botId } = req.query;
    try {
      const bot = await Bot.findById(botId);
      if (!bot) {
        return res.status(404).json({ error: "Bot not found" });
      }
      return res.status(200).json({ botInfo: { name: bot.name, description: bot.description } });
    } catch (error) {
      return res.status(500).json({ error: `Internal server error: ${error}` });
    }
  }

  static async restartChat(req, res) {
    const { chatId } = req.body;
    try {
      const conversation = await Conversation.findById(chatId);
      if (!conversation) {
        return res.status(404).json({ error: "Chat not found" });
      }
      conversation.messages = [];
      await conversation.save();
      return res.status(200).json({ message: "Chat restarted successfully" });
    } catch (error) {
      return res.status(500).json({ error: `Internal server error: ${error}` });
    }
  }
}

module.exports = ChatController;