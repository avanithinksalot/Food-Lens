const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const fs = require('fs');
const { spawn } = require('child_process');
const multer = require('multer');
const PDFDocument = require('pdfkit');

// Ensure uploads directory exists
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

dotenv.config();

const upload = multer({ dest: 'uploads/' });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Setup (SQLite for now)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

// Models
const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('farmer', 'vendor', 'retailer'), allowNull: false },
  location: DataTypes.STRING,
  subscription_tier: { type: DataTypes.STRING, defaultValue: 'free' }
});

// Update Models
const Scan = sequelize.define('Scan', {
  batch_id: { type: DataTypes.STRING, defaultValue: () => `B-${Date.now()}` },
  overall_score: DataTypes.FLOAT,
  risk_category: DataTypes.STRING,
  residue_score: DataTypes.FLOAT,
  soil_score: DataTypes.FLOAT
});

const ScanImage = sequelize.define('ScanImage', {
  image_path: DataTypes.STRING,
  disease_detected: DataTypes.STRING,
  confidence: DataTypes.FLOAT,
  severity: DataTypes.FLOAT
});

User.hasMany(Scan);
Scan.belongsTo(User);
Scan.hasOne(ScanImage); // Changed from hasMany for 1:1 image mapping per scan event
ScanImage.belongsTo(Scan);

// Sync Database
sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced');
});

// Routes
// Authentication
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, role, location } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword, role, location });
    res.status(201).json({ message: 'User created', userId: user.id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    res.json({ token, role: user.role, username: user.username });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Middleware to authenticate token
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Get User History
app.get('/api/scans', authenticate, async (req, res) => {
  try {
    const scans = await Scan.findAll({
      where: { UserId: req.user.userId },
      include: [ScanImage],
      order: [['createdAt', 'DESC']]
    });
    res.json(scans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Scan Analysis with Python Bridge
// Scan Analysis with Python Bridge
app.post('/api/analyze-image', authenticate, upload.array('images'), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      // Fallback for demo if needed, but for now expect files
      return res.status(400).json({ error: 'No images uploaded' });
    }

    const analyzeFile = (file) => {
      return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', ['ai_model.py', file.path]);

        let dataString = '';
        pythonProcess.stdout.on('data', (data) => {
          dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
          console.error(`Python Error (${file.originalname}): ${data}`);
        });

        pythonProcess.on('close', async (code) => {
          try {
            // Find the last valid JSON object in the output (in case of extra logs)
            const jsonStart = dataString.indexOf('{');
            const jsonEnd = dataString.lastIndexOf('}');
            if (jsonStart === -1 || jsonEnd === -1) throw new Error("Invalid output from AI model");

            const cleanJson = dataString.substring(jsonStart, jsonEnd + 1);
            const result = JSON.parse(cleanJson);

            // Add metadata
            result.originalName = file.originalname;
            result.fileName = file.filename;

            // Save to DB
            if (req.user && req.user.userId) {
              const scan = await Scan.create({
                UserId: req.user.userId,
                overall_score: result.overall.safety_score,
                risk_category: result.overall.risk_category,
                residue_score: result.residue.chemical_stress_index,
                soil_score: result.soil.soil_health_score
              });

              await ScanImage.create({
                ScanId: scan.id,
                image_path: file.path,
                disease_detected: result.disease.name,
                confidence: result.disease.probability,
                severity: result.disease.severity
              });
            }

            resolve(result);
          } catch (e) {
            console.error('Failed to parse Python output for', file.originalname, e);
            // Fallback Mock for this specific file, to allow partial success
            resolve({
              originalName: file.originalname,
              error: true,
              disease_risk: { disease_name: "Analysis Failed", probability: 0, severity_score: 0 },
              residue_risk: { chemical_stress_index: 0, residue_risk: "Unknown" },
              soil_health: { ph_category: "Unknown", soil_health_score: 0 },
              overall: { safety_score: 0, risk_category: "Error" }
            });
          }
        });
      });
    };

    const results = await Promise.all(files.map(f => analyzeFile(f)));
    res.json(results);

  } catch (err) {
    console.error("Batch processing error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Generate PDF Report
app.post('/api/generate-report', async (req, res) => {
  const doc = new PDFDocument();
  const filename = `report-${Date.now()}.pdf`;
  const { analysis, type } = req.body;

  res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
  res.setHeader('Content-type', 'application/pdf');

  doc.pipe(res);

  if (analysis) {
    // Dynamic Report based on Analysis
    const title = type === 'treatment' ? 'Treatment Plan & Remediation' : 'Analysis & Compliance Report';

    doc.fontSize(25).text(`AgriSafe AI - ${title}`, { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`);
    doc.text(`Scan ID: ${analysis.id || 'N/A'}`);
    doc.moveDown();

    // Diagnosis Section
    doc.rect(50, doc.y, 500, 2).fill('#10b981'); // Green separator
    doc.moveDown();
    doc.fillColor('black');

    doc.fontSize(18).text(`Identified Issue: ${analysis.disease?.name || 'Unknown'}`);
    doc.fontSize(14).text(`Risk Level: ${analysis.overall?.risk_category || 'Unknown'}`, {
      color: analysis.overall?.risk_category === 'Safe' ? 'green' : 'red'
    });

    doc.moveDown();
    doc.fontSize(12).text(`Problem Description:`);
    doc.font('Helvetica-Oblique').text(analysis.problem_description || 'No description available.');
    doc.font('Helvetica');
    doc.moveDown();

    // Remediation Section
    if (analysis.remediation_steps && analysis.remediation_steps.length > 0) {
      doc.fontSize(18).text('Recommended Treatment Plan');
      doc.moveDown(0.5);

      analysis.remediation_steps.forEach((step, index) => {
        doc.fontSize(12).text(`${index + 1}. ${step}`);
        doc.moveDown(0.2);
      });
    }

    // Stats Section
    doc.moveDown();
    doc.fontSize(16).text('Detailed Metrics');
    doc.fontSize(12).text(`Confidence: ${(analysis.disease?.probability * 100).toFixed(1)}%`);
    doc.text(`Residue Stress Index: ${analysis.residue?.chemical_stress_index || 0}`);
    doc.text(`Soil Health Score: ${analysis.soil?.soil_health_score || 0}`);

  } else {
    // Default Generic Report (Fallback)
    doc.fontSize(25).text('AgriSafe AI - Compliance Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`);
    doc.text(`Location: Demo Farm`);
    doc.moveDown();
    doc.fontSize(16).text('Risk Assessment Summary');
    doc.fontSize(12).text('Overall Safety Score: 85/100 (Safe)');
    doc.text('Disease Risk: Low');
    doc.text('Residue Risk: Low');
    doc.text('Soil Health: Optimal');
    doc.moveDown();
    doc.text('This report certifies that the scanned batch meets safety standards.');
  }

  doc.end();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
