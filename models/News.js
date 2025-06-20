import mongoose from 'mongoose';

// Define el esquema de la noticia

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'bd: El título es requerido'],
    trim: true,
    maxlength: [100, 'bd: Máximo 100 caracteres'],
  },
  content: {
    type: String,
    required: [true, 'bd: El contenido es requerido'],
    trim: true,
    minlength: [50, 'bd: Mínimo 50 caracteres'],
  },
  category: {
    type: String,
    required: [true, 'bd: La categoría es requerida'],
    trim: true,
  },

  excerpt: {
    type: String,
    required: [true, 'bd: El resumen es requerido'],
    trim: true,
  },
  // --- Campo de Imagen Añadido ---
  images: {
    type: [String],// Almacenará la ruta/URL de la imagen
    required: [true, 'bd: La ruta de la imagen es requerida'], // La imagen es obligatoria
    trim: true,
    validate: {
      validator: function(v) {
        // Valida que 'v' sea un array, que no esté vacío (si required es true)
        // y que su longitud sea como máximo 3.
        // Si 'required' es true y el array puede estar vacío, esto fallaría.
        // Si el array está vacío pero 'required' es true, Mongoose lo acepta por defecto.
        // Para forzar al menos un elemento si 'required' es true: v.length > 0
        return Array.isArray(v) && v.length <= 3 && v.length >= 1;
      },
      message: 'bd: Se permiten un máximo de 3 imágenes (rutas) y al menos una'
    }
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