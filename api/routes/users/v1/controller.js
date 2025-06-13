const createResponse = require('../../../middlewares/createResponse');
const { getUserId } = require('../../../middlewares/getUserId')
const { requireScopes } = require('../../../middlewares/requireScopes');

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
      return res.status(403).json(createResponse(403, {}, { message: "You are not authorized to perform this action." }));
    }
    const updated = await this.service.update(req.params.id, req.body);
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

  assignScopes = async (req, res) => { 
    const result = await this.service.assignScopes(req.params.id, req.body.scopeIds);
    res.status(200).json(createResponse(200, result));
  };

  getIdeas = async (req, res) => { 
    const userId = await getUserId(req)
    const requestedUserId = req.params.id;
    if (userId !== requestedUserId) {
      const hasUserAdminScope = req.allScopes.find(s => s.name === 'user:admin')?.id;
      const hasAdmin = hasUserAdminScope && req.userScopeIds.includes(hasUserAdminScope);
      if (!hasAdmin) {
        return res.status(403).json(createResponse(403, {}, { message: "You are not authorized to perform this action." }));
      }
    }
    const ideas = await this.service.getIdeasByUser(userId);
    res.status(200).json(createResponse(200, ideas));
  };
}


module.exports = UsersController;