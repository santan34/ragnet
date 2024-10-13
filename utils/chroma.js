const { OpenAIEmbeddingFunction } = require('chromadb');
const { ChromaClient } = require("chromadb");

const embeddingFunction = new OpenAIEmbeddingFunction({
    openai_api_key: "apiKey",
    model: "text-embedding-3-small"
})

class EmbeddingsClient {
    constructor() {
        this.client = new ChromaClient();
    }

    async addDocuments(botName, documents) {
        try {
            const collectionName = `user_${botName}_documents`;
            let collection = await this.client.getCollection({
                name: collectionName
            });
            if (!collection) {
                collection = await this.client.createCollection({
                    name: collectionName,
                    embeddingFunction: embeddingFunction,
                });
            }

            await collection.add({
                documents: documents,
                metadata: documents.map((chunk, idx) => ({
                    botName,
                    chunkId: idx
                })),
                ids: documents.map((_, idx) => `${botName}_${idx}`)
            });
            console.log("Collection created");
        } catch (error) {
            console.log("Error creating collection");
            throw error;
        }
    }

    async deleteCollection(botName) {
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
        const collectionName = `user_${botName}_documents`;
        try {
            // Retrieve the collection
            const collection = await this.client.getCollection({
                name: collectionName,
                embeddingFunction: embeddingFunction
            });
            if (!collection) {
                console.log(`Collection '${collectionName}' does not exist.`);
                return;
            }
            // Example query to search for documents containing the searchText
            const queryResults = await collection.query({
                filter: {document: {$contains: searchText}}, // Modify based on your query structure
                limit: 10 // Limit the number of results returned
            });
            console.log(`Query Results for '${searchText}':`, queryResults);
        } catch (error) {
            console.log('error');
            throw error;
        }
    }
}

const embeddingClient = new EmbeddingsClient();
module.exports = embeddingClient;