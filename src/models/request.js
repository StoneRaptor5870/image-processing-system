const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  progress: {
    type: Number,
    default: 0
  },
  totalImages: {
    type: Number,
    default: 0
  },
  processedImages: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  webhookSent: {
    type: Boolean,
    default: false
  },
  originalFilename: {
    type: String
  },
  outputCsvUrl: {
    type: String
  }
});

module.exports = mongoose.model('Request', RequestSchema);