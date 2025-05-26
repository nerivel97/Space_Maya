import pool from '../config/db.js';

const Vocabulario = {
  async getAll() {
    const [rows] = await pool.execute(`
      SELECT * FROM vocabulario 
      ORDER BY created_at DESC
    `);
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM vocabulario WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  async create({ palabra_espanol, palabra_maya, pronunciacion, categoria, significado, ejemplo_uso_espanol, ejemplo_uso_maya, imagen_url }) {
    const [result] = await pool.execute(
      `INSERT INTO vocabulario 
      (palabra_espanol, palabra_maya, pronunciacion, categoria, significado, ejemplo_uso_espanol, ejemplo_uso_maya, imagen_url) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [palabra_espanol, palabra_maya, pronunciacion, categoria, significado, ejemplo_uso_espanol, ejemplo_uso_maya, imagen_url]
    );
    return this.getById(result.insertId);
  },

  async update(id, { palabra_espanol, palabra_maya, pronunciacion, categoria, significado, ejemplo_uso_espanol, ejemplo_uso_maya, imagen_url }) {
    await pool.execute(
      `UPDATE vocabulario SET 
      palabra_espanol = ?, 
      palabra_maya = ?, 
      pronunciacion = ?, 
      categoria = ?, 
      significado = ?, 
      ejemplo_uso_espanol = ?, 
      ejemplo_uso_maya = ?, 
      imagen_url = ? 
      WHERE id = ?`,
      [palabra_espanol, palabra_maya, pronunciacion, categoria, significado, ejemplo_uso_espanol, ejemplo_uso_maya, imagen_url, id]
    );
    return this.getById(id);
  },

  async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM vocabulario WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  },

  async getByCategory(categoria) {
    const [rows] = await pool.execute(
      'SELECT * FROM vocabulario WHERE categoria = ?',
      [categoria]
    );
    return rows;
  }
};

export default Vocabulario;