const Request = require('../models/request');
const Product = require('../models/product');

exports.checkStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const request = await Request.findOne({ requestId });
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }
    
    let responseData = {
      requestId: request.requestId,
      status: request.status,
      progress: request.progress,
      totalImages: request.totalImages,
      processedImages: request.processedImages,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt
    };
    
    if (request.status === 'completed') {
      responseData.outputCsvUrl = request.outputCsvUrl;
    }
    
    return res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error in status controller:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while checking status',
      error: error.message
    });
  }
};