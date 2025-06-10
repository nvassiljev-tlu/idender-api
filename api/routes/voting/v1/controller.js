const VotingService = require('./service');
const createResponse = require('../../../middlewares/createResponse');

class VotingController {
  static async getGlobalVotingInfo(req, res) {
    try {
      const data = await VotingService.getGlobalInfo();
      res.status(200).json(createResponse(200, data));
    } catch (e) {
      res.status(500).json(createResponse(500, null, e.message));
    }
  }

  static async getVotesForIdea(req, res) {
    try {
      const ideaId = req.params.idea_id;
      const data = await VotingService.getVotesForIdea(ideaId);
      res.status(200).json(createResponse(201, data));
    } catch (e) {
      res.status(500).json(createResponse(500, null, e.message));
    }
  }

  static async getNextIdea(req, res) {
    try {
      const userId = req.userId;
      if (!userId) throw new Error("User not authenticated");

      const idea = await VotingService.getNextIdea(userId);
      if (!idea) {
        return res.status(404).json(createResponse(404, null, "No new ideas available"));
      }
      res.status(200).json(createResponse(200, idea));
    } catch (e) {
      res.status(500).json(createResponse(500, null, e.message));
    }
  }

  static async submitVoteForIdea(req, res) {
    try {
      const ideaId = req.params.idea_id;
      const userId = req.userId;
      const { reaction } = req.body;

      if (!userId) throw new Error("User not authenticated");
      if (reaction === undefined) throw new Error("Reaction is required");

      await VotingService.vote(ideaId, userId, reaction);
      res.status(200).json(createResponse(200, { success: true }));
    } catch (e) {
      res.status(400).json(createResponse(400, null, e.message));
    }
  }

  static async getVotingIntensity(req, res) {
    try {
      const startTime = new Date();
      startTime.setMinutes(startTime.getMinutes() - 10);

      const data = await VotingService.getVotingIntensity(startTime);
      res.status(200).json(createResponse(200, data));
    } catch (e) {
      res.status(500).json(createResponse(500, null, e.message));
    }
  }
}

module.exports = VotingController;
