require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create upload and output directories if they don't exist
const uploadDir = path.join(__dirname, '../', process.env.UPLOAD_DIR);
const outputDir = path.join(__dirname, '../', process.env.OUTPUT_DIR);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

app.use('/processed', express.static(outputDir));

app.use('/api', apiRoutes);

// webhook
app.use(`${process.env.WEBHOOK_ENDPOINT}`, (req, res) => {
  if (req.method === 'POST') {
    console.log('Webhook notification received: line 46 app.js', req.body);
    
    return res.status(200).json({
      success: true,
      message: 'Webhook notification received successfully',
      data: req.body
    });
  }
  
  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Service is running'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;