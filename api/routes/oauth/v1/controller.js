const OAuthService = require('./service');
const createResponse = require('../../../middlewares/createResponse');
const { requireScopes } = require('../../../middlewares/requireScopes')

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
      res.cookie('sid', session, {
        httpOnly: true,
        secure: false,
        sameSite: 'None'
      });

      res.status(200).json(createResponse(200, { message: '[oAuth] User logged in successfully.', data: { session: session.sid, language: session.lang } }));
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

  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json(createResponse(400, null, '[oAuth] Email is required to reset password.'));
      }
      const response = await OAuthService.forgotPassword(email);
      res.status(200).json(createResponse(200, { message: '[oAuth] Password reset link sent to your email.', code: response.code }));
    } catch (err) {
      res.status(400).json(createResponse(400, null, err.message));
    }
  }

  static async resetPassword(req, res) {
    try {
      const { email, code, new_password } = req.body;
      if (!email || !code || !new_password) {
        return res.status(400).json(createResponse(400, null, '[oAuth] Email, code, and new password are required to reset password.'));
      }
      const success = await OAuthService.resetPassword(email, code, new_password);
      if (success) {
        res.status(200).json(createResponse(200, { message: '[oAuth] Password reset successfully.' }));
      } else {
        res.status(400).json(createResponse(400, null, '[oAuth] Invalid email or code.'));
      }
    } catch (err) {
      res.status(400).json(createResponse(400, null, err.message));
    }
  }

}

module.exports = OAuthController;
