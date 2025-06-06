import News from '../models/News.js';
import { sanitizeInput } from '../middleware/sanitize.js';

export const createNews = async (req, res, next) => {
  try {
    const { title, content, image } = sanitizeInput(req.body);
    
    const news = await News.create({
      title,
      content,
      image,
      author: req.user.id,
      status: 'draft'
    });

    res.status(201).json({
      success: true,
      data: news
    });
  } catch (error) {
    next(error);
  }
};

// ... (métodos para update, delete, etc)