const express = require('express');
const router = express.Router();
const VotingController = require('./controller');
const { requireScopes } = require('../../../middlewares/requireScopes');

router.get('/', requireScopes(['auth:access', 'voting:read']), VotingController.getGlobalVotingInfo);
router.get('/:idea_id', requireScopes(['auth:access', 'voting:read']), VotingController.getVotesForIdea);
router.post('/:idea_id', requireScopes(['auth:access', 'voting:vote'],), VotingController.submitVoteForIdea);

module.exports = router;