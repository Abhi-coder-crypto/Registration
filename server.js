const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');

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
  if (!mongoClient) {
    mongoClient = new MongoClient(process.env.MONGO_URI);
    await mongoClient.connect();
  }
  return mongoClient.db('registration');
}

app.post('/.netlify/functions/register', async (req, res) => {
  try {
    const db = await getDb();
    await db.collection('registrations').insertOne({
      ...req.body,
      createdAt: new Date()
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false });
  }
});

app.post('/.netlify/functions/adminLogin', async (req, res) => {
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

app.get('/.netlify/functions/getRegistrations', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    
    const db = await getDb();
    const data = await db.collection('registrations').find().toArray();
    res.json(data);
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.get('/.netlify/functions/exportExcel', async (req, res) => {
  try {
    jwt.verify(req.query.token, process.env.JWT_SECRET || 'default-secret');
    
    const db = await getDb();
    const data = await db.collection('registrations').find().toArray();
    
    let csv = 'Name,Email,Mobile,Speciality,State,City\n';
    data.forEach(r => {
      csv += `"${r.name || ''}","${r.email || ''}","${r.mobile || ''}","${r.speciality || ''}","${r.state || ''}","${r.city || ''}"\n`;
    });
    
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=registrations.csv'
    });
    res.send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
