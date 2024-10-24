const Conversation = require("../models/conversations");
const Message = require("../models/messages");
const Bot = require("../models/bots");
const sendMessage = require('../utils/chatFunctionality');

/**
 * Controller handling chat-related operations
 */
class ChatController {
  /**
   * Initiates a new chat session with a bot
   * @param {Object} req - Express request object containing botId
   * @param {Object} res - Express response object
   */
  static async initiateChat(req, res) {
    const { botId } = req;

    try {
      const bot = await Bot.findById(botId);
      if (!bot) {
        return res.status(404).json({ error: "Bot not found" });
      }

      const conversation = new Conversation({ botId });
      await conversation.save();

      return res.status(200).json({ 
        chatId: conversation._id, 
        message: "Chat initiated successfully" 
      });
    } catch (error) {
      return res.status(500).json({ 
        error: `Internal server error: ${error.message}` 
      });
    }
  }

  /**
   * Handles sending messages in a chat session
   * @param {Object} req - Express request object containing botId, chatId, and message
   * @param {Object} res - Express response object
   */
  static async sendMessage(req, res) {
    const { botId } = req;
    const { chatId } = req.params;
    const { message } = req.body;

    // Input validation
    if (!chatId) {
      return res.status(400).json({ error: 'Chat ID is required' });
    }
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Message is required and must be a non-empty string' 
      });
    }

    try {
      // Verify conversation exists
      const conversation = await Conversation.findById(chatId);
      if (!conversation) {
        return res.status(404).json({ error: "Chat not found" });
      }

      // Save user message
      const newMessage = new Message({ 
        conversationId: chatId, 
        sender: "user", 
        message 
      });
      await newMessage.save();

      // Get bot response
      const bot = await Bot.findById(botId);
      if (!bot) {
        return res.status(404).json({ error: "Bot not found" });
      }

      const result = await sendMessage(message, chatId, bot.botName);
      
      // Handle different response scenarios
      if (result.status === 404) {
        return res.status(404).json({
          error: "Chat information not found"
        });
      }

      if (result.error) {
        return res.status(result.status || 500).json({ 
          error: result.error 
        });
      }

      // Save bot response
      const botMessageContent = result.chatResponse || result.message;
      const botMessage = new Message({
        conversationId: chatId,
        sender: "bot",
        message: botMessageContent
      });
      await botMessage.save();

      return res.status(200).json({
        message,
        response: botMessageContent
      });
    } catch (error) {
      return res.status(500).json({
        error: `Internal server error: ${error.message}`
      });
    }
  }

  /**
   * Retrieves chat history for a given conversation
   * @param {Object} req - Express request object containing chatId
   * @param {Object} res - Express response object
   */
  static async getChatHistory(req, res) {
    const { chatId } = req.params;

    if (!chatId) {
      return res.status(400).json({ error: 'Chat ID is required' });
    }

    try {
      const messages = await Message.find({ conversationId: chatId })
        .sort({ createdAt: 1 });
      return res.status(200).json({ messages });
    } catch (error) {
      return res.status(500).json({ 
        error: `Internal server error: ${error.message}` 
      });
    }
  }

  /**
   * Ends a chat session
   * @param {Object} req - Express request object containing chatId
   * @param {Object} res - Express response object
   */
  static async endChat(req, res) {
    const { chatId } = req.params;

    if (!chatId) {
      return res.status(400).json({ error: 'Chat ID is required' });
    }

    try {
      const conversation = await Conversation.findById(chatId);
      if (!conversation) {
        return res.status(404).json({ error: "Chat not found" });
      }

      conversation.status = "ended";
      await conversation.save();

      return res.status(200).json({ message: "Chat ended successfully" });
    } catch (error) {
      return res.status(500).json({ 
        error: `Internal server error: ${error.message}` 
      });
    }
  }

  /**
   * Retrieves the current status of a chat session
   * @param {Object} req - Express request object containing chatId
   * @param {Object} res - Express response object
   */
  static async getChatStatus(req, res) {
    const { chatId } = req.params;

    if (!chatId) {
      return res.status(400).json({ error: 'Chat ID is required' });
    }

    try {
      const conversation = await Conversation.findById(chatId);
      if (!conversation) {
        return res.status(404).json({ error: "Chat not found" });
      }

      return res.status(200).json({ status: conversation.status });
    } catch (error) {
      return res.status(500).json({ 
        error: `Internal server error: ${error.message}` 
      });
    }
  }

  /**
   * Retrieves information about a specific bot
   * @param {Object} req - Express request object containing botId
   * @param {Object} res - Express response object
   */
  static async getBotInfo(req, res) {
    const { botId } = req.params;

    try {
      const bot = await Bot.findById(botId);
      if (!bot) {
        return res.status(404).json({ error: "Bot not found" });
      }

      return res.status(200).json({ 
        botInfo: { 
          name: bot.name, 
          description: bot.description 
        } 
      });
    } catch (error) {
      return res.status(500).json({ 
        error: `Internal server error: ${error.message}` 
      });
    }
  }

  /**
   * Restarts a chat session by clearing its messages
   * @param {Object} req - Express request object containing chatId
   * @param {Object} res - Express response object
   */
  static async restartChat(req, res) {
    const { chatId } = req.body;

    if (!chatId) {
      return res.status(400).json({ error: 'Chat ID is required' });
    }

    try {
      const conversation = await Conversation.findById(chatId);
      if (!conversation) {
        return res.status(404).json({ error: "Chat not found" });
      }

      conversation.messages = [];
      await conversation.save();

      return res.status(200).json({ message: "Chat restarted successfully" });
    } catch (error) {
      return res.status(500).json({ 
        error: `Internal server error: ${error.message}` 
      });
    }
  }
}

module.exports = ChatController;