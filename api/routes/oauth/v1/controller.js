const OAuthService = require('./service');
const createResponse = require('../../../middlewares/createResponse');
const { requireScopes } = require('../../../middlewares/requireScopes')

class OAuthController {
  static async signup(req, res) {
    try {
      const { lang = 'en', ...userData } = req.body;
      const {user, otp} = await OAuthService.signup(req.body);
      if (['en', 'fr', 'et'].includes(lang)) {
        await OAuthService.setUserLang(user.id, lang);
        user.lang = lang;
      
    }
      res.status(201).json(createResponse(201, { message: '[oAuth] User registered successfully.', data: {user, otp}, }));
    } catch (err) {
      res.status(400).json(createResponse(400, null, err.message));
    }
  }

  static async langPreset (req, res) {
    try {
      const lang = req.query.lang || 'en';
      const userId = req.user.id;
      if (!userId) {
        return res.status(401).json(createResponse(401, null, '[oAuth] Unauthorized: User ID is required.'));
      }
      if (['en', 'fr', 'et'].includes(lang)) {
        await OAuthService.setUserLang(userId, lang);
        req.user.lang = lang;
      }
      res.status(200).json(createResponse(200, { message: '[oAuth] Language preset successfully.', data: { lang: req.user.lang } }));
    } catch (err) {
      res.status(400).json(createResponse(400, null, err.message));
    }
  }

  static async login(req, res) {
    try {
      const session = await OAuthService.login(req.body.email, req.body.password);
      res.cookie('sid', session.sid, {
        httpOnly: true,
        secure: false,
        sameSite: 'None'
      });

      res.status(200).json(createResponse(200, { message: '[oAuth] User logged in successfully.', data: { session } }));
    } catch (err) {
      res.status(401).json(createResponse(401, null, err.message));
    }
  }

  static async logout(req, res) {
    try {
      await OAuthService.logout(req.cookies.sid);
      res.clearCookie('sid');
      res.status(200).json(createResponse(200, { message: '[oAuth] User logged out successfully.' }));
    } catch (err) {
      res.status(400).json(createResponse(400, null, err.message));
    }
  }

  static async verifyOtp(req, res) {
    try {
      await OAuthService.verifyOtp(req.body.email, req.body.code);
      res.status(200).json(createResponse(200, { message: '[oAuth] OTP verified.' }));
    } catch (err) {
      res.status(400).json(createResponse(400, null, err.message));
    }
  }

  static async getNewOtp(req, res) {
    try {
      if (!req.query.email) {
        return res.status(400).json(createResponse(400, null, '[oAuth] Email is required to generate a new OTP.'));
      }
      const otp = await OAuthService.getNewOtp(req.query.email);
      res.status(200).json(createResponse(200, { message: '[oAuth] New OTP generated.', data: { otp } }));
    } catch (err) {
      res.status(400).json(createResponse(400, null, err.message));
    }
  }

  static async getMe(req, res) {
    try {
      const session = await OAuthService.getSession(req.cookies.sid);
      res.status(200).json(createResponse(200, session));
    } catch (err) {
      res.status(401).json(createResponse(401, null, err.message));
    }
  }
}

module.exports = OAuthController;
