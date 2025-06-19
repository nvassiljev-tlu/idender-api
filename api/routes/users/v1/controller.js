const checkScopes = require('../../../middlewares/checkScopes');
const createResponse = require('../../../middlewares/createResponse');
const { getUserId } = require('../../../middlewares/getUserId')

class UsersController {
  constructor(service) {
    this.service = service;
  }

  list = async (req, res) => {
    const users = await this.service.getAll();
    res.status(200).json(createResponse(200, users));
  };

  get = async (req, res) => {
    const user = await this.service.getById(req.params.id);
    if (!user) return res.status(404).json(createResponse(404, {}, { message: "Not found" }));
    res.status(200).json(createResponse(200, user));
  };

  update = async (req, res) => {
    const userId = await getUserId(req);
    if (userId !== req.params.id) {
      const hasAdmin = await checkScopes(userId, ['users:moderate']);
      if (!hasAdmin) {
        return res.status(403).json(createResponse(403, {}, { message: "You are not authorized to perform this action." }));
      }
    }

    const data = {
      preferred_language: req.body.preferred_language,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
    };

    const updated = await this.service.update(req.params.id, data);
    res.status(200).json(createResponse(200, updated));
  };

  activate = async (req, res) => {
    const result = await this.service.setActive(req.params.id, true);
    res.status(200).json(createResponse(200, result));
  };

  deactivate = async (req, res) => {
    const result = await this.service.setActive(req.params.id, false);
    res.status(200).json(createResponse(200, result));
  };

  getScopes = async (req, res) => {
    const userId = req.params.id;
    const result = await this.service.getScopes(userId)
    if (!result) return res.status(404).json(createResponse(404, {}, { message: "Not found" }));
    res.status(200).json(createResponse(200, result));
  }

  assignScopes = async (req, res) => { 
    const currentUserId = await getUserId(req);
    if (!req.body.scopes || !Array.isArray(req.body.scopes) || req.body.scopes.length === 0) {
      return res.status(400).json(createResponse(400, {}, { message: "At least one scope must be provided." }));
    }
    const result = await this.service.assignScopes(req.params.id, req.body.scopes, currentUserId)
    if (result.status === 'error') {
      return res.status(400).json(createResponse(400, {}, { message: result.message }));
    }
    res.status(200).json(createResponse(200, result.scopes));
  };

  getIdeas = async (req, res) => { 
    const userId = await getUserId(req)
    const requestedUserId = req.params.id;
    if (userId !== requestedUserId) {
      const hasAdmin = await checkScopes(userId, ['user:admin'])
      if (!hasAdmin) {
        return res.status(403).json(createResponse(403, {}, { message: "You are not authorized to perform this action." }));
      }
    }
    const ideas = await this.service.getIdeasByUser(requestedUserId);
    res.status(200).json(createResponse(200, ideas));
  };

  assignAdmin = async (req, res) => {
    const targetUserId = req.params.id;
    if (targetUserId === "1") {
      return res.status(403).json(createResponse(403, {}, { message: "You cannot modify the service account." }));
    }
    const response = await this.service.assignAdmin(targetUserId);
    res.status(200).json(createResponse(200, {}, { message: "Admin role assigned successfully.", data: response }));
  }

  deleteAdmin = async (req, res) => {
    const targetUserId = req.params.id;
    if (targetUserId === "1") {
      return res.status(403).json(createResponse(403, {}, { message: "You cannot modify the service account." }));
    }
    const response = await this.service.deleteAdmin(targetUserId);
    res.status(200).json(createResponse(200, {}, { message: "Admin role removed successfully.", data: response }));
  }

  transferAdmin = async (req, res) => {
    const targetUserId = req.params.id;
    if (targetUserId === "1") {
      return res.status(403).json(createResponse(403, {}, { message: "You cannot modify the service account." }));
    }
    const currentUserId = await getUserId(req);
    if (currentUserId === targetUserId) {
      return res.status(403).json(createResponse(403, {}, { message: "You cannot transfer super admin role to yourself." }));
    }
    const response = await this.service.transferSuperAdmin(currentUserId, targetUserId);
    res.status(200).json(createResponse(200, {}, { message: "Super admin role transferred successfully.", data: response }));
  }
}


module.exports = UsersController;