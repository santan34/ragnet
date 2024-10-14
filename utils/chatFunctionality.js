//use the query functionality in chroma.js
//use openai to turn the query into a meaning full answer
const { queryCollection } = require('../utils/chroma');
const openai = require('openai'); // Make sure to configure OpenAI client

class ChatController {
  static async sendMessage(req, res) {
    const { chatId, message } = req.body;
    try {
      // Query the collection using the botName and searchText
      const botName = "exampleBot"; // Replace with actual bot name
      const queryResults = await queryCollection(botName, message);

      // Use OpenAI to generate a meaningful response
      const openaiResponse = await openai.Completion.create({
        model: "text-davinci-003", // Replace with the appropriate model
        prompt: `Based on the following documents: ${JSON.stringify(queryResults)}, respond to the user's message: "${message}"`,
        max_tokens: 150,
      });

      const botResponse = openaiResponse.choices[0].text.trim();

      // Respond with the user's message and the bot's response
      res.status(200).json({ message, response: botResponse });
    } catch (error) {
      res.status(500).json({ error: `Internal server error: ${error}` });
    }
  }
}

module.exports = ChatController;