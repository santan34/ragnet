const Conversation = require('../models/conversations');
const Message = require('../models/messages');
const Bot = require('../models/bots');
const sendMessage = require('../utils/chatFunctionality');

class ChatController {
  //controller for handling chats

  //start a new chart
  static async initiateChat(req, res) {
    const botId = req.botId;
    try {
      const bot = await Bot.findById(botId);
      if (!bot) {
        return res.status(404).json({ error: 'Bot not found' });
      }
      const conversation = new Conversation({ botId });
      await conversation.save();
      return res.status(200).json({
        chatId: conversation._id,
        message: 'Chat initiated successfully',
      });
    } catch (error) {
      return res.status(500).json({ error: `Internal server error: ${error}` });
    }
  }

  //send messange to the bot
  static async sendMessage(req, res) {
    const botId = req.botId;
    const { chatId } = req.params;
    const { message } = req.body;
    if (!chatId) {
      return res.status(400).json({ error: 'Chat ID is required' });
    }
    if (!message || typeof message !== 'string') {
      return res
        .status(400)
        .json({ error: 'Message is required and must be a non-empty string' });
    }
    try {
      console.log('pppppppppppppppppppppppppp');
      const conversation = await Conversation.findById(chatId);
      console.log(conversation);
      if (!conversation) {
        return res.status(404).json({ error: 'Chat not found' });
      }
      const newMessage = new Message({
        conversationId: chatId,
        sender: 'user',
        message,
      });
      await newMessage.save();
      console.log(newMessage);
      // Here you would call your chatbot's response logic
      console.log();
      const bot = await Bot.findById(botId);
      if (!bot) {
        return res.status(404).json({ error: 'Bot not found' });
      }
      const result = await sendMessage(message, chatId, bot.botName);
      if (result.status === 404) {
        return res.status(404).json({
          error: 'chat information not found',
        });
      }

      if (result.error) {
        return res.status(result.status || 500).json({ error: result.error });
      }
      const botMessageContent = result.chatResponse || result.message;
      const botMessage = new Message({
        conversationId: chatId,
        sender: 'bot',
        message: botMessageContent,
      });
      await botMessage.save();
      return res.status(200).json({
        message,
        response: botMessageContent,
      });
    } catch (error) {
      return res.status(500).json({
        error: `Internal server error: ${error}`,
      });
    }
  }

  //get chat history
  static async getChatHistory(req, res) {
    const { chatId } = req.params;
    if (!chatId) {
      return res.status(400).json({ error: 'Chat ID is required' });
    }
    try {
      const messages = await Message.find({ conversationId: chatId }).sort({
        createdAt: 1,
      });
      return res.status(200).json({ messages });
    } catch (error) {
      return res.status(500).json({ error: `Internal server error: ${error}` });
    }
  }

  //end a chat
  static async endChat(req, res) {
    const { chatId } = req.params;
    if (!chatId) {
      return res.status(400).json({ error: 'Chat ID is required' });
    }
    try {
      const conversation = await Conversation.findById(chatId);
      if (!conversation) {
        return res.status(404).json({ error: 'Chat not found' });
      }
      conversation.status = 'ended';
      await conversation.save();
      return res.status(200).json({ message: 'Chat ended successfully' });
    } catch (error) {
      return res.status(500).json({ error: `Internal server error: ${error}` });
    }
  }

  //get the chat status
  static async getChatStatus(req, res) {
    const { chatId } = req.params;
    if (!chatId) {
      return res.status(400).json({ error: 'Chat ID is required' });
    }
    try {
      const conversation = await Conversation.findById(chatId);
      if (!conversation) {
        return res.status(404).json({ error: 'Chat not found' });
      }
      return res.status(200).json({ status: conversation.status });
    } catch (error) {
      return res.status(500).json({ error: `Internal server error: ${error}` });
    }
  }

  //get information about a bot
  static async getBotInfo(req, res) {
    const { botId } = req.params;
    try {
      const bot = await Bot.findById(botId);
      if (!bot) {
        return res.status(404).json({ error: 'Bot not found' });
      }
      return res
        .status(200)
        .json({ botInfo: { name: bot.name, description: bot.description } });
    } catch (error) {
      return res.status(500).json({ error: `Internal server error: ${error}` });
    }
  }

  static async restartChat(req, res) {
    const { chatId } = req.body;
    try {
      const conversation = await Conversation.findById(chatId);
      if (!conversation) {
        return res.status(404).json({ error: 'Chat not found' });
      }
      conversation.messages = [];
      await conversation.save();
      return res.status(200).json({ message: 'Chat restarted successfully' });
    } catch (error) {
      return res.status(500).json({ error: `Internal server error: ${error}` });
    }
  }
}

module.exports = ChatController;
