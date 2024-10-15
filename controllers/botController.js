const { botValidationSchema } = require("../utils/joi");
const Bot = require("../models/bots");
const User = require("../models/users");
const Document = require("../models/documents");

class BotController {
  static async createBot(req, res) {
    const { name, description } = req.body;
    //verifiied route
    const userId = req.userId;
    //validate everything
    const toValidate = { name, description };
    const { error } = botValidationSchema.validate(toValidate);
    if (error) {
      return res.status(400).json({
        error: error.details[0].message,
      });
    }
    try {
      const user = await User.findById(userId).populate("bots");
      const existingBot = user.bots.find((bot) => {
        console.log(`Comparing bot name: ${bot.botName} with name: ${name}`);
        return bot.botName === name;
      });
      if (existingBot) {
        return res.status(400).json({
          error: "Bot with the same name already exists",
        });
      }
      const botDetails = {
        botName: name,
        botDescription: description,
        createdAt: new Date(),
      };
      const newBot = new Bot(botDetails);
      const savedBot = await newBot.save();
      user.bots.push(savedBot._id);
      await user.save();
      return res.status(200).json({
        message: "Bot created successfully",
        bot: savedBot,
        user: user
      });
    } catch (error) {
      return res.status(500).json({
        error: `Internal server error: ${error}`,
      });
    }
  }

  static async deleteBot(req, res) {
    try {
      const userId = req.userId;
      const { botId } = req.params;
      //validation
      // Find the user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          error: "User does not have access to this bot",
        });
      }

      // Check if the bot exists in the user's bots array
      const botIndex = user.bots.indexOf(botId);
      if (botIndex === -1) {
        return res.status(404).json({
          error: "Bot not found",
        });
      }

      // Remove the bot from the user's bots array
      user.bots.splice(botIndex, 1);
      await user.save();

      // Delete the bot from the database
      await Bot.findByIdAndDelete(botId);
      return res.status(200).json({
        message: "Bot deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        error: `Internal server error: ${error}`,
      });
    }
  }

  static async getBot(req, res) {
    try {
      const { botId } = req.params;
      const userId = req.userId;
      //add validation
      //include length of mongoose id
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          error: "User does not have acces to this bot",
        });
      }
      const bot = await Bot.findById(botId);
      if (!bot) {
        return res.status(404).json({ error: "Bot not found" });
      }
      return res.status(200).json(bot);
    } catch (error) {
      return res.status(500).json({ error: `Internal server error: ${error}` });
    }
  }
  
  //is faulty
  static async updateBot(req, res) {
    try {
      const { botId } = req.params;
      const userId = req.userId;
      const { name, description } = req.body;
      //validate
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          error: "User does not have acces to this bot",
        });
      }
  
      const bot = await Bot.findByIdAndUpdate(
        botId,
        { botName: name,
          botDescription: description
        },
        { new: true }
      );

      if (!bot) {
        return res.status(404).json({ error: "Bot not found" });
      }

      return res.status(200).json(bot);
    } catch (error) {
      return res.status(500).json({ error: `Internal server error: ${error}` });
    }
  }
}

module.exports = BotController;
