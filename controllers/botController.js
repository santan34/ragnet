const { botValidationSchema } = require("../utils/joi");
const Bot = require("../models/bots");
const User = require("../models/users");
const Document = require("../models/documents");

class BotController {
  constructor() {}
  async createBot(req, res) {
    const { name, description } = req.body;
    const userId = req.userId;
    const toValidate = { name, description };
    const { error } = botValidationSchema.validate(toValidate);
    if (error) {
      res.status(400).json({
        error: error.details[0].message,
      });
      return;
    }
    try {
      const user = await User.findById(userId).populate("bots");
      const existingBot = user.bots.find((bot) => bot.name === name);
      if (existingBot) {
        res.status(400).json({
          error: "Bot with the same name  already exists",
        });
        return;
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
      res.status(200).json({
        message: "Bot created successfully",
        bot: savedBot,
      });
      return;
    } catch (error) {
      res.status(500).json({
        error: `Internal server error: ${error}`,
      });
      return;
    }
  }
}
