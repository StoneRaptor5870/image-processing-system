const Queue = require('bull');
const redisClient = require('../config/redis');

const imageProcessingQueue = new Queue('image-processing', {
  redis: redisClient
});

imageProcessingQueue.process('process-images', require('../workers/imageProcessor'));

imageProcessingQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result);
});

imageProcessingQueue.on('failed', (job, error) => {
  console.error(`Job ${job.id} failed with error:`, error);
});

module.exports = imageProcessingQueue;