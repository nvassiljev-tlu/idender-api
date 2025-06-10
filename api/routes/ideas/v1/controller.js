const IdeasService = require('./service');
const createResponse = require('../../../middlewares/createResponse')

class IdeasController {
  static async list(req, res) {
    try {
      const ideas = await IdeasService.listIdeas();
      res.status(200).json(createResponse(200, ideas));
    } catch (err) {
      res.status(400).json(createResponse(400, {}, { error: err.message }));
    }
  }

  static async create(req, res) {
    try {
      const idea = await IdeasService.createIdea(req.body, req);
      res.status(201).json(createResponse(201, idea));
    } catch (err) {
      res.status(400).json(createResponse(400, {}, { error: err.message }));
    }
  }

  static getById(req, res) {
    try {
      const idea = IdeasService.getIdeaById(parseInt(req.params.id));
      res.status(200).json(createResponse(200, idea));
    } catch (err) {
      res.status(404).json(createResponse(404, {}, { error: err.message }));
    }
  }

  static update(req, res) {
    try {
      const idea = IdeasService.updateIdea(req.params.id, req.body);
      res.status(200).json(createResponse(200, idea));
    } catch (err) {
      res.status(404).json(createResponse(404, {}, { error: err.message }));
    }
  }

  static delete(req, res) {
    try {
      const result = IdeasService.deleteIdea(req.params.id);
      res.status(200).json(createResponse(200, result));
    } catch (err) {
      res.status(404).json(createResponse(404, {}, { error: err.message }));
    }
  }

  static performAction(req, res) {
    try {
      const result = IdeasService.performAction(req.params.id, req.body.action);
      res.status(200).json(createResponse(200, result));
    } catch (err) {
      res.status(400).json(createResponse(400, {}, { error: err.message }));
  }
}

  static getComments(req, res) {
    try {
      const result = IdeasService.getComments(parseInt(req.params.id));
      res.status(200).json(createResponse(200, result));
    } catch (err) {
      res.status(404).json(createResponse(404, {}, { error: err.message }));
    }
  }

  static addComment(req, res) {
    try {
      const comment = IdeasService.addComment(req.params.id, req.body);
      res.status(201).json(createResponse(201, comment));
    } catch (err) {
      res.status(400).json(createResponse(400, {}, { error: err.message }));
    }
  }

  static deleteComment(req, res) {
    try {
      const result = IdeasService.deleteComment(req.params.id, req.body.commentId);
      res.status(200).json(createResponse(200, result));
    } catch (err) {
      res.status(404).json(createResponse(404, {}, { error: err.message }));
    }
  }

  static wordFrequency(req, res) {
    try {
      const freq = IdeasService.getWordFrequency();
      res.status(200).json(createResponse(200, freq));
    } catch (err) {
      res.status(500).json(createResponse(500, {}, { error: err.message }));
    }
  }
  
}

module.exports = IdeasController;