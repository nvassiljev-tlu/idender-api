const express = require('express');
const IdeasController = require('./controller');
const { requireScopes } = require('../../../middlewares/requireScopes')

const router = express.Router();

router.get('/', requireScopes(['auth:access', 'ideas:read', 'user:admin']), IdeasController.list);
router.post('/', requireScopes(['auth:access', 'ideas:read', 'ideas:create']), IdeasController.create);
router.get('/categories', requireScopes(['auth:access', 'ideas:read']), IdeasController.getCategories);
router.get('/:id', requireScopes(['auth:access', 'ideas:read']), IdeasController.getById);
router.patch('/:id', requireScopes(['auth:access', 'ideas:read', 'ideas:update']), IdeasController.update);
router.delete('/:id', requireScopes(['auth:access', 'ideas:moderate']), IdeasController.delete);
router.get('/:id/comments', requireScopes(['auth:access', 'comments:read']), IdeasController.getComments);
router.post('/:id/comments', requireScopes(['auth:access', 'comments:read', 'comments:create']), IdeasController.addComment);
router.delete('/:id/comments/:comment_id', requireScopes(['auth:access', 'comments:moderate']), IdeasController.deleteComment);
router.put('/:id/status', requireScopes(['auth:access', 'ideas:moderate']), IdeasController.setStatus);

module.exports = router;