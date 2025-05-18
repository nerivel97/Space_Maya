import pool from '../config/db.js';

class User {
  static async create({ email, password, isAdmin = false }) {
    const [result] = await pool.execute(
      'INSERT INTO users (email, password, isAdmin) VALUES (?, ?, ?)',
      [email, password, isAdmin]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }
}

export default User;