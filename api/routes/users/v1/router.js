const express = require('express');
const router = express.Router();
const createResponse = require('../../../middlewares/createResponse'); //ühtse formaadiga vastuseid
const { requireScopes } = require('../../../middlewares/requireScopes');//kontrollib õiguseid(nagu scopes)
const UsersService = require('./service'); 
const UsersController = require('./controller');

const service = new UsersService();
const controller = new UsersController(service);

//tagastab kõik kasutajad,kontrollib, kas kasutajal UUID1 on auth:access õigus,mis kõigil peaks olema
router.get('/', requireScopes(['auth:access']), controller.list); 

//  tagastab ühe kasutaja info.
router.get('/:id', requireScopes(['auth:access']), controller.get);

// uuendab kasutaja andmeid.
router.patch('/:id', requireScopes(['auth:access']), controller.update);

// Aktiveerib või deaktiveerib kasutaja. Vajalikud õigused: auth:access ja users:moderate
router.post('/:id/activate', requireScopes(['auth:access', 'users:moderate']), controller.activate);

router.post('/:id/deactivate', requireScopes(['auth:access', 'users:moderate']), controller.deactivate);

// Määrab kasutajale õigused 
router.post('/:id/scopes', requireScopes(['auth:access', 'users:scopes']), controller.assignScopes);

// Tagastab kasutaja ideed
router.get('/:id/ideas', requireScopes(['auth:access', 'ideas:read']), controller.getIdeas);

module.exports = router;