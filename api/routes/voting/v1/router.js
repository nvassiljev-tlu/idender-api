const express = require('express');
const router = express.Router();
const VotingController = require('./controller');
const { requireScopes } = require('../../../middlewares/requireScopes');

router.get('/', requireScopes(['auth:access', 'voting:read'], "UUID1"), VotingController.getGlobalVotingInfo); // GET /voting
router.get('/next', requireScopes(['auth:access', 'voting:read'], "UUID1"), VotingController.getNextIdea); // GET /voting/next - next post
router.get('/:idea_id', requireScopes(['auth:access', 'voting:read'], "UUID1"), VotingController.getVotesForIdea); // GET /voting/:idea_id
router.post('/:idea_id', requireScopes(['auth:access', 'voting:vote'], "UUID1"), VotingController.submitVoteForIdea); // POST /voting/:idea_id

module.exports = router;