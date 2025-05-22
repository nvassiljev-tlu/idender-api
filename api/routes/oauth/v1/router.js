const express = require('express');
const router = express.Router();
const createResponse = require('../../../middlewares/createResponse');

router.get('/', async (req, res) => {
    res.status(200).json(createResponse(200, {text: 'oAuth API v1'}));
});

module.exports = router;