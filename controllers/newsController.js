import News from '../models/News.js';
import { sanitizeInputNews } from '../middleware/sanitize.js';

export const createNews = async ({ title, content, image, category, slug, excerpt, date }, res, next) => {
  try {
    console.log(req.file)
    const news = await News.create({
      title,
      content,
      image,
      category,
      slug,
      excerpt,
      date
    });

    res.status(201).json({
      success: true,
      data: news
    });
  } catch (error) {
    next(error);
  }
};
export const getNews = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const skip = (page - 1) * limit;
  
      const news = await News.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
  
      res.json({
        success: true,
        data: news,
        pagination: {
          page,
          limit,
          total: await News.countDocuments()
        }
      });
    } catch (error) {
      next(error);
    }
  };

// ... (métodos para update, delete, etc)