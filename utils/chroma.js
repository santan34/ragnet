const { OpenAIEmbeddingFunction } = require('chromadb');
const { ChromaClient } = require("chromadb");
require('dotenv').config();


const apiKey = process.env.OPEN_API_KEY;
const embeddingFunction = new OpenAIEmbeddingFunction({
    openai_api_key: apiKey,
    model: "text-embedding-3-small"
})

class EmbeddingsClient {
    constructor() {
        this.client = new ChromaClient();
        this.initialize()
    }

    async initialize() {
        try {
          this.client = new ChromaClient();
          console.log("ChromaClient initialized successfully");
        } catch (error) {
          console.error("Error initializing ChromaClient:", error);
        }
    }

    async ensureInitialized() {
        if (!this.client) {
          await this.initialize();
        }
      }

    async addDocuments(botName, documents) {
        await this.ensureInitialized();
        try {
            const collectionName = `user_${botName}_documents`;
            const collection = await this.client.getOrCreateCollection({
                name: collectionName,
                embeddingFunction: embeddingFunction
            })
            console.log("collection created or gotten");
            const resolved = await documents;
            console.log(".....................................")
            console.log(resolved);
            console.log(".....................................")
            console.log(documents)
            console.log(".....................................")
            const documentContents = resolved.map(doc => doc.pageContent);
            await collection.add({
                documents: documentContents,
                metadata: resolved.map((chunk, idx) => ({
                    botName,
                    chunkId: idx
                })),
                ids: resolved.map((_, idx) => `${botName}_${idx}`)
            });
            console.log("added");
        } catch (error) {
            console.log("Error creating collection");
            throw error;
        }
    }

    async deleteCollection(botName) {
        await this.ensureInitialized();
        try {
            const collectionName = `user_${botName}_documents`;
            const collection = await this.client.getOrCreateCollection({name: collectionName});
            await this.client.deleteCollection(collection);
            console.log("Collection deleted");
        } catch (error) {
            console.log("Error deleting collection");
            throw error;
        }
    }

    //query a collection
    async queryCollection(botName, searchText) {
        await this.ensureInitialized();
        const collectionName = `user_${botName}_documents`;
        console.log(collectionName);
        try {
            console.log(1)
            // Retrieve the collection
            const collection = await this.client.getCollection({
                name: collectionName,
                embeddingFunction: embeddingFunction
            });
            console.log(2)
            if (!collection) {
                console.log(`Collection '${collectionName}' does not exist.`);
                return [];
            }
            console.log(3)
            console.log(searchText)
            // Example query to search for documents containing the searchText
            const queryResults = await collection.query({
                queryTexts: [searchText], // Modify based on your query structure
                nResults: 10 // Limit the number of results returned
            });
            console.log(4)
            console.log(`Query Results for '${searchText}':`, queryResults);
            const formattedResults = {
                documents: queryResults.documents[0] || [],
                distances: queryResults.distances[0] || [],
                metadatas: queryResults.metadatas[0] || []
            };
            return formattedResults;
        } catch (error) {
            console.log('error querying collection', error);
            throw error;
        }
    }
}

const embeddingClient = new EmbeddingsClient();
module.exports = embeddingClient;