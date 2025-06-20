import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto'; // Node.js >= 16.0.0

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
userSchema.methods.createPasswordResetToken = function () {
  // 1. Generar token aleatorio (no hasheado aún)
  const resetToken = crypto.randomBytes(32).toString('hex');

  // 2. Hash el token y guardarlo en la DB
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // 3. Establecer expiración (ej. 10 minutos)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // 4. Devolver el token sin hashear (para el email)
  return resetToken;
};

export default mongoose.model('User', userSchema);