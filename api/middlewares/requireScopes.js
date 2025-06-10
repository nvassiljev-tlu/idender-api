const createResponse = require("./createResponse");
const db = require("./database")
const { DateTime } = require('luxon');

function requireScopes(requiredScopeNames = []) {
  return async (req, res, next) => {
    try {
      if (!req.cookies.sid) {
        return res.status(401).json(createResponse(401, {}, { error: "[Scopes] Unauthorized access" }));
      }

      const nowTallinn = DateTime.now().setZone('Europe/Tallinn');
      const unixTimestampMilliseconds = Math.floor(nowTallinn.toMillis());

      console.log(unixTimestampMilliseconds)

      const [rows1] = await db.promise().query('SELECT * FROM session WHERE sid = ? AND expires > ?', [req.cookies.sid, unixTimestampMilliseconds]);
      if (rows1.length === 0) {
        return res.status(401).json(createResponse(401, {}, { error: "[Scopes] Session expired or not found" }));
      }

      const session = rows1[0];
      const [rows2] = await db.promise().query('SELECT * FROM users WHERE id = ?', [session.userId]);
      if (rows2.length === 0) {
        return res.status(404).json(createResponse(404, {}, { error: "[Scopes] User not found" }));
      }

      const user = rows2[0];

      const [scopes] = await db.promise().query('SELECT * FROM scope');

      const requiredScopeIds = requiredScopeNames.map((name) => {
        const scope = scopes.find((s) => s.name === name);
        return scope ? scope.id : null;
      }).filter((id) => id !== null);

      if (requiredScopeIds.length !== requiredScopeNames.length) {
        return res.status(500).json(createResponse(500, {}, { error: "[Scopes] Some required scopes do not exist" }));
      }

      const [user_scopes] = await db.promise().query('SELECT * FROM user_scope WHERE userId = ?', [user.id]);

      const userScopeIds = user_scopes.map((us) => us.scopeId);

      const hasAllScopes = requiredScopeIds.every((reqId) => userScopeIds.includes(reqId));

      if (!hasAllScopes) {
        return res.status(403).json(createResponse(403, {}, { error: "[Scopes] User does not have the required scopes" }));
      }

      next();
    } catch (err) {
      console.error("[Scopes] Middleware error:", err);
      return res.status(500).json(createResponse(500, {}, { error: "[Scopes] Internal server error" }));
    }
  };
}

module.exports = { requireScopes };
