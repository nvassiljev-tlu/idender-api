const VotingService = require('./service');
const createResponse = require('../../../middlewares/createResponse');

class VotingController {
  static getGlobalVotingInfo(req, res) {
    console.log("getGlobalVotingInfo");
    try {
      const data = VotingService.getGlobalInfo();
      res.status(200).json(createResponse(200, data));
    } catch (e) {
      res.status(500).json(createResponse(500, null, e.message));
    }
  }

  static getVotesForIdea(req, res) {
    console.log("getVotesForIdea");
    try {
      const ideaId = req.params.idea_id;
      const data = VotingService.getVotesForIdea(ideaId);
      res.status(200).json(createResponse(200, data));
    } catch (e) {
      res.status(500).json(createResponse(500, null, e.message));
    }
  }

  static submitVoteForIdea(req, res) {
    console.log("submitVoteForIdea");
    try {
      const ideaId = req.params.idea_id;
      const userId = req.userId;
      const { reaction } = req.body;

      if (!userId) throw new Error("User not authenticated");
      if (reaction === undefined) throw new Error("Reaction is required");

      VotingService.vote(ideaId, userId, reaction);
      res.status(200).json(createResponse(200, { success: true }));
    } catch (e) {
      res.status(400).json(createResponse(400, null, e.message));
    }
  }
}

module.exports = VotingController;