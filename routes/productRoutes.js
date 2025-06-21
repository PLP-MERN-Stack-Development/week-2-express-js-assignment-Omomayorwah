const products = require('./api/products');
const express = require('express');
const router = express.Router();
const { validateProduct } = require('../validators/productValidator');

// Define the routes for products
router.get('/api/products', async (req, res) => {
    try {
        const allProducts = await products.find();
        res.status(200).json(allProducts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error });
    }
});

router.get('/api/products/:id', async (req, res) => {
    try {
        const product = await products.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error });
    }
});

router.post('/api/products', validateProduct, async (req, res) => {
    try {
        const newProduct = new products(req.body);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).json({ message: 'Error creating product', error });
    }
});

router.put('/api/products/:id', validateProduct, async (req, res) => {
    try {
        const updatedProduct = await products.findByIdAndUpdate(req
.params.id, req.body, { new: true, runValidators: true });
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(updatedProduct);
    } catch (error) { 
        res.status(400).json({ message: 'Error updating product', error });
    }
});

router.delete('/api/products/:id', async (req, res) => {
    try {
        const deletedProduct = await products.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error });
    }
});

// Enhanced route for fetching products with filtering and pagination
router.get('/api/products', async (req, res) => {
    try {
        const { name, category, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        // Build query object
        const query = {};
        
        if (name) {
            query.name = { $regex: name, $options: 'i' }; // Case-insensitive search
        }
        
        if (category) {
            query.category = category;
        }

        // Execute query with pagination
        const results = await products.find(query)
            .skip(skip)
            .limit(limit);
            
        const total = await products.countDocuments(query);

        res.status(200).json({
            success: true,
            count: results.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            data: results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error searching products',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});

// Export the router
module.exports = router;