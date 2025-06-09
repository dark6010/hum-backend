import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import {
  BadRequestError,
  UnauthorizedError
} from '../utils/errorHandler.js';

// Helper para generar tokens
const generateAuthTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Registro
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Verificar si el usuario existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError('El email ya está registrado');
    }

    // Crear usuario
    const user = await User.create({
      name,
      email,
      password,
      role: 'editor' // O el rol por defecto que necesites
    });

    // Generar tokens
    const { accessToken, refreshToken } = generateAuthTokens(user);

    // Enviar tokens como cookies seguras
    res.cookie('accessToken', accessToken, cookieOptions);
    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.status(201).json({
      success: true,
      data: { user: { id: user._id, name: user.name, email: user.email, role: user.role } }
    });
  } catch (error) {
    next(error);
  }
};

// Opciones para cookies
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
};

// --- Método Login ---
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Verificar si se proporcionaron email y contraseña
    if (!email || !password) {
      throw new BadRequestError('Por favor, ingresa email y contraseña');
    }

    // 2. Buscar usuario por email y seleccionar la contraseña (si está marcada como select: false en el modelo)
    const user = await User.findOne({ email }).select('+password');
    console.log(45452, user)
    // 3. Verificar si el usuario existe
    if (!user) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    // 4. Comparar la contraseña ingresada con la contraseña hasheada almacenada
    // Asume que tu modelo User tiene un método `matchPassword` (como en el ejemplo anterior)
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    // 5. Si las credenciales son válidas, generar nuevos tokens
    const { accessToken, refreshToken } = generateAuthTokens(user);

    // 6. Enviar tokens como cookies seguras
    res.cookie('accessToken', accessToken, cookieOptions);
    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.status(200).json({
      success: true,
      data: { user: { id: user._id, name: user.name, email: user.email, role: user.role } }
    });

  } catch (error) {
    next(error);
  }
};
export const logout = async (req, res, next) => {
  try {
    // Para "desloguear" al usuario, simplemente invalidamos las cookies que contienen los tokens.
    // Esto se logra configurando la fecha de expiración de las cookies en el pasado.
    res.cookie('accessToken', 'none', {
      expires: new Date(Date.now() + 10 * 1000), // Expira en 10 segundos
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.cookie('refreshToken', 'none', {
      expires: new Date(Date.now() + 10 * 1000), // Expira en 10 segundos
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    // Opcional: También podrías enviar un mensaje de éxito.
    res.status(200).json({ success: true, data: {} });

  } catch (error) {
    next(error);
  }
};