import News from '../models/News.js';
import {
  NotFoundError,
} from '../utils/errorHandler.js';
  // export const createNews = async ({body, file, user, route }, res, next) => {
export const createNews = async ({body:{title, content, category, excerpt}, files }, res, next) => {
  const filesText = files.map( a=>a.filename ) 
  // {
  //   fieldname: 'image',
  //   originalname: 'Screenshot 2025-06-06 093200.png',
  //   encoding: '7bit',
  //   mimetype: 'image/png',
  //   destination: 'uploads/',
  //   filename: 'image-1749590298052-774571788.png',
  //   path: 'uploads\\image-1749590298052-774571788.png',
  //   size: 64915
  // }
  // console.log(Object.keys(user))// [ 'userId', 'role', 'iat', 'exp' ]
  try {
    const news = await News.create({
      title,
      content,
      images:filesText,
      category,
      excerpt,
    });

    res.status(201).json({
      success: true,
      data: news
    });
  } catch (error) {
    console.log(error)
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
export const getNewsById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validar que el ID tenga formato válido de MongoDB
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'ID de noticia no válido'
      });
    }

    const news = await News.findById(id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'Noticia no encontrada'
      });
    }

    res.json({
      success: true,
      data: news
    });

  } catch (error) {
    next(error);
  }
};
// export const updateNews = async ({body:{title, content, category, excerpt}, files, params:{id} }, res, next) => {
export const updateNews = async ({body, files, params:{id} }, res, next) => {
// export const updateNews = async (req, res, next) => {
  const filesText = files.map( a=>a.filename )
  if(Array.isArray(filesText) && filesText.length > 0){
    body.images=filesText
  }else{
    delete body.images
  }
  // {
  //   fieldname: 'image',
  //   originalname: 'Screenshot 2025-06-06 093200.png',
  //   encoding: '7bit',
  //   mimetype: 'image/png',
  //   destination: 'uploads/',
  //   filename: 'image-1749590298052-774571788.png',
  //   path: 'uploads\\image-1749590298052-774571788.png',
  //   size: 64915
  // }
  // console.log(Object.keys(user))// [ 'userId', 'role', 'iat', 'exp' ]
  try {
    const existingNews = await News.findById(id);
    if (!existingNews) {
      throw new NotFoundError('bd: Noticia no encontrada');
    }
    const updatedNews = await News.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true } // Retorna el documento actualizado y valida los campos
    );

    res.status(201).json({
      success: true,
      data: updatedNews
    });
  } catch (error) {
    //console.log(error)
    next(error);
  }
};
export const deleteNews = async (req, res, next) => {
  try {
    const { id } = req.params;

    const news = await News.findByIdAndDelete(id);
    
    if (!news) {
      throw new NotFoundError('Noticia no encontrada');
    }

    res.json({
      success: true,
      message: 'Noticia eliminada exitosamente',
      data: news
    });

  } catch (error) {
    next(error);
  }
};

// ... (métodos para update, delete, etc)