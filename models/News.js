import mongoose from 'mongoose';

// Define el esquema de la noticia
const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true,
    maxlength: [100, 'Máximo 100 caracteres'],
  },
  content: {
    type: String,
    required: [true, 'El contenido es requerido'],
    trim: true,
    minlength: [50, 'Mínimo 50 caracteres'],
  },
  date: {
    type: Date,
    required: [true, 'La fecha es requerida'],
  },
  category: {
    type: String,
    required: [true, 'La categoría es requerida'],
    trim: true,
  },
  slug: {
    type: String,
    required: [true, 'El slug es requerido'],
    trim: true,
    unique: true,
  },
  excerpt: {
    type: String,
    required: [true, 'El resumen es requerido'],
    trim: true,
  },
  // --- Campo de Imagen Añadido ---
  image: {
    type: String, // Almacenará la ruta/URL de la imagen
    required: [true, 'La ruta de la imagen es requerida'], // La imagen es obligatoria
    trim: true,
  },
  // -----------------------------
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

newsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});


export default mongoose.model('News', newsSchema);