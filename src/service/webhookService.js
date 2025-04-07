const axios = require('axios');

exports.sendWebhook = async (request) => {
  if (!process.env.WEBHOOK_URL) {
    console.log('Webhook URL not configured. Skipping webhook notification.');
    return;
  }
  
  try {
    const webhookData = {
      requestId: request.requestId,
      status: request.status,
      totalImages: request.totalImages,
      processedImages: request.processedImages,
      outputCsvUrl: request.outputCsvUrl,
      completedAt: new Date().toISOString()
    };
    
    const response = await axios.post(process.env.WEBHOOK_URL, webhookData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Webhook sent successfully', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending webhook:', error);
    throw error;
  }
};