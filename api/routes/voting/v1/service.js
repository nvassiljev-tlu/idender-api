const db = require('../../../middlewares/database');
const crypto = require('crypto');

class VotingService {
  // Get global voting information for all ideas
  static async getGlobalInfo() {
    const [results] = await db.query(`
      SELECT 
        s.id AS ideaId,
        SUM(CASE WHEN v.reaction = 1 THEN 1 ELSE 0 END) AS likes,
        SUM(CASE WHEN v.reaction = 0 THEN 1 ELSE 0 END) AS dislikes
      FROM suggestions s
      LEFT JOIN vote v ON s.id = v.ideald
      GROUP BY s.id
    `);
    return results;
  }
  static async getVotesForIdea(ideaId) {
    const [votes] = await db.query(
      'SELECT * FROM vote WHERE ideald = ?',
      [ideaId]
    );
    return votes;
  }

  static async getNextIdea(userId) {
    const [availableIdeas] = await db.query(`
      SELECT s.* 
      FROM suggestions s
      WHERE s.status = 1
        AND s.id NOT IN (
          SELECT v.ideald 
          FROM vote v 
          WHERE v.userId = ?
        )
      ORDER BY RAND()
      LIMIT 1
    `, [userId]);
    
    return availableIdeas[0] || null;
  }

  static async vote(ideaId, userId, reaction) {
    if (![0, 1].includes(reaction)) {
      throw new Error("Invalid reaction value. Must be 0 (dislike) or 1 (like).");
    }

    const [idea] = await db.query(
      'SELECT id FROM suggestions WHERE id = ?',
      [ideaId]
    );
    if (!idea.length) {
      throw new Error("Idea does not exist");
    }

    await db.query(
      `INSERT INTO vote (id, ideald, userId, reaction, createdAt) 
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [crypto.randomUUID(), ideaId, userId, reaction]
    );
  }
}

module.exports = VotingService;