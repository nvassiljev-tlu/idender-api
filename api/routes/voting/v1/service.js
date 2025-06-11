const { users, suggestions, scopes, suggestion_reactions } = require('../../../configs/database-simulator.js');
const crypto = require('crypto');

class VotingService {
  static getGlobalInfo() {
    const ideasWithReactions = {};

    for (const reaction of suggestion_reactions) {
      const ideaId = reaction.suggestion_id;
      if (!ideasWithReactions[ideaId]) {
        ideasWithReactions[ideaId] = { likes: 0, dislikes: 0 };
      }
      if (reaction.reaction === 1) {
        ideasWithReactions[ideaId].likes += 1;
      } else if (reaction.reaction === 0) {
        ideasWithReactions[ideaId].dislikes += 1;
      }
    }

    return Object.entries(ideasWithReactions).map(([ideaId, counts]) => ({
      ideaId,
      likes: counts.likes,
      dislikes: counts.dislikes,
    }));
  }

  static getVotesForIdea(ideaId) {
    return suggestion_reactions.filter(v => v.suggestion_id === parseInt(ideaId, 10));
  }


  static vote(ideaId, userId, reaction) {
    if (![0, 1].includes(reaction)) {
      throw new Error("Invalid reaction value. Must be 0 (dislike) or 1 (like).");
    }

    const ideaIdNum = parseInt(ideaId, 10);
    const ideaExists = suggestions.some(s => s.id === ideaIdNum);
    if (!ideaExists) {
      throw new Error("Idea does not exist");
    }

    const newReaction = {
      id: crypto.randomUUID(),
      reaction,
      suggestion_id: ideaIdNum,
      user_id: userId,
      created_at: new Date(),
    };
    console.log('New reaction added:', newReaction, 'created_at:', newReaction.created_at.toISOString());
    suggestion_reactions.push(newReaction);
  }
}


module.exports = VotingService;