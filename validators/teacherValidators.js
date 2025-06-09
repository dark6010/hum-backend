import { body, param } from 'express-validator';

export const validateTeacherInput = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ max: 100 }).withMessage('Máximo 100 caracteres'),
  
  body('email')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
    
  body('academicDegree')
    .isIn(['Lic.', 'MSc.', 'PhD.', 'Ing.', 'Mg.'])
    .withMessage('Grado académico inválido'),
    
  body('specialty')
    .isIn([
      'Pedagogía',
      'Tecnología Educativa',
      'Psicopedagogía',
      'Educación Infantil',
      'Gestión Educativa'
    ])
    .withMessage('Especialidad inválida'),
    
  body('publications')
    .optional()
    .custom((value) => {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed);
      } catch {
        return false;
      }
    })
    .withMessage('Las publicaciones deben ser un arreglo JSON válido')
];

export const validateTeacherId = [
  param('id')
    .isMongoId().withMessage('ID de docente inválido')
];