import express from 'express';
import {
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  uploadTeacherImage
} from '../controllers/teacherController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
import { validateTeacherInput } from '../validators/teacherValidators.js';

const router = express.Router();

router.get('/', getTeachers);

router.post(
  '/',
  authenticateJWT,
  authorizeRoles('admin'),
  uploadTeacherImage,
  validateTeacherInput,
  createTeacher
);

router.patch(
  '/:id',
  authenticateJWT,
  authorizeRoles('admin'),
  uploadTeacherImage,
  validateTeacherInput,
  updateTeacher
);

router.delete(
  '/:id',
  authenticateJWT,
  authorizeRoles('admin'),
  deleteTeacher
);

export default router;