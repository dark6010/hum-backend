import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import crypto from 'crypto';
import {
  BadRequestError,
  UnauthorizedError
} from '../utils/errorHandler.js';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
  // domain: process.env.NODE_ENV === 'development' ? 'localhost' : '.midominio.com'
};
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
    const { name, email, password,role } = req.body;

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
      role // O el rol por defecto que necesites
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
    // 3. Verificar si el usuario existe
    if (!user) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    // 4. Comparar la contraseña ingresada con la contraseña hasheada almacenada
    // Asume que tu modelo User tiene un método `matchPassword` (como en el ejemplo anterior)
    const isMatch = await user.comparePassword(password);

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
      expires: new Date(Date.now() +  1000), // Expira en 1 segundos
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.cookie('refreshToken', 'none', {
      expires: new Date(Date.now() +  1000), // Expira en 1 segundos
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
// Refresh Token - Genera un nuevo access token usando el refresh token
export const refreshToken = async (req, res, next) => {
  try {
    // 1. Obtener el refresh token de las cookies
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token no proporcionado');
    }

    // 2. Verificar el refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // 3. Buscar al usuario en la base de datos
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new UnauthorizedError('Usuario no encontrado');
    }

    // 4. Generar nuevo access token
    const newAccessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // 5. Opcional: Puedes generar un nuevo refresh token también (rotación de tokens)
    const newRefreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // 6. Enviar los nuevos tokens como cookies seguras
    res.cookie('accessToken', newAccessToken, cookieOptions);
    res.cookie('refreshToken', newRefreshToken, cookieOptions);

    res.status(200).json({
      success: true,
      data: { 
        accessToken: newAccessToken,
        // refreshToken: newRefreshToken // Opcional: enviar en respuesta si no usas cookies
      }
    });

  } catch (error) {
    // Manejar errores específicos de JWT
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new UnauthorizedError('Refresh token inválido'));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new UnauthorizedError('Refresh token expirado'));
    }
    next(error);
  }
};
// Verificar estado de autenticación y devolver información del usuario
export const check = async (req, res, next) => {
  try {
    // El middleware de autenticación ya verificó el token y adjuntó el usuario a req.user
    if (!req.user) {
      // throw new UnauthorizedError('No autenticado');
      res.status(200).json({
        success: false,
      });
    }else{
      // Buscar el usuario actual en la base de datos para obtener información fresca
      const user = await User.findById(req.user.userId).select('-password');
  
      if (!user) {
        throw new UnauthorizedError('Usuario no encontrado');
      }
      res.status(200).json({
        success: true,
        data: { 
          user: { 
            id: user._id, 
            name: user.name, 
            email: user.email, 
            role: user.role 
          } 
        }
      });
    }


  } catch (error) {
    next(error);
  }
};
// import sendEmail from '../utils/sendEmail.js'; // Configura esto según tu servicio de email

// export const forgotPassword = async (req, res, next) => {
//   try {
//     const { email } = req.body;

//     // Validar email
//     if (!email) {
//       throw new BadRequestError('Por favor, proporciona un email.');
//     }

//     // Buscar usuario
//     const user = await User.findOne({ email });
//     if (!user) {
//       throw new NotFoundError('Usuario no encontrado.');
//     }

//     // Generar token de reseteo (guardado en la DB)
//     const resetToken = user.createPasswordResetToken();
//     await user.save({ validateBeforeSave: false }); // Guardar sin validar campos obligatorios

//     // Enviar email con el token
//     const resetURL = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;
//     const message = `¿Olvidaste tu contraseña? Haz clic en este enlace para restablecerla: \n\n${resetURL}\n\n(Si no solicitaste esto, ignora este email.)`;

//     try {
//       await sendEmail({
//         email: user.email,
//         subject: 'Restablecimiento de contraseña (válido por 10 min)',
//         message,
//       });

//       res.status(200).json({
//         success: true,
//         message: 'Token enviado al email.',
//       });
//     } catch (error) {
//       // Si falla el email, limpiar el token en la DB
//       user.passwordResetToken = undefined;
//       user.passwordResetExpires = undefined;
//       await user.save({ validateBeforeSave: false });

//       throw new Error('Error al enviar el email. Intenta nuevamente.');
//     }
//   } catch (error) {
//     next(error);
//   }
// };

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      throw new BadRequestError('Por favor, proporciona una nueva contraseña.');
    }

    // 1. Hash el token recibido (para compararlo con el guardado en la DB)
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // 2. Buscar usuario con el token y que no haya expirado
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new BadRequestError('Token inválido o expirado.');
    }

    // 3. Actualizar contraseña y limpiar el token
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 4. Opcional: Iniciar sesión automáticamente o enviar confirmación
    const { accessToken, refreshToken } = generateAuthTokens(user);

    res.cookie('accessToken', accessToken, cookieOptions);
    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada.',
      data: { user: { id: user._id, name: user.name, email: user.email } },
    });
  } catch (error) {
    next(error);
  }
};