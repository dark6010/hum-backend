import Teacher from '../models/Teacher.js';
import { NotFoundError, BadRequestError } from '../utils/errorHandler.js';
import { uploadToCloudinary } from '../utils/cloudinaryService.js';
import { sanitizeTeacherInput } from '../validators/teacherValidators.js';

// Helper para construir la respuesta del docente
const buildTeacherResponse = (teacher) => ({
  id: teacher._id,
  name: teacher.name,
  email: teacher.email,
  academicDegree: teacher.academicDegree,
  specialty: teacher.specialty,
  profileImage: teacher.profileImage?.url || null,
  publications: teacher.publications,
  createdAt: teacher.createdAt
});

// Obtener todos los docentes
export const getTeachers = async (req, res, next) => {
  try {
    const { specialty, sort = '-createdAt' } = req.query;
    
    const filter = {};
    if (specialty) filter.specialty = specialty;

    const teachers = await Teacher.find(filter)
      .sort(sort)
      .select('-__v -updatedAt');

    res.json({
      success: true,
      count: teachers.length,
      data: teachers.map(buildTeacherResponse)
    });
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo docente
export const createTeacher = async (req, res, next) => {
  try {
    const { name, email, academicDegree, specialty, publications } = req.body;
    
    // Validar si el docente ya existe
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      throw new BadRequestError('El docente ya está registrado');
    }

    // Subir imagen a Cloudinary si existe
    let imageData = null;
    if (req.file) {
      imageData = await uploadToCloudinary(req.file.buffer, {
        folder: 'teachers',
        transformation: { width: 500, height: 500, crop: 'fill' }
      });
    }

    // Crear el docente
    const teacher = await Teacher.create({
      name: sanitizeTeacherInput(name),
      email: sanitizeTeacherInput(email),
      academicDegree: sanitizeTeacherInput(academicDegree),
      specialty: sanitizeTeacherInput(specialty),
      publications: publications?.map(pub => sanitizeTeacherInput(pub)),
      profileImage: imageData || undefined
    });

    res.status(201).json({
      success: true,
      data: buildTeacherResponse(teacher)
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar docente
export const updateTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Verificar si el docente existe
    const teacher = await Teacher.findById(id);
    if (!teacher) {
      throw new NotFoundError('Docente no encontrado');
    }

    // Manejo de imagen
    if (req.file) {
      const imageData = await uploadToCloudinary(req.file.buffer, {
        folder: 'teachers'
      });
      updates.profileImage = imageData;
    }

    // Actualizar campos permitidos
    const allowedUpdates = ['name', 'academicDegree', 'specialty', 'publications', 'profileImage'];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        teacher[field] = sanitizeTeacherInput(updates[field]);
      }
    });

    await teacher.save();

    res.json({
      success: true,
      data: buildTeacherResponse(teacher)
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar docente (Solo admin)
export const deleteTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const teacher = await Teacher.findByIdAndDelete(id);
    if (!teacher) {
      throw new NotFoundError('Docente no encontrado');
    }

    // Opcional: Eliminar imagen de Cloudinary
    if (teacher.profileImage?.publicId) {
      await deleteFromCloudinary(teacher.profileImage.publicId);
    }

    res.json({
      success: true,
      data: { message: 'Docente eliminado correctamente' }
    });
  } catch (error) {
    next(error);
  }
};