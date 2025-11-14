const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  features: [{
    name: String,
    description: String,
  }],
  imageUrl: {
    type: String,
    default: '',
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add text index for search functionality
productSchema.index({
  name: 'text',
  description: 'text',
  category: 'text',
  'features.name': 'text',
  'features.description': 'text',
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
