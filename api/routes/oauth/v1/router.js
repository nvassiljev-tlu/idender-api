const express = require('express');
const router = express.Router();
const OAuthController = require('./controller');
const { requireScopes } = require('../../../middlewares/requireScopes')

router.post('/signup', OAuthController.signup);
router.post('/lang', requireScopes(['auth:access']), OAuthController.langPreset); // чтобы свапнуть пресет lang?lang=[language of your choice]
router.post('/login', OAuthController.login);
router.post('/logout', OAuthController.logout);
router.post('/otp', OAuthController.verifyOtp);
router.get('/me', requireScopes(['auth:access']), OAuthController.getMe);
router.get('/otp', OAuthController.getNewOtp);

module.exports = router;