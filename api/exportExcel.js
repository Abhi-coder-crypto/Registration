const jwt = require("jsonwebtoken");
const { MongoClient } = require("mongodb");

module.exports = async (req, res) => {
  try {
    jwt.verify(req.query.token, process.env.JWT_SECRET || 'default-secret');
    
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    
    const data = await client
      .db("registration")
      .collection("registrations")
      .find()
      .toArray();
    
    await client.close();
    
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
