const jwt = require("jsonwebtoken");
const { MongoClient } = require("mongodb");
const XLSX = require("xlsx");

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
    
    // Prepare data for Excel
    const excelData = data.map(r => ({
      'Date & Time': r.timestamp ? new Date(r.timestamp).toLocaleString() : (r.createdAt ? new Date(r.createdAt).toLocaleString() : ''),
      'Name': r.name || '',
      'Email': r.email || '',
      'Mobile': r.mobile || '',
      'Speciality': r.speciality || '',
      'State': r.state || '',
      'City': r.city || ''
    }));
    
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 20 }, // Date & Time
      { wch: 25 }, // Name
      { wch: 30 }, // Email
      { wch: 15 }, // Mobile
      { wch: 20 }, // Speciality
      { wch: 15 }, // State
      { wch: 15 }  // City
    ];
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');
    
    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=registrations.xlsx');
    return res.status(200).send(excelBuffer);
  } catch (error) {
    console.error('Export error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};
