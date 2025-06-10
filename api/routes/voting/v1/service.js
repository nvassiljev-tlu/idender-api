const db = require('../../../middlewares/database');
const crypto = require('crypto');

class VotingService {
  // Get global voting information for all ideas
  static async getGlobalInfo() {
    const [results] = await db.promise().query(`
      SELECT 
        s.id AS suggestion_id,
        SUM(CASE WHEN v.reaction = 1 THEN 1 ELSE 0 END) AS likes,
        SUM(CASE WHEN v.reaction = 0 THEN 1 ELSE 0 END) AS dislikes
      FROM suggestions s
      LEFT JOIN vote v ON s.id = v.suggestion_id
      GROUP BY s.id
    `);
    return results;
  }
  static async getVotesForIdea(suggestion_id) {
    const [votes] = await db.promise().query(
      'SELECT * FROM vote WHERE suggestion_id = ?',
      [suggestion_id]
    );
    return votes;
  }

  static async getNextIdea(userId) {
    const [availableIdeas] = await db.promise().query(`
      SELECT s.* 
      FROM suggestions s
      WHERE s.status = 1
        AND s.id NOT IN (
          SELECT v.suggestion_id 
          FROM vote v 
          WHERE v.userId = ?
        )
      ORDER BY RAND()
      LIMIT 1
    `, [userId]);
    
    return availableIdeas[0] || null;
  }

  static async vote(suggestion_id, userId, reaction) {
    if (![0, 1].includes(reaction)) {
      throw new Error("Invalid reaction value. Must be 0 (dislike) or 1 (like).");
    }

    const [idea] = await db.promise().query(
      'SELECT id FROM suggestions WHERE id = ?',
      [suggestion_id]
    );
    if (!idea.length) {
      throw new Error("Idea does not exist");
    }

    await db.promise().query(
      `INSERT INTO vote (id, suggestion_id, userId, reaction, createdAt) 
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [crypto.randomUUID(), suggestion_id, userId, reaction]
    );
  }
}

module.exports = VotingService;