import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  logout,
  // refreshToken,
  // forgotPassword,
  resetPassword
} from '../controllers/authController.js';
import { rateLimitAuth } from '../middleware/rateLimit.js';

const router = express.Router();

// Limitar intentos de autenticación
router.use(rateLimitAuth);

// Registro de usuario
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Nombre es requerido'),
    body('email')
      .isEmail()
      .withMessage('Email inválido'),
    body('password')
      .isLength({ min: 12 })
      .withMessage('La contraseña debe tener al menos 12 caracteres')
      .matches(/[0-9]/)
      .withMessage('Debe contener al menos un número')
      .matches(/[A-Z]/)
      .withMessage('Debe contener al menos una mayúscula'),
    body('role')
      .isIn(['admin', 'editor', 'viewer'])
      .withMessage('solo son permitidos los valores:[admin, editor, viewer]')
  ],
  register
);

// Inicio de sesión
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Contraseña es requerida'),
  ],
  login
);

// Cerrar sesión
router.post('/logout', logout);

// Refresh Token (para renovar JWT)
// //router.post('/refresh-token', refreshToken);

// Recuperación de contraseña
// router.post(
//   '/forgot-password',
//   [body('email').isEmail().withMessage('Email inválido')],
//   validateInputAuth,
//   forgotPassword
// );

// Resetear contraseña
router.patch(
  '/reset-password/:token',
  [
    body('password')
      .isLength({ min: 12 })
      .withMessage('La contraseña debe tener al menos 12 caracteres'),
    body('passwordConfirm')
      .notEmpty()
      .withMessage('Debes confirmar la contraseña'),
  ],
  resetPassword
);

export default router;