const VotingService = require('./service');
const createResponse = require('../../../middlewares/createResponse');
const { getUserId } = require('../../../middlewares/getUserId');

class VotingController {
  static async getIdeaForVoting(req, res) {
    try {
      const userId = await getUserId(req);
      const suggestion = await VotingService.getRandomUnvotedSuggestion(userId);

      if (!suggestion) {
        return res.status(204).json(createResponse(204, {}));
      }

      res.status(200).json(createResponse(200, suggestion));
    } catch (e) {
      res.status(500).json(createResponse(500, null, e.message));
    }
  }


  static async getVotesForIdea(req, res) {
    try {
      const ideaId = parseInt(req.params.idea_id);
      const data = await VotingService.getVotesForIdea(ideaId);
      res.status(200).json(createResponse(200, data));
    } catch (e) {
      res.status(500).json(createResponse(500, null, e.message));
    }
  }

  static async voteOnSuggestion(req, res) {
    try {
      const userId = await getUserId(req);
      const suggestionId = parseInt(req.params.idea_id);
      const { reaction } = req.body;

      if (![0, 1].includes(reaction)) {
        return res.status(400).json(createResponse(400, null, "Invalid reaction"));
      }

      const result = await VotingService.vote(userId, suggestionId, reaction);
      if (result) {
        return await VotingController.getIdeaForVoting(req, res);
      }
    } catch (e) {
      res.status(500).json(createResponse(500, null, e.message));
    }
  }
}

module.exports = VotingController;