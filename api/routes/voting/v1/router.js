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





//Mida teeb: Määrab API marsruudid (lõpp-punktid), mis on seotud hääletamisega (voting). See on HTTP-päringute sisenemispunkt.
//Marsruudid:

//GET /voting – Tagastab üldstatistika kõigi postituste kohta (like’id ja dislike’id). Kutsub välja VotingController.getGlobalVotingInfo.

//GET /voting/next – Tagastab järgmise postituse, mida kasutaja pole veel hääletanud. Kutsub välja VotingController.getNextIdea.

//GET /voting/:idea_id – Tagastab konkreetse postituse like’id ja dislike’id. Kutsub välja VotingController.getVotesForIdea.

//POST /voting/:idea_id – Saadab like (1) või dislike (0) postitusele. Kutsub välja VotingController.submitVoteForIdea.

//Middleware:

//requireScopes – Kontrollib, kas kasutajal on õigused (scopes) päringu tegemiseks, nt auth:access ja voting:read lugemiseks või voting:vote hääletamiseks.

//Seosed:

//Kasutab VotingControllerit päringute töötlemiseks.

//Rakendab requireScopes õiguste kontrollimiseks enne kontrolleri meetodite väljakutsumist.