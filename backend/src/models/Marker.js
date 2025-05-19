import pool from '../config/db.js';

class Marker {
  static async create({ position, title, description, location, features, images }) {
    const [result] = await pool.execute(
      'INSERT INTO markers (position, title, description, location, features, images) VALUES (?, ?, ?, ?, ?, ?)',
      [JSON.stringify(position), title, description, location, JSON.stringify(features), JSON.stringify(images)]
    );
    return { id: result.insertId, position, title, description, location, features, images };
  }

  static async getAll() {
    const [rows] = await pool.execute('SELECT * FROM markers');
    return rows.map(row => ({
      ...row,
      position: JSON.parse(row.position),
      features: JSON.parse(row.features),
      images: JSON.parse(row.images)
    }));
  }

  static async getById(id) {
    const [rows] = await pool.execute('SELECT * FROM markers WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    return {
      ...rows[0],
      position: JSON.parse(rows[0].position),
      features: JSON.parse(rows[0].features),
      images: JSON.parse(rows[0].images)
    };
  }

  static async update(id, { position, title, description, location, features, images }) {
    const [result] = await pool.execute(
      'UPDATE markers SET position = ?, title = ?, description = ?, location = ?, features = ?, images = ? WHERE id = ?',
      [JSON.stringify(position), title, description, location, JSON.stringify(features), JSON.stringify(images), id]
    );
    if (result.affectedRows === 0) return null;
    return { id, position, title, description, location, features, images };
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM markers WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

export default Marker;