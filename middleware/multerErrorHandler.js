import multer from 'multer';

export const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    let userMessage;
    let statusCode = 400; // Bad Request por defecto

    switch (err.code) {
      case 'LIMIT_FILE_COUNT':
        userMessage = 'Se permiten un máximo de 3 imagenes.';
        break;
      case 'LIMIT_FILE_SIZE':
        userMessage = 'Uno o más archivos exceden el tamaño máximo (5MB).';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        userMessage = 'Campo de archivo no permitido.';
        break;
      default:
        userMessage = 'Error al subir archivos.';
        break;
    }

    // Respuesta al cliente
    return res.status(statusCode).json({
      // success: false,
      // message: userMessage,
      // error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      errors: [{
        type: 'field',
        msg: userMessage,
        path: 'images',
        location: 'body'
      }]
    });
  }

  // Si no es un error de Multer, pasar al siguiente middleware
  next(err);
};
