const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const csvValidator = require('../middleware/csvValidator');
const uploadController = require('../controller/uploadController');
const statusController = require('../controller/statusController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../', process.env.UPLOAD_DIR);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + uuidv4();
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() !== '.txt' && path.extname(file.originalname).toLowerCase() !== '.csv') {
      return cb(new Error('Only CSV and TXT files are allowed'));
    }
    cb(null, true);
  }
});

router.post('/upload', upload.single('file'), csvValidator, uploadController.uploadCSV);
router.get('/status/:requestId', statusController.checkStatus);

module.exports = router;