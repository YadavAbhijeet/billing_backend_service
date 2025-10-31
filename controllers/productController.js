const Product = require('../models/Product');

// ✅ Create Product
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    console.error('❌ Error creating product:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get all Products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({ where: { is_deleted: false } });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get single Product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id, is_deleted: false },
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update Product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id, is_deleted: false },
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    await product.update(req.body);
    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Soft Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id, is_deleted: false },
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    await product.update({ is_deleted: true });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
