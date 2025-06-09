import { body, param } from 'express-validator';
const capitalize = cadena =>cadena.charAt(0).toUpperCase() + cadena.slice(1).toLowerCase()
export const validateCreateNews = [
  body('title')
    .trim()
    .notEmpty().withMessage('El título es requerido')
    .custom(capitalize)
    .isLength({ max: 100 }).withMessage('Máximo 100 caracteres'),
  
  body('content')
    .trim()
    .notEmpty().withMessage('El contenido es requerido')
    .custom(capitalize)
    .isLength({ min: 50 }).withMessage('Mínimo 50 caracteres'),
  
  body('date')
    .notEmpty().withMessage('La fecha es requerida')
    .isISO8601().toDate().withMessage('La fecha debe ser una fecha válida en formato ISO 8601 (AAAA-MM-DD).'),
  body('category')
    .trim()
    .notEmpty().withMessage('La categoria es requerida'),
  body('slug')
    .trim()
    .notEmpty().withMessage('El slug es requerido'),
  body('excerpt')
    .trim()
    .notEmpty().withMessage('El resumen es requerido'),
];

export const validateUpdateNews = [
  param('id')
    .isMongoId().withMessage('ID inválido'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Máximo 100 caracteres')
];