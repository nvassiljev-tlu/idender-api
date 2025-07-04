const { users, scopes, user_scopes } = require("../configs/database-simulator");
const createResponse = require("./createResponse");

function requireScopes(requiredScopeNames = [], user_id) {
  return (req, res, next) => {
    req.userId = user_id
    const userId = req.user_id || req.userId || req.params.user_id || req.query.user_id;

    if (!userId) {
      return res.status(400).json(createResponse(400, {}, { error: "[Scopes] User ID is required" }));
    }

    const user = users.find((u) => u.id === userId && u.is_active);
    if (!user) {
      return res.status(404).json(createResponse(404, {}, { error: "[Scopes] User not found" }));
    }

    const requiredScopeIds = requiredScopeNames
      .map((name) => {
        const scope = scopes.find((s) => s.name === name);
        return scope ? scope.id : null;
      })
      .filter((id) => id !== null);

    if (requiredScopeIds.length !== requiredScopeNames.length) {
      return res.status(500).json(createResponse(500, {}, { error: "[Scopes] Some required scopes do not exist" }));
    }

    const userScopeIds = user_scopes
      .filter((us) => us.userId === userId)
      .map((us) => us.scopeId);

    const hasAllScopes = requiredScopeIds.every((reqId) => userScopeIds.includes(reqId));

    if (!hasAllScopes) {
      return res.status(403).json(createResponse(403, {}, { error: "[Scopes] User does not have the required scopes" }));
    }

    next();
  };
}

module.exports = { requireScopes };