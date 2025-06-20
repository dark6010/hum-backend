import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/errorHandler.js';
import User from '../models/User.js';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
};


export const authenticateJWT = (req, res, next) => {
  const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
  if (!token) throw new UnauthorizedError('Acceso no autorizado');


  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) throw new UnauthorizedError('Token inválido');
    // if (err) res.resdirect('/');
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
export const refreshTokenMiddleware = async (req, res, next) => {
  try {
    // 1. Obtener el refresh token de las cookies
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token no proporcionado');
    }

    // 2. Verificar el refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // 3. Buscar al usuario en la base de datos
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new UnauthorizedError('Usuario no encontrado');
    }

    // 4. Generar nuevo access token
    const newAccessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // 5. Opcional: Puedes generar un nuevo refresh token también (rotación de tokens)
    const newRefreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // 6. Enviar los nuevos tokens como cookies seguras
    res.cookie('accessToken', newAccessToken, cookieOptions);
    res.cookie('refreshToken', newRefreshToken, cookieOptions);

    next()

  } catch (error) {
    // Manejar errores específicos de JWT
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new UnauthorizedError('Refresh token inválido'));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new UnauthorizedError('Refresh token expirado'));
    }
    next(error);
  }
};