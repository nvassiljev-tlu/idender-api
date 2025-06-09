const express = require('express');
const IdeasController = require('./controller');
const { requireScopes } = require('../../../middlewares/requireScopes')

const router = express.Router();

router.get('/', requireScopes(['auth:access', 'ideas:read'], "UUID1"), IdeasController.list);
router.post('/', requireScopes(['auth:access', 'ideas:read', 'ideas:create'], "UUID1"), IdeasController.create);
router.get('/:id', requireScopes(['auth:access', 'ideas:read'], "UUID1"), IdeasController.getById);
router.patch('/:id', requireScopes(['auth:access', 'ideas:read', 'ideas:update'], "UUID1"), IdeasController.update);
router.delete('/:id', requireScopes(['auth:access', 'ideas:moderate'], "UUID1"), IdeasController.delete);
//router.post('/:id/actions', IdeasController.performAction);
router.get('/:id/comments', requireScopes(['auth:access', 'comments:read'], "UUID1"), IdeasController.getComments);
router.post('/:id/comments', requireScopes(['auth:access', 'comments:read', 'comments:create'], "UUID1"), IdeasController.addComment);
router.delete('/:id/comments', requireScopes(['auth:access'], "UUID1"), IdeasController.deleteComment);
router.get('/utils/word-frequency', requireScopes(['auth:access', 'ideas:read'], "UUID1"), IdeasController.wordFrequency);

module.exports = router;