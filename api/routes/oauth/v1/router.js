const express = require('express');
const router = express.Router();
const OAuthController = require('./controller');
const { requireScopes } = require('../../../middlewares/requireScopes')

router.post('/signup', OAuthController.signup);
router.post('/login', requireScopes(['auth:access'], 'UUID4'), OAuthController.login);
router.post('/logout', OAuthController.logout);
router.post('/otp', requireScopes(['auth:signup'], 'UUID4'), OAuthController.verifyOtp);
router.get('/me', OAuthController.getMe);

module.exports = router;
