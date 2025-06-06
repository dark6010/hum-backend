import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: props => `${props.value} no es un email válido`
    }
  },
  password: { 
    type: String, 
    required: true,
    minlength: 12,
    select: false // No se devuelve en consultas
  },
  role: { 
    type: String, 
    enum: ['admin', 'editor', 'viewer'], 
    default: 'viewer' 
  },
  lastLogin: { type: Date }
}, { timestamps: true });

// Hash de contraseña antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);