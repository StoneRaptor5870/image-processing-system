require('dotenv').config();
const Redis = require('redis');

const redisClient = Redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

redisClient.on('connect', () => {
  console.log('Redis connected successfully');
});

redisClient.on('error', (error) => {
  console.error('Redis connection error:', error);
});

(async () => {
  await redisClient.connect();
})();

module.exports = redisClient;