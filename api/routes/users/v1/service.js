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
      await db.promise().execute('DELETE FROM sessions WHERE userId = ?', [id]);
    }
    return this.getById(id);
  }

  async getScopes(userId) {
    const [scopes] = await db.promise().query(
      'SELECT s.id, s.name FROM user_scope us JOIN scope s ON us.scopeId = s.id WHERE us.userId = ?',
      [userId]
    );
    return scopes;
  }

  async assignScopes(userId, scopeIds, currentUserId) {
    try {
      if (userId === "1") {
      throw new Error('You cannot modify the service account');
      }

      const [currentScopes] = await db.promise().query(
        'SELECT scopeId FROM user_scope WHERE userId = ?',
        [userId]
      );

      if (scopeIds.length === 0) {
        throw new Error('At least one scope must be provided');
      }

      if (scopeIds.includes(3)) {
        const hasAdmin = await checkScopes(currentUserId, ['user:admin']);
        if (!hasAdmin) {
          throw new Error('You are not authorized to assign admin scope');
        }
      } else if (currentScopes.some(scope => scope.scopeId === 3) && !scopeIds.includes(3) && currentUserId !== userId) {
        const hasSuperAdmin = await checkScopes(currentUserId, ['user:superadmin']);
        if (!hasSuperAdmin) {
          throw new Error('You are not authorized to remove admin scope from another user');
        }
      }

      if (scopeIds.includes(15)) {
        const [[superadminCount]] = await db.promise().query(
          'SELECT COUNT(*) as count FROM user_scope WHERE scopeId = 15'
        );
        const hasSuperAdmin = await checkScopes(currentUserId, ['user:superadmin']);
        if (!hasSuperAdmin) {
          throw new Error('You are not authorized to assign superadmin scope');
        }
        if (superadminCount.count >= 1 && currentUserId !== userId) {
          throw new Error('Only one user can have the superadmin scope at a time');
        }
      } else if (currentScopes.some(scope => scope.scopeId === 15) && !scopeIds.includes(15) && currentUserId !== userId) {
        const hasSuperAdmin = await checkScopes(currentUserId, ['user:superadmin']);
        if (!hasSuperAdmin) {
          throw new Error('You are not authorized to remove superadmin scope from another user');
        }
        if (currentUserId === userId) {
          throw new Error('You cannot remove superadmin scope from yourself, you must transfer it first.');
        }
      }

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
      
      return {status: 'ok', scopes};
    } catch (error) {
      return {status: 'error', message: error.message};
    }
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