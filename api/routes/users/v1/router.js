const express = require('express');
const router = express.Router();
const { requireScopes } = require('../../../middlewares/requireScopes');
const UsersService = require('./service'); 
const UsersController = require('./controller');

const service = new UsersService();
const controller = new UsersController(service);

router.get('/', requireScopes(['auth:access', 'user:admin']), controller.list);
router.get('/:id', requireScopes(['auth:access']), controller.get);
router.get('/:id/ideas', requireScopes(['auth:access', 'ideas:read']), controller.getIdeas);
router.get('/:id/scopes', requireScopes(['auth:access', 'users:scopes']), controller.getScopes);
router.patch('/:id', requireScopes(['auth:access']), controller.update);
router.post('/:id/activate', requireScopes(['auth:access', 'users:moderate']), controller.activate);
router.post('/:id/deactivate', requireScopes(['auth:access', 'users:moderate']), controller.deactivate);
router.post('/:id/admin', requireScopes(['auth:access', 'users:moderate', 'users:scopes', 'user:admin']), controller.assignAdmin);
router.post('/:id/transfer', requireScopes(['auth:access', 'user:admin', 'user:superadmin']), controller.transferAdmin);
router.patch('/:id/scopes', requireScopes(['auth:access', 'users:moderate', 'users:scopes']), controller.assignScopes);
router.delete('/:id/admin', requireScopes(['auth:access', 'users:moderate', 'users:scopes', 'user:superadmin']), controller.deleteAdmin);

module.exports = router;