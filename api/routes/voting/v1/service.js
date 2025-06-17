const { DateTime } = require('luxon');
const db = require('../../../middlewares/database');
const createNewsEntry = require('../../../middlewares/createNewsEntry');

class VotingService {
  static async getRandomUnvotedSuggestion(userId) {
    const [rows] = await db.promise().query(`
      SELECT s.*
      FROM suggestions s
      WHERE s.status = 1
      AND s.id NOT IN (
        SELECT ideaId FROM vote WHERE userId = ?
      )
      ORDER BY RAND()
      LIMIT 1
    `, [userId]);

    if (rows.length === 0) {
      return null;
    } else {
      const idea = rows[0];
      let idea_user;
      if (idea.is_anonymus === 1) {
        idea_user = 'Anonymous';
      } else {
        const [userRows] = await db.promise().query(`
          SELECT first_name, last_name FROM users WHERE id = ?
        `, [idea.user_id]);
        idea_user = userRows.length > 0 ? `${userRows[0].first_name} ${userRows[0].last_name}` : 'Unknown User';
      }
      const [categories] = await db.promise().query(
          'SELECT c.* FROM suggestions_categories sc INNER JOIN categories c ON sc.category_id = c.id WHERE sc.suggestion_id = ?',
          [idea.id]
      );

      idea.categories = categories.map(category => ({
        id: category.id,
        name: category.name
      }));

      return {
        title: idea.title,
        description: idea.description,
        author: idea_user,
        id: idea.id,
        categories: idea.categories
      }
    }
  }

  static async getVotesForIdea(ideaId) {
    const [[idea]] = await db.promise().query(`
      SELECT id, title, description, user_id, is_anonymus
      FROM suggestions
      WHERE id = ?
    `, [ideaId]);
    if (!idea) {
      throw new Error('Idea not found');
    }
    const [votes] = await db.promise().query(`
      SELECT userId, reaction
      FROM vote
      WHERE ideaId = ?
    `, [ideaId]);;
    const [userRows] = await db.promise().query(`
      SELECT first_name, last_name FROM users WHERE id = ?
    `, [idea.user_id]);
    const idea_user = userRows.length > 0 ? `${userRows[0].first_name} ${userRows[0].last_name}` : 'Unknown User';
    const likes = votes.filter(v => v.reaction === 1).length;
    const dislikes = votes.filter(v => v.reaction === 0).length;
    return {
      id: idea.id,
      title: idea.title,
      description: idea.description,
      author: idea_user,
      user_id: idea.user_id,
      likes,
      dislikes,
    }
  }


  static async vote(userId, suggestionId, reaction) {
    let oldStatus = null;
    let idea;
    try {
      const [[existingSuggestion]] = await db.promise().execute(
        'SELECT * FROM suggestions WHERE id = ?',
        [suggestionId]
      );

      if (!existingSuggestion) {
        throw new Error('Suggestion does not exist');
      } else {
        idea = existingSuggestion;
        oldStatus = existingSuggestion.status;
      }

      await db.promise().execute(
        `INSERT INTO vote (ideaId, userId, reaction)
        VALUES (?, ?, ?)`,
        [suggestionId, userId, reaction]
      );
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') {
        throw new Error('You already voted on this suggestion');
      }
      throw e;
    }

    if (oldStatus !== 1) {
      return true;
    }

    const nowTallinn = DateTime.now().setZone('Europe/Tallinn');
    const lastMonth = nowTallinn.minus({ months: 1 }).toMillis();

    const [[likes]] = await db.promise().query(`
      SELECT COUNT(*) as count FROM vote
      WHERE ideaId = ? AND reaction = 1
    `, [suggestionId]);

    const [[dislikes]] = await db.promise().query(`
      SELECT COUNT(*) as count FROM vote
      WHERE ideaId = ? AND reaction = 0
    `, [suggestionId]);

    const [[activeUsers]] = await db.promise().query(`
      SELECT COUNT(DISTINCT userId) as count
      FROM session
      WHERE updatedAt >= ?
    `, [lastMonth]);

    const likeThreshold = Math.ceil(activeUsers.count * 0.4);
    const dislikeThreshold = Math.ceil(activeUsers.count * 0.5);

    let newStatus = null;
    if (likes.count >= likeThreshold) {
      newStatus = 2;
    } else if (dislikes.count >= dislikeThreshold) {
      newStatus = 6;
    }

    if (newStatus !== null) {
      await db.promise().execute(`
        UPDATE suggestions SET status = ? WHERE id = ?
      `, [newStatus, suggestionId]);

      if (newStatus === 2) {
        createNewsEntry(
          `Idea ${idea.title} is pending school administration review`,
          `Idea ${idea.title} has received enough positive votes and is now pending review by the school administration.`,
          1
        )
      } else if (newStatus === 6) {
        createNewsEntry(
          `Idea ${idea.title} has been rejected`,
          `Idea ${idea.title} has received many negative votes and has been rejected.`,
          1
        );
      }
    }

    return true;
  }
}


module.exports = VotingService;
