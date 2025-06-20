import { body, param, validationResult } from 'express-validator';
const capitalize = cadena =>cadena.charAt(0).toUpperCase() + cadena.slice(1).toLowerCase()
export const validateCreateNews = [
  body('title')
    .trim()
    .notEmpty().withMessage('El título es requerido')
    .customSanitizer(capitalize)
    .isLength({ max: 100 }).withMessage('Máximo 100 caracteres'),
  
  body('content')
    .trim()
    .notEmpty().withMessage('El contenido es requerido')
    .customSanitizer(capitalize)
    .isLength({ min: 50 }).withMessage('El contenido minimo es 50 caracteres'),
  
  // body('date')
  //   .notEmpty().withMessage('La fecha es requerida')
  //   .isISO8601().toDate().withMessage('La fecha debe ser una fecha válida en formato ISO 8601 (AAAA-MM-DD).'),
  body('category')
    .trim()
    .notEmpty().withMessage('La categoria es requerida'),
  body('excerpt')
    .trim()
    .notEmpty().withMessage('El resumen es requerido')
    .customSanitizer(capitalize),
  // --- Middleware para manejar los errores de validación ---
  (req, res, next) => {
    const errors = validationResult(req);
    if (Array.isArray(req.files) && req.files.length > 0 && req.files.length < 4){
      if (!errors.isEmpty()) {
        // Si hay errores, responde con un 400 y los detalles de los errores.
        return res.status(400).json({ errors: errors.array() });
      }
      next(); 
    }else{
      return res.status(400).json({ errors: [{
        type: 'field',
        msg: 'se requiere de una a 3 imagenes',
        path: 'images',
        location: 'body'
      }] });
    }
    
  }
];

export const validateUpdateNews = [
  param('id')
    .isMongoId().withMessage('ID inválido'),
  
  body('title')
    .optional()
    .trim()
    .customSanitizer(capitalize)
    .isLength({ max: 100 }).withMessage('Máximo 100 caracteres'),
  
  body('content')
    .optional()
    .trim()
    .customSanitizer(capitalize)
    .isLength({ min: 50 }).withMessage('El contenido minimo es 50 caracteres'),
    
    // body('date')
    //   .notEmpty().withMessage('La fecha es requerida')
    //   .isISO8601().toDate().withMessage('La fecha debe ser una fecha válida en formato ISO 8601 (AAAA-MM-DD).'),
  body('category')
    .optional()
    .trim(),
  body('excerpt')
    .optional()
    .trim()
    .customSanitizer(capitalize),
  // --- Middleware para manejar los errores de validación ---
  (req, res, next) => {
    const errors = validationResult(req);
    if (Array.isArray(req.files) && req.files.length < 4){
      if (!errors.isEmpty()) {
        // Si hay errores, responde con un 400 y los detalles de los errores.
        return res.status(400).json({ errors: errors.array() });
      }
      next(); 
    }else{
      return res.status(400).json({ errors: [{
        type: 'field',
        msg: 'se requiere de 0 a 3 imagenes',
        path: 'images',
        location: 'body'
      }] });
    }
    
  }
];