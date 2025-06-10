const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { users, user_scopes, sessions, otps, scopes } = require('../../../configs/database-simulator');
const db = require('../../../middlewares/database')
const { DateTime } = require('luxon');

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
    scopeId: 14
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
  return session;
}


  static logout(sid) {
    if (!sid) throw new Error('[oAuth] Session ID is required for logout.');

    return db.promise().execute('DELETE FROM session WHERE sid = ?', [sid])
      .then(() => {
        console.log('[oAuth] User logged out successfully.');
      })
      .catch(err => {
        console.error('Error during logout:', err);
        throw new Error('[oAuth] Error during logout.');
      });
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
    console.log('rows2', rows2);
    if (rows2.length === 0) throw new Error('[oAuth] User not found.');
    const user = rows2[0];

    const newScopes = [
        { userId: user.id, scopeId: 1 },
        { userId: user.id, scopeId: 5 },
        { userId: user.id, scopeId: 6 },
        { userId: user.id, scopeId: 9 },
        { userId: user.id, scopeId: 10 },
        { userId: user.id, scopeId: 12 },
        { userId: user.id, scopeId: 13 }
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
}

module.exports = OAuthService;