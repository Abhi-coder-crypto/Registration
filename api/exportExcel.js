const jwt = require("jsonwebtoken");
const { MongoClient } = require("mongodb");

let cachedClient = null;

async function connectToDatabase() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  
  if (!uri) {
    throw new Error('MONGODB_URI not configured');
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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    jwt.verify(req.query.token, process.env.JWT_SECRET || 'default-secret');
    
    const client = await connectToDatabase();
    
    const data = await client
      .db("registration")
      .collection("registrations")
      .find()
      .toArray();
    
    let csv = 'Name,Email,Mobile,Speciality,State,City,Created At\n';
    data.forEach(r => {
      csv += `"${r.name || ''}","${r.email || ''}","${r.mobile || ''}","${r.speciality || ''}","${r.state || ''}","${r.city || ''}","${r.createdAt || ''}"\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=registrations.csv');
    return res.status(200).send(csv);
  } catch (error) {
    console.error('Export error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};
