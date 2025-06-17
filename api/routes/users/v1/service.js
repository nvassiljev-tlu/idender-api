const db = require('../../../middlewares/database');
const checkScopes = require('../../../middlewares/checkScopes');

class UsersService {
  async getAll() {
    const [users] = await db.promise().query('SELECT * FROM users');

    const processedUsers = await Promise.all(users.map(async user => {
      delete user.password;
      delete user.created_at;
      delete user.lang;

      const isActive = await checkScopes(user.id, ["auth:access"])
      const isAdmin = await checkScopes(user.id, ["user:admin"])

      user.is_active = isActive;
      user.is_admin = isAdmin;
      return user;
    }));

    return processedUsers;
  }

  async getById(id) {
    const [user] = await db.promise().query('SELECT * FROM users WHERE id = ?', [id]);
    delete user[0].password
    return user[0];
  }

  async update(id, data) {
    const { preferred_language, profile_picture } = data
    if (!preferred_language && !profile_picture) {
      throw new Error('At least one field must be provided for update');
    } else {
      const updates = [];
      const values = [];

      if (preferred_language) {
        updates.push('lang = ?');
        values.push(preferred_language);
      }
      if (profile_picture) {
        updates.push('profile_picture = ?');
        values.push(profile_picture);
      }

      values.push(id);
      const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
      await db.promise().query(query, values);
    }
    return this.getById(id);
  }

  async setActive(id, active) {
    if (active === true) {
      await db.promise().execute('INSERT IGNORE INTO user_scope (userId, scopeId) VALUES (?, 1)', [id]);
    } else if (active === false) {
      await db.promise().execute('DELETE FROM user_scope WHERE userId = ? AND scopeId = 1', [id]);
    }
    return this.getById(id);
  }

  async assignScopes(userId, scopeIds) {
    await db.promise().query('DELETE FROM user_scope WHERE userId = ?', [userId]);
    
    for (const scopeId of scopeIds) {
      await db.promise().query(
        'INSERT INTO user_scope (userId, scopeId) VALUES (?, ?)',
        [userId, scopeId]
      );
    }

    const [scopes] = await db.promise().query(
      'SELECT * FROM user_scope WHERE userId = ?',
      [userId]
    );
    
    return scopes;
  }

  async getIdeasByUser(userId) {
    const [suggestions] = await db.promise().query(
      'SELECT * FROM suggestions WHERE user_id = ?',
      [userId]
    );
    return suggestions;
  }
}

module.exports = UsersService;
