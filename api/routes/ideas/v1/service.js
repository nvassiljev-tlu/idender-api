const crypto = require('crypto');
const { suggestions, suggestion_comments } = require('../../../configs/database-simulator')

class IdeasService {
  static listIdeas() {
    return suggestions;
  }

  static createIdea({ title, description, user_id }) {
    if (!title || !description || !user_id) throw new Error('Missing required fields.');

    const idea = {
      id: crypto.randomUUID(),
      title,
      description,
      user_id,
      createdAt: new Date(),
      is_anonymus: 0,
      status: 0
    };

    suggestions.push(idea);
    return idea;
  }

  static getIdeaById(id) {
    const idea = suggestions.find(i => i.id === id);
    if (!idea) throw new Error('Idea not found.');
    return idea;
  }

  static updateIdea(id, data) {
    const idea = suggestions.find(i => i.id === id);
    if (!idea) throw new Error('Idea not found.');

    Object.assign(idea, data, { updatedAt: new Date() });
    return idea;
  }

  static deleteIdea(id) {
    const index = suggestions.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Idea not found.');

    suggestions.splice(index, 1);
    return { success: true };
  }

  static performAction(id, action) {
    const idea = suggestions.find(i => i.id === id);
    if (!idea) throw new Error('Idea not found.');

    // Example logic
    return { id, action, performedAt: new Date() };
  }

  static getComments(id) {
    return suggestion_comments.filter(c => c.suggestion_id === id);
  }

  static addComment(id, { authorId, content }) {
    if (!content || !authorId) throw new Error('Missing required fields.');

    const comment = {
      id: crypto.randomUUID(),
      ideaId: id,
      authorId,
      content,
      createdAt: new Date()
    };

    suggestion_comments.push(comment);
    return comment;
  }

  static deleteComment(ideaId, commentId) {
    const index = suggestion_comments.findIndex(c => c.ideaId === ideaId && c.id === commentId);
    if (index === -1) throw new Error('Comment not found.');

    suggestion_comments.splice(index, 1);
    return { success: true };
  }

  static getWordFrequency() {
    const allTexts = suggestions.map(s => `${s.title} ${s.description}`.toLowerCase());
    const wordCounts = {};
  
    allTexts.forEach(text => {
    const words = text.match(/\b\w+\b/g);
      if (words) {
        words.forEach(word => {
          wordCounts[word] = (wordCounts[word] || 0) + 1;
        });
      }
    });
  
    return wordCounts;
  }
  
}

module.exports = IdeasService;