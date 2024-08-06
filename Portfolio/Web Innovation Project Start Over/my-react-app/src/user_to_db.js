const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Generate a random UUID (version 4)
const randomUUID = uuidv4();
console.log('Random UUID (version 4):', randomUUID);

const uri = 'mongodb://127.0.0.1:27017/'; // Replace with your MongoDB connection URI
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const saltRounds = 10; // Number of salt rounds (higher is more secure but slower)

// Example: Hashing a password
const plaintextPassword = 'Hello12345!'; // Replace with the user's entered password
bcrypt.hash(plaintextPassword, saltRounds, async (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }
  console.log('Hashed Password: ', hash)

  // Connect to MongoDB
  await client.connect();

  const db = client.db('WebInnoProj'); // Replace with your database name
  const collection = db.collection('users'); // Replace with your collection name

  // Create a new document with fields
  const newDocument = {
    id: randomUUID,
    email: 'kieran.ph@hotmail.co.uk',
    password: hash,
    role: 'admin'
  };

  // Insert the new document into the collection
  await collection.insertOne(newDocument);

  console.log('Document inserted with new fields.');
  client.close();
});


