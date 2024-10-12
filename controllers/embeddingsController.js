const Bot = require('../models/bots');
const Document = require('../models/documents');
const openai = require('../services/openAI');
const { MemoryVectorStore } = require('langchain/vectorstore/memory');
const dotenv = require('dotenv');

//load pdf
//create chunks
//create vectors from chunk
//query chunks
