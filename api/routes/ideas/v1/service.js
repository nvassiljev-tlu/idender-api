const crypto = require('crypto');
const db = require('../../../middlewares/database');

class IdeasService {
  static async listIdeas() {
    const [suggestions] = await db.promise().query('SELECT * FROM suggestions');
    return suggestions;
  }

  static async createIdea({ title, description, user_id }) {
     const id = crypto.randomUUID();
    const createdAt = new Date();
    
    await db.promise().query(
      `INSERT INTO suggestions 
        (title, description, user_id, createdAt, is_anonymus, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description, user_id, createdAt, 0, 0]
    );

    const idea = {
      id,
      title,
      description,
      user_id,
      createdAt,
      is_anonymus: 0,
      status: 0
    };
    await db.promise().query('INSERT INTO suggestions (id, title, description, user_id, createdAt, is_anonymus, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [idea.id, idea.title, idea.description, idea.user_id, idea.createdAt, idea.is_anonymus, idea.status]
    );

    return idea;
  }

  static async getIdeaById(id) {
  const [ideas] = await db.promise().query(
      'SELECT * FROM suggestions WHERE id = ?', 
      [id]
    );
    
    if (ideas.length === 0) throw new Error('Idea not found');
    return ideas[0];
  }

  static async updateIdea(id, data) {
  const { title, description } = data;
    await db.promise().query(
      `UPDATE suggestions 
       SET title = ?, description = ?, updatedAt = ? 
       WHERE id = ?`,
      [title, description, new Date(), id]
    );
    
    return this.getIdeaById(id);
  }

  static async deleteIdea(id) {
    const [result] = await db.promise().execute(
      'DELETE FROM suggestions WHERE id = ?', 
      [id]
    );
    
    if (result.affectedRows === 0) throw new Error('Idea not found');

    return { success: true };
  }

  /*
  static async performAction(id, action) {
    if (!action) throw new Error('Action is required');
    
    const idea = await this.getIdeaById(id);
    if (!idea) throw new Error('Idea not found');

    return { 
      id, 
      action, 
      createdAt: new Date(),
      status: 0 // Example status, adjust as needed
    };
  }
  */

  static async getComments(ideaId) {
    const [comments] = await db.promise().query(
      'SELECT * FROM suggestion_comments WHERE ideaId = ?',
      [ideaId]
    );
    
    return comments;
  }

  static async addComment(ideaId, { user_id, content }) {
    if (!content || !user_id) throw new Error('Missing required fields');
    
    const created_at = new Date();

    await db.promise().query(
      `INSERT INTO suggestion_comments 
       (suggestion_id, user_id, comment, created_at) 
       VALUES (?, ?, ?, ?, ?)`,
      [ideaId, user_id, content, created_at]
    );

    return comment;
  }

  static async deleteComment(ideaId, id) {
    const [result] = await db.promise().execute(
      `DELETE FROM suggestion_comments 
       WHERE id = ? AND suggestion_id = ?`,
      [id, ideaId]
    );
    
    if (result.affectedRows === 0) throw new Error('Comment not found');
    return { success: true };
  }
  
}

module.exports = IdeasService;