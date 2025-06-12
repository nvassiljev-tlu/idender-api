const db = require("./database")

async function checkScopes(userId, requiredScopeNames = []) {
  try {
    const [scopes] = await db.promise().query('SELECT * FROM scope');

    const requiredScopeIds = requiredScopeNames.map((name) => {
      const scope = scopes.find((s) => s.name === name);
      return scope ? scope.id : null;
    }).filter((id) => id !== null);

    if (requiredScopeIds.length !== requiredScopeNames.length) {
      return false;
    }

    const [userScopes] = await db.promise().query(
      'SELECT scopeId FROM user_scope WHERE userId = ?',
      [userId]
    );

    const userScopeIds = userScopes.map((us) => us.scopeId);

    return requiredScopeIds.every(reqId => userScopeIds.includes(reqId));
  } catch (error) {
    console.error('[checkScopes] Error:', error);
    return false;
  }
}

module.exports = checkScopes;
