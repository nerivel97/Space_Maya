import pool from '../config/db.js';

class Discussion {
  static async create({ groupId, title, content, createdBy }) {
    const [result] = await pool.execute(
      'INSERT INTO discussions (group_id, title, content, created_by) VALUES (?, ?, ?, ?)',
      [groupId, title, content, createdBy]
    );
    return result.insertId;
  }

  static async findByGroupId(groupId) {
    const [rows] = await pool.execute(
      `SELECT d.*, u.username as author_name 
       FROM discussions d
       JOIN users u ON d.created_by = u.id
       WHERE d.group_id = ?
       ORDER BY d.created_at DESC`,
      [groupId]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT d.*, u.username as author_name, g.name as group_name
       FROM discussions d
       JOIN users u ON d.created_by = u.id
       JOIN groups g ON d.group_id = g.id
       WHERE d.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async update(id, { title, content }) {
    await pool.execute(
      'UPDATE discussions SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, content, id]
    );
  }

  static async delete(id) {
    await pool.execute(
      'DELETE FROM discussions WHERE id = ?',
      [id]
    );
  }
}

export default Discussion;