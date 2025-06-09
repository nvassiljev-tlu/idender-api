const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { users, user_scopes, sessions, otps, scopes } = require('../../../configs/database-simulator');

class OAuthService {

 static async signup({ email, first_name, last_name, password }) {
  if (!email || !first_name || !last_name || !password) throw new Error('Missing required fields.');
  if (password.length < 8) throw new Error('Password too short.');
  if (password.length > 64) throw new Error('Password too long.');
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) throw new Error('Invalid email format.');
  if (!email.endsWith('@tpl.edu.ee')) throw new Error('You are not allowed to use this email.');
  if (users.some(u => u.email === email)) throw new Error('Email already used.');

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = {
    id: 'UUID4' || crypto.randomUUID(),
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
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    created_at: new Date(),
    id: crypto.randomUUID(),
    verified: false
  };

  users.push(user);

  user_scopes.push(newScopes);
  otps.push(otp);

  const userWithoutPassword = { ...user };
  delete userWithoutPassword.password;
  return { user: userWithoutPassword, otp };
}


static async login(email, password) {
  const user = users.find(u => u.email === email && u.is_active);
  if (!user) throw new Error('[oAuth] Invalid credentials');

  const match = await bcrypt.compare(password, user.password);

  if (!match) throw new Error('[oAuth] Invalid credentials');

  const sid = crypto.randomUUID();
  const now = new Date();
  const expires = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

  const session = {
    id: crypto.randomUUID(),
    sid,
    userId: user.id,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    expires: expires.toISOString(),
    data: JSON.stringify({
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name
    })
  };

  sessions.push(session);
  return session;
}


  static logout(sid) {
    const index = sessions.findIndex(s => s.sid === sid);
    if (index !== -1) sessions.splice(index, 1);
  }

  
  static verifyOtp(email, code) {
    let otp = otps.find(o => o.email === email && o.code === code && !o.verified);
    if (!otp) throw new Error('[oAuth] Invalid OTP code.');

    for (let i = otps.length - 1; i >= 0; i--) {
        if (otps[i].email === email) {
        otps.splice(i, 1);
        }
    }

    otp.verified = true;

    const user = users.find(u => u.email === email);
    if (!user) throw new Error('User not found');

    const newScopes = [
        { userId: user.id, scopeId: 1 },
        { userId: user.id, scopeId: 5 },
        { userId: user.id, scopeId: 6 },
        { userId: user.id, scopeId: 9 },
        { userId: user.id, scopeId: 10 },
        { userId: user.id, scopeId: 12 },
        { userId: user.id, scopeId: 13 }
    ];

    user_scopes.push(...newScopes);

    const index = user_scopes.findIndex(us => us.userId === user.id && us.scopeId === 14);
    if (index !== -1) user_scopes.splice(index, 1);

    return otp;
}

  static async getSession(sid) {
    const session = sessions.find(s => s.sid === sid);
    if (!session) throw new Error('[oAuth] Session not found');
    const user = users.find(u => u.id === session.userId);
    if (!user) throw new Error('[oAuth] User not found');

    return {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      },
      scopes: user_scopes
        .filter(us => us.userId === user.id)
        .map(us => scopes.find(s => s.id === us.scopeId)?.name)
        .filter(Boolean)
    };
  }
}

module.exports = OAuthService;