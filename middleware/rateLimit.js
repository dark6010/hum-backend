import rateLimit from 'express-rate-limit';

export const rateLimitAuth = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 intentos por IP
  message: {
    success: false,
    error: 'Demasiados intentos. Intenta nuevamente en 15 minutos'
  },
  skipSuccessfulRequests: true // Solo contar intentos fallidos
});
export const rateLimitApi = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 peticiones por ventana
    message: {
      success: false,
      error: 'Demasiadas peticiones. Intenta nuevamente en 15 minutos'
    },
    skip: (req) => {
      // Excluir ciertas rutas del rate limiting
      return req.originalUrl.includes('/api/public');
    }
  });