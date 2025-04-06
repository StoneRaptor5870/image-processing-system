const { v4: uuidv4 } = require('uuid');
const Request = require('../models/request');
const csvService = require('../service/csvService');
const imageProcessingQueue = require('../queues/imageProcessingQueue');

exports.uploadCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const requestId = uuidv4();
    const parsedData = await csvService.parseCSV(req.file.path);
    let totalImages = 0;
    parsedData.forEach(product => {
      totalImages += product.inputImageUrls.length;
    });

    const request = new Request({
      requestId,
      status: 'pending',
      totalImages,
      originalFilename: req.file.originalname
    });
    
    await request.save();
    
    await imageProcessingQueue.add('process-images', {
      requestId,
      filePath: req.file.path,
      originalFilename: req.file.originalname
    });

    return res.status(200).json({
      success: true,
      requestId,
      message: 'File uploaded successfully. Processing started.'
    });
  } catch (error) {
    console.error('Error in upload controller:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during file upload',
      error: error.message
    });
  }
};