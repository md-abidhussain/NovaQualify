const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sortBy, sortOrder = 'asc' } = req.query;
    
    // Build query
    const query = {};
    
    // Search in name, description, category, and features
    if (search) {
      query.$text = { $search: search };
    }
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    // Build sort
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; // Default sort by newest
    }
    
    const products = await Product.find(query).sort(sort);
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/products
// @desc    Create a product
// @access  Private (add authentication middleware later)
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      features = [],
      imageUrl = '',
      stock = 0,
    } = req.body;

    // Create new product
    const newProduct = new Product({
      name,
      description,
      price,
      category,
      features,
      imageUrl,
      stock,
    });

    const product = await newProduct.save();
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private (add authentication middleware later)
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update fields
    const updates = req.body;
    Object.keys(updates).forEach(key => {
      product[key] = updates[key];
    });

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private (add authentication middleware later)
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.remove();
    res.json({ message: 'Product removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
