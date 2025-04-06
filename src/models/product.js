const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  requestId: {
    type: String,
    required: true,
    index: true
  },
  serialNumber: {
    type: Number,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  inputImageUrls: [{
    type: String,
    required: true
  }],
  outputImageUrls: [{
    type: String,
    default: []
  }],
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', ProductSchema);