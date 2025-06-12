const crypto = require('crypto');
const db = require('../../../middlewares/database');
const { getUserId } = require('../../../middlewares/getUserId');
const { DateTime } = require('luxon');

class IdeasService {
  static async listIdeas() {
    const [suggestions] = await db.promise().query('SELECT * FROM suggestions');
    return suggestions;
  }

  static async createIdea({ title = String, description = String, categories = [], is_anonymus = 0 | 1 }, req) {
    if (!title || !description || categories.length === 0 || typeof is_anonymus !== 'number' || (is_anonymus !== 0 && is_anonymus !== 1)) {
      throw new Error('Missing required fields: title, description, categories, is_anonymus');
    }
    if (title.length < 3 || title.length > 30) {
      throw new Error('Title must be between 3 and 30 characters');
    }
    if (description.length < 10 || description.length > 1000) {
      throw new Error('Description must be between 10 and 1000 characters');
    }

    const user_id = await getUserId(req);
    if (!user_id) {
      throw new Error('User not authenticated');
    }

    for (const category of categories) {
      if (typeof category !== 'number') {
        throw new Error('Invalid category ID');
      }
      const [categoryExists] = await db.promise().query('SELECT id FROM categories WHERE id = ?', [category]);
      if (categoryExists.length === 0) {
        throw new Error(`Category with ID ${category} does not exist`);
      }
    }
    const nowTallinn = DateTime.now().setZone('Europe/Tallinn');
    const createdAt = Math.floor(nowTallinn.toMillis());
    
    const idea = {
      title,
      description,
      user_id,
      createdAt,
      is_anonymus: is_anonymus,
      status: 0
    };
    const query = await db.promise().execute('INSERT INTO suggestions (title, description, user_id, createdAt, is_anonymus, status) VALUES (?, ?, ?, ?, ?, ?)',
      [idea.title, idea.description, idea.user_id, idea.createdAt, idea.is_anonymus, idea.status]
    );

    for (const category of categories) {
      await db.promise().query(
        'INSERT INTO suggestions_categories (suggestion_id, category_id) VALUES (?, ?)',
        [idea.id, category]
      );
    }

    return { id: query[0].insertId };
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

  static async getComments(suggestion_id) {
    const [comments] = await db.promise().query(
      'SELECT * FROM suggestion_comments WHERE suggestion_id = ?',
      [suggestion_id]
    );
    
    return comments;
  }

  static async addComment(suggestion_id, { user_id, content }) {
    if (!content || !user_id) throw new Error('Missing required fields');
    
    const created_at = new Date();

    await db.promise().query(
      `INSERT INTO suggestion_comments 
       (suggestion_id, user_id, comment, created_at) 
       VALUES (?, ?, ?, ?)`,
      [suggestion_id, user_id, content, created_at]
    );

    return comment;
  }

  static async deleteComment(suggestion_id, id) {
    const [result] = await db.promise().execute(
      `DELETE FROM suggestion_comments 
       WHERE id = ? AND suggestion_id = ?`,
      [id, suggestion_id]
    );
    
    if (result.affectedRows === 0) throw new Error('Comment not found');
    return { success: true };
  }

  static async getCategories() {
    const [categories] = await db.promise().query('SELECT * FROM categories');
    return categories;
  }
  
}

module.exports = IdeasService;