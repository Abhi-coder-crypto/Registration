const jwt = require("jsonwebtoken");
const { MongoClient } = require("mongodb");

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    
    const client = new MongoClient(process.env.MONGODB_URI || process.env.MONGO_URI);
    await client.connect();
    
    const data = await client
      .db("registration")
      .collection("registrations")
      .find()
      .toArray();
    
    await client.close();
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Get registrations error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};
