const mongodb = require('mongodb');
const uri = "mongodb+srv://manish:230808@magnum.7r5eue2.mongodb.net/?retryWrites=true&w=majority&appName=Magnum";

const client = new mongodb.MongoClient(uri);

let db;

module.exports = {
    connect: () => {
        client.connect()
            .then(() => {
                db = client.db('d1'); // Replace with your database name
                console.log('Connected to MongoDB');
            })
            .catch(err => {
                console.error('Failed to connect to MongoDB', err);
            });
    },
    getDB: () => db
};