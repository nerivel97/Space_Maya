import pool from '../config/db.js';

class Message {
  static async create({ discussionId, content, userId }) {
    const [result] = await pool.execute(
      'INSERT INTO messages (discussion_id, content, user_id) VALUES (?, ?, ?)',
      [discussionId, content, userId]
    );
    return result.insertId;
  }

  static async findByDiscussionId(discussionId) {
    const [rows] = await pool.execute(
      `SELECT m.*, u.username as author_name, u.avatar as author_avatar
       FROM messages m
       JOIN users u ON m.user_id = u.id
       WHERE m.discussion_id = ?
       ORDER BY m.created_at ASC`,
      [discussionId]
    );
    return rows;
  }

  static async update(id, content) {
    await pool.execute(
      'UPDATE messages SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [content, id]
    );
  }

  static async delete(id) {
    await pool.execute(
      'DELETE FROM messages WHERE id = ?',
      [id]
    );
  }
}

export default Message;