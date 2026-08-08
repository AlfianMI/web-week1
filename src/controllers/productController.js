const ProductService = require('../services/productService');

class ProductController {
  static async getAll(req, res, next) {
    try {
      const result = await ProductService.getAllProducts();
      res.json({
        success: true,
        source: result.source,
        count: result.data.length,
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await ProductService.getProductById(id);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${id} not found`,
        });
      }

      res.json({
        success: true,
        source: result.source,
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const { name, description, price, stock } = req.body;

      if (!name || price === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Fields "name" and "price" are required',
        });
      }

      const product = await ProductService.createProduct({ name, description, price, stock });
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, description, price, stock } = req.body;

      const updated = await ProductService.updateProduct(id, { name, description, price, stock });

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${id} not found`,
        });
      }

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await ProductService.deleteProduct(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${id} not found`,
        });
      }

      res.json({
        success: true,
        message: `Product with ID ${id} deleted successfully`,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProductController;
