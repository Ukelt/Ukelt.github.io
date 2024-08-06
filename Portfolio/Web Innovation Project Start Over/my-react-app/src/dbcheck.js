const {connectDatabase} = require('./db');

// Check if email is in db
async function emailExists(email) {
  const client = await connectDatabase();
  const db = client.db('WebInnoProj'); // Replace with your database name
  const collection = db.collection('users'); // Replace with your collection name

  const user = await collection.findOne({ email });
  client.close();

  return user;
}

export {emailExists}