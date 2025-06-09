class AppError extends Error {
    constructor(message, statusCode, errorType = 'operational') {
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.errorType = errorType; // 'operational' o 'programming'
      this.isOperational = errorType === 'operational';
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  // Errores personalizados
  class BadRequestError extends AppError {
    constructor(message = 'Solicitud inválida') {
      super(message, 400);
    }
  }
  
  class UnauthorizedError extends AppError {
    constructor(message = 'No autorizado') {
      super(message, 401);
    }
  }
  
  class ForbiddenError extends AppError {
    constructor(message = 'Prohibido') {
      super(message, 403);
    }
  }
  
  class NotFoundError extends AppError {
    constructor(message = 'Recurso no encontrado') {
      super(message, 404);
    }
  }
  
  // Manejador global
  const errorHandler = (err, req, res, next) => {
    // Loggeo detallado (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.error('🛑 Error:', {
        path: req.path,
        method: req.method,
        message: err.message,
        stack: err.stack,
      });
    }
  
    // Errores de validación (Joi/Mongoose)
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      err = new BadRequestError(messages.join('. '));
    }
  
    // Errores de JWT
    if (err.name === 'JsonWebTokenError') {
      err = new UnauthorizedError('Token inválido');
    }
    if (err.name === 'TokenExpiredError') {
      err = new UnauthorizedError('Token expirado');
    }
  
    // Respuesta al cliente
    const response = {
      status: err.status || 'error',
      message: err.isOperational ? err.message : 'Algo salió mal',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    };
  
    res.status(err.statusCode || 500).json(response);
  };
  
  export {
    AppError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    errorHandler,
  };