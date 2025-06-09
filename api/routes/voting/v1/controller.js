const VotingService = require('./service');
const createResponse = require('../../../middlewares/createResponse');

class VotingController {
  static getGlobalVotingInfo(req, res) {
    try {
      const data = VotingService.getGlobalInfo();
      res.status(200).json(createResponse(200, data));
    } catch (e) {
      res.status(500).json(createResponse(500, null, e.message));
    }
  }

  static getVotesForIdea(req, res) {
    try {
      const ideaId = req.params.idea_id;
      const data = VotingService.getVotesForIdea(ideaId);
      res.status(200).json(createResponse(201, data));
    } catch (e) {
      res.status(500).json(createResponse(500, null, e.message));
    }
  }

  static getNextIdea(req, res) {
    try {
      const userId = req.userId;
      if (!userId) throw new Error("User not authenticated");

      const idea = VotingService.getNextIdea(userId);
      if (!idea) {
        return res.status(404).json(createResponse(404, null, "No new ideas available"));
      }
      res.status(200).json(createResponse(200, idea));
    } catch (e) {
      res.status(500).json(createResponse(500, null, e.message));
    }
  }

  static submitVoteForIdea(req, res) {
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

  static getVotingIntensity(req, res) {
    try {
      
      //const startTime = new Date('2025-05-23T09:30:00Z');
      
      
      const startTime = new Date();
      startTime.setMinutes(startTime.getMinutes() - 10);
      
      const data = VotingService.getVotingIntensity(startTime);
      res.status(200).json(createResponse(200, data));
    } catch (e) {
      res.status(500).json(createResponse(500, null, e.message));
    }
  }
}

module.exports = VotingController;




//{
//  "status": 200,
 // "data": {
 //   "id": 1,
 //   "title": "Improve WiFi",
 //   "desctiption": "WiFi speed in the office needs improvement.",
 //   "is_anonymus": 0,
 //   "created_at": "2025-01-01T10:00:00Z",
 //   "status": 1,
 //   "user_id": 1
 // }
//}


//Mida teeb: Töötleb HTTP-päringuid, kutsub välja meetodid service.js failist ja tagastab vastused kliendile.
//Meetodid:

//getGlobalVotingInfo – Tagastab kõigi postituste statistika (kasutades VotingService.getGlobalInfo).

//getVotesForIdea – Tagastab konkreetse postituse reaktsioonid (kasutades VotingService.getVotesForIdea).

//getNextIdea – Tagastab järgmise hääletamiseks sobiva postituse (kasutades VotingService.getNextIdea).

//submitVoteForIdea – Salvestab like/dislike (kasutades VotingService.vote).

//Seosed:

//Saab päringud router.js failist ja edastab need VotingService töötluseks.

//Kasutab createResponse (middleware) vastuste vormindamiseks.