const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const uri = 'mongodb://127.0.0.1:27017/'; // Replace with your MongoDB connection URI
const saltRounds = 10; // Number of salt rounds (higher is more secure but slower)

async function connectDatabase() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  return client;
}

async function createUser({ email, password, role }) {
  const client = await connectDatabase();
  const db = client.db('WebInnoProj'); // Replace with your database name
  const collection = db.collection('users'); // Replace with your collection name

  const plaintextPassword = password; // Replace with the user's entered password
  const hashedPassword = await bcrypt.hash(plaintextPassword, saltRounds);

  const newUser = {
    id: uuidv4(),
    email,
    password: hashedPassword,
    role,
  };

  await collection.insertOne(newUser);
  client.close();
  console.log('It worked')
  return newUser;
}

module.exports = {
  connectDatabase,
  createUser,
};
