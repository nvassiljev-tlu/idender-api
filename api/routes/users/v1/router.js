const express = require('express');
const router = express.Router();
const createResponse = require('../../../middlewares/createResponse'); //ühtse formaadiga vastuseid
const { requireScopes } = require('../../../middlewares/requireScopes');//kontrollib õiguseid(nagu scopes)
const UsersService = require('./service'); 
const UsersController = require('./controller');

const service = new UsersService();
const controller = new UsersController(service);

//tagastab kõik kasutajad,kontrollib, kas kasutajal UUID1 on auth:access õigus,mis kõigil peaks olema
router.get('/', requireScopes(['auth:access'], "UUID1"), controller.list); 

//  tagastab ühe kasutaja info.
router.get('/:id', requireScopes(['auth:access'], "UUID1"), controller.get);

// uuendab kasutaja andmeid.
router.patch('/:id', requireScopes(['auth:access'], "UUID1"), controller.update);

// Aktiveerib või deaktiveerib kasutaja. Vajalikud õigused: auth:access ja users:moderate
router.post('/:id/activate', requireScopes(['auth:access', 'users:moderate'], "UUID1"), controller.activate);

router.post('/:id/deactivate', requireScopes(['auth:access', 'users:moderate'], "UUID1"), controller.deactivate);

// Määrab kasutajale õigused 
router.post('/:id/scopes', requireScopes(['auth:access', 'users:scopes'], "UUID1"), controller.assignScopes);

// Tagastab kasutaja ideed
router.get('/:id/ideas', requireScopes(['auth:access', 'ideas:read'], "UUID1"), controller.getIdeas);

module.exports = router;