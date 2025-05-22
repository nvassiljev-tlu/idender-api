const express = require('express');
const router = express.Router();
const createResponse = require('../../../middlewares/createResponse');
const { requireScopes } = require('../../../middlewares/requireScopes');

router.get('/', requireScopes(['auth:access'], "UUID1"), async (req, res) => {
    res.status(200).json(createResponse(200, {text: 'oAuth API v1'}));
});

module.exports = router;