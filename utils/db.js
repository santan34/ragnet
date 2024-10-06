import mongoose from 'mongoose'

class MongoClient {
    constructor() {
        const host = process.env.HOST || 'localhost';
        const port = process.env.PORT || 27017;
        const dbName = process.env.DB_NAME || 'test';
        this.connectionPromise = mongoose.connect(`mongodb://${host}:${port}/${dbName}`, { 
            useNewUrlParser: true, 
            useUnifiedTopology: true
        }).then(() => {
            console.log('Connected to the database');
            this.client = mongoose;
        }).catch(err => {
            console.log('Error connecting to the database ', err);
        });
    }

    //ensures database connection before any operations
    async isAlive() {
        await this.connectionPromise;
        const state = this.client.connection.readyState === 1;
        return state;
    }
    
}
const mongoClient = new MongoClient();
export default mongoClient;