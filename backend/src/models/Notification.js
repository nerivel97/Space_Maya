import pool from '../config/db.js';

class Notification {
  static async create({ userId, type, content, relatedId, relatedType }) {
    const [result] = await pool.execute(
      'INSERT INTO notifications (user_id, type, content, related_id, related_type) VALUES (?, ?, ?, ?, ?)',
      [userId, type, content, relatedId, relatedType]
    );
    return result.insertId;
  }

  static async findByUser(userId, { limit = 10, unreadOnly = false } = {}) {
    let query = 'SELECT * FROM notifications WHERE user_id = ?';
    const params = [userId];

    if (unreadOnly) {
      query += ' AND is_read = 0';
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async markAsRead(notificationId) {
    await pool.execute(
      'UPDATE notifications SET is_read = 1 WHERE id = ?',
      [notificationId]
    );
  }

  static async markAllAsRead(userId) {
    await pool.execute(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
      [userId]
    );
  }

  static async getUnreadCount(userId) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [userId]
    );
    return rows[0].count;
  }
}

export default Notification;