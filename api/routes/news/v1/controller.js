const NewsService = require('./service');
const createResponse = require('../../../middlewares/createResponse')

class NewsController {
  static async getNews(req, res) {
    try {
      const news = await NewsService.getNews();
      res.status(200).json(createResponse(200, news));
    } catch (err) {
      res.status(500).json(createResponse(500, null, err.message));
    }
  }

  static async getNewsById(req, res) {
    try {
      const newsId = req.params.id;
      const newsItem = await NewsService.getNewsById(newsId);
      if (!newsItem) {
        return res.status(404).json(createResponse(404, null, "News item not found"));
      }
      res.status(200).json(createResponse(200, newsItem));
    } catch (err) {
      res.status(500).json(createResponse(500, null, err.message));
    }
  }

    static async getRecentNews(req, res) {
    try {
    const limit = parseInt(req.query.limit) || 5; 
    const news = await NewsService.getRecentNews(limit);
    res.status(200).json(createResponse(200, news));
    } catch (err) {
    res.status(500).json(createResponse(500, null, err.message));
        }
    }
}

module.exports = NewsController;