const express = require('express');
const router = express.Router();
const VotingController = require('./controller');
const { requireScopes } = require('../../../middlewares/requireScopes');

router.get('/', requireScopes(['auth:access', 'voting:read'], "UUID1"), VotingController.getGlobalVotingInfo); // GET /voting
router.get('/next', requireScopes(['auth:access', 'voting:read'], "UUID1"), VotingController.getNextIdea); // GET /voting/next - next post
router.get('/intensity', VotingController.getVotingIntensity); // Без middleware!
router.get('/debug/reactions', (req, res) => {
    const reactions = require('./configs/database-simulator').suggestion_reactions;
  res.json({
    count: reactions.length,
    sample: reactions.slice(0, 3).map(r => ({
      id: r.id,
      time: r.created_at,
      suggestion: r.suggestion_id
    }))
  });
});
router.get('/:idea_id', requireScopes(['auth:access', 'voting:read'], "UUID1"), VotingController.getVotesForIdea); // GET /voting/:idea_id
router.post('/:idea_id', requireScopes(['auth:access', 'voting:vote'], "UUID1"), VotingController.submitVoteForIdea); // POST /voting/:idea_id

module.exports = router;
