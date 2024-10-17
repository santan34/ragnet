//use the query functionality in chroma.js
//use openai to turn the query into a meaning full answer
const embeddingClient = require('../utils/chroma');
// Make sure totio configure OpenAI client
require('dotenv').config();
const { OpenAI } = require('openai');
let openai;


try{
  openai = new OpenAI({
    apiKey:  process.env.OPEN_API_KEY// Make sure this environment variable is set
  });
}catch (error) {
  console.error("Error initialising Openai client");
  throw new Error('failed to initialize openAI client');
}

async function sendMessage(messageText, chatID, botName) {
    try {
      // Query the collection using the botName and searchText
      const queryResults = await embeddingClient.queryCollection(botName, messageText);
      console.log(".........................................");
      console.log(queryResults)
      if (!queryResults || !queryResults.documents || !queryResults.documents.length === 0) {
        console.log('mmm ndanda')
        return {
          error: "No relevant information found for the query",
          status: 404
        };
      }
      // Use OpenAI to generate a meaningful response
    const context = queryResults.documents.join('\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-16k',
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant. Answer questions to your best ability.'
        },
        {
          role: 'user',
          content: `Answer the following question using the provided context. If you cannot answer the question with the context, just say you need more context.
          Question: ${messageText}
          Context: ${context}`
        }
      ]
    });
    console.log(response)
    const botResponse = response.choices[0].message.content.trim();
    
    console.log(
      `Answer: ${botResponse}`
    );

    // const openaiResponse = await openai.createCompletion({
    //   model: "text-davinci-003",
    //   prompt: `Based on the following documents: ${JSON.stringify(queryResults)}, respond to the user's message: "${messageText}"`,
    //   max_tokens: 150
    // });

    //const alternativeBotResponse = openaiResponse.data.choices[0].text.trim();
    // Return both responses
    return {
      message: messageText,
      chatResponse: botResponse,
    };
    } catch (error) {
      console.error("Error in sendMessage:", error);
      return {
        error: `Internal server error: ${error.message}`,
        status: 500
      };
    }
}


module.exports = sendMessage;