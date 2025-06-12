const crypto = require('crypto');
const createResponse = require('../../../middlewares/createResponse')


class NewsService {
  static async getNews(req, res) {
    const [news] = await db.promise().query('SELECT * FROM news');
    if (!news || news.length === 0) {
      return res.status(404).json(createResponse(404, null, "No news found"));
    }
    res.status(200).json(createResponse(200, news));
  }

  static async getNewsById(req, res) {
    const [newsId] = await db.promise().query('SELECT * FROM news WHERE id = ?', [req.params.id]);
    if (!newsId) {
      return res.status(404).json(createResponse(404, null, "News item not found"));
    }
    res.status(200).json(createResponse(200, newsId));
  }

  static async getRecentNews(limit = 5) {
    const [news] = await db.promise().query(
      'SELECT * FROM news ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
    return news;
  }
}

module.exports = NewsService;