const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: {type: Number, unique: true, required: true},
    name: String,
    description: String,
    price: {type: Number, required: true},
    category: {type: String, required: true},
    inStock: {type: Boolean, default: true},
});

module.exports = mongoose.model('Product', productSchema);



