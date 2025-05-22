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
      'INSERT INTO group_members (group_id, user_id, is_admin, last_read_at) VALUES (?, ?, ?, NOW())',
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

  static async getMessagesCount(groupId) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM group_messages WHERE group_id = ?',
      [groupId]
    );
    return rows[0].count;
  }

  static async findByUser(userId) {
    const [rows] = await pool.execute(
      `SELECT g.*, 
       (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as members,
       (SELECT COUNT(*) FROM group_messages WHERE group_id = g.id) as messages,
       (SELECT content FROM group_messages WHERE group_id = g.id ORDER BY created_at DESC LIMIT 1) as last_message_content,
       (SELECT COUNT(*) FROM group_messages 
        WHERE group_id = g.id AND user_id != ? AND created_at > 
        (SELECT last_read_at FROM group_members WHERE group_id = g.id AND user_id = ?)) as unread_count
       FROM groups g
       JOIN group_members gm ON g.id = gm.group_id
       WHERE gm.user_id = ?`,
      [userId, userId, userId]
    );
    
    return rows.map(group => ({
      ...group,
      lastMessage: group.last_message_content ? { content: group.last_message_content } : null,
      unreadCount: group.unread_count || 0
    }));
  }

  static async updateLastRead(groupId, userId) {
    await pool.execute(
      'UPDATE group_members SET last_read_at = NOW() WHERE group_id = ? AND user_id = ?',
      [groupId, userId]
    );
  }

  static async getGroupWithStats(groupId, userId) {
    const [groups] = await pool.execute(
      `SELECT g.*,
       (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as members,
       (SELECT COUNT(*) FROM group_messages WHERE group_id = g.id) as messages,
       (SELECT COUNT(*) FROM group_messages 
        WHERE group_id = g.id AND user_id != ? AND created_at > 
        (SELECT last_read_at FROM group_members WHERE group_id = g.id AND user_id = ?)) as unread_count
       FROM groups g
       WHERE g.id = ?`,
      [userId, userId, groupId]
    );
    
    return groups[0] || null;
  }
}

export default Group;