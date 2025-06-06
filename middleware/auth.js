import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/errorHandler.js';

export const authenticateJWT = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  
  if (!token) throw new UnauthorizedError('Acceso no autorizado');

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) throw new UnauthorizedError('Token inválido');
    req.user = user;
    next();
  });
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError('No tienes permisos para esta acción');
    }
    next();
  };
};