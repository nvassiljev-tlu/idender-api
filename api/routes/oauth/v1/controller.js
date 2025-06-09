const OAuthService = require('./service');
const createResponse = require('../../../middlewares/createResponse');

class OAuthController {
  static async signup(req, res) {
    try {
      const {user, otp} = await OAuthService.signup(req.body);
      res.status(201).json(createResponse(201, { message: '[oAuth] User registered successfully.', data: {user, otp}, }));
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
        sameSite: 'Lax'
      });

      res.status(200).json(createResponse(200, { message: '[oAuth] User logged in successfully.' }));
    } catch (err) {
      res.status(401).json(createResponse(401, null, err.message));
    }
  }

  static logout(req, res) {
    try {
      OAuthService.logout(req.cookies.sid);
      res.clearCookie('sid');
      res.status(200).json(createResponse(200, { message: '[oAuth] User logged out successfully.' }));
    } catch (err) {
      res.status(400).json(createResponse(400, null, err.message));
    }
  }

  static verifyOtp(req, res) {
    try {
      OAuthService.verifyOtp(req.body.email, req.body.code);
      res.status(200).json(createResponse(200, { message: '[oAuth] OTP verified.' }));
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
