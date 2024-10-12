
const { ChromaClient } = require("chromadb");

class ChromaClient{

    constructor(){
        this.client = new ChromaClient();
    }//create a chroma client

    static async createCollection(botname, documents){
        try {
            await this.client.createCollection({
                name: botname,
                //question mark panapa
                document: documents,
            });
            console.log("Collection created");
        }catch(error){
            console.log("Error creating collection");
            throw error;
        }
    }//create a collection

    static async deleteCollection(botname){
        try{
            const collection = await client.getCollection({ name: botname });
            collection = await client.getOrCreateCollection({ name: botnmae });
            await client.deleteCollection(collection);
            console.log("Collection deleted");
        }catch(error){
            console.log("Error deleting collection");
            throw error;
        }
    }//delete a collection

    static async queryCollection(botname, query){
        try{
            const collection = await client.getCollection({ name: botname });
            const results = await
        }catch(error){
            console.log("Error querying collection");
            throw error;
        }
    }
}
//creata a function that makes collections from documen