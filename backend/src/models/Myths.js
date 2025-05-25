import pool from '../config/db.js';

const Myths = {
  async getAll() {
    const [rows] = await pool.execute(`
      SELECT * FROM myths_legends 
      ORDER BY created_at DESC
    `);
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM myths_legends WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  async create({ title, content, origin_region, origin_culture, category, estimated_origin_year, featured_image, created_by }) {
    const [result] = await pool.execute(
      `INSERT INTO myths_legends 
      (title, content, origin_region, origin_culture, category, estimated_origin_year, featured_image, created_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, content, origin_region, origin_culture, category, estimated_origin_year, featured_image, created_by]
    );
    return this.getById(result.insertId);
  },

  async update(id, { title, content, origin_region, origin_culture, category, estimated_origin_year, featured_image }) {
    await pool.execute(
      `UPDATE myths_legends SET 
      title = ?, 
      content = ?, 
      origin_region = ?, 
      origin_culture = ?, 
      category = ?, 
      estimated_origin_year = ?, 
      featured_image = ? 
      WHERE id = ?`,
      [title, content, origin_region, origin_culture, category, estimated_origin_year, featured_image, id]
    );
    return this.getById(id);
  },

  async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM myths_legends WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  },

  async verifyMyth(id, is_verified) {
    await pool.execute(
      'UPDATE myths_legends SET is_verified = ? WHERE id = ?',
      [is_verified, id]
    );
    return this.getById(id);
  }
};

export default Myths;