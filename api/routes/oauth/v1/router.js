const express = require('express');
const router = express.Router();
const OAuthController = require('./controller');
const { requireScopes } = require('../../../middlewares/requireScopes')

router.post('/signup', OAuthController.signup);
router.post('/login', OAuthController.login);
router.post('/logout', OAuthController.logout);
router.post('/otp', OAuthController.verifyOtp);
router.get('/me', requireScopes(['auth:access']), OAuthController.getMe);
router.get('/otp', OAuthController.getNewOtp);

module.exports = router;
