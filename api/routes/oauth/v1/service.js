const crypto = require('crypto');
const bcrypt = require('bcrypt');
const db = require('../../../middlewares/database')
const { DateTime } = require('luxon');
const checkScopes = require('../../../middlewares/checkScopes');

class OAuthService {

 static async signup({ email, first_name, last_name, password }) {
  if (!email || !first_name || !last_name || !password) throw new Error('Missing required fields.');
  if (password.length < 8) throw new Error('Password too short.');
  if (password.length > 64) throw new Error('Password too long.');
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) throw new Error('Invalid email format.');
  if (!email.endsWith('@tpl.edu.ee')) throw new Error('You are not allowed to use this email.');
  const [rows] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
  if (rows.length > 0) throw new Error('Email already used.');

  const hashedPassword = await bcrypt.hash(password, 10);
  const user_id = crypto.randomUUID();
  const nowTallinn = DateTime.now().setZone('Europe/Tallinn');
  const unixTimestampMilliseconds = Math.floor(nowTallinn.toMillis());

  const user = {
    id: user_id,
    email,
    first_name,
    last_name,
    password: hashedPassword,
    is_active: true
  };

  const newScopes = {
    userId: user.id,
    scopeId: 2
  };

  const code = crypto.randomInt(100000, 999999).toString();
  const otp = {
    email,
    code,
    expires_at: Math.floor(nowTallinn.plus({ minutes: 10 })),
    created_at: unixTimestampMilliseconds,
    id: crypto.randomUUID(),
    verified: 0
  };

  await db.promise().execute('INSERT INTO users (email, first_name, last_name, password, is_active, id) VALUES (?, ?, ?, ?, ?, ?)', [email, first_name, last_name, hashedPassword, true, user_id]).catch(err => {
    console.error('Error inserting user:', err);
    throw new Error('Database error while inserting user.');
  });
  await db.promise().execute('INSERT INTO user_scope (userId, scopeId) VALUES (?, ?)', [user.id, newScopes.scopeId]).catch(err => {
    console.error('Error inserting user scope:', err);
    throw new Error('Database error while inserting user scope.');
  });
  await db.promise().execute('INSERT INTO otp_code (id, email, code, expiresAt, createdAt, verified) VALUES (?, ?, ?, ?, ?, ?)', [otp.id, otp.email, otp.code, otp.expires_at, otp.created_at, 0]).catch(err => {
    console.error('Error inserting OTP:', err);
    throw new Error('Database error while inserting OTP.');
  });

  const userWithoutPassword = { ...user };
  delete userWithoutPassword.password;
  return { user: userWithoutPassword, otp };
}


static async login(email, password) {
  const [rows] = await db.promise().query('SELECT * FROM users WHERE email = ? AND is_active = ?', [email, 1]);
  if (rows.length === 0) throw new Error('[oAuth] Invalid credentials');
  const user = rows[0];

  if (user && user.is_active === 0) {
    throw new Error('[oAuth] User is not active');
  }

  const hasAccessScope = await checkScopes(user.id, ['auth:access']);
  if (!hasAccessScope) {
    throw new Error('[oAuth] User does not have the required scope to access this resource.');
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) throw new Error('[oAuth] Invalid credentials');

  const sid = crypto.randomUUID();
  const nowTallinn = DateTime.now().setZone('Europe/Tallinn');
  const unixTimestampMilliseconds = Math.floor(nowTallinn.toMillis());
  const expires = nowTallinn.plus({ days: 1 }).setZone('Europe/Tallinn');

  const session = {
    sid,
    userId: user.id,
    createdAt: unixTimestampMilliseconds,
    updatedAt: unixTimestampMilliseconds,
    expires: expires.toMillis(),
    data: JSON.stringify({
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name
    })
  };

  await db.promise().execute('INSERT INTO session (sid, userId, createdAt, updatedAt, expires, data) VALUES (?, ?, ?, ?, ?, ?)', [session.sid, session.userId, session.createdAt, session.updatedAt, session.expires, session.data]).catch(err => {
    console.error('Error inserting session:', err);
    throw new Error('Database error while inserting session.');
  });
  return { sid: session.sid, lang: user.lang };
}


  static async logout(sid) {
    if (!sid) throw new Error('[oAuth] Session ID is required for logout.');

    return await db.promise().execute('DELETE FROM session WHERE sid = ?', [sid])
      .then(() => {
        console.log('[oAuth] User logged out successfully.');
        return true;
      })
      .catch(err => {
        console.error('Error during logout:', err);
        throw new Error('[oAuth] Error during logout.');
      });
  }

  static async getNewOtp(email) {
    try {
      const [rows1] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
      if (rows1.length === 0) throw new Error('[oAuth] User not found.');
      const user = rows1[0];
      const [rows2] = await db.promise().query('SELECT * FROM user_scope WHERE userId = ? AND scopeId = ?', [user.id, 2])
      if (rows2.length === 0) throw new Error('[oAuth] User does not have the required scope.');
      const nowTallinn = DateTime.now().setZone('Europe/Tallinn');
      const unixTimestampMilliseconds = Math.floor(nowTallinn.toMillis());
      const [rows3] = await db.promise().query('SELECT * FROM otp_code WHERE email = ? AND verified = 0', [email]);
      if (rows3.length > 0) {
        const otp = rows3[0];
        if (otp.expiresAt > unixTimestampMilliseconds) {
          return otp.code
        }
        await db.promise().execute('DELETE FROM otp_code WHERE id = ?', [otp.id]);
        const code = crypto.randomInt(100000, 999999).toString();
        const newOtp = {
          email,
          code,
          expiresAt: Math.floor(nowTallinn.plus({ minutes: 10 }).toMillis()),
          createdAt: unixTimestampMilliseconds,
          id: crypto.randomUUID(),
          verified: 0
        };
        await db.promise().execute('INSERT INTO otp_code (id, email, code, expiresAt, createdAt, verified) VALUES (?, ?, ?, ?, ?, ?)', [newOtp.id, newOtp.email, newOtp.code, newOtp.expiresAt, newOtp.createdAt, newOtp.verified]);
        return code;
      } else {
        const code = crypto.randomInt(100000, 999999).toString();
        const otp = {
          email,
          code,
          expiresAt: Math.floor(nowTallinn.plus({ minutes: 10 }).toMillis()),
          createdAt: unixTimestampMilliseconds,
          id: crypto.randomUUID(),
          verified: 0
        };
        await db.promise().execute('INSERT INTO otp_code (id, email, code, expiresAt, createdAt, verified) VALUES (?, ?, ?, ?, ?, ?)', [otp.id, otp.email, otp.code, otp.expiresAt, otp.createdAt, otp.verified]);
        return code;
      }
    } catch (err) {
      console.error('Error generating new OTP:', err);
      throw new Error(`[oAuth] Error generating new OTP: ${err.message}`);
    }
  }
  
   static async verifyOtp(email, code) {
    const [rows1] = await db.promise().query('SELECT * FROM otp_code WHERE email = ? AND code = ? AND verified = 0', [email, code]);

    if (rows1.length === 0) throw new Error('[oAuth] Invalid OTP code.');

    const otp = rows1[0];
    const now = DateTime.now().setZone('Europe/Tallinn');

    if (otp.expiresAt < Math.floor(now.toMillis())) {
        throw new Error('[oAuth] OTP code has expired.');
    }

    const [rows2] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows2.length === 0) throw new Error('[oAuth] User not found.');
    const user = rows2[0];

    const hasSignupScope = await checkScopes(user.id, ['auth:signup']);
    if (!hasSignupScope) {
      throw new Error('[oAuth] User does not have the required scope to verify OTP.');
    }

    const newScopes = [
        { userId: user.id, scopeId: 1 },
        { userId: user.id, scopeId: 6 },
        { userId: user.id, scopeId: 7 },
        { userId: user.id, scopeId: 10 },
        { userId: user.id, scopeId: 11 },
        { userId: user.id, scopeId: 13 },
        { userId: user.id, scopeId: 14 }
    ];

    for (const scope of newScopes) {
      await db.promise().execute('INSERT INTO user_scope (userId, scopeId) VALUES (?, ?)', [scope.userId, scope.scopeId]).catch(err => {
        console.error('Error inserting user scope:', err);
        throw new Error('Database error while inserting user scope.');
      });
    }

    await db.promise().execute('DELETE FROM user_scope WHERE userId = ? AND scopeId = ?', [user.id, 14]).catch(err => {
      console.error('Error deleting user scope:', err);
    });

    await db.promise().execute('UPDATE otp_code SET verified = 1 WHERE id = ?', [otp.id]).catch(err => {
      console.error('Error updating OTP:', err);
      throw new Error('Database error while updating OTP.');
    })

    return otp;
  }

  static async getSession(sid) {
    const [rows1] = await db.promise().query('SELECT * FROM session WHERE sid = ?', [sid]);
    if (rows1.length === 0) throw new Error('[oAuth] Session not found');
    const [rows2] = await db.promise().query('SELECT * FROM users WHERE id = ?', [rows1[0].userId]);
    if (rows2.length === 0) throw new Error('[oAuth] User not found');
    const user = rows2[0];

    return {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      },
    };
  }

  static async forgotPassword(email) {
    try {
      const nowTallinn = DateTime.now().setZone('Europe/Tallinn');
      const unixTimestampMilliseconds = Math.floor(nowTallinn.toMillis());

      const session = {
        email,
        code: crypto.randomUUID(),
        created_at: unixTimestampMilliseconds,
        expires_at: Math.floor(nowTallinn.plus({ minutes: 10 }).toMillis()),
      }

      await db.promise().execute('INSERT INTO forgot_password_session (email, code, expired_at, created_at) VALUES (?, ?, ?, ?)', [session.email, session.code, session.expires_at, session.created_at]).catch(err => {
        console.error('Error inserting forgot password session:', err);
        throw new Error('Database error while inserting forgot password session.');
      });

      return session;
    } catch (err) {
      console.error('Error during forgot password:', err);
      throw new Error(`[oAuth] Error during forgot password: ${err.message}`);
    }
  }

  static async resetPassword(email, code, new_password) {
    try {
      if (!email || !code || !new_password) {
        throw new Error('[oAuth] Email, code, and new password are required to reset password.');
      }

      const [rows] = await db.promise().query('SELECT * FROM forgot_password_session WHERE email = ? AND code = ? AND expired_at > ? AND is_used = ?', [email, code, Math.floor(DateTime.now().setZone('Europe/Tallinn').toMillis()), 0]);

      if (rows.length === 0) {
        throw new Error('[oAuth] Invalid or expired reset password code.');
      }

      const hashedPassword = await bcrypt.hash(new_password, 10);
      await db.promise().execute('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]).catch(err => {
        console.error('Error updating user password:', err);
        throw new Error('Database error while updating user password.');
      });

      await db.promise().execute('UPDATE forgot_password_session SET is_used = ? WHERE email = ? AND code = ?', [1, email, code]).catch(err => {
        console.error('Error deleting forgot password session:', err);
      });

      return true;
    } catch (err) {
      console.error('Error during reset password:', err);
      throw new Error(`[oAuth] Error during reset password: ${err.message}`);
    }
  }
}

module.exports = OAuthService;