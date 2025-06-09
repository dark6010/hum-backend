import { body, validationResult } from 'express-validator';
import multer from 'multer';
import fs from 'fs';
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no permitido. Solo se permiten JPG, PNG, GIF y PDF.'), false);
        }
    }
});
const capitalize = cadena =>cadena.charAt(0).toUpperCase() + cadena.slice(1).toLowerCase()
export const sanitizeInputNews = (data) => {
  return {
    title: capitalize(data.body.title).trim(),
    content: capitalize(data.body.content).trim(),
    date,
    category,
    slug,
    excerpt,
    image: validator.isURL(data.body.image) ? data.image : null
  };
};
export const validateInputNews = (method) => {
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

export const sanitizeInputAuth = (data) => {
  return {
    title: escape(data.title).trim(),
    content: escape(data.content).trim(),
    image: validator.isURL(data.image) ? data.image : null
  };
};

export const validateInputAuth = (method) => {
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