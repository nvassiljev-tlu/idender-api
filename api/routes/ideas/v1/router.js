const express = require('express');
const IdeasController = require('./controller');
const { requireScopes } = require('../../../middlewares/requireScopes')

const router = express.Router();

router.get('/', requireScopes(['auth:access', 'ideas:read']), IdeasController.list);
router.post('/', requireScopes(['auth:access', 'ideas:read', 'ideas:create']), IdeasController.create);
router.get('/categories', requireScopes(['auth:access']), IdeasController.getCategories);
router.get('/:id', requireScopes(['auth:access', 'ideas:read']), IdeasController.getById);
router.patch('/:id', requireScopes(['auth:access', 'ideas:read', 'ideas:update']), IdeasController.update);
router.delete('/:id', requireScopes(['auth:access', 'ideas:moderate']), IdeasController.delete);
//router.post('/:id/actions', IdeasController.performAction);
router.get('/:id/comments', requireScopes(['auth:access', 'comments:read']), IdeasController.getComments);
router.post('/:id/comments', requireScopes(['auth:access', 'comments:read', 'comments:create']), IdeasController.addComment);
router.delete('/:id/comments', requireScopes(['auth:access']), IdeasController.deleteComment);
router.get('/utils/word-frequency', requireScopes(['auth:access', 'ideas:read']), IdeasController.wordFrequency);

module.exports = router;