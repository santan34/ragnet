const { botValidationSchema, requestBodyValidationSchema } = require("../utils/joi");
const Bot = require("../models/bots");
const User = require("../models/users");
const jwt = require("jsonwebtoken");

// Environment configuration with defaults
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET_2 || "getishjdtrerfghuytfdcfv-i dighggytr", 
  expiresIn: process.env.JWT_LIFESPAN || "24000h"
};


/**
 * Creates a JWT token for bot authentication
 * @param {string} botId - The ID of the bot
 * @returns {string} JWT token
 */
const createToken = (botId) => {
  return jwt.sign({ botId }, JWT_CONFIG.secret, { expiresIn: JWT_CONFIG.expiresIn });
};


class BotController {
  /**
   * Creates a new bot for a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async createBot(req, res) {
    const { name, description } = req.body;
    const userId = req.userId;

    // Validate input
    try {
      const { error } = botValidationSchema.validate({ name, description });
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
      const user = await User.findById(userId).populate("bots");
      const existingBot = user.bots.find(bot => bot.botName === name);
      if (existingBot) {
        return res.status(400).json({ error: "Bot with the same name already exists" });
      }

      // Create and save new bot
      const newBot = new Bot({
        botName: name,
        botDescription: description,
        createdAt: new Date()
      });
      const savedBot = await newBot.save();
      user.bots.push(savedBot._id);
      await user.save();

      return res.status(200).json({
        message: "Bot created successfully",
        bot: savedBot,
        user
      });
    } catch (error) {
      return res.status(500).json({ error: `Internal server error: ${error.message}` });
    }
  }


  /**
   * Deletes a bot and removes it from user's bot list
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async deleteBot(req, res) {
    const { botId } = req.params;
    const userId = req.userId;

    if (!botId) {
      return res.status(400).json({ error: "Bot ID is required" });
    }

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const botIndex = user.bots.indexOf(botId);
      if (botIndex === -1) {
        return res.status(404).json({ error: "Bot not found in user's collection" });
      }

      // Remove bot from user's collection and delete it
      user.bots.splice(botIndex, 1);
      await Promise.all([
        user.save(),
        Bot.findByIdAndDelete(botId)
      ]);

      return res.status(200).json({ message: "Bot deleted successfully" });
    } catch (error) {
      return res.status(500).json({ error: `Internal server error: ${error.message}` });
    }
  }


  /**
   * Retrieves a specific bot's details
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getBot(req, res) {
    const { botId } = req.params;
    const userId = req.userId;

    if (!botId) {
      return res.status(400).json({ error: "Bot ID is required" });
    }

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const bot = await Bot.findById(botId);
      if (!bot) {
        return res.status(404).json({ error: "Bot not found" });
      }

      return res.status(200).json(bot);
    } catch (error) {
      return res.status(500).json({ error: `Internal server error: ${error.message}` });
    }
  }


  /**
   * Updates bot details
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async updateBot(req, res) {
    const { botId } = req.params;
    const userId = req.userId;
    const { name, description } = req.body;

    if (!botId) {
      return res.status(400).json({ error: "Bot ID is required" });
    }

    try {
      // Validate request body
      const { error } = requestBodyValidationSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      // Verify user exists and has access
      const user = await User.findById(userId);
      if (!user || !user.bots.includes(botId)) {
        return res.status(404).json({ error: "User not found or doesn't have access to this bot" });
      }

      // Update bot
      const bot = await Bot.findByIdAndUpdate(
        botId,
        { 
          botName: name,
          botDescription: description 
        },
        { new: true }
      );

      if (!bot) {
        return res.status(404).json({ error: "Bot not found" });
      }

      return res.status(200).json(bot);
    } catch (error) {
      return res.status(500).json({ error: `Internal server error: ${error.message}` });
    }
  }

  
  /**
   * Generates an access token for a bot
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async generateBotAccessToken(req, res) {
    const { botId } = req.params;
    const userId = req.userId;

    if (!botId) {
      return res.status(400).json({ error: "Bot ID is required" });
    }

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Verify bot exists and belongs to user
      const bot = await Bot.findById(botId);
      if (!bot || !user.bots.includes(botId)) {
        return res.status(404).json({ error: "Bot not found or user doesn't have access" });
      }

      const token = createToken(botId);

      return res.status(200).json({
        message: "Bot access token generated successfully",
        token,
        botId
      });
    } catch (error) {
      return res.status(500).json({ error: `Internal server error: ${error.message}` });
    }
  }
}

module.exports = BotController;
