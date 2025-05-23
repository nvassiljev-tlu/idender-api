const {users, suggestions, scopes, suggestion_reactions} = require('../../../configs/database-simulator.js');
const crypto = require('crypto');

class VotingService {
  // get stats about all posts (likes and dislikes)
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
      dislikes: counts.dislikes
    }));
  }

  // get data about one post (likes and dislikes)
  static getVotesForIdea(ideaId) {
    return suggestion_reactions.filter(v => v.suggestion_id === ideaId);
  }

  // find next post that the user did not vote on
  static getNextIdea(userId) {
    const votedIdeaIds = suggestion_reactions
      .filter(r => r.user_id === userId)
      .map(r => r.suggestion_id);

    const availableIdeas = suggestions.filter(
      s => !votedIdeaIds.includes(s.id) && s.status === 1 // only active posts
    );

    if (availableIdeas.length === 0) {
      return null; // no new posts available
    }

    // return a random post from the available ones
    const randomIndex = Math.floor(Math.random() * availableIdeas.length);
    return availableIdeas[randomIndex];
  }

  // write a reaction to a post
  // reaction: 1 for like, 0 for dislike
  static vote(ideaId, userId, reaction) {
    if (![0, 1].includes(reaction)) {
      throw new Error("Invalid reaction value. Must be 0 (dislike) or 1 (like).");
    }

    // check if post exists
    const ideaExists = suggestions.some(s => s.id === ideaId);
    if (!ideaExists) {
      throw new Error("Idea does not exist");
    }

    // add a new reaction
    suggestion_reactions.push({
      id: crypto.randomUUID(),
      reaction, // 1 for like, 0 for dislike
      suggestion_id: ideaId,
      user_id: userId
    });
  }
}

module.exports = VotingService;