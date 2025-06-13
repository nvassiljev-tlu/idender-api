const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const createResponse = require('../../../middlewares/createResponse');
const { requireScopes } = require('../../../middlewares/requireScopes');
const UsersService = require('./service'); 
const UsersController = require('./controller');

const service = new UsersService();
const controller = new UsersController(service);

router.get('/', requireScopes(['auth:access']), controller.list); 
router.get('/:id', requireScopes(['auth:access']), controller.get);
router.patch('/:id', requireScopes(['auth:access']), upload.single("profile_picture"), controller.update);
router.post('/:id/activate', requireScopes(['auth:access', 'users:moderate']), controller.activate);
router.post('/:id/deactivate', requireScopes(['auth:access', 'users:moderate']), controller.deactivate);
router.post('/:id/scopes', requireScopes(['auth:access', 'users:scopes']), controller.assignScopes);
router.get('/:id/ideas', requireScopes(['auth:access', 'ideas:read']), controller.getIdeas);

module.exports = router;