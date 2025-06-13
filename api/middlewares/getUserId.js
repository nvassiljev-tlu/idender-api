const db = require("./database")

async function getUserId(req) {
    if (!req.cookies.sid) {
        throw new Error("Session ID not found in cookies.");
    }
    
    const [rows] = await db.promise().query('SELECT userId FROM session WHERE sid = ?', [req.cookies.sid]);
    
    if (rows.length === 0) {
        throw new Error("Session not found or expired.");
    }
    
    return rows[0].userId;
}

module.exports = { getUserId };