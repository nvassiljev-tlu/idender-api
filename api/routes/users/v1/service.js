const db = require('../../../middlewares/database');

class UsersService {
  // Get all users
  async getAll() {
    const [users] = await db.query('SELECT * FROM users');
    return users;
  }

  // Get user by ID
  async getById(id) {
    const [user] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return user[0];
  }

  // Update user
  async update(id, data) {
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(data)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
    
    values.push(id);
    await db.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return this.getById(id);
  }

  // Set active status
  async setActive(id, active) {
    await db.query(
      'UPDATE users SET is_active = ? WHERE id = ?',
      [active, id]
    );
    return this.getById(id);
  }

  // Assign scopes to user
  async assignScopes(userId, scopeIds) {
    await db.query('DELETE FROM user_scope WHERE userId = ?', [userId]);
    
    for (const scopeId of scopeIds) {
      await db.query(
        'INSERT INTO user_scope (userId, scopeld) VALUES (?, ?)',
        [userId, scopeId]
      );
    }
    
    const [scopes] = await db.query(
      'SELECT * FROM user_scope WHERE userId = ?',
      [userId]
    );
    
    return scopes;
  }

  // Get user's suggestions
  async getIdeasByUser(userId) {
    const [suggestions] = await db.query(
      'SELECT * FROM suggestions WHERE user_id = ?',
      [userId]
    );
    return suggestions;
  }
}

module.exports = UsersService;