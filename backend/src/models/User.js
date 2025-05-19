import pool from '../config/db.js';

class User {
  static async create({ email, password, isAdmin = false }) {
    const [result] = await pool.execute(
      'INSERT INTO users (email, password, is_admin) VALUES (?, ?, ?)',
      [email, password, isAdmin]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT id, email, password, is_admin as isAdmin FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, email, is_admin as isAdmin FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async setAdminStatus(userId, isAdmin) {
    await pool.execute(
      'UPDATE users SET is_admin = ? WHERE id = ?',
      [isAdmin, userId]
    );
  }
}

export default User;