const path = require('path');
const fs = require('fs');
const Request = require('../models/request');
const Product = require('../models/product');
const csvService = require('../service/csvService');
const imageService = require('../service/imageService');
const webhookService = require('../service/webhookService');

module.exports = async (job) => {
  const { requestId, filePath, originalFilename } = job.data;
  
  try {
    await Request.findOneAndUpdate(
      { requestId },
      { 
        status: 'processing',
        updatedAt: Date.now()
      }
    );
    
    const products = await csvService.parseCSV(filePath);
    
    const outputDir = path.join(__dirname, '../../', process.env.OUTPUT_DIR, requestId);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    let totalImages = 0;
    products.forEach(product => {
      totalImages += product.inputImageUrls.length;
    });
    
    let request = await Request.findOneAndUpdate(
      { requestId },
      { 
        totalImages,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    let processedImages = 0;
    
    for (const product of products) {
      const newProduct = new Product({
        requestId,
        serialNumber: product.serialNumber,
        productName: product.productName,
        inputImageUrls: product.inputImageUrls,
        status: 'pending'
      });
      
      await newProduct.save();
      
      await Product.findByIdAndUpdate(
        newProduct._id,
        {
          status: 'processing',
          updatedAt: Date.now()
        }
      );
      
      const outputImageUrls = [];
      
      for (let i = 0; i < product.inputImageUrls.length; i++) {
        const imageUrl = product.inputImageUrls[i];
        
        try {
          const outputImageUrl = await imageService.processImage(
            imageUrl,
            outputDir,
            requestId,
            product.productName,
            i
          );
          
          outputImageUrls.push(outputImageUrl);
          
          processedImages++;
          const progress = Math.round((processedImages / totalImages) * 100);
          
          await Request.findOneAndUpdate(
            { requestId },
            {
              processedImages,
              progress,
              updatedAt: Date.now()
            }
          );
        } catch (error) {
          console.error(`Error processing image ${imageUrl}:`, error);
          outputImageUrls.push('processing_failed');
        }
      }
      
      await Product.findByIdAndUpdate(
        newProduct._id,
        {
          outputImageUrls,
          status: 'completed',
          updatedAt: Date.now()
        }
      );
    }
    
    const processedProducts = await Product.find({ requestId }).sort('serialNumber');
    const outputCsvPath = await csvService.generateOutputCSV(requestId, processedProducts);
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const outputCsvUrl = `${baseUrl}/processed/${requestId}-output.csv`;
    
    request = await Request.findOneAndUpdate(
      { requestId },
      {
        status: 'completed',
        progress: 100,
        outputCsvUrl,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (process.env.WEBHOOK_URL) {
      try {
        await webhookService.sendWebhook(request);
        
        await Request.findOneAndUpdate(
          { requestId },
          {
            webhookSent: true,
            updatedAt: Date.now()
          }
        );
      } catch (error) {
        console.error('Error sending webhook:', error);
      }
    }
    
    return {
      success: true,
      message: 'Processing completed successfully',
      requestId,
      outputCsvUrl
    };
  } catch (error) {
    console.error('Error in image processor worker:', error);
    
    await Request.findOneAndUpdate(
      { requestId },
      {
        status: 'failed',
        updatedAt: Date.now()
      }
    );
    
    throw error;
  }
};