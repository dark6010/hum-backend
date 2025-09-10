import express from 'express';
import path from 'path'
import { authenticateJWT, authorizeRoles, refreshTokenMiddleware } from '../middleware/auth.js';
import { multerErrorHandler } from '../middleware/multerErrorHandler.js';
import {
  validateCreateNews,
  validateUpdateNews
} from '../validators/contentValidators.js';
import { rateLimitApi } from '../middleware/rateLimit.js';
import {
  getNews,
  createNews,
  updateNews,
  deleteNews,
  //getNewsById
} from '../controllers/newsController.js';
// import {
//   getTeachers,
//   createTeacher,
//   updateTeacher
// } from '../controllers/teacherController.js';

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
        fileSize: 5 * 1024 * 1024,
        files: 3
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no permitido. Solo se permiten JPG, PNG, GIF y PDF.'), false);
        }
    }
});

const router = express.Router();

// Aplicar rate limiting a todas las rutas API
router.use(rateLimitApi);

// ====================== Rutas Públicas ======================
router.get('/news', getNews);
// router.get('/news/:id', getNewsById);


// ====================== Rutas Protegidas ======================
router.use(authenticateJWT); // Todas las rutas debajo requieren autenticación hay req.user
// ====================== Refresh token ======================
router.use(refreshTokenMiddleware); // Todas las rutas debajo requieren autenticación
// ---- Noticias ----
router.post(
  '/news',
  authorizeRoles('admin', 'editor'), // Solo admins y editores
  upload.array('images'),
  multerErrorHandler,
  validateCreateNews,
  createNews
);
router.put(
  '/news/:id',
  authorizeRoles('admin', 'editor'), // Solo admins y editores
  upload.array('images'),
  multerErrorHandler,
  validateUpdateNews,
  updateNews
);


router.delete(
  '/news/:id',
  authorizeRoles('admin'), // Solo admins
  deleteNews
);

// ---- Docentes ----
// router.get('/teachers', getTeachers);

// router.post(
//   '/teachers',
//   authorizeRoles('admin'),
//   upload.single('profileImage'), // Middleware para subir imágenes
//   createTeacher
// );

// router.patch(
//   '/teachers/:id',
//   authorizeRoles('admin'),
//   upload.single('profileImage'),
//   updateTeacher
// );

// ====================== Rutas de Administración ======================
router.use(authorizeRoles('admin')); // Todas las rutas debajo requieren rol admin

// router.get('/admin/stats', getAdminStats);
// router.post('/admin/invite', inviteNewUser);

export default router;