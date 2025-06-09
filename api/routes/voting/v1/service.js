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

  static getNextIdea(userId) {
    const votedIdeaIds = suggestion_reactions
      .filter(r => r.user_id === userId)
      .map(r => r.suggestion_id);

    const availableIdeas = suggestions.filter(
      s => !votedIdeaIds.includes(s.id) && s.status === 1
    );

    if (availableIdeas.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * availableIdeas.length);
    return availableIdeas[randomIndex];
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

  static getVotingIntensity() {
    return {
        ...suggestion_reactions
    }
}
}


module.exports = VotingService;



//Mida teeb: Andmetöötluse loogika (business logic). See fail suhtleb "andmebaasiga" (database-simulator.js) ja teostab hääletamisega seotud toiminguid.
//Meetodid:

//getGlobalInfo() – Loendab kõigi postituste like’id ja dislike’id.

//getVotesForIdea(ideaId) – Tagastab kõik reaktsioonid (like’d/dislike’d) konkreetsele postitusele.

//getNextIdea(userId) – Leiab juhusliku postituse, mida kasutaja pole veel hääletanud.

//vote(ideaId, userId, reaction) – Lisab postitusele uue reaktsiooni (like või dislike).

//Seosed:

//Kasutab andmeid database-simulator.js failist (suggestions, suggestion_reactions).

//Kutsutakse välja controller.js failist toimingute teostamiseks.

