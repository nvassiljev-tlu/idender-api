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

  static async getById(req, res) {
    try {
      const idea = await IdeasService.getIdeaById(parseInt(req.params.id));
      res.status(200).json(createResponse(200, idea));
    } catch (err) {
      res.status(404).json(createResponse(404, {}, { error: err.message }));
    }
  }

  static async update(req, res) {
    try {
      const idea = await IdeasService.updateIdea(req.params.id, req.body);
      res.status(200).json(createResponse(200, idea));
    } catch (err) {
      res.status(404).json(createResponse(404, {}, { error: err.message }));
    }
  }

  static async delete(req, res) {
    try {
      const result = await IdeasService.deleteIdea(req.params.id);
      res.status(200).json(createResponse(200, result));
    } catch (err) {
      res.status(404).json(createResponse(404, {}, { error: err.message }));
    }
  }

  static async performAction(req, res) {
    try {
      const result = await IdeasService.performAction(req.params.id, req.body.action);
      res.status(200).json(createResponse(200, result));
    } catch (err) {
      res.status(400).json(createResponse(400, {}, { error: err.message }));
    }
  }

  static async getComments(req, res) {
    try {
      const result = await IdeasService.getComments(parseInt(req.params.id));
      res.status(200).json(createResponse(200, result));
    } catch (err) {
      res.status(404).json(createResponse(404, {}, { error: err.message }));
    }
  }

  static async addComment(req, res) {
    try {
      const comment = await IdeasService.addComment(req.params.id, req.body);
      res.status(201).json(createResponse(201, comment));
    } catch (err) {
      res.status(400).json(createResponse(400, {}, { error: err.message }));
    }
  }

  static async deleteComment(req, res) {
    try {
      const result = await IdeasService.deleteComment(req.params.id, req.body.commentId);
      res.status(200).json(createResponse(200, result));
    } catch (err) {
      res.status(404).json(createResponse(404, {}, { error: err.message }));
    }
  }

  static async wordFrequency(req, res) {
    try {
      const freq = await IdeasService.getWordFrequency();
      res.status(200).json(createResponse(200, freq));
    } catch (err) {
      res.status(500).json(createResponse(500, {}, { error: err.message }));
    }
  }

  static async getCategories(req, res) {
    try {
      const categories = await IdeasService.getCategories();
      res.status(200).json(createResponse(200, categories));
    } catch (err) {
      res.status(500).json(createResponse(500, {}, { error: err.message }));
    }
  }
  
}

module.exports = IdeasController;