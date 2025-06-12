const express = require('express');
const NewsController = require('./controller');
const { requireScopes } = require('../../../middlewares/requireScopes')

const router = express.Router();

router.get('/', requireScopes(['auth:access', 'ideas:read']), NewsController.getNews);
router.get('/recent', requireScopes(['auth:access', 'ideas:read']), NewsController.getRecentNews);
router.get('/:id', requireScopes(['auth:access', 'ideas:read']), NewsController.getNewsById);

module.exports = router;