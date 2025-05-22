// models/GroupMessage.js
import pool from '../config/db.js';

class GroupMessage {
  static async create({ groupId, userId, content }) {
    const [result] = await pool.execute(
      'INSERT INTO group_messages (group_id, user_id, content) VALUES (?, ?, ?)',
      [groupId, userId, content]
    );
    return result.insertId;
  }

  static async findByGroupId(groupId) {
    const [rows] = await pool.execute(
      `SELECT gm.*, u.name as author_name
       FROM group_messages gm
       JOIN users u ON gm.user_id = u.id
       WHERE gm.group_id = ?
       ORDER BY gm.created_at ASC`,
      [groupId]
    );
    return rows;
  }

  static async getMessagesCount(groupId) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM group_messages WHERE group_id = ?',
      [groupId]
    );
    return rows[0].count;
  }
}

export default GroupMessage;
