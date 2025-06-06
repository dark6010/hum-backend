import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

export const securityMiddleware = (app) => {
  // Headers de seguridad
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https://*.example.com"]
      }
    },
    crossOriginResourcePolicy: { policy: "same-site" }
  }));

  // CORS configurado
  app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }));

  // Límite de peticiones
  app.use('/api/', rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // 100 peticiones por IP
  }));
};