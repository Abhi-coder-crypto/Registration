const { MongoClient } = require("mongodb");

let cachedClient = null;

async function connectToDatabase() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }
  
  if (cachedClient) {
    return cachedClient;
  }
  
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

module.exports = async (req, res) => {
  // Set CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = await connectToDatabase();

    await client
      .db("registration")
      .collection("registrations")
      .insertOne({
        ...req.body,
        createdAt: new Date()
      });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.message.includes('MONGODB_URI')) {
      return res.status(500).json({ 
        success: false, 
        error: 'Database not configured. Please set MONGODB_URI in Vercel environment variables.' 
      });
    }
    
    return res.status(500).json({ success: false, error: 'Registration failed' });
  }
};
