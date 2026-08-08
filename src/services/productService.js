const { pool } = require('../config/database');
const { getRedisClient } = require('../config/redis');
const config = require('../config/env');

const CACHE_KEYS = {
  ALL_PRODUCTS: 'products:all',
  PRODUCT_BY_ID: (id) => `products:${id}`,
};

class ProductService {
  /**
   * Fetch all products (Cache-Aside pattern)
   */
  static async getAllProducts() {
    const redis = getRedisClient();

    // 1. Try reading from cache
    try {
      const cached = await redis.get(CACHE_KEYS.ALL_PRODUCTS);
      if (cached) {
        return { source: 'cache', data: JSON.parse(cached) };
      }
    } catch (err) {
      console.warn('[Cache Miss/Error] Reading all products cache failed, falling back to DB:', err.message);
    }

    // 2. Query PostgreSQL Database
    const query = 'SELECT * FROM products ORDER BY id DESC';
    const { rows } = await pool.query(query);

    // 3. Write back to Redis Cache asynchronously
    try {
      await redis.setex(CACHE_KEYS.ALL_PRODUCTS, config.redis.ttlSeconds, JSON.stringify(rows));
    } catch (err) {
      console.warn('[Cache Write Error] Failed to write products list to cache:', err.message);
    }

    return { source: 'database', data: rows };
  }

  /**
   * Fetch a single product by ID (Cache-Aside pattern)
   */
  static async getProductById(id) {
    const redis = getRedisClient();
    const cacheKey = CACHE_KEYS.PRODUCT_BY_ID(id);

    // 1. Try reading from cache
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return { source: 'cache', data: JSON.parse(cached) };
      }
    } catch (err) {
      console.warn(`[Cache Miss/Error] Reading product:${id} cache failed, falling back to DB:`, err.message);
    }

    // 2. Query PostgreSQL Database
    const query = 'SELECT * FROM products WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    const product = rows[0];

    if (!product) {
      return null;
    }

    // 3. Write back to Redis Cache
    try {
      await redis.setex(cacheKey, config.redis.ttlSeconds, JSON.stringify(product));
    } catch (err) {
      console.warn(`[Cache Write Error] Failed to write product:${id} to cache:`, err.message);
    }

    return { source: 'database', data: product };
  }

  /**
   * Create a new product & invalidate cache
   */
  static async createProduct({ name, description, price, stock }) {
    const query = `
      INSERT INTO products (name, description, price, stock)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [name, description || '', price, stock || 0];
    const { rows } = await pool.query(query, values);
    const newProduct = rows[0];

    // Invalidate list cache
    await this.invalidateCache([CACHE_KEYS.ALL_PRODUCTS]);

    return newProduct;
  }

  /**
   * Update an existing product & invalidate cache
   */
  static async updateProduct(id, { name, description, price, stock }) {
    const query = `
      UPDATE products
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          price = COALESCE($3, price),
          stock = COALESCE($4, stock),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;
    const { rows } = await pool.query(query, [name, description, price, stock, id]);
    const updatedProduct = rows[0];

    if (!updatedProduct) {
      return null;
    }

    // Invalidate both item cache and list cache
    await this.invalidateCache([CACHE_KEYS.ALL_PRODUCTS, CACHE_KEYS.PRODUCT_BY_ID(id)]);

    return updatedProduct;
  }

  /**
   * Delete a product & invalidate cache
   */
  static async deleteProduct(id) {
    const query = 'DELETE FROM products WHERE id = $1 RETURNING id';
    const { rows } = await pool.query(query, [id]);
    
    if (rows.length === 0) {
      return false;
    }

    // Invalidate cache
    await this.invalidateCache([CACHE_KEYS.ALL_PRODUCTS, CACHE_KEYS.PRODUCT_BY_ID(id)]);

    return true;
  }

  /**
   * Helper to invalidate cache keys safely
   */
  static async invalidateCache(keys) {
    const redis = getRedisClient();
    try {
      await redis.del(...keys);
      console.log(`[Cache Invalidate] Cleared keys: ${keys.join(', ')}`);
    } catch (err) {
      console.warn('[Cache Invalidate Error] Failed to delete cache keys:', err.message);
    }
  }
}

module.exports = ProductService;
