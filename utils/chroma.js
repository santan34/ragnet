
const { ChromaClient } = require("chromadb");

class embeddingsClient{

    constructor() {
        this.client = new ChromaClient();
    }//create a chroma client

    static async addDocuments(botName, documents){
        try {
            await this.client.createCollection({
                name: botName,
                //question mark panapa
                document: documents
            });
            console.log("Collection created");
        }catch(error){
            console.log("Error creating collection");
            throw error;
        }
    }//create a collection

    static async deleteCollection(botName){
        try{
            const collection = await this.client.getOrCreateCollection({ name: botName });
            await this.client.deleteCollection(collection);
            console.log("Collection deleted");
        }catch(error){
            console.log("Error deleting collection");
            throw error;
        }
    }//delete a collection

    static async addToCollection(botName, documentsToEmbed) {
        try {
            const collection = await this.client.getOrCreaterCollection();
            await collection.add({
                name: botName,
                documents: documentsToEmbed,
            })
            console.log("documents have been added and stored");
        } catch (error) {
            console.log("error");
            throw error;
        }
    }

// input order
// ids - required
// embeddings - optional
// metadata - optional
// documents - optional
}
//creata a function that makes collections from documen