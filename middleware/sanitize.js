import { body, validationResult } from 'express-validator';

export const sanitizeInput = (data) => {
  return {
    title: escape(data.title).trim(),
    content: escape(data.content).trim(),
    image: validator.isURL(data.image) ? data.image : null
  };
};

export const validateInput = (method) => {
  switch (method) {
    case 'createNews':
      return [
        body('title').notEmpty().isLength({ max: 100 }),
        body('content').notEmpty().isLength({ max: 5000 }),
        body('image').optional().isURL()
      ];
    // ... otras validaciones
  }
};