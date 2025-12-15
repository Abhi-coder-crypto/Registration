const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');
const XLSX = require('xlsx');

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.static('public'));

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  next();
});

let mongoClient;

async function getDb() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    return null;
  }
  if (!mongoClient) {
    mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
  }
  return mongoClient.db('registration');
}

app.post('/api/register', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      console.log('MongoDB not configured - registration data:', req.body);
      return res.json({ success: true, message: 'Demo mode - MongoDB not configured' });
    }
    
    const { email, mobile } = req.body;
    const collection = db.collection('registrations');
    
    // Check for duplicate email
    const existingEmail = await collection.findOne({ email: email });
    if (existingEmail) {
      return res.status(400).json({ 
        success: false, 
        error: 'duplicate_email',
        message: 'This email is already registered.' 
      });
    }
    
    // Check for duplicate mobile
    const existingMobile = await collection.findOne({ mobile: mobile });
    if (existingMobile) {
      return res.status(400).json({ 
        success: false, 
        error: 'duplicate_mobile',
        message: 'This mobile number is already registered.' 
      });
    }
    
    await collection.insertOne({
      ...req.body,
      createdAt: new Date()
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false });
  }
});

app.post('/api/adminLogin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (email === adminEmail && password === adminPassword) {
      const token = jwt.sign({ email }, process.env.JWT_SECRET || 'default-secret', { expiresIn: '24h' });
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/getRegistrations', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    
    const db = await getDb();
    if (!db) {
      return res.json([]);
    }
    const data = await db.collection('registrations').find().toArray();
    res.json(data);
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    console.error('Get registrations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/exportExcel', async (req, res) => {
  try {
    jwt.verify(req.query.token, process.env.JWT_SECRET || 'default-secret');
    
    const db = await getDb();
    if (!db) {
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet([]);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=registrations.xlsx'
      });
      return res.send(buffer);
    }
    const data = await db.collection('registrations').find().toArray();
    
    const excelData = data.map(r => ({
      'Date & Time': r.timestamp ? new Date(r.timestamp).toLocaleString() : (r.createdAt ? new Date(r.createdAt).toLocaleString() : ''),
      'Name': r.name || '',
      'Email': r.email || '',
      'Mobile': r.mobile || '',
      'Speciality': r.speciality || '',
      'State': r.state || '',
      'City': r.city || ''
    }));
    
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    worksheet['!cols'] = [
      { wch: 20 }, { wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');
    
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=registrations.xlsx'
    });
    res.send(buffer);
  } catch (error) {
    console.error('Export error:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
    console.log('Warning: MONGODB_URI not set - running in demo mode');
  }
});
