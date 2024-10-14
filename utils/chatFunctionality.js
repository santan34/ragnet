//use the query functionality in chroma.js
//use openai to turn the query into a meaning full answer
const { queryCollection } = require('../utils/chroma');
const openai = require('openai'); // Make sure to configure OpenAI client


async sendMessage(messageText, chatID, botName) {
    try {
      // Query the collection using the botName and searchText
      const queryResults = await queryCollection(botName, message);

      // Use OpenAI to generate a meaningful response
      const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo-16k-0613',
          temperature: 0,
          messages: [
            {
              role: 'assistant',
              content:
                'You are a helpful AI assistant. Answser questions to your best ability.',
            },
            {
              role: 'user',
              content: `Answer the following question using the provided context. If you cannot answer the question with the context. Just say you need more context.
              Question: ${messageText}
        
              Context: ${results.map((r) => r.pageContent).join('\n')}`,
            },
          ],
        })
        console.log(
          `Answer: ${response.choices[0].message.content}\n\nSources: ${results
            .map((r) => r.metadata.source)
            .join(', ')}`
        )
      }
      const openaiResponse = await openai.Completion.create({
        model: "text-davinci-003", // Replace with the appropriate model
        prompt: `Based on the following documents: ${JSON.stringify(queryResults)}, respond to the user's message: "${message}"`,
      });

      const botResponse = openaiResponse.choices[0].text.trim();

      // Respond with the user's message and the bot's response
      res.status(200).json({ message, response: botResponse });
    } catch (error) {
      res.status(500).json({ error: `Internal server error: ${error}` });
    }
}


module.exports = ChatController;