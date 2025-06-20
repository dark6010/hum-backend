import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv'; // Import dotenv
dotenv.config();

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { securityMiddleware } from './config/security.js';
import { errorHandler } from './utils/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import apiRoutes from './routes/api.routes.js';

const app = express();
// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: process.env.NODE_ENV !== 'production'
});

// Middlewares básicos
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Seguridad
securityMiddleware(app);

// Rutas
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/images', express.static(path.join(__dirname, 'uploads')));
// Manejo de errores
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});