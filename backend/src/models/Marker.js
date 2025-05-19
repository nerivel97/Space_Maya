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
}

export default Marker;