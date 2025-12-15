const { MongoClient } = require("mongodb");

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = new MongoClient(process.env.MONGODB_URI || process.env.MONGO_URI);
    await client.connect();

    await client
      .db("registration")
      .collection("registrations")
      .insertOne({
        ...req.body,
        createdAt: new Date()
      });

    await client.close();

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false });
  }
};
