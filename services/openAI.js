const { Configuration, OpenAIApi } = require('openai');
const dotenv = require('dotenv');
dotenv.config();
//configuraton for the openai api
const configuration = new Configuration({
  apiKey: process.OPEN_API_KEY,
});

const openai = new OpenAIApi(configuration);
module.exports = openai;
