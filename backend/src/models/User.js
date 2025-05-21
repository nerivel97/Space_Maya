import pool from '../config/db.js';

class User {
  static async create({ email, password, isAdmin = false, profile = {} }) {
    const [result] = await pool.execute(
      'INSERT INTO users (email, password, is_admin, name, lastname, age, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        email, 
        password, 
        isAdmin,
        profile.name,
        profile.lastname,
        profile.age,
        profile.avatar,
      ]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT id, email, password, is_admin as isAdmin, name, lastname, age, avatar, university, interests, bio FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, email, is_admin as isAdmin, name, lastname, age, avatar, university, interests, bio FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async updateProfile(userId, profileData) {
    await pool.execute(
      'UPDATE users SET name = ?, lastname = ?, age = ?, avatar = ?, university = ?, interests = ?, bio = ? WHERE id = ?',
      [
        profileData.name,
        profileData.lastname,
        profileData.age,
        profileData.avatar,
        profileData.university,
        profileData.interests,
        profileData.bio,
        userId
      ]
    );
  }

  static async setAdminStatus(userId, isAdmin) {
    await pool.execute(
      'UPDATE users SET is_admin = ? WHERE id = ?',
      [isAdmin, userId]
    );
  }
}

export default User;