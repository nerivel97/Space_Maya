import pool from '../config/db.js';

class Group {
  static async create({ name, description, university, isPublic, createdBy }) {
    const [result] = await pool.execute(
      'INSERT INTO groups (name, description, university, is_public, created_by) VALUES (?, ?, ?, ?, ?)',
      [name, description, university, isPublic, createdBy]
    );
    return result.insertId;
  }

  static async findAll({ search = '', university = '', featured = false }) {
    let query = 'SELECT * FROM groups WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (university) {
      query += ' AND university = ?';
      params.push(university);
    }

    if (featured) {
      query += ' AND is_featured = 1';
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM groups WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async addMember(groupId, userId, isAdmin = false) {
    await pool.execute(
      'INSERT INTO group_members (group_id, user_id, is_admin) VALUES (?, ?, ?)',
      [groupId, userId, isAdmin]
    );
  }

  static async isMember(groupId, userId) {
    const [rows] = await pool.execute(
      'SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, userId]
    );
    return rows.length > 0;
  }

  static async getMembersCount(groupId) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM group_members WHERE group_id = ?',
      [groupId]
    );
    return rows[0].count;
  }

  static async getDiscussionsCount(groupId) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM discussions WHERE group_id = ?',
      [groupId]
    );
    return rows[0].count;
  }
}

export default Group;